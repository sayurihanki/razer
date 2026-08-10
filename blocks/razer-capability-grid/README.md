# Razer Capability Grid Block

## Overview

The technology section: a section heading plus a responsive grid of capability cards, each with an auto-numbered index, a large glyph, a title, copy and a corner link.

## DA.live Authoring Model

Author with a table whose first cell is `razer-capability-grid`. Every row is optional — omit
a row and the block falls back to the default shown, so a table containing only
the block name renders the section exactly as it appears on the source site.

| Key | Meaning | Default |
|---|---|---|
| `eyebrow` | Section eyebrow | Engineered advantage |
| `title` | Section heading, supports `<br>` and `<span>` | Every millisecond. |
| `intro` | Section intro paragraph | — |
| `index-label` | Prefix for the auto-generated card index | TECH |
| `card` | `glyph | title | copy | link`, repeatable | HS / 35K / RGB / SYN |

Links accept either an authored anchor or a bare URL; images accept an authored
`<img>` or a bare path. `razer-capability-grid-da-live.html` is a complete pre-filled table —
paste it into a blank DA.live document to reproduce the section.

## Behavior

- Card indices are generated as `<index-label> · 01`, so reordering cards renumbers them automatically.
- Grid steps 1 → 2 → 4 columns across breakpoints; hover lift is disabled under `prefers-reduced-motion`.
- The block rebuilds its DOM rather than decorating in place: the source styling
  leans on direct-child combinators and `nth-child`, which EDS's default
  `div > div` row structure does not produce.

## Dependencies

- `scripts/razer-chroma.js` — shared row readers and element helpers.
- `styles/razer-design-system.css` — tokens, `.shell`, `.eyebrow` and the
  `.button` family. Loaded on every page from `head.html`, so there is no list
  to register with; `markRazerBlocks` in `scripts/scripts.js` stamps the
  `.rzr-block` marker that scopes the primitives.
