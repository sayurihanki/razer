# Razer Site Header

## Overview

`razer-site-header` reproduces the full site chrome from the Razer
gaming-mice demo page: skip link, black global nav with green underline
hover states, the Store mega menu, the category nav strip, a shared
backdrop, the mobile navigation panel, the cart drawer, and the
live-search dialog. All content is baked in, so a table containing only
the block name renders the exact source header.

This is the site-wide header. Authored pages place the block themselves;
every other page — the storefront pages inherited from the boilerplate
(cart, checkout, the customer account pages, order status) and anything
authored without it — has it built in by `buildRazerChrome` in
`scripts/scripts.js`, which also collapses the boilerplate `<header>`
and `<footer>`. A page opts out with `chrome: none` in its metadata and
gets the boilerplate nav back.

The cart panel is wired to Adobe Commerce: the icon shows a live item
count and the panel mounts the real `/mini-cart` dropin. See "Live
cart" under Behavior.

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
`category-aria-label`, `search-button-label`, `account-button-label`,
`account-href`, `cart-button-label`,
`menu-button-label`, `menu-heading`, `menu-close-label`,
`mobile-aria-label`, `cart-heading`, `cart-close-label`,
`cart-aria-label`, `cart-empty-title`, `cart-empty-body`,
`cart-button-label-one`, `cart-heading-one`, `cart-autoopen`,
`search-heading`, `search-close-label`, `search-label`,
`search-placeholder`, `search-submit-label`, `search-popular-label`,
`search-empty-message`, `search-products-label`, `search-links-label`,
`search-max-products` (1–10, default 6), `search-max-links` (1–8,
default 4).

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
- **Account:** the one icon in the row that navigates rather than
  opening a panel — a plain link to `account-href`. Because this header
  replaced the boilerplate nav site-wide it is the only route to
  sign-in, and the commerce account pages redirect a signed-out visitor
  to the login form, so a single link covers both states. Clearing
  `account-button-label` or `account-href` removes it.
- **Live cart:** the cart icon carries a badge driven by the dropin
  `cart/data` event, and `cart-button-label` / `cart-heading` are
  templates — `{count}` is substituted, with `-one` variants for the
  singular. Opening the panel lazily mounts the `/mini-cart` fragment
  (real line items, quantity edit, remove, totals, View cart /
  Checkout) into `.cart-panel-body`; the baked-in "Your cart is empty"
  node is the pre-hydration and offline state. A single-flight promise
  stops a double-click mounting it twice, and a failed load is
  retried on the next open. `cart/product/added` opens the panel
  unless `cart-autoopen` is `false`. This is why
  `collapseBoilerplateHeader` hiding the boilerplate header on Razer
  pages is correct: the Razer header now owns a real cart.
- **Cart drawer skin:** the dropin ships neutral light-theme markup, so
  `razer-site-header.css` re-points the dropin design tokens
  (`--color-brand-500`, the neutral ramp, `--type-base-font-family`) on
  the `.dropin-design` elements themselves — declaring them on an
  ancestor loses to the block's own class — and dresses the result:
  panel head, item cards with a hover-lit green rail, the configuration
  list as a condensed-label build sheet, and a pinned checkout bar. The
  panel is a flex column and the chain continues through the fragment's
  section/wrapper/block so the item list scrolls on its own. The
  dropin's own "Shopping Cart (n)" heading and raw SKU line are hidden:
  the drawer head already carries the count and the configuration rows
  already name the variant. Catalog placeholder images are dropped so a
  missing product shot reads as an empty lit tile, not a white square.
- **Live search:** the dialog ranks the real product catalog — imported
  from `razer-product-explorer` (`DEFAULT_PRODUCTS`), so both blocks
  share one source of truth — plus the `search-popular` quick-link
  index as you type. Product hits render as rows with the product
  image, family · playstyle meta, and price; matched text is
  highlighted with `<mark>`. Tokens AND together; title matches
  outrank keyword matches. "Popular" shows the top 3 quick links when
  the input is empty; no matches shows `search-empty-message`.
- Search keyboard support: Arrow Up/Down move the active option
  (combobox/listbox semantics, `aria-activedescendant`), Enter opens
  the active option (or the top result while typing), Escape closes.
  The result-count line is a polite live region.
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
