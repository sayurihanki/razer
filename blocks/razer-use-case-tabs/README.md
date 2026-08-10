# Razer Use Case Tabs Block

## Overview

The "play it your way" section: a tablist of playstyles beside a panel showing that playstyle's eyebrow, headline, copy and tag row, over an animated concentric-orbit motif.

## DA.live Authoring Model

Author with a table whose first cell is `razer-use-case-tabs`. Every row is optional — omit
a row and the block falls back to the default shown, so a table containing only
the block name renders the section exactly as it appears on the source site.

| Key | Meaning | Default |
|---|---|---|
| `eyebrow` | Section eyebrow | One ecosystem · Every style |
| `title` | Section heading | Play it your way. |
| `intro` | Section intro paragraph | — |
| `tab` | `label | eyebrow | title | copy | comma-separated tags`, repeatable | 4 tabs |

Links accept either an authored anchor or a bare URL; images accept an authored
`<img>` or a bare path. `razer-use-case-tabs-da-live.html` is a complete pre-filled table —
paste it into a blank DA.live document to reproduce the section.

## Behavior

- Tags are one comma-separated cell so a tab stays a single table row.
- Roving focus: ArrowLeft/ArrowRight move selection and focus together; only the selected tab is in the tab order.
- The tablist runs horizontally on mobile and vertically from 821px, with the selected indicator moving from the bottom edge to the left edge.
- The block rebuilds its DOM rather than decorating in place: the source styling
  leans on direct-child combinators and `nth-child`, which EDS's default
  `div > div` row structure does not produce.

## Dependencies

- `scripts/razer-chroma.js` — shared row readers and element helpers.
- `styles/razer-design-system.css` — tokens, `.shell`, `.eyebrow` and the
  `.button` family. Loaded on every page from `head.html`, so there is no list
  to register with; `markRazerBlocks` in `scripts/scripts.js` stamps the
  `.rzr-block` marker that scopes the primitives.
