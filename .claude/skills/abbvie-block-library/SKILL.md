---
name: abbvie-block-library
description: Reference guide for the 22 AbbVie block types and 47 variations identified across 6 brand sites (SkyriziHCP, RinvoqHCP, Rinvoq DTC, Linzess, Venclexta, Mavyret). Maps AEM Platform C (abbv-*) components to EDS blocks with DOM selectors, CSS requirements, and brand-specific patterns. Use when building, styling, or migrating any block that exists on AbbVie brand sites.
---

# AbbVie Block Library

Reference for all blocks and variations identified from the Analysis report at `/workspace/Analysis/page-analysis-report.html`. All source sites use **AEM Platform C** with `abbv-*` class prefix.

## Related Skills

- **abbvie-block-analysis**: Use for per-block xwalk model fields, Row Mapping
  tables, cell counts, and authoring rules. This skill (block-library) tells
  you WHICH block to use; block-analysis tells you HOW to author it.
- **abbvie-page-templates**: Use for page-level composition recipes (which
  blocks in what order for each page archetype)
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

---

## Platform-C → EDS Block Mapping

When migrating from a Platform-C source (rinvoqhcp.com, skyrizihcp.com, etc.),
use this table to identify the correct EDS block from the live source's DOM
class. Always confirm by reading the rendered HTML structure — class names
are hints, not contracts.

### Layout & Structure

| Platform-C class on live | EDS block | Notes |
|---|---|---|
| `.abbv-background-container` | (section wrapper) | Not a block — applies section style options like `section-bg-brushstroke` |
| `.abbv-flex-container` | `columns` or `flexbox` | Check for column-count classes |
| `.abbv-container` | (section wrapper) | Maps to `.section` container; class names diverge |
| `.abbv-row-container` | `columns` | Multi-column row |
| `.resource-container--gold` | (section variant) | Section style option for gold-themed resource sections |
| `.section-bg-brushstroke` | (section variant) | Brushstroke background SVG — download asset, apply via brand global CSS |
| `.gradient--white-glacier` | (section variant) | White → glacier gradient — section style option |

### Header / Footer / Nav

| Platform-C class on live | EDS block | Notes |
|---|---|---|
| `.abbv-header-v2`, `.abbv-header-v2-lite` | `header` (fragment) | Load via `nav: /path` page metadata; per-condition headers common |
| `.abbv-sticky` | (header behavior) | Sticky scroll — base header.js handles |
| `.abbv-footer`, `.abbv-footer-horizontal` | `footer` (fragment) | Load via `footer: /path` page metadata; typically shared |
| `.abbv-brand-explorer-global` | `brand-explorer` | HCP sites only; hoisted above header at runtime |
| `.abbv-jump-link` | `section-nav` or `anchor-nav` | Anchor nav for in-page navigation |
| `.abbv-nav-active` | (active state) | Active nav class — do NOT rename; brand block-config sets active by URL prefix |
| `.siteIndication` | (header content) | Indication paragraph next to logo on HCP pages; authored in fragment |

### Hero / Content / Layout

| Platform-C class on live | EDS block | Notes |
|---|---|---|
| `.abbv-image-text-v2`, `.abbv-image-swap` | `image-text` or `hero` | Hero variant for landing; image-text for body sections |
| `.abbv-rich-text`, `.abbv-rich-text-common` | `rich-text` or `text-container` | Use `text-container` for variants (boxed-warning, indication, references) |
| `.abbv-eyebrow` | (typography) | Eyebrow text inside `hero` block's `eyebrow` field |
| `.abbv-stretched-card-body` | `cards-grid` | Card grid with stretched body content |
| `.cta--card`, `.cta--wide` | `cta` (variants) | Different `classes_style` values: card, wide |
| `.abbv-accordion`, `.abbv-accordion-single`, `.abbv-accordion-multi` | `accordion` | `classes_allowMultipleOpen: false` for single, `true` for multi |
| `.abbv-tabs`, `.abbv-tab-control` | `tabs` | Tab control = tab nav; tabpanel content per tab item |
| `.abbv-flex-container--three-col` | `cards-grid` or `columns` | 3-column grid pattern |

### ISI / Safety / Indication

| Platform-C class on live | EDS block | Notes |
|---|---|---|
| `.abbv-safety-bar` | `safety-bar` (fragment) | Floating ISI; shared fragment per brand section |
| `.abbv-safety-bar-maximized`, `.abbv-safety-bar-content-maximized` | (state class) | Expanded state — local class diverges (`safety-bar-full-content`); do NOT rename |
| `.abbv-inline-use-isi` | `text-container` variant `isi` | Inline ISI section |
| `.abbv-floating-isi-v2` | `safety-bar` | Floating safety bar v2 variant |
| `.rinvoq-isi-black-bg`, `.skyrizi-isi-blue-bg` | `text-container` variant `boxed-warning` | Boxed Warning — regulatory visual treatment required |
| `.abbv-rich-text.generic-isi` | `text-container` variant `isi` | Generic ISI section |
| `.abbv-rich-text.rnvq-custm-isi-sec*` | `text-container` variant + custom class | Custom ISI subsection styling |

### Forms / Interactive

| Platform-C class on live | EDS block | Notes |
|---|---|---|
| `.abbv-formulary`, `.abbv-formulary-zipcode` | `formulary-lookup` | Insurance / formulary tool; brand-aware data |
| `.abbv-modal`, `.abbv-exit-modal` | `modal` | Exit modal: regulated copy; base block handles focus trap |
| `.abbv-dismissible` | `dismiss` or `dismissible` | Dismissable banner; check JS behavior |
| `.abbv-tooltip` | `tooltip` | Inline footnote tooltip |
| `.abbv-poll` | `quick-poll` | Interactive poll |

### Media

| Platform-C class on live | EDS block | Notes |
|---|---|---|
| `.abbv-video-container`, `.abbv-video-player` | `video` or `brightcove-video` | Check if Brightcove (look for `accountId` / `videoId` in DOM); use `brightcove-video` for Brightcove embeds |
| `.brightcove-podcast-player` | `brightcove-podcast-player` | Podcast embed |
| `.abbv-image-compare` | `image-compare` | Before/after slider |
| `.abbv-hotspot` | `hotspot` | Interactive hotspot overlay |
| `.abbv-parallax` | `parallax` | Parallax scroll background |

### Tables & Clinical

| Platform-C class on live | EDS block | Notes |
|---|---|---|
| `.abbv-table`, `.abbv-data-table` | `table` | Use semantic `<th scope>`; for dosing/lab tables |
| `.abbv-clinical-data` | `clinical-data-panel` | Structured clinical data (mavyret, skyrizi-hcp brands) |
| `.abbv-fact-card`, `.abbv-iconic-callout` | `fact-card` | Large display number + description |
| `.abbv-info-tree` | `info-tree` | Hierarchical info display |

### Other

| Platform-C class on live | EDS block | Notes |
|---|---|---|
| `.abbv-breadcrumb` | `breadcrumb` | Breadcrumb trail |
| `.abbv-carousel`, `.abbv-carousel-slider` | `carousel` or `carousel-video-playlist` | Video playlist if videos inside |
| `.abbv-story-card`, `.abbv-patient-story` | `story-card` or `story-cards` | Single = story-card; grid = story-cards |
| `.abbv-quote`, `.abbv-pull-quote` | `quote` | Pull quote / testimonial |
| `.abbv-banner-ad`, `.abbv-gpt-ad` | `banner-ad` | GPT ad-unit |
| `.abbv-press-release` | `press-releases` | Press release listing |
| `.abbv-news-feed` | `news-feed` | News article feed |
| `.abbv-social-media` | `social-media` | Social media icon links |
| `.abbv-separator`, `.abbv-divider` | `separator` | Section divider |

### Class-name divergence reminder

Platform-C uses `abbv-*` prefix; EDS uses block-name as class. Examples:
- Live `.abbv-safety-bar-maximized` → Local `.safety-bar.safety-bar-full-content`
- Live `.abbv-container` → Local `.section` (with section style classes)
- Live `.abbv-nav-active` → Local `.header [aria-current="page"]` or `.active`

**Match visual + behavioral outcome, NOT class names.** This is enforced
by `aemcoder-migration-orchestrator` hard rule A.2.

### How to identify a block from live source DOM

1. Find the wrapping container with `abbv-*` class.
2. Look up the class in the table above.
3. Confirm by reading the rendered DOM structure (count of children,
   inner classes, content shape).
4. Cross-reference with `abbvie-block-analysis` for the per-block model
   fields to author.
5. If the class isn't in the table, scan for similar patterns; flag
   genuinely new patterns to add to this skill.
