# Razer PDP Related

## Overview

`razer-pdp-related` is the "More ways to play." related-products rail
of the Basilisk V3 Pro 35K product detail page: a section heading with
the view-all link and three product cards (Viper V3 Pro, Basilisk V3
35K, Cobra Pro) with hover lift, image zoom, and staggered reveal. All
content is baked in, so a table containing only the block name renders
the complete section.

## DA.live Authoring Model

8 columns, typed rows. Column 1 is the row type.

| Row | Columns 2–8 |
| --- | --- |
| `setting` | key, value |
| `product` | key, image, meta, title, description, price, href |

Setting keys: `content-mode` (`merge`/`replace`), `eyebrow`,
`heading`, `link-label`, `link-href`, `cta-label`.

Rules (shared with the razer-mice family): keys are stable and
zero-padded (`product-01` … `product-03`); an empty title removes a
preset entry; `__empty__` clears a value; an empty cell keeps it.

## Behavior

- Cards lift with a green border glow and a slow image zoom on hover;
  the card image link carries `tabindex="-1"` so keyboard users hit
  each destination once (title link and CTA remain tabbable).
- Scroll reveals stagger via `--reveal-i`; all motion collapses under
  `prefers-reduced-motion: reduce`.
- Grid is 1-up, 2-up at 681px, 3-up at 981px (source parity;
  documented deviation from the repo ladder).

## Registration

Referenced from `models/_component-definition.json`; run
`npm run build:json` after model changes.

## Files

- [razer-pdp-related.js](./razer-pdp-related.js)
- [razer-pdp-related.css](./razer-pdp-related.css) — carries the shared
  `rzrm` token preamble guarded by `tests/razer-mice/tokens.test.mjs`
- [_razer-pdp-related.json](./_razer-pdp-related.json)
- Copy-paste artifacts: [razer-pdp-related-da-live.html](./razer-pdp-related-da-live.html)
  and [razer-pdp-related-table.txt](./razer-pdp-related-table.txt)
