import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { contrastRatio, sameColor, toRgb } from '../src/color.js';
import { collect, lint } from '../src/lint.js';

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
  const doc = withYaml('logo:\n  wordmark:\n    colorways:\n      on-light:\n        file: assets/wordmark.svg');
  const missing = project({ 'BRAND.md': doc });
  const present = project({ 'BRAND.md': doc, 'assets/wordmark.svg': '<svg/>' });
  assert.deepEqual(rulesOf(lint(doc, { file: join(missing, 'BRAND.md') })), ['broken-ref']);
  assert.deepEqual(rulesOf(lint(doc, { file: join(present, 'BRAND.md') })), []);
});

test('broken-ref: a logo file outside the directory is an error', () => {
  const doc = withYaml('logo:\n  wordmark:\n    colorways:\n      on-light:\n        file: ../elsewhere.svg');
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
  const doc = withYaml('colors:\n  ink: "#111111"\n  paper: "#FFFFFF"\n  fog: "#EEEEEE"\nlogo:\n  wordmark:\n    colorways:\n      on-dark:\n        file: w.svg\n        color: "{colors.paper}"\n        backgrounds: ["{colors.ink}", "{colors.fog}"]');
  const found = find(lint(doc), 'contrast-ratio');
  assert.equal(found.length, 1);
  assert.equal(found[0].path, 'logo.wordmark.colorways.on-dark.backgrounds[1]');
});

test('contrast-ratio: colours the linter cannot convert are skipped, not misreported', () => {
  const doc = withYaml('colors:\n  ink: "oklch(20% 0.02 250)"\n  paper: "#FFFFFF"\nlogo:\n  wordmark:\n    colorways:\n      on-dark:\n        file: w.svg\n        color: "{colors.paper}"\n        backgrounds: ["{colors.ink}"]');
  assert.deepEqual(lint(doc).findings, []);
});

test('unknown-property: the YAML 1.1 trap `on` is caught', () => {
  const doc = withYaml('logo:\n  wordmark:\n    colorways:\n      on-light:\n        file: w.svg\n        on: ["#000000"]');
  assert.equal(find(lint(doc), 'unknown-property')[0].path, 'logo.wordmark.colorways.on-light.on');
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

test('print: a clean entry passes; an unknown colour, bad CMYK and unknown property are reported', () => {
  const clean = withYaml('colors:\n  crust: "#8A4B1F"\n  light:\n    paper: "#FFFFFF"\nprint:\n  crust:\n    cmyk: "0 46 78 46"\n    pantone: "000 C"\n    note: Uncoated.\n  light.paper:\n    cmyk: "0/0/0/0"');
  assert.deepEqual(lint(clean).findings, []);

  const broken = withYaml('colors:\n  crust: "#8A4B1F"\nprint:\n  crumb:\n    cmyk: "0 46 78 46"\n  crust:\n    cmyk: "0 46 178"\n    ral: 8003');
  const report = lint(broken);
  assert.deepEqual(find(report, 'broken-ref').map((f) => f.path), ['print.crumb']);
  assert.deepEqual(find(report, 'invalid-value').map((f) => f.path), ['print.crust.cmyk']);
  assert.deepEqual(find(report, 'unknown-property').map((f) => f.path), ['print.crust.ral']);
});

test('motion: durations must be milliseconds, and tokens can be referenced', () => {
  const clean = `${withYaml('motion:\n  settle:\n    duration: 240ms\n    delay: 0ms\n    timingFunction: ease-out')}\nThings settle in {motion.settle.duration}.\n`;
  assert.deepEqual(lint(clean).findings, []);

  const report = lint(withYaml('motion:\n  settle:\n    duration: 0.24s\n    delay: fast\n    easing: ease-out'));
  assert.deepEqual(find(report, 'invalid-value').map((f) => f.path), ['motion.settle.duration', 'motion.settle.delay']);
  assert.deepEqual(find(report, 'unknown-property').map((f) => f.path), ['motion.settle.easing']);
});

test('motion: the section sits between Imagery and Applications', () => {
  assert.deepEqual(lint(`${VALID}\n## Imagery\n\nText.\n\n## Motion\n\nText.\n\n## Applications\n\nText.\n`).findings, []);
  assert.deepEqual(rulesOf(lint(`${VALID}\n## Applications\n\nText.\n\n## Motion\n\nText.\n`)), ['section-order']);
});

test('missing-colorway: a variation needs a colourway, and a colourway needs a file', () => {
  const doc = withYaml('logo:\n  mark:\n    use: Avatars.\n    file: old-shape.svg\n  wordmark:\n    colorways:\n      on-light:\n        color: "#000000"');
  const report = lint(doc);
  assert.deepEqual(find(report, 'missing-colorway').map((f) => f.path), ['logo.mark', 'logo.wordmark.colorways.on-light']);
  assert.deepEqual(find(report, 'unknown-property').map((f) => f.path), ['logo.mark.file']);
});

test('logo: several variations, each with on-light and on-dark colourways, lint clean', () => {
  const doc = withYaml([
    'colors:', '  ink: "#111111"', '  paper: "#FFFFFF"',
    'logo:',
    '  full:', '    use: The default.', '    minSize: 96px', '    clearSpace: one x on every side', '    colorways:',
    '      on-light: { file: full-ink.svg, color: "{colors.ink}", backgrounds: ["{colors.paper}"] }',
    '      on-dark: { file: full-paper.svg, color: "{colors.paper}", backgrounds: ["{colors.ink}"] }',
    '  mark:', '    use: Avatars.', '    colorways:',
    '      on-light: { file: mark-ink.svg, color: "{colors.ink}", backgrounds: ["{colors.paper}"] }',
  ].join('\n'));
  const dir = project({ 'BRAND.md': doc, 'full-ink.svg': '<svg/>', 'full-paper.svg': '<svg/>', 'mark-ink.svg': '<svg/>' });
  assert.deepEqual(lint(doc, { file: join(dir, 'BRAND.md') }).findings, []);
});

test('logo animation: checked like the logo file', () => {
  const doc = withYaml('logo:\n  wordmark:\n    animation: assets/wordmark.mov\n    colorways:\n      on-light:\n        file: assets/wordmark.svg');
  const dir = project({ 'BRAND.md': doc, 'assets/wordmark.svg': '<svg/>' });
  assert.deepEqual(find(lint(doc, { file: join(dir, 'BRAND.md') }), 'broken-ref').map((f) => f.path), ['logo.wordmark.animation']);
});

test('visuals: local files, captions and verdicts are checked', () => {
  const doc = withYaml([
    'visuals:',
    '  - { file: assets/ok.svg, area: logo, verdict: do, caption: Correct clear space. }',
    '  - { file: assets/gone.svg, area: logo, verdict: dont, caption: Stretched. }',
    '  - { file: ../outside.svg, area: logo, verdict: dont, caption: Elsewhere. }',
    '  - { file: assets/ok.svg, area: mood, verdict: maybe }',
    '  - { area: logo, verdict: do, caption: No location. }',
    '  - { file: assets/ok.svg, url: "https://example.com/a.png", area: logo, verdict: do, caption: Two locations. }',
  ].join('\n'));
  const dir = project({ 'brand/BRAND.md': doc, 'brand/assets/ok.svg': '<svg/>', 'outside.svg': '<svg/>' });
  const report = lint(doc, { file: join(dir, 'brand/BRAND.md') });
  assert.deepEqual(find(report, 'broken-ref').map((f) => f.path), ['visuals[1].file', 'visuals[2].file']);
  assert.deepEqual(find(report, 'invalid-value').map((f) => f.path), ['visuals[3].verdict', 'visuals[4]', 'visuals[5]']);
  assert.deepEqual(find(report, 'missing-caption').map((f) => f.path), ['visuals[3]']);
});

test('visuals: https URLs are accepted, flagged as unverified and never fetched', () => {
  const doc = withYaml('visuals:\n  - { url: "https://assets.example.com/a.jpg", area: photography, verdict: do, caption: Window light. }\n  - { url: "http://assets.example.com/b.jpg", area: photography, verdict: do, caption: Insecure. }\n  - { url: "file:///etc/passwd", area: photography, verdict: do, caption: Not a web address. }');
  const report = lint(doc);
  assert.deepEqual(find(report, 'unverified-url').map((f) => [f.path, f.severity]), [['visuals[0].url', 'info']]);
  assert.deepEqual(find(report, 'invalid-value').map((f) => f.path), ['visuals[1].url', 'visuals[2].url']);
  assert.equal(report.summary.errors, 0);
});

test('markdown images in prose: a missing local file is a warning, remote ones are ignored', () => {
  const doc = `${VALID}\n![Good](assets/ok.svg)\n![Gone](assets/gone.svg "title")\n![Remote](https://example.com/x.png)\nIn code: \`![x](assets/nope.svg)\`\n`;
  const dir = project({ 'BRAND.md': doc, 'assets/ok.svg': '<svg/>' });
  const found = lint(doc, { file: join(dir, 'BRAND.md') }).findings;
  assert.deepEqual(found.map((f) => [f.rule, f.severity, f.path]), [['broken-ref', 'warning', 'image assets/gone.svg']]);
});

const SECTIONED = `---
name: Test Brand
rules:
  - { verdict: do, rule: Front matter rule. }
---

## Overview

\`\`\`yaml
rules:
  - { verdict: do, rule: "When in doubt, say less." }
\`\`\`

## Voice & Tone

\`\`\`yaml
rules:
  - { verdict: dont, rule: No exclamation marks., exception: none }
  - { verdict: do, rule: Name the logo colour in alt text., area: logo }
\`\`\`

## Logo

\`\`\`yaml
rules:
  - { verdict: dont, rule: Never stretch the wordmark., exception: none }
visuals:
  - { url: "https://example.com/stretched.png", verdict: dont, caption: Stretched. }
\`\`\`

## Imagery

\`\`\`yaml
rules:
  - { verdict: do, rule: One subject per image. }
\`\`\`

### Photography

\`\`\`yaml
rules:
  - { verdict: dont, rule: Nobody looks at the camera., exception: Staff portraits. }
visuals:
  - { url: "https://example.com/hands.jpg", verdict: do, caption: Hands mid-task. }
\`\`\`
`;

test('rules and visuals: written in their sections, tagged with the area they sit in', () => {
  const { rules, visuals } = collect(SECTIONED);
  assert.deepEqual(rules.map((r) => [r.area, r.rule]), [
    ['general', 'Front matter rule.'],
    ['general', 'When in doubt, say less.'],
    ['voice', 'No exclamation marks.'],
    ['logo', 'Name the logo colour in alt text.'],
    ['logo', 'Never stretch the wordmark.'],
    ['imagery', 'One subject per image.'],
    ['photography', 'Nobody looks at the camera.'],
  ]);
  assert.deepEqual(visuals.map((v) => v.area), ['logo', 'photography']);
  assert.deepEqual(collect(SECTIONED, { area: 'Logo' }).rules.map((r) => r.rule), ['Name the logo colour in alt text.', 'Never stretch the wordmark.']);
});

test('rules and visuals may repeat across blocks; other keys still may not', () => {
  const report = lint(SECTIONED);
  assert.deepEqual(rulesOf(report), ['unverified-url']);
  const twice = lint(`${VALID}\n\`\`\`yaml\nrules:\n  - { verdict: do, rule: A. }\nvoice:\n  person: we\n\`\`\`\n\n\`\`\`yaml\nrules:\n  - { verdict: do, rule: B. }\nvoice:\n  person: you\n\`\`\`\n`);
  assert.deepEqual(rulesOf(twice), ['duplicate-key']);
  assert.deepEqual(rulesOf(lint(withYaml('rules:\n  verdict: do'))), ['invalid-yaml']);
});

test('rules: verdict and text are required; a dont names its exception', () => {
  const doc = withYaml([
    'rules:',
    '  - { verdict: dont, rule: Never centre body text. }',
    '  - { verdict: dont, rule: No emoji., exception: none }',
    '  - { verdict: maybe, rule: Hmm. }',
    '  - { verdict: do }',
    '  - { verdict: do, rule: Use the logo file., visuals: [assets/gone.png], why: because }',
  ].join('\n'));
  const dir = project({ 'BRAND.md': doc });
  const report = lint(doc, { file: join(dir, 'BRAND.md') });
  assert.deepEqual(find(report, 'missing-exception').map((f) => [f.path, f.severity]), [['rules[0]', 'info']]);
  assert.deepEqual(find(report, 'invalid-value').map((f) => f.path), ['rules[2].verdict', 'rules[3].rule']);
  assert.deepEqual(find(report, 'broken-ref').map((f) => f.path), ['rules[4].visuals[0]']);
  assert.deepEqual(find(report, 'unknown-property').map((f) => f.path), ['rules[4].why']);
});

test('voice examples: both lines required; the rewrite must not use avoided words', () => {
  const doc = withYaml([
    'vocabulary:', '  avoid:', '    seamless: say what the steps are',
    'voice:', '  examples:',
    '    - { instead: A seamless checkout!, write: Checkout in two steps., why: A mechanism, not a mood. }',
    '    - { instead: Fast., write: Seamless and fast. }',
    '    - { instead: Hello. }',
  ].join('\n'));
  const report = lint(doc);
  assert.deepEqual(find(report, 'self-violation').map((f) => f.path), ['voice.examples[1].write']);
  assert.deepEqual(find(report, 'invalid-value').map((f) => f.path), ['voice.examples[2].write']);
});

test("a Do's and Don'ts section is no longer part of the order, and is simply preserved", () => {
  assert.deepEqual(lint(`${VALID}\n## Do's and Don'ts\n\nText.\n\n## Colors\n\nText.\n`).findings, []);
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

test('example bolt: only the documented findings (missing logo artwork, gaps in the source)', () => {
  const file = join(ROOT, 'examples', 'bolt', 'BRAND.md');
  const report = lint(readFileSync(file, 'utf8'), { file });
  assert.deepEqual(report.summary, { errors: 3, warnings: 0, infos: 6 });
  assert.ok(find(report, 'broken-ref').every((f) => f.path.startsWith('logo.wordmark.colorways.')));
  assert.deepEqual(rulesOf(report), ['adjective-only', 'broken-ref', 'unverified-license']);
});

test('cli: JSON output and exit code 0 on a clean file', () => {
  const out = execFileSync('node', [CLI, 'lint', join(ROOT, 'examples/panier-gris/BRAND.md')], { encoding: 'utf8' });
  assert.deepEqual(JSON.parse(out).summary, { errors: 0, warnings: 0, infos: 0 });
});

test('cli: exit code 1 on errors, reading from stdin', () => {
  const run = spawnSync('node', [CLI, 'lint', '-', '--format', 'text'], { input: '## Overview\n\nText.\n', encoding: 'utf8' });
  assert.equal(run.status, 1);
  assert.match(run.stdout, /missing-name/);
});

test('cli: extract lists rules and visuals for one area', () => {
  const run = spawnSync('node', [CLI, 'extract', '-', '--area', 'photography'], { input: SECTIONED, encoding: 'utf8' });
  assert.equal(run.status, 0);
  const out = JSON.parse(run.stdout);
  assert.deepEqual(out.rules.map((r) => r.rule), ['Nobody looks at the camera.']);
  assert.equal(out.visuals.length, 1);
});

test('cli: exit code 2 on bad usage and unreadable files', () => {
  assert.equal(spawnSync('node', [CLI, 'lint'], { encoding: 'utf8' }).status, 2);
  assert.equal(spawnSync('node', [CLI, 'lint', '/nonexistent/BRAND.md'], { encoding: 'utf8' }).status, 2);
  assert.equal(spawnSync('node', [CLI, 'frobnicate'], { encoding: 'utf8' }).status, 2);
});
