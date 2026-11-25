# BRAND.md

A format specification for describing a brand to people and AI agents. BRAND.md gives anyone making a landing page, an ad, an email, a deck or an image a persistent, structured understanding of who the brand is and how it shows up.

It is a sibling of Google's [DESIGN.md](https://github.com/google-labs-code/design.md) and uses the same grammar. DESIGN.md describes a visual system for one surface. BRAND.md describes the identity those systems express, and works on its own when there is no design system at all.

Status: `alpha`. The format will change.

## The Format

A BRAND.md file combines markdown prose with YAML values. The prose carries the brand: what it resembles, who it is for, how it writes. The YAML holds what a tool can check: colours, typefaces, logo files, avoided words, approved claims.

````md
---
version: alpha
name: Panier Gris
description: A neighbourhood bakery in Nantes that bakes one batch a day.
---

## Overview

Panier Gris bakes one batch a day and closes when it is gone. It looks and
sounds like its own chalkboard: short, handwritten in spirit, today's facts
only. It does not resemble an artisan-lifestyle brand.

## Voice & Tone

```yaml
voice:
  examples:
    - instead: Indulge in our artisanal sourdough experience!
      write: Sourdough, out at 7:30.
      why: We say what and when.
rules:
  - verdict: dont
    rule: No exclamation marks.
    exception: none
```

## Claims

```yaml
claims:
  - claim: Flour milled within 60 km of the bakery.
    evidence: Supplier invoices and delivery notes, 2026.
    status: approved
```

## Vocabulary

```yaml
vocabulary:
  avoid:
    artisanal: say what was done by hand
```

## Colors

```yaml
colors:
  crust: "#8A4B1F"
  flour: "#F6F1E7"
```

**Crust** {colors.crust} appears once per piece. In words: a dark baked
brown, the colour of a well-fired loaf; not chocolate, not terracotta.
````

An agent that reads this file writes "Walnut loaf this week. About forty a day." instead of "Discover our artisanal seasonal range!", and does not claim the bread is organic.

## Getting Started

Lint a BRAND.md: check references, logo files, section order, logo contrast, claims without evidence, avoided words in the brand's own messaging, and drift against any DESIGN.md that links to it.

```bash
npm install
```

```bash
node src/cli.js lint examples/lanternfish/BRAND.md --format text
```

```text
warning self-violation     messaging.tagline
        Avoided term "seamless" appears in the brand's own messaging.
warning design-drift       product/DESIGN.md
        product/DESIGN.md does not contain the required colour {colors.abyss} (#0B1F2B).
BRAND.md: 0 error(s), 2 warning(s), 0 info
```

(Abridged output from a deliberately broken copy; the two fictional examples lint clean.)

Output is JSON by default, in the same shape as DESIGN.md's linter: `{ findings: [{ severity, rule, path, message }], summary: { errors, warnings, infos } }`. The exit code is `1` when there are errors, `0` otherwise, and `2` for bad usage. Use `-` to read from standard input, and `node src/cli.js rules` to list the rules.

To give an agent only what concerns its task, `extract` returns the brand's rules and visuals as JSON, each tagged with its area:

```bash
node src/cli.js extract examples/lanternfish/BRAND.md --area voice
```

The linter is also a library:

```js
import { collect, lint } from './src/lint.js';

const report = lint(markdown, { file: 'BRAND.md' });
const { rules, visuals } = collect(markdown, { area: 'photography' });
```

Limits: colours are converted for contrast and drift checks when written as hex, `rgb()`, `hsl()` or a basic named colour. Other formats (`oklch()`, `color-mix()`) are accepted but those two checks skip them. The package is not published to npm.

Run the tests with `npm test`.

## The Specification

The full spec is at [`docs/spec.md`](docs/spec.md). The reasoning behind it is in [`PHILOSOPHY.md`](PHILOSOPHY.md). A condensed reference follows.

### Sections

Sections use `##` headings. Only Overview is required. Those present appear in this order:

| # | Section | Structured key | What it answers |
|:--|:--|:--|:--|
| 1 | Overview | | What the brand is, with reference points and a tiebreaker |
| 2 | Positioning | | Category, the alternative, the difference, the proof |
| 3 | Audience | | Who it is for and who it is not for |
| 4 | Personality | `personality` | Traits, each as is / not / means |
| 5 | Voice & Tone | `voice` | Mechanics, before-and-after examples, tone by situation |
| 6 | Messaging | `messaging` | Tagline, one-liner, boilerplate, pillars with proof, calls to action |
| 7 | Claims | `claims` | What may be asserted, with evidence and status |
| 8 | Vocabulary | `vocabulary` | Words to use, words to avoid and their replacements |
| 9 | Logo | `logo` | Variations (full, mark, wordmark), colourways (on light, on dark), clear space |
| 10 | Colors | `colors`, `required`, `print` | Identity colours, named by meaning and described in words, with print values |
| 11 | Typography | `typography` | Typefaces, fallbacks, licences |
| 12 | Imagery | | Photography, illustration, icons, generation recipes |
| 13 | Motion | `motion` | How the brand moves: character, animated logo, what never moves |
| 14 | Applications | | Per-channel rules |

Any section may also hold `rules` and `visuals`: the do's and don'ts for what that section governs.

### Schema

```yaml
version: <string>             # optional, current: "alpha"
name: <string>                # required
description: <string>
language: <string>            # BCP 47
omitted: <string[] | { section, reason }[]>
colors:
  <name>: <Color>
typography:
  <role>: { fontFamily, fontWeight, fallback, license, licenseVerified }
required: <token reference[]>
print:
  <color-name>: { cmyk, pantone, note }
logo:
  <variation>:                # full, mark, wordmark
    use: <string>
    minSize: <Dimension>
    clearSpace: <string>
    colorways:
      <name>: { file, color, backgrounds }   # on-light, on-dark
personality:
  - { is, not, means }
voice:
  person: <string>
  casing: <string>
  sentenceLength: <string>
  examples:
    - { instead, write, why }
vocabulary:
  use:   { <term>: <note> }
  avoid: { <term>: <replacement> }
messaging:
  tagline: <string>
  oneLiner: <string>
  boilerplate: <string>
  pillars: [{ claim, proof }]
  cta: { primary, never }
claims:
  - { claim, evidence, status: approved | review | prohibited }
motion:
  <name>: { duration, delay, timingFunction }
rules:                        # repeatable: may appear in every section
  - { verdict: do | dont, rule, exception, area, visuals }
visuals:                      # repeatable: may appear in every section
  - { file | url, verdict: do | dont, caption, area }
```

Token references (`{colors.crust}`) and external references (`` `@guides/photography.md` ``) work as they do in DESIGN.md.

### Rules and visuals

Do's and don'ts sit in the section they govern. `rules` and `visuals` are the only keys that may appear in several blocks; each item takes its **area** from the heading above it (`logo`, `voice`, or under Imagery, `photography`, `illustration`...), and an explicit `area` can override it.

- A rule is a `do` or a `dont` someone could check an output against. Every `dont` names its `exception`, or `none`.
- A visual has a local `file` or an https `url`, a `verdict` and a `caption`.
- The caption states the rule, so a model that cannot see images still learns it.
- A `dont` image is never given to an image model as a reference.
- Local files are checked by the linter. URLs are accepted, reported as unverified and never fetched.

### BRAND.md and DESIGN.md

If it should survive a complete visual redesign, it belongs in BRAND.md. If it could change during that redesign without changing who the brand is, it belongs in a DESIGN.md.

- One brand can have several DESIGN.md files (product, marketing site, decks). Each may point to its brand with `brand: ../BRAND.md`.
- On a surface that has a DESIGN.md, it decides applied visuals. BRAND.md still decides meaning, voice, vocabulary and claims.
- With no DESIGN.md (an ad, an email, a post, an image), BRAND.md alone is enough.
- Brand colours are named by meaning, design tokens by role, so the two files are compared by value.

### Linting rules

The spec defines the rules so any tool behaves the same way; the linter in this repository implements them.

| Rule | Severity | What it checks |
|:--|:--|:--|
| `invalid-yaml` | error | YAML that cannot be parsed |
| `duplicate-key` | error | A top-level key other than `rules` or `visuals` defined in two blocks |
| `duplicate-section` | error | A section, or its alias, appearing twice |
| `missing-name` | error | No `name` |
| `broken-ref` | error | Unresolved `{token}` references, missing logo files, out-of-bounds `@` paths |
| `section-order` | warning | Sections out of order |
| `missing-overview` | warning | No Overview |
| `design-drift` | warning | A linked DESIGN.md lacks a required colour's value or uses an unlisted font family |
| `self-violation` | warning | An avoided word appears in the brand's own messaging |
| `contrast-ratio` | warning | A logo against a permitted background falls below 3:1 |
| `missing-colorway` | warning | A logo variation with no colourway, or a colourway with no file |
| `unsupported-claim` | warning | An approved claim with no evidence |
| `unknown-property` | warning | A property the spec does not define |
| `invalid-value` | warning | A malformed CMYK value, motion duration, visual, rule or voice example |
| `missing-caption` | warning | A visual with no caption |
| `missing-exception` | info | A `dont` rule with no exception |
| `unverified-url` | info | A visual given by URL, which is not fetched |
| `unverified-license` | info | A typeface whose licence is not verified |
| `adjective-only` | info | A personality trait with no `not` or `means` |

## Examples

Panier Gris and Lanternfish are fictional. Bolt is real.

- [`examples/panier-gris/`](examples/panier-gris/BRAND.md): a bakery with no product and no design system. BRAND.md on its own.
- [`examples/lanternfish/`](examples/lanternfish/BRAND.md): a software company, with a [`product/DESIGN.md`](examples/lanternfish/product/DESIGN.md) that links to its brand and mirrors the required colours by value.
- [`examples/bolt/`](examples/bolt/BRAND.md): a real brand, transcribed from Bolt's January 2024 guidelines. Unofficial and not endorsed by Bolt. It shows what real guidelines cover well (logo, colour, print values) and what they leave out, and it lints with errors on purpose: [why](examples/bolt/README.md).

## Using it with an agent

Put `BRAND.md` at the root of the project and point the agent's instruction file at it. In `CLAUDE.md` or `AGENTS.md`:

```markdown
Before writing any public copy or making any marketing asset, read BRAND.md.
Make only the claims listed there as approved.
```

## Prior art

This is not the first brand file for agents, and it borrows from the others.

- [caiopizzol/brand.md](https://github.com/caiopizzol/brand.md) defines a prose-only BRAND.md in four layers with sub-brand inheritance. The redesign test, naming colours by meaning, approved claims and licence verification come from its thinking.
- [Sameness-Design/brand.md](https://github.com/Sameness-Design/brand.md) contributed the idea of describing colours in words an image model can follow.
- [DESIGN.md](https://github.com/google-labs-code/design.md) supplied the grammar: YAML values, token and file references, ordered sections, lint rules.

This format differs in three ways: it has a structured layer a tool can check, it requires almost nothing so a young brand can write an honest file, and it reads like a DESIGN.md so the two can sit together.

## License

Apache-2.0. See [`LICENSE`](LICENSE).
