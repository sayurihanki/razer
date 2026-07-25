# Razer PLP Intro

## Overview

`razer-plp-intro` reproduces the `.plp-intro` section from the Razer
gaming-mice demo page: eyebrow, uppercase heading, supporting copy, and a
ghost "Use the gear finder ›" CTA. It also renders the `#products` anchor
that the `razer-family-rail` block's in-page links scroll to. Content is
baked in, so a table containing only the block name renders the exact
source section.

## DA.live Authoring Model

3 columns, typed rows. Column 1 is the row type.

| Row | Columns 2–3 | Notes |
| --- | --- | --- |
| `setting` | key, value | keys: `anchor-id`, `eyebrow`, `heading`, `body`, `content-mode` (`merge`/`replace`) |
| `cta` | label, href | The ghost CTA; `__empty__` as label removes it |

Copy-paste artifacts: [razer-plp-intro-da-live.html](./razer-plp-intro-da-live.html)
or [razer-plp-intro-table.txt](./razer-plp-intro-table.txt).

## Behavior

- `anchor-id` (default `products`) is the scroll target used by
  `razer-family-rail`; it carries `scroll-margin-top` to clear the fixed
  `razer-site-header`. Repoint both sides together if you rename it.
- Breakpoint at `680px` (source-parity; CTA goes full-width, column stack).

## Registration

Referenced from `models/_component-definition.json`; run `npm run build:json`
after model changes.

## Files

- [razer-plp-intro.js](./razer-plp-intro.js)
- [razer-plp-intro.css](./razer-plp-intro.css) — carries the shared `rzrm`
  token preamble guarded by `tests/razer-mice/tokens.test.mjs`
- [_razer-plp-intro.json](./_razer-plp-intro.json)
