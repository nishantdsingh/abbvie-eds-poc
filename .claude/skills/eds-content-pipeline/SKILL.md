# EDS Content Pipeline — plain.html Authoring & md2jcr Fix Rules

Guide for authoring `.plain.html` content files that correctly pass through
the `html2md → md2jcr` conversion pipeline. Use BEFORE creating any
`.plain.html` file. Also documents verified fixes for md2jcr errors.

## When to use

- Creating/fixing `.plain.html` files
- md2jcr errors: "Cannot read properties of undefined", "content isn't mapping"
- Counting rows/cells for a block table
- Debugging silent content loss after import

---

## Pipeline: `plain.html → html2md → markdown → md2jcr → JCR XML`

## The FieldGroup Algorithm (from md2jcr source code)

Located at: `node_modules/@adobe/helix-md2jcr/src/mdast2jcr/domain/FieldGroup.js`

```javascript
// 1. Filter out tabs and literal "classes" field (name === 'classes')
fields.filter(f => f.component !== 'tab').filter(f => f.name !== 'classes')

// 2. If field.name contains "_", group ALL by prefix before first "_"
//    → classes_textAlign + classes_textColor + classes_customClass = ONE group "classes"
//    → This group STILL REQUIRES a row (even if empty)

// 3. Suffix collapsing: Alt, MimeType, Type, Text, Title
//    → if base field exists, collapse into it (1 row)
//    → if base field MISSING, field is DROPPED (orphan = 0 rows)
```

**Row count = FieldGroup.fields.length** (not raw model field count).
Run the FieldGroup locally to get the exact count:
```bash
node --input-type=module -e "
import FieldGroup from './node_modules/@adobe/helix-md2jcr/src/mdast2jcr/domain/FieldGroup.js';
import fs from 'fs';
const models = JSON.parse(fs.readFileSync('component-models.json','utf8'));
const model = models.find(m => m.id === 'BLOCK_ID');
const fg = new FieldGroup(model);
console.log('Rows needed:', fg.fields.length);
fg.fields.forEach((f,i) => console.log(i+1, f.name, f.fields.map(sf=>sf.name)));
"
```

---

## Verified Fix 1: Underscore grouping = ONE row per prefix

ALL `classes_*` fields → ONE group "classes" → ONE row (even if empty).

```html
<div><div></div></div>   <!-- ONE row for ALL classes_* fields -->
```

## Verified Fix 2: Row ORDER must match model declaration order

Rows in plain.html MUST follow the model field declaration order.
The FieldGroup processes fields sequentially — mismatched order causes
content to map to wrong fields.

## Verified Fix 3: Multiline content in grid-table cell breaks md2jcr

Heading + image in one cell → md2jcr can't parse.
Split into separate rows (text field + layers field).

## Verified Fix 4: Orphan suffix fields are DROPPED

Fields ending in Alt/Text/Title/Type/MimeType without matching base → dropped.

**Fixed in this project:**
- `logoAlt` → `logoAccessibleName`
- `navLink1Text` → `navLink1Label` (and 2, 3)
- `safetyText` → `safetyContent`

## Verified Fix 5: text-container (parent+child, 4 parent rows + item)

**Model structure:** Parent model with filter → child items.

Parent model (text-container) FieldGroup = 4 groups:
1. `classes` group (classes_customDynamicClass + classes_textWidth + ... + classes_commonCustomClass)
2. `blockId`
3. `language`
4. `analytics` group (analytics_id)

Filter: `["text-container-text", "text-container-image"]`
- text-container-text MUST be FIRST (default fallback)
- Child text-container-text: 1 field → `text` (richtext)
- Child text-container-image: 2 fields → `image`, `imageAlt`

**Plain.html structure (4 parent rows + 1 item row):**

```html
<div class="text-container legal">
    <div><div>legal</div></div>              <!-- Row 0: classes group (variant names) -->
    <div><div>-</div></div>                  <!-- Row 1: blockId (use '-' placeholder) -->
    <div><div>none</div></div>               <!-- Row 2: language -->
    <div><div>-</div></div>                  <!-- Row 3: analytics_id (use '-' placeholder) -->
    <div><div><div><p>Content here.</p></div></div></div>  <!-- Row 4: text-container-text item -->
</div>
```

**Key rules:**
- 4 parent rows REQUIRED before item row — md2jcr consumes them for parent fields
- Non-empty placeholders (`-` or `none`) — empty rows collapse in html2md
- Single item row with ALL paragraphs combined in one `<div>` wrapper
- No component ID prefix needed — text-container-text is first in filter = default
- Block CSS class should include variants (e.g., `text-container legal`)

**JCR output:**
```xml
<block filter="text-container" model="text-container" name="Text Container"
  classes_customDynamicClass="legal" blockId="-" language="none" analytics_id="-">
  <item_0 name="Text Container Text" model="text-container-text"
    text="&lt;p&gt;Content here.&lt;/p&gt;"/>
</block>
```

## Verified Fix 6: brand-explorer (12 parent rows, 8 item cells)

Parent rows (in order): anchorId, barLabel, projectNumber, navLink1Label,
navLink1Url, navLink2Label, navLink2Url, navLink3Label, navLink3Url,
blockId, classes(empty), language

Item cells: logo(img), logoAccessibleName, brandName, therapeuticArea,
description, brandUrl, safetyContent, indications

Note: `logoAccessibleName` is NOT collapsed with `logo` — "Name" is not a
recognized md2jcr suffix (only Alt/MimeType/Type/Text/Title collapse). Each
is a separate cell. Previously `logoAlt` WAS collapsed with `logo` (sharing
1 cell), so the rename from `logoAlt` → `logoAccessibleName` increased item
cells from 7 to 8.

## Verified Fix 7: Definition title must match html2md output

html2md converts CSS class names to Title Case for block names:
`image-text` → `Image Text`

The definition `title` field MUST match this exact output. If the title
is `"Image with Text"` but the class is `image-text`, md2jcr will error
with: "The component 'Image Text' does not exist."

**Fix:** Change `"title": "Image with Text"` → `"title": "Image Text"` in
`_image-text.json` and rebuild `component-definition.json`.

**Rule:** Title = class name split on hyphens, each word capitalized.
- `image-text` → `Image Text`
- `cards-grid` → `Cards Grid`
- `brand-explorer` → `Brand Explorer`

## Verified Fix 8: Inline images in richtext break greedy consumption

md2jcr's richtext field uses greedy consumption — it reads all remaining
nodes in a cell until it encounters an `image` AST node. The check is
recursive (`find(n, { type: 'image' })`), so images INSIDE headings,
paragraphs, or links also trigger it.

**Symptom:** "content isn't mapping to the model correctly" on a block
where the richtext cell contains headings/paragraphs with inline `<img>`.

**Example that breaks:**
```html
<h3><img src="/icons/dollar.svg" alt="$0" class="iconic-icon"> Affordability</h3>
```

The `<img>` produces an `image` node inside the heading, which stops
richtext consumption. The remaining content then has no field to map to.

**Fix:** Replace inline `<img>` icons with `<span class="icon ...">` elements:
```html
<h3><span class="icon icon-dollar"></span> Affordability</h3>
```

Spans don't create image AST nodes, so richtext continues consuming.

**Also applies to:** `<picture><img>` inside `<h2>` or `<p>` tags within
richtext content cells. Either remove the image or replace with text/spans.

**Note:** The main image field (a separate row with ONLY an image) is fine.
This only affects images embedded within richtext content alongside text.

## Verified Fix 9: `classes_*` select/text fields require a row

Even though `classes` (the multiselect) is excluded from the FieldGroup,
any `classes_*` prefixed fields (like `classes_imageSize`) create a group
entry that REQUIRES a row in the grid table — even if empty.

**Example: image-text block (10 FieldGroup entries = 10 rows needed)**
- Row 1: empty (for `classes` group containing `classes_imageSize`)
- Row 2: image
- Row 3: mobileImage (empty)
- Row 4: content (richtext)
- Row 5-10: ctaLabel, ctaHref, ctaTarget, modalId, anchorId, analyticsId

```html
<div class="image-text">
    <div><div></div></div>                    <!-- classes group (empty) -->
    <div><div><picture><img ...></picture></div></div>  <!-- image -->
    <div><div></div></div>                    <!-- mobileImage (empty) -->
    <div><div>RICHTEXT CONTENT</div></div>    <!-- content -->
    <div><div></div></div>                    <!-- ctaLabel -->
    <div><div></div></div>                    <!-- ctaHref -->
    <div><div></div></div>                    <!-- ctaTarget -->
    <div><div></div></div>                    <!-- modalId -->
    <div><div></div></div>                    <!-- anchorId -->
    <div><div></div></div>                    <!-- analyticsId -->
</div>
```

**Key distinction from Fix 1:** Fix 1 states ALL `classes_*` fields = ONE
row. Fix 9 clarifies that this ONE row is ALWAYS required — the FieldGroup
algorithm creates the group entry regardless of whether a value is selected.

---

## Local Validation Script

```bash
node --input-type=module -e "
import { html2md } from '@adobe/helix-html2md';
import { md2jcr } from '@adobe/helix-md2jcr';
import fs from 'fs';
const raw = fs.readFileSync('content/PAGE.plain.html', 'utf8');
const html = '<html><body><header></header><main>' + raw + '</main><footer></footer></body></html>';
const log = { info:()=>{}, warn:console.warn, error:console.error };
const md = await html2md(html, { log, url: 'https://example.com/' });
const opts = {
  log,
  models: JSON.parse(fs.readFileSync('component-models.json','utf8')),
  definition: JSON.parse(fs.readFileSync('component-definition.json','utf8')),
  filters: JSON.parse(fs.readFileSync('component-filters.json','utf8'))
};
try {
  const xml = await md2jcr(md, opts);
  console.log('SUCCESS:', xml.length, 'bytes');
} catch(e) {
  console.log('FAIL:', e.message);
}
"
```

## Debugging: Check FieldGroup for a block

```bash
node --input-type=module -e "
import FieldGroup from './node_modules/@adobe/helix-md2jcr/src/mdast2jcr/domain/FieldGroup.js';
import fs from 'fs';
const models = JSON.parse(fs.readFileSync('component-models.json','utf8'));
const model = models.find(m => m.id === 'BLOCK_ID');
const fg = new FieldGroup(model);
console.log('Rows needed:', fg.fields.length);
fg.fields.forEach((f,i) => console.log(i+1, f.name, '→', f.fields.map(sf=>sf.name).join(', ')));
"
```

## Debugging: View markdown grid-table for a block

```bash
node --input-type=module -e "
import { html2md } from '@adobe/helix-html2md';
import fs from 'fs';
const raw = fs.readFileSync('content/PAGE.plain.html', 'utf8');
const html = '<html><body><header></header><main>' + raw + '</main><footer></footer></body></html>';
const log = { info:()=>{}, warn:()=>{}, error:()=>{} };
const md = await html2md(html, { url: 'https://example.com', log });
const lines = md.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('BLOCK_NAME') && lines[i].startsWith('|')) {
    for (let j = i-1; j < Math.min(i+30, lines.length); j++) {
      console.log(j + ': ' + lines[j].substring(0, 120));
    }
    break;
  }
}
"
```
