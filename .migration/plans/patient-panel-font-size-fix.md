# Real Patients Patient-Panel Font-Size Fix (Desktop + Mobile)

## Objective
Make the patient-detail panel column headings (`h4` — CLINICAL PRESENTATION / MEDICAL HISTORY) and their bullet text (`ul li`) render at **16px** on **desktop (≥985px)** and **mobile (≤743px)**, matching the live site and the already-corrected tablet (744–984px) range.

> Execution requires **Execute mode** — this artifact is the plan only.

## Context / Findings
- **Page:** `content/rinvoq-hcp/atopic-dermatitis/real-patients.plain.html`
- **Selected block:** `.text-container.block` inside `tabs-panel > .text-container-wrapper:nth-child(2)` (the CLINICAL / MEDICAL columns).
- **DOM shape:** `text-container.block > div > p.text-container-text > div > h4` and `… > div > ul > li`. The `text-container-text` class is on the wrapping `<p>`, **not** on the `<h4>`/`<ul>`.
- **Root cause:** The existing desktop rules in `styles/rinvoq-hcp/styles.css` (~line 2972 `… > h4.text-container-text { font-size:16px }` and ~line 2986 `… > ul.text-container-text li { font-size:16px }`) never match, because they require the class to be on the `h4`/`ul`. As a result `h4` falls back to the base ~18px on desktop and mobile.
- **Already fixed at tablet:** the `744–899px` override block targets the real `h4` element at 16px. Desktop/mobile still need the equivalent correction.
- **Live target (verified at tablet, same on desktop/mobile):** `h4` = 16px / line-height 24px / weight 700; `li` = 16px.

## Approach
1. Correct the **desktop base** panel rules so they target the actual `h4` and `li` elements (drop the non-matching `.text-container-text` qualifier on `h4`/`ul`), setting both to 16px. Scope stays under `.section.real-patients-hero-section ~ .tabs-panel[role="tabpanel"] .text-container-wrapper:nth-child(2)`.
2. Add/repair the **mobile (≤899px / ≤743px)** rule so `h4` is 16px there too (it currently inherits 18px).
3. Keep all selectors scoped to the real-patients tab panel so no other page/section is affected.
4. No `!important`, no base-block edits, no content/`.plain.html` changes (CSS-only).

## Checklist
- [ ] Re-read the current desktop panel rules (~lines 2960–2992) and the mobile `≤899px` panel rules in `styles/rinvoq-hcp/styles.css` to confirm exact selectors/line numbers before editing.
- [ ] Update the desktop `h4` rule to target `… .text-container-wrapper:nth-child(2) .text-container h4` at `font-size:16px; line-height:24px; font-weight:700`.
- [ ] Confirm/﻿set the desktop `li` rule to target `… .text-container-wrapper:nth-child(2) .text-container ul li` at `font-size:16px` (fix the `ul.text-container-text` selector that doesn't match).
- [ ] Add a mobile-range (`≤743px` or within the existing `≤899px` block) `h4`/`li` 16px rule so mobile matches.
- [ ] Verify desktop (1280px): `h4` = 16px, `li` = 16px, columns still side-by-side.
- [ ] Verify mobile (390px): `h4` = 16px, `li` = 16px, columns stacked (intended mobile layout).
- [ ] Re-verify tablet (800px & 920px): still 16px and two-column (no regression from the earlier fix).
- [ ] Regression sweep: confirm no other section on real-patients (efficacy `text-two-columns`, ISI text-containers) changed font size; confirm no other page is touched (selectors are `.real-patients-hero-section`-scoped).

## Risks / Guardrails
- The `text-container-text` class sits on the `<p>` wrapper, so element-level (`h4`, `ul li`) selectors are required — avoid re-introducing the non-matching class qualifier.
- Keep specificity high enough to beat base `text-container.css` heading sizes without `!important`.
- Do not alter the tablet override already in place; only add desktop + mobile coverage.
