---
name: abbvie-block-library
description: Reference guide for the 22 AbbVie block types and 47 variations identified across 6 brand sites (SkyriziHCP, RinvoqHCP, Rinvoq DTC, Linzess, Venclexta, Mavyret). Maps AEM Platform C (abbv-*) components to EDS blocks with DOM selectors, CSS requirements, and brand-specific patterns. Use when building, styling, or migrating any block that exists on AbbVie brand sites.
---

# AbbVie Block Library

Reference for all blocks and variations identified from the Analysis report at `/workspace/Analysis/page-analysis-report.html`. All source sites use **AEM Platform C** with `abbv-*` class prefix.

## Related Skills

- **building-brand-blocks**: Use to implement block CSS with brand/theme override support
- **building-brand**: Use to scaffold a new brand with token/style structure
- **abbvie-design-tokens**: Use for brand color, font, and spacing token details
- **abbvie-isi-migration**: Use specifically for ISI/safety bar block implementation
- **building-blocks**: Use for general EDS block development patterns

---

## Critical Blocks (All 6 Brands)

### 1. Hero Block (6 variations)
**Source selectors:** `.abbv-background-container` + `.hero-home` / `.hero` / `.container_hero`
**EDS mapping:** `Section (style: hero)` with background image via Section metadata + H1 + paragraph + CTA

| Variation | Selector | EDS Style | Brands |
|---|---|---|---|
| Image Swap | `.abbv-background-container-image-swap-bg` | `hero` | All 6 |
| Video BG | `.abbv-background-container-video-bg` | `hero, video` | RinvoqHCP, Mavyret |
| Full-width | `.venclexta-question-hero-fullwidth` | `hero, full-width` | Venclexta |
| Tall | `.cll-question-hero-tall` | `hero, tall` | Venclexta |
| Home | `.hero-home` | `hero, home` | All 6 |
| Interior | `.hero-disclaimer-interior` | `hero, interior` | All 6 |

**CSS requirements per brand:**
- **Skyrizi**: Teal overlay, Red Hat Display font, gold CTA button
- **Rinvoq**: Plum overlay, Graphik Bold font, pill CTA buttons
- **Linzess**: Dark purple overlay, Bebas Neue 56px heading (largest), orange CTA
- **Venclexta**: Teal-dark container, Graphik + Red Hat Display mix
- **Mavyret**: Radial gradient (`radial-gradient(at 50% 100%, rgb(81,98,142), rgba(7,29,73,0.9) 65%)`), Univers Condensed

### 2. ISI Block (3 variations)
See skill: `abbvie-isi-migration` for full implementation details.

### 3. Accordion Block (5 variations)
**Source selectors:** `.abbv-accordion` + `.abbv-accordion-blade`

| Variation | Selector | EDS Block | Brands |
|---|---|---|---|
| Single-expand | `.abbv-accordion-single` | `Accordion` | All 6 |
| Multi-expand | `.abbv-accordion-multi` | `Accordion (multi)` | All 6 |
| FAQ | `.abbv-accordion-multi` (grouped) | `Accordion (faq)` | Linzess, Rinvoq DTC |
| Fiesta | `.accordion-fiesta` | `Accordion (fiesta)` | Mavyret, RinvoqHCP |
| White BG | `.accordion-white-bg` | `Accordion (white)` | Venclexta |

### 4. Cards / CTA Block (6 variations)
**Source selectors:** `.abbv-stretched-card-body`, `.cta--card`, `.cta--wide`

| Variation | Selector | EDS Block | Brands |
|---|---|---|---|
| Feature (stretched) | `.abbv-stretched-card-body` | `Cards` | All 6 |
| Wide CTA | `.cta--wide` | `Cards (wide)` | All 6 |
| 2-column | `.two-column-cta` | `Cards (2-col)` | Various |
| Phone CTA | `.cta--phone` | `Cards (phone-cta)` | Mavyret |
| Image CTA | `.image-cta` | `Cards (image-cta)` | Mavyret |
| Yellow border | `.venclexta-gray-yellow-border-call-out` | `Cards (download)` | Venclexta |

---

## High Priority Blocks (4+ Brands)

### 5. Tabs Block (5 variations)
**Source selectors:** `.abbv-tabs`, `.abbv-tab-control`

| Variation | EDS Block | Brands |
|---|---|---|
| 2-tab | `Tabs` | Skyrizi, Venclexta |
| 3-tab | `Tabs (3)` | Mavyret |
| Study tabs | `Tabs (study)` | Skyrizi |
| Transparent BG | `Tabs (transparent)` | Venclexta |
| Grey BG | `Tabs (grey)` | Venclexta |

### 6. Image-Text Block (4 variations)
**Source selectors:** `.abbv-image-text-v2`, `.abbv-image-swap`
**EDS mapping:** Default content (Section with image + text) — NOT a block table.

### 7. Modal Block (5 variations)
**Source selectors:** `.abbv-modal`, `.abbv-exit-modal`
- Exit intent: Auto-detect external links in `scripts.js`
- Study design: `Modal (study-design)` block table
- Contact: Fragment reference
- NPI Lookup: Custom form block
- External link: Warning modal

### 8. Video / Embed Block (2 variations)
**Source selectors:** `.abbv-video-container`, `.abbv-video-player`
- Background: Section metadata with video URL
- Inline: `Embed` block with Brightcove/YouTube URL

---

## Medium Priority Blocks

### 9. Formulary Lookup (2 variations) — Skyrizi, RinvoqHCP, Mavyret
- Zip code variant: `.abbv-formulary-zipcode`
- State dropdown: `.abbv-formulary-dropdown`
- Requires: API integration + reCAPTCHA

### 10. Before-After Gallery (2 variations) — Skyrizi, Rinvoq DTC
- Week toggle with patient thumbnails
- Interactive drag slider with body-part selectors

### 11. Data Table (4 variations) — RinvoqHCP, Linzess, Mavyret
- Lab monitoring, clinical data, AE comparison, insurance

### 12. Iconic Callout (3 variations) — Skyrizi, RinvoqHCP, Linzess, Mavyret
- 3-col, 4-col, CTA-at-bottom
- EDS: `Columns` block or `Cards (icon)` block

---

## Low Priority / Brand-Specific Blocks

### 13. Jump Link Nav — RinvoqHCP, Linzess
### 14. Brand Explorer — HCP sites only
### 15. AEM Adaptive Form — Linzess only
### 16. Patient Profile Tabs — RinvoqHCP only
### 17. Factoid — Mavyret only
### 18. Contact Column — Venclexta only
### 19. Download Cards — RinvoqHCP, Venclexta

---

## Cross-Brand DOM Selector Quick Reference

| Category | Key Selectors |
|---|---|
| Layout | `.abbv-background-container`, `.abbv-flex-container`, `.abbv-container`, `.abbv-row-container` |
| Header | `.abbv-header-v2`, `.abbv-header-v2-lite`, `.abbv-sticky` |
| Footer | `.abbv-footer`, `.abbv-footer-horizontal` |
| ISI | `.abbv-safety-bar`, `.abbv-inline-use-isi`, `.abbv-floating-isi-v2` |
| Image | `.abbv-image-text-v2`, `.abbv-image-swap` |
| Accordion | `.abbv-accordion`, `.abbv-accordion-single`, `.abbv-accordion-multi` |
| Tabs | `.abbv-tabs`, `.abbv-tab-control` |
| Cards | `.abbv-stretched-card-body`, `.cta--card`, `.cta--wide` |
| Modal | `.abbv-modal`, `.abbv-exit-modal` |
| Form | `.abbv-formulary`, `.abbv-formulary-zipcode` |
| Typography | `.abbv-rich-text-common`, `.abbv-eyebrow` |
| Video | `.abbv-video-container`, `.abbv-video-player` |
| Nav | `.abbv-brand-explorer-global`, `.abbv-jump-link` |
