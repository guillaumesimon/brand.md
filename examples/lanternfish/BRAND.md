---
version: alpha
name: Lanternfish
description: On-call scheduling for engineering teams too small to have a reliability department.
language: en
---

# Lanternfish

## Overview

Lanternfish is an on-call scheduling and paging tool for engineering teams of five to forty people. It exists for the moment a phone rings at 3:00 and for the Monday afterwards, when someone has to work out whether the rota is fair.

It looks and sounds like a ship's watch log: dark, quiet, exact about who had the watch and when. One small light in a lot of dark water.

It resembles a harbour master's logbook, a night-shift handover note, the status board in a hospital ward. It does not resemble a mission-control dashboard, a superhero incident-response brand, or anything with a siren on it.

When nothing here answers the question, choose the calmer option, and write as if the reader was woken up to read it.

```yaml
rules:
  - verdict: dont
    rule: Don't use sirens, flames, lightning, shields or red anywhere in marketing.
    exception: A product screenshot that shows a firing page as it really appears.
  - verdict: dont
    rule: Don't joke about outages or sleep loss.
    exception: none
```

## Positioning

On-call scheduling and paging. Not observability, not incident management, not a status page.

Small teams today run on-call from a shared calendar and a group chat, or they pay for an enterprise incident platform and use a tenth of it. Lanternfish does the tenth: who is on, how they are reached, who is next, and whether the load is shared fairly.

What it does differently is treat fairness as a feature. It counts nights and weekends per person and shows the imbalance before the team feels it.

## Audience

The engineer who drew up the rota because nobody else would. Usually a senior developer or a first engineering manager, at a company where the person on call also wrote the code that broke. They believe on-call is necessary and suspect it is being shared unfairly. They distrust tools that add process, and they have been paged by a false alarm recently enough to be tired.

Not for dedicated reliability teams with a follow-the-sun rotation, and not for buyers who need a compliance checklist first.

## Personality

```yaml
personality:
  - is: calm
    not: casual
    means: We lower the temperature. We never joke about outages and never use alarm colours for decoration.
  - is: exact
    not: pedantic
    means: We give names, times and time zones. We do not lecture about best practice.
  - is: on the engineer's side
    not: anti-management
    means: We talk about fair load and sleep. We do not cast managers as the villain.
```

## Voice & Tone

```yaml
voice:
  person: "we for Lanternfish, you for the reader"
  casing: sentence case everywhere
  sentenceLength: under 18 words on average
  examples:
    - instead: Supercharge your incident response!
      write: Know who is on call tonight.
      why: We name the outcome, at its real size.
    - instead: Never miss a critical alert again.
      write: Pages reach a person in under a minute, or go to the next one.
      why: A mechanism can be believed. A promise cannot.
    - instead: Burnout is killing your team.
      write: Two people took 70% of last quarter's night pages.
      why: A number, not a threat.
    - instead: Oops! Something went wrong.
      write: The schedule did not save. Your changes are still in this tab.
      why: Say what happened and what is safe.
rules:
  - verdict: do
    rule: Put a time zone on every time.
  - verdict: do
    rule: State a mechanism behind every promise.
  - verdict: dont
    rule: No exclamation marks, no emoji, no rhetorical questions in headlines.
    exception: none
```

Present tense. Numbers as numerals.

**Tone by situation**

- **Marketing:** plain claims at their real size. One idea per headline.
- **During an incident** (status posts, emails about our own outage): what is affected, since when, next update time. No adjectives.
- **After an incident:** what happened, what we changed. First person plural, active voice: "we deployed", not "a deployment was made".
- **Sales:** answer the question asked. Say what Lanternfish does not do.

## Messaging

```yaml
messaging:
  tagline: Someone has the watch.
  oneLiner: Lanternfish is on-call scheduling for small engineering teams, with fair rotas and pages that reach a person.
  boilerplate: >
    Lanternfish is an on-call scheduling and paging tool for engineering teams
    of five to forty people. It builds rotas, routes pages to whoever has the
    watch, and shows how night and weekend load is shared across the team.
    Lanternfish is made by a team of nine and is based in Rotterdam.
  pillars:
    - claim: A page reaches a person.
      proof: Unacknowledged pages move to the next person after 60 seconds by default.
    - claim: The load is shared, and you can see it.
      proof: A fairness report counts night and weekend pages per person, per quarter.
    - claim: Set up in an afternoon.
      proof: Median time from sign-up to first scheduled rota is 38 minutes.
  cta:
    primary: Build your first rota
    never: ["Book a demo", "Get started for free", "Supercharge", "Learn more"]
```

```yaml
rules:
  - verdict: dont
    rule: Don't use the tagline inside a sentence.
    exception: none
  - verdict: do
    rule: A headline may paraphrase a pillar, but keeps its mechanism.
```

## Claims

```yaml
claims:
  - claim: Unacknowledged pages escalate after 60 seconds by default.
    evidence: Product default, escalation policy settings.
    status: approved
  - claim: Median time from sign-up to first scheduled rota is 38 minutes.
    evidence: Product analytics, accounts created January to September 2026.
    status: approved
  - claim: 99.95% page delivery uptime over the last 12 months.
    evidence: Public status page history. Recalculate before each use.
    status: review
  - claim: Lanternfish reduces burnout.
    evidence: No study supports this.
    status: prohibited
  - claim: Any comparison with a named competitor.
    evidence: Not reviewed by counsel.
    status: prohibited
rules:
  - verdict: dont
    rule: Make no claim that is not listed here with status approved.
    exception: none
```

## Vocabulary

```yaml
vocabulary:
  use:
    watch: A person's on-call period. "Who has the watch" is the brand's signature phrase.
    rota: The schedule of watches. Not "roster", not "calendar".
    page: An alert sent to a person. A verb and a noun.
    handover: The moment one watch ends and the next begins. One word.
    Lanternfish: One word, capital L only. Never "LanternFish" or "LF".
  avoid:
    supercharge: say what gets faster, and by how much
    seamless: say what the steps are
    firefighting: responding
    hero: the person on call
    war room: incident channel
    alert fatigue: too many pages
```

## Logo

```yaml
logo:
  full:
    use: The default. Site header, decks, documents, anywhere there is room.
    minSize: 120px
    clearSpace: the diameter of the mark on every side
    colorways:
      on-dark:
        file: assets/logo/full-on-dark.svg
        color: "{colors.foam}"
        backgrounds: ["{colors.abyss}", "{colors.kelp}"]
      on-light:
        file: assets/logo/full-on-light.svg
        color: "{colors.abyss}"
        backgrounds: ["{colors.foam}", "{colors.lure}"]
  mark:
    use: Avatars, favicons, app icon, stickers. Never beside the full logo.
    minSize: 16px
    clearSpace: half its diameter on every side
    colorways:
      on-dark:
        file: assets/logo/mark-on-dark.svg
        color: "{colors.foam}"
        backgrounds: ["{colors.abyss}", "{colors.kelp}"]
      on-light:
        file: assets/logo/mark-on-light.svg
        color: "{colors.abyss}"
        backgrounds: ["{colors.foam}", "{colors.lure}"]
  wordmark:
    use: Where the mark already appears nearby, such as an email footer under an avatar.
    minSize: 88px
    clearSpace: the height of the letter l on every side
    colorways:
      on-dark:
        file: assets/logo/wordmark-on-dark.svg
        color: "{colors.foam}"
        backgrounds: ["{colors.abyss}", "{colors.kelp}"]
      on-light:
        file: assets/logo/wordmark-on-light.svg
        color: "{colors.abyss}"
        backgrounds: ["{colors.foam}", "{colors.lure}"]
```

The mark is a ring with a point of light at its centre: the watch, and the one who has it. The full logo on Abyss is the default; the brand lives in the dark. The wordmark is always lowercase.

Never ask an image model to draw it: generate the image without it and place the file.

```yaml
rules:
  - verdict: dont
    rule: Never set any part of the logo in Lure, or colour the centre point differently from the ring. Every colourway is one colour.
    exception: none
  - verdict: dont
    rule: Never place the logo on a photograph or a gradient.
    exception: none
  - verdict: dont
    rule: Never add a fish, or any creature, to the logo.
    exception: none
```

## Colors

```yaml
colors:
  abyss: "#0B1F2A"
  lure: "#F2B33D"
  foam: "#F3F1EA"
  kelp: "#2F6F62"
required: ["{colors.abyss}", "{colors.lure}", "{typography.display}"]
print:
  abyss:
    cmyk: "74 26 0 84"
    note: Large solid areas need a rich-black build agreed with the printer.
  lure:
    cmyk: "0 26 75 5"
  foam:
    cmyk: "0 1 4 5"
```

- **Abyss** {colors.abyss} is the water: the default ground for anything the brand makes. In words: a very dark blue-black with a green undertone, like the sea at night under a lamp; not navy, not pure black.
- **Lure** {colors.lure} is the single light. It marks the one thing to look at, and it is small: under 5% of any surface. In words: a warm amber, like a sodium lamp seen through fog; not yellow, not orange.
- **Foam** {colors.foam} carries text on Abyss and is the ground for printed and long-form pieces. In words: a soft off-white with a hint of grey-green; not cream, not paper-white.
- **Kelp** {colors.kelp} is optional, for secondary panels and charts. In words: a muted sea green; not teal, not emerald.

```yaml
rules:
  - verdict: dont
    rule: Don't use Lure for more than one element in a view.
    exception: A chart where Lure is the single highlighted series.
  - verdict: dont
    rule: Red is never a brand colour.
    exception: Inside the product, where it means something is wrong.
```

Print is rare (conference stands, stickers). The CMYK builds are conversions to proof; no Pantone references have been chosen.

## Typography

```yaml
typography:
  display:
    fontFamily: Space Grotesk
    fontWeight: 700
    fallback: system-ui, sans-serif
    license: SIL Open Font License 1.1
    licenseVerified: true
  text:
    fontFamily: Inter
    fallback: system-ui, sans-serif
    license: SIL Open Font License 1.1
    licenseVerified: true
  mono:
    fontFamily: JetBrains Mono
    fallback: ui-monospace, monospace
    license: SIL Open Font License 1.1
    licenseVerified: true
```

**Space Grotesk** is for the wordmark and headlines. **Inter** is for everything read at length. **JetBrains Mono** is for times, names on a rota and anything that is data.

```yaml
rules:
  - verdict: do
    rule: Set every timestamp in JetBrains Mono, even inside a headline set in Space Grotesk.
```

## Imagery

### Photography

Rarely used. When it is: real desks at night, a phone face-up on a bedside table, a laptop lit by its own screen.

```yaml
rules:
  - verdict: do
    rule: One light source.
  - verdict: dont
    rule: No faces looking at the camera, no staged teams, no server rooms.
    exception: none
```

Recipe: "night interior, single warm practical light, deep blue-black shadows, 50mm, quiet and still, no people facing camera, no screens with readable text, no logo."

### Illustration

Flat shapes in Abyss, Foam and Kelp with one Lure point, always a single dot or a short line. The dot is the watch: it shows who or what is awake.

```yaml
rules:
  - verdict: dont
    rule: No characters, no fish, no waves.
    exception: none
    visuals: [assets/visuals/illustration-dont.svg]
visuals:
  - file: assets/visuals/illustration-do.svg
    verdict: do
    caption: A rota as flat blocks in Kelp and Foam on Abyss, with a single Lure dot marking who has the watch.
  - file: assets/visuals/illustration-dont.svg
    verdict: dont
    caption: A fish, waves, several Lure elements and a red alarm dot. The brand has one light and no creatures.
```

### Charts

Charts are the brand's most common image.

```yaml
rules:
  - verdict: do
    rule: One series in Lure, everything else in Foam at reduced strength.
  - verdict: dont
    rule: No legends. Label lines and bars directly.
    exception: none
visuals:
  - file: assets/visuals/chart-do.svg
    verdict: do
    caption: A bar chart with one series in Lure, the rest in faded Foam, the value labelled on the bar and no legend.
```

## Motion

```yaml
motion:
  settle:
    duration: 240ms
    delay: 0ms
    timingFunction: cubic-bezier(0.2, 0, 0, 1)
  pulse:
    duration: 1600ms
    delay: 0ms
    timingFunction: ease-in-out
```

Lanternfish moves like something seen through deep water: slowly, one thing at a time, and then it is still. A lighthouse, not a notification.

- **Settle** ({motion.settle.duration}) is how anything arrives: it eases in and stops. Nothing bounces or overshoots.
- **Pulse** ({motion.pulse.duration}) belongs to the Lure dot alone. It brightens and dims once to show who has the watch, then rests.

```yaml
rules:
  - verdict: do
    rule: One element moves at a time.
  - verdict: dont
    rule: Text never animates letter by letter.
    exception: none
  - verdict: dont
    rule: The logo is never animated. It has no animated version.
    exception: none
  - verdict: dont
    rule: No flashing, shaking, sirens, countdowns or looping backgrounds.
    exception: A product recording that shows a firing page as it really behaves.
```

## Applications

### Marketing site

Has its own DESIGN.md. Abyss ground, one Lure element per screen.

### Product

Has its own DESIGN.md at `@product/DESIGN.md`. The product may use colours the brand does not, such as red for a firing page.

### Social

Text first. One chart or no image. Posts state one fact from a pillar or a changelog entry. During our own incidents, social posts link to the status page and say nothing else.

### Email

Plain text in appearance: Foam ground, Abyss text, no header image, the wordmark once in the footer. Subject lines state the content ("Your rota for next week", "Incident on 4 November: what happened").

### Decks

Abyss ground, one idea per slide, numbers in mono. The last slide is the tagline alone.
