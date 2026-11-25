# Bolt (real-world example)

**Unofficial.** This folder is a worked example of the BRAND.md format, not a Bolt document. It is not made, reviewed or endorsed by Bolt. The Bolt name, logo and imagery belong to Bolt.

[`BRAND.md`](BRAND.md) shows a real brand in the format: a wordmark-only logo in three colourways with its misuse examples, five colours with full print values, two typefaces, and copy that makes claims needing evidence.

## What the linter says, and why

```bash
node src/cli.js lint examples/bolt/BRAND.md --format text
```

- **3 errors:** the three logo files in `assets/logo/` are not included. The official artwork is not reproduced here.
- **3 notes on personality:** the three principles (thoughtfully concise, knowingly playful, comfortably at ease) are named without saying what each one rules out or changes.
- **3 notes on licences:** no typeface licence is marked as verified.

Positioning, audience, vocabulary and motion are listed as not yet defined.
