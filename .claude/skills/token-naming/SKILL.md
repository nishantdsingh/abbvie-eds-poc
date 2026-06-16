---
name: token-naming
description: Token Naming Guide for EDS. Mandatory naming formula, segment definitions, layer examples, intent vs appearance rules, casing, anti-patterns, and responsive token patterns for all CSS custom properties in this project. Reference this skill whenever authoring or reviewing design tokens at any layer (global, semantic, component).
---

# Token Naming Guide — EDS

Use this guide every time you create, rename, or review a CSS custom property in this project. All tokens — global, semantic, and component — must follow this formula.

## Core Formula

```
--{system}-{type}-{category}-{device?}-{attribute}
```

All segments lowercase, hyphen-separated.

---

## Segment Definitions

### `system`
Org or brand namespace. Prevents collisions when multiple token sets coexist.
Keep short: `corp`, `ds`, `acme`

### `type`
Position in the hierarchy:

| Value | Layer | Example |
|---|---|---|
| `global` | Primitives | `--color-red-400` |
| `semantic` | Alias / intent layer | `--corp-semantic-color-primary-bg` |
| `component` | Scoped to one block, defined inside the block's CSS | `--hero-padding-y` |

> For **global** and **component** tokens the type segment is often omitted to keep names concise.
> Use the full `--{system}-semantic-*` pattern for alias tokens where the namespace matters.

### `category`
The design property:

`color` · `spacing` · `typography` · `border` · `shadow` · `motion` · `z-index` · `opacity`

### `device` _(optional)_
Only when the value differs per breakpoint:

`mobile` · `desktop` · `tablet`

### `attribute`
The CSS property the token maps to:

`bg` · `text` · `border` · `border-radius` · `font-size` · `font-family` · `font-weight` · `line-height` · `padding-y` · `padding-x` · `gap` · `shadow`

---

## Examples by Layer

| Layer | Example |
|---|---|
| Global | `--color-red-400`, `--spacing-48`, `--radius-m` |
| Theme | `--brand-primary`, `--brand-font-family`, `--brand-radius-base` |
| Alias | `--color-primary-bg`, `--section-padding-y-mobile`, `--font-family-body` |
| Component | `--hero-padding-y`, `--button-primary-bg`, `--card-border-radius` |

---

## Intent vs Appearance

Token names must describe **intent** (what it does), not **appearance** (what it looks like).
If swapping the brand would make the name misleading, it is named wrong.

| ❌ Appearance | ✅ Intent |
|---|---|
| `--red-button` | `--color-primary-bg` |
| `--light-gray-bg` | `--color-surface-subtle` |
| `--big-text` | `--font-size-heading-lg` |
| `--thin-border` | `--color-border-subtle` |
| `--blue-link` | `--color-link-default` |

---

## Casing

EDS tokens are always **kebab-case** CSS custom properties. No other format is needed — EDS is web-only.

```css
/* Correct */
--color-primary-bg: var(--brand-primary);
--section-padding-y-mobile: var(--spacing-48);

/* Wrong */
--colorPrimaryBg: ...       /* camelCase */
--Color_Primary_Bg: ...     /* mixed */
```

---

## Anti-Patterns

| Anti-pattern | Why it is wrong |
|---|---|
| `--color-hex-fa0f00` | Encodes the raw value — breaks when the value changes |
| `--color1`, `--color2` | Ordinals without a scale — use `--color-red-400` or `--color-primary` |
| Mixed `px` and `rem` across spacing tokens | Pick one unit and use it consistently |
| `--color-brand-primary-dark-hover` (5 segments) | Too deep — simplify to ≤ 4 segments |
| `--abbvie-color-primary`, `--botox-color-primary` | Brand name in alias layer — the alias layer is shared; only the brand token layer changes per brand |

---

## Layer Architecture

```
styles/tokens.css                          ← Global primitives   --color-red-400, --spacing-48
styles/{brand}/_tokens.css                 ← Brand theme layer   --brand-primary, --brand-font-family
styles/{brand}/themes/{t}/_tokens.css      ← Brand+theme layer

blocks/{block}/{block}.css                 ← Component tokens    --hero-padding-y, --card-border-radius
```

The **alias layer** (`--color-primary-bg`, `--section-padding-y-mobile`) lives in global tokens or brand tokens depending on whether it is shared or brand-specific. It always maps a semantic name to a primitive.

---

## Responsive Token Pattern

When a value differs by breakpoint, create a `-mobile` / `-desktop` pair in the alias layer — not a raw value inside each media query.

```css
/* styles/tokens.css or styles/{brand}/_tokens.css */
:root {
  --section-padding-y-mobile:  var(--spacing-48);
  --section-padding-x-mobile:  var(--spacing-16);
  --section-padding-y-desktop: var(--spacing-96);
  --section-padding-x-desktop: var(--spacing-32);
}
```

Blocks consume both via component tokens and a media query:

```css
/* blocks/my-block/my-block.css */
.my-block {
  --block-padding-y: var(--section-padding-y-mobile);
  --block-padding-x: var(--section-padding-x-mobile);
}

@media (min-width: 900px) {
  .my-block {
    --block-padding-y: var(--section-padding-y-desktop);
    --block-padding-x: var(--section-padding-x-desktop);
  }
}

.my-block {
  padding: var(--block-padding-y) var(--block-padding-x);
}
```

---

## Quick Reference

```
Global primitive   --color-red-400
                     ↑      ↑   ↑
                  category name scale

Alias              --color-primary-bg
                     ↑       ↑     ↑
                  category intent attribute

Responsive alias   --section-padding-y-mobile
                     ↑        ↑       ↑   ↑
                  system   category attr device

Component token    --hero-padding-y
                     ↑     ↑      ↑
                   block category attribute
```

---

## Token Audit Checklist

Before committing any CSS file with custom properties:

- [ ] Every token follows `--{category}-{intent}-{attribute}` (or full formula when system prefix is needed)
- [ ] No appearance-based names (colors, ordinals, raw values in the name)
- [ ] No brand or theme name embedded in alias tokens
- [ ] Responsive pairs use `-mobile` / `-desktop` suffix — no magic numbers inline
- [ ] No more than 4 segments in any token name
- [ ] All spacing uses the same unit (px or rem — not mixed)
- [ ] Component tokens are defined inside the block's own CSS, not in global tokens
