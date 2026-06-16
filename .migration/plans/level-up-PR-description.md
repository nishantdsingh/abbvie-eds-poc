# PR: Migrate RINVOQ HCP — LEVEL UP H2H (RINVOQ vs DUPIXENT) page

Branch: `aem-20260608-1528` → `develop`

## Summary
Migrates the LEVEL UP head-to-head efficacy page
(`/rinvoq-hcp/atopic-dermatitis/efficacy/rinvoq-vs-dupixent/level-up`) from the live
Platform-C site to EDS, using existing blocks only. No new blocks, no base-block edits.

## Trackable changes in this PR
- **`styles/rinvoq-hcp/styles.css`** (+118 lines) — provisional scoped CSS for the page's
  section classes (hero, AE table, label-highlights table, CTA), authored from the live
  computed-style baseline. Every selector is prefixed with a page-unique `.section.level-up-*` /
  `.ae-comparison-table` / `.label-highlights-table` class.
- **`.migration/plans/level-up-h2h-handoff.md`** — reviewer map (section inventory, open
  questions, known limitations).
- **`.migration/plans/level-up-section-order-proposal.md`** — section-order analysis (current vs
  live-proposed).

> NOTE: The page content `level-up.plain.html` is **gitignored** (`*.plain.html` = local preview
> content) and is **not** part of this PR — it ships by publishing to the AEM author, not via git.

## Page content (authored, ships via AEM publish — not in this diff)
19 sections: brand-explorer · hero · section-nav (sticky anchor) · LEVEL UP Overview ·
H2H superiority charts · Switch-period charts · AE comparison table · Label Highlights table ·
Study Details (LEVEL UP) · MEASURE UP study details · Mean WP-NRS · Mean EASI ·
Footnotes & Definitions + References · CTA · Boxed Warning + full ISI · sticky safety-bar.
All chart/diagram/icon assets downloaded to `content/dam/abbvie-eds-poc/`.

## Validation performed (render-free gates — all pass)
- Content verbatim vs live; footnote round-trips (numeric refs 1–14 + symbols *†‡§¶||); job codes
  (US-RNQ-250017, US-RNQD-250235, US-MULT-250253) verbatim.
- md2jcr publish-hazard audit (no raw `<sup>`, metadata wrapped, no inline-img-in-richtext, all
  text-container row counts correct); orphan-suffix validator clean for all blocks used.
- Image alt-text (all content images have alt; decorative chat icon `alt=""`).
- Single H1; heading hierarchy (fixed POST-SWITCH h3→h2 to match live).
- Table cell-count consistency; div balance 678/678; serves 200.
- Cross-page regression statically cleared: 0 references to the new section classes on the 4
  approved pages (home, dermatology/index, dosing-lab-monitoring, real-patients); no bare selectors.

## Bugs caught & fixed during authoring
1. `style_customDynamicClass` → `classes_customClass` (this repo's section model has no `style_*`
   fields; wrong key would have silently dropped all 13 section classes).
2. `content-wide` removed from hero custom class (it's a `classes_contentWidth` select option, not
   a free-form class).
3. 3 `tabs` blocks → scroll + anchor-nav (live is one continuous scroll page, no real tabs).
4. POST-SWITCH SKIN SEVERITY DATA heading h3 → h2 (matches live).

## Known limitation (separate ticket, not patched here)
Base `table.js` emits `<th scope="col">` on row 0 only, not `<th scope="row">` on row-header
cells. Brief wants row scope → base-block a11y gap → escalate as separate ticket (no base edits
in migration scope).

## Test plan (requires AEM preview — pending authenticated push)
- [ ] Push page to AEM preview; confirm it renders.
- [ ] Confirm true visual section order (CTA/ISI trailing position) vs live; reorder if needed.
- [ ] Step-0 pixel comparison at 1440 / 1200 / 768 / 390 per section (≥95% target).
- [ ] Confirm `classes_customClass` lands on section wrappers; section-nav scroll-spy active states.
- [ ] Rendered regression sweep on the 4 approved pages at 1440 + 390.
