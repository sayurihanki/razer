# Razer Gear Finder Block

## Overview

The guided-selling section: a numbered how-it-works column beside an interactive three-question quiz that reveals a recommended product.

## DA.live Authoring Model

Author with a table whose first cell is `razer-gear-finder`. Every row is optional — omit
a row and the block falls back to the default shown, so a table containing only
the block name renders the section exactly as it appears on the source site.

| Key | Meaning | Default |
|---|---|---|
| `eyebrow` | Section eyebrow | Guided setup |
| `title` | Section heading | Find your signal. |
| `intro` | Section intro paragraph | — |
| `steps-title` | Heading above the numbered steps | From playstyle to full setup. |
| `step` | `title | copy`, repeatable | 4 steps |
| `question` | `key | question text`, repeatable | playstyle / platform / priority |
| `choice` | `question-key | value | label | detail`, repeatable | 11 choices |
| `match` | `key | family | name | copy | link`, repeatable | 5 outcomes |
| `reveal` | Label for the reveal button | Reveal my match |
| `reset` | Label for the reset button | Reset choices |

Links accept either an authored anchor or a bare URL; images accept an authored
`<img>` or a bare path. `razer-gear-finder-da-live.html` is a complete pre-filled table —
paste it into a blank DA.live document to reproduce the section.

## Behavior

- The reveal button stays disabled until every question is answered; the progress bar tracks completion.
- Match precedence is fixed in code and mirrors the source: `creator|audio → seiren`, `mmo → naga`, `mobile|portable → mobile`, `competitive|lightweight → viper`, otherwise `basilisk`. The `match` rows supply only the copy for each outcome.
- Changing any answer hides a revealed result, so the visitor never sees a recommendation that no longer matches their selections.
- `resolveMatch(answers)` is exported so the precedence can be unit-tested without a DOM.
- The block rebuilds its DOM rather than decorating in place: the source styling
  leans on direct-child combinators and `nth-child`, which EDS's default
  `div > div` row structure does not produce.

## Dependencies

- `scripts/razer-chroma.js` — shared row readers and element helpers.
- `styles/razer-design-system.css` — tokens, `.shell`, `.eyebrow` and the
  `.button` family. Loaded on every page from `head.html`, so there is no list
  to register with; `markRazerBlocks` in `scripts/scripts.js` stamps the
  `.rzr-block` marker that scopes the primitives.
