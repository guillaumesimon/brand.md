import { parse as parseYaml } from 'yaml';

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;
const FENCE = /^(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)^\1[ \t]*$/gm;

/**
 * Split a BRAND.md (or DESIGN.md) into its merged YAML tree, its section
 * headings and its prose. Fenced code blocks are removed from the prose, and
 * `yaml` blocks are merged into the tree.
 *
 * @param {string} markdown
 * @returns {{ tree: object, sections: {title: string, line: number}[], prose: string, problems: {rule: string, path: string, message: string}[] }}
 */
export function parseDocument(markdown) {
  const problems = [];
  const tree = {};
  const text = markdown.replace(/\r\n/g, '\n');

  const merge = (source, where) => {
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
    merge(front[1], 'front matter');
    // Keep line numbers stable by blanking the front matter instead of cutting it.
    body = front[0].replace(/[^\n]/g, '') + text.slice(front[0].length);
  }

  let blockIndex = 0;
  const prose = body.replace(FENCE, (block, _fence, info, content) => {
    if (info.trim().toLowerCase() === 'yaml') {
      blockIndex += 1;
      merge(content, `yaml block ${blockIndex}`);
    }
    return block.replace(/[^\n]/g, '');
  });

  const sections = [];
  prose.split('\n').forEach((line, index) => {
    const heading = line.match(/^##[ \t]+(.+?)[ \t]*#*[ \t]*$/);
    if (heading) sections.push({ title: heading[1].trim(), line: index + 1 });
  });

  return { tree, sections, prose, problems };
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
