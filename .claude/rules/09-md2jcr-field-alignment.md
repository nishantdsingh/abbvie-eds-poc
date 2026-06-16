# md2jcr Field Group Alignment Rules

## Overview

When writing import scripts that produce HTML for the `html2md → md2jcr` pipeline, the **row count and order in block tables must match md2jcr's FieldGroup structure** — NOT the raw field count in component-models.json.

md2jcr groups fields before mapping rows. Each row in the grid table maps to one **field group**, not one field. Misalignment causes values to land in wrong JCR properties.

---

## How md2jcr Groups Fields (FieldGroup._groupFields)

Given a model's non-tab fields, md2jcr creates groups using these rules:

### Rule 1: Fields with `_` in name → grouped by prefix
All fields sharing the same prefix before `_` become ONE group at the position where the first such field appears.

```
classes_customDynamicClass  ─┐
classes_commonCustomClass   ─┴─→ ONE group "classes" (at position of first occurrence)
```

### Rule 2: Fields ending with suffix → collapsed into base field
Suffixes: `Alt`, `MimeType`, `Type`, `Text`, `Title`

```
image           ─┐
imageMimeType   ─┤─→ ONE group "image" (MimeType collapsed)
imageAlt        ─┘   (Alt collapsed)
```

### Rule 3: `classes` field excluded
If a model has a field literally named `classes` (multiselect), it's handled separately from the block name parentheses. It does NOT consume a row.

### Rule 4: Field hints override resolution
Use `<!-- field:fieldName -->` HTML comments in a cell to tell md2jcr exactly which field a value belongs to. This bypasses sequential resolution.

---

## Rich Text Block — Field Groups

Rich Text model fields (excluding tabs):
- `text` (richtext)
- `classes_textVariant`, `classes_textAlignment`, `classes_theme` → grouped as "classes" 
- `blockId`
- `classes_commonCustomClass` → part of "classes" group (already counted)
- `language`

**Field groups = 4:**
```
[0] text (richtext content)
[1] classes (classes_textVariant + classes_textAlignment + classes_theme + classes_commonCustomClass)
[2] blockId
[3] language
```

**BUT** the `classes` multiselect variants go in the block name parentheses (e.g., `Rich Text (footnote)`), and `classes_*` fields share ONE row. So the actual rows needed:

```
[0] text content
[1] classes group (empty or field-hinted values)
[2] blockId (empty or "id:xxx")
[3] language ("none" or locale code)
```

---

## Accordion Block — Field Groups

### Parent (17 groups):
```
[0]  blockHeading
[1]  classes (allowMultipleOpen, showExpandCollapseAll, iconType, customDynamicClass, commonCustomClass)
[2]  expandAllLabel
[3]  collapseAllLabel
[4]  expandAllIcon
[5]  collapseAllIcon
[6]  expandIcon
[7]  collapseIcon
[8]  expandAllIconImage
[9]  collapseAllIconImage
[10] expandIconImage
[11] collapseIconImage
[12] ariaExpandAllLabel
[13] ariaCollapseAllLabel
[14] blockId
[15] language
[16] analytics (analytics_id)
→ Remaining rows = accordion-item children
```

### Each accordion-item: 2 cells per row
```
[col0] summary (plain text)
[col1] text (richtext)
```

---

## Key Principles

1. **Count field GROUPS, not raw fields** — one row per group
2. **classes_* fields share one row** — first value in the cell goes to first field in group
3. **Suffix fields don't need rows** — they're auto-collapsed (Alt, MimeType, Type, Text, Title)
4. **Block name must match component title EXACTLY** — case-sensitive
5. **Container blocks**: parent rows first, then child item rows
6. **Field hints (`<!-- field:name -->`) override sequential resolution**
7. **Empty rows collapse in html2md** — use `-` as placeholder for empty parent rows
