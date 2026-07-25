# Razer Family Rail

## Overview

`razer-family-rail` reproduces the `.mouse-family-rail` icon navigation from
the Razer gaming-mice demo page: a horizontally scrollable strip of 11
product-family links (Cobra, Signature Edition, DeathAdder, Viper, Naga,
Basilisk, Orochi, Pro Click, Compare, Accessories, Customs) with green NEW
badges. All entries are baked in, so a table containing only the block name
renders the exact source rail.

## DA.live Authoring Model

6 columns, typed rows. Column 1 is the row type.

| Row | Columns 2–6 | Notes |
| --- | --- | --- |
| `setting` | key, value | keys: `aria-label`, `content-mode` (`merge`/`replace`) |
| `family` | key, label, href, icon, badge | key is stable + zero-padded (`family-01`…); icon accepts an uploaded image, link, or path; `__empty__` clears a preset field; clearing the label removes the entry |

Copy-paste artifacts: [razer-family-rail-da-live.html](./razer-family-rail-da-live.html)
or [razer-family-rail-table.txt](./razer-family-rail-table.txt).

## Behavior

- Icons are recolored white via `filter: brightness(0) invert()` and lift
  3px on hover, matching the source.
- The in-page entries link to `#products`, the anchor rendered by
  `razer-plp-intro` (authorable on both sides — repoint together).
- Rail centers its items; switches to `flex-start` scrolling at ≤1260px;
  tightens gap/height at ≤680px (source-parity breakpoints).

## Registration

Referenced from `models/_component-definition.json`; run `npm run build:json`
after model changes.

## Files

- [razer-family-rail.js](./razer-family-rail.js)
- [razer-family-rail.css](./razer-family-rail.css) — carries the shared
  `rzrm` token preamble guarded by `tests/razer-mice/tokens.test.mjs`
- [_razer-family-rail.json](./_razer-family-rail.json)
