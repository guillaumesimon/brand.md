import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

import { contrastRatio, sameColor, toRgb } from './color.js';
import { externalRefs, parseDocument, resolvePath, stringLeaves, stripCodeSpans, tokenRefs } from './parse.js';

export const SECTION_ORDER = [
  'overview', 'positioning', 'audience', 'personality', 'voice & tone', 'messaging', 'claims',
  'vocabulary', 'logo', 'colors', 'typography', 'imagery', 'motion', 'applications',
];

const SECTION_ALIASES = {
  brand: 'overview',
  voice: 'voice & tone',
  terminology: 'vocabulary',
  typefaces: 'typography',
  channels: 'applications',
};

const KNOWN_PROPERTIES = {
  typeface: ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'fontFeature', 'fontVariation', 'fallback', 'license', 'licenseVerified'],
  'logo variation': ['use', 'minSize', 'clearSpace', 'animation', 'colorways'],
  'logo colourway': ['file', 'color', 'backgrounds'],
  'print colour': ['cmyk', 'pantone', 'note'],
  'motion token': ['duration', 'delay', 'timingFunction'],
  visual: ['file', 'url', 'area', 'verdict', 'caption'],
  rule: ['verdict', 'rule', 'exception', 'area', 'visuals'],
  'voice example': ['instead', 'write', 'why'],
  trait: ['is', 'not', 'means'],
  pillar: ['claim', 'proof'],
  claim: ['claim', 'evidence', 'status'],
};

/** Every rule the linter can report, with its fixed severity. */
export const RULES = {
  'invalid-yaml': 'error',
  'duplicate-key': 'error',
  'duplicate-section': 'error',
  'missing-name': 'error',
  'broken-ref': 'error', // a missing `@` target is downgraded to a warning
  'section-order': 'warning',
  'missing-overview': 'warning',
  'design-drift': 'warning',
  'self-violation': 'warning',
  'contrast-ratio': 'warning',
  'unsupported-claim': 'warning',
  'unknown-property': 'warning',
  'invalid-value': 'warning',
  'missing-caption': 'warning',
  'missing-colorway': 'warning',
  'unverified-url': 'info',
  'unverified-license': 'info',
  'adjective-only': 'info',
  'missing-exception': 'info',
};

/** The area a section's rules and visuals apply to, when it is not the section's own name. */
const SECTION_AREAS = { overview: 'general', 'voice & tone': 'voice' };

const MIN_LOGO_CONTRAST = 3;
const SKIPPED_DIRS = new Set(['node_modules', 'dist', 'vendor', 'build', '.git']);

const isMap = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const asList = (value) => (Array.isArray(value) ? value : []);
const normalizeTitle = (title) => title.toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();
const canonicalSection = (title) => SECTION_ALIASES[normalizeTitle(title)] ?? normalizeTitle(title);

/**
 * The area a rule or visual applies to: its explicit `area` if it has one,
 * otherwise the section it is written in. Under Imagery, the `###` heading
 * names the area (photography, illustration, icons, ...). Items in front
 * matter, or before any section, are `general`.
 */
export function areaOf(item, context) {
  if (isMap(item) && typeof item.area === 'string' && item.area.trim() !== '') return normalizeTitle(item.area);
  if (!context || !context.section) return 'general';
  const section = canonicalSection(context.section);
  if (section === 'imagery' && context.subsection) return normalizeTitle(context.subsection);
  return SECTION_AREAS[section] ?? section;
}

/**
 * Every rule and visual in a BRAND.md, each tagged with the area it applies to.
 *
 * @param {string} markdown
 * @param {{ area?: string }} [options] Keep only items for this area.
 * @returns {{ rules: object[], visuals: object[] }}
 */
export function collect(markdown, options = {}) {
  const { tree, placed } = parseDocument(markdown);
  const want = options.area ? normalizeTitle(options.area) : null;
  const tag = (key) => asList(tree[key])
    .map((item, index) => ({ ...(isMap(item) ? item : { value: item }), area: areaOf(item, placed[key][index]) }))
    .filter((item) => !want || item.area === want);
  return { rules: tag('rules'), visuals: tag('visuals') };
}

/** True for four numbers from 0 to 100 separated by spaces, commas or slashes. */
function isCmyk(value) {
  const parts = String(value).trim().split(/[\s,/]+/).filter(Boolean);
  return parts.length === 4 && parts.every((part) => /^\d+(\.\d+)?%?$/.test(part) && parseFloat(part) <= 100);
}

/** A value that is exactly one `{token}` reference resolves to its target; anything else is literal. */
function deref(tree, value) {
  const whole = typeof value === 'string' && value.trim().match(/^\{([^{}]+)\}$/);
  return whole ? resolvePath(tree, whole[1]) : value;
}

function insideDir(dir, target) {
  const rel = relative(dir, target);
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
}

/** Colour leaves of a `colors` tree, flattened across nested groups. */
function colorLeaves(colors) {
  return [...stringLeaves(colors ?? {})].map((leaf) => leaf.value);
}

/** Every `fontFamily` in a `typography` tree, at any nesting depth. */
function fontFamilies(typography, found = []) {
  if (!isMap(typography)) return found;
  for (const [key, value] of Object.entries(typography)) {
    if (key === 'fontFamily' && typeof value === 'string') found.push(value);
    else fontFamilies(value, found);
  }
  return found;
}

/** DESIGN.md files under `dir` whose `brand` key points at `brandFile`. */
function linkedDesigns(dir, brandFile) {
  const linked = [];
  const target = realpathSync(brandFile);
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRS.has(entry.name)) walk(full);
      } else if (entry.name === 'DESIGN.md') {
        const { tree } = parseDocument(readFileSync(full, 'utf8'));
        if (typeof tree.brand !== 'string') continue;
        const pointed = resolve(dirname(full), tree.brand);
        if (existsSync(pointed) && realpathSync(pointed) === target) linked.push({ file: full, tree });
      }
    }
  };
  walk(dir);
  return linked;
}

/**
 * Lint a BRAND.md document.
 *
 * @param {string} markdown The file's content.
 * @param {{ file?: string }} [options] `file` is the path the content was read
 *   from. Without it, checks that need the file system (logo files, `@`
 *   targets, linked DESIGN.md files) are skipped.
 * @returns {{ findings: {severity: string, rule: string, path: string, message: string}[], summary: {errors: number, warnings: number, infos: number} }}
 */
export function lint(markdown, options = {}) {
  const { tree, sections, prose, problems, placed } = parseDocument(markdown);
  const file = options.file ? resolve(options.file) : null;
  const dir = file ? dirname(file) : null;
  const findings = [];
  const report = (rule, path, message, severity = RULES[rule]) => findings.push({ severity, rule, path, message });

  for (const problem of problems) report(problem.rule, problem.path, problem.message);

  if (typeof tree.name !== 'string' || tree.name.trim() === '') {
    report('missing-name', 'name', 'The required `name` key is missing.');
  }

  // Sections: duplicates, order, and the one required section.
  const canonical = sections.map((section) => ({ ...section, key: canonicalSection(section.title) }));
  const seen = new Set();
  for (const section of canonical) {
    if (seen.has(section.key)) report('duplicate-section', section.title, `Section "${section.title}" appears more than once (line ${section.line}).`);
    seen.add(section.key);
  }
  let highest = -1;
  for (const section of canonical) {
    const position = SECTION_ORDER.indexOf(section.key);
    if (position === -1) continue;
    if (position < highest) {
      report('section-order', section.title, `Section "${section.title}" (line ${section.line}) comes after a section it should precede. Expected order: ${SECTION_ORDER.join(', ')}.`);
    } else {
      highest = position;
    }
  }
  if (!seen.has('overview')) report('missing-overview', 'Overview', 'There is no Overview section. It is the fallback for every decision the file does not cover.');

  // Token references, in YAML values and in prose outside code.
  for (const leaf of stringLeaves(tree)) {
    for (const ref of tokenRefs(leaf.value)) {
      if (resolvePath(tree, ref) === undefined) report('broken-ref', leaf.path, `Reference {${ref}} does not resolve to a value.`);
    }
  }
  for (const ref of new Set(tokenRefs(stripCodeSpans(prose)))) {
    if (resolvePath(tree, ref) === undefined) report('broken-ref', 'prose', `Reference {${ref}} in prose does not resolve to a value.`);
  }

  // External `@` references.
  for (const ref of new Set(externalRefs(prose))) {
    if (ref.startsWith('/') || (dir && !insideDir(dir, resolve(dir, ref))) || (!dir && ref.split('/').includes('..'))) {
      report('broken-ref', `@${ref}`, `External reference @${ref} points outside the BRAND.md directory.`);
    } else if (dir && !existsSync(resolve(dir, ref))) {
      report('broken-ref', `@${ref}`, `External reference @${ref} points to a file that does not exist.`, 'warning');
    }
  }

  const unknownProperties = (kind, value, path) => {
    if (!isMap(value)) return;
    for (const key of Object.keys(value)) {
      if (!KNOWN_PROPERTIES[kind].includes(key)) report('unknown-property', `${path}.${key}`, `"${key}" is not a known ${kind} property.`);
    }
  };

  const localTarget = (value, path, what) => {
    if (!dir) return;
    const target = resolve(dir, value);
    if (value.startsWith('/') || !insideDir(dir, target)) {
      report('broken-ref', path, `${what} "${value}" is outside the BRAND.md directory.`);
    } else if (!existsSync(target)) {
      report('broken-ref', path, `${what} "${value}" does not exist.`);
    }
  };

  // Logo: each variation has colourways; each colourway's file exists and is
  // legible on its permitted backgrounds.
  if (isMap(tree.logo)) {
    for (const [name, variation] of Object.entries(tree.logo)) {
      const path = `logo.${name}`;
      if (!isMap(variation)) continue;
      unknownProperties('logo variation', variation, path);
      if (typeof variation.animation === 'string') localTarget(variation.animation, `${path}.animation`, 'Logo animation');
      const colorways = isMap(variation.colorways) ? Object.entries(variation.colorways) : [];
      if (colorways.length === 0) {
        report('missing-colorway', path, `Logo variation "${name}" has no colourway, so there is no file to place.`);
      }
      for (const [colorwayName, colorway] of colorways) {
        const where = `${path}.colorways.${colorwayName}`;
        if (!isMap(colorway)) continue;
        unknownProperties('logo colourway', colorway, where);
        if (typeof colorway.file === 'string') localTarget(colorway.file, `${where}.file`, 'Logo file');
        else report('missing-colorway', where, `Colourway "${colorwayName}" of "${name}" has no \`file\`.`);
        const ink = toRgb(deref(tree, colorway.color));
        if (!ink) continue;
        for (const [index, background] of asList(colorway.backgrounds).entries()) {
          const ground = toRgb(deref(tree, background));
          if (!ground) continue;
          const ratio = contrastRatio(ink, ground);
          if (ratio < MIN_LOGO_CONTRAST) {
            report('contrast-ratio', `${where}.backgrounds[${index}]`, `Logo colour ${colorway.color} on ${background} has a contrast ratio of ${ratio.toFixed(2)}:1, below ${MIN_LOGO_CONTRAST}:1.`);
          }
        }
      }
    }
  }

  // Print: every entry names a real colour and carries a well-formed CMYK build.
  if (isMap(tree.print)) {
    for (const [name, spec] of Object.entries(tree.print)) {
      const path = `print.${name}`;
      if (typeof resolvePath(isMap(tree.colors) ? tree.colors : {}, name) !== 'string') {
        report('broken-ref', path, `Print values are given for "${name}", which is not a colour in \`colors\`.`);
      }
      if (!isMap(spec)) continue;
      unknownProperties('print colour', spec, path);
      if (spec.cmyk !== undefined && !isCmyk(spec.cmyk)) {
        report('invalid-value', `${path}.cmyk`, `CMYK value "${spec.cmyk}" must be four numbers from 0 to 100.`);
      }
    }
  }

  // Motion: durations are milliseconds.
  if (isMap(tree.motion)) {
    for (const [name, token] of Object.entries(tree.motion)) {
      if (!isMap(token)) continue;
      unknownProperties('motion token', token, `motion.${name}`);
      for (const key of ['duration', 'delay']) {
        if (token[key] !== undefined && !/^\d+(\.\d+)?ms$/.test(String(token[key]))) {
          report('invalid-value', `motion.${name}.${key}`, `Motion ${key} "${token[key]}" must be a number followed by ms.`);
        }
      }
    }
  }

  // Visuals: each one is locatable, captioned and marked do or dont.
  for (const [index, visual] of asList(tree.visuals).entries()) {
    const path = `visuals[${index}]`;
    if (!isMap(visual)) continue;
    unknownProperties('visual', visual, path);
    const hasFile = typeof visual.file === 'string';
    const hasUrl = typeof visual.url === 'string';
    if (hasFile === hasUrl) {
      report('invalid-value', path, 'A visual needs exactly one of `file` or `url`.');
    } else if (hasFile) {
      localTarget(visual.file, `${path}.file`, 'Visual');
    } else if (!/^https:\/\/\S+$/.test(visual.url)) {
      report('invalid-value', `${path}.url`, `Visual URL "${visual.url}" must be an https:// address.`);
    } else {
      report('unverified-url', `${path}.url`, `Visual "${visual.url}" is a remote link; it was not fetched or checked.`);
    }
    if (visual.verdict !== 'do' && visual.verdict !== 'dont') {
      report('invalid-value', `${path}.verdict`, 'A visual needs a `verdict` of `do` or `dont`, so a bad example is never used as a reference.');
    }
    if (visual.area !== undefined && (typeof visual.area !== 'string' || visual.area.trim() === '')) {
      report('invalid-value', `${path}.area`, '`area` must be a name, such as logo or photography.');
    }
    if (typeof visual.caption !== 'string' || visual.caption.trim() === '') {
      report('missing-caption', path, 'A visual needs a `caption` saying what it demonstrates.');
    }
  }

  // Rules: each one is a do or a dont, states itself, and names its exception.
  for (const [index, rule] of asList(tree.rules).entries()) {
    const path = `rules[${index}]`;
    const area = areaOf(rule, placed.rules[index]);
    if (!isMap(rule)) {
      report('invalid-value', path, 'A rule must be a map with `verdict` and `rule`.');
      continue;
    }
    unknownProperties('rule', rule, path);
    if (rule.verdict !== 'do' && rule.verdict !== 'dont') {
      report('invalid-value', `${path}.verdict`, `A rule (${area}) needs a \`verdict\` of \`do\` or \`dont\`.`);
    }
    if (typeof rule.rule !== 'string' || rule.rule.trim() === '') {
      report('invalid-value', `${path}.rule`, `A rule (${area}) needs its \`rule\` text.`);
    }
    if (rule.verdict === 'dont' && (typeof rule.exception !== 'string' || rule.exception.trim() === '')) {
      report('missing-exception', path, `"${rule.rule}" (${area}) names no exception. Write "none" if there is none.`);
    }
    if (rule.area !== undefined && (typeof rule.area !== 'string' || rule.area.trim() === '')) {
      report('invalid-value', `${path}.area`, '`area` must be a name, such as logo or voice.');
    }
    for (const [visualIndex, visualFile] of asList(rule.visuals).entries()) {
      if (typeof visualFile === 'string') localTarget(visualFile, `${path}.visuals[${visualIndex}]`, 'Rule visual');
    }
  }

  // Voice examples: an off-brand line and its on-brand rewrite.
  const voiceExamples = isMap(tree.voice) ? asList(tree.voice.examples) : [];
  for (const [index, example] of voiceExamples.entries()) {
    const path = `voice.examples[${index}]`;
    if (!isMap(example)) continue;
    unknownProperties('voice example', example, path);
    for (const key of ['instead', 'write']) {
      if (typeof example[key] !== 'string' || example[key].trim() === '') {
        report('invalid-value', `${path}.${key}`, `A voice example needs \`${key}\`.`);
      }
    }
  }

  // Markdown images in prose: local targets must exist.
  for (const match of stripCodeSpans(prose).matchAll(/!\[[^\]]*\]\(\s*<?([^)\s>]+)>?[^)]*\)/g)) {
    const target = match[1];
    if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue; // http:, https:, data:
    if (dir && existsSync(resolve(dir, target)) === false && insideDir(dir, resolve(dir, target))) {
      report('broken-ref', `image ${target}`, `Image "${target}" does not exist.`, 'warning');
    } else if (target.startsWith('/') || (dir && !insideDir(dir, resolve(dir, target)))) {
      report('broken-ref', `image ${target}`, `Image "${target}" is outside the BRAND.md directory.`);
    }
  }

  // Typography: licences.
  if (isMap(tree.typography)) {
    for (const [role, typeface] of Object.entries(tree.typography)) {
      if (!isMap(typeface)) continue;
      unknownProperties('typeface', typeface, `typography.${role}`);
      if (typeface.licenseVerified !== true) {
        report('unverified-license', `typography.${role}`, `The licence for ${typeface.fontFamily ?? role} is not marked as verified.`);
      }
    }
  }

  // Personality: a trait needs its limit and its consequence.
  for (const [index, trait] of asList(tree.personality).entries()) {
    if (!isMap(trait)) continue;
    unknownProperties('trait', trait, `personality[${index}]`);
    const missing = ['not', 'means'].filter((key) => typeof trait[key] !== 'string' || trait[key].trim() === '');
    if (missing.length > 0) {
      report('adjective-only', `personality[${index}]`, `Trait "${trait.is ?? index}" has no ${missing.map((key) => `\`${key}\``).join(' or ')}; on its own it is an adjective.`);
    }
  }

  // Claims: nothing approved without evidence.
  for (const [index, claim] of asList(tree.claims).entries()) {
    if (!isMap(claim)) continue;
    unknownProperties('claim', claim, `claims[${index}]`);
    const hasEvidence = typeof claim.evidence === 'string' && claim.evidence.trim() !== '';
    if (claim.status === 'approved' && !hasEvidence) {
      report('unsupported-claim', `claims[${index}]`, `Claim "${claim.claim}" is approved but has no evidence.`);
    }
  }

  // Messaging and voice examples: the brand must not use the words it tells
  // others to avoid.
  const messaging = isMap(tree.messaging) ? tree.messaging : {};
  for (const [index, pillar] of asList(messaging.pillars).entries()) unknownProperties('pillar', pillar, `messaging.pillars[${index}]`);
  const avoided = isMap(tree.vocabulary) && isMap(tree.vocabulary.avoid) ? Object.keys(tree.vocabulary.avoid) : [];
  if (avoided.length > 0) {
    const ownWords = [
      ...stringLeaves(messaging, 'messaging'),
      ...voiceExamples.map((example, index) => ({ path: `voice.examples[${index}].write`, value: isMap(example) ? example.write : undefined }))
        .filter((leaf) => typeof leaf.value === 'string'),
    ];
    for (const leaf of ownWords) {
      if (leaf.path.startsWith('messaging.cta.never')) continue;
      for (const term of avoided) {
        const escaped = String(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'iu').test(leaf.value)) {
          report('self-violation', leaf.path, `Avoided term "${term}" appears in the brand's own words.`);
        }
      }
    }
  }

  // Linked DESIGN.md files: required colours present by value, no unlisted fonts.
  if (dir) {
    const brandFamilies = new Set(fontFamilies(tree.typography).map((family) => family.toLowerCase()));
    for (const design of linkedDesigns(dir, file)) {
      const where = relative(dir, design.file).split(sep).join('/');
      const designColors = colorLeaves(design.tree.colors);
      for (const entry of asList(tree.required)) {
        const value = deref(tree, entry);
        if (!toRgb(value)) continue; // typefaces, unresolved references and unparsed formats
        const comparable = designColors.filter((color) => toRgb(color));
        if (!comparable.some((color) => sameColor(color, value))) {
          report('design-drift', where, `${where} does not contain the required colour ${entry} (${value}).`);
        }
      }
      if (brandFamilies.size > 0) {
        for (const family of new Set(fontFamilies(design.tree.typography))) {
          if (!brandFamilies.has(family.toLowerCase())) {
            report('design-drift', where, `${where} uses the font family "${family}", which this brand's typography does not list.`);
          }
        }
      }
    }
  }

  const count = (severity) => findings.filter((finding) => finding.severity === severity).length;
  return { findings, summary: { errors: count('error'), warnings: count('warning'), infos: count('info') } };
}
