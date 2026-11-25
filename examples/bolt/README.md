# Bolt (real-world example)

**Unofficial.** This folder is a worked example of the BRAND.md format, not a Bolt document. It is not made, reviewed or endorsed by Bolt. The Bolt name, logo and imagery belong to Bolt.

[`BRAND.md`](BRAND.md) transcribes Bolt's brand guidelines dated January 2024 (19 pages: tone of voice, logo, colour, typography). Nothing was added that the guidelines do not say. The images in `assets/visuals/` are crops of the guidelines' own pages.

It is here to show what a real brand guideline looks like in the format, including what such guidelines usually leave out.

## What the linter says, and why

```bash
node src/cli.js lint examples/bolt/BRAND.md --format text
```

- **3 errors:** the three logo files in `assets/logo/` are not included. The guidelines are a PDF, and the official artwork is not reproduced here.
- **3 notes on personality:** the guidelines name three tone-of-voice principles (thoughtfully concise, knowingly playful, comfortably at ease) and never say what they mean.
- **3 notes on licences:** the guidelines do not state font licences.

The file ends with a list of what the guidelines do not cover: positioning, audience, vocabulary, motion, imagery direction, a designated tagline, and evidence for the claims in their sample copy.
