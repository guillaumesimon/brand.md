---
version: alpha
name: Lanternfish Product
description: Visual system for the scheduling and paging web app.
brand: ../BRAND.md
colors:
  primary: "#F2B33D"
  on-primary: "#0B1F2A"
  surface: "#0B1F2A"
  on-surface: "#F3F1EA"
  surface-container: "#12303F"
  outline: "#2B4654"
  error: "#E5484D"
  on-error: "#FFFFFF"
typography:
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.2
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  data-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: 4px
  md: 8px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: 12px
  card:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
  page-firing:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-error}"
  divider:
    backgroundColor: "{colors.outline}"
  page:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
---

## Overview

This design system expresses the [Lanternfish brand](../BRAND.md) for the authenticated web app. It is a ship's watch log made operable: a dark, dense rota that someone can read half-awake, with one amber light showing who has the watch now.

Brand colours are mirrored here by value and given a role:

| Role | Brand colour | Value |
|---|---|---|
| `surface` | Abyss (required) | `#0B1F2A` |
| `primary` | Lure (required) | `#F2B33D` |
| `on-surface` | Foam | `#F3F1EA` |

`surface-container`, `outline` and `error` are designed here and are not brand colours.

## Colors

- **Surface** {colors.surface} is the whole app. There is no light theme.
- **Primary** {colors.primary} marks the current watch and the single primary action on a screen.
- **Error** {colors.error} means a page is firing and unacknowledged. It is used for nothing else.

## Typography

Headlines in Space Grotesk, reading text in Inter, and every name, time and count on a rota in JetBrains Mono so columns align.

## Voice & Content Strategy

Voice and vocabulary follow BRAND.md. In the interface specifically:

- **Button labels** name the outcome: "Take the watch", "Hand over", "Acknowledge".
- **Times** always show the viewer's time zone abbreviation.
- **Errors** say what failed and what is still safe.

## Do's and Don'ts

- Do keep one primary-coloured element per screen.
- Don't use the error colour for warnings, deletions or emphasis.
