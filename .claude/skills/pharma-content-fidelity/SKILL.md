---
name: pharma-content-fidelity
description: Always-on overlay for any block carrying regulated pharmaceutical copy in AbbVie commercial brand sites. Enforces verbatim safety copy, Boxed Warning visual treatment, references round-trip, indication ordering, job code preservation, and pharma-specific accessibility rules. Auto-triggers on safety-bar, isi text-container, references, dosing-tables, indication, mechanism-of-action, and any block matching pharma-regulated copy patterns. Use whenever migrating, authoring, or fixing content that includes drug indications, contraindications, warnings, precautions, adverse reactions, drug interactions, dosing schedules, lab values, clinical trial references, or footnotes citing clinical studies.
---

# Pharma Content Fidelity

Overlay skill that enforces the regulatory-content rules pharma sites
require. Content fidelity supersedes pixel fidelity for any regulated
copy — a pixel-perfect safety bar with paraphrased copy is a compliance
defect, not just a polish issue.

This skill auto-triggers whenever the current work touches a block or
section carrying regulated pharma content. The first-prompt for any
aemcoder migration includes these rules verbatim (see
`aemcoder-migration-orchestrator/templates/first-prompt.md`).

## Related skills

- **aemcoder-migration-orchestrator** — Embeds these rules in the
  first-prompt template for every page migration.
- **aemcoder-section-fix-loop** — Defers content diff to this skill for
  any block matching regulated-copy patterns; content diff precedes
  visual diff.
- **abbvie-isi-migration** — Architecture for the 3-layer ISI (inline
  ISI section, floating safety bar, header safety line). This skill
  enforces the content rules within that architecture.
- **abbvie-block-analysis** — md2jcr publish rules for the text-container
  boxed-warning variant and references variant.

## When this skill applies

This skill is mandatory whenever any of these blocks/sections are in scope:

| Block / pattern | Why pharma content |
|---|---|
| `safety-bar` | Floating ISI (Important Safety Information) |
| `text-container.boxed-warning` / `*-isi-black-bg` | FDA Boxed Warning |
| `text-container.indication` | Drug indication statement |
| `text-container.contraindications` | Regulatory must-include |
| `text-container.warnings-precautions` | Regulatory must-include |
| `text-container.adverse-reactions` | Regulatory must-include |
| `text-container.references` / `references` block | Citation list, footnote markers |
| Dosing tables / lab monitoring tables | Clinical accuracy |
| `text-container.legal` | Job code, approval date, expiration date |
| Mechanism of action narrative | Regulated drug-class language |
| Patient testimonial copy | Consent / disclaimer rules |
| Any text containing superscript markers (¹, ², †, ‡) | References round-trip |

## Hard rules (regulatory)

### 1. Verbatim copy from live source DOM
- **Every word** of indication, contraindication, Boxed Warning, warning,
  precaution, adverse reaction, drug interaction, dosing guidance, lab
  value, reference, footnote, and patient counseling text must be
  byte-for-byte identical to live source.
- **No spelling fixes.** Even if live source has typos.
- **No punctuation "improvements."** Em-dash, en-dash, hyphen,
  curly-vs-straight quotes — preserve exactly.
- **No paraphrasing of drug class language.** "JAK inhibitor" is not
  interchangeable with "Janus kinase inhibitor" unless live says both.
- **No reordering of safety subsections.** Boxed Warning → Contraindications
  → Warnings & Precautions → Adverse Reactions → Use in Specific
  Populations → Drug Interactions → Patient Counseling — preserve source
  order.
- **No truncating.** All bullets, all subsections, all references.

### 2. Boxed Warning visual treatment is regulatory
- Must be visually distinct from body copy (border, background, weight).
- It's not decorative — it's regulatory. A correct-text Boxed Warning
  without the boxed treatment is still a compliance defect.
- Match the live source's exact treatment (color, border-thickness,
  background, heading styling).

### 3. References round-trip
- If body copy cites superscript footnotes (¹, ², ³, †, ‡, §), the
  references block / safety-bar reference list MUST contain matching
  entries.
- Cross-check BOTH directions:
  - Every superscript in body → has matching reference entry.
  - Every reference entry → has matching superscript citation in body.
- Reference text verbatim (author names, journal, volume, year, page).

### 4. Job code, approval date, expiration date metadata
- Pharma pages carry codes like `US-RNQ-250017`, `US-LNZ-XXXXXX`, `US-SKZ-XXXXXX`.
- These appear in footer / legal text and MUST be preserved verbatim.
- Approval date (e.g. "Approved 03/2024") and expiration date should be
  preserved if present in live source.

### 5. No `<img>` of text
- Regulatory copy must be real text (a11y + screen reader).
- If live source uses an image of text for safety copy (rare but
  observed), flag it — migrated version should use real text instead
  (which may itself need legal review).

### 6. Fragment is the source of truth
- Safety-bar is typically a Fragment shared across all pages in a brand
  section. Source of truth lives in the fragment document, NOT on
  individual page authoring.
- If safety-bar content is wrong on page N, fix the fragment once — it
  propagates to all referencing pages.
- Do NOT create page-specific safety-bar content. That fragments the
  source of truth and creates compliance drift.

## Content diff PRECEDES visual diff

For any safety-bar / ISI / references / dosing fix:

```
Step 0 — Content diff (THIS step)
  ↓ If any content mismatch: STOP, fix content first, do not proceed to visual
Step 1 — Behavior diff
  ↓
Step 2 — Visual diff
```

A pixel-perfect safety-bar with paraphrased copy is a regulatory problem.
A visually-mismatched safety-bar with verbatim copy is just polish.

### Content diff table template

| Subsection | Live source text (verbatim, first 200 chars) | Local text (verbatim, first 200 chars) | Status |
|---|---|---|---|
| Indication | … | … | match / mismatch / missing |
| Limitations of Use | … | … | … |
| Boxed Warning | … | … | … |
| Contraindications | … | … | … |
| Warnings & Precautions | … | … | … |
| Adverse Reactions | … | … | … |
| Use in Specific Populations | … | … | … |
| Drug Interactions | … | … | … |
| Patient Counseling | … | … | … |
| References / Footnotes list | … | … | … |
| Link to Full PI / Med Guide | … | … | … |
| Job code / approval date | … | … | … |

Then summarize: # subsections missing, # extra, # text differs (any
whitespace difference is mismatch).

## Pharma-specific accessibility rules

These apply to every regulated content block:

- **Single H1 per page.** Indication, brand name, page title each tempt
  multiple H1s — only one wins.
- **Alt text on every content image.** Required for figures, charts,
  diagrams, mechanism-of-action visuals.
- **`aria-label` on every icon-only control.** "+" / "−" expand toggles,
  close X, hamburger, chevron buttons.
- **Individual links per indication card.** A single `<a>` wrapping
  multiple distinct destinations defeats screen reader navigation.
- **Touch targets ≥44×44 px** for every interactive element in safety
  bar, ISI, references list.
- **Semantic table markup.** Clinical tables use `<th scope="row">` /
  `<th scope="col">`. Dosing tables especially.
- **Heading order.** No skipping levels (h2 → h4 without h3). Boxed
  Warning's heading must be at the right level for outline.
- **Focus management.** Safety-bar expand must trap focus inside the
  expanded panel; close must restore focus to the trigger.
- **References as ordered list.** `<ol>` not `<p>` with line breaks.
  Each reference is a separate `<li>` for screen-reader nav.

## Anti-patterns observed in migration history

1. **Abbreviated indications list** — dropped PsA + pJIA from RINVOQ
   indication. Required full verbatim restore from live DOM.
2. **Dropped "Limitations of Use"** — required FDA language, missing
   entirely from migrated safety-bar.
3. **Boxed Warning section missing in expanded state** — collapsed
   state had it, expanded state lost it. Both states must show it.
4. **8+ subsections truncated** — GASTROINTESTINAL PERFORATIONS,
   LABORATORY ABNORMALITIES, EMBRYO-FETAL TOXICITY, VACCINATION,
   MEDICATION RESIDUE IN STOOL, LACTATION, HEPATIC IMPAIRMENT,
   ADVERSE REACTIONS — all dropped in initial migration.
5. **"INDICATIONS" subheading missing** — heading text gone, body kept.
6. **Used `<em>` arbitrarily** — drug names sometimes need italic per
   FDA convention, but `<em>` semantic ≠ italic visual.
7. **Used `<strong>` for emphasis** when live used `<span class="bold">`
   or `<b>` — semantic difference matters for assistive tech.
8. **`<sup>` reference markers wrapping awkwardly on mobile** —
   superscript markers must stay attached to preceding word; use
   `white-space: nowrap` on the parent inline.
9. **Mavyret-style alternative-therapy clauses dropped** — non-applicable
   in some brands but documented as a recurring pattern across brands.

## Required first-prompt section for aemcoder

When migrating a page that includes any pharma-regulated content, the
first-prompt MUST include a Section 2.A "Content fidelity" block. The
canonical version is in
`../aemcoder-migration-orchestrator/templates/first-prompt.md` Section 2.A.
Quote it verbatim — do not paraphrase the rule list.

## Compliance gates (block migration approval until met)

Before declaring a page "done" for any page containing regulated content:

- [ ] Content diff vs live source: 100% match on every safety subsection.
- [ ] References round-trip verified (both directions).
- [ ] Job code present and correct.
- [ ] Boxed Warning visually distinct (verify computed CSS at 1440 + 390).
- [ ] Single H1, alt on all images, aria-label on icon-only controls.
- [ ] Heading order valid (no skipped levels).
- [ ] Touch targets ≥44×44 px on safety-bar interactive elements.
- [ ] Safety-bar fragment edited (NOT per-page content) if content is
      shared.
- [ ] Expanded state ALSO content-verified (not just collapsed).

If any unchecked item: do not approve, do not commit, do not push.
