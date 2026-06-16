# Brand Migration Prompts Library

This file is your end-to-end reference for migrating a full brand website into this multi-brand EDS project with **100% pixel-perfect matching and validation**. It covers two complementary toolsets:

- **[Part 1 — Claude Code (Multi-Brand)](#part-1--claude-code-multi-brand-migration)** — Prompts for Claude Code using the skills in `.claude/skills/`. Use these when working inside this multi-brand project (`abbvie`, `botox`, `rinvoq`).
- **[Part 2 — Experience Catalyst AI (excat)](#part-2--experience-catalyst-ai-excat-migration)** — Prompts for the Experience Catalyst AI agent using `excat:*` skills. Use these for general EDS site analysis, import infrastructure generation, and pixel-perfect QA.

Both sets follow the same end goal: pixel-perfect, fully validated EDS pages. Use them together — excat handles site analysis and import orchestration, Claude Code handles multi-brand styling and token overrides.

Follow the phases **in order**. Do not skip phases or combine them.

---

## When to Use Which Tool

| Task | Use |
|---|---|
| Register a new brand, scaffold CSS structure | Claude Code — `building-brand` |
| Extract design tokens & apply brand styles | Claude Code — `building-themes` / `building-brand-blocks` |
| Explore full site structure and URL patterns | Experience Catalyst — `excat:excat-site-analysis` |
| Analyse individual page DOM and blocks | Experience Catalyst — `excat:excat-page-analysis` |
| Generate import infrastructure (parsers, transformers) | Experience Catalyst — `excat:excat-site-migration` |
| Pixel-perfect visual QA with automated CSS fixes | Experience Catalyst — `excat:excat-page-critique` / `excat-block-critique` |
| Import a single page manually | Claude Code — `page-import` |
| Preview imported content locally | Claude Code — `preview-import` |
| Build or modify block JS/CSS | Claude Code — `content-driven-development` |
| Debug broken rendering | Experience Catalyst — `excat:excat-eds-debugger` |
| UE component models | Claude Code — `ue-component-model` |
| Handover documentation | Claude Code — `project-management:handover` |

---

# Part 1 — Claude Code (Multi-Brand Migration)

---

## Quick Reference: Skills Used

| Skill | What It Does |
|---|---|
| `building-brand` | Scaffolds the new brand directory structure, tokens, and block overrides |
| `building-themes` | Manages theme registration and CSS cascade configuration |
| `scrape-webpage` | Downloads page HTML, images, screenshot, and metadata from source URL |
| `identify-page-structure` | Identifies section boundaries and content sequences from scraped output |
| `authoring-analysis` | Decides which content sequences become blocks vs default content |
| `generate-import-html` | Produces the final `.plain.html` authoring file |
| `preview-import` | Opens the local dev server and validates rendering against screenshot |
| `content-driven-development` | Orchestrates all block creation and modification work |
| `building-brand-blocks` | Implements block CSS overrides, tokens, and JS config per brand |
| `building-blocks` | Implements block JS and CSS from scratch or modifies existing blocks |
| `page-import` | Full single-page import orchestrator (Steps 1–5 above combined) |
| `ue-component-model` | Creates/edits Universal Editor field definitions for blocks |
| `block-inventory` | Surveys available blocks before deciding to create new ones |
| `code-review` | Reviews all changes before PR |
| `testing-blocks` | Validates blocks in browser before marking work complete |

---

## Phase 0: Project Setup

> Run once before any migration work begins.

---

### 0.1 — Start the dev server

```
Start the AEM dev server and the Gulp CSS watcher so I can preview pages locally.
```

**Runs:** `npm start`
**Validates:** Browser opens at `http://localhost:3000`, CSS changes recompile automatically.

---

### 0.2 — Register and scaffold the new brand

```
Create a new brand called {brand-name} in this project. Follow the building-brand skill.
```

**Skill:** `building-brand`
**Runs:** `npm run scaffold:create` → choose Brand → enter `{brand-name}`
**Creates:**
- `brand-config.json` updated with new brand
- `styles/{brand-name}/` with `_tokens.css`, `_styles.css`, `_fonts.css`, `_lazy-styles.css`
- `blocks/{block}/{brand-name}/_block.css` + `block-config.js` for all 38 blocks
**Validates:** `ls styles/{brand-name}/` and `ls blocks/hero/{brand-name}/` both show expected files.

---

### 0.3 — Set up your .env for the brand

```
Configure the .env file to proxy to {brand-source-url} on port 3000 so I can preview the source site locally for comparison.
```

**Edits:** `.env`
```
AEM_PAGES_URL=https://{brand-source-domain}/
AEM_PORT=3000
AEM_OPEN=/
BRANDS={brand-name}
```

---

## Phase 1: Design Tokens & Global Styles

> Extract the brand's visual identity before touching any blocks.

---

### 1.1 — Scrape the brand home page for visual reference

```
Scrape the home page of {brand-source-url} using the scrape-webpage skill. Save output to ./import-work/{brand-name}-home.
```

**Skill:** `scrape-webpage`
**Output:** `import-work/{brand-name}-home/screenshot.png`, `cleaned.html`, `metadata.json`, `images/`
**Validates:** Screenshot shows full-page render. All images downloaded.

---

### 1.2 — Extract design tokens from the source site

```
Analyse the screenshot at import-work/{brand-name}-home/screenshot.png and the source HTML at import-work/{brand-name}-home/cleaned.html. Extract all design tokens for the {brand-name} brand — colors, typography (font families, sizes, weights, line heights), spacing scale, border radius, and shadows. Map them to CSS custom properties in styles/{brand-name}/_tokens.css following the W3C design token standard. Import the base tokens first with @import '../tokens.css'.
```

**Skill:** `building-themes`
**Edits:** `styles/{brand-name}/_tokens.css`
**Validates:** Run `npm run scaffold:build`. Open `http://localhost:3000` with `brand` metadata set to `{brand-name}` — base colors and fonts should reflect the brand.

---

### 1.3 — Set up brand fonts

```
Add the {brand-name} custom web fonts to styles/{brand-name}/_fonts.css. Source the @font-face declarations from the font files in the fonts/ directory or from the source site CSS at {brand-source-url}. Map font family names to the --heading-font-family and --body-font-family tokens in _tokens.css.
```

**Skill:** `building-themes`
**Edits:** `styles/{brand-name}/_fonts.css`, `styles/{brand-name}/_tokens.css`
**Validates:** After `npm run scaffold:build`, headings and body text on any page with `brand: {brand-name}` metadata render in the correct fonts.

---

### 1.4 — Apply global layout and section overrides

```
Apply {brand-name} global layout overrides to styles/{brand-name}/_styles.css — section padding, max-width, background colors, link styles, and button styles — using the design tokens already defined in _tokens.css. Start with @import '../styles.css'.
```

**Skill:** `building-themes`
**Edits:** `styles/{brand-name}/_styles.css`
**Validates:** Open the home page preview. Section spacing and global link/button styles match the source site screenshot pixel-for-pixel.

---

## Phase 2: Header & Footer

> Migrate header and footer before any content pages — every page depends on them.

---

### 2.1 — Import header structure

```
Import the header from {brand-source-url} using the page-import skill. Only import the header block — skip all page body content. Save the output to import-work/{brand-name}-header/.
```

**Skill:** `page-import` → `scrape-webpage` → `authoring-analysis` → `generate-import-html`
**Output:** `{brand-name}-header/header.plain.html`
**Validates:** Preview at `http://localhost:3000/header` — header renders with correct structure (logo, nav links, utility links).

---

### 2.2 — Style the header for this brand (pixel-perfect)

```
Style the header block for the {brand-name} brand to match {brand-source-url} pixel-perfectly. Edit blocks/header/{brand-name}/_header.css. Use the design tokens from styles/{brand-name}/_tokens.css. Reference the screenshot at import-work/{brand-name}-home/screenshot.png for exact measurements, colors, and spacing.
```

**Skill:** `building-brand-blocks`
**Edits:** `blocks/header/{brand-name}/_header.css`
**Runs:** `npm run scaffold:build`
**Validates:**
- [ ] Logo size and positioning matches source
- [ ] Nav link font, size, color, spacing matches source
- [ ] Sticky/scroll behavior matches source
- [ ] Mobile hamburger menu matches source
- [ ] All hover/focus states match source

---

### 2.3 — Import and style footer

```
Import the footer from {brand-source-url} using the page-import skill. Save to import-work/{brand-name}-footer/. Then style blocks/footer/{brand-name}/_footer.css to match the source pixel-perfectly, using the {brand-name} design tokens.
```

**Skills:** `page-import` → `building-brand-blocks`
**Edits:** `blocks/footer/{brand-name}/_footer.css`
**Validates:**
- [ ] Footer columns and link groups match source
- [ ] Social icons, legal links, copyright text match source
- [ ] Background color matches `_tokens.css` value
- [ ] Mobile stacking order matches source

---

## Phase 3: Page-by-Page Content Migration

> Repeat this phase for every page on the brand site.

---

### 3.1 — Import a single page (full orchestration)

```
Migrate the page at {page-url} using the page-import skill. Brand is {brand-name}. Save scraped output to import-work/{brand-name}/{page-slug}/.
```

**Skill:** `page-import` (orchestrates all 5 sub-steps automatically)

Sub-steps run automatically:
1. `scrape-webpage` — downloads HTML, images, screenshot
2. `identify-page-structure` — maps section boundaries
3. `authoring-analysis` — assigns blocks or default content to every sequence
4. `generate-import-html` — writes the `.plain.html` file
5. `preview-import` — opens browser, validates render

**Validates (must all pass before moving on):**
- [ ] `import-work/{brand-name}/{page-slug}/screenshot.png` exists
- [ ] HTML file saved at correct path (from `metadata.json → paths.htmlFilePath`)
- [ ] Page renders at `http://localhost:3000/{page-path}` with no 404
- [ ] No raw HTML visible in browser
- [ ] All images load
- [ ] Block structure matches original layout

---

### 3.2 — If a block is missing or broken during import

```
The {block-name} block is not rendering correctly on {page-url}. Analyse the source HTML at import-work/{brand-name}/{page-slug}/cleaned.html, compare with the block structure in blocks/{block-name}/, and fix the generated HTML to match the expected block table format. Use the content-driven-development skill.
```

**Skill:** `content-driven-development` → `building-blocks`
**Validates:** Block renders correctly at `http://localhost:3000/{page-path}`.

---

### 3.3 — Migrate a batch of pages (repeat prompt)

For each page, run prompt 3.1 with the specific URL. Keep a checklist:

```
Migrate the following pages for the {brand-name} brand, one at a time, using the page-import skill:
1. {page-url-1}
2. {page-url-2}
3. {page-url-3}

After each page, confirm the preview passes before starting the next.
```

---

## Phase 4: Block-by-Block CSS Pixel-Perfect Pass

> After all pages are imported, audit every block used by the brand and make it pixel-perfect.

---

### 4.1 — Identify which blocks need brand CSS overrides

```
Open http://localhost:3000/{any-page-path} with brand set to {brand-name}. Compare every block on screen against the corresponding screenshot in import-work/{brand-name}/. List all blocks where the rendering does not match the source — note the specific differences (color, spacing, font, layout).
```

**Skill:** None (visual audit)
**Output:** A checklist of blocks needing CSS overrides.

---

### 4.2 — Apply CSS override for a single block

```
Make the {block-name} block pixel-perfect for the {brand-name} brand. 

Reference:
- Source screenshot: import-work/{brand-name}/{page-slug}/screenshot.png
- Source HTML: import-work/{brand-name}/{page-slug}/cleaned.html
- Current render: http://localhost:3000/{page-path} (brand={brand-name})

Edit blocks/{block-name}/{brand-name}/_{block-name}.css using the {brand-name} design tokens from styles/{brand-name}/_tokens.css. Start with @import '../{block-name}.css'. Run npm run scaffold:build after changes. Match spacing, colors, typography, and layout exactly.
```

**Skill:** `building-brand-blocks`
**Edits:** `blocks/{block-name}/{brand-name}/_{block-name}.css`
**Runs:** `npm run scaffold:build`

**Pixel-perfect checklist (per block):**
- [ ] Font family, size, weight, line-height match source
- [ ] Colors (text, background, border, icon) match source tokens
- [ ] Padding and margin values match source (use browser DevTools to measure)
- [ ] Grid/flex layout columns and gaps match source
- [ ] Image aspect ratios match source
- [ ] Mobile breakpoint layout matches source (resize to 375px, 744px)
- [ ] Tablet breakpoint layout matches source (resize to 768px, 1024px)
- [ ] Hover, focus, active states match source
- [ ] Animations and transitions match source

---

### 4.3 — Responsive validation for a block

```
Validate the {block-name} block for {brand-name} at mobile (375px), tablet (744px), and desktop (1280px) breakpoints. Compare against the source site {brand-source-url}/{page-path} at the same breakpoints. Fix any layout issues in blocks/{block-name}/{brand-name}/_{block-name}.css.
```

**Skill:** `building-brand-blocks`
**Validates:** Block layout at all three breakpoints matches source with no overflow, wrapping, or sizing differences.

---

## Phase 5: Block JS Behavior Overrides

> Only needed when a block should behave differently for this brand.

---

### 5.1 — Override block behavior via block-config.js

```
The {block-name} block needs the following behavioral difference for the {brand-name} brand:
{describe the difference — e.g. "accordion should expand all items by default", "cards should show a play button overlay"}

Update blocks/{block-name}/{brand-name}/block-config.js to implement this. Use the flags or decorations override pattern from the building-brand-blocks skill. Do not modify the base blocks/{block-name}/block-config.js.
```

**Skill:** `building-brand-blocks`
**Edits:** `blocks/{block-name}/{brand-name}/block-config.js`
**Validates:** Behavior applies only when `brand={brand-name}` is set in page metadata. Base behavior unchanged for other brands.

---

### 5.2 — Add a block variation for this brand

```
Add a new variation called {variation-name} to the {block-name} block for the {brand-name} brand. This variation should {describe behavior}. Add it to blocks/{block-name}/{brand-name}/block-config.js and create the variation JS module at blocks/{block-name}/{variation-name}.js. Follow the building-brand-blocks skill.
```

**Skill:** `building-brand-blocks` → `content-driven-development`
**Validates:** Variation renders correctly when the block has class `{block-name} {variation-name}` and brand is `{brand-name}`.

---

## Phase 6: Universal Editor Validation

> Ensure every block is authorable in the Universal Editor.

---

### 6.1 — Verify UE component model for a block

```
Verify that the {block-name} block has a complete Universal Editor component model in blocks/{block-name}/_{block-name}.json. Check that all visible content fields have a corresponding UE field, common properties are included via ../../models/_common-properties.json, and the block appears in component-definition.json. Use the ue-component-model skill.
```

**Skill:** `ue-component-model`
**Validates:**
- [ ] All text fields have `component: "richtext"` or `"text"` entries
- [ ] All image fields have `component: "reference"` entries
- [ ] All link fields have `component: "aem-content"` entries
- [ ] Common properties tab included
- [ ] Block appears in component-definition.json groups
- [ ] Block is in component-filters.json for section containers

---

### 6.2 — Add UE field for a new content property

```
Add a UE field for {field-name} to the {block-name} block. The field should be a {field-type} input with label "{label}". Add it to blocks/{block-name}/_{block-name}.json following the ue-component-model skill conventions.
```

**Skill:** `ue-component-model`
**Edits:** `blocks/{block-name}/_{block-name}.json`
**Validates:** After deploying, the field appears in the Universal Editor properties panel for the block.

---

## Phase 7: Pixel-Perfect Final Validation

> The quality gate before marking migration complete.

---

### 7.1 — Full page visual diff

```
Open {page-url} in the browser and open import-work/{brand-name}/{page-slug}/screenshot.png side by side. Do a section-by-section visual comparison and list every visible difference. For each difference, specify: block name, property that differs (color/size/spacing/font), source value, and current EDS value.
```

**Validates:** Produce a diff report. Every item in the report must be resolved before proceeding.

---

### 7.2 — Fix all remaining visual differences

For each item in the diff report from 7.1:

```
Fix the visual difference in the {block-name} block for {brand-name}: {property} should be {source-value} but currently shows {eds-value}. The token to use is {token-name} from styles/{brand-name}/_tokens.css. Edit blocks/{block-name}/{brand-name}/_{block-name}.css and run npm run scaffold:build.
```

**Skill:** `building-brand-blocks`

---

### 7.3 — Cross-page consistency check

```
Check that the following design properties are consistent across all migrated pages for {brand-name}: heading font sizes, body text color, primary button color, section background colors, and link hover states. Compare http://localhost:3000/{page-1}, http://localhost:3000/{page-2}, and http://localhost:3000/{page-3}. List any inconsistencies.
```

**Validates:** All pages use identical token values — no hardcoded values in block CSS.

---

### 7.4 — Accessibility validation

```
Check all migrated {brand-name} pages for accessibility issues: missing alt text on images, missing aria-labels on interactive elements, focus visibility, and heading hierarchy. Review blocks that use the accordion, tabs, and modal patterns especially. Use the testing-blocks skill.
```

**Skill:** `testing-blocks`
**Validates:**
- [ ] All images have non-empty alt text
- [ ] Interactive blocks have ARIA roles
- [ ] Focus indicators are visible
- [ ] Heading levels are sequential (no h1→h3 skips)
- [ ] Color contrast passes WCAG AA

---

### 7.5 — Mobile & performance validation

```
Validate the {brand-name} home page at http://localhost:3000/ for Core Web Vitals: check LCP element loads quickly, no layout shift on scroll, and no render-blocking resources. Resize to 375px and confirm no horizontal overflow. Use the testing-blocks skill.
```

**Skill:** `testing-blocks`
**Validates:**
- [ ] No horizontal scrollbar at 375px
- [ ] LCP element (hero image/heading) visible without scroll
- [ ] No layout shift when fonts load
- [ ] Images have width/height set to prevent CLS

---

## Phase 8: Code Review & PR

---

### 8.1 — Pre-PR code review

```
Review all changed files for the {brand-name} migration using the code-review skill. Check for: hardcoded values that should be tokens, CSS specificity issues, any !important overuse, missing @import in brand partials, and compiled CSS files that were manually edited instead of their _ partials.
```

**Skill:** `code-review`
**Validates:** No hardcoded hex colors, no manually edited compiled files, no CSS specificity hacks.

---

### 8.2 — Run linter

```
Run npm run lint and fix all errors before opening the PR.
```

**Runs:** `npm run lint:fix`
**Validates:** Zero lint errors on JS and CSS.

---

### 8.3 — Final scaffold build

```
Run npm run scaffold:build to ensure all brand CSS is freshly compiled from the _ partials and no compiled files are out of sync.
```

**Runs:** `npm run scaffold:build`
**Validates:** No git diff on compiled `*.css` files after the build (they should already be up to date if partials were the only things edited).

---

## Phase 9: Page Metadata Configuration

> Set brand metadata so pages load the correct CSS in production.

---

### 9.1 — Configure page-level brand metadata

In the SharePoint/Google Drive document for each migrated page, add a metadata table at the bottom:

| Metadata key | Value |
|---|---|
| `brand` | `{brand-name}` |

Or configure globally via **bulk metadata** (`metadata.xlsx`) for a URL path pattern:

| URL | brand |
|---|---|
| `/{brand-name}/*` | `{brand-name}` |

**Validates:** On the live/preview URL, open DevTools → Elements and confirm `<body class="{brand-name}">` is present, and the correct brand CSS is loaded in the Network tab.

---

## Full Migration Checklist

Use this as your go/no-go gate before declaring the migration complete.

### Setup
- [ ] Brand registered in `brand-config.json`
- [ ] Brand scaffold created (styles/ and blocks/ directories)
- [ ] `.env` configured for source site proxy

### Design Tokens & Global Styles
- [ ] `_tokens.css` — all brand colors, typography, spacing defined
- [ ] `_fonts.css` — all brand fonts declared
- [ ] `_styles.css` — global layout and section overrides applied
- [ ] `npm run scaffold:build` passes with no errors

### Header & Footer
- [ ] Header HTML imported and rendering
- [ ] Header CSS pixel-perfect at mobile, tablet, desktop
- [ ] Footer HTML imported and rendering
- [ ] Footer CSS pixel-perfect at mobile, tablet, desktop

### Content Pages
- [ ] All target pages imported (no truncated or missing sections)
- [ ] All pages preview without 404 or console errors
- [ ] All images load (no broken image placeholders)

### Block CSS Overrides
- [ ] Every block used by this brand has been audited against source screenshots
- [ ] All visual differences resolved in `_{block}.css` partials
- [ ] No compiled `*.css` files edited directly
- [ ] `npm run scaffold:build` re-run after all edits

### Block JS Overrides
- [ ] All behavioral differences implemented in brand `block-config.js`
- [ ] No base `block-config.js` files modified for brand-specific behavior

### Universal Editor
- [ ] All blocks have complete `_block.json` component models
- [ ] All blocks in `component-definition.json`
- [ ] Common properties included in applicable blocks

### Validation
- [ ] Side-by-side screenshot diff — zero visible differences
- [ ] Cross-page token consistency verified
- [ ] Accessibility checks passed (alt text, ARIA, focus, heading order)
- [ ] Mobile (375px) — no horizontal overflow
- [ ] Tablet (744px) — layout correct
- [ ] Desktop (1280px+) — layout correct
- [ ] Core Web Vitals baseline acceptable

### Code Quality
- [ ] `npm run lint` — zero errors
- [ ] No hardcoded color/size values in brand CSS (all via tokens)
- [ ] Code review completed via `code-review` skill
- [ ] PR opened with migration summary

---

# Part 2 — Experience Catalyst AI (excat Migration)

Here is the complete prompt playbook for Experience Catalyst AI — every skill in the correct execution order for a pixel-perfect site migration.

---

## Quick Reference: excat Skills

| Skill | What It Does |
|---|---|
| `excat:excat-site-analysis` | Analyses site URL patterns and groups pages into template skeletons |
| `excat:excat-page-analysis` | Deep-analyses a single page — sections, block variants, DOM structure, authoring decisions |
| `excat:excat-complete-design-expert` | Extracts full design system (tokens, typography, spacing) and applies it to the EDS project |
| `excat:excat-eds-developer` | Builds or modifies EDS blocks with JS decoration and CSS styling |
| `excat:excat-navigation-expert` | Migrates site navigation and creates local `nav.html` |
| `excat:excat-site-migration` | Main orchestrator — coordinates site analysis, block mapping, import infrastructure, and content import |
| `excat:excat-import-infrastructure` | Generates parsers, transformers, and import scripts without running content import |
| `excat:excat-import-script` | Generates the combined AEM EDS import script for a template |
| `excat:excat-content-import` | Executes the import scripts and produces HTML content files |
| `excat:block-mapping-manager` | Adds or updates block mappings in `page-templates.json` |
| `excat:block-variant-manager` | Manages block variant lifecycle — similarity matching before creating new variants |
| `excat:excat-page-critique` | Full-page visual diff between migrated page and original — generates CSS fixes |
| `excat:excat-block-critique` | Block-level visual diff — fixes CSS differences including hover states, transitions, responsive |
| `excat:excat-eds-debugger` | Debugs rendering, preview, and block issues |
| `edge-delivery-services:block-inventory` | Surveys all available blocks in the local project and Block Collection |
| `edge-delivery-services:block-collection-and-party` | Finds reference block implementations in Block Collection / Block Party |
| `edge-delivery-services:content-driven-development` | CDD workflow — content model first, then block implementation |
| `edge-delivery-services:content-modeling` | Defines authoring table structure, field hints, and UE model fields |
| `edge-delivery-services:building-blocks` | Implements block JS decoration and CSS styling |
| `edge-delivery-services:preview-import` | Opens local dev server and validates rendering |
| `edge-delivery-services:testing-blocks` | Runs unit tests, browser tests, and accessibility validation |
| `edge-delivery-services:code-review` | Reviews code for quality, performance, and EDS best practices |
| `project-management:handover` | Generates full project handover documentation |
| `project-management:authoring` | Generates author guide |
| `project-management:development` | Generates developer guide |

---

## Phase 1: Site Analysis & Planning

---

### 1.1 — Discover the Site Structure

```
Explore all pages on https://www.example.com/ and provide a complete
sitemap with page URLs, titles, and complexity ratings for each page.
```

**Skill:** General exploration — no specific skill required.
**Output:** Full sitemap with URL, page title, and complexity rating (simple / moderate / complex).
**Validates:** You have a complete picture of all pages before starting any import work.

---

### 1.2 — Analyse Page Templates & URL Patterns

```
Analyze site structure for https://www.example.com/ and create page
template skeletons for these URLs:

- https://www.example.com/page1
- https://www.example.com/page2
- https://www.example.com/page3

Group URLs by template pattern with name, description, and URL list.
```

**Skill:** `excat:excat-site-analysis`
**Output:** Template groups — each with a template name, description, and the list of URLs that share that pattern.
**Validates:** Every URL assigned to exactly one template. Similar page structures grouped together to avoid duplicate import infrastructure.

---

### 1.3 — Analyse Each Page (per unique template)

```
Analyze the page at https://www.example.com/page1 — identify all
content sections, block variants, authoring decisions, and DOM
structure. Produce analysis artifacts but do NOT generate import
infrastructure or content files.
```

**Skill:** `excat:excat-page-analysis`
**Output:** Analysis JSON, full-page screenshot, cleaned HTML.
**Note:** Run this once per **unique template**, not once per URL. If 10 pages share the same template, analyse only 1 representative page.
**Validates:** Analysis JSON exists with sections, block mappings, and DOM selectors documented.

---

### 1.4 — Survey Available Blocks

```
Survey all available blocks from the local project and Block Collection.
Show me what blocks exist and their purposes so I can understand what's
available for content modeling.
```

**Skill:** `edge-delivery-services:block-inventory`
**Output:** List of all local blocks + Block Collection blocks with descriptions.
**Validates:** You know what blocks are available before making authoring decisions or building new ones.

---

### 1.5 — Search Block Collection for a Specific Block Type

```
I need to build a {carousel/accordion/tabs/etc} block. Search the
Block Collection and Block Party for reference implementations I can
use as a starting point.
```

**Skill:** `edge-delivery-services:block-collection-and-party`
**Output:** Reference implementations with source code and usage examples.
**Validates:** No new block is built without first checking if a reference exists.

---

## Phase 2: Design System & Tokens

---

### 2.1 — Extract Full Design System (recommended starting point)

```
Extract the complete design system from https://www.example.com/ —
colors, typography, spacing, border-radius, shadows, and all CSS
custom properties. Create brand tokens and apply them to the EDS
project as a complete site design migration.
```

**Skill:** `excat:excat-complete-design-expert`
**Output:** Complete `styles/tokens.css` (or `styles/{brand}/_tokens.css`) with all CSS custom properties mapped.
**Validates:** After applying, heading fonts, body text, primary color, spacing, and button styles visually match the source site.

---

### 2.2 — Site-Level Design Tokens Only (global, no block styling)

```
Extract only the site-level design tokens (global colors, typography,
spacing) from https://www.example.com/ — do NOT apply block-level
styling yet.
```

**Skill:** `excat:excat-complete-design-expert` *(with "site design only" intent)*
**Use when:** You want to establish the token foundation before blocks are built, so block styling can reference tokens correctly from the start.
**Validates:** `:root` CSS variables in `_tokens.css` cover all brand colors, font stacks, and spacing scale.

---

### 2.3 — Block-Level Design Pass (after all blocks are imported)

```
Apply block-level design styling from https://www.example.com/ to all
migrated blocks. Match the original site's block styling pixel-perfect
including hover states, transitions, and responsive behavior.
```

**Skill:** `excat:excat-complete-design-expert` *(with "block design" intent)*
**Use when:** All blocks are imported and rendering structurally — this pass makes them visually match the source.
**Validates:** Side-by-side comparison of every block against the source shows zero visual differences.

---

## Phase 3: Block Development

---

### 3.1 — Develop a New Block

```
Implement a {block-name} block for AEM Edge Delivery Services.
It should {describe behavior and purpose}. Reference the original at
https://www.example.com/page#section for the expected design
and behavior.
```

**Skill:** `excat:excat-eds-developer`
**Output:** `blocks/{block-name}/{block-name}.js`, `blocks/{block-name}/{block-name}.css`
**Validates:** Block renders correctly at `http://localhost:3000/{test-page}` with no console errors.

---

### 3.2 — Content-Driven Development (preferred approach for new blocks)

```
Apply content-driven development to build the {block-name} block.
Start from the content model, then implement the JS decoration
and CSS styling.
```

**Skill:** `edge-delivery-services:content-driven-development`
**Note:** This is the preferred approach — it ensures test content and content models are defined before any code is written.
**Validates:** Block passes all CDD checklist items including test content rendering, content model parity, and visual match.

---

### 3.3 — Create Content Model for a Block

```
Create the content model for the {block-name} block. Define the
authoring table structure, field hints, and UE model fields that
authors will work with.
```

**Skill:** `edge-delivery-services:content-modeling`
**Output:** Authoring table structure, `_block-name.json` UE model.
**Validates:** Content model covers all visible fields. Every field has a UE component type assigned.

---

### 3.4 — Build or Modify Block Code

```
Build the {block-name} block with JavaScript decoration and CSS
styling. Follow AEM EDS patterns for block loading and decoration.
```

**Skill:** `edge-delivery-services:building-blocks`
**Note:** Only invoke after `content-driven-development` has established the content model and test content.
**Validates:** Block renders correctly with test content, all states (hover, focus, expanded) work.

---

## Phase 4: Navigation

---

### 4.1 — Migrate Site Navigation

```
Setup navigation for the site migrated from https://www.example.com/.
Extract the nav structure from the original site and create the
local nav.html with proper EDS navigation patterns.
```

**Skill:** `excat:excat-navigation-expert`
**Output:** `nav.html` (or brand-specific nav content) with full navigation structure.
**Validates:**
- [ ] All top-level nav links present
- [ ] Dropdown/mega-menu structure preserved
- [ ] Mobile hamburger menu works
- [ ] Active state styling applied

---

## Phase 5: Import Infrastructure & Content Migration

---

### 5.1 — Full Site Migration (recommended entry point)

```
Migrate these pages to AEM Edge Delivery Services:

- https://www.example.com/page1
- https://www.example.com/page2
- https://www.example.com/page3

Use the shared block library and create all necessary import
infrastructure including parsers, transformers, and import scripts.
```

**Skill:** `excat:excat-site-migration`
**This is the main orchestrator** — it internally coordinates:
- `excat:block-mapping-manager` — maps DOM selectors to block names in `page-templates.json`
- `excat:block-variant-manager` — checks for existing similar variants before creating new ones
- `excat:excat-import-infrastructure` — generates parsers and transformers
- `excat:excat-import-script` — generates the combined import script per template
- `excat:excat-content-import` — executes import and produces HTML files

**Validates:** All listed URLs produce `.plain.html` files that preview correctly in the local dev server.

---

### 5.2 — Import Infrastructure Only (parsers/transformers, no content yet)

```
Create import infrastructure for https://www.example.com/page1 —
generate block parsers, page transformers, and the import script.
Do NOT generate content files yet.
```

**Skill:** `excat:excat-import-infrastructure`
**Use when:** You want to review and validate the import scripts before running them against all URLs.
**Output:** `tools/importer/parsers/`, `tools/importer/transformers/`, import script skeleton.

---

### 5.3 — Generate Import Script for a Template

```
Develop an AEM EDS compatible import script for the {template-name}
template that combines the page template with block parsers and
page transformers.
```

**Skill:** `excat:excat-import-script`
**Output:** Fully assembled import script ready for execution.
**Validates:** Import script passes dry-run without errors.

---

### 5.4 — Execute Content Import

```
Execute content import for these URLs:

- https://www.example.com/page1
- https://www.example.com/page2

Run the import scripts, generate HTML content files, and verify
the output.
```

**Skill:** `excat:excat-content-import`
**Output:** `.plain.html` files at their correct paths.
**Validates:** All HTML files exist, images downloaded, metadata blocks present.

---

### 5.5 — Add Block Mappings to a Template

```
Add block mappings for the {block-name} variant to page-templates.json
for the {template-name} template. Use the DOM selectors identified
during page analysis.
```

**Skill:** `excat:block-mapping-manager`
**Edits:** `tools/importer/page-templates.json`
**Validates:** Block mapping entry uses exact AEM `cmp-*` class selectors from the source DOM.

---

### 5.6 — Manage Block Variants

```
Check for existing block variants and manage the variant lifecycle
for the {block-name} block. Perform similarity matching against
existing variants before creating new ones.
```

**Skill:** `excat:block-variant-manager`
**Validates:** No duplicate variants created. Similar variants reused via CSS modifier classes rather than new blocks.

---

## Phase 6: Preview & Verification

---

### 6.1 — Preview Imported Content

```
Preview and verify the imported content for {page-name}. Check
rendering in the local dev server, compare with the original page,
and identify any issues.
```

**Skill:** `edge-delivery-services:preview-import`
**Runs:** `aem up --html-folder {dirPath}`
**Preview URL:** `http://localhost:3000/{documentPath}`
**Validates:**
- [ ] Page loads without 404
- [ ] All blocks render — no raw HTML visible
- [ ] Images load or show correct placeholders
- [ ] Layout matches original screenshot
- [ ] No console errors

---

## Phase 7: Pixel-Perfect QA & Critique

> This is the most critical phase. Do not skip it. Repeat prompts 7.2 and 7.3 until zero differences remain.

---

### 7.1 — Full Page Visual Critique

```
Compare the migrated page at /content/{brand}/{page}.html against
the original at https://www.example.com/{page}. Identify every
visual difference — spacing, colors, fonts, layout, hover states,
responsive behavior. Generate CSS fixes and iterate until
pixel-perfect.
```

**Skill:** `excat:excat-page-critique`
**Output:** Annotated diff report with specific CSS fixes for each difference.
**Validates:** Diff report produced. All items triaged as fix / known-limitation / won't-fix.

---

### 7.2 — Individual Block Critique

```
Compare the {block-name} block rendering against the original at
https://www.example.com/{page}#{section}. Fix all CSS differences
including padding, margin, font-size, color, border-radius, shadows,
and transitions. Iterate until pixel-perfect match.
```

**Skill:** `excat:excat-block-critique`
**Edits:** `blocks/{block-name}/{brand}/_{block-name}.css`
**Pixel-perfect checklist:**
- [ ] Font family, size, weight, line-height match source exactly
- [ ] All colors match (use eyedropper on source screenshot to verify)
- [ ] Padding and margin values match (measure with browser DevTools)
- [ ] Grid/flex layout — column count, gaps, alignment match
- [ ] Image aspect ratios preserved
- [ ] Hover state color/underline/shadow matches
- [ ] Focus ring visible and styled correctly
- [ ] Transition speed and easing match source
- [ ] Mobile (375px) layout matches source
- [ ] Tablet (744px) layout matches source

---

### 7.3 — Iterate on Specific Fixes

```
The {block-name} block still has these visual differences vs the original:
- {specific difference 1, e.g. "Heading font-size is 2px too large"}
- {specific difference 2, e.g. "Card spacing is 8px wider than original"}
- {specific difference 3, e.g. "Hover transition is missing"}

Fix these specific issues and re-verify against the original.
```

**Skill:** `excat:excat-block-critique`
**Repeat this prompt** for each round of fixes until the block-critique returns zero differences.

---

### 7.4 — Stubborn CSS Gaps (apply design-expert after critique)

```
Apply block-level design styling from https://www.example.com/ to the
{block-name} block. The block-critique identified these remaining
gaps: {list gaps}. Use the complete-design-expert to resolve them.
```

**Skill:** `excat:excat-complete-design-expert` *(block design intent)*
**Use when:** `excat-block-critique` alone cannot resolve a CSS gap — usually means a token is missing or incorrectly valued.

---

## Phase 8: Debugging & Troubleshooting

---

### 8.1 — Debug Block Rendering Issues

```
The {block-name} block is not rendering correctly — {describe issue,
e.g. "image is missing", "layout collapsed", "JS decoration not running"}.
Debug and fix the issue.
```

**Skill:** `excat:excat-eds-debugger`
**Common causes:** Block name mismatch, malformed HTML table structure, missing JS export, image path issues.

---

### 8.2 — Debug Preview Issues

```
{Images are not loading / blocks are broken / styling is wrong} on
the preview of {page-name} at http://localhost:3000/{page-path}.
Troubleshoot and fix.
```

**Skill:** `excat:excat-eds-debugger`
**Common causes:** Missing `--html-folder` flag on `aem up`, image paths not relative (`./images/...`), block not in `blocks/` directory.

---

## Phase 9: Testing

---

### 9.1 — Test Block Code Changes

```
Test the {block-name} block code changes. Run unit tests for logic,
browser tests for rendering, and validate accessibility.
```

**Skill:** `edge-delivery-services:testing-blocks`
**Validates:**
- [ ] Unit tests pass
- [ ] Block renders in browser at all breakpoints
- [ ] No console errors
- [ ] Accessibility — alt text, ARIA roles, focus visible

---

## Phase 10: Code Quality

---

### 10.1 — Code Review Before PR

```
Review the code for quality, performance, accessibility, and EDS
best practices before opening a PR.
```

**Skill:** `edge-delivery-services:code-review`
**Validates:** No hardcoded values, no unused code, no `!important` overuse, images have dimensions, no render-blocking patterns.

---

## Phase 11: Documentation & Handover

---

### 11.1 — Full Handover Documentation

```
Generate complete project handover documentation including author
guides, developer guides, and admin guides.
```

**Skill:** `project-management:handover`
**Output:** Full handover doc covering authoring, development, and admin responsibilities.

---

### 11.2 — Authoring Guide Only

```
Generate a comprehensive authoring guide for content authors
taking over this project.
```

**Skill:** `project-management:authoring`
**Output:** Author-facing guide — how to use each block, metadata fields, and content patterns.

---

### 11.3 — Developer Guide Only

```
Generate a developer guide covering the codebase, custom blocks,
design tokens, and implementation details.
```

**Skill:** `project-management:development`
**Output:** Developer-facing guide — architecture, block patterns, CSS pipeline, brand override system.

---

## Recommended Execution Order for Pixel-Perfect Migration

```
STEP 1: Site Analysis
  └─ Prompt 1.1  Explore site → full sitemap
  └─ Prompt 1.2  excat:excat-site-analysis → template groups
  └─ Prompt 1.3  excat:excat-page-analysis × per unique template
  └─ Prompt 1.4  block-inventory → available blocks

STEP 2: Design System
  └─ Prompt 2.1  excat:excat-complete-design-expert (full extraction)
     OR
  └─ Prompt 2.2  excat:excat-complete-design-expert (tokens only)
     └─ Prompt 2.3 applied later after blocks are imported

STEP 3: New Blocks (only for blocks not already in the project)
  └─ Prompt 1.5  block-collection-and-party → find references
  └─ Prompt 3.1  excat:excat-eds-developer × per new block
     OR
  └─ Prompt 3.2  content-driven-development × per new block (preferred)
  └─ Prompt 3.3  content-modeling × per new block

STEP 4: Navigation
  └─ Prompt 4.1  excat:excat-navigation-expert

STEP 5: Content Migration
  └─ Prompt 5.1  excat:excat-site-migration (main orchestrator)
       ├─ internally: block-mapping-manager
       ├─ internally: block-variant-manager
       ├─ internally: excat-import-infrastructure
       ├─ internally: excat-import-script
       └─ internally: excat-content-import

STEP 6: Preview & Verify
  └─ Prompt 6.1  preview-import × per page

STEP 7: Pixel-Perfect QA  ← THE KEY PHASE — repeat until 100%
  └─ Prompt 7.1  excat:excat-page-critique × per page (full-page diff)
  └─ Prompt 7.2  excat:excat-block-critique × per block with issues
  └─ Prompt 7.3  iterate fixes × until zero differences remain
  └─ Prompt 7.4  excat-complete-design-expert (block design) for stubborn gaps
  └─ Prompt 2.3  design-expert block-level pass (if needed)

STEP 8: Debug
  └─ Prompt 8.1 / 8.2  excat:excat-eds-debugger — as needed

STEP 9: Final Testing
  └─ Prompt 9.1   testing-blocks
  └─ Prompt 10.1  code-review

STEP 10: Handover
  └─ Prompt 11.1  project-management:handover
```

---

## Quick Reference Card

| What You Want | Prompt Keyword | Skill |
|---|---|---|
| Explore a site | `"explore pages on {URL}"` | General exploration |
| Analyse URL patterns | `"analyze site structure"` | `excat:excat-site-analysis` |
| Analyse a single page | `"analyze page at {URL}"` | `excat:excat-page-analysis` |
| Extract design system | `"extract design from {URL}"` | `excat:excat-complete-design-expert` |
| Build a block | `"implement {block} block"` | `excat:excat-eds-developer` |
| Find reference blocks | `"search block collection for {X}"` | `block-collection-and-party` |
| Setup navigation | `"setup navigation from {URL}"` | `excat:excat-navigation-expert` |
| Migrate pages | `"migrate {URLs} to EDS"` | `excat:excat-site-migration` |
| Parsers/infrastructure only | `"create import infrastructure for {URL}"` | `excat:excat-import-infrastructure` |
| Import content | `"execute content import for {URLs}"` | `excat:excat-content-import` |
| Preview imported page | `"preview imported {page}"` | `preview-import` |
| Page-level pixel QA | `"compare migrated page vs original"` | `excat:excat-page-critique` |
| Block-level pixel QA | `"compare {block} vs original"` | `excat:excat-block-critique` |
| Debug issues | `"debug {block/page} not working"` | `excat:excat-eds-debugger` |
| Test blocks | `"test {block} code changes"` | `testing-blocks` |
| Code review | `"review code for quality"` | `code-review` |
| Handover docs | `"generate handover documentation"` | `project-management:handover` |

> **The pixel-perfect loop:** `excat-page-critique` finds gaps → `excat-block-critique` fixes individual blocks → `excat-complete-design-expert` (block design) resolves stubborn CSS mismatches → repeat until 100%.
