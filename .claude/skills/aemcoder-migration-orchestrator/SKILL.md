---
name: aemcoder-migration-orchestrator
description: Orchestrate end-to-end page migration to the multi-brand EDS project using aemcoder.adobe.io. Use whenever the user wants to migrate a page from a live AbbVie commercial pharma brand site (rinvoqhcp.com, skyrizihcp.com, linzess.com, mavyret.com, venclexta.com, rinvoq.com) to the project using aemcoder. Provides the canonical first-prompt scaffold, sequences phases A→D, owns approval gates, references aemcoder-section-fix-loop for per-section repairs and pharma-content-fidelity for regulated copy. Trigger phrases include "migrate page with aemcoder", "use aemcoder to migrate", "start migration for X brand", "next page migration", "aemcoder migration".
---

# aemcoder Migration Orchestrator

## Execution context

**You ARE aemcoder.** This skill is internal guidance for YOU to follow
directly when migrating pages. You do not generate prompts for a separate
tool — you execute the workflow yourself: scraping, authoring content,
writing CSS, validating in preview, and reporting results back to the user.

The templates in `templates/` are reference documents that encode the
hard rules and workflow steps. Read them as your own instructions, not as
copy-paste output for another system.

---

This skill governs the full lifecycle of migrating any commercial pharma
brand page from a live `*.com` source into the multi-brand AbbVie EDS POC
project. The skill bakes accumulated migration lessons into a single
workflow so subsequent pages migrate in a handful of rounds rather than
the 80–130 rounds seen on early pages.

## Related skills

- **aemcoder-section-fix-loop** — Per-section diff → root-cause → fix loop
  with Step 0 hard gate. Invoke whenever a section diverges from live.
- **pharma-content-fidelity** — Always-on overlay for safety-bar, ISI,
  references, dosing, indication. Content diff precedes visual diff.
- **abbvie-page-templates** — Page archetype recipes (homepage, condition
  landing, dosing & lab, real patients, H2H comparison, custom/hybrid).
  Use BEFORE invoking this orchestrator to pick the right composition.
- **abbvie-block-analysis** — Per-block xwalk model details, Row Mapping,
  md2jcr publish rules (FieldGroup algorithm + orphan-suffix detection).
- **abbvie-block-library** — Brand × block usage matrix, Platform-C DOM
  selector mapping.
- **abbvie-design-tokens** — Per-brand token reference.
- **building-brand-blocks** — Block CSS development with brand cascade.
  Includes pre-read-existing-CSS procedural rule (AEMCODER-021).
- **ue-component-model** — UE component-model JSON wiring.

## Brand scope — 6 commercial pharma brands

| Brand key | Live domain | Special notes |
|---|---|---|
| `rinvoq-hcp` | rinvoqhcp.com | HCP site, per-condition nav |
| `skyrizi-hcp` | skyrizihcp.com | HCP site, similar per-condition pattern |
| `rinvoq-dtc` | rinvoq.com | DTC site, broader audience |
| `linzess` | linzess.com | Hash-based navigation pattern |
| `venclexta` | venclexta.com | CLL-specific ISI variant, clinical-data heavy |
| `mavyret` | mavyret.com | Univers Condensed font, alt-therapy clauses |

Plus 3 non-commercial brands in `brand-config.json` (`abbvie`, `botox`,
`rinvoq`) for corporate/other work. Skill is brand-agnostic — substitute
the brand key everywhere `{{BRAND_KEY}}` appears in templates.

## When to use this skill

Trigger this skill on any of:
- "migrate page with aemcoder", "use aemcoder to migrate"
- "next page migration" (after an earlier page is approved)
- "start migration for {brand}" (any commercial pharma brand)
- "migrate to {brand} EDS" combined with a live URL
- Any first-time aemcoder invocation against this repo

## Hard rules (apply throughout)

Full list in `templates/first-prompt.md` Section 2. Summary:

| Rule cluster | Headline |
|---|---|
| **Content fidelity** | Verbatim from live source DOM. No paraphrase, reorder, spelling fix. |
| **Class names** | Diverge by design. Do NOT rename local classes to match `abbv-*`. |
| **A11y** | Single H1, alt text, aria-label on icon-only, touch targets ≥44px. |
| **Scope ladder** | Author → custom-class+brand-global → brand-block override → token (with approval) → BASE = ESCALATE. |
| **No `!important`** | Never. |
| **Brand override is opt-in** | Missing `blocks/{block}/{brand}/` is intentional inheritance, NOT a gap. |
| **Regression protection** | Baseline before edit; diff every viewport of every approved page after edit. |
| **Fragments** | Pharma sites often per-condition nav — verify before assuming shared. |
| **Assets** | Live SVG/PNG → download to DAM. Never simulate with CSS gradients. |
| **Responsive** | Mobile-first; 10px root font-size; absolute px for matching live `14px`. |
| **Section-metadata FIRST** | Custom sections need `style` class before any CSS targeting them. |
| **Approval gates** | NEVER commit/push without explicit user approval. NEVER declare "done" without per-viewport screenshots + cross-page regression check. |

## Workflow phases

```
Phase A → Phase B → Phase C → Phase D
(audit)    (page 1)    (pages 2..N)    (cross-page QA)
```

### Phase A — Site-wide design audit (run once per brand)

Skip if previously done for this brand.

1. Aemcoder scrapes live homepage + 1 deeper page to extract design system.
2. Diff against `styles/{brand}/_tokens.css`. Report mismatches.
3. Confirm `_fonts.css` covers all weights/styles used by live source.
4. **User approval gate.** Do not modify tokens without explicit per-delta
   approval.

### Phase B — Single-page migration (page 1 of any batch)

Always the first page of the batch creates the infrastructure subsequent
pages depend on (fragment references, page metadata pattern, custom-class
naming, asset DAM paths).

1. Scrape live page; extract sections in document order.
2. Map each section to best-fit block from existing library. **Prefer reuse.**
   No new blocks. If a block is missing, STOP and ask.
3. **Author section-metadata `style` class FIRST** for every non-standard
   section, BEFORE any CSS (see CSS Selector Scope Check below).
4. Generate UE authoring tree: per-block field values matching
   `_{block-name}.json` model. Consult `abbvie-block-analysis` for Row
   Mapping (md2jcr field-group rules).
5. Apply `brand: {brand}` page metadata.
6. Render locally (`aem up`); pixel diff vs live at 1440 + 390.
7. For any section <90% match, invoke **aemcoder-section-fix-loop**.
8. **User approval gate** before moving to Phase C.

### Phase C — Cross-page reuse (pages 2..N of a batch)

For each subsequent page, BEFORE authoring:
1. Section-by-section structural diff vs already-approved pages.
2. Categorize each section: **REUSE** (1:1 author swap) / **VARIATION**
   (same block, different config) / **NEW** (full block-fit analysis).
3. Default to REUSE. NEW sections require full Phase B treatment.

For VARIATION sections that need a one-off styling delta, prefer a custom
class + brand global CSS rule (under a section-metadata `style` class)
over creating a new brand block override (which would bleed into pages
3..N unexpectedly).

### Phase D — Cross-viewport + cross-page QA

1. Per-section pixel match table at 1440 / 768 / 390.
2. Confirm previously approved pages unregressed (use Phase B baselines).
3. Verify safety-bar fragment unchanged across all pages.
4. A11y sweep (single H1, alt text, ARIA, heading order, touch targets).
5. Performance: ≥95 Lighthouse, no preload hints, no third-party in head.
6. **User approval gate** before commit/push.

## How to start a new page migration

```
1. Read `templates/first-prompt.md` as your internal kickoff checklist
2. Substitute placeholders mentally: {{BRAND_KEY}}, {{TARGET_URL}}, etc.
3. Begin Phase A (or skip if brand audit done)
4. Wait for user approval after each phase
5. For section divergences, invoke aemcoder-section-fix-loop
```

## AEMCODER-XXX failure-pattern IDs

References like "AEMCODER-013" or "AEMCODER-018" throughout the skills
are historical labels for specific failure patterns observed during
prior migrations. The prevention for each is encoded as a rule inside
the relevant skill (see Anti-patterns sections and the rules
cross-referenced by ID).

Currently 22 documented patterns (AEMCODER-001 through AEMCODER-022),
all incorporated into one of the skills. Key recent ones:

- **AEMCODER-013** — Shared-file edit regressed homepage during /access.
  Prevention: Shared-File Inventory + pre-edit gate (below).
- **AEMCODER-018** — Generic CSS selector regression. Prevention: CSS
  Selector Scope Check (below).
- **AEMCODER-017** — `scaffold:build` pollution. Prevention: Build
  Command Scope Check (below).
- **AEMCODER-019** — `:has()` and bare-block selectors. Prevention:
  section-metadata-first rule in `abbvie-page-templates`.
- **AEMCODER-021** — Double-decoration over brand block CSS. Prevention:
  read-existing-CSS-first rule in `building-brand-blocks`.
- **AEMCODER-022** — md2jcr FieldGroup orphan-suffix silent-drop +
  corrected row=group count. Prevention: `abbvie-block-analysis`
  md2jcr publish rules section.
- **AEMCODER-023** — Section custom class authored with `classes_*`
  silently fails. Sections use `style` / `style_*`; blocks use
  `classes_*`. Prevention: `abbvie-block-analysis` AEMCODER-023 entry
  + `abbvie-page-templates` Rule P1 + first-prompt rule C.

**When a NEW failure mode is discovered:**
- Add a one-line entry in the "Anti-patterns" section of the most
  relevant skill, with a short description and the prevention rule.
- Cite a new AEMCODER-XXX ID (next available number) for consistency.
- Do NOT recreate a JSON registry file — prevention rules live in
  skill prose.

## Cross-page regression protection (mandatory gate)

**Triggered by AEMCODER-013.** Phase D's end-of-phase check is
insufficient — regressions ship to local preview before the check runs.
The fix is a **pre-edit gate** + **shared-file inventory**.

### Approved pages (state)

At the start of any fix session, the user names the previously approved
pages in the active batch (or ask them). Add to your working list
whenever the user approves a new page.

### Shared-File Inventory (edit-to-page mapping)

These file paths affect MULTIPLE pages. Editing any of them requires
regression check against EVERY previously approved page in the active
batch:

| File pattern | Affects | Why |
|---|---|---|
| `styles/{brand}/_tokens.css` | ALL pages w/ `brand: {brand}` metadata | Brand-wide token cascade |
| `styles/{brand}/_fonts.css` | ALL pages w/ `brand: {brand}` | Brand-wide fonts |
| `styles/{brand}/_styles.css` | ALL pages w/ `brand: {brand}` | Brand-wide global rules |
| `styles/{brand}/themes/{theme}/_styles.css` | ALL pages w/ both `brand` + `theme` | Theme overlay |
| `blocks/{block}/{brand}/_{block}.css` | EVERY page using that block + brand | Brand block override |
| `blocks/{block}/block-config.js` | EVERY page using that block (all brands) | Block JS variants — high regression risk |
| `blocks/{block}/{brand}/block-config.js` | EVERY page using that block + brand | Brand block config override |
| Any Fragment doc (`/nav`, `/footer`, `/safety-bar`) | EVERY page referencing the fragment | Shared content |
| `models/_*.json` partials | EVERY page using affected block | UE authoring contract |
| `component-{models,definition,filters}.json` | EVERY page | NEVER edit manually — auto-generated |

Files that DO NOT trigger cross-page regression:
- The current page's own `.plain.html` (only affects this page)
- Custom-class rules scoped via `classes_commonCustomClass` + tight
  selectors under section-metadata `style` class
- A new asset under `content/content/dam/abbvie-eds-poc/` (only affects
  pages referencing it)

### PRE-EDIT GATE (mandatory before editing any shared file)

```
BEFORE editing a file in the Shared-File Inventory:
  1. Confirm active batch's previously approved pages (from user or session context).
  2. Snapshot EACH approved page at 1440px AND 390px.
  3. Save as baseline.

DURING editing:
  4. Apply the change.
  5. Run `npm run scaffold:build:block --block-name X --brand-name Y` if
     CSS partials touched. NEVER bare `scaffold:build`.

AFTER editing:
  6. Re-snapshot EACH approved page at 1440 + 390.
  7. Diff against pre-edit baselines.
  8. Any unintended visual change on ANY approved page = REGRESSION.
  9. If regression: REVERT, narrow the fix scope (custom class + scoped
     rule instead of brand-wide), re-attempt.
  10. Only declare done when ALL approved pages match their baselines.
```

### CSS SELECTOR SCOPE CHECK (AEMCODER-018)

**AEMCODER-013 added file-scope checking but selector-scope was missing.**
A generic block selector inside an approved file affects pages beyond
the active one.

**Rule:** any CSS rule in `styles/{brand}/_styles.css` that touches a
shared block class MUST be scoped under one of:

1. **Section-metadata style class** — `.section.<style-class> .<block> ...`
   (preferred — see AEMCODER-019 and abbvie-page-templates).
2. **Page body class** — `body.page-<slug> .<block> ...`
3. **Brand-scoped block CSS** — move the rule into
   `blocks/{block}/{brand}/_{block}.css` (still affects all pages
   using that block + brand, but at least it's the right layer).

**Forbidden generic selectors** (refuse to write these in `styles/{brand}/_styles.css`):
- `.cards-grid ...`, `.text-container ...`, `.image-text ...`, `.hero ...`
- `.formulary-lookup ...`, `.accordion ...`, `.tabs ...`, `.modal ...`
- `.safety-bar ...`, `.brand-explorer ...`
- Any `:has()` selector targeting a block class without section-class scope

**Detection:** before saving a CSS edit to `styles/{brand}/_styles.css`,
inspect each rule selector. If it starts with a bare block class, REFUSE
the edit and force re-scoping.

### BUILD COMMAND SCOPE CHECK (AEMCODER-017)

**Build commands have site-wide side effects.** Running
`npm run build:json` or `npm run scaffold:build` (no flags) recompiles
every brand's CSS, polluting the working tree with changes across
brands you're not migrating.

**Rule — before running any `npm run scaffold*` or `npm run build*`:**

1. **Prefer the targeted variant**:
   - `npm run scaffold:build:block --block-name X --brand-name Y` for
     a single block + brand (lowest blast radius).
2. **If you must run the un-targeted variant** (e.g. structural rebuild):
   - `git status` first — note clean baseline.
   - Run the build.
   - `git diff --stat` immediately after — verify ONLY the target brand's
     files changed.
   - Revert unintended changes to other brands or root compiled JSON.

## Stop conditions

- User has not approved current phase: do not advance.
- A NEW failure mode encountered: add to relevant skill's Anti-patterns
  section, ask user how to proceed.
- 3 rounds of back-and-forth on the same section without progress: stop,
  invoke aemcoder-section-fix-loop with stricter parameters or escalate.
- aemcoder proposes base-block edit: stop, escalate.

## Anti-patterns to call out in aemcoder prompts

Carry these into aemcoder prompts verbatim (they're in the first-prompt template):
- "Do NOT rename our classes to match live source `abbv-*` naming"
- "Verbatim safety copy — zero paraphrase, zero reorder"
- "Missing `blocks/{block}/{brand}/` is intentional inheritance, NOT a gap"
- "No `!important`, ever"
- "Never commit/push without explicit user approval"
- "Capture desktop baseline BEFORE any mobile fix"
- "When live uses SVG/PNG, download to DAM. Never simulate with CSS"
- "Section-metadata `style` class FIRST, then CSS using `.section.<style-class>`"
- "Read existing brand block CSS BEFORE adding `::before`/`::after`"
- "Row count = field GROUP count (after md2jcr `_groupFields()`), not raw field count"
