# Razer Site Header

## Overview

`razer-site-header` reproduces the full site chrome from the Razer
gaming-mice demo page: skip link, black global nav with green underline
hover states, the Store mega menu, the category nav strip, a shared
backdrop, the mobile navigation panel, the light-themed cart panel, and
the search dialog with its small client-side index. All content is baked
in, so a table containing only the block name renders the exact source
header.

## DA.live Authoring Model

6 columns, typed rows. Column 1 is the row type.

| Row | Columns 2–6 |
| --- | --- |
| `setting` | key, value |
| `nav` | key, label, href, kind (`link`/`menu`) |
| `mega-column` | key, label |
| `mega-link` | column-key, key, label, href, feature (`true`/`false`) |
| `category` | key, label, href |
| `mobile-link` | key, label, href |
| `panel-cta` | label, href |
| `cart-cta` | label, href |
| `search-popular` | key, label, href, terms |

Setting keys: `content-mode`, `logo`, `logo-alt`, `home-href`,
`home-label`, `skip-label`, `skip-href`, `nav-aria-label`,
`category-aria-label`, `search-button-label`, `cart-button-label`,
`menu-button-label`, `menu-heading`, `menu-close-label`,
`mobile-aria-label`, `cart-heading`, `cart-close-label`,
`cart-aria-label`, `cart-empty-title`, `cart-empty-body`,
`search-heading`, `search-close-label`, `search-label`,
`search-placeholder`, `search-submit-label`, `search-popular-label`,
`search-empty-message`.

Keys are stable and zero-padded; authored rows override preset fields by
key, new keys append; `__empty__` clears a value; clearing a label
removes the entry. Removing every `category` row removes the category
strip (the spacer shrinks automatically).

Copy-paste artifacts (regenerate with
`node blocks/razer-site-header/generate-authoring.mjs`):
[razer-site-header-da-live.html](./razer-site-header-da-live.html) and
[razer-site-header-table.txt](./razer-site-header-table.txt).

## Behavior

- **Fixed, not sticky:** EDS wraps each block in its own section, which
  caps `position: sticky` at the section's height, so the header is
  `position: fixed` with a spacer whose height is measured from the
  rendered header (ResizeObserver) — never hardcoded.
- Store toggles the mega menu; the search/cart/menu icon buttons open
  their panels; backdrop click and Escape close everything; only one
  panel is open at a time.
- Search filters a small client-side index as you type: "Popular" shows
  the top 3 when empty, otherwise "N result(s)" with an empty-state
  message; submit is prevented (parity with the source).
- Icons are CSS pseudo-element drawings — no icon assets.
- Breakpoints at 680/1100/1260px (source parity): desktop nav hides at
  ≤1100px (hamburger appears), the last 3 nav links hide at ≤1260px,
  compact bar at ≤680px.

## Registration

Referenced from `models/_component-definition.json`; run `npm run build:json`
after model changes.

## Files

- [razer-site-header.js](./razer-site-header.js)
- [razer-site-header.css](./razer-site-header.css) — carries the shared
  `rzrm` token preamble guarded by `tests/razer-mice/tokens.test.mjs`
- [generate-authoring.mjs](./generate-authoring.mjs)
- [_razer-site-header.json](./_razer-site-header.json)
