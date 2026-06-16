# Canonical first-prompt — internal migration guidance

This is your internal reference when starting migration of any new page.
Read it as your own instructions — you ARE the migration agent executing
this workflow directly. Fill in `{{...}}` placeholders mentally based on
the user's request. Remove sections that don't apply.

---

```markdown
You are helping migrate the **{{BRAND_NAME}}** brand site
({{LIVE_HOMEPAGE_URL}}) into the multi-brand AEM Edge Delivery Services
project at https://github.com/Nishant-Adobe/abbvie-eds-poc.

The block library and brand foundation already exist. Your job is to
author the page end-to-end in Universal Editor using existing blocks
with ≥90% pixel-perfect fidelity. NO new blocks, NO base block edits.

## 0. Warm-up — read these first, then summarize back

Before doing anything, read and acknowledge:

1. **Repo:** https://github.com/Nishant-Adobe/abbvie-eds-poc
   (default: `develop`)
2. **Key docs (root):** README.md, CLAUDE.md, PROMPTS.md, DOCUMENTATION.md
3. **Existing brand assets to reuse — do NOT recreate:**
   - `brand-config.json` — `{{BRAND_KEY}}` is registered
   - `styles/{{BRAND_KEY}}/_tokens.css` — brand colors, named palette
   - `styles/{{BRAND_KEY}}/_fonts.css` — brand font family
   - `styles/{{BRAND_KEY}}/_styles.css`, `_themes.css` — brand globals
4. **Block library (68 blocks under `/blocks/`):** {{BLOCK_LIST_OR_REFER_TO_REPO}}.
   Blocks with `{{BRAND_KEY}}` brand override CSS already in place:
   {{BRAND_CUSTOMIZED_BLOCKS}}.
   Other blocks inherit base styling — **that is by design** (loader
   silently falls back; missing `blocks/{block}/{{BRAND_KEY}}/` is
   intentional inheritance, NOT a gap).
5. **UE component models:** Each block has `_{block-name}.json` partial.
   Compiled to root `component-{models,definition,filters}.json` via
   `npm run scaffold:build`.

After reading, summarize: (a) multi-brand cascade in 2–3 sentences,
(b) likely block fit per page section, (c) any gaps you anticipate.

---

## 1. Mission

Migrate the page {{TARGET_URL}} into the project, authored end-to-end
in UE using existing blocks and brand assets. ≥90% pixel-perfect at
1440px desktop AND 390px mobile.

{{FULL_SCOPE_TABLE_IF_PART_OF_A_LARGER_BATCH}}

Execute order: 1 → 2 → ... → N. Do not begin page N until page N-1 is
approved. Today's scope is page {{N}}: {{TARGET_URL}}.

---

## 2. HARD RULES (apply to every section, every viewport, every commit)

### A. Content fidelity
1. **Verbatim copy from live source DOM.** Zero paraphrase, zero
   reorder, zero spelling fix, zero punctuation "improvement."
   Especially for indication, contraindication, Boxed Warning, dosing,
   lab values, adverse reactions, references, footnotes, job codes.
2. **Class names diverge** between Platform-C `abbv-*` and our EDS
   naming. Do NOT rename our classes to match. Match the *visual and
   behavioral* outcome only.
3. **A11y:** single H1 per page, alt text on every content image,
   `aria-label` on every icon-only control, individual links per
   indication card (not one link wrapping the whole card), touch
   targets ≥44×44 px.

### B. Scope / where to edit (lowest specificity first, never skip levels)
1. **Author content field** — fix in UE / `.plain.html` row.
2. **Custom class on section/block + brand global rule** —
   `styles/{{BRAND_KEY}}/_styles.css` SCOPED UNDER a section-metadata
   `style` class (see rule C below). One-off variants live here.
3. **Brand block CSS partial** —
   `blocks/{block}/{{BRAND_KEY}}/_{block}.css`, then
   `npm run scaffold:build:block --block-name X --brand-name {{BRAND_KEY}}`.
   Never edit compiled `*.css`.
4. **Token edit** — `_tokens.css`. Only if brand-wide effect intended.
   **Requires explicit user approval.**
5. **Base block CSS or JS** — ESCALATE, do not patch. Affects all 9 brands.
6. **No `!important` ever.**
7. **Brand override is OPT-IN** — missing `blocks/{block}/{{BRAND_KEY}}/`
   means inheritance is intentional. Don't auto-create.

### C. Section-metadata FIRST, then CSS (AEMCODER-019, AEMCODER-023 — critical)

For every non-standard section, author section-metadata BEFORE writing
any CSS. **Section uses `style_*`, blocks use `classes_*` — DO NOT
confuse these (AEMCODER-023).**

#### PRIMARY form — `style_customDynamicClass` (dynamic-picklist)

```
<div class="section-metadata">
  <div><div>style_customDynamicClass</div><div>content-wide,medium-radius</div></div>
</div>
```

**Value rules:**
- Comma-separated, **NO SPACES** — `a,b,c` not `a, b, c`
- Works for single or multiple classes
- Per reviewer convention: this is the PRIMARY form for section
  styling. Use this by default, not the `style` multiselect.

#### REQUIRED form for non-default sections (grid-section, grid-container)

All 5 rows required for ANY non-default section model:

```
<div class="section-metadata">
  <div><div>blockModelId</div><div>grid-section</div></div>
  <div><div>style_container</div><div>grid-section</div></div>
  <div><div>name</div><div>Grid Section</div></div>
  <div><div>style_customDynamicClass</div><div>grid-section,grid-cols-8</div></div>
  <div><div>language</div><div>none</div></div>
</div>
```

Without `blockModelId`, md2jcr defaults to the plain `section` model
and grid-specific fields won't be emitted. Confirmed via smoke test.

#### Secondary form — `style` (multiselect, predefined options only)

Only use when authoring with a fixed picklist:

```
<div class="section-metadata">
  <div><div>style</div><div>highlight</div></div>
</div>
```

Less flexible than `style_customDynamicClass` — multiselect requires
the option to be in the model's predefined list. Prefer the
dynamic-picklist form.

This emits `<div class="section {style-class-values}">`. Then write CSS
scoped to `.section.{style-class} .{block-class}` in
`styles/{{BRAND_KEY}}/_styles.css`.

**FORBIDDEN section-metadata property names:**
- `classes` / `classes_*` for SECTION metadata — md2jcr silently ignores
  these for section. Use `style_customDynamicClass` (primary) or `style`
  (multiselect) instead.

**FORBIDDEN selectors:**
- `:has()` on block classes
- `body:has(...)` selectors
- Bare block selectors — `.cards-grid ...`, `.text-container ...`, etc.
- Auto-generated section classes like `.section.hero-container ...`

### D. Regression protection (MECHANICAL — AEMCODER-013)

Enumerate every previously approved page in the active batch. If
uncertain, ASK the user before any shared-file edit.

**Shared-File Inventory** — these files trigger cross-page regression:

| File pattern | Affects |
|---|---|
| `styles/{brand}/_tokens.css` | ALL pages w/ `brand: {brand}` |
| `styles/{brand}/_fonts.css` | ALL pages w/ `brand: {brand}` |
| `styles/{brand}/_styles.css` | ALL pages w/ `brand: {brand}` |
| `blocks/{block}/{brand}/_{block}.css` | All pages using that block + brand |
| `blocks/{block}/block-config.js` (base OR brand) | All pages using that block |
| Fragment docs (`/nav`, `/footer`, `/safety-bar`) | All pages referencing |
| `models/_*.json` partials | All pages using affected block |
| `component-{models,definition,filters}.json` | NEVER edit manually |

**PRE-EDIT GATE — mandatory:**
1. Identify if the file you're about to edit is in the Shared-File Inventory.
2. If YES: BEFORE editing, snapshot EACH previously approved page in the
   active batch at 1440px AND 390px. Save as baseline.
3. Apply the edit. Run `npm run scaffold:build:block --block-name X
   --brand-name {{BRAND_KEY}}` if CSS partials touched.
4. AFTER editing, re-snapshot EACH approved page at 1440 + 390.
5. Diff against pre-edit baseline. ANY unintended visual change on
   ANY approved page = REGRESSION.

**On regression:**
- REVERT the edit immediately.
- Narrow scope: prefer `classes_commonCustomClass` value on the section
  + a tightly-scoped rule under a section-metadata `style` class.
- Re-attempt with the narrower fix; repeat the gate.

### E. Responsive
1. **Mobile-first.** Use `@media (min-width: 600px)` and
   `@media (min-width: 900px)` for progressive enhancement.
2. **Project root font-size is 10px** — `0.9rem` = 9px. Use absolute
   px when matching live's `14px`, `16px`, etc.
3. Hide images on mobile via `picture/srcset` or `display: none` on the
   container that holds the `<img>`. Don't leave empty divs adding height.
4. Touch targets ≥44×44 px.

### F. Assets
1. When live site uses an SVG/PNG, **download once** to
   `content/content/dam/abbvie-eds-poc/{filename}` and reference at
   `/content/dam/abbvie-eds-poc/{filename}`. **Never simulate with CSS
   gradients.**
2. Fonts: live `font-family: "Graphik Medium"` ≠ regular Graphik +
   `font-weight: 500`. Match the *family name* the live site declares.

### G. Pixel-fix workflow — Step 0 HARD GATE (AEMCODER-014, AEMCODER-015)

If ANY section diverges from live after initial author, BEFORE writing
ANY CSS:

1. **Live screenshot** at 1440 + 390.
2. **Local screenshot** at 1440 + 390.
3. **Live `getComputedStyle()`** for every DOM descendant in the
   section — required properties: display, position, width, max-width,
   padding, margin, gap, font-*, color, background, border, transform,
   z-index, plus `::before`/`::after`.
4. **Local `getComputedStyle()`** same.
5. **Single delta table** — live vs local per descendant per property.
6. Write ONE consolidated CSS replacement scoped under a section-metadata
   `style` class.

No cherry-picking single properties. Three-round circuit breaker: if a
section needs >3 corrective prompts from me, STOP and re-dump from
scratch.

### H. Approval gates (CRITICAL)
1. **Never `git add` / `commit` / `push` without explicit user approval.**
2. **Never declare "done" or "≥90% match" without** (a) per-viewport
   screenshots at 1440 / 768 / 390, (b) regression check on other
   approved pages.

### I. xwalk / md2jcr content format (refined per AEMCODER-022)

1. **Row count = FieldGroup count, NOT raw field count.** After
   md2jcr's `_groupFields()` runs, multiple fields can collapse into
   one group. See `abbvie-block-analysis` md2jcr-publish-rules section
   for the per-block group count reference.
2. Parent block: one `<div><div>value</div></div>` row per FieldGroup,
   in declared order. Empty rows for empty groups.
3. Item rows: one `<div>` with one `<div>` cell per item-FieldGroup.
4. `classes_*` fields (including `classes`, `classes_commonCustomClass`,
   `classes_iconType`, etc.) group by prefix → ONE FieldGroup named
   "classes" → applied to block element's `class` attribute.
5. `blockId` → row with value `id:VALUE`. `language` → row with value
   `lang:VALUE`. `analytics_id` → analytics FieldGroup.
6. **Suffix collapsing:** fields ending in `Alt`, `MimeType`, `Type`,
   `Text`, `Title` collapse into matching base field (one cell holds
   `<img alt="..." src="...png">` populating image + imageAlt +
   imageMimeType from one cell).
7. **Orphan-suffix bug:** if a field ends with one of those suffixes
   but no matching base field exists in the same model, md2jcr drops
   it. RENAME the field to avoid the suffix (e.g. `overlayTitle` →
   `overlayHeading`).
8. **For image fields in container item blocks:** use `component: reference`,
   NEVER `aem-content`. The latter triggers md2jcr "Cannot read
   properties of undefined (reading 'fields')" (AEMCODER-016).
9. **Field hints `<!-- field:name -->`** OVERRIDE sequential resolution.
   Use them to break greedy richtext.

### J. Analytics & tracking attribute preservation
1. **Preserve verbatim** any of these attributes from live source DOM:
   `data-cmp-data-layer` (Adobe Experience Cloud data layer payloads),
   `data-track-*` (AbbVie marketing analytics), `data-analytics-*`,
   `data-gtm-*` (Google Tag Manager hooks), `data-cmp-*`.
2. JSON payloads in `data-cmp-data-layer` must be byte-for-byte identical.
3. Validation: for any migrated section, grep the rendered DOM for these
   prefixes and compare counts vs live source. Counts must match.

---

## 3. Workflow — follow phases in order, do not skip or combine

### Phase A — Site-wide design audit (skip if previously done for this brand)
1. Scrape live homepage + 1 deeper page to extract design system.
2. **Diff against `styles/{{BRAND_KEY}}/_tokens.css`.** Report any
   mismatches. Do NOT modify tokens unless I approve each delta.
3. Confirm `_fonts.css` covers all weights/styles used by live.
4. **Output:** design audit report. Wait for approval.

### Phase B — Page migration (single-page)
1. Scrape live page; extract sections in document order; identify
   content sequence per section.
2. For each section, map to best-fit block. **Prefer reuse.** No new
   blocks. If block is missing, STOP and ask.
3. **Author section-metadata `style` classes FIRST** for non-standard
   sections (Rule C).
4. Generate UE authoring tree: per-block field values matching
   `_{block-name}.json` model. Use FieldGroup count, not field count
   (Rule I.1).
5. Apply `brand: {{BRAND_KEY}}` page metadata.
6. Render locally (`aem up`); pixel diff vs live at 1440 + 390. Report
   % match per section.
7. Iterate on author content (not block code) until ≥90% match. For
   stubborn sections, run Step 0 hard gate (Rule G).
8. **Output:** page authored + diff report. Wait for approval.

### Phase C — Cross-page reuse (for pages 2..N of a batch)
{{ONLY_IF_BATCH_MIGRATION}}
Per page, FIRST produce a section-by-section comparison vs already-approved
pages. Categorize each section: **REUSE** (1:1 author swap) /
**VARIATION** (same block, different config or custom class) /
**NEW** (full block-fit analysis). Default to REUSE.

### Phase D — Cross-viewport + cross-page QA
- Per-section pixel match table at 1440 / 768 / 390.
- Confirm previously approved pages unregressed.
- Verify safety-bar fragment unchanged across all pages.
- Verify shared assets unchanged unless explicitly approved.

---

## 4. Before you start

Ask me clarifying questions about anything ambiguous:
- AEM author URL / org / repo binding for UE
- Pixel-diff tolerance per breakpoint (default: 10% per section, 5% overall)
- Brightcove credentials / account IDs (if video blocks present)
- How references / footnotes should be authored (inline tooltip vs end-of-section list)
- Whether header / nav differs per section path
- Anything in the live source that doesn't obviously map to a library block

Do not begin Phase A until I confirm the answers.
```

---

## Placeholder filling guide

| Placeholder | Example |
|---|---|
| `{{BRAND_NAME}}` | Rinvoq HCP, Skyrizi HCP, Linzess, Mavyret, Venclexta, Rinvoq DTC |
| `{{BRAND_KEY}}` | `rinvoq-hcp`, `skyrizi-hcp`, `linzess`, `mavyret`, `venclexta`, `rinvoq-dtc` |
| `{{LIVE_HOMEPAGE_URL}}` | https://www.rinvoqhcp.com |
| `{{TARGET_URL}}` | https://www.rinvoqhcp.com/dermatology/dosing-lab-monitoring |
| `{{N}}` | 3 (page sequence number in batch) |
| `{{FULL_SCOPE_TABLE_IF_PART_OF_A_LARGER_BATCH}}` | Markdown table of all pages with execution order |
| `{{BRAND_CUSTOMIZED_BLOCKS}}` | Run `ls -d blocks/*/{{BRAND_KEY}}/ \| sed 's\|blocks/\|\|;s\|/{{BRAND_KEY}}/\|\|'` to enumerate |
| `{{BLOCK_LIST_OR_REFER_TO_REPO}}` | Inline list of 68 blocks OR "see `/blocks/` directory" |
| `{{ONLY_IF_BATCH_MIGRATION}}` | Remove section entirely if migrating one standalone page |

## How to use this template

1. Copy the entire fenced block above.
2. Replace all `{{...}}` placeholders.
3. Remove sections that don't apply (Phase A if done, batch table if standalone).
4. Use as your internal kickoff checklist.
5. Ask the clarifying questions in Section 4 before starting Phase A.
