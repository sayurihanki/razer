# Razer Proof Strip Block

## Overview

The benefits bar beneath the hero: a highlighted stat panel followed by any number of glyph + title + copy benefits, divided by rules that rearrange across four breakpoints.

## DA.live Authoring Model

Author with a table whose first cell is `razer-proof-strip`. Every row is optional — omit
a row and the block falls back to the default shown, so a table containing only
the block name renders the section exactly as it appears on the source site.

| Key | Meaning | Default |
|---|---|---|
| `label` | Accessible label for the section | RazerStore benefits and proof |
| `feature` | Highlighted panel: `headline | source` | #1 Mouse Brand |
| `item` | Benefit: `glyph | title | copy`, repeatable | ↯ Next Business Day Shipping |

Links accept either an authored anchor or a bare URL; images accept an authored
`<img>` or a bare path. `razer-proof-strip-da-live.html` is a complete pre-filled table —
paste it into a blank DA.live document to reproduce the section.

## Behavior

- The first article is deliberately a different shape (`.proof-feature`) from the rest, and every responsive border rule keys off `nth-child` — so article order is load-bearing.
- Full-bleed so the top and bottom rules span the viewport.
- The block rebuilds its DOM rather than decorating in place: the source styling
  leans on direct-child combinators and `nth-child`, which EDS's default
  `div > div` row structure does not produce.

## Dependencies

- `scripts/razer-chroma.js` — shared row readers and element helpers.
- `styles/razer-design-system.css` — tokens, `.shell`, `.eyebrow` and the
  `.button` family. Loaded on every page from `head.html`, so there is no list
  to register with; `markRazerBlocks` in `scripts/scripts.js` stamps the
  `.rzr-block` marker that scopes the primitives.
