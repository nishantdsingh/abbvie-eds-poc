---
name: abbvie-page-templates
description: Page-type composition recipes for the AbbVie commercial pharma EDS multi-brand project. Each recipe lists the canonical block sequence, section variants, fragment references, and metadata for a specific pharma page archetype — homepage, condition landing, dosing & lab monitoring, real patients, and head-to-head efficacy comparison. Use this skill when STARTING migration of a new page to decide which blocks to use and how to compose them, before invoking aemcoder-migration-orchestrator. Trigger phrases include "page template", "page recipe", "what blocks for {page-type}", "compose {page-type} page", "homepage recipe", "dosing page structure", "real patients page", "H2H comparison page", "condition landing page".
---

# AbbVie Page Templates — Composition Recipes

Per-page-type composition cookbook for commercial pharma brand sites. Tells
you WHICH blocks compose each page archetype, in WHAT ORDER, with WHAT
SECTION VARIANTS — but not block field details (those live in
`abbvie-block-analysis`) or compliance rules (those live in
`pharma-content-fidelity`).

Use this BEFORE invoking aemcoder. The recipe constrains aemcoder's block-fit
decisions and prevents ad-hoc composition mistakes.

## Related skills

- **abbvie-block-analysis** — per-block xwalk model fields and Row Mapping
- **abbvie-block-library** — brand × block usage matrix, Platform-C DOM selectors
- **aemcoder-migration-orchestrator** — invoke AFTER picking the template
- **pharma-content-fidelity** — content rules layered onto every regulated block
- **abbvie-design-tokens** — brand tokens consumed by template CSS
- **aemcoder-section-fix-loop** — per-section repair after template applied

## When to use this skill

Trigger this skill when:
- Starting migration of a NEW page (before aemcoder kickoff)
- Asking "what blocks should this page use?"
- Asking "how does the H2H comparison page typically compose?"
- Reviewing aemcoder's proposed section list and want to verify the
  composition matches an established template
- Designing a page that doesn't fit standard recipe — fall back to
  "Custom / Hybrid" guidance at the end

## How to use the recipes

For any new page:

1. **Identify which archetype it is** (homepage / condition landing /
   clinical / testimonial / comparison / hybrid).
2. **Read that recipe** for the canonical block sequence + section variants.
3. **Verify against live source** — does the actual page match the recipe?
   If yes, follow the recipe. If no, note deviations and either find a
   closer recipe or treat as "Custom / Hybrid".
4. **Hand the recipe + page-specific deltas to aemcoder** via
   `aemcoder-migration-orchestrator/templates/first-prompt.md` (paste the
   relevant recipe into the "Section 1 Mission" or "block-fit hypotheses"
   area).

## Procedural rule P1: section-metadata FIRST, then CSS (AEMCODER-019)

**For every Custom/Hybrid page section and every non-standard section in any
archetype:** introduce a section-metadata `style` or `style_*` class BEFORE
writing any CSS. This is a hard procedural rule.

### CRITICAL: section uses `style_*`, blocks use `classes_*` (AEMCODER-023)

Sections and blocks have DIFFERENT property-name conventions for md2jcr:

| Layer | Property name prefix | Example |
|---|---|---|
| **Section** (Section Metadata block) | `style` (multiselect) / `style_*` (dynamic-picklist, etc.) | `style_customDynamicClass`, `style_container` |
| **Block** (in a block's model fields) | `classes_*` | `classes_textAlign`, `classes_customClass`, `classes_iconType` |

Using `classes_*` for SECTION fields → md2jcr does NOT apply the class to
the `<section>` wrapper. This is the root cause of pages where custom
section classes "didn't take effect" silently.

### Primary recommended form: `style_customDynamicClass`

**Use `style_customDynamicClass` (dynamic-picklist) as the PRIMARY form**
for section class authoring. This is the canonical reviewer-approved
pattern matching the reference JCR convention.

```
+---------------------------+------------------------------------+
| Section Metadata                                               |
+---------------------------+------------------------------------+
| style_customDynamicClass  | content-wide,medium-radius         |
+---------------------------+------------------------------------+
```

In `.plain.html` div-table form:

```html
<div class="section-metadata">
  <div><div>style_customDynamicClass</div><div>content-wide,medium-radius</div></div>
</div>
```

**Hard rules for the value:**
- **Comma-separated, NO SPACES.** `content-wide,medium-radius` ✓.
  `content-wide, medium-radius` (with spaces) is wrong — md2jcr stores
  the literal string, so spaces become part of class names.
- Works for any number of classes (1, 2, 3+) — single class also works
  via this form.

### Secondary form: `style` (multiselect)

The section model also has a `style` field (multiselect with predefined
options). Use this when authoring with a fixed picklist via UE:

```
+----------------------------------+
| Section Metadata                 |
+--------+-------------------------+
| style  | highlight               |
+--------+-------------------------+
```

⚠️ The reviewer convention is to prefer `style_customDynamicClass` over
`style` because the dynamic-picklist accepts project-specific class
names that won't be in the fixed multiselect options.

### REQUIRED: `blockModelId` for non-default section types

For ANY non-default section model (`grid-section`, `grid-container`,
or any custom section type beyond the basic `section` model), the
Section Metadata MUST include ALL 5 of these rows:

```
+---------------------------+----------------------------------------------+
| Section Metadata                                                         |
+---------------------------+----------------------------------------------+
| blockModelId              | grid-section                                 |
+---------------------------+----------------------------------------------+
| style_container           | grid-section                                 |
+---------------------------+----------------------------------------------+
| name                      | Grid Section                                 |
+---------------------------+----------------------------------------------+
| style_customDynamicClass  | grid-section,grid-cols-8                     |
+---------------------------+----------------------------------------------+
| language                  | none                                         |
+---------------------------+----------------------------------------------+
```

Without `blockModelId`, md2jcr uses the default `section` model — even
if you're authoring a grid-section, the JCR output will lack the
grid-specific fields. Confirmed by smoke test against md2jcr CLI:
omitting `blockModelId` produces `model="section"` instead of
`model="grid-section"`.

All 5 rows required:
- **`blockModelId`** — names the section model (e.g. `grid-section`,
  `grid-container`)
- **`style_container`** — typically same as `blockModelId`; carries
  forward as a section class
- **`name`** — display name (e.g. `Grid Section`)
- **`style_customDynamicClass`** — comma-separated section classes
  (NO SPACES)
- **`language`** — locale, often `none` for cross-locale sections

### For the default `section` model

If you're using the plain `section` model (not grid-* or any custom),
`blockModelId` is optional. The minimal form is just:

```
+---------------------------+------------------------------------+
| Section Metadata                                               |
+---------------------------+------------------------------------+
| style_customDynamicClass  | hero-section,content-wide          |
+---------------------------+------------------------------------+
```

### Then write CSS

```css
.section.access-hero-section .hero { ... }
.section.access-hero-section .cards-grid { ... }
.section.grid-container.content-regular.light-grey { ... }
```

Run `npm run scaffold:build:block --block-name X --brand-name {brand}`
(single block, single brand — never the unscoped `scaffold:build`).

### Forbidden selectors in `styles/{brand}/_styles.css`

**Per AEMCODER-019, do NOT write:**

- `:has()` selectors targeting block classes —
  `.section.hero-container:has(.hero.access-hero)` is forbidden.
- `body:has(.hero.access-hero) ...` — forbidden.
- Bare block selectors — `.cards-grid ...`, `.text-container ...`,
  `.hero ...` — forbidden (these affect every page using that block).
- Auto-generated section classes that match generic block names — selectors
  like `.section.hero-container ...` are forbidden because every page with
  a hero gets that auto-class. Use your authored style-class instead.

**Always write:**

- `.section.<unique-style-class> .<block-class> ...` — scoped, predictable.
- `.section.<unique-style-class> > div.<block-class> ...` — child combinator
  if needed for specificity over base block CSS.
- `body.page-<slug> ...` — only when section-metadata isn't possible
  (rare; section-metadata should cover ~all cases).

This rule is also enforced by the orchestrator's CSS Selector Scope Check
(AEMCODER-018 prevention) — generic block selectors are refused at
edit time.

## AEMCODER-023: Section custom class must use `style_*` not `classes_*`

**The failure:** Authored a section with `classes_customDynamicClass` in
the Section Metadata block. md2jcr did NOT apply the class to the
`<section>` wrapper. Page rendered without the intended section styling.

**Root cause:** md2jcr treats Section Metadata as a special block that
maps to section-level properties. The canonical property name prefix for
section styling is `style_*` (not `classes_*`). Section Metadata rows
with `classes_*` keys are silently ignored or routed to the wrong place.

**Distinction:**
- **BLOCK fields** (inside a `<div class="block">` table) — use `classes_*`.
  These map to the BLOCK element's class attribute (e.g. `<div class="hero
  classes_textAlign-center">`).
- **SECTION fields** (inside the `<div class="section-metadata">` table)
  — use `style` (single) or `style_*` (multiple keys). These map to the
  `<section>` wrapper's class attribute.

**Prevention:**
- All section-level custom class fields in `models/_section.json` should
  be named `style_*` not `classes_*`.
- Authored Section Metadata tables should use `style` / `style_customDynamicClass`
  / `style_container` etc., never `classes_*`.
- When asking aemcoder to author a section style class, specify the
  property as `style` or `style_*` in the prompt.

---

# Page archetype 1: Homepage (brand entry)

**Examples across the 6 commercial pharma brands:**
- rinvoqhcp.com (HCP)
- skyrizihcp.com (HCP)
- rinvoq.com (DTC)
- linzess.com (DTC, hash-based nav)
- venclexta.com (HCP, CLL focus)
- mavyret.com (HCP, Univers Condensed)

**Purpose:** Brand entry point. Multi-condition switcher (HCP sites), hero,
key indications, primary CTAs, support resources.

## Canonical section sequence

| # | Block | Section variant / classes | Purpose |
|---|---|---|---|
| 1 | brand-explorer (HCP only) | — | Cross-condition switcher bar above header |
| 2 | header (fragment) | — | Site nav — fragment ref via `nav: /...` metadata |
| 3 | hero | full-width, brand-customized | LCP element, indication preview, primary CTA |
| 4 | cards-grid | `classes` = indication-link variant | 2–4 indication cards (text + chevron, NOT pill buttons) |
| 5 | cards-grid (or columns + cta) | brand variant for value props | 3-up value proposition cards |
| 6 | rich-text or text-container | brand variant `indication` | Indication paragraph (verbatim from live) |
| 7 | cards-grid (glacier / support variant) | section-metadata `style: {brand}-support-section` + `section-bg-brushstroke gradient--white-glacier` | Patient/HCP support resources with pill CTAs |
| 8 | footer (fragment) | — | Footer fragment ref via `footer: /...` metadata |
| 9 | safety-bar (fragment) | sticky bottom | ISI / safety information — shared across all pages |

## Page metadata required

| Key | Value | Notes |
|---|---|---|
| brand | `{brand-key}` | One of: `rinvoq-hcp`, `skyrizi-hcp`, `rinvoq-dtc`, `linzess`, `venclexta`, `mavyret` |
| nav | `/{brand-key}/nav` or similar | Homepage may use brand-default nav |
| footer | `/{brand-key}/footer` | Usually shared across brand pages |
| title | from live `<title>` | Verbatim |
| description | from live meta description | Verbatim |
| og:image | hero image asset | Same image as hero block |
| job-code | from live footer / legal | Brand-specific format (`US-RNQ-`, `US-SKZ-`, `US-LNZ-`, etc.) |

## Key composition rules

- **brand-explorer** is HCP only — DTC homepages skip it
- **Hero is the LCP** — keep it eager, don't lazy-load the image
- **Indication-link cards** have text + chevron; do NOT use pill-button variant
- **Glacier section** needs section-metadata style class + downloaded
  brushstroke SVG asset
- **Single H1** — author it inside hero `text` field
- **Safety-bar fragment** is shared across ALL pages in the brand section

---

# Page archetype 2: Condition Landing

**Examples across brands:**
- rinvoqhcp.com/dermatology, /rheumatology, /gastroenterology
- skyrizihcp.com/psoriatic-arthritis, /plaque-psoriasis
- venclexta.com/cll, /aml
- mavyret.com/treatment (single-condition brand)
- linzess.com/ibs-c, /cic

**Purpose:** Condition-specific entry. Different header than homepage
(condition nav), condition-focused hero, sub-section nav.

## Canonical section sequence

| # | Block | Section variant / classes | Purpose |
|---|---|---|---|
| 1 | brand-explorer (HCP only) | — | Cross-condition bar (same as homepage) |
| 2 | header (fragment) | **DIFFERENT fragment than homepage** | Per-condition nav — e.g. `nav: /{brand-key}/header-{condition}` |
| 3 | hero | condition-themed, often with indication paragraph | Condition-specific hero copy |
| 4 | section-nav | (`linzess`, `rinvoq-hcp`, `skyrizi-hcp` brands have brand customization) | Anchor nav for sub-sections |
| 5 | cards-grid | varied — efficacy / safety / dosing previews | 3–4 cards linking to condition sub-pages |
| 6 | rich-text | indication-statement variant | Condition indication paragraph (verbatim) |
| 7 | text-container | references variant | Footnote references for indication |
| 8 | cards-grid (support variant) | brush section style | Patient/HCP support resources |
| 9 | footer (fragment) | — | Shared brand footer |
| 10 | safety-bar (fragment) | sticky | Shared ISI fragment |

## Key composition rules

- **Per-condition header** is the #1 difference from homepage — verify
- **Active nav state** for current condition via brand `block-config.js`
- **Indication block** is condition-specific
- **section-nav** with anchor IDs for jumps

---

# Page archetype 3: Dosing & Lab Monitoring (clinical reference)

**Examples across brands:**
- rinvoqhcp.com/dermatology/dosing-lab-monitoring
- skyrizihcp.com/psoriatic-arthritis/dosing
- venclexta.com/cll/dosing-administration
- mavyret.com/dosing-and-administration
- linzess.com/hcp/dosing

**Purpose:** Clinical reference. Dosing schedules, lab monitoring,
dose adjustments. Information-dense, table-heavy, footnote-heavy.

## Canonical section sequence

| # | Block | Section-metadata `style` class | Purpose |
|---|---|---|---|
| 1 | brand-explorer (HCP only) | — | Same as homepage |
| 2 | header (fragment) | Per-condition | Same as condition landing |
| 3 | hero | smaller / banner variant — `style: dosing-hero` | Banner hero |
| 4 | section-nav | — | Anchor nav for clinical sub-sections |
| 5 | text-container (boxed-warning variant) | `style: dosing-boxed-warning` | **BOXED WARNING** — visually distinct, regulatory |
| 6 | clinical-data-panel | `style: dosing-data-panel` | Structured dosing presentation |
| 7 | table | `style: dosing-schedule-table` | Dosing schedule — REQUIRES `<th scope>` semantics |
| 8 | accordion | `style: dosing-special-populations` | Special populations / dose adjustments |
| 9 | tabs | `style: dosing-regimen-tabs` | Multi-regimen presentation |
| 10 | fact-card or info-tree | `style: dosing-lab-thresholds` | Key thresholds |
| 11 | tooltip (inline) | — | Footnote markers (¹, ², †) on dosing values |
| 12 | text-container (references variant) | `style: dosing-references` | `<ol>` numbered list — **MUST round-trip** with body markers |
| 13 | text-container (legal variant) | `style: dosing-legal` | Job code, approval/expiration date |
| 14 | footer (fragment) | — | Shared |
| 15 | safety-bar (fragment) | sticky | Shared |

## Key composition rules

- **Clinical accuracy is paramount** — verbatim dosing numbers, lab values
- **Tables need `<th scope="row">` / `<th scope="col">`** — accessibility
- **Footnotes round-trip mandatory** — every superscript ↔ reference entry
- **Boxed Warning is regulatory visual treatment** — see pharma-content-fidelity
- **Anchor IDs on each section** — for section-nav links

---

# Page archetype 4: Real Patients (testimonial)

**Examples across brands:**
- rinvoqhcp.com/atopic-dermatitis/real-patients
- skyrizihcp.com/psoriatic-arthritis/patient-stories
- linzess.com/patient-stories
- rinvoq.com/atopic-dermatitis/patient-experience (DTC)

**Purpose:** Patient testimonial showcase. Video-heavy, story-card-heavy,
consent disclaimer prominent.

## Canonical section sequence

| # | Block | Section variant / classes | Purpose |
|---|---|---|---|
| 1 | brand-explorer (HCP only) | — | Same |
| 2 | header (fragment) | Per-condition | Atopic-dermatitis nav (may differ from /dermatology) |
| 3 | hero | testimonial banner variant | Patient-introduction hero |
| 4 | text-container (disclaimer variant) | — | Consent / model-release disclaimer (verbatim) |
| 5 | story-cards | grid layout | Patient testimonial cards |
| 6 | brightcove-video OR carousel-video-playlist | brand variant | Patient testimonial videos |
| 7 | quote | brand variant | Pull quote from featured patient |
| 8 | cards-grid (support variant) | brush section style | Support resources |
| 9 | text-container (legal/disclaimer) | — | Patient ID, paid testimonial disclosure |
| 10 | footer (fragment) | — | Shared |
| 11 | safety-bar (fragment) | sticky | Shared |

## Key composition rules

- **Brightcove integration** — accountId + videoId verbatim from live DOM
- **Delayed loading** for Brightcove third-party script
- **Transcripts mandatory** for all patient videos (a11y)
- **Consent disclaimer** is regulated copy
- **"Actor portrayal" vs "Real patient"** labels preserved verbatim

---

# Page archetype 5: H2H Comparison (head-to-head efficacy)

**Examples across brands:**
- rinvoqhcp.com/atopic-dermatitis/efficacy/rinvoq-vs-dupixent/level-up
- skyrizihcp.com/psoriatic-arthritis/efficacy/skyrizi-vs-cosentyx
- skyrizihcp.com/plaque-psoriasis/efficacy/skyrizi-vs-humira
- venclexta.com/cll/efficacy (less common — single-arm trials)
- mavyret.com/efficacy (single-arm SVR data)

**Purpose:** Head-to-head efficacy comparison. Chart-heavy, table-heavy,
statistical-significance markers, study design references.

## Canonical section sequence

| # | Block | Section-metadata `style` class | Purpose |
|---|---|---|---|
| 1 | brand-explorer (HCP only) | — | Same |
| 2 | header (fragment) | Per-condition | Same as condition landing |
| 3 | hero | comparison banner | "X vs Y" hero with drug name comparison |
| 4 | section-nav | — | Anchor nav: Primary endpoint / Secondary / Safety / Study design |
| 5 | text-container (disclaimer / study limitations) | — | Verbatim limitations / "non-superiority not tested" |
| 6 | chart | brand variant | Primary endpoint comparison (bar / forest plot) |
| 7 | clinical-data-panel | — | Statistical detail (p-value, CI, n) |
| 8 | tabs | brand variant | Subgroup breakdowns (week 4 / week 12 / week 24) |
| 9 | chart (repeat) | — | Secondary endpoints visualization |
| 10 | table | brand variant for AE table | Adverse events comparison |
| 11 | tooltip (inline) | — | Footnote markers on every chart axis / data point |
| 12 | accordion | brand variant | Study design / methodology grouped |
| 13 | text-container (references variant) | `<ol>` | Reference list — round-trip ALL footnote markers |
| 14 | footer (fragment) | — | Shared |
| 15 | safety-bar (fragment) | sticky | Shared |

## Key composition rules

- **Chart fidelity paramount** — axis labels, legends, error bars,
  statistical-significance markers, footnote anchors. Verbatim.
- **Footnote markers EVERYWHERE** — chart axes, table cells, body copy.
  Every marker must round-trip in the references block.
- **Trademark symbols** (`®`, `™`) preserved verbatim
- **Study limitations / non-inferiority disclaimers** are regulated copy
- **Mobile chart fallback** — verify live source's mobile pattern

---

# Page archetype 6: Custom / Hybrid

For pages that don't match any of the 5 above (e.g. site-map page, contact
page, MOA animation page, copay/savings page, transcript pages, access/coverage):

## Recipe

1. **Identify which archetype(s) it's closest to.** Most pages are hybrids.
2. **Walk through Phase B** of `aemcoder-migration-orchestrator` —
   scrape, section-by-section block-fit, no recipe shortcut.
3. **Always include** these "constant" sections regardless of page type:
   - `brand-explorer` (HCP brand pages only)
   - `header` fragment (per-condition or default)
   - `footer` fragment (shared)
   - `safety-bar` fragment (shared)
   - `brand: {brand-key}` page metadata
4. **Document the custom composition** in your prompt to aemcoder — be
   explicit about which archetype's recipe (if any) inspired the structure.
5. **After completing the migration, consider whether the new page type
   warrants its own recipe** — if you'll migrate 3+ pages of the same
   custom type, write the recipe back into this skill for reuse.

## Hybrid example: Coverage & Access page

`rinvoqhcp.com/dermatology/access` doesn't fit cleanly. Likely composition:
- Condition Landing recipe sections 1–4 (brand-explorer, header, hero,
  section-nav)
- Insert `formulary-lookup` (block from library) — coverage tool
- `accordion` for plan-by-plan breakdown
- `info-tree` for support program tiers
- `cards-grid` (support variant) for patient resources
- Standard footer + safety-bar

## Hybrid example: Patient transcript page

`linzess.com/why-linzess/linzess-patient-stories/nan-transcripts`:
- Real Patients recipe sections 1–3 + 4 (header, hero, consent disclaimer)
- `brightcove-video` for video reference
- `section-nav` for transcript chapters
- Multiple `text-container` instances (variant `transcript`) with
  section-metadata `style: nan-transcript-{section}`
- `quote` for pull quote
- `cards-grid` (related stories variant)
- Standard footer + safety-bar

---

# Cross-template constants

These hold for EVERY page archetype:

## Always present
- `brand: {brand-key}` page metadata
- `header` fragment reference via `nav: /...` (per-section if applicable)
- `footer` fragment reference via `footer: /...`
- `safety-bar` fragment (shared across all pages in a brand section)
- `og:image`, `description`, `title` metadata
- Job code in footer / legal

## Always inherit (don't override per-page)
- Footer content (single shared fragment)
- Safety-bar content (single shared fragment per brand section)
- Brand tokens (`styles/{brand}/_tokens.css`)
- Brand fonts (`styles/{brand}/_fonts.css`)

## Often varied per page
- `nav` metadata path (per-condition headers)
- Hero variant / image
- Section-nav presence and anchor IDs
- Mid-page CTAs and resource cards

## Always verify against live source
- Whether per-condition nav exists
- Whether safety-bar content differs by indication (rarely does, but verify)
- Whether the page has a Boxed Warning section (regulatory — must match live)

---

# Quick lookup table

| If page is... | Archetype | Section count | Key blocks |
|---|---|---|---|
| Brand homepage | 1 — Homepage | 9 | brand-explorer, hero, cards-grid, footer, safety-bar |
| `/{condition}` landing | 2 — Condition Landing | 10 | per-section header, hero, section-nav, indication |
| `/{condition}/dosing*` | 3 — Dosing & Lab | 14 | clinical-data-panel, table, accordion, references |
| `/{condition}/*/real-patients` | 4 — Real Patients | 11 | story-cards, brightcove-video, quote |
| `/{condition}/*/efficacy/X-vs-Y*` | 5 — H2H Comparison | 15 | chart, clinical-data-panel, table, references |
| Coverage / contact / sitemap / transcript | 6 — Custom / Hybrid | varies | Walk Phase B fresh |

For each: pair the recipe with `pharma-content-fidelity` always, and invoke
`aemcoder-migration-orchestrator` to drive the migration.
