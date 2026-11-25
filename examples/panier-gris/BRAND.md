---
version: alpha
name: Panier Gris
description: A neighbourhood bakery in Nantes that bakes one batch a day.
language: en
---

# Panier Gris

## Overview

Panier Gris is a bakery on a side street in Nantes that bakes one batch a day and closes when it is gone. It looks and sounds like its own chalkboard: short, handwritten in spirit, today's facts only.

It resembles a market stall's price cards, a baker's order pad, the back page of a parish newsletter. It does not resemble an artisan-lifestyle brand, a patisserie window, or anything with a gold foil stamp.

When nothing here answers the question, say less and say what is true today.

## Positioning

Panier Gris is a bread bakery. Not a patisserie, not a café, not a concept.

Most people in the neighbourhood buy bread at the supermarket on the way home, because the bakeries they remember are closed by then or sell bread baked from frozen dough. Panier Gris does not try to be open late. It bakes once, at a known time, and is honest about running out.

The difference is the single batch. There is no afternoon bake, no held-over stock and no second-day shelf, and the shop says so on the door.

## Audience

People who live or work within a ten-minute walk and pass the shop before eleven. They already believe good bread exists; they doubt it is worth changing their morning for. They do not need bread explained to them, and they dislike being sold to at eight in the morning.

It is not for visitors looking for a destination, and not for anyone who wants a cake decorated.

## Personality

```yaml
personality:
  - is: plain-spoken
    not: blunt
    means: We give the fact first and the reason second, and we never scold a customer for arriving late.
  - is: proud of the work
    not: precious about it
    means: We name the flour and the hours. We do not describe bread with words borrowed from wine.
  - is: local
    not: folksy
    means: We name the street and the mill. We do not put on an accent or a wheat-sheaf drawing.
```

## Voice & Tone

```yaml
voice:
  person: "we for the bakery, you for the reader"
  casing: sentence case everywhere, including headlines
  sentenceLength: under 14 words on average
```

Short sentences. Times as numerals with a colon (7:30). Prices without decimals when they are round. No exclamation marks.

| Instead of | Write | Why |
|---|---|---|
| Indulge in our artisanal sourdough experience! | Sourdough, out at 7:30. | We say what and when. |
| We regret to inform you that we are sold out. | Sold out. Back tomorrow at 7:30. | No ceremony, and always the next time. |
| Our passionate team lovingly crafts every loaf. | Three of us bake. We start at 3:00. | A fact carries the feeling better. |
| Don't miss out on our seasonal special! | Walnut loaf this week. About forty a day. | Scarcity is stated, never used as pressure. |

**Tone by situation**

- **Ordinary day:** what is out and when.
- **Sold out or closed:** the fact, then when we are back. One line of apology at most.
- **Something went wrong** (a bad batch, a wrong order): say what happened, say what we did about it, offer the fix.
- **Good news:** the same voice. We do not get louder.

## Messaging

```yaml
messaging:
  tagline: One batch a day.
  oneLiner: A neighbourhood bakery in Nantes that bakes once a day and closes when the bread is gone.
  boilerplate: >
    Panier Gris is a bakery on rue des Halles in Nantes. It bakes one batch
    each morning from flour milled in Loire-Atlantique and closes when the
    shelves are empty. Three people work there. It opened in 2021.
  pillars:
    - claim: Baked this morning.
      proof: One batch a day, out at 7:30. Nothing is held over to the next day.
    - claim: We know where the flour comes from.
      proof: One mill, 55 km away. Its name is on the bag by the door.
    - claim: When it is gone, it is gone.
      proof: The shop closes when the shelves are empty, most days before 13:00.
  cta:
    primary: Come before eleven
    never: ["Shop now", "Order online", "Discover", "Treat yourself"]
```

The tagline stands alone and is never extended ("One batch a day, every day" is wrong). The one-liner may lose "in Nantes" where the place is already clear. The boilerplate is used whole.

## Claims

```yaml
claims:
  - claim: Flour milled within 60 km of the bakery.
    evidence: Supplier invoices and delivery notes, 2026.
    status: approved
  - claim: Nothing is baked from frozen dough.
    evidence: Stated by the owner; no frozen dough is purchased (purchase ledger, 2021 to 2026).
    status: approved
  - claim: Sold out before 13:00 most days.
    evidence: Till closing times, January to October 2026, 71% of trading days.
    status: review
  - claim: Organic
    evidence: The flour is certified organic; the bakery is not certified.
    status: prohibited
  - claim: The best bread in Nantes
    evidence: None. Superlatives are not ours to award.
    status: prohibited
```

## Vocabulary

```yaml
vocabulary:
  use:
    batch: What we bake in a day. Never "range" or "selection".
    out: Bread is "out" at a time, not "available" or "released".
    Panier Gris: Two words, both capitalised, never abbreviated to PG.
    the shop: How we refer to the premises. Not "the store", not "our boutique".
  avoid:
    artisanal: say what was done by hand
    curated: chosen
    experience: name the thing itself
    passion: say what we actually do
    range: batch
    indulge: eat
```

## Logo

```yaml
logo:
  wordmark:
    file: assets/logo/wordmark.svg
    color: "{colors.slate}"
    backgrounds: ["{colors.flour}"]
    minSize: 96px
    clearSpace: the height of the letter n on every side
  wordmark-reversed:
    file: assets/logo/wordmark-reversed.svg
    color: "{colors.flour}"
    backgrounds: ["{colors.slate}", "{colors.crust}"]
    minSize: 96px
    clearSpace: the height of the letter n on every side
```

The wordmark in Slate on Flour is the default. There is no symbol and no monogram.

Never stretch it, recolour it, outline it, set it on a curve or add a wheat sheaf. Never ask an image model to draw it: generate the image without it and place the file.

## Colors

```yaml
colors:
  crust: "#8A4B1F"
  flour: "#F6F1E7"
  slate: "#3A3D40"
  butter: "#E9C46A"
required: ["{colors.flour}", "{colors.slate}"]
print:
  crust:
    cmyk: "0 46 78 46"
    note: Uncoated stock. Proof against a baked loaf, not a screen.
  slate:
    cmyk: "9 5 0 75"
    note: One-colour jobs (bags, stamps) are printed in Slate only.
  flour:
    cmyk: "0 2 6 4"
    note: On kraft bags, leave unprinted; the paper is the colour.
```

- **Flour** {colors.flour} is the ground: the paper bag, the wall, the page. In words: a warm off-white with a faint yellow cast, like unbleached flour; not cream, not pure white. It covers most of any surface.
- **Slate** {colors.slate} carries all text and the wordmark. In words: a soft dark grey with no blue in it, like a chalkboard wiped clean; not black, not charcoal.
- **Crust** {colors.crust} appears once per piece at most, for the one thing that matters: today's time, a price, a closed notice. In words: a dark baked brown, the colour of a well-fired loaf; not chocolate, not terracotta.
- **Butter** {colors.butter} is optional and rare: a highlight behind a single word. In words: a soft egg-yolk yellow; not gold, not lemon. Never used for text.

No gradients. No colour outside these four.

Butter is never printed. No Pantone references have been chosen yet; the CMYK builds above are starting points to proof, not approved matches.

## Typography

```yaml
typography:
  display:
    fontFamily: Fraunces
    fontWeight: 600
    fallback: Georgia, serif
    license: SIL Open Font License 1.1
    licenseVerified: true
  text:
    fontFamily: Karla
    fallback: system-ui, sans-serif
    license: SIL Open Font License 1.1
    licenseVerified: true
```

**Fraunces** is for the wordmark, headlines and the day's bread names. It should feel like a sign painter's serif, slightly soft. **Karla** is for everything else: times, prices, paragraphs.

Headlines are short enough to fit one line on a phone. Never set a whole paragraph in Fraunces. No italics, no all caps.

## Imagery

### Photography

Hands, trays, the shop at opening time, the queue seen from behind. Daylight from the left, never a flash. Bread is shown whole or torn, not sliced into a fan. People are never posed and never look at the camera.

Recipe: "natural window light, 35mm, shallow depth of field, flour dust visible in the air, warm brown and off-white palette, no props, no text, no logo."

Never: stock smiles, rustic twine, slate serving boards, overhead flat-lays, steam added in editing.

### Illustration

None. Where a drawing seems needed, use a photograph or a sentence.

## Motion

Panier Gris does not move. No animated logo, no video intros, no animated text over photographs. A film of the shop is a single unedited shot with its own sound.

## Applications

### Social

One post a day at most, before 8:00: what is out, and when. One photograph, no carousel. No hashtags beyond the street name. Replies are answered in one sentence.

### Shop signage and bags

Flour ground, Slate type, the wordmark once. The chalkboard is handwritten and is the only place the day's list appears in full.

### Email

Only for orders and closures. Subject lines state the fact ("Closed Monday 11 November"). No newsletter.

## Do's and Don'ts

- **Do** give the time. Every message about bread says when it is out.
- **Do** say when we are back, every time we say we are closed or sold out.
- **Don't** use an exclamation mark. Exception: none.
- **Don't** put the logo on a photograph. Exception: the shopfront, where it is painted on the glass.
- **Don't** use Crust more than once in a piece. Exception: a price list, where every price may be Crust.
- **Don't** describe the bread with adjectives of quality (delicious, amazing, finest). Describe what it is made of and when it was made.
