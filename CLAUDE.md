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

### Quick Reference

| Task Pattern | Skill | Purpose |
|---|---|---|
| "Add/create/remove brand", "brand tokens", "brand fonts" | `building-brand` | Full brand lifecycle: scaffold, tokens, fonts, styles, removal |
| "Create/modify block", "block override", "brand block CSS" | `building-brand-blocks` | Block development with multi-brand/theme CSS cascade |
| "Add/create/remove theme", "theme tokens", "dark/bright theme" | `building-themes` | Theme lifecycle: scaffold, tokens, styles, cross-brand themes |
| "Which blocks", "block types", "DOM selectors", "variations" | `abbvie-block-library` | 22 block types, 47 variations, AEM-to-EDS selector mapping |
| "ISI", "safety bar", "safety information", "black box" | `abbvie-isi-migration` | 3-layer ISI architecture, brand-specific safety patterns |
| "Design tokens", "brand colors", "typography", "button style" | `abbvie-design-tokens` | Color, font, spacing tokens across 6 brands |
| "Migrate page", "import page", "convert to EDS" | `abbvie-page-migration` | End-to-end AEM Platform C to EDS page migration |
