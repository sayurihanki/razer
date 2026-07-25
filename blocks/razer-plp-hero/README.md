# Razer PLP Hero

## Overview

`razer-plp-hero` reproduces the `.plp-hero` section from the Razer
gaming-mice demo page: centered green display heading, supporting copy, and
a full-width muted looping video with a pause/play control. Content is baked
in, so a table containing only the block name renders the exact source hero.

## DA.live Authoring Model

3 columns, `setting` rows only.

| Key | Default | Notes |
| --- | --- | --- |
| `heading` | `Gaming Mice` | |
| `heading-id` | `gaming-mice-title` | Also used for `aria-labelledby` |
| `body` | source copy | |
| `video` | `/images/razer-mice/mice-hero.mp4` | Path or pasted link |
| `video-label` | source label | `aria-label` on the `<video>` |
| `pause-label` / `play-label` | source labels | Control button labels |
| `content-mode` | `merge` | `replace` starts from empty |

`__empty__` clears a preset value (e.g. `setting | video | __empty__`
renders the hero without media).

Copy-paste artifacts: [razer-plp-hero-da-live.html](./razer-plp-hero-da-live.html)
or [razer-plp-hero-table.txt](./razer-plp-hero-table.txt).

## Behavior

- Video: `muted loop autoplay playsinline preload="metadata"`; the box is
  reserved via `aspect-ratio: 1920/700` (`4/3` at ≤680px) so there is no
  layout shift and no poster flash.
- Pause control: `aria-pressed`, swaps label and glyph (`Ⅱ`/`▶`).
- `prefers-reduced-motion: reduce`: CSS hides the video and control and
  shows the source's radial-gradient backdrop; JS also pauses the video and
  strips `autoplay`, and listens for the preference changing mid-session.
- Breakpoint at `680px` (source parity).

## Registration

Referenced from `models/_component-definition.json`; run `npm run build:json`
after model changes.

## Files

- [razer-plp-hero.js](./razer-plp-hero.js)
- [razer-plp-hero.css](./razer-plp-hero.css) — carries the shared `rzrm`
  token preamble guarded by `tests/razer-mice/tokens.test.mjs`
- [_razer-plp-hero.json](./_razer-plp-hero.json)
