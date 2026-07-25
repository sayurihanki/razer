# Razer Home Hero Block

## Overview

The homepage hero: a full-bleed responsive product image under a gradient atmosphere layer, with an eyebrow, green display headline, supporting line, two CTAs and an animated scroll cue.

## DA.live Authoring Model

Author with a table whose first cell is `razer-home-hero`. Every row is optional — omit
a row and the block falls back to the default shown, so a table containing only
the block name renders the section exactly as it appears on the source site.

| Key | Meaning | Default |
|---|---|---|
| `eyebrow` | Product name above the headline | Razer Seiren V3 Chroma 32-Bit DSP |
| `title` | Display headline | Light up your voice |
| `body` | Supporting line | Clearer sound. Full-color presence. |
| `image` | Desktop image | /images/seiren-hero-desktop.webp |
| `image-mobile` | Image below 768px | /images/seiren-hero-mobile.webp |
| `image-alt` | Alt text for both images | — |
| `cta-ghost` | Text CTA with chevron | Learn more |
| `cta-primary` | Solid green CTA | Buy now |
| `scroll-label` | Scroll cue label | Explore the ecosystem |
| `scroll-target` | Scroll cue anchor | #proof |

Links accept either an authored anchor or a bare URL; images accept an authored
`<img>` or a bare path. `razer-home-hero-da-live.html` is a complete pre-filled table —
paste it into a blank DA.live document to reproduce the section.

## Behavior

- Builds a real `<picture>` with the mobile `<source>`; the `<img>` stays a direct child so the object-fit rules apply.
- The image has a slow breathing animation, suppressed under `prefers-reduced-motion`.
- The scroll cue is hidden below 681px, matching the source.
- The block rebuilds its DOM rather than decorating in place: the source styling
  leans on direct-child combinators and `nth-child`, which EDS's default
  `div > div` row structure does not produce.

## Dependencies

- `scripts/razer-chroma.js` — shared row readers and element helpers.
- `styles/razer-chroma-shared.css` — tokens, `.shell`, `.eyebrow` and the
  `.button` family. Injected automatically by `loadRazerChromaStyles` in
  `scripts/scripts.js` whenever a razer-chroma block is on the page; the block
  name must stay listed in `RAZER_CHROMA_BLOCKS` there.
