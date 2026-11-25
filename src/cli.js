#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { RULES, collect, lint } from './lint.js';

const USAGE = `Usage:
  brandmd lint <file | -> [--format json|text]   Lint a BRAND.md (use - for stdin)
  brandmd extract <file | -> [--area <area>]     List the brand's rules and visuals as JSON,
                                                 each tagged with its area
  brandmd rules                                  List the lint rules as JSON

Exit codes: 0 no errors, 1 errors found, 2 bad usage or unreadable file.
File-system checks (logo files, @ references, linked DESIGN.md files) are
skipped when reading from stdin.`;

function fail(message) {
  process.stderr.write(`${message}\n\n${USAGE}\n`);
  process.exit(2);
}

function formatText(target, report) {
  const lines = report.findings.map((f) => `${f.severity.padEnd(7)} ${f.rule.padEnd(18)} ${f.path}\n        ${f.message}`);
  const { errors, warnings, infos } = report.summary;
  lines.push(`${target}: ${errors} error(s), ${warnings} warning(s), ${infos} info`);
  return lines.join('\n');
}

const [command, ...rest] = process.argv.slice(2);

if (!command || command === '--help' || command === '-h') {
  process.stdout.write(`${USAGE}\n`);
} else if (command === 'rules') {
  process.stdout.write(`${JSON.stringify(RULES, null, 2)}\n`);
} else if (command === 'extract') {
  let area;
  const positional = [];
  for (let i = 0; i < rest.length; i += 1) {
    if (rest[i] === '--area') {
      area = rest[i + 1];
      i += 1;
    } else if (rest[i].startsWith('--area=')) {
      area = rest[i].slice('--area='.length);
    } else {
      positional.push(rest[i]);
    }
  }
  if (positional.length !== 1) fail('extract takes exactly one file path, or - for stdin.');
  if (rest.includes('--area') && !area) fail('--area needs a value, such as voice or logo.');
  let markdown;
  try {
    markdown = readFileSync(positional[0] === '-' ? 0 : positional[0], 'utf8');
  } catch (err) {
    fail(`Cannot read ${positional[0]}: ${err.message}`);
  }
  process.stdout.write(`${JSON.stringify(collect(markdown, { area }), null, 2)}\n`);
} else if (command === 'lint') {
  let format = 'json';
  const positional = [];
  for (let i = 0; i < rest.length; i += 1) {
    if (rest[i] === '--format') {
      format = rest[i + 1];
      i += 1;
    } else if (rest[i].startsWith('--format=')) {
      format = rest[i].slice('--format='.length);
    } else {
      positional.push(rest[i]);
    }
  }
  if (positional.length !== 1) fail('lint takes exactly one file path, or - for stdin.');
  if (format !== 'json' && format !== 'text') fail(`Unknown format "${format}".`);

  const target = positional[0];
  let markdown;
  try {
    markdown = readFileSync(target === '-' ? 0 : target, 'utf8');
  } catch (err) {
    fail(`Cannot read ${target}: ${err.message}`);
  }
  const report = lint(markdown, target === '-' ? {} : { file: target });
  process.stdout.write(`${format === 'text' ? formatText(target, report) : JSON.stringify(report, null, 2)}\n`);
  process.exitCode = report.summary.errors > 0 ? 1 : 0;
} else {
  fail(`Unknown command "${command}".`);
}
