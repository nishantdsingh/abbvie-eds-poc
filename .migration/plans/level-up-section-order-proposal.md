# LEVEL UP — Section Order Proposal (for render-pass confirmation)

**Purpose:** The one open authoring question. My authored order was driven by the brief's section
numbering; the live DOM walk (ambiguous due to hidden desktop/mobile variants) suggests a different
sequence. This proposal lays out CURRENT vs PROPOSED so the exact reorder can be confirmed against
the rendered preview, then applied in one safe pass. **No change has been made to the live
`.plain.html`** — this is a review artifact only.

---

## CURRENT authored document order
1. brand-explorer
2. hero (`.level-up-hero`)
3. section-nav (anchors #overview / #efficacy / #safety)
4. LEVEL UP Clinical Trial — Overview (`.level-up-overview`, #overview)
5. RINVOQ MET SUPERIORITY — H2H charts (`.h2h-period-efficacy`, #efficacy)
6. POST-SWITCH — Switch charts (`.switch-period-efficacy`)
7. Mean WP-NRS Improvement (`.wpnrs-improvement`)
8. Mean EASI Improvement (`.easi-improvement`)
9. Adverse Events table (`.ae-comparison-table`, #safety)
10. Label Highlights table (`.label-highlights-table`)
11. CTA "LEVEL UP your conversation" (`.level-up-cta`)
12. boxed-warning (text-container)
13. full ISI (text-container legal)
14. FOOTNOTES & DEFINITIONS heading + references
15. Study Details - LEVEL UP (`.level-up-study-details`)
16. MEASURE UP 1&2 Study Details (`.measure-up-study-details`)
17. sticky safety-bar
18. metadata

## PROPOSED order (IF live DOM walk is correct — CONFIRM AT RENDER)
Live landmark walk suggested Label Highlights + Study Details appear BEFORE the Mean WP-NRS/EASI
charts, with Footnotes between, and the full ISI/references as the trailing regulatory block:

1. brand-explorer
2. hero
3. section-nav
4. Overview (#overview)
5. H2H charts (#efficacy)
6. Switch charts (POST-SWITCH)
7. Adverse Events table (#safety)            ← AE/safety stays with efficacy cluster
8. Label Highlights table
9. Study Details - LEVEL UP
10. MEASURE UP 1&2 Study Details
11. Mean WP-NRS Improvement                   ← mean-improvement charts move AFTER study details
12. Mean EASI Improvement
13. FOOTNOTES & DEFINITIONS + references
14. CTA "LEVEL UP your conversation"          ← CTA position to confirm (may be before footnotes)
15. boxed-warning + full ISI                  ← trailing regulatory block
16. sticky safety-bar
17. metadata

## Why NOT applied blind
- Live DOM walk returned DUPLICATE landmarks (desktop+mobile hidden variants) → true visual order
  is not derivable from a static walk; needs rendered page with visibility filtering.
- Reordering involves moving the regulated full-ISI block (~60 lines) + 6 content sections.
  On ambiguous evidence this risks both content-fidelity errors and a worse-than-current result.
- The brief's hard rules: verbatim regulated copy, surface-don't-guess on compliance content.

## Recommended render-pass procedure
1. Load live + local at 1440px, capture each section's `getBoundingClientRect().top` for VISIBLE
   (display!=none) sections only → get the authoritative visual sequence.
2. Diff against CURRENT order above.
3. If different, reorder by moving whole `<div>…</div>` section blocks in the `.plain.html`
   (content unchanged — only block sequence). Keep section-id anchors with their sections.
4. Re-verify div balance + serve 200 + content-fidelity spot-checks after reorder.

**Content correctness does not depend on order** — every section is authored verbatim and complete.
Order is purely presentational sequence.
