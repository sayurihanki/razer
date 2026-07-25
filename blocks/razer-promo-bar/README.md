# Razer Promo Bar

## Overview

`razer-promo-bar` reproduces the `.sitewide-promo` strip from the Razer
gaming-mice demo page: a slim gray bar with a message and one inline link.
The full strip content is baked in, so a DA.live table containing only the
block name renders the exact source strip. Part of the razer-mice block
family (see also `razer-site-header`, `razer-plp-hero`,
`razer-product-explorer`, …), all of which can be pasted onto any DA.live
page independently.

## DA.live Authoring Model

4 columns, typed rows. Column 1 is the row type.

| Row | Columns 2–4 | Notes |
| --- | --- | --- |
| `setting` | key, value | `content-mode` = `merge` (default) or `replace` |
| `promo` | text, link label, link href | Every cell optional; empty keeps the baked-in default, `__empty__` clears it |

Copy-paste artifacts: [razer-promo-bar-da-live.html](./razer-promo-bar-da-live.html)
(paste into DA.live) or [razer-promo-bar-table.txt](./razer-promo-bar-table.txt)
(tab-separated, paste into a doc table).

## Behavior

- Renders nothing if both the text and the link resolve to empty.
- The link keeps the source styling: white, weight 500, underline on hover.
- Breakpoints follow the source page (`680px`), not the repo's default
  600/900/1200 ladder — required for pixel parity with the demo site.

## Registration

Already referenced from `models/_component-definition.json`. After model
changes run:

```bash
npm run build:json
```

## Files

- [razer-promo-bar.js](./razer-promo-bar.js)
- [razer-promo-bar.css](./razer-promo-bar.css) — carries the shared
  `rzrm` token preamble guarded by `tests/razer-mice/tokens.test.mjs`
- [_razer-promo-bar.json](./_razer-promo-bar.json)
