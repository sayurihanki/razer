# Razer PDP Hero

## Overview

`razer-pdp-hero` is the commerce heart of the Basilisk V3 Pro 35K
product detail page: breadcrumbs, product masthead, a four-shot
gallery with crossfade, swipe, and keyboard navigation, and the
three-step guided configurator (finish, model, RazerCare), and the
RazerStore services strip. Styling stays close to razer.com: flat dark
surfaces, green accents, and motion limited to the crossfade and the
price roll. All content is baked in, so a table containing only the
block name renders the complete experience.

The block renders that design synchronously and then hydrates against
the live Adobe Commerce catalog from
[razer-pdp-hero.commerce.js](./razer-pdp-hero.commerce.js): the
configurator gains real option UIDs, a quantity stepper and a working
Add to Cart button, and the displayed price switches to what Commerce
reports. Every failure path — no sku, product missing, catalog
unreachable — leaves the static render exactly as it is, with the
Razer.com hand-off anchor intact. See "Commerce" below.

## DA.live Authoring Model

6 columns, typed rows. Column 1 is the row type.

| Row | Columns 2–6 |
| --- | --- |
| `setting` | key, value |
| `crumb` | key, label, href (empty href marks the current page) |
| `image` | key, src, alt, caption |
| `keyspec` | key, text |
| `finish` | key, label, delta, swatch (`black`/`white`/`phantom-green`/`phantom-white`), option-uid |
| `model` | key, label, note, delta, option-uid |
| `care` | key, label, note, delta, option-uid |
| `service` | key, glyph, title, body |

Setting keys: `content-mode` (`merge`/`replace`), `breadcrumb-label`,
`title`, `subtitle`, `subtitle-link-label`, `subtitle-link-href`,
`gallery-label`, `prev-label`, `next-label`, `thumbs-label`,
`specs-link-label`, `specs-link-href`, `config-eyebrow`,
`config-title`, `config-body`, `finish-legend`, `model-legend`,
`care-legend`, `care-help-label`, `care-help-href`, `summary-label`,
`price-label`, `price-note`, `currency-prefix`, `base-price`,
`cta-label`, `cta-href`, `availability-note`, `services-label`.

Commerce setting keys: `sku`, `price-source`, `config-body-live`,
`add-to-cart-label`, `adding-label`, `added-label`,
`out-of-stock-label`, `unavailable-config-label`, `cart-error-label`,
`qty-label`, `qty-decrease-label`, `qty-increase-label`,
`price-options-note`, `in-stock-note`, `out-of-stock-note`.

Rules (shared with the razer-mice family):

- Keys are stable and zero-padded (`image-01` … `image-04`); authored
  rows override preset fields by key, new keys append.
- An empty label (or src for images / text for keyspecs) removes a
  preset entry; `__empty__` clears a value; an empty cell keeps it.
- `delta` values are numeric surcharges added to `base-price`. They
  drive the total **in the offline fallback only** — see Commerce.
- `option-uid` is the Adobe Commerce option-value UID for the entry.
  It is what add to cart sends, and it takes precedence over the
  label. Leave it blank and the block falls back to matching the
  catalog title, which already fails for three of the nine presets.

## Commerce

The page carries a `sku` document-metadata row (or the `sku` setting)
naming the configurable parent. `hydrate()` issues one Catalog Service
query for the product, its options and its variants, reconciles them
with the authored entries by `option-uid`, and then:

- swaps the Razer.com anchor for an Add to Cart button with
  idle / adding / added / error / unavailable / unmapped states,
- adds a quantity stepper (1–99) beside the price,
- disables finishes whose variant is out of stock,
- sends `{ sku: <parent sku>, quantity, optionsUIDs }` through
  `@dropins/storefront-cart`,
- reads the real line price back off the cart response and shows it,
  correcting the displayed total if the two disagree.

**Send the parent SKU, not the child.** Passing the child SKU with
`parentSku` is accepted by the API but produces a plain
`SimpleCartItem` on a SKU that is not individually visible in Catalog
Service. The cart then has no product to render — the mini-cart shows
a subtotal with no line items — and the configurable and customizable
option labels are lost. The parent shape yields a
`ConfigurableCartItem` carrying both.

**Pricing.** `price-source` defaults to `catalog+deltas`: the variant
price Commerce reports, plus the authored `model` and `care` deltas.
The finish delta is never added — the child SKU already carries any
colour surcharge, so adding it too would double-count.

The model and care deltas exist because Catalog Service cannot price
custom options at all: `ProductViewOptionValue` exposes only
id/title/inStock, `refineProduct` rejects custom-option UIDs, and this
endpoint has no core `products(filter:)`. So they are a **contract
with the Admin**, not decoration, and the only way to check them is a
real cart:

```
npm run verify:razer-pdp-contract -- --with-cart
```

That asserts every `optionUid` still exists, that every finish can
actually be bought, and that `variant price + delta` equals what the
cart charges. Run it after any Admin change. Set `price-source` to
`catalog` to fall back to showing only what Catalog Service can prove.

Note that the cart's own `regularPrice` excludes custom options, so
the boilerplate cart and mini-cart render "each" using the base price
while the line total includes the surcharges. That is upstream
behaviour, visible on `/cart` too.

**Degradation.** Any failure — missing sku, product absent,
`addToCartAllowed` false, GraphQL error, timeout, module import
failure — sets `data-commerce="offline"`, leaves the static render
untouched and keeps the Razer.com hand-off. `decorate()` stays
synchronous and the hydration promise is never awaited, so the
`fetchpriority="high"` gallery image remains the LCP element.

## Behavior

- Gallery: crossfade between shots, arrow buttons, thumbnail rail
  (`aria-pressed`), `aria-live` caption with `01 / 04` counter,
  ArrowLeft/ArrowRight keys, and pointer swipe. Non-active shots are
  preloaded during idle time; the first image is `fetchpriority="high"`
  for LCP. The crossfade is timer-driven (not rAF) so hidden-document
  throttling can never wedge it.
- Configurator: single-select button groups sync `aria-pressed` and
  `.is-selected`; the summary (finish + model), the trailing
  breadcrumb and the total all follow the selection. The announcement
  goes to one dedicated `role="status"` node rather than the whole
  summary, so the price tween cannot re-announce on every frame. The
  total tweens between values with a settle timer that guarantees the
  final figure.
- On desktop (≥981px) the configurator is sticky beside the gallery.
- The crossfade and price tween collapse to instant states under
  `prefers-reduced-motion: reduce`; there are no scroll reveals or
  ambient animations.
- Breakpoints at 680/980/1260px (source parity; documented deviation
  from the repo ladder).

## Registration

Referenced from `models/_component-definition.json`; run
`npm run build:json` after model changes.

## Files

- [razer-pdp-hero.js](./razer-pdp-hero.js)
- [razer-pdp-hero.commerce.js](./razer-pdp-hero.commerce.js) — the
  catalog query, option reconciliation and add-to-cart layer. Loaded
  with a dynamic `import()` and free of top-level browser-only
  imports, so its pure helpers stay unit-testable under `node --test`
  ([tests/razer-pdp/commerce.test.mjs](../../tests/razer-pdp/commerce.test.mjs))
- [razer-pdp-hero.css](./razer-pdp-hero.css) — carries the shared
  `rzrm` token preamble guarded by `tests/razer-mice/tokens.test.mjs`
- [_razer-pdp-hero.json](./_razer-pdp-hero.json)
- [generate-authoring.mjs](./generate-authoring.mjs) — regenerates the
  copy-paste artifacts for all four razer-pdp blocks straight from the
  block presets so they cannot drift
- Copy-paste artifacts: [razer-pdp-hero-da-live.html](./razer-pdp-hero-da-live.html)
  and [razer-pdp-hero-table.txt](./razer-pdp-hero-table.txt) — the
  full-page handoff lives at
  [/razer-basilisk-pdp-da-live.html](../../razer-basilisk-pdp-da-live.html)
