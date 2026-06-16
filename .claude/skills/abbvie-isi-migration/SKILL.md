---
name: abbvie-isi-migration
description: Guide for implementing the 3-layer ISI (Important Safety Information) pattern used across all 6 AbbVie brand sites. Covers the inline ISI section, floating safety bar, and header safety line. Handles brand-specific ISI variants including CLL-specific (Venclexta) and Black Box Warning (Rinvoq, Linzess) patterns. Use when building or migrating ISI blocks, safety bars, or indication statements.
---

# AbbVie ISI Migration Guide

Every page across all 6 AbbVie brand sites includes a **3-layer ISI architecture**. This is a regulatory requirement for pharma — every page must display the drug's safety information.

## Related Skills

- **abbvie-block-library**: Full block inventory reference
- **building-brand-blocks**: For implementing brand-specific ISI styling
- **abbvie-design-tokens**: For ISI-related color and typography tokens

---

## The 3-Layer ISI Architecture

### Layer 1: Header Safety Line
**Source selector:** `.abbv-header-v2-fl-safety`

Single-line indication statement displayed below the main header on every page. Some brands include an extended Black Box Warning.

**EDS implementation:** Include as part of the header fragment. The indication text is authored in the header content document. JS decoration reads `brand-config.js` to determine whether to show the Black Box Warning extension.

**Brand variants:**
| Brand | Content | Black Box Warning |
|---|---|---|
| SkyriziHCP | Indication for Ps and PsA | No |
| RinvoqHCP | Indication for AD | Yes — SERIOUS INFECTIONS, MORTALITY, MALIGNANCIES, MACE, THROMBOSIS |
| Rinvoq DTC | Consumer indication | Yes — same warnings, patient language |
| Linzess | Indication for IBS-C and CIC | Yes — PEDIATRIC (<2 years) |
| Venclexta | Indication for AML/CLL | No |
| Mavyret | Indication for HCV | No |

### Layer 2: Inline ISI Section
**Source selectors:** `.abbv-inline-use-isi`, `.abbv-inline-use`, `.abbv-inline-safety`, `.abbv-inline-miscisi`

Full ISI content at the bottom of main content, above the footer. Structure:
1. `abbv-inline-use` — **INDICATION** heading + rich text
2. `abbv-inline-safety` — **IMPORTANT SAFETY INFORMATION** heading + categorized safety text
3. `abbv-inline-miscisi` — Misc (reporting side effects, PI links, job code)

**EDS implementation:** `ISI` custom block authored as a Fragment reference. Content structure:
```
| ISI |
| --- |
| /fragments/isi/{brand} |
```

**ISI fragment content:**
```
### INDICATION
[Indication rich text]

### IMPORTANT SAFETY INFORMATION
[Safety categories as sub-headings with rich text]

### 
[Reporting info, PI links, job code]
```

**Brand ISI identifiers:**
- SkyriziHCP: US-SKZD-210594
- RinvoqHCP: US-RNQ-250017
- Linzess: US-LIN-250121
- Venclexta: US-VNCA-*
- Mavyret: US-MAVY-*

### Layer 3: Floating Safety Bar
**Source selectors:** `.abbv-safety-bar`, `.abbv-floating-isi-v2`, `.abbv-safety-bar-fade`

Fixed/sticky bottom bar with expand/collapse behavior. Shows a minimized preview with separate desktop and mobile variants.

**Sub-selectors:**
- `.abbv-safety-bar-button-plus` / `.abbv-safety-bar-button-minus` — expand/collapse toggles
- `.abbv-safety-bar-content-maximized` — fully expanded state
- `.abbv-safety-bar-content-minimized-desktop` / `.abbv-safety-bar-content-minimized-mobile` — collapsed states
- `.abbv-safety-bar-fade` — gradient overlay at bottom of minimized view

**EDS implementation:** Built into `scripts.js` auto-decoration:
1. On page load, detect the ISI block in the DOM
2. Clone abbreviated ISI content into a sticky bar DOM structure
3. Add expand/collapse toggle behavior
4. Apply brand-specific styling via CSS custom properties

**No separate authoring needed** — the floating bar is auto-generated from the ISI block content.

---

## ISI CSS Token Requirements by Brand

| Token | Skyrizi | Rinvoq | Linzess | Venclexta | Mavyret |
|---|---|---|---|---|---|
| `--color-safety-bar-bg` | `#fff` | `#f5f5f5` | `#fff` | `#f5f5f5` | `#0c2556` |
| `--color-safety-bar-border` | `#999` | `#ffd100` | none | `#ffd100` | none |
| `--border-radius-safety-bar` | `5px` | `0` | `16px 16px 0 0` | `0` | `0` |
| Safety bar text color | `#404040` | `#46484a` | `#4d4d4f` | `#46484a` | `#fff` |
| Shadow | none | none | `0 0 10px rgba(0,0,0,0.25)` | none | none |

---

## Venclexta CLL-Specific ISI Variant

The CLL pages on Venclexta use a distinct ISI structure:
- Selector: `.abbv-cll-isi`
- Sub-list formatting: `.abbv-isi-sublist`
- Dash bullet lists: `.isi-dash-bullet-list`

This requires a separate ISI fragment for CLL pages vs AML pages.

---

## Implementation Checklist

1. [ ] Create ISI fragment per brand in `/fragments/isi/{brand}.html`
2. [ ] Add `ISI` block code (`blocks/isi/isi.js` + `blocks/isi/isi.css`)
3. [ ] Implement floating safety bar in `scripts.js` (auto-decoration)
4. [ ] Add header safety line to header fragment
5. [ ] Apply brand-specific ISI styling via tokens in `styles/{brand}/themes.css`
6. [ ] Test expand/collapse behavior on desktop and mobile
7. [ ] Verify Black Box Warning display for Rinvoq and Linzess brands
8. [ ] Create CLL-variant ISI fragment for Venclexta
