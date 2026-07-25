# Razer Proof Banner

## Overview

`razer-proof-banner` reproduces the `.mouse-proof` section from the Razer
gaming-mice demo page: the "number one mouse brand" badge, eyebrow, heading,
supporting copy, and an external source link, on a raised dark strip with
hairline borders. Content is baked in, so a table containing only the block
name renders the exact source section.

## DA.live Authoring Model

3 columns, typed rows. Column 1 is the row type.

| Row | Columns 2–3 | Notes |
| --- | --- | --- |
| `setting` | key, value | keys: `badge` (image/upload/path), `badge-alt`, `eyebrow`, `heading`, `body`, `content-mode` (`merge`/`replace`) |
| `link` | label, href | External source link, rendered with the `↗` glyph |

Copy-paste artifacts: [razer-proof-banner-da-live.html](./razer-proof-banner-da-live.html)
or [razer-proof-banner-table.txt](./razer-proof-banner-table.txt).

## Behavior

- Three-column grid (`160px / 1fr / 260px`) → two-column at ≤980px →
  single centered column at ≤680px, matching the source breakpoints
  (documented deviation from the repo's 600/900/1200 ladder).
- The badge image defaults to the vendored
  `/images/razer-mice/mouse-brand-badge.webp`.

## Registration

Referenced from `models/_component-definition.json`; run `npm run build:json`
after model changes.

## Files

- [razer-proof-banner.js](./razer-proof-banner.js)
- [razer-proof-banner.css](./razer-proof-banner.css) — carries the shared
  `rzrm` token preamble guarded by `tests/razer-mice/tokens.test.mjs`
- [_razer-proof-banner.json](./_razer-proof-banner.json)
