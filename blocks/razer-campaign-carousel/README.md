# Razer Campaign Carousel Block

## Overview

The full-bleed featured-product carousel: a rotating background image with per-slide eyebrow, headline, copy and two CTAs, plus a numbered dot tablist and prev/pause/next arrows.

## DA.live Authoring Model

Author with a table whose first cell is `razer-campaign-carousel`. Every row is optional — omit
a row and the block falls back to the default shown, so a table containing only
the block name renders the section exactly as it appears on the source site.

| Key | Meaning | Default |
|---|---|---|
| `label` | Accessible label for the carousel | Featured Razer products |
| `slide` | `eyebrow | title | copy | learn link | buy link | image`, repeatable | 3 slides |

Links accept either an authored anchor or a bare URL; images accept an authored
`<img>` or a bare path. `razer-campaign-carousel-da-live.html` is a complete pre-filled table —
paste it into a blank DA.live document to reproduce the section.

## Behavior

- Slides auto-advance every 6.5s. Autoplay never starts under `prefers-reduced-motion`.
- Any manual interaction (dot, arrow) stops autoplay permanently, matching the source — once a visitor takes control the carousel does not move under them again. The pause button toggles it back on.
- Dots are a roving-focus tablist: ArrowLeft/ArrowRight move selection and focus together.
- `aria-live` on the content region is `off` while rotating and `polite` once the visitor is driving.
- The block rebuilds its DOM rather than decorating in place: the source styling
  leans on direct-child combinators and `nth-child`, which EDS's default
  `div > div` row structure does not produce.

## Dependencies

- `scripts/razer-chroma.js` — shared row readers and element helpers.
- `styles/razer-design-system.css` — tokens, `.shell`, `.eyebrow` and the
  `.button` family. Loaded on every page from `head.html`, so there is no list
  to register with; `markRazerBlocks` in `scripts/scripts.js` stamps the
  `.rzr-block` marker that scopes the primitives.
