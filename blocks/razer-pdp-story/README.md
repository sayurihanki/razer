# Razer PDP Story

## Overview

`razer-pdp-story` is the feature narrative of the Basilisk V3 Pro 35K
product detail page, modeled on razer.com's image-led PDP
storytelling: a full-bleed backdrop band with the "apex of immersion"
heading, a static stat rail (35,000 DPI · 140 hours · 11 buttons ·
90M clicks), three alternating media sections that put the product
photography front and center (HyperScroll wheel, Chroma RGB,
programmable buttons), and a pair of compact numeral tiles for the
sensor and wireless specs. All content is baked in, so a table
containing only the block name renders the complete experience.

## DA.live Authoring Model

8 columns, typed rows. Column 1 is the row type.

| Row | Columns 2–8 |
| --- | --- |
| `setting` | key, value |
| `stat` | key, value (numeric), suffix, label |
| `feature` | key, index-label, numeral, title, body, image |

Setting keys: `content-mode` (`merge`/`replace`), `kicker`, `heading`,
`body`, `backdrop` (image/path), `backdrop-alt`, `stats-label`.

A feature row with an image renders as an alternating media section; a
feature without an image renders as a numeral tile (the `numeral`
column, e.g. `35K` or `140H`, is the tile's display figure). Author
image cells as pictures to control alt text; plain paths fall back to
the feature title. Rules (shared with the razer-mice family): keys are
stable and zero-padded; an empty title removes a preset entry;
`__empty__` clears a value; an empty cell keeps it.

## Behavior

- Motion is limited to one fade-up per section
  (`prefers-reduced-motion` disables it); stats render their final
  values with no count-up, and the backdrop is static.
- Media sections alternate image/copy sides on desktop (≥981px) via
  `:nth-child(even)` order swap; tiles go two-up at 681px.
- Breakpoints at 680/980/1260px (source parity; documented deviation
  from the repo ladder).

## Registration

Referenced from `models/_component-definition.json`; run
`npm run build:json` after model changes.

## Files

- [razer-pdp-story.js](./razer-pdp-story.js)
- [razer-pdp-story.css](./razer-pdp-story.css) — carries the shared
  `rzrm` token preamble guarded by `tests/razer-mice/tokens.test.mjs`
- [_razer-pdp-story.json](./_razer-pdp-story.json)
- Copy-paste artifacts: [razer-pdp-story-da-live.html](./razer-pdp-story-da-live.html)
  and [razer-pdp-story-table.txt](./razer-pdp-story-table.txt)
