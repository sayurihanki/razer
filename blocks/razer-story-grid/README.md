# Razer Story Grid Block

## Overview

The editorial section: a mosaic of image cards where one card spans both rows on desktop, each with a green kicker, title and copy over a gradient scrim.

## DA.live Authoring Model

Author with a table whose first cell is `razer-story-grid`. Every row is optional — omit
a row and the block falls back to the default shown, so a table containing only
the block name renders the section exactly as it appears on the source site.

| Key | Meaning | Default |
|---|---|---|
| `eyebrow` | Section eyebrow | Latest from Razer |
| `title` | Section heading | Inside the ecosystem. |
| `intro` | Section intro paragraph | — |
| `card-main` | Tall card: `kicker | title | copy | link | image` | Seiren V3 Chroma |
| `card` | Standard card, same cells, repeatable | Soma / Blade 18 |

Links accept either an authored anchor or a bare URL; images accept an authored
`<img>` or a bare path. `razer-story-grid-da-live.html` is a complete pre-filled table —
paste it into a blank DA.live document to reproduce the section.

## Behavior

- The main card takes `grid-row: 1 / 3` from 681px; below that the grid is a single column and all cards are equal.
- Images scale slightly on hover.
- The block rebuilds its DOM rather than decorating in place: the source styling
  leans on direct-child combinators and `nth-child`, which EDS's default
  `div > div` row structure does not produce.

## Dependencies

- `scripts/razer-chroma.js` — shared row readers and element helpers.
- `styles/razer-chroma-shared.css` — tokens, `.shell`, `.eyebrow` and the
  `.button` family. Injected automatically by `loadRazerChromaStyles` in
  `scripts/scripts.js` whenever a razer-chroma block is on the page; the block
  name must stay listed in `RAZER_CHROMA_BLOCKS` there.
