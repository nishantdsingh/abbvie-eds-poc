---
name: aemcoder-section-fix-loop
description: Repair a single section of an aemcoder-migrated page that diverges from the live source. Codifies the diff → root-cause-tag → lowest-specificity-fix → regression-check loop that prevents back-and-forth iterations. Use whenever a section on a migrated page does not pixel-match the live source — hero, brush card, glacier section, header, safety bar, brand explorer, cards-grid, formulary-lookup, text-container, etc. AGGRESSIVE TRIGGER PHRASES (auto-invoke whenever user types any of these during a migration session) — "still not", "not matching", "still off", "still broken", "still seems broken", "still issue", "pixel comparison", "pixel by pixel", "do screenshot comparison", "screenshot comparison", "scan each node", "scan each and every node", "scan all the html nodes", "fix is limited to", "compare with live", "compare with live site", "we have issues", "we have issue in", "Refer the skills", "Refer the skills to fix", "section X is not matching", "issues in few section", "{block-name} not matching live", "header/hero/safety-bar/footer not matching", "regression on {page}", "fix migration", "address review", "not approved", "{block-name} is not fixed", "{block-name} not fixed properly".
---

# aemcoder Section Fix Loop

## Execution context

**You execute this workflow directly.** When the user reports a section
not matching, follow the 9-step loop below. The prompt template in
`../aemcoder-migration-orchestrator/templates/section-fix-prompt.md`
is your internal checklist, not output for another tool.

Per-section repair workflow for any block on a migrated page that
diverges from live source. Replaces the ad-hoc iterate-on-screenshot
pattern with a structured 9-step loop:

```
0. Live+local computed-style + screenshot dump (HARD GATE — no edits before this)
1. Preconditions   → 2. Desktop baseline → 3. Side-by-side diff
4. Behavior diff   → 5. Root-cause tag  → 6. Fix proposal
7. Apply (1 at a time) → 8. Cross-page regression sweep
```

Hard stop conditions (≥90% match per viewport, 3-round cap, escalation
triggers) so we don't churn forever.

## Related skills

- **aemcoder-migration-orchestrator** — Parent skill governing the
  end-to-end migration phases. This fix-loop is invoked from Phase B/C/D
  when a section diverges.
- **pharma-content-fidelity** — Auto-triggers when the section is
  safety-bar, ISI, references, dosing, or any other regulated-copy
  block. Content diff precedes visual diff for those blocks.
- **abbvie-block-analysis** — Per-block field/Row Mapping + md2jcr rules.
  Consult before deciding whether a divergence is authoring, CSS, or
  base-block.
- **building-brand-blocks** — Reference for editing brand block CSS
  partials AND the pre-read-existing-CSS rule (AEMCODER-021).
- **abbvie-design-tokens** — Reference for token values when root-cause
  is brand-wide token divergence.

## When to use this skill

Trigger this skill on any of:
- "{section-name} is not matching live" (hero, cards-grid, header, etc.)
- "pixel diff for {section}"
- "regression on {page} after fixing {other-thing}"
- "mobile breakpoint broken for {section}"
- "desktop view broken after mobile fix"
- "fix {section} with aemcoder"
- All trigger phrases in this skill's description (aggressive auto-invoke)

## Step 0 — Live + local computed-style and screenshot dump (HARD GATE — AEMCODER-014, AEMCODER-015)

**THIS IS A HARD GATE. NO CSS EDIT MAY BE WRITTEN BEFORE STEP 0 COMPLETES.**

When auto-invoked (see trigger phrases in description), the FIRST action
MUST be to dump both live and local DOM + computed styles for the section
in question. Skipping this step is the #1 cause of back-and-forth thrash
(AEMCODER-014: 30 turns ping-ponging max-width values; AEMCODER-015:
12 user re-asks for screenshot comparison).

### Required dump (do BEFORE proposing any fix)

1. **Live screenshot** — Playwright (or browser) screenshot of the
   section on the live URL at 1440px AND 390px. Save to a known location.
2. **Local screenshot** — same section on the local preview URL at
   1440px AND 390px.
3. **Live computed styles** — for every DOM descendant in the section,
   collect `getComputedStyle()` output. Required properties at minimum:
   `display, position, width, max-width, min-width, height, min-height,
   padding, margin, gap, font-family, font-size, font-weight,
   line-height, color, background, background-image, background-size,
   background-position, border, border-radius, box-shadow, transform,
   z-index`. Plus pseudo-elements (`::before`, `::after`).
4. **Local computed styles** — same set on the local DOM.
5. **Delta table** — single side-by-side table, one row per DOM
   descendant, columns: [selector | property | live value | local value
   | match/diff].

### After the dump

- Identify ALL differences in one pass. Do NOT cherry-pick one delta to
  fix at a time.
- Write ONE consolidated CSS replacement that addresses ALL deltas,
  scoped per the CSS Selector Scope Check (AEMCODER-018) in the orchestrator.
- Only then proceed to Step 5 (root-cause tag) and Step 6 (fix proposal).

### Three-round circuit breaker

If a section has had >3 corrective prompts from the user without
reaching ≥90% match, STOP all further CSS edits and re-run Step 0 from
scratch. Delta-based fixing has compounding error — fresh dump resets
the baseline.

### Why this is a hard gate

The /access migration burned ~30 turns on the formulary section because
each CSS edit was reactive to one user comment without re-reading the
full live computed-style block. Step 0 collapses that pattern.

## The 12-category root-cause taxonomy (Step 5)

Every delta gets tagged with exactly one root cause. This is the most
important constraint in the skill — without categorizing, aemcoder
defaults to editing block CSS for what's actually an authoring issue
(or vice versa).

| # | Category | Fix scope | File path |
|---|---|---|---|
| 1 | **Author content** | UE field value | UE / `.plain.html` row |
| 2 | **Token** | Brand-wide value | `styles/{brand}/_tokens.css` (with approval) |
| 3 | **Custom class + brand global** | One-off section variant | `style_customDynamicClass` on Section Metadata (NOT `classes_*` — AEMCODER-023) + `styles/{brand}/_styles.css` scoped under that style class. For block-level one-off: `classes_commonCustomClass` on the block. |
| 4 | **Brand block CSS partial** | Recurring block pattern | `blocks/{block}/{brand}/_{block}.css` |
| 5 | **Section style variant** | Section-wrapper variant missing | `models/_section.json` + `styles/{brand}/_styles.css` |
| 6 | **Variant** | Recurring block variant | `blocks/{block}/block-config.js` `variations` array |
| 7 | **Asset** | SVG/image/font file | Download to `content/content/dam/abbvie-eds-poc/{filename}` |
| 8 | **Base block CSS** | Bug in base — affects all brands | ESCALATE, do not patch |
| 9 | **Base block JS** | DOM/behavior bug in base | ESCALATE, do not patch |
| 10 | **A11y** | ARIA, focus, alt, touch target | Brand CSS for hit-area; base JS for ARIA (escalate) |
| 11 | **Fragment content** | Fragment doc wrong/stub | Fix fragment source, verbatim from live |
| 12 | **Fragment not referenced** | Block missing entirely | Add Fragment block + reference path in UE |

## Lowest-specificity-first fix ordering (mandatory)

Never skip levels. Apply at the lowest level that resolves the delta:

```
1. Author content / fields      (most reversible)
2. Token                        (brand-wide; requires approval)
3. Custom class + brand global  (page-specific via section-metadata)
4. Brand block CSS partial      (brand-recurring pattern)
5. Section variant              (cross-section pattern)
6. Block variant + JS module    (cross-block pattern)
                                ↓
7. BASE block CSS / JS          ESCALATE — affects all 9 brands
```

If the agent reaches for level 7 without checking 1–6, push back.

## Hard rules

1. **No class renaming.** Class names diverge between Platform-C
   `abbv-*` and our EDS naming — do not rename local classes to match
   live. Match the *visual and behavioral outcome* only.
2. **Verbatim content.** Especially for safety / clinical / dosing /
   reference / footnote / job-code copy. Zero paraphrase. (See
   **pharma-content-fidelity** for the full ruleset.)
3. **No `!important`.** Per project convention. If you reach for it,
   the specificity strategy is wrong — escalate.
4. **No base block edits.** Use brand override path. Missing
   `blocks/{block}/{brand}/` folder means inheritance is intentional —
   don't auto-create unless a real visual delta needs it.
5. **Mobile-first cascade.** `@media (min-width: 600px)` and
   `@media (min-width: 900px)` for progressive enhancement. Avoid
   `max-width` retrofits unless mobile-first restructure would require
   base-block edits.
6. **Project root font-size is 10px.** `0.9rem` = 9px. Use absolute px
   when matching live's `14px`, `16px`, etc.
7. **Section-metadata FIRST** (AEMCODER-019): every custom section
   needs a `style` class authored before any CSS selectors targeting it.

## The 9-step loop summary

Full template in `../aemcoder-migration-orchestrator/templates/section-fix-prompt.md`.

### Step 1 — Confirm preconditions
- Is `brand: {brand-key}` set in page metadata?
- What variant/custom classes does the local block carry?
- (If relevant) What classes does the live block carry?
- Count match: local instances vs live instances?

### Step 2 — Desktop baseline (regression protection)
Snapshot at 1440px AND 1200px (breakpoint edge — often where bugs hide).
Save before any edit. Diff after EACH fix.

### Step 3 — Side-by-side content + visual diff (no edits)
Already done in Step 0 if auto-invoked. Otherwise, run it now.

### Step 4 — Behavior diff (interactive sections only)
Headers (hamburger), accordions, modals, safety-bar expand, carousels.
Capture: initial state, open/close triggers, animation, scroll behavior,
focus management, keyboard nav, ARIA attributes.

### Step 5 — Root-cause tag per delta
From the 12-category taxonomy above. Mandatory.

### Step 6 — Fix proposal (do not apply)
Ordered list per fix:
- Tag from Step 5
- File(s) to touch (exact paths)
- Mobile-first restructure vs additive media query
- Breakpoint(s) used
- Desktop regression risk + how guarded
- Cross-page impact (which other pages share this CSS/fragment)

### Step 7 — Apply one fix at a time
- Apply (partial files + `npm run scaffold:build:block --block-name X
  --brand-name {brand}` if CSS partials touched).
- Desktop regression diff at 1440 + 1200 against Step 2 baseline.
- Mobile snapshot at 390 + 768 tablet.
- Per-fix report.

**Do not batch fixes.** Per-fix isolation makes regressions bisectable.

### Step 8 — Cross-page regression sweep (MECHANICAL — AEMCODER-013)

Enumerate every previously approved page in the active batch (ask the
user or check session history if uncertain). For each:
- Re-snapshot at 1440px AND 390px.
- Diff against the pre-edit baseline you captured in Step 2 — OR if no
  pre-edit baseline exists for this page, diff against the user's
  last-approved visual state.
- Report ✓ unchanged or ✗ regressed per page per viewport.

**If ANY approved page shows unintended change:**
- Identify which file edit triggered it (see Shared-File Inventory in
  orchestrator SKILL.md).
- REVERT that edit.
- Narrow the fix scope — typically swap a brand-wide rule for a
  custom-class + scoped rule that only affects the in-progress page.
- Re-attempt Step 7 with narrower scope.

**Do not declare done while any approved page is regressed.** This was
the AEMCODER-013 root cause — declaring done before mechanically
verifying every approved page.

### Pre-edit-gate cross-reference (AEMCODER-013)

If your fix in Step 7 touches any file in the orchestrator's
Shared-File Inventory:

| File pattern | Triggers regression check on |
|---|---|
| `styles/{brand}/_tokens.css` | ALL approved pages in batch |
| `styles/{brand}/_styles.css` | ALL approved pages in batch |
| `blocks/{block}/{brand}/_{block}.css` | All approved pages using that block + brand |
| Fragment docs | All approved pages referencing the fragment |
| Block-config.js (base or brand) | All approved pages using that block |

If the file you're about to edit is in this inventory, the PRE-EDIT
GATE in the orchestrator skill applies — capture baselines for ALL
approved pages BEFORE the edit, not just the in-progress page.

## Stop conditions

- ≥90% match per viewport AND zero desktop regression AND zero
  cross-page regression: stop, await approval.
- Any base block change required: STOP and ask.
- Any token change affecting >1 page or >1 section: ASK before applying.
- 3 fix rounds and still below threshold: STOP, summarize blockers.
- A11y violation requiring base JS: STOP and ask (don't ship known defect).

## Common section types and their dominant root causes

| Section type | Most common root causes | Default fix path |
|---|---|---|
| **Hero** | Author content (wrong image asset), Brand block CSS (mobile layout), Asset (missing SVG) | Author + brand CSS partial |
| **Cards-grid (brush card variant)** | Author custom class missing, Asset (brush SVG), Brand block CSS (gold accent) | Custom class + brand global (under section-metadata) |
| **Header** | Fragment content (per-section nav not authored), Fragment not referenced, Brand block-config (active state per URL) | Fragment + brand block-config |
| **Safety bar** | Fragment content (paraphrased ISI), Pharma-fidelity rules, Brand block CSS (expand state) | Pharma-fidelity + fragment edit |
| **Brand explorer** | Base block JS (hoist logic), Author content (label text), Brand block CSS (bar bg color) | Author + brand CSS (escalate JS) |
| **Section with brushstroke/gradient** | Section style variant missing, Asset (SVG not downloaded), Custom class | Custom class + section variant + asset download |
| **Footer** | Fragment content, Brand block CSS (link colors) | Fragment + brand CSS |
| **Mobile breakpoint regression** | Missing mobile-first base in brand CSS, `!important` in section CSS, image hidden but container still has height | Mobile-first restructure in brand CSS |
| **Formulary-lookup decorations** | Double-decoration over brand block CSS (AEMCODER-021) | Pre-read existing brand CSS; don't duplicate |

## Anti-patterns to call out in aemcoder prompts

- "Do NOT rename `safety-bar-full-content` → `safety-bar-maximized` to match live"
- "If reaching for `!important`, specificity strategy is wrong — escalate"
- "Author content first, brand CSS last (before base)"
- "Capture baseline BEFORE any edit"
- "Per-fix isolation, never batch"
- "If proposing base-block edit, STOP — escalate"
- "Section-metadata `style` class FIRST, then CSS using `.section.<style-class>`"
- "Read existing brand block CSS BEFORE adding `::before`/`::after` decorations"

## When the loop hits 3 rounds without progress

1. **Wrong block selected for section** — Re-do block fit analysis; the
   section may need a different library block.
2. **Author content fundamentally wrong** — Source content may have a
   structure that doesn't fit any library block; flag for content team.
3. **Base block has bug** — Escalate to a separate PR; do not patch in
   migration scope.
4. **A11y defect requiring base JS** — Triage with user: defer fix to
   post-migration ticket, OR accept known defect, OR workaround in brand
   block-config.
5. **Pharma compliance + visual conflict** — Compliance wins; document
   the visual delta as accepted.
