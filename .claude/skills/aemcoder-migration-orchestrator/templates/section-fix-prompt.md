# Canonical section-fix workflow

Follow this when a migrated page has one or more sections that diverge
from live source. This template enforces the diff → root-cause →
lowest-specificity fix → regression-check loop that prevents back-and-forth.

You execute this workflow directly. Fill in `{{...}}` placeholders
mentally from context.

---

```markdown
The **{{SECTION_NAME}}** on the migrated {{PAGE_NAME}}
({{LOCAL_PAGE_URL}}) does not match the live source at
{{LIVE_PAGE_URL}}.

Block: `{{BLOCK_NAME}}`
{{IF_BRAND_OVERRIDE_EXISTS}}Brand override path:
  `blocks/{{BLOCK_NAME}}/{{BRAND_KEY}}/_{{BLOCK_NAME}}.css`
  (partial) → compiled `{{BLOCK_NAME}}.css` (auto-generated).
{{IF_NO_BRAND_OVERRIDE}}Brand override does NOT exist for this block;
  creating one is a non-trivial decision — flag if needed and await
  approval before scaffolding.{{END_IF}}

Do NOT edit anything yet. Investigate, propose, await approval.

## Step 0 — Hard rules (apply throughout)

1. **No class renaming.** Class names diverge between Platform-C
   `abbv-*` and our EDS naming — do not rename our classes to match
   live. Match the *visual and behavioral outcome only*.
2. **Verbatim content.** Especially for any safety / clinical / dosing
   / reference / footnote / job-code copy. Zero paraphrase.
3. **No `!important`.** No base block edits.
4. **Lowest specificity first** (Step 5 below).
5. **Desktop regression protection** — capture baseline at Step 2
   before any change at Step 6.

## Step 1 — Confirm preconditions (1-liner each)

1. Is `brand: {{BRAND_KEY}}` set in page metadata? (If not, brand CSS
   layer isn't loading — most "deltas" disappear after fixing this.)
2. What additional variant/custom classes does the local block element
   carry? (Verbatim from rendered DOM.)
{{IF_RELEVANT}}3. What classes does the live block element carry? (Verbatim.)
4. How many block/section instances are in local vs live? (Count match.)
{{END_IF}}

## Step 2 — Desktop baseline (regression protection)

Snapshot the {{SECTION_NAME}} (and adjacent sections that share styling)
at 1440px desktop AND 1200px (breakpoint edge — often where bugs hide).
Save as baseline. Diff at 1440 + 1200 AFTER each fix. Any unintended
desktop change is regression unless approved.

## Step 3 — Live + local computed-style dump (HARD GATE)

**No CSS edit may be written before this step completes.**

1. **Live screenshot** of the section at 1440px AND 390px.
2. **Local screenshot** same viewports.
3. **Live computed styles** for every DOM descendant in the section.
   Required properties: display, position, width, max-width, min-width,
   padding, margin, gap, font-family, font-size, font-weight, line-height,
   color, background, background-image, background-size, background-position,
   border, border-radius, box-shadow, transform, z-index, plus `::before`
   and `::after`.
4. **Local computed styles** same descendants, same properties.
5. **Delta table** — one row per (descendant, property) where live ≠ local.

| Category | Live source | Local render | Severity (H/M/L) |
|---|---|---|---|
| Layout (grid, alignment, content width, stacking behavior) | … | … | … |
| Background / decoration (color, gradient, SVG, ::before/::after position) | … | … | … |
| Typography (font-family, font-weight, font-size in px, line-height) | … | … | … |
| Color (text, bg, CTA, accent) | … | … | … |
| Spacing (padding, margin, gap — px values) | … | … | … |
| Image / asset (src, aspect ratio, srcset, focal point, alt) | … | … | … |
| CTA (label verbatim, link target, style variant, hover state, ::after icon) | … | … | … |
| Responsive transition (where it stacks, breakpoint behavior) | … | … | … |
| Count / order of internal items | … | … | … |
| Footnotes / references / superscript markers | … | … | … |

{{IF_INTERACTIVE_SECTION}}
## Step 4 — Behavior diff

| Interaction | Live | Local |
|---|---|---|
| Initial state | … | … |
| Open / expand trigger | … | … |
| Animation (duration, easing, what animates) | … | … |
| Close / collapse trigger | … | … |
| Scroll behavior (body lock, internal scroll) | … | … |
| Focus management (where focus goes on open / close, focus trap) | … | … |
| Keyboard nav | … | … |
| ARIA attributes (`aria-expanded`, `aria-controls`, `role`) | … | … |
{{END_IF}}

## Step 5 — Root-cause tag per delta

For each delta in Step 3 (and Step 4 if applicable), tag exactly one
root cause:

1. **Author content** — UE field value wrong (text, image, link, count).
2. **Token** — `styles/{{BRAND_KEY}}/_tokens.css` value diverges
   brand-wide. Get approval before changing.
3. **Custom class + brand global CSS** — one-off variant for this
   section only. Add `classes_commonCustomClass` value + scoped rule
   in `styles/{{BRAND_KEY}}/_styles.css` under section-metadata `style` class.
4. **Brand block CSS partial** — recurring pattern needs brand-level
   block rule. Edit `blocks/{block}/{{BRAND_KEY}}/_{block}.css` then
   `npm run scaffold:build:block --block-name X --brand-name {{BRAND_KEY}}`.
5. **Section style variant** — section style option missing or needs
   mobile-specific rule. Edit `models/_section.json` + brand global CSS.
6. **Variant** — recurring block variant not in
   `blocks/{block}/block-config.js` `variations` array. Propose, await approval.
7. **Asset** — SVG / image / font file missing or wrong. Download from
   live source to `content/content/dam/abbvie-eds-poc/{filename}`.
   Never simulate with CSS gradients.
8. **Base block CSS** — bug in `blocks/{block}/{block}.css` affecting
   all brands. ESCALATE, do not patch.
9. **Base block JS** — `blocks/{block}/{block}.js` produces wrong DOM
   structure. ESCALATE, do not patch.
10. **A11y** — missing ARIA, missing focus trap, missing alt text,
    touch targets <44px. Brand CSS for hit-area; base JS for ARIA
    (escalate the latter).
11. **Fragment content** — fragment doc is wrong/stub. Fix in
    fragment source, verbatim from live.
12. **Fragment not referenced** — block is missing entirely. Add
    Fragment block + set reference path in UE.

## Step 6 — Propose fix plan (do not apply)

Output an ordered list. For each fix:
- Issue tag from Step 5
- File(s) to touch (exact paths)
- Mobile-first restructure vs additive media query (justify if max-width)
- Breakpoint(s) used (mobile <600, tablet 600–899, desktop ≥900)
- Desktop regression risk (low/med/high) + how guarded
- Cross-page impact (which other approved pages share this CSS / fragment)

Wait for approval before applying.

## Step 7 — Apply one fix at a time (after approval)

For each approved fix:
1. Apply (partial files + `npm run scaffold:build:block --block-name X --brand-name {{BRAND_KEY}}`
   if CSS partials touched).
2. **Desktop regression diff** at 1440 AND 1200 against Step 2 baseline.
   Any unintended change → revert and rethink.
3. Mobile snapshot at 390 + 768 tablet.
4. Report per-fix: desktop unchanged ✓/✗, mobile diff progress.

**Do not batch fixes.** Per-fix isolation makes regressions bisectable.

## Step 8 — Cross-page regression sweep

After all approved fixes applied, snapshot at 390 + 1440:
- Every previously approved page in the active batch.
- Confirm no shared-asset regression on:
  - Homepage (always)
  - Any page sharing the fragment edited (if Step 5 tagged Fragment)
  - Any page sharing the brand CSS partial edited

Report cross-page status.

## Stop conditions

- ≥{{MATCH_THRESHOLD:-90}}% match per viewport AND zero desktop
  regression AND zero cross-page regression: stop, await approval.
- Any base block change required: STOP and ask.
- Any token change affecting >1 page or >1 section: ASK before applying.
- 3 fix rounds and still below threshold: STOP, summarize blockers.
- A11y violation requiring base JS: STOP and ask (don't ship known
  a11y defect).

Begin with Step 1. Do not edit anything yet.
```

---

## Placeholder filling guide

| Placeholder | Example |
|---|---|
| `{{SECTION_NAME}}` | hero, brush card, glacier section, safety bar maximized state, header mobile |
| `{{PAGE_NAME}}` | Homepage, Dermatology, Dosing & Lab Monitoring |
| `{{LIVE_PAGE_URL}}` | https://www.rinvoqhcp.com/dermatology |
| `{{LOCAL_PAGE_URL}}` | https://preview-aemcoder.adobe.io/content/rinvoq-hcp/dermatology/ |
| `{{BLOCK_NAME}}` | hero, cards-grid, safety-bar, header, brand-explorer |
| `{{BRAND_KEY}}` | rinvoq-hcp, skyrizi-hcp, linzess, mavyret, venclexta, rinvoq-dtc |
| `{{MATCH_THRESHOLD}}` | 90 (default), 95 for header / safety-bar |

## Conditional sections to remove if not applicable

- `{{IF_BRAND_OVERRIDE_EXISTS}}` / `{{IF_NO_BRAND_OVERRIDE}}` — check
  with `ls blocks/{block}/{brand}/` and keep only the applicable branch.
- `{{IF_INTERACTIVE_SECTION}}` ... `{{END_IF}}` — keep Step 4 only for
  headers (hamburger), accordions, modals, safety-bar expand, carousels.
- `{{IF_RELEVANT}}` — keep live-class capture only when class-name
  divergence is part of the user-reported delta.
