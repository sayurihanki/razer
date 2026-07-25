# Razer PDP Hero

## Overview

`razer-pdp-hero` is the commerce heart of the Basilisk V3 Pro 35K
product detail page: breadcrumbs, product masthead, a four-shot
gallery with crossfade transitions, animated Chroma ambient glow,
pointer tilt, swipe and keyboard navigation, and the three-step guided
configurator (finish, model, RazerCare) with an animated running
total, a Razer.com hand-off CTA, and the RazerStore services strip.
All content is baked in, so a table containing only the block name
renders the complete experience.

## DA.live Authoring Model

6 columns, typed rows. Column 1 is the row type.

| Row | Columns 2–6 |
| --- | --- |
| `setting` | key, value |
| `crumb` | key, label, href (empty href marks the current page) |
| `image` | key, src, alt, caption |
| `keyspec` | key, text |
| `finish` | key, label, delta, swatch (`black`/`white`/`phantom-green`/`phantom-white`) |
| `model` | key, label, note, delta |
| `care` | key, label, note, delta |
| `service` | key, glyph, title, body |

Setting keys: `content-mode` (`merge`/`replace`), `breadcrumb-label`,
`title`, `subtitle`, `subtitle-link-label`, `subtitle-link-href`,
`gallery-label`, `prev-label`, `next-label`, `thumbs-label`,
`specs-link-label`, `specs-link-href`, `config-eyebrow`,
`config-title`, `config-body`, `finish-legend`, `model-legend`,
`care-legend`, `care-help-label`, `care-help-href`, `summary-label`,
`price-label`, `price-note`, `currency-prefix`, `base-price`,
`cta-label`, `cta-href`, `availability-note`, `services-label`.

Rules (shared with the razer-mice family):

- Keys are stable and zero-padded (`image-01` … `image-04`); authored
  rows override preset fields by key, new keys append.
- An empty label (or src for images / text for keyspecs) removes a
  preset entry; `__empty__` clears a value; an empty cell keeps it.
- `delta` values are numeric surcharges added to `base-price`; the
  configured total is `base-price` + finish + model + care deltas.

## Behavior

- Gallery: crossfade between shots with a sheen sweep, arrow buttons,
  thumbnail rail (`aria-pressed`), `aria-live` caption with `01 / 04`
  counter, ArrowLeft/ArrowRight keys, pointer swipe, and a subtle
  pointer-tilt on fine pointers. Non-active shots are preloaded during
  idle time; the first image is `fetchpriority="high"` for LCP.
- Configurator: single-select button groups sync `aria-pressed` and
  `.is-selected`; the summary (finish + model) and total update live
  in an `aria-live` region. The total tweens between values and the
  stage glow re-tints via `data-finish` on the gallery stage.
- On desktop (≥981px) the configurator is sticky beside the gallery.
- Scroll reveals stagger via `--reveal-i`; every animation (reveals,
  crossfade, tilt, glow rotation, price tween) collapses to instant
  states under `prefers-reduced-motion: reduce`.
- Breakpoints at 680/980/1260px (source parity; documented deviation
  from the repo ladder).

## Registration

Referenced from `models/_component-definition.json`; run
`npm run build:json` after model changes.

## Files

- [razer-pdp-hero.js](./razer-pdp-hero.js)
- [razer-pdp-hero.css](./razer-pdp-hero.css) — carries the shared
  `rzrm` token preamble guarded by `tests/razer-mice/tokens.test.mjs`
- [_razer-pdp-hero.json](./_razer-pdp-hero.json)
- [generate-authoring.mjs](./generate-authoring.mjs) — regenerates the
  copy-paste artifacts for all four razer-pdp blocks straight from the
  block presets so they cannot drift
- Copy-paste artifacts: [razer-pdp-hero-da-live.html](./razer-pdp-hero-da-live.html)
  and [razer-pdp-hero-table.txt](./razer-pdp-hero-table.txt) — the
  full-page handoff lives at
  [/razer-basilisk-pdp-da-live.html](../../razer-basilisk-pdp-da-live.html)
