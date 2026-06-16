# LEVEL UP H2H — Migration Handoff & Review Map

**Page:** `content/rinvoq-hcp/atopic-dermatitis/efficacy/rinvoq-vs-dupixent/level-up.plain.html`
**Live source:** https://www.rinvoqhcp.com/atopic-dermatitis/efficacy/rinvoq-vs-dupixent/level-up
**Status:** Content-complete, publish-clean, architecture matches live. Pixel tuning + section-order
confirmation pending a rendered preview (blocked on authenticated push from a headless env).

---

## Integrity snapshot
- 711 lines, 678/678 balanced divs, serves 200 (raw `.plain.html`)
- Blocks: 1 brand-explorer, 1 hero, 1 section-nav, 11 text-container, 5 table, 1 safety-bar, 0 tabs
- 13 `classes_customClass` section classes, 3 `section-id` anchors (overview/efficacy/safety)
- Provisional CSS appended to `styles/rinvoq-hcp/styles.css` (now 3876 lines)

## Authored section sequence (current document order)
1. brand-explorer (verbatim reuse from homepage)
2. hero `no-padding` — H1 "HIGHER-LEVEL DISEASE CONTROL*…" (Graphik Black) — `.level-up-hero`
3. section-nav `sticky mobile-menu` — anchors #overview / #efficacy / #safety
4. LEVEL UP Clinical Trial (Overview) — `.level-up-overview` #overview
5. RINVOQ MET SUPERIORITY… (H2H charts) — `.h2h-period-efficacy` #efficacy
6. POST-SWITCH SKIN SEVERITY DATA (Switch) — `.switch-period-efficacy`
7. Mean WP-NRS Improvement — `.wpnrs-improvement`
8. Mean EASI Improvement — `.easi-improvement`
9. Adverse Events table — `.ae-comparison-table` #safety
10. Label Highlights table — `.label-highlights-table` (+ job code US-RNQD-250235)
11. CTA "LEVEL UP your conversation" — `.level-up-cta`
12. boxed-warning (INDICATION) — verbatim reuse
13. full ISI (legal) — verbatim reuse, US-RNQ-250017
14. references (14 items)
15. Study Details - LEVEL UP (h3 Study Design + h3 Baseline Characteristics) — `.level-up-study-details`
16. MEASURE UP 1&2 Study Details (h3 Study Design + h3 Baseline Characteristics) — `.measure-up-study-details`
17. FOOTNOTES & DEFINITIONS (legal)
18. sticky safety-bar split (verbatim reuse, abbreviated+full ISI)
19. page metadata (brand, nav=/rinvoq-hcp/dermatology-nav, footer, title, description)

## OPEN QUESTIONS for the render pass (Step-0)
1. **Section order:** Live DOM walk (ambiguous due to hidden desktop/mobile variants) suggests live
   places Label-Highlights + Study Details BEFORE the Mean WP-NRS/EASI charts, with Footnotes between.
   Confirm true VISUAL order at preview, reorder blocks 7-17 if needed. Content is correct regardless.
2. **`classes_customClass` lands:** confirm all 13 classes appear on `.section` wrappers post-md2jcr
   (traced through aem.js — `classes-*` branch → expected to work, but verify on rendered DOM).
3. **Provisional CSS tuning:** exact H1 font-size, AE table column widths (live 718px), label-table
   gold header (rgb 255,209,0 = var(--color-gold)), CTA bg shade — tune vs pixel diff.
4. **§6/§7/§15/§16 anchor grouping** under #efficacy — confirm scroll-spy active states.

## Known limitations (escalate, do NOT patch base)
- Base `table.js` emits `<th scope="col">` on row 0 only; NOT `<th scope="row">` on row-header cells.
  Brief requires row scope → base-block a11y gap → escalate as separate ticket.

## Bugs caught & fixed during authoring
- `style_customDynamicClass` → `classes_customClass` (this repo's section model has no style_* fields;
  would have silently dropped all 13 section classes).
- `content-wide` removed from hero custom class (it's a `classes_contentWidth` select option, not a
  free-form class; width now handled by scoped `.section.level-up-hero` CSS).
- 3 `tabs` blocks → scroll + anchor-nav (live has no real tabs; one continuous scroll page).

## Cross-page regression status
Statically CLEARED: all 4 approved pages (home, dermatology/index, dosing-lab-monitoring,
real-patients) have 0 references to any of the 13 new section classes; no bare selectors in the
appended CSS. Rendered sweep still required after push.
