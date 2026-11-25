import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

import { contrastRatio, sameColor, toRgb } from './color.js';
import { externalRefs, parseDocument, resolvePath, stringLeaves, stripCodeSpans, tokenRefs } from './parse.js';

export const SECTION_ORDER = [
  'overview', 'positioning', 'audience', 'personality', 'voice & tone', 'messaging', 'claims',
  'vocabulary', 'logo', 'colors', 'typography', 'imagery', 'applications', "do's and don'ts",
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
  logo: ['file', 'color', 'backgrounds', 'minSize', 'clearSpace'],
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
  'unverified-license': 'info',
  'adjective-only': 'info',
};

const MIN_LOGO_CONTRAST = 3;
const SKIPPED_DIRS = new Set(['node_modules', 'dist', 'vendor', 'build', '.git']);

const isMap = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const asList = (value) => (Array.isArray(value) ? value : []);
const normalizeTitle = (title) => title.toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();
const canonicalSection = (title) => SECTION_ALIASES[normalizeTitle(title)] ?? normalizeTitle(title);

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
  const { tree, sections, prose, problems } = parseDocument(markdown);
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

  // Logo: files exist, and each variant is legible on its permitted backgrounds.
  if (isMap(tree.logo)) {
    for (const [name, variant] of Object.entries(tree.logo)) {
      const path = `logo.${name}`;
      if (!isMap(variant)) continue;
      unknownProperties('logo', variant, path);
      if (typeof variant.file === 'string' && dir) {
        const target = resolve(dir, variant.file);
        if (variant.file.startsWith('/') || !insideDir(dir, target)) {
          report('broken-ref', `${path}.file`, `Logo file "${variant.file}" is outside the BRAND.md directory.`);
        } else if (!existsSync(target)) {
          report('broken-ref', `${path}.file`, `Logo file "${variant.file}" does not exist.`);
        }
      }
      const ink = toRgb(deref(tree, variant.color));
      if (!ink) continue;
      for (const [index, background] of asList(variant.backgrounds).entries()) {
        const ground = toRgb(deref(tree, background));
        if (!ground) continue;
        const ratio = contrastRatio(ink, ground);
        if (ratio < MIN_LOGO_CONTRAST) {
          report('contrast-ratio', `${path}.backgrounds[${index}]`, `Logo colour ${variant.color} on ${background} has a contrast ratio of ${ratio.toFixed(2)}:1, below ${MIN_LOGO_CONTRAST}:1.`);
        }
      }
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

  // Messaging: the brand must not use the words it tells others to avoid.
  const messaging = isMap(tree.messaging) ? tree.messaging : {};
  for (const [index, pillar] of asList(messaging.pillars).entries()) unknownProperties('pillar', pillar, `messaging.pillars[${index}]`);
  const avoided = isMap(tree.vocabulary) && isMap(tree.vocabulary.avoid) ? Object.keys(tree.vocabulary.avoid) : [];
  if (avoided.length > 0) {
    for (const leaf of stringLeaves(messaging, 'messaging')) {
      if (leaf.path.startsWith('messaging.cta.never')) continue;
      for (const term of avoided) {
        const escaped = String(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'iu').test(leaf.value)) {
          report('self-violation', leaf.path, `Avoided term "${term}" appears in the brand's own messaging.`);
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
