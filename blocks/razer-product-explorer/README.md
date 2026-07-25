# Razer Product Explorer

## Overview

`razer-product-explorer` reproduces the gaming-mice product explorer from
the Razer demo page: a sticky desktop filter sidebar, results toolbar with
live count and sort, a responsive card grid of 10 mice, a mobile filter
drawer with backdrop, and the empty-results state. The full catalog and
all filter groups are baked in, so a table containing only the block name
renders the exact source experience.

## DA.live Authoring Model

12 columns, typed rows. Column 1 is the row type.

| Row | Columns 2–12 |
| --- | --- |
| `setting` | key, value |
| `filter-group` | group-key, legend |
| `filter-option` | group-key, option-key, label, match-value |
| `sort-option` | key, label |
| `product` | key, enabled, image, title, family, playstyle, connectivity, badge, price-text, price-value, url |
| `product-detail` | key, description, attributes (list or newline-separated), availability-lead, availability-note, detail-label, configure-label, configure-url |

Setting keys: `content-mode` (`merge`/`replace`), `aria-filters-label`,
`count-word`, `count-noun-singular`, `count-noun-plural`, `sort-default`,
`sort-label`, `filters-title`, `clear-all-label`, `mobile-filter-label`,
`drawer-title`, `drawer-close-label`, `show-results-label` (uses `{count}`),
`empty-title`, `empty-body`, `empty-clear-label`, `empty-cta-label`,
`empty-cta-href`, `service-note`, `detail-label`, `configure-label`.

Rules (shared with the razer-minipage family):

- Product keys are stable and zero-padded (`product-01` … `product-10`);
  authored rows override preset fields by key, new keys append.
- `enabled = false` on a `product` row removes a preset product.
- `__empty__` clears a preset value; an empty cell keeps it.
- `price-value` is the numeric sort price; when omitted it is parsed from
  `price-text` (handles `From US$39.99` and `US$159.99 · Black`).

Copy-paste artifacts (regenerate with
`node blocks/razer-product-explorer/generate-authoring.mjs`, which reads
the presets straight from the block JS so they cannot drift):
[razer-product-explorer-da-live.html](./razer-product-explorer-da-live.html)
and [razer-product-explorer-table.txt](./razer-product-explorer-table.txt).

## Behavior

- Filtering: OR within a group, AND across groups. Cards toggle `hidden`;
  the DOM is built once and never re-rendered.
- Sorting: `featured` keeps authored order; price sorts use the numeric
  value (unparseable prices sort last); `name` uses `localeCompare`; all
  ties fall back to authored order (deterministic).
- Desktop sidebar and mobile drawer render from the same config and stay
  in sync via delegated `change` handling; "Clear all" appears when any
  filter is active; the mobile Filters button shows the active count.
- Drawer: `.is-open` + backdrop, `aria-hidden`/`inert` when closed,
  Escape and backdrop click close it, focus moves to the close button on
  open and back to the Filters button on close, body scroll locks while
  open.
- Empty state offers "Clear filters" and "Open gear finder".
- Filter state stays in memory (no URL params), matching the source; the
  block root exposes `data-rzrm-visible` / `data-rzrm-sort` as test hooks.
- Breakpoints at 680/980/1260px (source parity; documented deviation from
  the repo ladder). The grid is 3-up above 1260px, 2-up to 681px, 1-up
  below; the sidebar↔drawer switch is at 980px.

## Registration

Referenced from `models/_component-definition.json`; run `npm run build:json`
after model changes.

## Files

- [razer-product-explorer.js](./razer-product-explorer.js)
- [razer-product-explorer.css](./razer-product-explorer.css) — carries the
  shared `rzrm` token preamble guarded by `tests/razer-mice/tokens.test.mjs`
- [generate-authoring.mjs](./generate-authoring.mjs)
- [_razer-product-explorer.json](./_razer-product-explorer.json)
