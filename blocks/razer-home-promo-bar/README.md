# Razer Home Promo Bar Block

## Overview

Renders the homepage sitewide promo strip: a centred message with a trailing link on a full-bleed grey bar.

Named `razer-home-promo-bar` rather than `razer-promo-bar` because the PLP page ships its own promo strip block with different copy and a different table contract; the two are not interchangeable.

## DA.live Authoring Model

Author with a table whose first cell is `razer-home-promo-bar`. Every row is optional — omit
a row and the block falls back to the default shown, so a table containing only
the block name renders the section exactly as it appears on the source site.

| Key | Meaning | Default |
|---|---|---|
| `message` | Promo copy | Razer Back-to-School Kits… |
| `cta` | Link rendered at the end of the strip | Shop now > → /education |

Links accept either an authored anchor or a bare URL; images accept an authored
`<img>` or a bare path. `razer-home-promo-bar-da-live.html` is a complete pre-filled table —
paste it into a blank DA.live document to reproduce the section.

## Behavior

- Wrapper is neutralised to full-bleed so the grey bar spans the viewport.
- The block rebuilds its DOM rather than decorating in place: the source styling
  leans on direct-child combinators and `nth-child`, which EDS's default
  `div > div` row structure does not produce.

## Dependencies

- `scripts/razer-chroma.js` — shared row readers and element helpers.
- `styles/razer-chroma-shared.css` — tokens, `.shell`, `.eyebrow` and the
  `.button` family. Injected automatically by `loadRazerChromaStyles` in
  `scripts/scripts.js` whenever a razer-chroma block is on the page; the block
  name must stay listed in `RAZER_CHROMA_BLOCKS` there.
