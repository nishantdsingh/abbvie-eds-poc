# Why Linzess Page Migration Plan

## Overview

Migrate https://www.linzess.com/why-linzess to AEM Edge Delivery Services on the `linzess-migration` branch, using the same approach and lessons learned from the homepage migration.

## Status: READY FOR EXECUTION

This plan has been reviewed. To begin implementation, switch to Execute mode. The first step is to scrape and analyze the live why-linzess page to identify all sections, blocks, and content structure.

## Context from Homepage Migration

The homepage migration established:
- Brand-specific tokens in `styles/linzess/tokens.css` (e.g., `--linz-card-heading-size`, `--linz-card-body-size`, etc.)
- Variant-class scoping on blocks to prevent cross-page CSS conflicts
- `object-fit: cover` + `object-position` for image cards
- Section-metadata `style` classes for section-level styling
- Font audit approach: compare computed styles between live and migrated, fix all mismatches
- Build command: `node theme-tools/build-scoped.js --block-name X --brand-name linzess`
- CSS isolation rule: use explicit px values via brand tokens, never shared tokens that teammates can change

## Super Prompt Reference (from chat history)

The super prompt pattern from the previous session defines:
- **Phase A**: Header fixes (already done — solid nav-wrapper bg, `:has()` removal)
- **Phase B**: Section CSS (write `.section.{class}` rules before content)
- **Phase C**: Content authoring (scrape live DOM verbatim, create `.plain.html`)
- **Phase D**: Pixel-fix pass (render at 1440 + 390, compare, consolidate CSS fixes)
- **Phase E**: Final 5% (safety-bar expanded, mobile 390px, accept font rendering variance)

## Execution Steps

**Live URL:** https://www.linzess.com/why-linzess

### Step 1: Scrape & Analyze
- Navigate to live page with Playwright
- Identify all sections, their content, and which blocks map to them
- Document section-metadata classes needed

### Step 2: Section CSS
- Write `.section.{class}` rules in `styles/linzess/themes.css` using brand tokens
- Use variant-class scoping for page-specific elements
- Build scoped CSS

### Step 3: Content Authoring
- Create `content/linzess/why-linzess.plain.html`
- Verbatim content from live DOM
- Section-metadata with correct `style` values

### Step 4: Pixel-Fix
- Render locally, compare with live at 1440px
- Font audit (same approach as homepage — computed style comparison)
- Consolidate CSS fixes

### Step 5: Verification
- Mobile 390px check
- No regression on homepage
- Header + safety-bar correct

## Checklist

- [ ] Scrape and analyze https://www.linzess.com/why-linzess — identify all sections, blocks, content structure
- [ ] Compare with existing block library — determine which blocks are needed and which already have linzess CSS
- [ ] Identify new section-metadata classes needed for this page
- [ ] Write section CSS in `styles/linzess/themes.css` (using brand tokens, scoped selectors)
- [ ] Create content file `content/linzess/why-linzess.plain.html` (or appropriate path)
- [ ] Render locally and compare with live site at 1440px
- [ ] Pixel-fix pass — font sizes, spacing, colors audit (same approach as homepage)
- [ ] Mobile verification at 390px
- [ ] Verify no regression on homepage (`content/linzess/index.plain.html`)
- [ ] Verify header and safety-bar render correctly

## Progress (linzess-migration branch)

### Done & pushed (verified against live computed styles)
- Symptom/timeline card circles → 136px solid `#d9d7f9` (was 140px/60%)
- Symptom-card column gap → 48px; timeline column gap → 60px (were 32px)
- Side Effects "Other side effects" list → no bullets, 14.4px/400, 50px gap; icon 136px
- Side-effects 3-card color sequence verified correct (dark/light/dark, 16px radius) — left as-is
- Added missing `.section.whylinzess-patients` styling (+ 28px mobile heading)
- Symptom cards stack on mobile (section-level specificity-trap override)
- Mechanism/side-effect cards keep icon-left rows on mobile (removed wrong column rule)
- Section-nav themed: dark-purple `#422e83` bar, white Lato 16px/800 links, orange active
- Checkmark bullet SVG inlined as base64 in columns.css / styles.css / themes.css
- Home-page regression checked (no breakage from shared-file edits)

### Publish blocker (AEM 40KB SVG validation) — fix prepared, needs DAM action
- `icon-legs.svg` 53.5KB→15.4KB and `icon-gut-hands.svg` 41.2KB→6.6KB optimized via svgo,
  committed to `icons/`, verified pixel-identical to originals.
- Content repointed to `/icons/` copies for re-sync.
- These are the ONLY oversized images across all Linzess pages (SVG + raster checked).
- To unblock: replace those two SVGs in AEM DAM (`/content/dam/linzess/images/...`) OR
  re-sync the page from repo content, then publish.

### Live reference values (for post-publish pixel pass)
- Hero: H1 Bebas Neue 40px/400 white uppercase, lh 36px; eyebrow Lato 12px/800 white
- Section eyebrow: Lato 12px/800 uppercase purple `#422e83` (+ divider dash); heading Bebas Neue 40px/400
- Symptom & timeline panels: bg `#f4f6fb`, radius 16px, padding `5px 16px 0`
- Mechanism card panel: bg `#f4f6fb`, radius 16px, padding `15px 5px`

### Remaining (needs published EDS render to measure)
- Card padding interaction with overlapping-circle negative margins
- Section-to-section vertical gaps and hero sizing in context
- Brightcove video carousel rendering
- Mobile verification at 390px against the rendered page

### KNOWN publish blocker on OTHER pages (deferred per user — fix when migrating)
`understanding-constipation.plain.html` references 4 oversized SVGs that will
fail AEM's 40KB validation when that page is published:
- `icon-brain-purple.svg` — 109.8KB
- `icon-legs-purple.svg` — 54.1KB
- `icon-legs-white.svg` — 54.0KB
- `icon-tummy-hands.svg` — 41.3KB
Fix the same way: svgo-optimize → commit to `icons/` → repoint content to `/icons/`.

## Hard Rules

1. **No new blocks** — only existing library
2. **Brand tokens for sizes** — `--linz-card-heading-size` etc.
3. **Variant-class scoping** — prevent cross-page conflicts
4. **Never push without permission**
5. **Never merge to develop**
6. **Section-metadata FIRST** — then CSS
7. **No `:has()`, no `!important`**
8. **Targeted build only**
9. **Verbatim pharma content**
10. **CSS isolation** — explicit px via brand tokens, scoped to variant classes
