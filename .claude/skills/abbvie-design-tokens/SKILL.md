---
name: abbvie-design-tokens
description: Complete design token reference for all 6 AbbVie brand sites. Documents colors, typography, spacing, borders, shadows, gradients, and button styles extracted from live pages. Covers base tokens (styles/tokens.css) and brand overrides (styles/{brand}/tokens.css). Use when implementing brand-specific styling, reviewing token values, or creating new component CSS.
---

# AbbVie Design Token Reference

All tokens are defined in `/workspace/styles/tokens.css` (base) and `/workspace/styles/{brand}/tokens.css` (overrides). Each brand imports the base and overrides only what differs. Brand theme files at `/workspace/styles/{brand}/themes.css` apply tokens to EDS components.

## Related Skills

- **token-naming**: Naming conventions and formula for CSS custom properties
- **building-brand**: Scaffold and configure a new brand
- **building-brand-blocks**: Apply tokens to block-level CSS overrides
- **abbvie-block-library**: Which blocks need which tokens

---

## Brand Token Files

| Brand | Tokens File | Themes File | Fonts File |
|---|---|---|---|
| Base (AbbVie) | `styles/tokens.css` | `styles/styles.css` | `styles/fonts.css` |
| SkyriziHCP | `styles/skyrizi-hcp/tokens.css` | `styles/skyrizi-hcp/themes.css` | `styles/skyrizi-hcp/fonts.css` |
| RinvoqHCP | `styles/rinvoq-hcp/tokens.css` | `styles/rinvoq-hcp/themes.css` | `styles/rinvoq-hcp/fonts.css` |
| Rinvoq DTC | `styles/rinvoq-dtc/tokens.css` | `styles/rinvoq-dtc/themes.css` | `styles/rinvoq-dtc/fonts.css` |
| Linzess | `styles/linzess/tokens.css` | `styles/linzess/themes.css` | `styles/linzess/fonts.css` |
| Venclexta | `styles/venclexta/tokens.css` | `styles/venclexta/themes.css` | `styles/venclexta/fonts.css` |
| Mavyret | `styles/mavyret/tokens.css` | `styles/mavyret/themes.css` | `styles/mavyret/fonts.css` |

---

## Color Palettes by Brand

### SkyriziHCP
| Token | Value | Role |
|---|---|---|
| `--color-brand-primary` | `#005272` | Teal — headings, links |
| `--color-brand-primary-dark` | `#003b52` | Footer bg |
| `--color-brand-accent` | `#ffce00` | Gold — primary button bg |
| `--text-color` | `#404040` | Body text |
| `--button-primary-bg` | `#ffce00` | Gold button |
| `--button-primary-color` | `#000` | Black button text |

### RinvoqHCP / Rinvoq DTC (shared palette)
| Token | Value | Role |
|---|---|---|
| `--color-brand-primary` / `--color-plum` | `#90124a` | Plum — buttons, links |
| `--color-charcoal` | `#25282a` | Headings |
| `--color-iron` | `#46484a` | Body text |
| `--color-gold` | `#ffd100` | Safety bar border, accents |
| `--color-glacier` | `#f5f5f5` | Light bg |
| `--color-butter` | `#fff1b3` | Warm highlights |

### Linzess
| Token | Value | Role |
|---|---|---|
| `--color-brand-primary` / `--linz-dark-purple` | `#422e83` | Purple — headings, links, footer |
| `--color-brand-accent` / `--linz-orange` | `#faa633` | Orange — buttons |
| `--linz-grey` | `#4d4d4f` | Body text |
| `--linz-off-white` | `#f4f6fb` | Section bg |
| `--linz-light-purple` | `#d9d7f9` | Light accent |

### Venclexta
| Token | Value | Role |
|---|---|---|
| `--color-brand-primary` / `--color-venclexta-teal` | `#005272` | Teal — headings, borders |
| `--color-venclexta-teal-dark` | `#003b52` | Container bg |
| `--color-plum` | `#90124a` | Buttons, links (shared with Rinvoq) |
| `--color-venclexta-navy` | `#071d49` | Corporate navy |

### Mavyret
| Token | Value | Role |
|---|---|---|
| `--color-brand-primary` | `#21406d` | Navy — body text, accordion |
| `--color-brand-primary-dark` | `#071d49` | Dark navy — headings, buttons, footer |
| `--color-brand-accent` | `#1ba2da` | Cyan — accent highlights |
| `--color-fiesta` | `#e65400` | Orange — border accent |
| `--color-green-flash` | `#76bd22` | Green — accessibility glow |

---

## Typography by Brand

| Brand | Body Font | Heading Font | Special Font | Body Size | H1 Size |
|---|---|---|---|---|---|
| SkyriziHCP | Red Hat Display | Red Hat Display | — | 16px | 32px |
| RinvoqHCP | Graphik | Graphik Bold | Graphik Medium, Semibold | 16px | 26px |
| Rinvoq DTC | Graphik | Graphik Bold | Graphik Medium, Semibold | 16px | 26px |
| Linzess | Lato | Bebas Neue | BasicCommercialLT (legal) | 14px | 56px |
| Venclexta | Graphik | Graphik Bold | Red Hat Display (brand) | 16px | 26px |
| Mavyret | Univers Condensed | Univers Condensed | Univers Bold | 14px | 32px |

---

## Button Styles by Brand

| Brand | Shape | Text | Background | Radius | Padding |
|---|---|---|---|---|---|
| SkyriziHCP | Rounded rect | `#000` | `#ffce00` | `6px` | `20px 42px 20px 20px` |
| RinvoqHCP | Pill | `#fff` | `#90124a` | `100px` | `16px 54px 16px 32px` |
| Rinvoq DTC | Pill | `#fff` | `#90124a` | `100px` | `16px 54px 16px 32px` |
| Linzess | Rounded | `#422e83` | `#faa633` | `16px` | `16px 32px` |
| Venclexta | Pill | `#fff` | `#90124a` | `100px` | `16px 54px 16px 32px` |
| Mavyret | Rounded pill | `#fff` | `#071d49` | `30px` | `14px 30px` |

---

## Base Token Categories (styles/tokens.css)

- **Breakpoints**: Mobile (0-743), Tablet (744+), Desktop (1024+), Wide (1440+)
- **Spacing**: 60+ tokens from `--spacing-02` (0.2rem) to `--spacing-1200` (120rem)
- **Font sizes**: `--font-size-10` (1rem) to `--font-size-80` (8rem)
- **Heading sizes**: xxl (6.4rem) to xs (2.4rem)
- **Layout**: `--content-max-width: 133rem`, narrow (110rem), medium (90rem)
- **Z-index**: -1 through 10
- **Transitions**: fast (0.2s), medium (0.3s)
- **Form tokens**: 25+ form-specific color tokens
- **Separator heights**: 0.1rem to 14.4rem
