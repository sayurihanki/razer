# Razer Final CTA Block

## Overview

The closing call-to-action band: a centred eyebrow, display heading, supporting line and two CTAs, over a black full-bleed section with a green radial glow bleeding in from above.

## DA.live Authoring Model

Author with a table whose first cell is `razer-final-cta`. Every row is optional — omit
a row and the block falls back to the default shown, so a table containing only
the block name renders the section exactly as it appears on the source site.

| Key | Meaning | Default |
|---|---|---|
| `eyebrow` | Short upper label | Your next setup starts here |
| `title` | Display heading, supports `<br>` | Build your unfair advantage. |
| `body` | Supporting line | Enter the ecosystem. Tune it to your play. |
| `cta-primary` | Solid green button | Shop the latest |
| `cta-ghost` | Text button with chevron | Find your gear |

Links accept either an authored anchor or a bare URL; images accept an authored
`<img>` or a bare path. `razer-final-cta-da-live.html` is a complete pre-filled table —
paste it into a blank DA.live document to reproduce the section.

## Behavior

- `.final-glow` is decorative and `aria-hidden`.
- Full-bleed so the glow and black background are not clipped by EDS's 1200px wrapper.
- The block rebuilds its DOM rather than decorating in place: the source styling
  leans on direct-child combinators and `nth-child`, which EDS's default
  `div > div` row structure does not produce.

## Dependencies

- `scripts/razer-chroma.js` — shared row readers and element helpers.
- `styles/razer-design-system.css` — tokens, `.shell`, `.eyebrow` and the
  `.button` family. Loaded on every page from `head.html`, so there is no list
  to register with; `markRazerBlocks` in `scripts/scripts.js` stamps the
  `.rzr-block` marker that scopes the primitives.
