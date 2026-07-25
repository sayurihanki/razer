# Razer Family Grid Block

## Overview

The product-family showcase: image cards with a gradient overlay, corner index, title, copy and CTA. One card spans the full grid width on desktop.

## DA.live Authoring Model

Author with a table whose first cell is `razer-family-grid`. Every row is optional — omit
a row and the block falls back to the default shown, so a table containing only
the block name renders the section exactly as it appears on the source site.

| Key | Meaning | Default |
|---|---|---|
| `eyebrow` | Section eyebrow | The Razer arsenal |
| `title` | Section heading | Built to break limits. |
| `intro` | Section intro paragraph | — |
| `card-wide` | Full-width card: `index | title | copy | link | image` | Razer Blade 18 |
| `card` | Standard card, same cells, repeatable | Basilisk / Soma |

Links accept either an authored anchor or a bare URL; images accept an authored
`<img>` or a bare path. `razer-family-grid-da-live.html` is a complete pre-filled table —
paste it into a blank DA.live document to reproduce the section.

## Behavior

- The wide card renders the solid CTA and standard cards the ghost CTA; the variant is derived from the row key rather than authored.
- The `<img>` is appended as a direct child of the card because the object-fit rules target `.family-card > img`.
- The block rebuilds its DOM rather than decorating in place: the source styling
  leans on direct-child combinators and `nth-child`, which EDS's default
  `div > div` row structure does not produce.

## Dependencies

- `scripts/razer-chroma.js` — shared row readers and element helpers.
- `styles/razer-chroma-shared.css` — tokens, `.shell`, `.eyebrow` and the
  `.button` family. Injected automatically by `loadRazerChromaStyles` in
  `scripts/scripts.js` whenever a razer-chroma block is on the page; the block
  name must stay listed in `RAZER_CHROMA_BLOCKS` there.
