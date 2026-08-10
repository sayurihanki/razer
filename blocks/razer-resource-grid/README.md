# Razer Resource Grid Block

## Overview

The buying-guide section: a four-up grid of linked cards, each with an auto-numbered kicker, title, copy and a "read the guide" affordance.

## DA.live Authoring Model

Author with a table whose first cell is `razer-resource-grid`. Every row is optional — omit
a row and the block falls back to the default shown, so a table containing only
the block name renders the section exactly as it appears on the source site.

| Key | Meaning | Default |
|---|---|---|
| `eyebrow` | Section eyebrow | Technical resources |
| `title` | Section heading | Know your gear. |
| `intro` | Section intro paragraph | — |
| `kind` | Kicker suffix after the number | Buying guide |
| `link-label` | Card CTA text | Read the guide |
| `card` | `title | copy | link`, repeatable | 4 guides |

Links accept either an authored anchor or a bare URL; images accept an authored
`<img>` or a bare path. `razer-resource-grid-da-live.html` is a complete pre-filled table —
paste it into a blank DA.live document to reproduce the section.

## Behavior

- Kickers are generated as `01 · <kind>`, so reordering cards renumbers them.
- Each card is a single `<a>` whose direct children the CSS targets, so the DOM is built rather than decorated in place.
- The block rebuilds its DOM rather than decorating in place: the source styling
  leans on direct-child combinators and `nth-child`, which EDS's default
  `div > div` row structure does not produce.

## Dependencies

- `scripts/razer-chroma.js` — shared row readers and element helpers.
- `styles/razer-design-system.css` — tokens, `.shell`, `.eyebrow` and the
  `.button` family. Loaded on every page from `head.html`, so there is no list
  to register with; `markRazerBlocks` in `scripts/scripts.js` stamps the
  `.rzr-block` marker that scopes the primitives.
