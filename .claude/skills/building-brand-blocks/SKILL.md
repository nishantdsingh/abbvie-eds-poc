---
name: building-brand-blocks
description: Guide for creating new blocks or modifying existing blocks in the EDS Multi-Brand project with full brand and theme hierarchy support. Use this skill whenever creating a new block from scratch or making changes to existing blocks that involve JavaScript decoration, CSS styling, block-config.js, brand-level CSS overrides, theme-level CSS overrides, or brand+theme combined overrides. Covers scaffold generation, multi-brand file structure, renderBlock/decorateBlock JS pattern, block-config.js wiring, CSS cascade hierarchy, and brand-specific visual delta work.
---

# Building Brand Blocks

This skill guides you through creating new AEM Edge Delivery blocks or modifying existing ones in the **EDS Multi-Brand** project, following Content Driven Development (CDD) principles. Blocks are the reusable building blocks of AEM sites — each transforms authored content into rich, interactive experiences through JavaScript decoration and CSS styling. This project extends the standard AEM boilerplate with multi-brand and multi-theme support, so blocks follow an extended file structure.

## Related Skills

- **content-driven-development**: MUST be invoked before using this skill to ensure content and content models are ready
- **block-collection-and-party**: Use to find similar blocks for patterns
- **building-themes**: Use when brand or theme overrides need to be created alongside a block
- **building-brand**: Use when a new brand needs to be scaffolded before brand block overrides can be added
- **testing-blocks**: Automatically invoked after implementation for comprehensive testing

## When to Use This Skill

This skill should ONLY be invoked from the **content-driven-development** skill during Phase 2 (Implementation).

If you are not already following the CDD process:
- **STOP** — Do not proceed with this skill
- **Invoke the content-driven-development skill first**
- The CDD skill will ensure test content and content models are ready before implementation

This skill handles:
- Creating new block files and structure
- Implementing JavaScript decoration with multi-brand rendering
- Configuring `block-config.js`
- Adding base CSS and brand/theme override CSS
- Code quality and testing

## Prerequisites

**REQUIRED before using this skill:**
- ✅ Test content must exist (in CMS or local drafts)
- ✅ Content model must be defined
- ✅ Test content URL must be available

**Information needed:**
1. **Block name**: What should the block be called?
2. **Content model**: The defined structure authors will use
3. **Test content URL**: Path to test content for development

## Block Naming Rules

Block names must be **generic and content-type-based** — never embed a brand name or theme name:

```
# CORRECT — describes the content, usable across all brands
hero, cards, tabs, columns, carousel, accordion, feature-list

# WRONG — brand or theme name embedded in the block name
roy-hero, bright-cards, test-tabs
```

If a block needs to look or behave differently per brand, use the brand override structure (`{brand}/_{block}.css`, `{brand}/block-config.js`) — not a separate brand-named block.

## Prefer Variations Over New Blocks

**Creating a new block is a last resort.** Before creating one, work through this checklist in order:

1. **CSS variation** — Can the visual difference be achieved with a CSS class modifier on the existing block? Add the variant style in `_{block}.css`.
2. **flags** — Can the difference be gated with a boolean in `block-config.js`? (e.g. `showBadge: true`)
3. **variations** — Does the brand need a distinct JS-rendered variant? Add `{ variation: 'name', module: 'name.js' }` to the block-config.
4. **decorations** (`beforeDecorate` / `decorate` / `afterDecorate`) — Does the brand need different decoration logic? Override only the relevant hook.
5. **New block** — Only if the functionality is genuinely too different to express as an override (e.g. entirely different content model or interaction).

Unnecessary new blocks fragment the codebase and multiply maintenance cost. Exhaust the options above before reaching for a new block.

---

## Scaffold Command (Recommended for New Blocks)

For new blocks use the scaffold generator — it creates all required files including brand and theme folders automatically:

```sh
npm run scaffold:create
```

When prompted: choose **Block**, then enter the block name. The generator reads `brand-config.json` and creates:
- Base JS, CSS, and `block-config.js`
- A `themes/{theme}/` folder per configured theme
- A `{brand}/` folder per configured brand (with `_block.css`, `block-config.js`, and `themes/{theme}/` subfolder)

After scaffolding, implement the logic manually per the steps below.

## Multi-Brand Block File Structure

```
blocks/{block-name}/
├── {block-name}.js              # Base decoration logic (exports decorateBlock + default decorate)
├── {block-name}.css             # Base styles
├── block-config.js              # Block config: flags, variations, decoration hooks
├── themes/
│   └── {theme}/
│       ├── _{block-name}.css    # Partial: imports base + adds theme overrides (source)
│       └── {block-name}.css     # Compiled output (generated by scaffold:build)
└── {brand}/
    ├── _{block-name}.css        # Partial: imports base + adds brand overrides (source)
    ├── {block-name}.css         # Compiled output
    ├── block-config.js          # Brand-specific block config overrides
    └── themes/
        └── {theme}/
            ├── _{block-name}.css  # Partial: imports brand CSS + adds brand+theme overrides
            └── {block-name}.css   # Compiled output
```

**Key rule:** `_block.css` (underscore prefix) are the **source partials** — edit these. `block.css` files without the underscore are **compiled outputs** generated by `npm run scaffold:build`. Only commit both if you run the build; otherwise commit only the `_` partials and let CI build the rest.

## CSS Cascade Hierarchy

Styles layer in this order (each level can override the previous):

1. `blocks/{block-name}/{block-name}.css` — base styles (all brands/themes)
2. `blocks/{block-name}/{brand}/_{block-name}.css` — brand-specific overrides (imports base)
3. `blocks/{block-name}/themes/{theme}/_{block-name}.css` — theme overrides (imports base)
4. `blocks/{block-name}/{brand}/themes/{theme}/_{block-name}.css` — brand+theme overrides (imports brand CSS)

The `_block.css` partials always start with `@import '../{block-name}.css';` (or the appropriate relative path) so the cascade is explicit.

## Process Overview

1. Verify Prerequisites (CDD completed)
2. Find Similar Blocks (for patterns and reuse)
3. Create or Modify Block Structure
4. Implement JavaScript Decoration
5. Configure `block-config.js`
6. Add CSS Styling (base, brand overrides, theme overrides)
7. Build Compiled CSS
8. Test the Implementation
9. Document Block

## Detailed Process

### 1. Verify Prerequisites

**Before proceeding, confirm with the user:**

"Do you have:
- ✅ Test content created (URL or path)?
- ✅ Content model defined?

If not, we need to use the content-driven-development skill first."

If prerequisites are not met, STOP and invoke the **content-driven-development** skill.

### 2. Find Similar Blocks

**For new blocks or major modifications:**

1. Search `blocks/` for similar blocks that provide useful patterns or code to reuse
2. Use the **block-collection-and-party** skill to find relevant reference blocks

Review the existing blocks (cards, tabs, hero, header, footer, columns) for decoration and CSS patterns.

**For minor modifications:** Skip to step 3.

### 3. Create or Modify Block Structure

#### Decision Tree — start here every time

```
Does the block already exist in blocks/?
│
├── YES → Does the brand need JS changes, or CSS-only styling?
│         │
│         ├── CSS-ONLY → Go to Step 6 (brand override CSS).
│         │              Skip Steps 4–5 entirely.
│         │
│         └── JS CHANGES NEEDED → Determine which category:
│
│               A) FLAGS
│                  The base block already renders correctly but a feature
│                  needs to be toggled on/off per brand.
│                  → Add/override a boolean flag in the brand block-config.js:
│                    flags: { featureName: true }
│                  The base block JS must read the flag via blockConfig.flags.
│
│               B) VARIATIONS
│                  The brand needs a visually or behaviourally distinct
│                  variant loaded from a separate JS module.
│                  → Add an entry in the brand block-config.js variations array:
│                    { variation: 'class-name', module: 'variant.js' }
│                  The variant file lives alongside the brand block-config.js.
│
│               C) DECORATIONS
│                  The brand needs custom decoration logic. Choose the hook:
│                  - beforeDecorate: setup/pre-processing before main render
│                  - decorate: replace the main decoration entirely
│                  - afterDecorate: post-processing / enhancements after render
│                  → Import the relevant function from the base block JS and
│                    override in the brand block-config.js decorations object.
│
└── NO (block not available) → Source it from the block collection, THEN
                               create full brand structure alongside the base files.
                               See "New block from collection" below.
```

---

#### Existing block — CSS-only brand override

1. Locate `blocks/{block-name}/{brand}/_{block-name}.css` (scaffold creates this)
2. Add brand-specific rules after the existing `@import` — see Step 6
3. Run `npm run scaffold:build` to compile
4. **Skip Steps 4–5**

#### Existing block — JS brand change (flags / variations / decorations)

1. Open `blocks/{block-name}/{brand}/block-config.js`
2. Add only the config keys that differ from the base:

```javascript
// blocks/{block-name}/{brand}/block-config.js

// A) Flag override
export default async function getBlockConfigs() {
  return {
    flags: { showBadge: true },
  };
}

// B) Variation override
export default async function getBlockConfigs() {
  return {
    variations: [{ variation: 'split', module: 'split.js' }],
  };
}

// C) Decoration override
import { decorateBlock } from '../{block-name}.js';
export default async function getBlockConfigs() {
  return {
    decorations: {
      beforeDecorate: async (ctx) => { /* brand pre-processing */ },
      decorate: async (ctx, blockConfig) => decorateBlock(ctx, blockConfig),
      afterDecorate: async (ctx) => { /* brand post-processing */ },
    },
  };
}
```

The runtime merges root and brand `block-config.js` — only specify keys you need to override.

#### New block from block collection

1. Copy or reference the base block files into `blocks/{block-name}/`
2. **Immediately create brand structure** — either via scaffold or manually:

```sh
npm run scaffold:create
# Choose: Block → enter block name
# Scaffold reads brand-config.json and creates brand + theme folders automatically
```

Manual structure to create for each brand in `brand-config.json`:

```
blocks/{block-name}/
└── {brand}/
    ├── _{block-name}.css        ← @import '../{block-name}.css'; + brand overrides
    ├── {block-name}.css         ← compiled (generated by scaffold:build)
    ├── block-config.js          ← brand config overrides (start empty)
    └── themes/
        └── {theme}/
            ├── _{block-name}.css  ← @import '../../{block-name}.css'; + brand+theme overrides
            └── {block-name}.css   ← compiled
```

Do not leave a block without brand folders if brands are registered in `brand-config.json` — the build pipeline expects them.

Then continue with Steps 4–6 to implement JS decoration and CSS.

### 4. Implement JavaScript Decoration

The multi-brand JS pattern separates decoration logic from rendering:

```javascript
// {block-name}.js
import { renderBlock } from '../../scripts/multi-theme.js';

/**
 * Decorates the block DOM structure.
 * Called from block-config.js decorations hook.
 * @param {Element} block
 */
export async function decorateBlock(block) {
  // Transform the authored block HTML
  // Example: build a list from rows
  const items = [...block.children].map((row) => {
    const item = document.createElement('div');
    item.className = 'item';
    item.append(...row.children);
    row.replaceWith(item);
    return item;
  });
  // items is now available for further manipulation
}

/**
 * Default export — entry point called by AEM runtime.
 * Delegates to multi-theme renderBlock which handles brand/theme routing.
 * @param {Element} block
 */
export default async function decorate(block) {
  renderBlock(block);
}
```

**Key points:**
- `decorate(block)` always calls `renderBlock(block)` — do not put decoration logic here
- Actual DOM transformation goes in `decorateBlock(block)` (or `beforeDecorate`/`afterDecorate`)
- `decorateBlock` is referenced by `block-config.js`, not called directly from `decorate`
- Use `import { toClassName } from '../../scripts/aem.js'` for class name utilities
- Follow patterns and conventions in `resources/js-guidelines.md`

### 5. Configure `block-config.js`

The root `block-config.js` wires up the decoration hook:

```javascript
// blocks/{block-name}/block-config.js
import { decorateBlock } from './{block-name}.js';

export default async function getBlockConfigs() {
  return {
    flags: {
      // featureFlag: true,
    },
    variations: [
      // { variation: 'my-variant', module: 'my-variant.js' },
    ],
    decorations: {
      decorate: async (ctx, blockConfig) => decorateBlock(ctx, blockConfig),
    },
  };
}
```

**Brand-level `block-config.js`** (in `blocks/{block-name}/{brand}/`) can override flags, variations, or decorations for that brand specifically:

```javascript
// blocks/{block-name}/{brand}/block-config.js
// import { beforeDecorate, decorateBlock, afterDecorate } from '../{block-name}.js';

export default async function getBlockConfigs() {
  return {
    flags: {
      // brand-specific flags
    },
    variations: [],
    decorations: {
      // Override: beforeDecorate, decorate, afterDecorate
    },
  };
}
```

**Config fields:**
- `flags`: Feature flags (booleans) that can gate behavior
- `variations`: Array of `{ variation: 'class-name', module: 'file.js' }` for loading variant-specific JS
- `decorations.beforeDecorate`: Runs before the main decoration
- `decorations.decorate`: Main decoration function
- `decorations.afterDecorate`: Runs after main decoration

### 6. Add CSS Styling

> **STRICT RULE — No hardcoded values, ever.**
> All CSS property values MUST reference a design token via `var(--token-name)`. Raw values (`#fff`, `1rem`, `600px`, `bold`, `16px`, etc.) are **never** allowed as property values. The only permitted exception is `0` (the unitless zero).
>
> **If a token does not exist yet, define it first at the correct level of the multi-brand hierarchy — then reference it:**
>
> | Scope | Define the token in |
> |---|---|
> | All brands and themes | `styles/tokens.css` — global base scale |
> | One brand, all themes | `styles/{brand}/_tokens.css` |
> | All brands, one theme | `styles/themes/{theme}/_tokens.css` |
> | One brand + one theme | `styles/{brand}/themes/{theme}/_tokens.css` |
>
> Token values must themselves reference another token via `var(--...)` — never a raw value. Read the existing token files at execution time to find the right reference. Follow W3C DTCG naming: `--{type}-{semantic}-{variant}` (e.g. `--color-brand-surface`, `--spacing-section-gap`).

#### Base styles (`blocks/{block-name}/{block-name}.css`)

All base styles live here. All selectors scoped to `.{block-name}`:

```css
/* blocks/{block-name}/{block-name}.css */
.{block-name} {
  /* Block-scoped tokens — follow W3C DTCG: --{block-name}-{type}-{semantic}-{variant} */
  /* Always reference global design tokens, never raw values */
  --{block-name}-color-background: var(--color-background);
  --{block-name}-color-text-primary: var(--color-text-primary);

  background-color: var(--{block-name}-color-background);
}

.{block-name} .item {
  /* Use spacing tokens — never hardcode px/rem values */
  padding: var(--spacing-m);
}

/* Use the project's named breakpoint tokens (CSS env() or documented breakpoint variable) */
@media (width >= var(--breakpoint-m, 600px)) {
  .{block-name} .item {
    padding: var(--spacing-l);
  }
}
```

Define block-scoped CSS custom properties using the pattern `--{block-name}-{type}-{semantic}[-{variant}]` — the block name scopes the token, then the W3C DTCG type and semantic follow. Brands and themes override these by re-declaring them in their respective `_*.css` partials.

#### Brand override partial (`blocks/{block-name}/{brand}/_{block-name}.css`)

```css
/* blocks/{block-name}/{brand}/_{block-name}.css */
@import '../{block-name}.css';

/* Brand-specific overrides — reference W3C DTCG-named brand tokens */
.{block-name} {
  --{block-name}-color-bg: var(--color-brand-surface);

  .item {
    border-color: var(--color-brand-primary);
  }
}
```

#### Theme override partial (`blocks/{block-name}/themes/{theme}/_{block-name}.css`)

```css
/* blocks/{block-name}/themes/{theme}/_{block-name}.css */
@import '../../{block-name}.css';

/* Theme-specific overrides — re-declare block tokens using theme-level global tokens */
.{block-name} {
  --{block-name}-color-bg: var(--color-theme-surface);
}
```

#### Brand+Theme override partial (`blocks/{block-name}/{brand}/themes/{theme}/_{block-name}.css`)

```css
/* blocks/{block-name}/{brand}/themes/{theme}/_{block-name}.css */
@import '../../{block-name}.css';

/* Brand + theme specific overrides */
```

**Read `resources/css-guidelines.md` for detailed examples, code standards, and best practices.**

### 7. Build Compiled CSS

After editing `_block.css` partials, regenerate compiled CSS:

```sh
# Build CSS for all configured brands
npm run scaffold:build

# Or start the watch server (rebuilds on changes)
npm run scaffold:start
```

To build for specific brands only, set `BRANDS` in `.env`:
```
BRANDS=brand1,brand2
```

### 8. Test the Implementation

**After implementation is complete, invoke the testing-blocks skill:**

The testing-blocks skill guides you through:
- Browser testing to validate block behavior
- Taking screenshots for validation and PR documentation
- Running linting and fixing issues
- Verifying GitHub checks pass

```sh
npm run lint         # Run all linting
npm run lint:fix     # Auto-fix lint issues
npm start            # Start dev server (theme builder + AEM proxy)
```

Provide the testing-blocks skill with:
- Block name being tested
- Test content URL (from CDD process)
- Any variants and brands/themes that need testing

Return to this skill after testing is complete to proceed to step 9.

### 9. Document Block

#### Developer Documentation

- Most blocks are self-documenting via clear code
- For complex blocks (many variants, complex config), add a brief `README.md` in the block folder
- Keep any README very brief

#### Author-Facing Documentation

Almost all blocks should have author-facing documentation. Update when variants, content structure, or behavior changes.

Determine which approach the project uses:
1. **Sidekick Library** — check for `/tools/sidekick/library.html`
2. **Document Authoring (DA) Library** — check for DA library config
3. **Docs pages** — check for pages under `/drafts` or `/docs`

## Definition of Done

Before marking the block complete, every item below must be checked. Do not hand off or merge until all boxes are ticked.

### Structure & Files
- [ ] Block name is generic — no brand or theme name embedded
- [ ] `{block-name}.js`, `{block-name}.css`, and `block-config.js` exist at the block root
- [ ] A `{brand}/` folder exists for **every** brand in `brand-config.json`
- [ ] Each brand folder has `_{block-name}.css`, compiled `{block-name}.css`, and `block-config.js`
- [ ] A `themes/{theme}/` subfolder exists inside each brand folder for **every** theme in `brand-config.json`
- [ ] Every `_*.css` partial starts with the correct `@import` (right relative depth)

### JavaScript
- [ ] `decorateBlock` is a named export from `{block-name}.js` — all DOM logic lives here
- [ ] The default `decorate(block)` export does nothing but call `renderBlock(block)`
- [ ] Brand `block-config.js` only declares keys that differ from the root config

### CSS & Tokens
- [ ] Zero hardcoded values anywhere — every property value is `var(--token-name)`
- [ ] Block-scoped tokens follow `--{block-name}-{type}-{semantic}[-{variant}]` naming
- [ ] Block-scoped token definitions reference global tokens via `var(--...)`, not raw values
- [ ] Missing tokens were defined at the correct hierarchy level before use (see Strict Rule above)
- [ ] Brand partials re-declare block tokens using brand-level global tokens
- [ ] Theme partials re-declare block tokens using theme-level global tokens
- [ ] `npm run scaffold:build` ran without errors — compiled `.css` files are up to date

### Testing
- [ ] Block renders correctly at the test content URL in a browser
- [ ] Every registered brand variant tested visually
- [ ] Every registered theme variant tested visually
- [ ] No console errors or warnings
- [ ] `npm run lint` passes (zero errors)

### Documentation
- [ ] Author-facing docs updated (Sidekick Library, DA Library, or docs page)
- [ ] `README.md` added in block folder if the block has complex variants or config

---

## Quick Reference: npm Commands

| Command | What it does |
|---|---|
| `npm start` | Starts theme CSS builder + AEM proxy (opens `localhost:3000`) |
| `npm run scaffold:create` | Interactive scaffold: create Block, Brand, or Theme |
| `npm run scaffold:build` | Compile merged CSS for all configured brands |
| `npm run scaffold:start` | Start Gulp CSS watcher (used by `npm start`) |
| `npm run scaffold:remove` | Interactive scaffold: remove Block, Brand, or Theme |
| `npm run lint` | Run JS + CSS linting |
| `npm run lint:fix` | Auto-fix lint issues |

## Reference Materials

- `resources/js-guidelines.md`
- `resources/css-guidelines.md`
- `theme-tools/plopfile.mjs` — scaffold generator logic
- `brand-config.json` — registered brands and themes
- `blocks/tabs/` — reference block with full multi-brand structure
