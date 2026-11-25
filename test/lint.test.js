import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { contrastRatio, sameColor, toRgb } from '../src/color.js';
import { lint } from '../src/lint.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CLI = join(ROOT, 'src/cli.js');

const VALID = `---
name: Test Brand
---

## Overview

A brand used in tests.
`;

/** The rules reported for a document, as a sorted, de-duplicated list. */
const rulesOf = (report) => [...new Set(report.findings.map((f) => f.rule))].sort();
const find = (report, rule) => report.findings.filter((f) => f.rule === rule);

/** Write files into a fresh temp directory and return its path. */
function project(files) {
  const dir = mkdtempSync(join(tmpdir(), 'brandmd-'));
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, name)), { recursive: true });
    writeFileSync(join(dir, name), content);
  }
  return dir;
}

const withYaml = (yaml, sections = '') => `---\nname: Test Brand\n---\n\n## Overview\n\nText.\n${sections}\n\`\`\`yaml\n${yaml}\n\`\`\`\n`;

test('a minimal valid file has no findings', () => {
  const report = lint(VALID);
  assert.deepEqual(report.findings, []);
  assert.deepEqual(report.summary, { errors: 0, warnings: 0, infos: 0 });
});

test('missing-name: name is required', () => {
  const report = lint('## Overview\n\nText.\n');
  assert.deepEqual(rulesOf(report), ['missing-name']);
  assert.equal(report.summary.errors, 1);
});

test('missing-overview: Overview is expected, and its alias "Brand" counts', () => {
  assert.deepEqual(rulesOf(lint('---\nname: X\n---\n\n## Colors\n\nText.\n')), ['missing-overview']);
  assert.deepEqual(rulesOf(lint('---\nname: X\n---\n\n## Brand\n\nText.\n')), []);
});

test('section-order: known sections must follow the spec order', () => {
  const report = lint(`${VALID}\n## Colors\n\nText.\n\n## Messaging\n\nText.\n`);
  assert.deepEqual(rulesOf(report), ['section-order']);
  assert.match(find(report, 'section-order')[0].message, /Messaging/);
});

test('section-order: unknown sections are preserved wherever they sit', () => {
  const report = lint(`${VALID}\n## Sonic Identity\n\nText.\n\n## Colors\n\nText.\n`);
  assert.deepEqual(report.findings, []);
});

test('duplicate-section: a section and its alias cannot both appear', () => {
  const report = lint(`${VALID}\n## Voice\n\nText.\n\n## Voice & Tone\n\nText.\n`);
  assert.deepEqual(rulesOf(report), ['duplicate-section']);
});

test('headings inside fenced code blocks are not sections', () => {
  const report = lint(`${VALID}\n\`\`\`markdown\n## Overview\n\`\`\`\n`);
  assert.deepEqual(report.findings, []);
});

test('duplicate-key: a top-level key may be defined once across all blocks', () => {
  const report = lint(`${VALID}\n\`\`\`yaml\ncolors:\n  ink: "#111111"\n\`\`\`\n\n\`\`\`yaml\ncolors:\n  paper: "#ffffff"\n\`\`\`\n`);
  assert.deepEqual(rulesOf(report), ['duplicate-key']);
});

test('invalid-yaml: unparseable YAML is an error, not a crash', () => {
  const report = lint(`${VALID}\n\`\`\`yaml\ncolors: [unclosed\n\`\`\`\n`);
  assert.deepEqual(rulesOf(report), ['invalid-yaml']);
});

test('broken-ref: token references in YAML and prose must resolve', () => {
  const doc = withYaml('colors:\n  ink: "#111111"\nrequired: ["{colors.ink}", "{colors.missing}"]', '\nInk is {colors.ink}; ghost is {colors.ghost}.\n');
  const messages = find(lint(doc), 'broken-ref').map((f) => f.message);
  assert.equal(messages.length, 2);
  assert.ok(messages.some((m) => m.includes('{colors.missing}')));
  assert.ok(messages.some((m) => m.includes('{colors.ghost}')));
});

test('broken-ref: references inside code spans are literal', () => {
  const report = lint(`${VALID}\nWrite \`{colors.anything}\` to reference a colour.\n`);
  assert.deepEqual(report.findings, []);
});

test('broken-ref: a missing logo file is an error; a present one is not', () => {
  const doc = withYaml('logo:\n  wordmark:\n    file: assets/wordmark.svg');
  const missing = project({ 'BRAND.md': doc });
  const present = project({ 'BRAND.md': doc, 'assets/wordmark.svg': '<svg/>' });
  assert.deepEqual(rulesOf(lint(doc, { file: join(missing, 'BRAND.md') })), ['broken-ref']);
  assert.deepEqual(rulesOf(lint(doc, { file: join(present, 'BRAND.md') })), []);
});

test('broken-ref: a logo file outside the directory is an error', () => {
  const doc = withYaml('logo:\n  wordmark:\n    file: ../elsewhere.svg');
  const dir = project({ 'brand/BRAND.md': doc, 'elsewhere.svg': '<svg/>' });
  const report = lint(doc, { file: join(dir, 'brand/BRAND.md') });
  assert.match(find(report, 'broken-ref')[0].message, /outside/);
});

test('broken-ref: @ references — out of bounds is an error, missing is a warning', () => {
  const doc = `${VALID}\nSee \`@guides/photo.md#portraits\`, \`@guides/absent.md\`, \`@../secret.md\`. Not refs: \`@media\`, @guides/loose.md.\n`;
  const dir = project({ 'BRAND.md': doc, 'guides/photo.md': '# Photo' });
  const found = find(lint(doc, { file: join(dir, 'BRAND.md') }), 'broken-ref');
  assert.deepEqual(found.map((f) => [f.path, f.severity]).sort(), [['@../secret.md', 'error'], ['@guides/absent.md', 'warning']]);
});

test('contrast-ratio: a logo must reach 3:1 on each permitted background', () => {
  const doc = withYaml('colors:\n  ink: "#111111"\n  paper: "#FFFFFF"\n  fog: "#EEEEEE"\nlogo:\n  wordmark:\n    color: "{colors.paper}"\n    backgrounds: ["{colors.ink}", "{colors.fog}"]');
  const found = find(lint(doc), 'contrast-ratio');
  assert.equal(found.length, 1);
  assert.equal(found[0].path, 'logo.wordmark.backgrounds[1]');
});

test('contrast-ratio: colours the linter cannot convert are skipped, not misreported', () => {
  const doc = withYaml('colors:\n  ink: "oklch(20% 0.02 250)"\n  paper: "#FFFFFF"\nlogo:\n  wordmark:\n    color: "{colors.paper}"\n    backgrounds: ["{colors.ink}"]');
  assert.deepEqual(lint(doc).findings, []);
});

test('unknown-property: the YAML 1.1 trap `on` is caught', () => {
  const doc = withYaml('logo:\n  wordmark:\n    on: ["#000000"]');
  assert.equal(find(lint(doc), 'unknown-property')[0].path, 'logo.wordmark.on');
});

test('unverified-license: only an explicit true counts as verified', () => {
  const doc = withYaml('typography:\n  display:\n    fontFamily: Fraunces\n    licenseVerified: true\n  text:\n    fontFamily: Karla\n    license: OFL');
  const found = find(lint(doc), 'unverified-license');
  assert.deepEqual(found.map((f) => [f.path, f.severity]), [['typography.text', 'info']]);
});

test('adjective-only: a trait needs both `not` and `means`', () => {
  const doc = withYaml('personality:\n  - { is: calm, not: casual, means: We lower the temperature. }\n  - { is: friendly }');
  const found = find(lint(doc), 'adjective-only');
  assert.equal(found.length, 1);
  assert.equal(found[0].path, 'personality[1]');
});

test('unsupported-claim: approved needs evidence; review and prohibited do not', () => {
  const doc = withYaml('claims:\n  - { claim: Fast, status: approved }\n  - { claim: Local, status: approved, evidence: Invoices 2026 }\n  - { claim: Best, status: prohibited }\n  - { claim: Maybe, status: review }');
  const found = find(lint(doc), 'unsupported-claim');
  assert.equal(found.length, 1);
  assert.match(found[0].message, /Fast/);
});

test('self-violation: avoided words in messaging, whole words only, cta.never exempt', () => {
  const doc = withYaml('vocabulary:\n  avoid:\n    seamless: say what the steps are\n    range: batch\nmessaging:\n  tagline: A Seamless day.\n  oneLiner: We arrange bread.\n  cta:\n    primary: Come in\n    never: ["Seamless checkout"]');
  const found = find(lint(doc), 'self-violation');
  assert.deepEqual(found.map((f) => f.path), ['messaging.tagline']);
});

test('self-violation: prose is not checked', () => {
  const doc = `${withYaml('vocabulary:\n  avoid:\n    seamless: say what the steps are')}\nNever write "seamless".\n`;
  assert.deepEqual(lint(doc).findings, []);
});

const BRAND_FOR_DRIFT = withYaml('colors:\n  ink: "#0B1F2A"\n  lure: "#F2B33D"\ntypography:\n  display:\n    fontFamily: Space Grotesk\n    licenseVerified: true\nrequired: ["{colors.ink}", "{colors.lure}", "{typography.display}"]');
const design = (brand, colors, family) => `---\nname: Product\n${brand}colors:\n${colors}typography:\n  headline:\n    fontFamily: ${family}\n---\n\n## Overview\n\nText.\n`;

test('design-drift: a linked DESIGN.md with the required values, in any colour format, is clean', () => {
  const dir = project({
    'BRAND.md': BRAND_FOR_DRIFT,
    'product/DESIGN.md': design('brand: ../BRAND.md\n', '  surface: "rgb(11, 31, 42)"\n  primary: "#f2b33d"\n', 'space grotesk'),
  });
  assert.deepEqual(lint(BRAND_FOR_DRIFT, { file: join(dir, 'BRAND.md') }).findings, []);
});

test('design-drift: a missing required colour and an unlisted font are reported', () => {
  const dir = project({
    'BRAND.md': BRAND_FOR_DRIFT,
    'product/DESIGN.md': design('brand: ../BRAND.md\n', '  surface: "#0B1F2A"\n', 'Comic Sans MS'),
  });
  const found = find(lint(BRAND_FOR_DRIFT, { file: join(dir, 'BRAND.md') }), 'design-drift');
  assert.equal(found.length, 2);
  assert.ok(found.every((f) => f.path === 'product/DESIGN.md'));
  assert.ok(found.some((f) => f.message.includes('{colors.lure}')));
  assert.ok(found.some((f) => f.message.includes('Comic Sans MS')));
});

test('design-drift: a DESIGN.md that does not link to this brand is ignored', () => {
  const dir = project({
    'BRAND.md': BRAND_FOR_DRIFT,
    'unlinked/DESIGN.md': design('', '  surface: "#000000"\n', 'Comic Sans MS'),
    'other/BRAND.md': VALID,
    'other/DESIGN.md': design('brand: BRAND.md\n', '  surface: "#000000"\n', 'Comic Sans MS'),
    'node_modules/pkg/DESIGN.md': design('brand: ../../BRAND.md\n', '  surface: "#000000"\n', 'Comic Sans MS'),
  });
  assert.deepEqual(lint(BRAND_FOR_DRIFT, { file: join(dir, 'BRAND.md') }).findings, []);
});

test('colour helpers', () => {
  assert.deepEqual(toRgb('#fff'), [255, 255, 255]);
  assert.deepEqual(toRgb('#0B1F2AFF'), [11, 31, 42]);
  assert.deepEqual(toRgb('rgb(11 31 42 / 50%)'), [11, 31, 42]);
  assert.deepEqual(toRgb('hsl(0, 100%, 50%)'), [255, 0, 0]);
  assert.deepEqual(toRgb('white'), [255, 255, 255]);
  assert.equal(toRgb('oklch(62% 0.18 250)'), null);
  assert.equal(toRgb(42), null);
  assert.equal(contrastRatio([0, 0, 0], [255, 255, 255]), 21);
  assert.ok(sameColor('#FF0000', 'rgb(255, 0, 0)'));
  assert.ok(!sameColor('#FF0000', 'oklch(62% 0.18 250)'));
});

for (const example of ['panier-gris', 'lanternfish']) {
  test(`example ${example} lints clean`, () => {
    const file = join(ROOT, 'examples', example, 'BRAND.md');
    assert.deepEqual(lint(readFileSync(file, 'utf8'), { file }).findings, []);
  });
}

test('cli: JSON output and exit code 0 on a clean file', () => {
  const out = execFileSync('node', [CLI, 'lint', join(ROOT, 'examples/panier-gris/BRAND.md')], { encoding: 'utf8' });
  assert.deepEqual(JSON.parse(out).summary, { errors: 0, warnings: 0, infos: 0 });
});

test('cli: exit code 1 on errors, reading from stdin', () => {
  const run = spawnSync('node', [CLI, 'lint', '-', '--format', 'text'], { input: '## Overview\n\nText.\n', encoding: 'utf8' });
  assert.equal(run.status, 1);
  assert.match(run.stdout, /missing-name/);
});

test('cli: exit code 2 on bad usage and unreadable files', () => {
  assert.equal(spawnSync('node', [CLI, 'lint'], { encoding: 'utf8' }).status, 2);
  assert.equal(spawnSync('node', [CLI, 'lint', '/nonexistent/BRAND.md'], { encoding: 'utf8' }).status, 2);
  assert.equal(spawnSync('node', [CLI, 'frobnicate'], { encoding: 'utf8' }).status, 2);
});
