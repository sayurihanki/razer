# Razer PDP Specs

## Overview

`razer-pdp-specs` is the technical specifications section of the
Basilisk V3 Pro 35K product detail page: the section heading, the
Synapse platform card with its connectivity tag row and support link,
and the ten-row definition table. The section anchors at `#tech-specs`
for the gallery's "View all specifications" link. All content is baked in, so a table
containing only the block name renders the complete section.

## DA.live Authoring Model

4 columns, typed rows. Column 1 is the row type.

| Row | Columns 2–4 |
| --- | --- |
| `setting` | key, value |
| `tag` | key, label |
| `spec` | key, label, value |

Setting keys: `content-mode` (`merge`/`replace`), `anchor-id`,
`eyebrow`, `heading`, `body`, `platform-eyebrow`, `platform-title`,
`platform-body`, `support-label`, `support-href`.

Rules (shared with the razer-mice family): keys are stable and
zero-padded (`spec-01` … `spec-10`); an empty label removes a preset
entry; `__empty__` clears a value; an empty cell keeps it.

## Behavior

- Motion is limited to one fade-up per section; rows highlight with a
  subtle background change on hover. The platform card is sticky
  beside the table on desktop (≥981px).
- `scroll-margin-top` keeps the anchor clear of the fixed site header.
- All motion collapses under `prefers-reduced-motion: reduce`.
- Breakpoints at 680/980/1260px (source parity; documented deviation
  from the repo ladder).

## Registration

Referenced from `models/_component-definition.json`; run
`npm run build:json` after model changes.

## Files

- [razer-pdp-specs.js](./razer-pdp-specs.js)
- [razer-pdp-specs.css](./razer-pdp-specs.css) — carries the shared
  `rzrm` token preamble guarded by `tests/razer-mice/tokens.test.mjs`
- [_razer-pdp-specs.json](./_razer-pdp-specs.json)
- Copy-paste artifacts: [razer-pdp-specs-da-live.html](./razer-pdp-specs-da-live.html)
  and [razer-pdp-specs-table.txt](./razer-pdp-specs-table.txt)
