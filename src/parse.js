import { parse as parseYaml } from 'yaml';

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;
const FENCE = /^(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)^\1[ \t]*$/gm;

/** Keys that may appear in several YAML blocks. Their lists are concatenated. */
export const REPEATABLE_KEYS = ['rules', 'visuals'];

/**
 * Split a BRAND.md (or DESIGN.md) into its merged YAML tree, its section
 * headings and its prose. Fenced code blocks are removed from the prose, and
 * `yaml` blocks are merged into the tree.
 *
 * Every key may be defined once, except the repeatable keys (`rules`,
 * `visuals`), whose lists are concatenated in document order. For those,
 * `placed` records where each item was written: the `##` section and the
 * `###` subsection around its block (both null in front matter).
 *
 * @param {string} markdown
 * @returns {{ tree: object, sections: {title: string, line: number}[], prose: string,
 *   problems: {rule: string, path: string, message: string}[],
 *   placed: Record<string, {section: string|null, subsection: string|null}[]> }}
 */
export function parseDocument(markdown) {
  const problems = [];
  const tree = {};
  const placed = Object.fromEntries(REPEATABLE_KEYS.map((key) => [key, []]));
  const text = markdown.replace(/\r\n/g, '\n');

  const merge = (source, where, context) => {
    let data;
    try {
      data = parseYaml(source);
    } catch (err) {
      problems.push({ rule: 'invalid-yaml', path: where, message: `YAML in ${where} could not be parsed: ${err.message.split('\n')[0]}` });
      return;
    }
    if (data === null || data === undefined) return;
    if (typeof data !== 'object' || Array.isArray(data)) {
      problems.push({ rule: 'invalid-yaml', path: where, message: `YAML in ${where} must be a map of keys.` });
      return;
    }
    for (const [key, value] of Object.entries(data)) {
      if (REPEATABLE_KEYS.includes(key)) {
        if (!Array.isArray(value)) {
          problems.push({ rule: 'invalid-yaml', path: key, message: `\`${key}\` in ${where} must be a list.` });
          continue;
        }
        tree[key] = [...(tree[key] ?? []), ...value];
        placed[key].push(...value.map(() => context));
        continue;
      }
      if (key in tree) {
        problems.push({ rule: 'duplicate-key', path: key, message: `Top-level key "${key}" is defined more than once.` });
        continue;
      }
      tree[key] = value;
    }
  };

  let body = text;
  const front = text.match(FRONT_MATTER);
  if (front) {
    // Keep line numbers stable by blanking the front matter instead of cutting it.
    body = front[0].replace(/[^\n]/g, '') + text.slice(front[0].length);
  }

  const blocks = [];
  const prose = body.replace(FENCE, (block, _fence, info, content, offset) => {
    if (info.trim().toLowerCase() === 'yaml') blocks.push({ content, line: body.slice(0, offset).split('\n').length });
    return block.replace(/[^\n]/g, '');
  });

  const headings = [];
  prose.split('\n').forEach((line, index) => {
    const heading = line.match(/^(#{2,3})[ \t]+(.+?)[ \t]*#*[ \t]*$/);
    if (heading) headings.push({ level: heading[1].length, title: heading[2].trim(), line: index + 1 });
  });
  const sections = headings.filter((h) => h.level === 2).map(({ title, line }) => ({ title, line }));

  const contextAt = (line) => {
    let section = null;
    let subsection = null;
    for (const heading of headings) {
      if (heading.line > line) break;
      if (heading.level === 2) {
        section = heading.title;
        subsection = null;
      } else {
        subsection = heading.title;
      }
    }
    return { section, subsection };
  };

  if (front) merge(front[1], 'front matter', { section: null, subsection: null });
  blocks.forEach((block, index) => merge(block.content, `yaml block ${index + 1}`, contextAt(block.line)));

  return { tree, sections, prose, problems, placed };
}

/** Look up a dot-separated path in the YAML tree. Returns undefined when absent. */
export function resolvePath(tree, dotted) {
  let current = tree;
  for (const part of dotted.split('.')) {
    if (current === null || typeof current !== 'object' || Array.isArray(current) || !(part in current)) return undefined;
    current = current[part];
  }
  return current;
}

const TOKEN_REF = /\{([A-Za-z][\w-]*(?:\.[\w-]+)+)\}/g;

/** Every `{path.to.token}` reference found in a string. */
export function tokenRefs(text) {
  return [...String(text).matchAll(TOKEN_REF)].map((m) => m[1]);
}

/** Walk a YAML value and yield every string leaf with its dotted path. */
export function* stringLeaves(value, path = '') {
  if (typeof value === 'string') {
    yield { path, value };
  } else if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) yield* stringLeaves(value[i], `${path}[${i}]`);
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) yield* stringLeaves(child, path ? `${path}.${key}` : key);
  }
}

/** Remove inline code spans, which are literal and never hold live references. */
export function stripCodeSpans(prose) {
  return prose.replace(/`[^`\n]*`/g, (span) => ' '.repeat(span.length));
}

const EXTERNAL_REF = /`@([^`\s#]+\.[A-Za-z0-9]+)(?:#[^`\s]+)?`/g;

/** External `@path[#fragment]` references: code spans whose whole content is one. */
export function externalRefs(prose) {
  return [...prose.matchAll(EXTERNAL_REF)].map((m) => m[1]);
}
