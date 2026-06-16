# AbbVie EDS Multi-Brand POC

This repository is a multi-brand AEM Edge Delivery Services (EDS) project for AbbVie. It supports multiple brand sites — **abbvie**, **botox**, and **rinvoq** — from a single codebase, with per-brand CSS and JS overrides at both the block and global style level.

---

## Table of Contents

- [Project Structure](#project-structure)
- [How Brands Work at Runtime](#how-brands-work-at-runtime)
- [Adding a New Brand](#adding-a-new-brand)
- [Adding a New Theme to a Brand](#adding-a-new-theme-to-a-brand)
- [Block CSS Overrides per Brand](#block-css-overrides-per-brand)
- [Block JS Overrides per Brand (block-config.js)](#block-js-overrides-per-brand-block-configjs)
- [Global Style Overrides per Brand](#global-style-overrides-per-brand)
- [Universal Editor Component Models](#universal-editor-component-models)
- [Common Block Fields](#common-block-fields)
- [Development Setup](#development-setup)
- [Build Commands](#build-commands)

---

## Project Structure

```
abbvie-eds-poc/
├── blocks/
│   └── {block-name}/
│       ├── {block-name}.js         ← Base JS (runs for all brands)
│       ├── {block-name}.css        ← Base CSS (loaded when no brand is set)
│       ├── block-config.js         ← Base block config (decorations, variations)
│       ├── _block-name.json        ← Universal Editor component model (source)
│       ├── abbvie/
│       │   ├── _block-name.css     ← Brand CSS partial (edit this)
│       │   ├── block-name.css      ← Compiled CSS (auto-generated, do not edit)
│       │   └── block-config.js     ← Brand-specific block config overrides
│       ├── botox/                  ← Same structure as abbvie/
│       └── rinvoq/                 ← Same structure as abbvie/
│
├── styles/
│   ├── styles.css                  ← Base global styles
│   ├── fonts.css                   ← Base fonts
│   ├── tokens.css                  ← Base design tokens
│   ├── lazy-styles.css             ← Deferred styles
│   ├── {brand}/
│   │   ├── _styles.css             ← Brand global style partial (edit this)
│   │   ├── styles.css              ← Compiled (auto-generated)
│   │   ├── _fonts.css              ← Brand font overrides partial
│   │   ├── fonts.css               ← Compiled
│   │   ├── _tokens.css             ← Brand token overrides partial
│   │   ├── tokens.css              ← Compiled
│   │   └── themes/
│   │       └── {theme}/
│   │           ├── _styles.css     ← Brand+theme style partial
│   │           └── styles.css      ← Compiled
│   └── themes/
│       └── {theme}/
│           ├── _styles.css         ← Theme-only style partial (no brand)
│           └── styles.css          ← Compiled
│
├── models/                         ← Universal Editor shared field definitions
│   ├── _common-properties.json     ← Common fields (ID, custom class, language)
│   ├── _language.json              ← Language selector field
│   ├── _section.json               ← Section metadata fields
│   ├── _page.json                  ← Page-level metadata fields
│   ├── _button.json                ← Shared button fields
│   ├── _image.json                 ← Shared image fields
│   ├── _text.json                  ← Shared text fields
│   ├── _title.json                 ← Shared title fields
│   ├── _component-models.json      ← Aggregates all block + shared models
│   ├── _component-definition.json  ← Aggregates component definitions
│   └── _component-filters.json     ← Aggregates component filters
│
├── component-models.json           ← Compiled UE model (auto-generated from models/)
├── component-definition.json       ← Compiled UE definitions (auto-generated)
├── component-filters.json          ← Compiled UE filters (auto-generated)
├── brand-config.json               ← Registered brands and themes
├── gulpfile.js                     ← CSS build pipeline
└── scripts/
    ├── multi-theme.js              ← Brand/theme CSS + block-config loader
    └── scripts.js                  ← Page initialization
```

---

## How Brands Work at Runtime

Brand and theme are set via **page metadata** — either globally in `metadata.xlsx` (bulk metadata) or per-document in the page properties panel.

| Metadata key | Example value | Effect |
|---|---|---|
| `brand` | `abbvie` | Loads brand CSS for every block, adds `abbvie` class to `<body>` |
| `theme` | `dark` | Loads theme CSS on top of brand CSS |

The `scripts/multi-theme.js` loader constructs the CSS path for every block:

```
blocks/{blockName}/{brand}/{theme}/{blockName}.css
```

**Resolution order (most specific wins):**

| Brand set | Theme set | CSS loaded |
|---|---|---|
| ✗ | ✗ | `blocks/{block}/{block}.css` (base) |
| ✓ | ✗ | `blocks/{block}/abbvie/{block}.css` |
| ✗ | ✓ | `blocks/{block}/themes/dark/{block}.css` |
| ✓ | ✓ | `blocks/{block}/abbvie/themes/dark/{block}.css` |

The block JS (`{block}.js`) is **always loaded from the block root** — the same JS runs for all brands. Brand-specific behavior is handled through `block-config.js` overrides (see [Block JS Overrides](#block-js-overrides-per-brand-block-configjs)).

---

## Adding a New Brand

### 1. Register the brand

Add the brand name to `brand-config.json`:

```json
{
  "brands": ["abbvie", "botox", "rinvoq", "skyrizi"],
  "themes": []
}
```

### 2. Scaffold brand folders for each block

For every block, create a brand subfolder with a CSS partial and a block-config:

```
blocks/{block-name}/skyrizi/
├── _block-name.css     ← @import '../block-name.css'; + overrides
└── block-config.js     ← brand-specific decoration overrides
```

The `_block-name.css` partial should start with an import of the base CSS:

```css
@import '../accordion.css';

/* skyrizi-specific overrides below */
.accordion {
  --accordion-border-01: 2px;
}
```

### 3. Create global brand styles

Create the global style directory:

```
styles/skyrizi/
├── _styles.css     ← @import '../styles.css'; + overrides
├── _fonts.css      ← @import '../fonts.css'; + brand fonts
└── _tokens.css     ← @import '../tokens.css'; + brand tokens
```

### 4. Compile brand CSS

```sh
npm run scaffold:build
```

This reads all `_*.css` partials (files prefixed with `_`) across all block and style directories and compiles them into their corresponding `*.css` output files.

> **Important:** Never edit the compiled `*.css` files directly. Always edit the `_*.css` partial — then run `scaffold:build` to regenerate the compiled output.

### 5. Set brand in page metadata

In the SharePoint/Google Drive document, add a metadata row:

| Key | Value |
|---|---|
| `brand` | `skyrizi` |

Or configure it globally via bulk metadata for a URL pattern.

---

## Adding a New Theme to a Brand

Themes layer on top of a brand. A theme can exist at two levels:

- **Brand + theme** — `blocks/{block}/abbvie/themes/dark/` — applies only when brand=abbvie AND theme=dark
- **Theme only** — `blocks/{block}/themes/dark/` — applies for any brand when theme=dark

### 1. Register the theme

```json
{
  "brands": ["abbvie", "botox", "rinvoq"],
  "themes": ["dark"]
}
```

### 2. Create theme CSS partials

For a brand-specific theme override:

```
blocks/{block-name}/abbvie/themes/dark/
├── _block-name.css     ← @import '../../block-name.css'; + dark overrides
└── block-name.css      ← compiled (auto-generated)
```

For a brand-agnostic theme:

```
blocks/{block-name}/themes/dark/
├── _block-name.css     ← @import '../block-name.css'; + dark overrides
└── block-name.css      ← compiled (auto-generated)
```

### 3. Compile and set metadata

```sh
npm run scaffold:build
```

Set `theme: dark` in the page or section metadata.

---

## Block CSS Overrides per Brand

All block brand CSS lives in `blocks/{block-name}/{brand}/`.

**Edit the partial** (`_block-name.css`) — never the compiled file:

```css
/* blocks/accordion/abbvie/_accordion.css */

@import '../accordion.css';   /* always import the base first */

/* AbbVie-specific overrides */
.accordion summary {
  font-family: var(--heading-font-family);
  color: var(--color-navy);
}

.accordion .accordion-item {
  border-bottom-color: var(--color-abbvie-purple);
}
```

After editing, regenerate:

```sh
npm run scaffold:build
```

The Gulp watcher (`npm run scaffold:start`) watches for changes to `_*.css` files and recompiles automatically during development.

---

## Block JS Overrides per Brand (block-config.js)

Each block has two `block-config.js` files:

- `blocks/{block}/block-config.js` — global config, loaded for all brands
- `blocks/{block}/{brand}/block-config.js` — brand config, merged on top

The two configs are **deep-merged** at runtime by `multi-theme.js`: brand decorations override global ones, and variations from both are combined.

### Global block-config.js

```js
// blocks/accordion/block-config.js
import { decorateBlock } from './accordion.js';

export default async function getBlockConfigs() {
  return {
    flags: {
      expandAll: false,
    },
    variations: [
      { variation: 'icon-font', module: 'accordion-icon-font.js' },
    ],
    decorations: {
      decorate: async (ctx, blockConfig) => decorateBlock(ctx, blockConfig),
    },
  };
}
```

### Brand block-config.js override

```js
// blocks/accordion/abbvie/block-config.js
import { decorateBlock } from '../accordion.js';

export default async function getBlockConfigs() {
  return {
    flags: {
      expandAll: true,    // abbvie shows expand-all button by default
    },
    decorations: {
      // Override the base decoration with an abbvie-specific one
      decorate: async (ctx, blockConfig) => decorateBlock(ctx, blockConfig),
    },
  };
}
```

### Supported config properties

| Property | Type | Description |
|---|---|---|
| `flags` | `object` | Feature flags passed to the block's `decorate` function as `blockConfig.flags` |
| `variations` | `array` | Additional JS modules to load for specific block variants (CSS class matches) |
| `decorations.beforeDecorate` | `function` | Runs before the base decoration |
| `decorations.decorate` | `function` | Replaces the base decoration |
| `decorations.afterDecorate` | `function` | Runs after the base decoration |
| `cacheResetHandlers` | `array` | Functions to call on browser back/forward navigation (`pageshow`) |

---

## Global Style Overrides per Brand

Global styles (design tokens, fonts, layout) live in `styles/{brand}/`.

Edit the partials:

```css
/* styles/abbvie/_tokens.css */

@import '../tokens.css';   /* import base tokens first */

/* AbbVie brand token overrides */
:root {
  --heading-font-family: 'AbbVie Headlines', sans-serif;
  --color-primary: #071d49;
  --highlight-dark-background-color: #5a1af4;
}
```

```css
/* styles/abbvie/_fonts.css */

@import '../fonts.css';

@font-face {
  font-family: 'AbbVie Headlines';
  src: url('/fonts/abbvie/AbbVieHeadlines.woff2') format('woff2');
}
```

Run `npm run scaffold:build` after changes.

---

## Universal Editor Component Models

The Universal Editor (UE) reads three root-level JSON files to know which components are available and what fields they expose:

| File | Purpose | How to update |
|---|---|---|
| `component-models.json` | Field definitions for every block's properties panel | Edit `models/_component-models.json` or the block's `_block-name.json`, then rebuild |
| `component-definition.json` | Component picker — what blocks authors can insert | Edit `models/_component-definition.json`, then rebuild |
| `component-filters.json` | Which blocks are allowed inside which containers | Edit `models/_component-filters.json`, then rebuild |

The root files are **auto-generated** by the AEM UE build pipeline from the source partials in `models/`. Do not edit the root files directly.

### Per-block model files

Each block has a `_block-name.json` file that defines its UE fields:

```
blocks/accordion/_accordion.json      ← field definitions for the accordion block
blocks/hero/_hero.json
blocks/cards/_cards.json
...
```

These are included automatically via the glob in `models/_component-models.json`:

```json
[
  { "...": "./_page.json#/models" },
  { "...": "./_section.json#/models" },
  { "...": "../blocks/*/_*.json#/models" }
]
```

---

## Common Block Fields

Several blocks share field definitions from `models/`:

| Shared model | Used in | Fields provided |
|---|---|---|
| `_common-properties.json` | 14 blocks (accordion, cards, hero, etc.) | `blockId`, `classes_commonCustomClass`, language selector |
| `_language.json` | `navigation-content`, `linklist` | Language/locale selector |
| `_section.json` | All sections | Background, style, spacing metadata |
| `_image.json` | Any block using images | Image reference + alt text |
| `_button.json` | Any block using CTAs | Link, label, target |

Block JSON files reference these via relative paths:

```json
{
  "component": "tab",
  "label": "Common Properties",
  "name": "commonProperties",
  "...": "../../models/_common-properties.json#/common-prop"
}
```

---

## Development Setup

**Prerequisites:** Node.js 18+, npm, AEM CLI

```sh
# Install dependencies
npm install

# Install AEM CLI globally (if not already installed)
npm install -g @adobe/aem-cli
```

### Local .env configuration

Create a `.env` file in the project root:

```
AEM_PORT=3000
AEM_PAGES_URL=https://main--abbvie-eds-poc--<org>.aem.page/
AEM_OPEN=/en/
BRANDS=abbvie,botox,rinvoq
```

### Start development

```sh
npm start
```

This runs concurrently:
1. **Gulp CSS watcher** — watches `_*.css` partials and recompiles on save
2. **AEM proxy** — serves content from the configured SharePoint/GDrive mount

---

## Build Commands

| Command | Description |
|---|---|
| `npm start` | Start dev server + CSS watcher |
| `npm run scaffold:build` | Compile all brand CSS from `_*.css` partials |
| `npm run scaffold:start` | Run Gulp CSS watcher only (no AEM proxy) |
| `npm run scaffold:create` | Interactively scaffold a new brand or theme directory structure |
| `npm run scaffold:remove` | Remove a brand or theme directory structure |
| `npm run lint` | Run JS and CSS linters |
| `npm run lint:fix` | Auto-fix linting issues |

> **CSS build rule:** All source CSS files are prefixed with `_` (e.g. `_accordion.css`). The build pipeline reads these, resolves `@import` statements, and writes the compiled output as the same filename without the prefix (e.g. `accordion.css`). Always edit `_*.css`, never `*.css` (except the base block CSS in the block root).

