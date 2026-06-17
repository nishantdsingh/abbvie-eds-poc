# AEM EDS Conversion Pipeline — plain.html → Markdown → JCR

> Definitive reference for producing plain.html that converts cleanly through
> `@adobe/helix-html2md` (v2.1) and `@adobe/helix-md2jcr` (v1.2).

---

## Pipeline Overview

```
plain.html  →  helix-html2md  →  markdown (.md)  →  helix-md2jcr  →  JCR XML (.xml)
```

---

## Stage 1: plain.html → Markdown (helix-html2md)

### Block Detection Rules

A `<div>` is detected as a block when ALL conditions are met:
1. Has a CSS class name (`class="block-name variant1 variant2"`)
2. Contains child `<div>` elements (rows)
3. Each row `<div>` contains child `<div>` elements (cells)

### Block Name Conversion

CSS class → Block name (Title Case):
- `rich-text` → `Rich Text`
- `hero-container` → `Hero Container`

Multiple classes = name + variants in parentheses:
- `class="rich-text footnote"` → `Rich Text (footnote)`

### Image Handling

- `<picture>` with `<img>` → markdown image `![alt][imageN]`
- `<br>` in cells → `\` (backslash line break)

### What Breaks html2md

| Issue | Result |
|-------|--------|
| No `<main>` element | Empty output |
| Block div without div>div>div structure | Content lost |
| > 200 images | Error |
| Data URI images | Silently discarded |

---

## Stage 2: Markdown → JCR (helix-md2jcr)

### Field Resolution Order (CRITICAL)

md2jcr maps content cells to model fields **sequentially by field groups**.

### Field Grouping Rules

1. Fields with `_` in name → grouped by prefix (ONE row for all `classes_*` fields)
2. Suffix fields (`Alt`, `MimeType`, `Type`, `Text`, `Title`) → collapsed into base field
3. `classes` multiselect → handled via block name parentheses, NOT a row
4. Each group = ONE row in the block table

### Rich Text — 4 Field Groups

```
[0] text (richtext content)
[1] classes (classes_textVariant + classes_textAlignment + classes_theme + classes_commonCustomClass)
[2] blockId
[3] language
```

For local EDS preview (aem up), the block JS only reads row 0. Rows 1-3 are consumed by the framework for JCR but don't render visually.

### Container Blocks (Accordion, Cards-Grid)

Parent field-group rows come FIRST, then child item rows after.

Each accordion-item row = 2 cells: `[summary, text]`

### What Breaks md2jcr

| Issue | Result |
|-------|--------|
| Block name not in component-definition.json | Mapping failure |
| Row count doesn't match field groups | "content isn't mapping to model correctly" |
| HTML `<table>` in content | UnsupportedElementError |
| Richtext greedily consuming next field | Missing data |

---

## Import Script Rules

### Rule 1: Block Structure Must Be Exact
Three-level nesting: `div.class > div (row) > div (cell)`

### Rule 2: Match Row Count to Field Groups
Count field GROUPS (not raw fields). See rules/09-md2jcr-field-alignment.md

### Rule 3: Block Name Must Match component-definition.json Title
Case-sensitive. `Rich Text` not `rich-text` or `RichText`.

### Rule 4: No HTML tables Inside Block Cells

### Rule 5: Images Must Use Real URLs (no data: or blob:)

### Rule 6: Use Field Hints When Order is Ambiguous
```html
<!-- field:fieldName -->content
```

### Rule 7: Empty Rows Use `-` Placeholder
To prevent html2md from collapsing empty rows, use `-` as cell content.

---

## Validation Checklist

- [ ] Blocks have class attribute with block name
- [ ] Blocks have 3-level nesting: div.class > div (row) > div (cell)
- [ ] Row count matches block's field GROUP count
- [ ] No data URI or blob images
- [ ] No `<table>` elements inside block cells
- [ ] Block names match component-definition.json titles exactly
