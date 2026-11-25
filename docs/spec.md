# BRAND.md Format

Version: `alpha`

BRAND.md is a self-contained, plain-text description of a brand: who it is for, what it says, how it sounds, and how its logo, colours, typefaces and imagery are used. It gives people and AI agents the same source to work from when they make anything that carries the brand: a landing page, an ad, an email, a deck, a social post, a generated image.

A BRAND.md file has two parts. Markdown prose explains the brand and how to apply it. YAML holds the values a tool can check: colours, typefaces, logo files, vocabulary, messaging, claims. The YAML values are normative. The prose is where the brand lives.

BRAND.md is a sibling of [DESIGN.md](https://github.com/google-labs-code/design.md) and borrows its grammar. The two formats are independent: a BRAND.md is valid and useful with no DESIGN.md anywhere near it.

The key words "must", "should" and "may" are used as in RFC 2119.

# File

- The file is named `BRAND.md`, uppercase.
- It lives at the root of a project, or in the directory that holds the brand's assets.
- One file describes one brand. Parent and sub-brand inheritance is not defined in this version.
- A file should stay under about 300 lines. An agent reads it whole, every time.

# Structured Values

Structured values may be embedded in two ways, exactly as in DESIGN.md:

1. **YAML front matter** at the top of the file, between two lines containing exactly `---`.
2. **Fenced `yaml` code blocks** placed inside the section they belong to.

Both may be used in the same file. All blocks are parsed and merged into one tree. Each top-level key may be defined once across the whole document; defining the same top-level key in two blocks is an error.

There are two exceptions: `rules` and `visuals` may appear in any number of blocks, so that each sits in the section it governs. Their lists are concatenated in document order. This is the one place where BRAND.md's grammar departs from DESIGN.md's; see [Rules and visuals](#rules-and-visuals).

A common arrangement keeps `name`, `description` and `language` in the front matter and puts each other key in its own section:

````markdown
---
version: alpha
name: Panier Gris
description: A neighbourhood bakery in Nantes that bakes one batch a day.
language: en
---

## Colors

```yaml
colors:
  crust: "#8A4B1F"
  flour: "#F6F1E7"
```

**Crust** {colors.crust} is the colour of a loaf left in five minutes longer than most bakers dare.
````

## Schema

```yaml
version: <string>               # optional, current version: "alpha"
name: <string>                  # required
description: <string>           # optional, one sentence
language: <string>              # optional, BCP 47 tag of the brand's primary language
omitted: <string[] | OmittedSection[]>   # optional

colors:
  <token-name>: <Color>
  <group-name>:                 # optional nested group
    <token-name>: <Color>
typography:
  <role>: <Typeface>
required: <TokenReference[]>
print:
  <color-name>: <PrintColor>

logo:
  <variation>: <LogoVariation>

personality: <Trait[]>
voice:
  person: <string>
  casing: <string>
  sentenceLength: <string>
  examples: <VoiceExample[]>
vocabulary:
  use:
    <term>: <string>            # when and how to use it
  avoid:
    <term>: <string>            # what to write instead
messaging:
  tagline: <string>
  oneLiner: <string>
  boilerplate: <string>
  pillars: <Pillar[]>
  cta:
    primary: <string>
    never: <string[]>
claims: <Claim[]>

motion:
  <name>: <Motion>

rules: <Rule[]>                 # repeatable: may appear in every section
visuals: <Visual[]>             # repeatable: may appear in every section
```

Only `name` is required. Every other key is optional and should be left out, not invented, when the brand has not decided it.

## Types

**Color.** Any valid CSS colour string, as in DESIGN.md: hex, named, `rgb()`, `hsl()`, `oklch()` and the rest. Hex (`#RRGGBB`) is the recommended default.

**Dimension.** A string with a unit suffix. Valid units are `px`, `em` and `rem`, plus `mm` for print sizes.

**Token reference.** A dot-separated path to another value in the YAML tree, wrapped in curly braces: `{colors.crust}`, `{typography.display}`. References may be used in YAML values and in prose. A reference to a path that does not exist is an error. Text inside a code span or a fenced code block is literal and is never treated as a reference.

**Typeface.** DESIGN.md's Typography object, with three added properties. Every property is optional except `fontFamily`.

- `fontFamily` (string)
- `fontWeight` (number), `fontFeature` (string), `fontVariation` (string): only when a weight or setting is part of the identity
- `fallback` (string): the stack to use when the family is unavailable
- `license` (string): the licence or the source of the right to use the family
- `licenseVerified` (boolean): `true` only when a person has confirmed the licence covers the brand's use

`fontSize`, `lineHeight` and `letterSpacing` are accepted but discouraged. They form a type scale, which belongs to a design system.

**PrintColor.** The print specification of a colour in `colors`. The key is the colour's name (its dot-separated path when colours are grouped) and must match an existing colour.

- `cmyk` (string): four percentages from 0 to 100 for cyan, magenta, yellow and black, separated by spaces, commas or slashes: `"0 46 78 46"`
- `pantone` (string): the Pantone reference, with its suffix: `"178 C"`
- `note` (string): anything a printer needs to know, such as a fallback order or a paper stock

**Duration.** A string with an `ms` suffix: `240ms`.

**Motion.** DESIGN.md's Motion object:

- `duration` (Duration)
- `delay` (Duration)
- `timingFunction` (string): a CSS easing function

**LogoVariation.** One form of the logo. Its properties are true whatever colour it is drawn in.

- `use` (string): when this variation is the right one
- `minSize` (Dimension): the smallest width at which it stays legible
- `clearSpace` (string): the empty space around it, stated as a relationship ("the height of the letter n on every side"), not a pixel value
- `animation` (path): the animated version, if one exists. Same rules as a colourway's `file`.
- `colorways` (map of name to Colorway): the versions of the artwork, one per kind of background. At least one is required.

**Colorway.** One file of a variation, for one kind of background.

- `file` (path): the artwork, relative to the directory containing BRAND.md. Required, and it must exist.
- `color` (token reference): the colour the artwork is drawn in. For artwork in more than one colour, the one that must stand out from the background.
- `backgrounds` (token reference[]): the brand colours this colourway may sit on. (Not `on`, which YAML 1.1 parsers read as the boolean `true`.)

**Trait.** An object with three strings:

- `is`: the trait
- `not`: the neighbouring trait it must not be mistaken for
- `means`: what it changes in practice

**Pillar.** `claim` (string) and `proof` (string): a thing the brand says about itself and the fact that backs it.

**Claim.**

- `claim` (string): the statement, as it may be published
- `evidence` (string): the source, figure or link that supports it
- `status`: `approved`, `review` (needs sign-off before each use) or `prohibited`

**Visual.** An image that shows the brand done right or done wrong.

- `file` (path) or `url` (string): where the image is. Exactly one is required. `file` is relative to the directory containing BRAND.md and must exist. `url` must be an `https://` address.
- `verdict`: `do` or `dont`. Required.
- `caption` (string): what the image demonstrates, in a sentence. Required.
- `area` (string): what the image illustrates. Optional: by default it is the area of the section the visual is written in.

**Rule.** One thing to do or not to do.

- `verdict`: `do` or `dont`. Required.
- `rule` (string): the rule, as an instruction someone could check an output against. Required.
- `exception` (string): when the rule does not apply. Expected on every `dont`; write `none` when there is none.
- `area` (string): what the rule governs. Optional: by default it is the area of the section the rule is written in.
- `visuals` (path[]): images that show this rule, relative to the directory containing BRAND.md. Each must exist.

**VoiceExample.** An off-brand line and its on-brand rewrite.

- `instead` (string): the line as it should not be written. Required.
- `write` (string): the same line, on brand. Required.
- `why` (string): the reason, in a phrase. This is what lets a writer handle the cases the file never listed.

**Omitted.** A list of sections left out on purpose, as in DESIGN.md. Each entry is a section name, or `{ section: <string>, reason: <string> }`.

```yaml
omitted:
  - section: claims
    reason: "No public claims approved yet."
```

# External References

An external reference is an inline code span whose entire content matches `@<path>[#<fragment>]`, with a path that ends in a file extension: `` `@assets/logo/mark.svg` ``, `` `@guides/photography.md#portraits` ``. The rules are DESIGN.md's:

- Every reference resolves from the directory containing BRAND.md, never from the file it appears in.
- A leading `/`, or a path that resolves outside that directory, is an error.
- A consumer that does not understand a fragment for a file type ignores the fragment and uses the whole file.

Use references to keep BRAND.md short: a long photography guide or a page of approved boilerplate can live in its own file and be read on demand.

# Sections

Sections use `##` headings. An optional `#` heading may title the document and is not parsed as a section. Only Overview is required. Sections that are present must appear in this order.

| # | Section | Aliases | Structured key |
|---|---|---|---|
| 1 | Overview | Brand | |
| 2 | Positioning | | |
| 3 | Audience | | |
| 4 | Personality | | `personality` |
| 5 | Voice & Tone | Voice | `voice` |
| 6 | Messaging | | `messaging` |
| 7 | Claims | | `claims` |
| 8 | Vocabulary | Terminology | `vocabulary` |
| 9 | Logo | | `logo` |
| 10 | Colors | | `colors`, `required`, `print` |
| 11 | Typography | Typefaces | `typography` |
| 12 | Imagery | | |
| 13 | Motion | | `motion` |
| 14 | Applications | Channels | |

`rules` and `visuals` may appear in any section. Earlier versions had a final "Do's and Don'ts" section; rules now sit in the section they govern, and one under that heading is treated as an unknown section.

## Overview

Also known as "Brand".

What the brand is, in a paragraph or two, and the world it belongs to. This section is the fallback for every decision the rest of the file does not cover, so it should carry reference points: what the brand resembles and what it must not resemble. A specific reference ("the chalkboard outside a bakery that sells out by eleven") does more than a list of adjectives.

It should end with a tiebreaker: how to decide when nothing in the file answers the question. Rules that apply everywhere belong here too; their area is `general`.

````markdown
## Overview

Panier Gris is a bakery on a side street in Nantes that bakes one batch a day
and closes when it is gone. It looks and sounds like its own chalkboard:
short, handwritten in spirit, today's facts only.

It resembles a market stall's price cards and the back page of a parish
newsletter. It does not resemble an artisan-lifestyle brand, a patisserie
window, or anything with a gold foil stamp.

When in doubt, say less and say what is true today.

```yaml
rules:
  - verdict: do
    rule: Give the time. Every message about bread says when it is out.
```
````

## Positioning

Where the brand stands. Prose only. It should state:

- the category, in the words a customer would use
- what people use instead today
- what the brand does differently, and the proof
- what it is not

## Audience

Who the brand is for and who it is not for. Prose only. Describe a person in a situation, with what they already believe and what they doubt. "People who walk past on the way to work and have given up on finding bread after six" is usable. "Food lovers" is not.

## Personality

Who the brand is as a character, in three or four traits. A trait alone is an adjective; this section makes each one usable by stating its limit and its consequence.

```yaml
personality:
  - is: plain-spoken
    not: blunt
    means: We give the fact first and the reason second, and we never scold.
  - is: proud of the work
    not: precious about it
    means: We name the flour and the hours. We do not call bread "curated".
```

## Voice & Tone

Also known as "Voice".

How the brand writes. Voice is constant; tone shifts with the situation. This section should cover:

- **Mechanics.** Person (we, you), sentence length, punctuation habits, capitalisation.
- **Before and after.** At least three `examples`: an off-brand line, the on-brand rewrite, and a one-line reason. Pairs teach voice better than description.
- **Tone by situation.** How the voice bends for good news, bad news, an apology, a sale.

```yaml
voice:
  person: "we for the bakery, you for the reader"
  casing: sentence case everywhere, including headlines
  sentenceLength: under 14 words on average
  examples:
    - instead: Indulge in our artisanal sourdough experience!
      write: Sourdough, out at 7:30.
      why: We say what and when.
    - instead: We regret to inform you we are sold out.
      write: Sold out. Back tomorrow at 7:30.
      why: No ceremony, and always the next time.
rules:
  - verdict: dont
    rule: No exclamation marks.
    exception: none
```

A linter checks every `write` line against `vocabulary.avoid`, so the brand's own examples cannot use the words it bans. The `instead` lines are exempt; they quote bad writing on purpose.

Rules about interface microcopy (button labels, empty states, error messages) belong in a DESIGN.md.

## Messaging

What the brand says, at the lengths it is most often needed.

```yaml
messaging:
  tagline: One batch a day.
  oneLiner: A neighbourhood bakery in Nantes that bakes once a day and closes when the bread is gone.
  boilerplate: >
    Panier Gris is a bakery on rue des Halles in Nantes. It bakes one batch
    each morning from flour milled in Loire-Atlantique and closes when the
    shelves are empty.
  pillars:
    - claim: Baked this morning.
      proof: One batch a day, out at 7:30. Nothing is held over.
  cta:
    primary: Come before eleven
    never: ["Shop now", "Order online", "Discover"]
```

- `tagline`: the signature line
- `oneLiner`: what the brand is, in one sentence, for a bio or an introduction
- `boilerplate`: the paragraph that ends a press release or fills an "About" box
- `pillars`: the few things the brand says about itself, each with the fact that backs it
- `cta`: the call to action the brand uses, and the ones it never uses

The prose says when each is used and how far it may be adapted.

## Claims

What the brand may assert in public. Marketing copy makes factual statements, and an agent will invent plausible ones unless it is told which are true.

```yaml
claims:
  - claim: Flour milled within 60 km of the bakery.
    evidence: Supplier invoices and delivery notes, 2026.
    status: approved
  - claim: Organic
    evidence: Flour is certified; the bakery itself is not.
    status: prohibited
```

An entry may be marked `approved` only when a person has approved it. A tool or agent that drafts a claim must mark it `review`. Anything not listed here should be treated as `review`.

## Vocabulary

Also known as "Terminology".

The words the brand uses for recurring things, and the words it refuses.

```yaml
vocabulary:
  use:
    batch: What we bake in a day. Never "range" or "selection".
    Panier Gris: Two words, both capitalised, never abbreviated.
  avoid:
    artisanal: say what was done by hand
    curated: chosen
    experience: name the thing itself
```

`avoid` maps a term to its replacement, so a writer who reaches for the word knows what to write instead. Product and feature names, with their exact capitalisation, belong under `use`.

## Logo

The marks that identify the brand and the rules that do not change.

A logo usually exists in several **variations**, and each variation in several **colourways**:

| Variation | What it is |
|---|---|
| `full` | The complete logo: mark and wordmark together. Also called the lockup. |
| `mark` | The symbol alone. |
| `wordmark` | The name alone, in its own lettering. |

| Colourway | What it is for |
|---|---|
| `on-light` | A dark version, for light backgrounds. |
| `on-dark` | A light version, for dark backgrounds. |

These names are recommended, so that a tool can ask for "the mark, on dark" and find it. Other names are valid: a brand may have a `stacked` variation, an `app-icon`, or a `one-color` colourway for stamps. A brand whose logo is only a wordmark declares only `wordmark`; it does not invent a mark.

```yaml
logo:
  full:
    use: The default. Anywhere there is room.
    minSize: 120px
    clearSpace: the diameter of the mark on every side
    colorways:
      on-light:
        file: assets/logo/full-on-light.svg
        color: "{colors.abyss}"
        backgrounds: ["{colors.foam}", "{colors.lure}"]
      on-dark:
        file: assets/logo/full-on-dark.svg
        color: "{colors.foam}"
        backgrounds: ["{colors.abyss}", "{colors.kelp}"]
  mark:
    use: Avatars, favicons, stickers. Never beside the full logo.
    minSize: 16px
    colorways:
      on-light:
        file: assets/logo/mark-on-light.svg
        color: "{colors.abyss}"
        backgrounds: ["{colors.foam}"]
```

The first variation listed is the default, and within a variation the first colourway. `backgrounds` lists brand colours and is what the contrast check uses. Placing the logo over a photograph is a judgement, not a list; state the rule in prose.

The prose says what the mark means, which variation and colourway are the default, and lists the prohibitions: stretching, recolouring, effects, busy backgrounds.

A logo is always placed from its file. An image model must never be asked to draw it; generate the image without the logo and place the file afterwards.

## Colors

The identity colours. Typically two to five.

Brand colours are named for what they mean (`ink`, `crust`), not for the job they do on a screen (`primary`, `surface`). A role is a decision one surface makes; a design system assigns it.

```yaml
colors:
  crust: "#8A4B1F"
  flour: "#F6F1E7"
  slate: "#3A3D40"
  butter: "#E9C46A"
required: ["{colors.crust}", "{colors.flour}"]
```

For each colour the prose states:

- what it stands for
- **how it reads in words.** An image model ignores a hex value. "A dark baked brown, the colour of a well-fired crust; not chocolate, not terracotta" is an instruction it can follow.
- how much of it appears, and what it must not be used for

`required` lists the colours and typefaces every expression of the brand must carry. Everything else is available, not obligatory. A brand with one colour declares one colour.

**Print.** A colour that will be printed needs more than a screen value. `print` gives each one its CMYK build and, where one has been chosen, its Pantone reference:

```yaml
print:
  crust:
    cmyk: "0 46 78 46"
    note: Uncoated stock. Proof against a baked loaf, not a screen.
  flour:
    cmyk: "0 2 6 4"
    note: On the kraft bags, leave unprinted; the paper is the colour.
```

Leave out a colour that is never printed. Do not derive a Pantone reference from a hex value: a Pantone match is a choice someone makes with a swatch book, and an invented one will be sent to a printer.

Colour ramps, semantic roles, states and contrast pairs belong in a DESIGN.md.

## Typography

Also known as "Typefaces".

The approved type families and the role each plays.

```yaml
typography:
  display:
    fontFamily: Fraunces
    fallback: Georgia, serif
    license: SIL Open Font License 1.1
    licenseVerified: true
  text:
    fontFamily: Karla
    fallback: system-ui, sans-serif
    license: SIL Open Font License 1.1
    licenseVerified: true
```

Recommended role names are `display`, `text` and `mono`. The prose says what each is for and what the pairing should feel like.

`licenseVerified` is `true` only when someone has checked that the licence covers the brand's use. "Approved" is a claim about rights; an unverified family should say so.

## Imagery

The brand's point of view on pictures. Prose only, under `###` headings as needed: Photography, Illustration, Icons.

Each should state the subject, the treatment, and what never appears. Where the brand generates images, include a recipe: the fixed part of a prompt that makes any image recognisably this brand's.

```markdown
### Photography

Hands, trays, the shop at opening time. Daylight from the left, never a
flash. Bread is shown whole or torn, not sliced into a fan.

Recipe: "natural window light, 35mm, shallow depth, flour dust visible,
warm brown and off-white palette, no props, no text."

Never: stock smiles, rustic twine, overhead flat-lays.
```

## Motion

How the brand moves when it appears in video, on a screen in a venue, or as an animated logo. This is the brand's character in motion, the part that should survive a redesign: whether things glide or snap, how many things move at once, what never moves.

The prose states the character with a reference, what moves, and what does not. Where the logo has an animated version, it is declared on the logo variation with `animation` and its use is described here.

```yaml
motion:
  settle:
    duration: 240ms
    delay: 0ms
    timingFunction: cubic-bezier(0.2, 0, 0, 1)
```

```markdown
## Motion

Things arrive and settle, like a boat coming alongside. One element moves at
a time. Nothing bounces, nothing loops, nothing flashes.

- **Settle** {motion.settle.duration}: how anything enters.
- Never animate the wordmark. Exception: none.
```

`motion` tokens are optional and are named for what they are for (`settle`, `pulse`), not for their speed. Interface transitions, component states and reduced-motion handling belong in a DESIGN.md, which may reuse these values.

## Applications

Also known as "Channels".

How the brand shows up in the places it appears most. Prose only, one `###` heading per channel: social, email, advertising, decks, print, packaging. Each states what changes there and what does not: length, tone, which logo variation, how much colour.

This section is for what the brand does, not for how a platform works. Leave out any channel the brand does not use.

# Rules and visuals

Most of a brand guideline is do and don't: logo misuse, the photographs that work and the ones that do not, the words to cut, the line rewritten. In BRAND.md each rule and each example image sits in the section it governs, as a `rules` or `visuals` block.

````markdown
## Logo

```yaml
rules:
  - verdict: dont
    rule: Never stretch the wordmark.
    exception: none
    visuals: [assets/visuals/logo-dont-stretched.svg]
visuals:
  - file: assets/visuals/logo-dont-stretched.svg
    verdict: dont
    caption: The wordmark stretched to fill a wide space. Leave the space empty.
```

## Imagery

### Photography

```yaml
rules:
  - verdict: dont
    rule: Nobody looks at the camera.
    exception: Staff portraits on the About page.
visuals:
  - url: https://assets.example.com/brand/photography/hands-tray.jpg
    verdict: do
    caption: Daylight from the left, hands mid-task, nobody looks at the camera.
```
````

## Areas

Every rule and visual applies to an **area**. By default it is the section the block is written in:

| Written in | Area |
|---|---|
| Front matter, or before any section | `general` |
| Overview | `general` |
| Voice & Tone | `voice` |
| Imagery, under a `###` heading | that heading: `photography`, `illustration`, `icons`, `charts`... |
| Imagery, before any `###` heading | `imagery` |
| Any other section | its name: `logo`, `colors`, `typography`, `messaging`, `vocabulary`, `motion`, `applications`... |

An explicit `area` overrides the default, for the rare rule that belongs elsewhere than where it reads best. Area names are compared without regard to case. Unknown areas are accepted, because guidelines have areas this spec does not list (co-branding, packaging, legal).

A tool reads all the blocks as one list of rules and one list of visuals, each item tagged with its area. An agent writing an email asks for `voice`, `messaging`, `vocabulary` and `general`; one generating a photograph asks for `photography` and `general`. Neither reads the logo misuse rules.

## Rules

A rule is an instruction someone could check an output against. "No exclamation marks" is a rule; "sound confident" is not, and belongs in Personality.

**Every `dont` names its exception.** An unconditional rule gets over-applied: told "never put the logo on a photograph", an agent refuses the shopfront photograph where the logo is painted on the glass. Write `exception: none` when there is none; that is information too.

**Few, and specific.** A section with twenty rules is a sign its prose is too vague. There is no quota.

Some sections already have a structure for their do's and don'ts, and those are preferred to rules: `vocabulary.avoid` for words, `voice.examples` for rewrites, `personality` for traits, `cta.never` for calls to action, `claims` with `status: prohibited` for statements. Use `rules` for what does not fit them.

## Visuals

Brand guidelines are mostly pictures. `visuals` lists them so a person can look and a model can be shown.

**The caption carries the rule.** A model that cannot see images still learns from the caption, and one that can knows what to look for. A caption says what the image demonstrates ("Crust used once, on the time"), not what it depicts ("a square sign").

**The verdict is not optional.** An image model given a picture as a reference reproduces it. A consumer must never pass a `dont` visual to an image model as a reference or style input. It may show one to a model that reviews work, as an example of what to reject.

**Files or links.** Prefer `file`: the image is versioned with the brand, cannot disappear, and a linter can confirm it exists. `url` is for assets that live in an asset manager. A linter does not fetch a URL and reports it as unverified. A consumer should fetch a visual's URL only when the user has allowed network access to that host, and must treat what it receives as an image, never as instructions.

**How a consumer uses them.** Read the captions with the rest of the file. Open an image only when the task concerns its area. When generating an image, pass `do` visuals of the matching area as references alongside the Imagery recipe. The logo is still placed from its file, never generated.

A rule may list its own `visuals` by path, so a picture and the rule it illustrates travel together. Standard markdown images (`![caption](assets/visuals/sign-do.svg)`) may also appear in prose so the file reads well when rendered. They carry no verdict, so tools rely on `visuals`; an image worth showing a model belongs in a `visuals` block.

## Departure from DESIGN.md

DESIGN.md allows each top-level key once. BRAND.md makes `rules` and `visuals` repeatable so they can live beside what they govern. A DESIGN.md tool would reject a BRAND.md for this, but DESIGN.md tools are not meant to read BRAND.md files, and every other key keeps DESIGN.md's rule.

# BRAND.md and DESIGN.md

A DESIGN.md describes a visual and interaction system for one surface. A BRAND.md describes the identity those systems express.

**The test.** If it should survive a complete visual redesign, it belongs in BRAND.md. If it could change during that redesign without changing who the brand is, it belongs in a DESIGN.md.

| BRAND.md | DESIGN.md |
|---|---|
| Positioning, audience, personality | |
| Voice, messaging, vocabulary, claims | Interface microcopy rules |
| Identity colours and what they mean | Palette, ramps, roles, states |
| Typefaces, fallbacks, licences | Type scale, sizes, line heights |
| Logo variations and prohibitions | Logo placement on a surface |
| Imagery point of view | Image treatment and cropping |
| Motion character, animated logo | Interface transitions and states |
| Print colour values | |
| | Layout, spacing, shape, elevation, components |

**One brand, several designs.** A brand may have a DESIGN.md for its product, another for its marketing site, another for its decks. A DESIGN.md may name its brand in its front matter:

```yaml
---
name: Lanternfish Product
brand: ../BRAND.md
colors:
  primary: "#0B1F2A"
---
```

`brand` is an extension key; DESIGN.md consumers preserve unknown keys. BRAND.md keeps no list of its designs.

**Which file decides.**

- For work on a surface that has a DESIGN.md, the DESIGN.md decides applied visuals. BRAND.md still decides meaning, voice, vocabulary and claims.
- For work with no DESIGN.md (an ad, an email, a post, an image), BRAND.md alone decides.

**Compared by value.** Because brand colours are named by meaning and design tokens by role, the two files are never compared by name. A linked DESIGN.md should contain the value of every `required` colour, and should use no `fontFamily` that BRAND.md does not list. A disagreement is reported to a person; neither file is rewritten to match the other automatically.

# Linting Rules

The rules below are part of the specification, so that any tool checking a BRAND.md behaves the same way. The reference linter in this repository implements all of them.

A tool that cannot convert a colour to sRGB must skip the checks that need it (`contrast-ratio`, `design-drift`) for that colour and must not report a result. Checks that need the file system are skipped when the document is read from standard input.

| Rule | Severity | What it checks |
|---|---|---|
| `invalid-yaml` | error | A front matter or `yaml` block that cannot be parsed, or is not a map; a `rules` or `visuals` value that is not a list. |
| `duplicate-key` | error | A top-level key other than `rules` or `visuals` defined in more than one block. |
| `duplicate-section` | error | A section, or a section and its alias, appearing twice. |
| `missing-name` | error | The `name` key is absent. |
| `broken-ref` | error | A `{token}` reference that does not resolve; a logo colourway `file` or a variation's `animation` that does not exist; a visual `file`, or a path in a rule's `visuals`, that does not exist; a `print` key that names no colour; an `@` reference with a leading `/` or a path outside the BRAND.md directory. A missing `@` target or markdown image is a warning. |
| `section-order` | warning | Sections appear out of the order defined above. |
| `missing-overview` | warning | There is no Overview section. |
| `design-drift` | warning | A DESIGN.md in or below the BRAND.md directory, whose `brand` key resolves to this file, lacks the value of a `required` colour (compared after converting both to sRGB), or uses a `fontFamily` that `typography` does not list. |
| `self-violation` | warning | A `vocabulary.avoid` term appears, as a whole word and ignoring case, in a `messaging` value other than `cta.never`, or in the `write` line of a voice example. Prose, `instead` lines and rules are not checked, because they quote avoided words on purpose. |
| `contrast-ratio` | warning | A logo colourway's `color` against any colour in its `backgrounds` list has a contrast ratio below 3:1. |
| `missing-colorway` | warning | A logo variation with no colourway, or a colourway with no `file`. |
| `unsupported-claim` | warning | A `claims` entry with `status: approved` and no `evidence`. |
| `unknown-property` | warning | A property this spec does not define on a typeface, logo variation, logo colourway, trait, pillar, claim, print colour, motion token, visual, rule or voice example. |
| `invalid-value` | warning | A `cmyk` value that is not four numbers from 0 to 100; a motion `duration` or `delay` that is not a number followed by `ms`; a visual without exactly one of `file` and `url`, with a `url` that is not https, or with a missing or unknown `verdict`; a rule with no `rule` text or a missing or unknown `verdict`; a voice example missing `instead` or `write`; an `area` that is not a name. |
| `missing-caption` | warning | A visual with no `caption`. |
| `unverified-url` | info | A visual given by `url`. It is not fetched. |
| `unverified-license` | info | A `typography` entry without `licenseVerified: true`. |
| `adjective-only` | info | A `personality` entry without `not` or without `means`. |
| `missing-exception` | info | A rule with `verdict: dont` and no `exception`. |

# Recommended Names (Non-Normative)

**Typography roles:** `display`, `text`, `mono`

**Logo variations:** `full`, `mark`, `wordmark`

**Logo colourways:** `on-light`, `on-dark`

**Colours:** any name that says what the colour is or means. Avoid `primary`, `secondary`, `accent`.

**Areas:** `general`, `voice`, `messaging`, `vocabulary`, `claims`, `logo`, `colors`, `typography`, `photography`, `illustration`, `icons`, `motion`, `applications`

# Consumer Behavior for Unknown Content

| Scenario | Behavior |
|---|---|
| Unknown section heading | Preserve; do not error |
| Unknown top-level YAML key | Preserve; do not error |
| Unknown colour or typography name | Accept if the value is valid |
| Unknown logo variation or colourway name | Accept |
| Unknown property on a typeface, logo variation, logo colourway, trait, pillar, claim, print colour, motion token, visual, rule or voice example | Accept with a warning |
| Unknown area on a rule or visual | Accept |
| Unknown `status` on a claim | Treat as `review` |
| External `@` reference | Preserve; resolve on demand |
| Fragment on an unsupported file type | Ignore the fragment; use the whole file |
| Duplicate section heading | Error; reject the file |
| Duplicate top-level YAML key, other than `rules` and `visuals` | Error; reject the file |
