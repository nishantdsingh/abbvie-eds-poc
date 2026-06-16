---
name: abbvie-block-analysis
description: Per-block xwalk model reference for the AbbVie commercial pharma EDS multi-brand project. Provides Row Mapping tables (plain.html row → field), FieldGroup algorithm from helix-md2jcr, applyCommonProps usage, field-level component/valueType, CSS variants, brand-override coverage, and authoring rules for the top 20 most-used blocks, plus lightweight pointers for the remaining 48 blocks. Use whenever migrating, authoring, or debugging a block — especially for md2jcr errors ("Cannot read properties of undefined (reading 'fields')"), row-count mismatches, plain.html structure questions, orphan-suffix field bugs, or aemcoder confusion about block field shapes. Trigger phrases include "block model", "row mapping", "plain.html structure", "{block-name} fields", "applyCommonProps", "md2jcr error", "FieldGroup", "field hint", "orphan suffix", "block fields reference", "what fields does {block-name} have", "how many rows in {block-name} block table".
---

# AbbVie Block Analysis — xwalk Model Reference

Per-block xwalk model details for the 68 blocks in this multi-brand project.
Sister skill to `abbvie-block-library` (which is a brand-coverage matrix) —
this one is xwalk model depth + md2jcr publish rules.

## Related skills

- **abbvie-block-library** — brand × block usage matrix, Platform-C DOM selectors
- **ue-component-model** — UE `component-{models,definition,filters}.json` wiring
- **abbvie-page-migration** — general Platform-C → EDS migration patterns
- **aemcoder-section-fix-loop** — uses this skill for block fit decisions
- **building-brand-blocks** — block CSS development with brand cascade

## When to use this skill

Trigger this skill when:
- Constructing a `.plain.html` block table for any block — need Row Mapping
- Debugging md2jcr errors ("Cannot read properties of undefined (reading 'fields')")
- Counting rows vs FIELD GROUPS (the #1 cause of aemcoder failure)
- Identifying which fields are `classes_*` (don't go in rows — go in class attr)
- Deciding block fit during migration — need full field list, variants, brand coverage
- Asking "how many cells per item row?" / "what's the order?"
- Aemcoder authoring is producing wrong structure
- Diagnosing orphan-suffix silent drops (AEMCODER-022)

---

# Stage 1 — html2md requirements (from `adobe/helix-html2md-service`)

Content is transformed `plain.html → markdown → JCR XML`. Stage 1 rules:

## Required HTML structure

```html
<html>
<head>
  <title>Page Title</title>
  <meta name="description" content="...">
</head>
<body>
  <header></header>
  <main>
    <div><!-- Section 1 --></div>
    <div><!-- Section 2 --></div>
  </main>
  <footer></footer>
</body>
</html>
```

**Content MUST be inside `<main>`.** No `<main>` → empty output (silent
failure). Each top-level `<div>` child of `<main>` is one section. First
section's wrapper is removed; subsequent sections become `---` thematic
breaks in markdown. Empty `<div>`s silently removed.

## Block detection

A `<div>` is detected as a block when ALL conditions hold:
1. Has a CSS class name (`class="block-name variant1"`)
2. Contains child `<div>` elements (rows)
3. Each row `<div>` contains child `<div>` elements (cells)

```html
<!-- ✅ Block detected -->
<div class="hero-container">
  <div><div>cell</div></div>
</div>

<!-- ❌ Not detected (no class) -->
<div><div><div>cell</div></div></div>

<!-- ❌ Not detected (no nested div>div>div) -->
<div class="my-block"><p>just text</p></div>
```

## Block name conversion

CSS class → Block name (Title Case):
- `hero-container` → `Hero Container`
- `custom-title` → `Custom Title`
- `class="hero-container height-default"` → `Hero Container (height-default)`

## Hard limits

- HTML > 1MB → rejected (409)
- > 200 images → error (`TooManyImagesError`)
- Data URI / blob URLs → silently discarded
- Invalid JSON-LD in `<script>` → 400 error

---

# Stage 2 — md2jcr publish rules (from `adobe/helix-md2jcr`)

## The FieldGroup algorithm (CRITICAL — read this first)

Source: `src/mdast2jcr/domain/FieldGroup.js` in helix-md2jcr.

Before md2jcr maps cells to fields, it **groups fields** using 3 rules.
The number of rows in your block table must equal the number of GROUPS,
NOT the raw field count.

### Rule 1: Fields with `_` in name → grouped by prefix

All fields sharing the same prefix before `_` become ONE group at the
position of the first occurrence:

```
classes_customDynamicClass  ─┐
classes_commonCustomClass   ─┴─→ ONE group "classes" (BLOCK class attr only)
analytics_id                ───→ ONE group "analytics"
style_customDynamicClass    ─┐
style_container             ─┴─→ ONE group "style" (SECTION class attr only)
```

### CRITICAL: section uses `style_*`, block uses `classes_*` (AEMCODER-023)

These two prefixes look similar but route to DIFFERENT DOM targets:

| Field name prefix | Where it lives in model | Output destination |
|---|---|---|
| `classes_*` | BLOCK-level model fields | `<div class="block">` class attribute |
| `style_*` | SECTION-level model fields (`_section.json`) | `<section class="...">` class attribute |
| `style` (literal, no underscore) | SECTION metadata single-class | Same as above |

**Using `classes_*` on section fields = silent failure.** md2jcr will
NOT apply the class to the section wrapper. The section metadata row
with `classes_customDynamicClass: foo` is dropped or routed wrong.

**Authoring contract:**

```
SECTION METADATA — primary form (dynamic-picklist):
  | style_customDynamicClass | content-wide,medium-radius |   ← PRIMARY (comma-separated, NO SPACES)

SECTION METADATA — non-default section types (REQUIRED 5 rows):
  | blockModelId             | grid-section                |
  | style_container          | grid-section                |
  | name                     | Grid Section                |
  | style_customDynamicClass | grid-section,grid-cols-8    |
  | language                 | none                        |

SECTION METADATA — secondary form (multiselect):
  | style | highlight |       ← Only when authoring with predefined picklist

BLOCK FIELDS — use classes_*:
  classes_textAlign, classes_iconType, classes_customClass, classes_*
```

**Field component types in our section model:**
- `style` — `multiselect` (fixed options array)
- `style_customDynamicClass` — `dynamic-picklist` (source from picklist-config node)
- Other `style_*` — `select` (with options)
- `style_customClass` — `text` (free-form single class)

### Rule 2: Fields ending with suffix → collapsed into base field

Suffixes: `Alt`, `MimeType`, `Type`, `Text`, `Title`

```
image           ─┐
imageMimeType   ─┤─→ ONE group "image" (Alt + MimeType collapsed into base)
imageAlt        ─┘
```

The single cell holds `<img src="..." alt="...">` — md2jcr extracts:
- `image` JCR property from `src` attribute
- `imageAlt` from `alt` attribute
- `imageMimeType` from `src` file extension

### Rule 3: `classes` field (multiselect, literal name) excluded

If a model has a field literally named `classes` (multiselect), it's
handled separately from FieldGroup. It does NOT consume a row — variants
appear in parentheses in the block name (e.g. `Hero Container (height-default)`).

### Rule 4: Field hints `<!-- field:fieldName -->` override sequential resolution

Use HTML comments to bind a cell to a specific field:

```html
<div>
  <div>
    <!-- field:overlayHeading -->
    Some text
  </div>
</div>
```

**Critical use:** breaks greedy richtext consumption. A richtext field
will consume ALL content until it hits an image, link, or field hint.
Use hints to force the next field to take ownership.

## Orphan-suffix silent-drop bug (AEMCODER-022)

**The bug:** if a field name ends with a suffix (Alt/MimeType/Type/Text/Title)
but NO matching base field exists in the same model, md2jcr drops it
during `_fixFieldOrder` reordering. Value never reaches JCR.

### Examples of DROPPED fields

| Field name | Suffix | Expected base | Exists? | Result |
|---|---|---|---|---|
| `overlayTitle` | Title | `overlay` | NO | **DROPPED** |
| `overlayBtnText` | Text | `overlayBtn` | NO | **DROPPED** |
| `placeholderAlt` | Alt | `placeholder` | NO | **DROPPED** |
| `overlayButtonIconType` | Type | `overlayButtonIcon` | NO | **DROPPED** |

### Examples of KEPT fields

| Field name | Suffix | Expected base | Exists? | Result |
|---|---|---|---|---|
| `imageMimeType` | MimeType | `image` | YES | Collapsed into `image` group |
| `imageAlt` | Alt | `image` | YES | Collapsed into `image` group |
| `linkText` | Text | `link` | YES | Collapsed into `link` group |

### The fix: rename orphan suffix fields

| Avoid ending with | Use instead |
|---|---|
| `*Title` (without matching base) | `*Heading`, `*Name`, `*Label`, `*Caption` |
| `*Text` (without matching base) | `*Label`, `*Content`, `*Value`, `*Copy` |
| `*Type` (without matching base) | `*Variation`, `*Style`, `*Mode`, `*Kind` |
| `*Alt` (without matching base) | `*AltLabel`, `*AltDescription`, `*AccessibleName` |
| `*MimeType` (without matching base) | Only use when base field exists |

### Validation script

Run before publish or before committing model changes:

```javascript
node -e "
const models = JSON.parse(require('fs').readFileSync('component-models.json','utf8'));
const suffixes = ['Alt', 'MimeType', 'Type', 'Text', 'Title'];
models.forEach(model => {
  const fields = model.fields.filter(f => f.component !== 'tab');
  const baseNames = fields.filter(f => !suffixes.some(s => f.name.endsWith(s))).map(f => f.name);
  fields.forEach(f => {
    const suffix = suffixes.find(s => f.name.endsWith(s));
    if (suffix) {
      const base = f.name.substring(0, f.name.lastIndexOf(suffix));
      if (!baseNames.includes(base)) {
        console.log('[ORPHAN]', model.id + '.' + f.name, '→ base \"' + base + '\" not found → WILL BE DROPPED');
      }
    }
  });
});
"
```

## Corrected Row count formula (replaces old field-count formula)

**Row count in `.plain.html` = number of FieldGroup entries after `_groupFields()`.**

### Explicit formulas

```
PARENT row count = (total model fields)
                 − (tab fields)
                 − (literal `classes` multiselect field, if present)
                 − (classes_* prefixed fields → all collapse to 1 group via Rule 1)
                 − (suffix-collapsed fields: *Alt, *MimeType, *Type, *Text, *Title
                    when matching base field exists)
                 + (1 if classes_* family present → adds the single "classes" group)
                 + (1 if analytics_* family present → adds the single "analytics" group)

ITEM cell count = (item model fields)
                − (tab fields in item model)
                − (classes_* prefixed fields in item model)
                − (suffix-collapsed fields in item model)
```

### Worked example — Hero block (14 model fields → 8 rows)

| # | Field | Component | Row? | Reason |
|---|---|---|---|---|
| 1 | `classes` | multiselect | NO | → block element class attribute (Rule 3) |
| 2 | `image` | reference | **Row 1** | base field |
| 3 | `imageAlt` | text | NO | collapses into `image` (Rule 2 suffix) |
| 4 | `mobileImage` | reference | **Row 2** | base field |
| 5 | `mobileImageAlt` | text | NO | collapses into `mobileImage` (Rule 2) |
| 6 | `eyebrow` | text | **Row 3** | |
| 7 | `indication` | richtext | **Row 4** | |
| 8 | `text` | richtext | **Row 5** | |
| 9 | `layers` | richtext | **Row 6** | |
| 10 | `video` | reference | **Row 7** | |
| 11 | `imageCaption` | text | **Row 8** | |
| 12 | `classes_textAlign` | select | NO | → class attr (Rule 1) |
| 13 | `classes_textColor` | select | NO | → class attr (Rule 1) |
| 14 | `classes_customClass` | text | NO | → class attr (Rule 1) |

**Total: 14 fields → 8 rows** (4 suffix-collapsed/multiselect/classes_* excluded).

### Quick-reference cheat sheet (top blocks)

Always verify against the actual `_{block-name}.json`. Approximate counts:

| Block | Model fields | Excluded (tabs/classes/suffix) | **Parent rows** | Item cells |
|---|---|---|---|---|
| hero | 14 | 6 (1 classes + 3 classes_* + 2 Alt) | **8** | — (no items) |
| cards-grid | 1 | 1 (classes) | **0** parent | **6** (link, image, line1-4) |
| accordion | 20+ | tabs + classes_* | **~17** | ~8 cells per item |
| safety-bar | varies | tabs + classes_* | **~5** | — |
| header | (fragment-loaded) | n/a | n/a | n/a |
| footer | (fragment-loaded) | n/a | n/a | n/a |
| tabs | varies | tabs + classes_* | **~5** | per tab item |
| modal | varies | tabs + classes_* | **~8** | — |
| columns | 1 | 1 (classes) | **0** | children = arbitrary blocks |
| cta | 16 | 2 (classes + classes_common*) | **~12** | — |
| rich-text | varies | classes_* | **~1** (just content) | — |
| text-container | 15 | 2 tabs + classes_* | **4** parent (classes, blockId, lang, analytics) | child items (text or image) |
| brand-explorer | 13 | 2 (tabs) + classes_* group | **12** parent | **8** cells per brand item |
| formulary-lookup | varies | tabs + classes_* | **~6** | — |
| carousel-video-playlist | varies | tabs + classes_* | **~5** parent | per video item |
| fact-card | varies | tabs + classes_* | **~5** | — |
| info-tree | varies | classes_* | **~3** parent | per node |
| image-compare | ~8 | 2 (classes_*) | **~6** (collapsed alts) | — |
| story-cards | varies | tabs + classes_* | **~3** parent | per patient story |
| brightcove-video | varies | classes_* | **~10** | — |

The ~ values are approximate — for production-quality migration, run the
FieldGroup algorithm on the actual model file. The cheat-sheet exists for
rapid block-fit sanity-checks ("does this section need 5 rows or 10?")

## Empty fields STILL need their `.plain.html` row

Critical rule: every FieldGroup needs its row in the block table, EVEN
if the value is empty. Skipping an empty row shifts ALL subsequent
field mappings → silent content misrouting.

**Wrong (10 fields, only 8 rows authored):**
```html
<div class="hero">
  <div><div><picture><img src="hero.jpg" alt="Hero"></picture></div></div>
  <!-- skipped mobileImage row → CONTENT WILL MISMAP -->
  <div><div>Eyebrow text</div></div>
  ...
</div>
```

**Right (10 fields, 10 rows including empty ones):**
```html
<div class="hero">
  <div><div><picture><img src="hero.jpg" alt="Hero"></picture></div></div>
  <div><div></div></div>                                  <!-- empty mobileImage -->
  <div><div>Eyebrow text</div></div>
  ...
</div>
```

Empty rows preserve order alignment. Md2jcr maps row N to FieldGroup N
sequentially — gaps break the contract.

Same rule for item rows: every item cell present, empty if no value.

## Page Metadata block (page-level, distinct from Section Metadata)

Page Metadata is authored as the LAST section in the document. It sets
page-level JCR properties (vs Section Metadata which sets section-level
class attributes).

### Format

```html
<div class="metadata">
  <div><div>brand</div><div>rinvoq-hcp</div></div>
  <div><div>nav</div><div>/rinvoq-hcp/header-dermatology</div></div>
  <div><div>footer</div><div>/rinvoq-hcp/footer</div></div>
  <div><div>title</div><div>Dermatology — Dosing & Lab Monitoring</div></div>
  <div><div>description</div><div>Verbatim from live <head> meta description</div></div>
  <div><div>og:image</div><div>/content/dam/.../hero-image.jpg</div></div>
  <div><div>job-code</div><div>US-RNQ-XXXXXX</div></div>
</div>
```

### Key-to-JCR mappings (from helix-md2jcr conversion rules)

| Markdown key | JCR property | Notes |
|---|---|---|
| `title` | `jcr:title` | Required for SEO |
| `description` | `jcr:description` | Required for SEO |
| `canonical` | `cq:canonicalUrl` | If different from default |
| `robots` | `cq:robotsTags` | `noindex,nofollow` etc. |
| `brand` | (custom — read by scripts.js) | Drives brand CSS cascade |
| `nav` | (custom — read by header block) | Per-condition header fragment path |
| `footer` | (custom — read by footer block) | Usually shared |
| `og:image`, `og:title`, etc. | OpenGraph meta tags | Social-share previews |
| Any other key | Same-named JCR property | Custom metadata |

### Rules

- Page Metadata block goes at the END of the document (after content sections).
- Use `class="metadata"` on the wrapping div (NOT `section-metadata`).
- Image values → child `<image>` node with `fileReference` in JCR.
- Link values → href extracted, stored as string.
- `multiselect` / `aem-tag` fields → array format: `"[tag1,tag2]"`.
- Page Metadata is page-level; Section Metadata is section-level.
  Don't confuse the two.

## Common-properties tail (3 rows on blocks using _common-properties)

Blocks that include `_common-properties.json` get 3 FieldGroups from it:

```
[N-2] blockId        (row format: id:VALUE)
[N-1] classes        (classes_commonCustomClass → 1 group)
[N  ] language       (row format: lang:VALUE)
```

If the block ALSO declares its own `classes_*` fields (e.g. `classes_customDynamicClass`
in text-container), they merge into the same `classes` group — still 1 row.

If the block declares `analytics_id` (currently only `text-container`), it
adds a 4th group:

```
[N-3] classes        (classes_customDynamicClass + classes_commonCustomClass → 1 group)
[N-2] blockId
[N-1] language
[N  ] analytics      (analytics_id → 1 group)
```

**Don't assume 4 rows for all blocks** — verify with the FieldGroup script.
`brand-explorer` has 3 common-prop rows (no analytics_id); `text-container`
has 4 (has analytics_id).

## `aem-content` vs `reference` for image fields (AEMCODER-016)

For image fields in **container item blocks** (cards-grid item,
brand-explorer item, story-cards item, etc.):

- ✅ `"component": "reference"` — works correctly. Renders as
  `<img src="...">` (or `<picture>` for responsive images).
- ❌ `"component": "aem-content"` — triggers md2jcr failure "Cannot
  read properties of undefined (reading 'fields')". The `aem-content`
  component is intended for content-fragment references at the page
  level, not for image references inside container items.

## 5-step triage when md2jcr fails

When "Cannot read properties of undefined (reading 'fields')" or similar
appears:

1. **Compare with a working block** — find a block of the same shape
   (parent + item, or flat) that publishes successfully. Diff its
   `_{block-name}.json` against yours.
2. **Check filter → model chain** — does the parent block's
   `filters[0].components` include the item block ID? Does the item
   block's `id` in `models[]` match what the parent expects?
3. **Run orphan-suffix validation** — use the script above. Rename
   any flagged fields.
4. **Check field-component types** — is any image field using
   `aem-content`? Change to `reference`.
5. **Verify compiled JSON** — `component-models.json` at root. Are
   ALL fields present? `npm run scaffold:build` regenerates.

---

# Cross-block conventions (apply to ALL 68 blocks)

## Brand override discovery

Before assuming brand styling exists or is needed:
```sh
ls blocks/{block-name}/{brand-key}/ 2>/dev/null
```
Missing folder = intentional inheritance from base, NOT a gap. The loader
silently falls back via `.catch(() => {})` in `scripts/aem.js` `loadBlock`.

## Variant registration

Variants (block-element CSS classes like `.cards-grid.brush`,
`.accordion.icon-font`) are EITHER:
- Pure CSS variants — just style with the class selector, no registration needed
- JS-augmented variants — register in `blocks/{block}/block-config.js`
  `variations` array; trigger conditional module import

## Header / Footer special case

`header` and `footer` have NO `_header.json` / `_footer.json` model file —
they are built blocks loaded via the Fragment system. Their content is
authored as a Fragment document at a path like `/nav` or `/footer` and
referenced from page metadata (`nav: /...`, `footer: /...`).

## `applyCommonProps` blocks

Five top-20 blocks call `applyCommonProps(block)` from `scripts/utils.js`:
`accordion`, `cta`, `text-container`, `brand-explorer`, `fact-card`.

Common properties (from `models/_common-properties.json`) add these fields:
- `blockId` (text, format: `id:value`)
- `classes_commonCustomClass` (text → joins the `classes` FieldGroup)
- `language` (select, format: `lang:value`)

For blocks with `analytics_id`, it creates an additional FieldGroup entry.

**In plain.html:** These fields contribute to parent row count. The
`classes_commonCustomClass` merges into the existing `classes` group (no
extra row), while `blockId`, `language`, and `analytics_id` each get a row.

## `renderBlock` (multi-theme loader) blocks

Five top-20 blocks use `renderBlock` from `scripts/multi-theme.js` instead
of direct `decorate()`: `cards-grid`, `header`, `footer`, `carousel-video-playlist`.
These support brand-aware decoration via `block-config.js` overrides.

---

# Top 20 blocks — full reference

## 1. Hero (`hero`)

Most-customized block. Front-and-center on every brand homepage.

- **Model:** `blocks/hero/_hero.json`
- **JS:** `blocks/hero/hero.js` (async decorate, no applyCommonProps, no renderBlock)
- **CSS:** `blocks/hero/hero.css`
- **Block-config:** `blocks/hero/block-config.js` (variations: none)
- **Brand overrides:** abbvie, botox, linzess, mavyret, rinvoq, rinvoq-hcp, skyrizi-hcp, venclexta (8 brands)

### Block-level fields (in order)

| # | Field | Component | Notes |
|---|---|---|---|
| 1 | classes | multiselect | layout/variant picklist; class attr (NOT a row) |
| 2 | image | reference | desktop hero image (group: image + imageMimeType + imageAlt → 1 group) |
| 3 | imageAlt | text | collapsed into image group |
| 4 | mobileImage | reference | mobile image (group: mobileImage + mobileImageAlt → 1 group) |
| 5 | mobileImageAlt | text | collapsed into mobileImage group |
| 6 | eyebrow | text | small text above heading |
| 7 | indication | richtext | optional indication paragraph (HCP) |
| 8 | text | richtext | hero body (h1, paragraphs) |
| 9 | layers | richtext | overlay text/SVG layers |
| 10 | video | reference | optional hero video |
| 11 | imageCaption | text | caption text |
| 12-14 | classes_textAlign, classes_textColor, classes_customClass | class attr | grouped as one "classes" attr |

### Row count: ~8 FieldGroups (excluding tabs and classes_* attr fields)

Groups in order: image (collapsed), mobileImage (collapsed), eyebrow,
indication, text, layers, video, imageCaption.

### Authoring rules

- **Single H1 per page.** Author in `text` field.
- **`imageAlt` mandatory** for a11y.
- **Mobile image:** separate field, don't CSS-crop desktop.
- **LCP candidate:** keep eager, don't lazy-load.

## 2. Cards Grid (`cards-grid`)

Highly variant — indication links, support cards, brush-stroke decorated cards.

- **JS:** calls `renderBlock` (brand block-config supported)
- **Brand overrides:** linzess, mavyret, rinvoq, rinvoq-hcp, skyrizi-hcp, venclexta (6)
- **Filter children:** `grid-card`

### Block-level fields

`classes` (multiselect → class attr, not a row)

### Item-level fields (`grid-card`) — 6 fields → 6 cells per item row

`link`, `image` (collapsed with imageAlt + imageMimeType if model has them),
`line1`, `line2`, `line3`, `line4` (all richtext)

### Authoring rules

- Indication-link cards: text + chevron in line4, no pill button
- Support cards (glacier): pill CTA in line4
- Don't double-decorate over brand CSS

## 3. Accordion (`accordion`)

8-brand coverage. Uses `applyCommonProps`.

- **Model:** `blocks/accordion/_accordion.json`
- **Brand overrides:** all 8 commercial brands
- **Filter children:** `accordion-item`

### Block-level FieldGroups (~17 groups)

`blockHeading`, classes (allowMultipleOpen + showExpandCollapseAll +
iconType + custom → 1 group), expandAllLabel, collapseAllLabel,
expandAllIcon, collapseAllIcon, expandIcon, collapseIcon, expandAllIconImage,
collapseAllIconImage, expandIconImage, collapseIconImage, ariaExpandAllLabel,
ariaCollapseAllLabel, blockId, language, analytics.

### Item FieldGroups (`accordion-item`)

`summary`, `text`, classes_defaultOpen (class attr), ariaExpandLabel,
ariaCollapseLabel, anchorId, image (collapsed with imageAlt).

### Authoring rules

- ARIA labels mandatory for a11y
- Boolean `classes_*` → class on block element when `true`
- Boxed Warning content inside accordion: verbatim, no paraphrase

## 4. Safety Bar (`safety-bar`)

Most regulated block. ALWAYS invoke `pharma-content-fidelity` alongside.

- **Brand overrides:** 8 brands

### Authoring rules

- **Verbatim copy.** ZERO paraphrase of any safety subsection.
- **Boxed Warning visual treatment is regulatory** — not aesthetic.
- **Source of truth is the Fragment**, NOT the page.
- **References round-trip** — every superscript ↔ reference entry.
- **Job code** (e.g. `US-RNQ-250017`) preserved verbatim.
- **Expanded state ≠ collapsed state** — both need full content.

See **pharma-content-fidelity** skill for the full compliance checklist.

## 5. Header (`header`) — fragment-loaded special

NO model JSON file. Loaded as Fragment.

- **JS:** `blocks/header/header.js` (calls `renderBlock`)
- **Brand overrides:** 8 brands
- **Loading:** `getMetadata('nav')` reads fragment path from page metadata

### Authoring

- Author content as Fragment at `/nav` (default) or any path
- Set page metadata `nav: /path/to/header-fragment`
- **Pharma sites often use per-section nav** (e.g. `/{brand}/header` for
  homepage, `/{brand}/header-{condition}` for `/{condition}/*` pages).
- For brand-specific behavior: edit `blocks/header/{brand}/block-config.js`,
  not base `header.js`.

### Authoring rules

- **Verbatim nav labels** from live source.
- **Touch targets ≥44×44px** on hamburger, drawer items, close, chevrons.

## 6. Footer (`footer`) — fragment-loaded special

Mirror of header. NO model JSON. Loaded as Fragment.

- **JS:** calls `renderBlock`
- **Brand overrides:** 8 brands
- **Loading:** `getMetadata('footer')` for fragment path

Footer is typically SHARED across all brand pages — verify before forking.

## 7. Tabs (`tabs`)

8-brand coverage.

- **Filter children:** `tab` item type

### Fields

Block: `blockHeading`, classes_*, accessibility fields.
Item (`tab`): `tabLabel`, `tabContent` (richtext), `anchorId`.

### Authoring rules

- Tab labels verbatim
- ARIA: `aria-selected`, `aria-controls` — base block handles, don't override

## 8. Modal (`modal`)

8-brand coverage.

### Fields

`modalTitle`, `modalContent` (richtext), `triggerLabel`, `triggerType`,
classes_size, accessibility fields, `closeButtonLabel`.

### Authoring rules

- Exit modals: regulated copy ("You are now leaving ..." disclaimer) verbatim
- Focus trap on open, restore on close — base handles
- `aria-label` mandatory on close button

## 9. Columns (`columns`)

9-brand coverage. Universal layout primitive.

### Fields

Block: `classes` (column count picklist). No item-level model — children
are arbitrary blocks placed inside.

## 10. CTA (`cta`)

9-brand coverage. Uses `applyCommonProps`.

### Block-level FieldGroups (~12 groups)

link (collapsed with linkText), aria-label, ctaTarget, iconVariation,
iconFont, iconImage, iconPosition, ariaHidden, classes (custom),
blockId, language, analytics.

### Authoring rules

- `iconAfter` boolean → ::after arrow icon via brand CSS
- `ariaLabel` only if visual label is ambiguous

## 11. Rich Text (`rich-text`)

9-brand coverage. Most ubiquitous content block.

### Fields

`content` (richtext), classes_* alignment/size.

### Authoring rules

- For ISI body content, use **text-container** (block 12) instead — more semantic
- `rich-text` is for general body copy

## 12. Text Container (`text-container`)

Critical for ISI / Boxed Warning / regulated copy. Uses `applyCommonProps`.

- **Brand overrides:** abbvie, botox, rinvoq (3 — others inherit base)
- **Variants:** `boxed-warning`, `indication`, `references`, `legal`, etc.

### Model Structure (parent + child)

**Parent model** (text-container): 15 fields, 2 tabs → FieldGroup = 4 groups:
- Group 1: `classes` (classes_customDynamicClass, classes_textWidth, classes_textTopSpacing, classes_textBottomSpacing, classes_textAlignment, classes_textDirection, classes_theme, classes_textVariant, classes_columns, classes_commonCustomClass)
- Group 2: `blockId`
- Group 3: `language`
- Group 4: `analytics` (analytics_id)

**Filter:** `["text-container-text", "text-container-image"]`
- `text-container-text` is FIRST = default fallback (1 field: `text` richtext)
- `text-container-image` (2 fields: `image` reference, `imageAlt` text)

### Row Mapping (plain.html)

```
Row 0: classes group → variant name(s) or '-'
Row 1: blockId → '-' (placeholder)
Row 2: language → 'none'
Row 3: analytics_id → '-' (placeholder)
Row 4: item → <div>richtext content</div> (text-container-text)
```

**Example:**
```html
<div class="text-container legal">
    <div><div>legal</div></div>
    <div><div>-</div></div>
    <div><div>none</div></div>
    <div><div>-</div></div>
    <div><div><div><p>Content here.</p></div></div></div>
</div>
```

**Critical rules:**
- 4 parent rows REQUIRED before item row
- Use `-` or `none` as placeholders (empty rows collapse in html2md)
- Item row content wrapped in extra `<div>` (signals child component)
- No component ID prefix needed (text-container-text is first in filter)
- Variant name in both CSS class attr AND classes row value

### Variant: Boxed Warning

`classes` includes `boxed-warning` → class `text-container boxed-warning` →
brand CSS applies regulatory visual treatment (border, background, weight).
Live source may use `rinvoq-isi-black-bg` or `*-isi-black-bg`; map to our
`boxed-warning` variant.

### Variant: References

`classes` includes `references` → renders as `<ol>` with numbered list.

### Authoring rules

- **Verbatim copy from live source.** See pharma-content-fidelity.
- Use semantic markup: `<sup>` for footnotes, `<ol>/<li>` for references.

## 13. Brand Explorer (`brand-explorer`)

HCP sites only. Uses `applyCommonProps`. Has hoist logic in JS (hoists
section before `<header>` so it renders above the nav).

- **Brand overrides:** abbvie, botox, rinvoq-hcp, skyrizi-hcp (4)

### Parent model fields → 12 rows

FieldGroup algorithm gives 12 parent rows (tabs excluded, classes_* grouped):

| Row | Field | Notes |
|-----|-------|-------|
| 1 | `anchorId` | deep-link anchor |
| 2 | `barLabel` | e.g. "Immunology Therapies" |
| 3 | `projectNumber` | regulatory number at bottom of panel |
| 4 | `navLink1Label` | nav link 1 text (renamed from `navLink1Text`) |
| 5 | `navLink1Url` | nav link 1 URL |
| 6 | `navLink2Label` | nav link 2 text (renamed from `navLink2Text`) |
| 7 | `navLink2Url` | nav link 2 URL |
| 8 | `navLink3Label` | nav link 3 text (renamed from `navLink3Text`) |
| 9 | `navLink3Url` | nav link 3 URL |
| 10 | `blockId` | from common-properties, format: `id:VALUE` |
| 11 | `classes` group | `classes_commonCustomClass` → empty group row |
| 12 | `language` | from common-properties, format: `lang:VALUE` |

### Item model fields (brand-explorer-item) → 8 cells per item

| Cell | Field | Type | Notes |
|------|-------|------|-------|
| 1 | `logo` | reference | Brand logo image (`component: reference`, NOT `aem-content`) |
| 2 | `logoAccessibleName` | text | Alt description — NOT collapsed with logo ("Name" ≠ suffix) |
| 3 | `brandName` | text | Brand display name |
| 4 | `therapeuticArea` | text | Filter category (Immunology, Dermatology, etc.) |
| 5 | `description` | richtext | Brand short description |
| 6 | `brandUrl` | text | Link to brand site |
| 7 | `safetyContent` | richtext | Safety disclaimer (renamed from `safetyText`) |
| 8 | `indications` | text | One per line: `Name\|URL\|severity` |

**Why 8 cells (was 7):** `logoAlt` (old) collapsed with `logo` into 1 cell
(via Alt suffix rule). `logoAccessibleName` (new) is NOT a suffix → stays
as its own separate cell. `safetyText` (old) was an orphan suffix field and
was DROPPED by md2jcr. `safetyContent` (new) is not a suffix → now reaches JCR.

### Authoring rules

- `barLabel` verbatim from live (e.g. "Immunology Therapies", not "Explore AbbVie")
- Bar background must match the header/nav bar color
- Logo field MUST use `component: reference`, not `aem-content` (AEMCODER-016)
- Block JS hoists the section before `<header>` — author it as the FIRST section

## 14. Formulary Lookup (`formulary-lookup`)

Brand-aware via `getMetadata('brand')` in JS. 6-brand coverage.

- **Brand overrides:** linzess, mavyret, rinvoq, rinvoq-dtc, rinvoq-hcp,
  skyrizi-hcp (6)

### Authoring rules

- Brand-specific results data-driven from sheet/endpoint
- HCP-specific disclaimer copy verbatim
- **AEMCODER-021:** brand block CSS already styles submit-button, filter
  dropdown, etc. — do NOT add `::before`/`::after` decorations in page CSS

## 15. Carousel Video Playlist (`carousel-video-playlist`)

8-brand coverage. Uses `renderBlock`.

- **Brand overrides:** 8 brands

### Fields

Block: `blockHeading`, `classes` (layout).
Item: `videoTitle` (verify not orphan — should have `video` base or rename
to `videoHeading`), `videoId`, `posterImage`, `description`, `transcript`.

### Authoring rules

- **Brightcove credentials** (account ID + video ID) verbatim from live
- **Delayed loading** for Brightcove (third-party)
- **Transcripts mandatory** (WCAG)

## 16. Fact Card (`fact-card`)

Used in dosing / clinical pages. Uses `applyCommonProps`.

### Fields

`factNumber` (large display), `factUnit`, `factDescription` (richtext),
`classes` for color, common-properties tab.

### Authoring rules

- Clinical efficacy numbers verbatim
- `factDescription` includes asterisk/dagger linking to references

## 17. Info Tree (`info-tree`)

Hierarchical info presentation.

### Authoring rules

- Used for mechanism-of-action and clinical-data hierarchical content
- Heading order: start at next-available level

## 18. Image Compare (`image-compare`)

Before/after slider. 4-brand coverage.

### Fields

`beforeImage`, `beforeImageAlt` (collapsed), `beforeLabel`, `afterImage`,
`afterImageAlt` (collapsed), `afterLabel`, `classes_*` slider position.

### Authoring rules

- Both alt texts MANDATORY — pharma efficacy comparisons describe what shows
- Don't fabricate pairings — match exactly from live source

## 19. Story Cards (`story-cards`)

Used for Real Patients pages. 3-brand coverage.

- **Filter children:** story-card item

### Fields

Block: `blockHeading`, `classes` for grid.
Item: `patientName`, `patientImage` (use `reference`, not `aem-content`!),
`quote` (richtext), `link`, `consentDisclaimer`.

### Authoring rules

- Patient consent disclaimer verbatim — regulatory
- Model release notice ("Actor portrayal" / "Real patient") verbatim
- Image alt describes patient context

## 20. Brightcove Video (`brightcove-video`)

Direct video embed (single video, not playlist).

- **Brand overrides:** abbvie, botox, rinvoq (3)

### Fields

`videoHeading` (renamed from `videoTitle` if orphan suffix risk applied),
`accountId`, `playerId`, `videoId`, `posterImage`, `transcript`,
`classes_autoplay`, `classes_*` player skin.

### Authoring rules

- Delayed loading — Brightcove in `delayed.js`, not eager
- Transcript mandatory for HCP/regulated content
- No autoplay unless live source has it

---

# Remaining 48 blocks — lightweight pointers

For full details, read the model file directly: `blocks/{block-name}/_{block-name}.json`.

| Block | Purpose | Brands | Variants |
|---|---|---|---|
| anchor-nav | In-page anchor nav | abbvie, botox, rinvoq | none |
| banner-ad | GPT ad-unit | abbvie, botox, rinvoq | none |
| breadcrumb | Breadcrumb trail | abbvie, botox, rinvoq, skyrizi-hcp | variation-name |
| brightcove-podcast-player | Podcast embed | abbvie, botox, rinvoq | variation-name |
| cards | Generic card grid | abbvie, botox, rinvoq | none |
| carousel | Image/content carousel | abbvie, botox, rinvoq, rinvoq-hcp | variation-name |
| chart | Data viz (efficacy, forest plots) | abbvie, botox, rinvoq | variation-name |
| clinical-data-panel | Structured clinical data | mavyret, skyrizi-hcp | none |
| custom-image | Image w/ positioning options | abbvie, botox, rinvoq | variation-name |
| custom-title | Heading w/ custom styling | abbvie, botox, rinvoq | variation-name |
| dismiss | Dismissable banner | rinvoq | none |
| dismissible | Similar to dismiss | abbvie, botox, rinvoq | none |
| doctor-locator | HCP locator | abbvie, botox, rinvoq | none |
| drcom-widget | Doctor.com integration | abbvie, botox, rinvoq | none |
| eds-form | EDS-native form | abbvie, botox, rinvoq | variation-name |
| embed | Iframe / script embed | abbvie, botox, rinvoq | variation-name |
| embed-form | Marketo/Salesforce embed | abbvie, botox, rinvoq | variation-name |
| find-provider | Provider lookup | all 9 brands | none |
| flexbox | Flex layout container | linzess, rinvoq-hcp, skyrizi-hcp | none |
| form | Legacy form | abbvie, botox, rinvoq | variation-name |
| fragment | Include another fragment | abbvie, botox, rinvoq | none |
| hotspot | Interactive hotspots | abbvie, botox, rinvoq | none |
| image-text | Side-by-side image + text | base only | none |
| linklist | List of links w/ headings | abbvie, botox, rinvoq | variation-name |
| navigation-content | Secondary nav | abbvie, botox, rinvoq | variation-name |
| news-feed | News article feed | abbvie, botox, rinvoq | variation-name |
| parallax | Parallax scroll | mavyret, skyrizi-hcp | none |
| pipeline-utility-nav | Pipeline-page utility | abbvie, botox, rinvoq | variation-name |
| press-releases | Press release listing | abbvie, botox, rinvoq | variation-name |
| promo-drawer | Promotional drawer | abbvie, botox, rinvoq | none |
| quick-poll | Interactive poll/quiz | abbvie, botox, rinvoq | none |
| quote | Pull quote / testimonial | abbvie, botox, rinvoq | variation-name |
| search | Search results | abbvie, botox, rinvoq | variation-name |
| search-input | Search input control | base only | none |
| section-nav | Section-level secondary nav | linzess, rinvoq-hcp, skyrizi-hcp | none |
| send-mail | Email-this-page | abbvie, botox, rinvoq | none |
| separator | Section divider | abbvie, botox, rinvoq | variation-name |
| social-media | Social icon links | abbvie, botox, rinvoq | variation-name |
| social-share | Share widget | base only | variation-name |
| sticky-sidebar | Sticky sidebar | abbvie, botox, rinvoq | variation-name |
| stock-ticker | ABBV stock widget | abbvie, botox, rinvoq | variation-name |
| story-card | Single story card | abbvie, botox, rinvoq | variation-name |
| table | Data table w/ sorting | abbvie, botox, rinvoq | variation-name |
| tag-utility-nav | Tag-based utility nav | abbvie, botox, rinvoq | variation-name |
| teaser | Teaser card | abbvie, botox, rinvoq | variation-name |
| tooltip | Inline tooltip | abbvie, botox, rinvoq | none |
| ugc-detail | UGC detail | abbvie, botox, rinvoq | none |
| video | HTML5 video | abbvie, botox, rinvoq | variation-name |

---

# Known block limitations

## image-text — image column accepts ONLY `<picture>`

JS strips anything in the image cell that isn't `<picture>`. Captions /
text in the image cell are silently removed.

**If design requires text-over-image:** use `hero` (with `layers` field)
or `columns` block (manual 2-col layout).

## formulary-lookup — brand block CSS fully styles sub-elements

Brand CSS already styles every sub-element including submit-button icon,
filter-dropdown icon (plum circle + chevron), input borders, results table.

**Do NOT add `::before`/`::after`** in page-level CSS for this block —
AEMCODER-021 duplicated-icon bug.

## hero — image cell is row 0 only; text in row 2

JS expects image in FIRST authored row, text/CTA in SECOND. Other
ordering produces empty divs.

## brand-explorer — md2jcr breaks if image field uses `aem-content`

`logo` field in `_brand-explorer.json` MUST use `component: reference`,
NOT `aem-content` (AEMCODER-016).

## accordion item — `classes_defaultOpen` MUST be the LAST item field

`classes_*` fields are typically last. Order must match for md2jcr.

## cards-grid — item cells are 6 EXACTLY

cards-grid items have exactly 6 cells per row (link, image, line1-4).
Adding a 7th requires extending the item model — model + content alignment.

## safety-bar — content lives in Fragment, not page

Authoring safety-bar content directly on a page bypasses the shared-fragment
mechanism. Each page would have its own copy — regulatory single-source-of-truth defeated.

---

# Anti-patterns from migration history

## AEMCODER-016: md2jcr "Cannot read properties of undefined (reading 'fields')"
- **Cause:** Image field in container item using `component: aem-content`
  instead of `reference`. OR orphan-suffix field (AEMCODER-022).
- **Fix:** Change to `reference`. Run orphan-suffix validation script.
  See 5-step triage above.

## AEMCODER-010: "13 rows vs 10 rows" confusion
- **Cause:** Counted model fields including tabs and `classes_*`, giving
  wrong row count.
- **Fix:** Row count = FieldGroup count after `_groupFields()` runs.
  Exclude tabs. `classes_*` underscore-prefix fields collapse to 1 group.
  Suffix fields collapse into base.

## Picking wrong variant for cards-grid (AEMCODER-001)
- **Cause:** Used `cards-grid-cta-card` variant for both indication-link
  cards AND glacier patient-support cards.
- **Fix:** Indication cards = no pill variant; glacier = pill variant.

## AEMCODER-022: Orphan-suffix silent drop
- **Cause:** Field name ends in Alt/Text/Title/Type/MimeType without
  matching base field — silently dropped during md2jcr `_fixFieldOrder`.
- **Fix:** Rename per suffix-alternative table above. Run validation
  script before committing model changes.

## AEMCODER-023: Section custom class used `classes_*` instead of `style_*`
- **Cause:** Section Metadata block authored with `classes_customDynamicClass`
  key instead of `style_customDynamicClass`. md2jcr does not route
  `classes_*` keys to the section wrapper — they're silently ignored
  or routed to the wrong destination.
- **Symptom:** Page renders without the intended section custom class.
  CSS selectors targeting `.section.<custom-class>` fail to match.
- **Fix at authoring layer:**
  - PRIMARY form: `style_customDynamicClass: a,b,c` (comma-separated, NO SPACES)
  - For non-default section types (grid-section, grid-container): ALL 5
    rows required (`blockModelId`, `style_container`, `name`,
    `style_customDynamicClass`, `language`)
  - Secondary form: `style: x` (multiselect, only when picklist option exists)
- **Fix at model layer:** Section model fields use `style_*` prefix
  (renamed from `classes_*` in commit 9e409c43). The `style` field is
  `multiselect`; `style_customDynamicClass` is `dynamic-picklist`.
- **Distinction recap:** `classes_*` is correct for BLOCK fields
  (inside a block table); `style_*` is correct for SECTION fields
  (inside the Section Metadata table). Don't conflate.

## AEMCODER-019: Wrong selector pattern in page CSS
- **Cause:** `:has()` selectors or bare block selectors in `styles/{brand}/_styles.css`.
- **Fix:** Use section-metadata `style` class first, then
  `.section.<style-class> .<block> ...`. See abbvie-page-templates skill.

## AEMCODER-021: Double-decoration over brand-block CSS
- **Cause:** Added `::before`/`::after` in page CSS over a block that
  already has brand-block pseudo-elements.
- **Fix:** Read existing brand block CSS BEFORE adding decorations.
  See building-brand-blocks pre-read rule.

## Conflating `_block.json` with compiled `component-models.json`
- **Cause:** Edited root `component-models.json` directly; overwritten by next build.
- **Fix:** Always edit per-block `_{block-name}.json` partial. Root
  compiles via `npm run scaffold:build`.

---

## Validation checklist before publishing a block table

- [ ] Counted FieldGroups (not raw fields) — see FieldGroup algorithm
- [ ] Parent row count matches FieldGroup count
- [ ] Item row cell count matches item-FieldGroup count
- [ ] Ran orphan-suffix validation script — no `[ORPHAN]` warnings
- [ ] All image fields in container items use `component: reference`
- [ ] `classes_*` boolean values in block element class attr (not rows)
- [ ] `classes` multiselect picklist values in block element class attr
- [ ] `blockId` row formatted as `id:VALUE`
- [ ] `language` row formatted as `lang:VALUE`
- [ ] Empty fields still emit `<div><div></div></div>` row to preserve order
- [ ] Field hints `<!-- field:name -->` placed where needed to break greedy richtext
- [ ] For Boxed Warning / ISI content: verbatim from live source DOM
- [ ] For Brightcove videos: accountId + videoId from live source
- [ ] For images: alt text on every content image

If all checked: ready to publish. If any unchecked: do not publish; md2jcr will fail or silently drop content.
