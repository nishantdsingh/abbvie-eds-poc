# EDS Multi-Brand Project

## Custom Skill Selection Guide

**CRITICAL: When user requests match these patterns, invoke the corresponding skill immediately.**

### Brand Creation/Management Tasks
**Skill:** `building-brand`

**Trigger Patterns:**
- User says: "add brand", "create brand", "new brand", "setup brand", "configure brand", "remove brand", "delete brand"
- Combined with: brand names, identity, tokens, design tokens, fonts, colors
- Examples:
  - "add a new brand called roy"
  - "create brand identity for acme"
  - "setup a new brand"
  - "remove brand roy"
  - "configure brand tokens"
  - "add brand fonts"

### Block Development with Brand/Theme Support
**Skill:** `building-brand-blocks`

**Trigger Patterns:**
- User says: "create block", "build block", "implement block", "modify block", "new block", "block override", "block CSS"
- Combined with: brand, theme, multi-brand, override, variant, decoration, block-config
- Examples:
  - "create a new hero block with brand support"
  - "add brand override for the cards block"
  - "implement block-level CSS for roy brand"
  - "modify the tabs block decoration"
  - "add theme override CSS for the hero block"
  - "create a new block for the brand"

### Theme Creation/Management Tasks
**Skill:** `building-themes`

**Trigger Patterns:**
- User says: "add theme", "create theme", "new theme", "setup theme", "configure theme", "remove theme", "dark theme", "bright theme"
- Combined with: tokens, styles, CSS, override, variant
- Examples:
  - "add a dark theme"
  - "create a new theme called bright"
  - "configure theme tokens"
  - "add theme override styles"
  - "setup a new theme for brand roy"
  - "remove theme bright"
  - "customize theme colors"

### AbbVie Block Reference
**Skill:** `abbvie-block-library`

**Trigger Patterns:**
- User says: "which blocks", "block inventory", "block types", "block variations", "what blocks exist", "DOM selectors", "abbv selectors"
- Combined with: AbbVie, brand sites, Platform C, block list, migration blocks
- Examples:
  - "which blocks does Skyrizi use?"
  - "show me the accordion variations"
  - "what DOM selectors map to the hero block?"
  - "list all card variations across brands"

### AbbVie ISI Migration
**Skill:** `abbvie-isi-migration`

**Trigger Patterns:**
- User says: "ISI", "safety bar", "safety information", "floating ISI", "indication statement", "black box warning"
- Combined with: migrate, build, implement, create, style
- Examples:
  - "implement the ISI block for Rinvoq"
  - "build the floating safety bar"
  - "migrate the ISI pattern from Skyrizi"
  - "add black box warning for Linzess"

### AbbVie Design Tokens
**Skill:** `abbvie-design-tokens`

**Trigger Patterns:**
- User says: "design tokens", "brand colors", "brand fonts", "token values", "color palette", "typography scale"
- Combined with: Skyrizi, Rinvoq, Linzess, Venclexta, Mavyret, brand
- Examples:
  - "what are the Linzess brand colors?"
  - "show Mavyret typography tokens"
  - "what button style does Rinvoq use?"
  - "compare design tokens across brands"

### AbbVie Page Migration
**Skill:** `abbvie-page-migration`

**Trigger Patterns:**
- User says: "migrate page", "migrate site", "import page", "convert page", "move page to EDS"
- Combined with: Skyrizi, Rinvoq, Linzess, Venclexta, Mavyret, AbbVie, Platform C, abbv
- Examples:
  - "migrate the Skyrizi home page"
  - "import the Linzess FAQ page"
  - "start migration for Venclexta AML"
  - "convert Mavyret efficacy page to EDS"

### aemcoder Migration Orchestrator
**Skill:** `aemcoder-migration-orchestrator`

**Trigger Patterns:**
- User says: "migrate page with aemcoder", "use aemcoder to migrate", "aemcoder migration", "next page migration", "start migration for {brand} with aemcoder"
- Combined with: live pharma brand URL (rinvoqhcp.com, skyrizihcp.com, linzess.com, mavyret.com, venclexta.com), preview-aemcoder.adobe.io URLs
- Examples:
  - "migrate /dosing-lab-monitoring with aemcoder"
  - "next page migration for Rinvoq HCP"
  - "give me the prompt to migrate the H2H page with aemcoder"
  - "start migrating Skyrizi homepage via aemcoder"

### aemcoder Section Fix Loop
**Skill:** `aemcoder-section-fix-loop`

**Trigger Patterns:**
- User says: "section not matching", "{block} not matching live", "pixel diff for section", "fix {section} with aemcoder", "regression on {page}", "mobile breakpoint broken", "desktop view broken after mobile fix", "still not matching", "pixel comparison", "scan each node", "fix is limited to"
- Combined with: any specific block/section name (hero, brush card, cards-grid, header, footer, safety bar, brand explorer, glacier section, brushstroke)
- Examples:
  - "hero banner is not pixel perfect with aemcoder"
  - "safety bar maximized state doesn't match live"
  - "header mobile broken for /dermatology"
  - "brush card section not matching"

### Pharma Content Fidelity (auto-overlay)
**Skill:** `pharma-content-fidelity`

**Trigger Patterns:**
- User says: "ISI verbatim", "boxed warning", "regulatory content", "safety copy paraphrased", "references round-trip", "indication missing", "job code", "compliance"
- Auto-trigger: when work touches safety-bar, isi text-container, references, dosing tables, indication blocks, mechanism-of-action narratives, patient testimonial copy

### AbbVie Block xwalk Model Reference (per-block field details)
**Skill:** `abbvie-block-analysis`

**Trigger Patterns:**
- User says: "block model", "row mapping", "plain.html structure", "{block-name} fields", "applyCommonProps", "md2jcr error", "FieldGroup", "field hint", "orphan suffix", "block fields reference"
- Combined with: any block name (hero, cards-grid, accordion, safety-bar, etc.), questions about row count, plain.html row structure, field types
- Examples:
  - "what fields does the hero block have?"
  - "row mapping for cards-grid"
  - "md2jcr error on brand-explorer"
  - "how many rows in the accordion block table?"
  - "FieldGroup count for video block"

### AbbVie Page Templates (composition recipes per page archetype)
**Skill:** `abbvie-page-templates`

**Trigger Patterns:**
- User says: "page template", "page recipe", "compose {page-type}", "what blocks for {page-type} page", "homepage recipe", "dosing page structure", "real patients page", "H2H comparison page", "condition landing page"
- Combined with: starting a new page migration, asking which blocks to use, page archetype questions
- Examples:
  - "what's the recipe for a dosing & lab monitoring page?"
  - "how do I compose the H2H comparison page?"
  - "show me the canonical homepage section sequence"
  - "blocks needed for real patients page"

### Quick Reference

| Task Pattern | Skill | Purpose |
|---|---|---|
| "Add/create/remove brand", "brand tokens", "brand fonts" | `building-brand` | Full brand lifecycle: scaffold, tokens, fonts, styles, removal |
| "Create/modify block", "block override", "brand block CSS" | `building-brand-blocks` | Block development with multi-brand/theme CSS cascade |
| "Add/create/remove theme", "theme tokens", "dark/bright theme" | `building-themes` | Theme lifecycle: scaffold, tokens, styles, cross-brand themes |
| "Which blocks", "block types", "DOM selectors", "variations" | `abbvie-block-library` | 22 block types, 47 variations, AEM-to-EDS selector mapping |
| **"Block model", "row mapping", "plain.html structure", "{block} fields"** | **`abbvie-block-analysis`** | **Per-block xwalk model details: FieldGroup algorithm, Row Mapping, md2jcr publish rules. Top 20 deep + 48 pointers** |
| **"Page template", "page recipe", "compose {page-type}", "what blocks for X page"** | **`abbvie-page-templates`** | **Composition recipes for 5 pharma page archetypes: Homepage, Condition Landing, Dosing & Lab, Real Patients, H2H Comparison** |
| "ISI", "safety bar", "safety information", "black box" | `abbvie-isi-migration` | 3-layer ISI architecture, brand-specific safety patterns |
| **"ISI verbatim", "boxed warning", "regulatory content"** | **`pharma-content-fidelity`** | **Always-on overlay: verbatim safety copy, references round-trip, pharma a11y** |
| "Design tokens", "brand colors", "typography", "button style" | `abbvie-design-tokens` | Color, font, spacing tokens across 6 brands |
| "Migrate page", "import page", "convert to EDS" | `abbvie-page-migration` | End-to-end AEM Platform C to EDS page migration |
| **"Migrate with aemcoder", "aemcoder migration", "next page migration"** | **`aemcoder-migration-orchestrator`** | **Full aemcoder workflow: first-prompt scaffold, phases A→D, approval gates** |
| **"Section not matching", "{block} not matching live", "regression after fix"** | **`aemcoder-section-fix-loop`** | **Per-section diff → root-cause-tag → lowest-specificity-fix → regression-check loop** |

### Skill chaining for migrations

For any page migration, the typical chain is:

```
aemcoder-migration-orchestrator  (entry point — internal guidance for any new page)
    ↓
abbvie-page-templates            (pick the right composition recipe)
    ↓
abbvie-block-analysis            (per-block Row Mapping + md2jcr rules)
    ↓
aemcoder-section-fix-loop        (per-section repair when sections diverge)
    ↓
pharma-content-fidelity          (auto-overlay for any regulated-copy block)
```

**Execution context:** You ARE the migration agent. These skills are your
internal workflow — you execute them directly (scrape, author, render,
validate, report). You do NOT generate prompts for a separate tool.

The orchestrator's `templates/first-prompt.md` is your internal kickoff
checklist. The fix-loop's `templates/section-fix-prompt.md` is your
per-section repair checklist. Both reference pharma-content-fidelity's
hard rules for any safety/ISI/dosing/reference content.
