# AbbVie EDS Multi-Brand — Agents & Skills Reference

## Overview

This project uses 32 local skills (28 base + 4 AbbVie-specific) plus external plugin agents for migrating 6 AbbVie brand sites from AEM Platform C to Edge Delivery Services.

**Analysis source:** `/workspace/Analysis/page-analysis-report.html` — 56 pages, 22 block types, 47 variations across 6 brands.

---

## AbbVie-Specific Skills (NEW)

These 4 skills were created from the multi-brand page analysis and contain project-specific knowledge.

### `abbvie-block-library`
**Path:** `.claude/skills/abbvie-block-library/SKILL.md`
**Purpose:** Reference guide for all 22 AbbVie block types and 47 variations. Maps AEM Platform C (abbv-*) components to EDS blocks with DOM selectors, CSS requirements, and brand-specific patterns.
**When to use:** Building, styling, or migrating any block from AbbVie brand sites.
**Resources:** `resources/brand-css-patterns.md` — Quick reference for button styles, footer colors, hero gradients, safety bar styling per brand.

### `abbvie-isi-migration`
**Path:** `.claude/skills/abbvie-isi-migration/SKILL.md`
**Purpose:** Implements the 3-layer ISI (Important Safety Information) pattern: header safety line, inline ISI section, floating safety bar. Handles CLL-specific variant (Venclexta) and Black Box Warning (Rinvoq, Linzess).
**When to use:** Building ISI blocks, safety bars, or indication statements for any brand.

### `abbvie-design-tokens`
**Path:** `.claude/skills/abbvie-design-tokens/SKILL.md`
**Purpose:** Complete design token reference for all 6 brands. Documents colors, typography, spacing, borders, shadows, gradients, and button styles.
**When to use:** Implementing brand-specific styling, reviewing token values, creating component CSS.

### `abbvie-page-migration`
**Path:** `.claude/skills/abbvie-page-migration/SKILL.md`
**Purpose:** End-to-end guide for migrating AbbVie brand pages from AEM Platform C to EDS. Covers URL analysis, section decomposition, block mapping, ISI handling, and brand token application.
**When to use:** Starting migration of any AbbVie brand site page.

---

## Brand Management Skills (Multi-Brand Framework)

### `building-brand`
**Path:** `.claude/skills/building-brand/SKILL.md`
**Purpose:** Full brand lifecycle — scaffold, tokens, fonts, styles, removal.
**Triggers:** "add brand", "create brand", "new brand", "remove brand"

### `building-brand-blocks`
**Path:** `.claude/skills/building-brand-blocks/SKILL.md`
**Purpose:** Block development with multi-brand/theme CSS cascade.
**Triggers:** "create block" + brand/theme, "block override", "brand block CSS"

### `building-themes`
**Path:** `.claude/skills/building-themes/SKILL.md`
**Purpose:** Theme lifecycle — scaffold, tokens, styles, cross-brand themes.
**Triggers:** "add theme", "create theme", "dark theme"

### `token-naming`
**Path:** `.claude/skills/token-naming/SKILL.md`
**Purpose:** Mandatory naming formula for CSS custom properties.
**Triggers:** Authoring or reviewing design tokens at any layer.

---

## Content Import Pipeline Skills

| Skill | Purpose |
|---|---|
| `scrape-webpage` | Scrape content, extract metadata, download images |
| `identify-page-structure` | Identify section boundaries and content sequences |
| `page-decomposition` | Analyze content within sections for block mapping |
| `authoring-analysis` | Determine authoring approach (default content vs blocks) |
| `generate-import-html` | Create section structure with block tables and metadata |
| `preview-import` | Verify imported content in local dev server |
| `page-import` | End-to-end single page import orchestrator |
| `find-test-content` | Search for existing pages containing a specific block |

---

## Block Development Skills

| Skill | Purpose |
|---|---|
| `content-driven-development` | CDD process for all code changes |
| `building-blocks` | General EDS block development |
| `content-modeling` | Content models for block authoring |
| `block-collection-and-party` | Reference existing blocks as starting points |
| `analyze-and-plan` | Requirements analysis and acceptance criteria |

---

## Quality & Documentation Skills

| Skill | Purpose |
|---|---|
| `code-review` | Code quality, performance, accessibility |
| `testing-blocks` | Unit tests, browser tests, linting |
| `authoring` | Author-facing project documentation |
| `development` | Developer-facing project documentation |
| `admin` | Admin guide (Config Service, permissions, API) |
| `handover` | Full project handover documentation |
| `whitepaper` | PDF whitepaper generation |

---

## External Plugin Agents (excat:*)

These are provided by the Experience Catalyst plugin and handle automated migration workflows.

| Agent | Purpose |
|---|---|
| `excat:excat-site-migration` | Orchestrates full site migration |
| `excat:excat-site-analysis` | URL pattern analysis, page template skeletons |
| `excat:excat-page-analysis` | Single page content structure analysis |
| `excat:excat-import-script` | Import script development |
| `excat:excat-import-infrastructure` | Block parsers and page transformers |
| `excat:excat-content-import` | Execute content import for pages |
| `excat:excat-eds-developer` | EDS block development and code standards |
| `excat:excat-complete-design-expert` | Design system extraction and migration |
| `excat:excat-block-critique` | Visual comparison and CSS fix generation |
| `excat:excat-page-critique` | Full page visual validation |
| `excat:excat-navigation-expert` | Navigation structure migration |
| `excat:excat-eds-debugger` | Debug common EDS issues |
| `excat:block-mapping-manager` | Block mappings in page-templates.json |
| `excat:block-variant-manager` | Block variant lifecycle and reuse |
| `excat:excat-xwalk-expert` | HTML to JCR XML conversion |

---

## Brand-Specific Resources

### Token Files
| Brand | Tokens | Themes | Fonts |
|---|---|---|---|
| SkyriziHCP | `styles/skyrizi-hcp/tokens.css` | `styles/skyrizi-hcp/themes.css` | `styles/skyrizi-hcp/fonts.css` |
| RinvoqHCP | `styles/rinvoq-hcp/tokens.css` | `styles/rinvoq-hcp/themes.css` | `styles/rinvoq-hcp/fonts.css` |
| Rinvoq DTC | `styles/rinvoq-dtc/tokens.css` | `styles/rinvoq-dtc/themes.css` | `styles/rinvoq-dtc/fonts.css` |
| Linzess | `styles/linzess/tokens.css` | `styles/linzess/themes.css` | `styles/linzess/fonts.css` |
| Venclexta | `styles/venclexta/tokens.css` | `styles/venclexta/themes.css` | `styles/venclexta/fonts.css` |
| Mavyret | `styles/mavyret/tokens.css` | `styles/mavyret/themes.css` | `styles/mavyret/fonts.css` |

### Analysis Report
`/workspace/Analysis/page-analysis-report.html` — Complete HTML report with:
- 56 pages across 6 brands with blocks per page
- Cross-brand block matrix (22 types, 47 variations)
- DOM selector reference (120+ abbv-* selectors)
- EDS block mapping with authoring patterns
- ISI pattern documentation
- AEM component gap analysis
- 38 variation screenshots

### Prompts Library
`/workspace/PROMPTS.md` — End-to-end prompt playbook:
- Part 1: Claude Code Multi-Brand (9 phases)
- Part 2: Experience Catalyst AI (11 phases)
