# Razer Blade 18 Hero

## Overview

`razer-blade18-hero` is the cinematic opening of the Blade 18 page: an
atmosphere of drifting brand light over a perspective floor, the machine
itself drawn as vector art with a live Chroma keyboard and a running wave
on the panel, and a spec rail along the bottom edge. All content is baked
in, so a table containing only the block name renders the whole hero.

The machine is drawn rather than photographed. `/images/blade-18.webp` —
the only Blade asset this repository ships — is a 355 × 640 card crop and
would be a blurred smear at hero scale. Vector art is crisp at any size,
costs nothing on the LCP path, and can animate the two things the product
is actually sold on. The photograph still appears further down the page,
in [razer-blade18-configure](../razer-blade18-configure/README.md), at
the size it was cut for.

## DA.live Authoring Model

5 columns, typed rows. Column 1 is the row type.

| Row | Columns 2–5 |
| --- | --- |
| `setting` | key, value |
| `chip` | key, label, value |
| `cta` | key, label, href, variant (`primary`/`outline`/`ghost`) |

Setting keys: `content-mode` (`merge`/`replace`), `eyebrow`, `title`,
`tagline`, `body`, `scroll-label`, `scroll-href`, `screen-alt`,
`wordmark`.

Rules (shared with the whole razer-blade18-* family, see
[scripts/razer-authoring.js](../../scripts/razer-authoring.js)): keys are
stable and zero-padded (`chip-01` … `chip-04`); an empty cell keeps the
preset, `__empty__` clears it, and clearing a chip's value or a CTA's
label removes that entry.

## Behavior

- The copy, the machine and the rail fade up in sequence on first view.
- On a fine pointer the machine tilts a couple of degrees toward the
  cursor. Skipped for coarse pointers and reduced motion.
- The keyboard runs one Chroma wave across the deck: each key carries
  `--k`, its place along the deck diagonal, which the stylesheet turns
  into a negative animation delay.
- `screen-alt` is the accessible name of the drawing; it is escaped
  before it reaches the SVG string.

## Accessibility

- The drawing is a single `role="img"` with one label, not a tree of
  decorative shapes.
- Under `prefers-reduced-motion: reduce` every animation stops and the
  keys hold a static brand green rather than going dark.

## Registration

Referenced from `models/_component-definition.json`; run
`npm run build:json` after model changes.

## Files

- [razer-blade18-hero.js](./razer-blade18-hero.js)
- [razer-blade18-hero.css](./razer-blade18-hero.css)
- [_razer-blade18-hero.json](./_razer-blade18-hero.json)
- [razer-blade-18-da-live.html](./razer-blade-18-da-live.html) — the DA
  document for the whole page, all five blocks plus page metadata
