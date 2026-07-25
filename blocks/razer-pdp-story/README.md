# Razer PDP Story

## Overview

`razer-pdp-story` is the cinematic narrative band of the Basilisk V3
Pro 35K product detail page: a full-bleed backdrop render with scroll
parallax and gradient scrim, the "apex of immersion" display heading,
a count-up stat rail (35,000 DPI · 140 hours · 11 buttons · 90M
clicks), and four feature cards with animated visuals — HyperScroll
notch ring, sensor crosshair pulse, wireless radar, and a Chroma
spectrum ring — plus a pointer-tracked spotlight. All content is baked
in, so a table containing only the block name renders the complete
experience.

## DA.live Authoring Model

7 columns, typed rows. Column 1 is the row type.

| Row | Columns 2–7 |
| --- | --- |
| `setting` | key, value |
| `stat` | key, value (numeric), suffix, label |
| `feature` | key, index-label, glyph, title, body, variant |

Setting keys: `content-mode` (`merge`/`replace`), `kicker`, `heading`,
`body`, `backdrop` (image/path), `backdrop-alt`, `stats-label`.

Feature variants drive the card visual: `wheel`, `sensor`, `wireless`,
`chroma`. Rules (shared with the razer-mice family): keys are stable
and zero-padded; an empty label/title removes a preset entry;
`__empty__` clears a value; an empty cell keeps it.

## Behavior

- Stats count up from zero when 60% visible (single run, ~1.1s eased);
  `prefers-reduced-motion` or a missing IntersectionObserver renders
  final values immediately.
- The backdrop parallaxes on scroll (fine pointers only, rAF-throttled)
  and card visuals only animate while `.is-inview`.
- Feature cards track the pointer via `--mx`/`--my` for the spotlight
  and lift with a green border glow on hover.
- Scroll reveals stagger via `--reveal-i`; all motion collapses under
  `prefers-reduced-motion: reduce`.
- Breakpoints at 680/980/1260px (source parity; documented deviation
  from the repo ladder), with the four-up card grid at 1101px.

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
