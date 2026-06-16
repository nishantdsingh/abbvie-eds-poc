# md2jcr Field Naming Rules — Avoiding _fixFieldOrder Bugs

## The Problem

md2jcr's `_fixFieldOrder()` method silently **drops fields** whose names end with certain suffixes when no matching "base field" exists in the model.

## Dangerous Suffixes

md2jcr treats these as collapsible suffixes: **`Alt`**, **`MimeType`**, **`Type`**, **`Text`**, **`Title`**

### How it works:

1. `_fixFieldOrder` scans for "base fields" — fields NOT ending with any suffix
2. For each base field, it looks for `baseField + Suffix` (e.g., `image` → `imageAlt`, `imageMimeType`)
3. Suffix fields that have a matching base field are **kept** (reordered to follow their base)
4. Suffix fields that do NOT have a matching base field are **silently dropped**

### Examples of DROPPED fields:

| Field Name | Suffix | Expected Base | Exists? | Result |
|-----------|--------|---------------|---------|--------|
| `overlayTitle` | Title | `overlay` | NO | **DROPPED** |
| `overlayBtnText` | Text | `overlayBtn` | NO | **DROPPED** |
| `placeholderAlt` | Alt | `placeholder` | NO | **DROPPED** |

### Examples of KEPT fields (correctly collapsed):

| Field Name | Suffix | Expected Base | Exists? | Result |
|-----------|--------|---------------|---------|--------|
| `imageMimeType` | MimeType | `image` | YES | Collapsed into `image` group |
| `imageAlt` | Alt | `image` | YES | Collapsed into `image` group |

## Safe Alternatives for Each Suffix:

| Suffix | Avoid ending with | Use instead |
|--------|-------------------|-------------|
| `Alt` | `*Alt` | `*AltLabel`, `*AltDescription` |
| `MimeType` | `*MimeType` | Only use when base field exists |
| `Type` | `*Type` | `*Variation`, `*Style`, `*Mode` |
| `Text` | `*Text` | `*Label`, `*Content`, `*Value` |
| `Title` | `*Title` | `*Heading`, `*Name`, `*Caption` |
