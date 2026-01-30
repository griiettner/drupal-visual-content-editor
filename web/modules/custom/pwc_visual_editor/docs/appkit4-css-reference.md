# Appkit4 CSS Reference

> **Source:** `https://appkitcdn.pwc.com/appkit4/cdn/styles/4.10.3/appkit.min.css`
>
> All utility classes use the `ap-` prefix. Components are delivered via the separate web-components ESM bundle.

---

## Table of Contents

1. [Design Tokens (CSS Custom Properties)](#1-design-tokens)
2. [Colors](#2-colors)
3. [Typography](#3-typography)
4. [Spacing](#4-spacing)
5. [Borders & Radius](#5-borders--radius)
6. [Shadows & Elevation](#6-shadows--elevation)
7. [Opacity](#7-opacity)
8. [Sizing](#8-sizing)
9. [Layout & Display](#9-layout--display)
10. [Icons](#10-icons)
11. [Theming](#11-theming)
12. [Global Resets](#12-global-resets)
13. [Tailwind to Appkit4 Migration Map](#13-tailwind-to-appkit4-migration-map)

---

## 1. Design Tokens

### Spacing

| Token | Value |
|-------|-------|
| `--spacing-1` | `0.125rem` (2px) |
| `--spacing-2` | `0.25rem` (4px) |
| `--spacing-3` | `0.5rem` (8px) |
| `--spacing-4` | `0.75rem` (12px) |
| `--spacing-5` | `1rem` (16px) |
| `--spacing-6` | `1.25rem` (20px) |
| `--spacing-7` | `1.5rem` (24px) |
| `--spacing-8` | `3rem` (48px) |

### Typography

| Token | Value |
|-------|-------|
| `--typography-1` | `0.75rem/0.875rem` |
| `--typography-2` | `0.875rem/1.25rem` |
| `--typography-3` | `1rem/1.5rem` |
| `--typography-4` | `1.25rem/1.5rem` |
| `--typography-5` | `1.5rem/2rem` |
| `--typography-6` | `3rem/3rem` |
| `--font-weight-1` | `400` (regular) |
| `--font-weight-2` | `500` (medium) |
| `--font-weight-3` | `700` (bold) |

### Border Radius

| Token | Value |
|-------|-------|
| `--border-radius-1` | `0.125rem` (2px) |
| `--border-radius-2` | `0.25rem` (4px) |
| `--border-radius-3` | `0.5rem` (8px) |

### Shadows

| Token | Value (Light) | Value (Dark) |
|-------|--------------|-------------|
| `--level-1` / `--elevation-shadow-low` | `0 0.125rem 0.25rem -0.125rem rgba(71,71,71,.24)` | `rgba(0,0,0,.48)` |
| `--level-2` / `--elevation-shadow-medium` | `0 0.25rem 0.5rem -0.125rem rgba(71,71,71,.24)` | `rgba(0,0,0,.48)` |
| `--level-3` / `--elevation-shadow-high` | `0 0.5rem 1rem -0.125rem rgba(71,71,71,.24)` | `rgba(0,0,0,.48)` |
| `--elevation-shadow-flat` | `0` | `0` |

### Opacity

| Token | Value |
|-------|-------|
| `--opacity-1` | `0.04` |
| `--opacity-2` | `0.08` |
| `--opacity-3` | `0.12` |
| `--opacity-4` | `0.24` |
| `--opacity-5` | `0.32` |
| `--opacity-6` | `0.48` |
| `--opacity-7` | `1` |

### Blur

| Token | Value |
|-------|-------|
| `--blur-1` | `blur(0.125rem)` |
| `--blur-2` | `blur(0.5rem)` |

---

## 2. Colors

### Background Colors (Light Mode)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-background-default` | `#f3f3f3` | Page background |
| `--color-background-alt` | `#ffffff` | Alternate background |
| `--color-background-container` | `#ffffff` | Card/container bg |
| `--color-background-container-alt` | `#f3f3f3` | Alternate container |
| `--color-background-secondary` | `#ffffff` | Secondary bg |
| `--color-background-tertiary` | `#474747` | Tertiary / dark bg |
| `--color-background-hover` | `#f3f3f3` | Hover state |
| `--color-background-selected` | `#f3f3f3` | Selected state |
| `--color-background-hover-selected` | `#e8e8e8` | Hover + selected |
| `--color-background-triple-hover` | `#dddddd` | Triple hover |
| `--color-background-border` | `#d1d1d1` | Border color |

### Background Colors (Dark Mode)

| Token | Hex |
|-------|-----|
| `--color-background-default` | `#191919` |
| `--color-background-alt` | `#000000` |
| `--color-background-container` | `#252525` |
| `--color-background-container-alt` | `#3b3b3b` |
| `--color-background-hover` | `#303030` |
| `--color-background-selected` | `#303030` |
| `--color-background-hover-selected` | `#3b3b3b` |
| `--color-background-triple-hover` | `#474747` |
| `--color-background-border` | `dimgray` |

### Text Colors

| Token | Light | Dark |
|-------|-------|------|
| `--color-text-heading` | `#252525` | `#ffffff` |
| `--color-text-body` | `#474747` | `#d1d1d1` |
| `--color-text-light` | `dimgray` | `dimgray` |
| `--color-text-disabled` | `#dddddd` | `dimgray` |
| `--color-text-secondary` | `#ffffff` | `#ffffff` |
| `--color-text-tertiary` | `#ffffff` | `#ffffff` |

### Status Colors

| Token | Hex |
|-------|-----|
| `--color-background-danger` | `#c52a1a` |
| `--color-background-success` | `#21812d` |
| `--color-background-warning` | `#ffbf1f` |
| `--color-text-error` | `#c52a1a` |
| `--color-text-success` | `#21812d` |
| `--color-text-warning` | `#ffbf1f` |

### Neutral Palette (23 shades)

| Class suffix | Hex |
|-------------|-----|
| `neutral-01` | `#ffffff` |
| `neutral-02` | `#f3f3f3` |
| `neutral-03` | `#e8e8e8` |
| `neutral-04` | `#dddddd` |
| `neutral-05` | `#d1d1d1` |
| `neutral-06` | `#c5c5c5` |
| `neutral-07` | `#bababa` |
| `neutral-08` | `#afafaf` |
| `neutral-09` | `#a3a3a3` |
| `neutral-10` | `#979797` |
| `neutral-11` | `#8c8c8c` |
| `neutral-12` | `#818181` |
| `neutral-13` | `#757575` |
| `neutral-14` | `#696969` |
| `neutral-15` | `#5e5e5e` |
| `neutral-16` | `#535353` |
| `neutral-17` | `#474747` |
| `neutral-18` | `#3b3b3b` |
| `neutral-19` | `#303030` |
| `neutral-20` | `#252525` |
| `neutral-21` | `#191919` |
| `neutral-22` | `#111111` |
| `neutral-23` | `#000000` |

Use as: `.ap-text-neutral-01`, `.ap-bg-neutral-01`, `.ap-border-neutral-01`

### Primary Color Palettes (9 shades each)

#### Primary Blue

| Shade | Hex | Class |
|-------|-----|-------|
| 01 | `#d2d7e2` | `.ap-text-primary-blue-01` |
| 02 | `#9aa4be` | `.ap-text-primary-blue-02` |
| 03 | `#62719a` | `.ap-text-primary-blue-03` |
| 04 | `#415385` | `.ap-text-primary-blue-04` |
| 05 | `#203570` | `.ap-text-primary-blue-05` |
| 06 | `#1a2a5a` | `.ap-text-primary-blue-06` |
| 07 | `#132043` | `.ap-text-primary-blue-07` |
| 08 | `#0d152d` | `.ap-text-primary-blue-08` |
| 09 | `#060b16` | `.ap-text-primary-blue-09` |

#### Primary Orange

| Shade | Hex | Class |
|-------|-----|-------|
| 01 | `#fedacc` | `.ap-text-primary-orange-01` |
| 02 | `#fdab8d` | `.ap-text-primary-orange-02` |
| 03 | `#fb7c4d` | `.ap-text-primary-orange-03` |
| 04 | `#e45c2b` | `.ap-text-primary-orange-04` |
| 05 | `#d04a02` | `.ap-text-primary-orange-05` |
| 06 | `#c34c2f` | `.ap-text-primary-orange-06` |
| 07 | `#a7452c` | `.ap-text-primary-orange-07` |
| 08 | `#773829` | `.ap-text-primary-orange-08` |
| 09 | `#472b24` | `.ap-text-primary-orange-09` |

#### Primary Teal

| Shade | Hex | Class |
|-------|-----|-------|
| 01 | `#d4ebe9` | `.ap-text-primary-teal-01` |
| 02 | `#9ed3cc` | `.ap-text-primary-teal-02` |
| 03 | `#69bab0` | `.ap-text-primary-teal-03` |
| 04 | `#49aba0` | `.ap-text-primary-teal-04` |
| 05 | `#299d8f` | `.ap-text-primary-teal-05` |
| 06 | `#27897e` | `.ap-text-primary-teal-06` |
| 07 | `#26776d` | `.ap-text-primary-teal-07` |
| 08 | `#245952` | `.ap-text-primary-teal-08` |
| 09 | `#223937` | `.ap-text-primary-teal-09` |

#### Primary Red

| Shade | Hex | Class |
|-------|-----|-------|
| 01 | `#f9d6d2` | `.ap-text-primary-red-01` |
| 02 | `#f1a29a` | `.ap-text-primary-red-02` |
| 03 | `#e96e61` | `.ap-text-primary-red-03` |
| 04 | `#e44f3f` | `.ap-text-primary-red-04` |
| 05 | `#e0301e` | `.ap-text-primary-red-05` |
| 06 | `#c22d1d` | `.ap-text-primary-red-06` |
| 07 | `#a62b1e` | `.ap-text-primary-red-07` |
| 08 | `#772820` | `.ap-text-primary-red-08` |
| 09 | `#472420` | `.ap-text-primary-red-09` |

#### Primary Pink

| Shade | Hex | Class |
|-------|-----|-------|
| 01 | `#f8dde1` | `.ap-text-primary-pink-01` |
| 02 | `#f1bac3` | `.ap-text-primary-pink-02` |
| 03 | `#e998a6` | `.ap-text-primary-pink-03` |
| 04 | `#e27588` | `.ap-text-primary-pink-04` |
| 05 | `#d93954` | `.ap-text-primary-pink-05` |
| 06 | `#b5485b` | `.ap-text-primary-pink-06` |
| 07 | `#903f4d` | `.ap-text-primary-pink-07` |
| 08 | `#6b343d` | `.ap-text-primary-pink-08` |
| 09 | `#462b2f` | `.ap-text-primary-pink-09` |

### Named Color Palettes (5 shades each)

#### Orange

| Shade | Hex | Class |
|-------|-----|-------|
| darker | `#571f01` | `.ap-text-orange-darker` |
| dark | `#933401` | `.ap-text-orange-dark` |
| base | `#d04a02` | `.ap-text-orange` |
| light | `#fd6412` | `.ap-text-orange-light` |
| lighter | `#feb791` | `.ap-text-orange-lighter` |

#### Tangerine

| Shade | Hex | Class |
|-------|-----|-------|
| darker | `#714300` | `.ap-text-tangerine-darker` |
| dark | `#ae6800` | `.ap-text-tangerine-dark` |
| base | `#eb8c00` | `.ap-text-tangerine` |
| light | `#ffa929` | `.ap-text-tangerine-light` |
| lighter | `#ffdca9` | `.ap-text-tangerine-lighter` |

#### Yellow

| Shade | Hex | Class |
|-------|-----|-------|
| darker | `#855f00` | `.ap-text-yellow-darker` |
| dark | `#c28a00` | `.ap-text-yellow-dark` |
| base | `#ffb600` | `.ap-text-yellow` |
| light | `#ffc83d` | `.ap-text-yellow-light` |
| lighter | `#ffecbd` | `.ap-text-yellow-lighter` |

#### Red

| Shade | Hex | Class |
|-------|-----|-------|
| darker | `#741910` | `.ap-text-red-darker` |
| dark | `#aa2417` | `.ap-text-red-dark` |
| base | `#e0301e` | `.ap-text-red` |
| light | `#e86153` | `.ap-text-red-light` |
| lighter | `#f7c8c4` | `.ap-text-red-lighter` |

#### Rose

| Shade | Hex | Class |
|-------|-----|-------|
| darker | `#6e2a35` | `.ap-text-rose-darker` |
| dark | `#a43e50` | `.ap-text-rose-dark` |
| base | `#d93954` | `.ap-text-rose` |
| light | `#e27588` | `.ap-text-rose-light` |
| lighter | `#f1bac3` | `.ap-text-rose-lighter` |

#### Gray

| Shade | Hex | Class |
|-------|-----|-------|
| darker | `#141414` | `.ap-text-gray-darker` |
| dark | `#2d2d2d` | `.ap-text-gray-dark` |
| base | `#7d7d7d` | `.ap-text-gray` |
| light | `#dedede` | `.ap-text-gray-light` |
| lighter | `#f2f2f2` | `.ap-text-gray-lighter` |

#### Purple

| Shade | Hex | Class |
|-------|-----|-------|
| darker | `#4b20ab` | `.ap-text-purple-darker` |
| dark | `#6b2cda` | `.ap-text-purple-dark` |
| base | `#8e34f4` | `.ap-text-purple` |
| light | `#b056f6` | `.ap-text-purple-light` |
| lighter | `#dcb4fc` | `.ap-text-purple-lighter` |

#### Blue

| Shade | Hex | Class |
|-------|-----|-------|
| darker | `#003dab` | `.ap-text-blue-darker` |
| dark | `#0060d7` | `.ap-text-blue-dark` |
| base | `#0089eb` | `.ap-text-blue` |
| light | `#4dacf1` | `.ap-text-blue-light` |
| lighter | `#b3dcf9` | `.ap-text-blue-lighter` |

#### Green

| Shade | Hex | Class |
|-------|-----|-------|
| darker | `#175c2c` | `.ap-text-green-darker` |
| dark | `#2c8646` | `.ap-text-green-dark` |
| base | `#4eb523` | `.ap-text-green` |
| light | `#86db4f` | `.ap-text-green-light` |
| lighter | `#c4fc9f` | `.ap-text-green-lighter` |

### State Palettes (9 shades each)

#### Error

| Shade | Hex |
|-------|-----|
| 01 | `#f3d4d1` |
| 02 | `#e8aaa3` |
| 03 | `#dc7f76` |
| 04 | `#d15548` |
| 05 | `#c52a1a` |
| 06 | `#a4291d` |
| 07 | `#822720` |
| 08 | `#612622` |
| 09 | `#3f2425` |

#### Warning

| Shade | Hex |
|-------|-----|
| 01 | `#fff2d2` |
| 02 | `#ffe5a5` |
| 03 | `#ffd979` |
| 04 | `#ffcc4c` |
| 05 | `#ffbf1f` |
| 06 | `#d2a021` |
| 07 | `#a58123` |
| 08 | `#786124` |
| 09 | `#4b4226` |

#### Success

| Shade | Hex |
|-------|-----|
| 01 | `#d3ebd5` |
| 02 | `#a7d6ab` |
| 03 | `#7ac282` |
| 04 | `#4ead58` |
| 05 | `#22992e` |
| 06 | `#21812d` |
| 07 | `#206a2c` |
| 08 | `#20522a` |
| 09 | `#1f3b29` |

### Color Utility Class Patterns

All color palettes are available in three forms:

| Prefix | Property | Example |
|--------|----------|---------|
| `.ap-text-{name}` | `color` | `.ap-text-primary-red-05` |
| `.ap-bg-{name}` | `background-color` | `.ap-bg-primary-red-05` |
| `.ap-border-{name}` | `border-color` | `.ap-border-primary-red-05` |

---

## 3. Typography

### Font Family

```css
font-family: "PwC Helvetica Neue", sans-serif;
```

Applied globally to `html`, `body`, and form elements.

### Typography Presets

| Class | Font Shorthand |
|-------|---------------|
| `.ap-typography-body-xs` | `400 0.75rem/0.875rem "PwC Helvetica Neue", sans-serif` |
| `.ap-typography-body-s` | `400 0.875rem/1.25rem "PwC Helvetica Neue", sans-serif` |
| `.ap-typography-body` | `400 1rem/1.5rem "PwC Helvetica Neue", sans-serif` |
| `.ap-typography-subheading` | `500 1.25rem/1.5rem "PwC Helvetica Neue", sans-serif` |
| `.ap-typography-heading-s` | `500 1.25rem/1.5rem "PwC Helvetica Neue", sans-serif` |
| `.ap-typography-heading` | `500 1.5rem/2rem "PwC Helvetica Neue", sans-serif` |
| `.ap-typography-heading-m` | `500 1.5rem/2rem "PwC Helvetica Neue", sans-serif` |
| `.ap-typography-heading-l` | `500 2.25rem/2.625rem "PwC Helvetica Neue", sans-serif` |
| `.ap-typography-large-heading` | `500 2.25rem/2.625rem "PwC Helvetica Neue", sans-serif` |
| `.ap-typography-data` | `500 3rem/3rem "PwC Helvetica Neue", sans-serif` |

### Numbered Typography Shorthands

| Class | Size/Line-height |
|-------|-----------------|
| `.ap-typography-1` | `0.75rem/0.875rem` |
| `.ap-typography-2` | `0.875rem/1.25rem` |
| `.ap-typography-3` | `1rem/1.5rem` |
| `.ap-typography-4` | `1.25rem/1.5rem` |
| `.ap-typography-5` | `1.5rem/2rem` |
| `.ap-typography-6` | `3rem/3rem` |

### Font Size Utilities

Pattern: `.ap-font-{n}` where n = 1 to 48, sets `font-size: {n}px`.

Examples: `.ap-font-12` = `font-size: 12px`, `.ap-font-16` = `font-size: 16px`

### Font Weight Utilities

| Class | Weight |
|-------|--------|
| `.ap-font-weight-1` | `400` |
| `.ap-font-weight-2` | `500` |
| `.ap-font-weight-3` | `700` |
| `.ap-font-medium` | `500` (via `--font-weight-2`) |

### Text Utilities

| Class | Effect |
|-------|--------|
| `.ap-text-highlight` | `font-weight: var(--font-weight-2)` |
| `.ap-text-underline` | `text-decoration: underline` |
| `.ap-link` | Underlined link, primary color, no-underline on hover |

---

## 4. Spacing

### Utility Pattern

**Margin:** `.ap-m{side}-spacing-{1-8}`

| Prefix | Sides |
|--------|-------|
| `.ap-m-` | all |
| `.ap-mx-` | left + right |
| `.ap-my-` | top + bottom |
| `.ap-mt-` | top |
| `.ap-mr-` | right |
| `.ap-mb-` | bottom |
| `.ap-ml-` | left |

**Padding:** `.ap-p{side}-spacing-{1-8}`

| Prefix | Sides |
|--------|-------|
| `.ap-p-` | all |
| `.ap-px-` | left + right |
| `.ap-py-` | top + bottom |
| `.ap-pt-` | top |
| `.ap-pr-` | right |
| `.ap-pb-` | bottom |
| `.ap-pl-` | left |

### Quick Reference

| Scale | Value | Margin Example | Padding Example |
|-------|-------|---------------|----------------|
| 1 | `0.125rem` (2px) | `.ap-m-spacing-1` | `.ap-p-spacing-1` |
| 2 | `0.25rem` (4px) | `.ap-m-spacing-2` | `.ap-p-spacing-2` |
| 3 | `0.5rem` (8px) | `.ap-m-spacing-3` | `.ap-p-spacing-3` |
| 4 | `0.75rem` (12px) | `.ap-m-spacing-4` | `.ap-p-spacing-4` |
| 5 | `1rem` (16px) | `.ap-m-spacing-5` | `.ap-p-spacing-5` |
| 6 | `1.25rem` (20px) | `.ap-m-spacing-6` | `.ap-p-spacing-6` |
| 7 | `1.5rem` (24px) | `.ap-m-spacing-7` | `.ap-p-spacing-7` |
| 8 | `3rem` (48px) | `.ap-m-spacing-8` | `.ap-p-spacing-8` |

---

## 5. Borders & Radius

### Border Radius Utilities

| Class | Value |
|-------|-------|
| `.ap-border-radius-1` | `0.125rem` (2px) |
| `.ap-border-radius-2` | `0.25rem` (4px) |
| `.ap-border-radius-3` | `0.5rem` (8px) |

### Border Color Utilities

Same pattern as text/bg colors: `.ap-border-{color-name}`

---

## 6. Shadows & Elevation

### Shadow Utilities

| Class | Effect |
|-------|--------|
| `.ap-level-1` | `box-shadow: var(--level-1)` — subtle |
| `.ap-level-2` | `box-shadow: var(--level-2)` — medium |
| `.ap-level-3` | `box-shadow: var(--level-3)` — prominent |

### Elevation Container Tokens (Light Mode)

| Token | Default | Hover | Selected | Hover+Selected |
|-------|---------|-------|----------|---------------|
| `high` | `#fff` | `#f3f3f3` | `#f3f3f3` | `#e8e8e8` |
| `medium` | `#fff` | `#f3f3f3` | `#f3f3f3` | `#e8e8e8` |
| `low` | `#fff` | `#f3f3f3` | `#f3f3f3` | `#e8e8e8` |
| `flat` | `#f3f3f3` | `#e8e8e8` | `#e8e8e8` | `#ddd` |

---

## 7. Opacity

| Class | Value |
|-------|-------|
| `.ap-opacity-1` | `0.04` |
| `.ap-opacity-2` | `0.08` |
| `.ap-opacity-3` | `0.12` |
| `.ap-opacity-4` | `0.24` |
| `.ap-opacity-5` | `0.32` |
| `.ap-opacity-6` | `0.48` |
| `.ap-opacity-7` | `1` |

### Blur Utilities

| Class | Effect |
|-------|--------|
| `.ap-background-blur-1` | `backdrop-filter: blur(0.125rem)` |
| `.ap-background-blur-2` | `backdrop-filter: blur(0.5rem)` |

---

## 8. Sizing

### Container Sizing

| Class | Dimensions |
|-------|-----------|
| `.ap-container-16` | `1rem` (16px) width/height |
| `.ap-container-24` | `1.5rem` (24px) width/height |
| `.ap-container-32` | `2rem` (32px) width/height |
| `.ap-container-40` | `2.5rem` (40px) width/height |

All set `line-height` equal to their dimensions.

### Logo

| Class | Dimensions |
|-------|-----------|
| `.ap-pwc-logo` | `3.25rem x 2.5rem` |
| `.ap-pwc-logo-simplified` | `2.625rem x 2.5rem` |

---

## 9. Layout & Display

| Class | Effect |
|-------|--------|
| `.ap-flex` | `display: flex` |
| `.ap-dialog-container` | Fixed fullscreen overlay, `z-index: 2001`, `pointer-events: none` |

> **Note:** Appkit4 does not include a grid system or flexbox utility set in this CSS file. Layout is handled via custom CSS or the web components.

---

## 10. Icons

Font family: `appkit4-font`

Class pattern: `.Appkit4-icon.icon-{name}`

Over 400 icon glyphs available. Common icons include:

- Navigation: `icon-arrow-left-fill`, `icon-arrow-right-fill`, `icon-arrow-up-fill`, `icon-arrow-down-fill`
- Actions: `icon-add-outline`, `icon-close-outline`, `icon-delete-outline`, `icon-edit-outline`
- UI: `icon-search-outline`, `icon-menu-outline`, `icon-settings-outline`, `icon-filter-outline`
- Status: `icon-alert-fill`, `icon-check-outline`, `icon-info-outline`, `icon-warning-outline`
- Content: `icon-document-outline`, `icon-folder-outline`, `icon-image-outline`, `icon-link-outline`

Usage:
```html
<span class="Appkit4-icon icon-search-outline"></span>
```

---

## 11. Theming

### Theme Attribute

Set on a parent element: `data-theme="orange"`, `data-theme="teal"`, etc.

| Theme | Primary Color | Primary Light |
|-------|--------------|--------------|
| (default/blue) | `#415385` | `#62719a` |
| `orange` | `#d04a02` | `#e45c2b` |
| `teal` | `#26776d` | `#27897e` |
| `pink` | `#d93954` | `#e27588` |
| `red` | `#e0301e` | `#e44f3f` |
| `black` | `#2d2d2d` | `#474747` |

### Mode Attribute

Set on a parent element: `data-mode="light"` or `data-mode="dark"`

Affects all `--color-background-*`, `--color-text-*`, shadow, and elevation tokens.

---

## 12. Global Resets

The CSS applies these resets globally:

```css
* {
  vertical-align: baseline;
  font-size: 100%;
  border: 0;
  box-sizing: border-box;
}

html, body {
  font-family: "PwC Helvetica Neue", sans-serif;
}

body {
  letter-spacing: -0.025rem;
  color: var(--color-text-heading);
}
```

---

## 13. Tailwind to Appkit4 Migration Map

### Text Colors

| Tailwind | Appkit4 | Hex |
|----------|---------|-----|
| `text-gray-500` | `ap-text-neutral-13` | `#757575` |
| `text-red-600` | `ap-text-red` | `#e0301e` |
| `text-orange-500` | `ap-text-orange` | `#d04a02` |
| `text-amber-500` | `ap-text-tangerine` | `#eb8c00` |
| `text-green-600` | `ap-text-green-dark` | `#2c8646` |
| `text-teal-600` | `ap-text-primary-teal-07` | `#26776d` |
| `text-blue-600` | `ap-text-blue-dark` | `#0060d7` |
| `text-indigo-600` | `ap-text-primary-blue-04` | `#415385` |
| `text-purple-600` | `ap-text-purple-dark` | `#6b2cda` |
| `text-pink-600` | `ap-text-primary-pink-05` | `#d93954` |
| `text-black` | `ap-text-neutral-23` | `#000000` |

### Background / Highlight Colors

| Tailwind | Appkit4 | Hex |
|----------|---------|-----|
| `bg-yellow-200` | `ap-bg-yellow-lighter` | `#ffecbd` |
| `bg-lime-200` | `ap-bg-green-lighter` | `#c4fc9f` |
| `bg-green-200` | `ap-bg-states-success-01` | `#d3ebd5` |
| `bg-cyan-200` | `ap-bg-primary-teal-01` | `#d4ebe9` |
| `bg-blue-200` | `ap-bg-blue-lighter` | `#b3dcf9` |
| `bg-violet-200` | `ap-bg-purple-lighter` | `#dcb4fc` |
| `bg-pink-200` | `ap-bg-primary-pink-01` | `#f8dde1` |
| `bg-orange-200` | `ap-bg-primary-orange-01` | `#fedacc` |
| `bg-red-200` | `ap-bg-primary-red-01` | `#f9d6d2` |

### Font Sizes

| Tailwind | Appkit4 |
|----------|---------|
| `text-xs` (12px) | `.ap-font-12` or `.ap-typography-body-xs` |
| `text-sm` (14px) | `.ap-font-14` or `.ap-typography-body-s` |
| `text-base` (16px) | `.ap-font-16` or `.ap-typography-body` |
| `text-lg` (18px) | `.ap-font-18` |
| `text-xl` (20px) | `.ap-font-20` or `.ap-typography-heading-s` |
| `text-2xl` (24px) | `.ap-font-24` or `.ap-typography-heading-m` |

### Spacing

| Tailwind | Appkit4 |
|----------|---------|
| `p-1` (4px) | `.ap-p-spacing-2` |
| `p-2` (8px) | `.ap-p-spacing-3` |
| `p-3` (12px) | `.ap-p-spacing-4` |
| `p-4` (16px) | `.ap-p-spacing-5` |
| `p-6` (24px) | `.ap-p-spacing-7` |
| `m-1` (4px) | `.ap-m-spacing-2` |
| `m-2` (8px) | `.ap-m-spacing-3` |
| `m-4` (16px) | `.ap-m-spacing-5` |

### Utilities NOT in Appkit4 (need custom CSS)

These Tailwind utilities have no Appkit4 equivalent and must stay as custom CSS:

- Flexbox: `flex`, `flex-col`, `items-center`, `justify-center`, `gap-*`
- Grid: `grid`, `grid-cols-*`
- Width/Height: `w-*`, `h-*`, `min-h-*`
- Position: `relative`, `absolute`, `fixed`, `inset-0`
- Display: `block`, `inline-flex`, `hidden`
- Overflow: `overflow-hidden`, `overflow-auto`
- Cursor: `cursor-pointer`, `cursor-grab`
- Border: `border`, `border-solid`, `rounded-*`
- Transition: `transition`, `duration-*`, `ease-*`
- Transform: `scale-*`, `translate-*`, `rotate-*`
