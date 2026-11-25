---
version: alpha
name: Bolt
description: Online checkout. Transcribed from Bolt's brand guidelines dated January 2024.
language: en
omitted:
  - section: positioning
    reason: "Not covered by the January 2024 guidelines."
  - section: audience
    reason: "Not covered by the January 2024 guidelines."
  - section: vocabulary
    reason: "Not covered by the January 2024 guidelines."
  - section: motion
    reason: "Not covered by the January 2024 guidelines."
---

# Bolt

> **Unofficial.** This is a worked example of the BRAND.md format, not a Bolt document. It is not made, reviewed or endorsed by Bolt, and the Bolt name, logo and imagery belong to Bolt.
>
> **Source.** Transcribed from *Bolt Brand Guidelines, January 2024* (19 pages: Tone of Voice, Logo, Color, Typography). Nothing has been added that the guidelines do not say. Where they show something without stating a rule, this file says so. Gaps are listed at the end.

## Overview

Bolt makes online checkout. Its identity is built on the lightning shape inside its wordmark: in the guidelines' words, the shape "supports our lightning quick product offering", while the solid capital letters stand for trustworthiness.

The guidelines' own pages are large, tightly set headlines on flat Lightning Yellow, Bolt Black and warm greys, with giant lightning shapes cut across the page.

The guidelines give no reference points and no rule for deciding cases they do not cover.

## Personality

Bolt's guidelines express personality only as three tone-of-voice principles. Each is named; none is explained.

```yaml
personality:
  - is: thoughtfully concise
  - is: knowingly playful
  - is: comfortably at ease
```

## Voice & Tone

The three principles above are the whole of Bolt's written voice guidance. The guidelines give no mechanics (person, sentence length, punctuation, capitalisation), no before-and-after examples and no tone by situation.

Observed in the guidelines' example copy, not stated as rules: headlines end with a full stop, and play on words and on the brand's own speed ("Checkout in (half) the blink of an eye.").

## Messaging

The guidelines designate no tagline, one-liner or boilerplate. These lines appear in their examples and type specimens:

- Shockingly simple.
- Shockingly simple checkout.
- The very very very very very simple checkout.
- Checkout faster than you can say 'one-click.'
- Checkout in (half) the blink of an eye.
- Put the 'dash' in dashboard.
- Subline specimen: "The quickest, safest effortless-est way to pay for something online."
- Body specimen: "Checkout often causes e-commerce anxiety. A less than seamless checkout experience can cause abandoned carts, fraud concerns, and general frustration that can stop a purchase in its tracks. Bolt relieves that burden, enabling shoppers to breeze through checkout and consistently converting guest shoppers into loyal account holders for better business in the short term and long run."

## Claims

The specimen copy makes factual claims. The guidelines give no evidence for them, so they are recorded for review, not approved.

```yaml
claims:
  - claim: The quickest, safest way to pay for something online.
    evidence: None given in the guidelines. A superlative about competitors.
    status: review
  - claim: Bolt consistently converts guest shoppers into loyal account holders.
    evidence: None given in the guidelines.
    status: review
```

## Logo

```yaml
logo:
  wordmark:
    use: The only logo. As the large primary element of a piece, or small and secondary to support text or imagery.
    clearSpace: the height of the wordmark on every side
    colorways:
      on-light:
        file: assets/logo/bolt-black.svg
        color: "{colors.bolt-black}"
        backgrounds: ["{colors.lightning-yellow}", "{colors.light-grey}", "{colors.mid-grey}"]
      on-dark:
        file: assets/logo/bolt-light-grey.svg
        color: "{colors.light-grey}"
        backgrounds: ["{colors.bolt-black}"]
      on-dark-yellow:
        file: assets/logo/bolt-lightning-yellow.svg
        color: "{colors.lightning-yellow}"
        backgrounds: ["{colors.bolt-black}"]
```

"Our logo is our most sacred asset. Please treat it with the utmost respect." The logo is the wordmark BOLT, in which the L and T together form a lightning bolt. There is no separate symbol.

- **Colour.** The logo is used in Lightning Yellow, Light Grey or Bolt Black, chosen for maximum contrast with what surrounds it: Bolt Black on a light background, Light Grey or Lightning Yellow on a dark one. The guidelines name no default.
- **Clear space.** One unit on every side, where the unit is the height of the wordmark (shown as 1x in the guidelines' diagram).
- **Minimum size.** 30 pt tall. (The format's `minSize` is a width in px, em, rem or mm, so this value is kept in prose.)
- **Primary or secondary.** The logo may be the large main element of a piece or a small supporting one. Size it so the logo and nearby elements never feel the same.
- **Co-branding.** Separate the Bolt logo from a partner's by 0.28x, where x is the width of the Bolt logo. The partner's logo is never taller than Bolt's, except for small overhanging elements; an irregular partner logo is aligned optically to its wordmark.

The guidelines state no exceptions to their logo rules; the rules below say so rather than invent one.

```yaml
rules:
  - verdict: do
    rule: Choose the logo colour for maximum contrast with what surrounds it.
  - verdict: dont
    rule: Never use the logo in a secondary colour.
    exception: None stated in the guidelines.
  - verdict: do
    rule: Over a photograph, use Light Grey or Lightning Yellow, only where the logo stays clear and legible.
    visuals: [assets/visuals/do-yellow-on-photo.jpg]
  - verdict: dont
    rule: Don't rotate, stretch or skew the wordmark.
    exception: None stated in the guidelines.
    visuals: [assets/visuals/dont-rotate.jpg, assets/visuals/dont-stretch.jpg]
  - verdict: dont
    rule: Don't add gradients, 3D effects or a stroke.
    exception: None stated in the guidelines.
    visuals: [assets/visuals/dont-gradient.jpg, assets/visuals/dont-3d.jpg, assets/visuals/dont-stroke.jpg]
  - verdict: dont
    rule: Don't fill the bolt in a different colour, or use more than one colour across the letters.
    exception: None stated in the guidelines.
    visuals: [assets/visuals/dont-fill-bolt.jpg, assets/visuals/dont-multiple-colors.jpg]
  - verdict: dont
    rule: Don't add a separate lightning symbol to the wordmark.
    exception: None stated in the guidelines.
    visuals: [assets/visuals/dont-add-symbol.jpg]
visuals:
  - file: assets/visuals/do-black-on-yellow.jpg
    verdict: do
    caption: Bolt Black wordmark on Lightning Yellow.
  - file: assets/visuals/do-lightgrey-on-black.jpg
    verdict: do
    caption: Light Grey wordmark on Bolt Black.
  - file: assets/visuals/do-black-on-light.jpg
    verdict: do
    caption: Bolt Black wordmark on a light background (Mid Grey).
  - file: assets/visuals/do-yellow-on-photo.jpg
    verdict: do
    caption: Lightning Yellow wordmark over a photograph, placed where it stays legible.
  - file: assets/visuals/dont-rotate.jpg
    verdict: dont
    caption: The wordmark rotated. (Unlabelled in the guidelines.)
  - file: assets/visuals/dont-gradient.jpg
    verdict: dont
    caption: Don't add gradients.
  - file: assets/visuals/dont-3d.jpg
    verdict: dont
    caption: Don't make it 3D.
  - file: assets/visuals/dont-stretch.jpg
    verdict: dont
    caption: Don't stretch it.
  - file: assets/visuals/dont-add-symbol.jpg
    verdict: dont
    caption: A separate lightning symbol added before the wordmark. (Unlabelled in the guidelines.)
  - file: assets/visuals/dont-fill-bolt.jpg
    verdict: dont
    caption: Don't fill the bolt in a second colour.
  - file: assets/visuals/dont-multiple-colors.jpg
    verdict: dont
    caption: Don't use multiple colours across the letters.
  - file: assets/visuals/dont-stroke.jpg
    verdict: dont
    caption: Don't stroke it.
```

## Colors

```yaml
colors:
  lightning-yellow: "#E1FF00"
  bolt-black: "#11190C"
  dark-grey: "#787664"
  mid-grey: "#CAC4B7"
  light-grey: "#F3F1EE"
print:
  lightning-yellow:
    cmyk: "16 0 100 0"
    pantone: "809 U"
    note: "Print in this order of preference: Safety Yellow 13-0630 TN; then Pantone 809 U or 809 C; CMYK 16 0 100 0 as a last resort."
  bolt-black:
    cmyk: "72 59 74 81"
    pantone: "419 C"
  dark-grey:
    cmyk: "51 43 57 13"
    pantone: "403 CP"
  mid-grey:
    cmyk: "21 18 26 0"
    pantone: "P 178-1 U"
  light-grey:
    cmyk: "3 3 4 0"
    pantone: "P 134-9 U"
```

"A handful of neutral warm greys, a deep beautiful Bolt Black and our vibrant hero color Lightning Yellow." These are the primary colours and are used on every piece of Bolt communication in one form or another.

- **Lightning Yellow** {colors.lightning-yellow} is the hero colour.
- **Bolt Black** {colors.bolt-black} is the deep base.
- **Dark Grey** {colors.dark-grey}, **Mid Grey** {colors.mid-grey} and **Light Grey** {colors.light-grey} are the warm neutrals.

**Combining colours.** The guidelines offer these combinations as a starting point: Bolt Black or Dark Grey text on Lightning Yellow; Light Grey or Lightning Yellow text on Bolt Black; Light Grey or Lightning Yellow text on Dark Grey; Bolt Black text on Mid Grey or Light Grey.

```yaml
rules:
  - verdict: dont
    rule: Don't layer bright colours on bright, or dark on dark, where it makes text hard to read.
    exception: None stated in the guidelines.
  - verdict: do
    rule: Make a highlighted word brighter than the rest of its sentence, usually in Lightning Yellow or Light Grey.
```

**Highlights.** A word or phrase may be picked out in a colour brighter than the rest of the sentence, usually Lightning Yellow or Light Grey. Shown: Light Grey text with a Lightning Yellow highlight, on Dark Grey or on Bolt Black.

Two values in the source disagree with themselves and need confirming with Bolt: Lightning Yellow is given as `#E1FF00` but also as RGB 230, 255, 0 (which is `#E6FF00`); Dark Grey is given as `#787664` but also as RGB 124, 122, 106 (which is `#7C7A6A`). The hex values are used above. The logo rules mention secondary colours, but the guidelines define none.

## Typography

```yaml
typography:
  display:
    fontFamily: Agrandir Narrow
    fontWeight: 700
    license: "Pangram Pangram foundry. Licence terms are not stated in the guidelines."
  subline:
    fontFamily: Agrandir Narrow
    fontWeight: 500
    license: "Pangram Pangram foundry. Licence terms are not stated in the guidelines."
  text:
    fontFamily: Inter
    fontWeight: 500
    license: "SIL Open Font License 1.1. Not stated in the guidelines."
```

- **Agrandir Narrow** (by Pangram Pangram) is the one typeface for headlines, in Bold. "Featuring many fine details, moderate contrast and slightly unusual anatomy, the typeface can be a loud and proud hero or a humble supporting actor." Sublines use Agrandir Narrow Medium.
- **Inter** (by Rasmus Andersson) is for body copy, annotations and buttons, wherever text must be clear and digestible rather than expressive. Inter Medium for most text; key words or phrases may be picked out in Inter Semi Bold.

Hierarchy shown in the guidelines: headline in Agrandir Narrow Bold, subline in Agrandir Narrow Medium, body, annotation and button text in Inter. No sizes are given. No fallback fonts are given.

## Imagery

The guidelines' colour chapter shows a page of examples without written rules: portraits of people with Lightning Yellow accessories, a Lightning Yellow billboard photographed from below, a phone held in the hand, a dark tote bag with a small lightning shape, a product dashboard, and a flat illustration of a hand with lightning sparks in Lightning Yellow and greys.

There is no written direction for photography, illustration or icons.

## Applications

The guidelines show the logo and type on a billboard, a poster, a phone screen, a tote bag and a product dashboard, but give no per-channel rules.

```yaml
visuals:
  - file: assets/visuals/do-logo-primary.jpg
    verdict: do
    caption: The logo as the large primary element of a billboard, with a short headline above it.
  - file: assets/visuals/do-logo-secondary.jpg
    verdict: do
    caption: The logo small and secondary under a large headline, with a Lightning Yellow highlight on the key words.
```

## Gaps in the source

What an agent would have to guess, because the January 2024 guidelines do not say:

- Positioning, audience and what Bolt is not.
- What each tone-of-voice principle means in practice, and any before-and-after examples.
- A tagline, one-liner or boilerplate designated as such.
- Evidence for the claims in the specimen copy.
- Words to use and to avoid, and how to write product names.
- Colours described in words (for image models), and the secondary colours the logo rules mention.
- Which logo colourway is the default.
- Font fallbacks and verified licences.
- Photography, illustration and icon direction, and any motion.
- The logo artwork itself: the three files under `assets/logo/` must be added from Bolt's official assets.
