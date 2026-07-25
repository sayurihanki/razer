# Razer Site Footer

## Overview

`razer-site-footer` reproduces the `.site-footer` from the Razer
gaming-mice demo page: newsletter signup strip, brand column with logo,
tagline, and round social links, four link columns (Shop / Explore /
Support / Company), and the legal row with copyright, legal links, and
locale. All content is baked in, so a table containing only the block
name renders the exact source footer.

## DA.live Authoring Model

6 columns, typed rows. Column 1 is the row type.

| Row | Columns 2–6 |
| --- | --- |
| `setting` | key, value |
| `social` | key, label, aria-label, href |
| `column` | key, heading |
| `column-link` | column-key, key, label, href |
| `legal-link` | key, label, href |

Setting keys: `content-mode`, `logo`, `logo-alt`, `tagline` (newline =
line break), `social-aria-label`, `newsletter-eyebrow`,
`newsletter-heading`, `newsletter-body`, `newsletter-label`,
`newsletter-placeholder`, `newsletter-cta`, `newsletter-success`,
`newsletter-error`, `copyright`, `locale`.

Keys are stable and zero-padded; authored rows override preset fields by
key, new keys append; `__empty__` clears a value; clearing a label or
heading removes the entry. Clearing `newsletter-heading` removes the
whole newsletter strip.

Copy-paste artifacts:
[razer-site-footer-da-live.html](./razer-site-footer-da-live.html) and
[razer-site-footer-table.txt](./razer-site-footer-table.txt).

## Behavior

- The newsletter form validates client-side only (parity with the source
  demo): a valid email shows the success message, anything else the
  error message, announced via an `aria-live` region. Nothing is sent.
- The block paints a full-height dark box-shadow below itself so short
  pages never show the host page background under the footer.
- Breakpoints at 680/980px (source parity): 5 → 3 → 2 column grid, the
  brand block spans rows/columns as in the source.

## Registration

Referenced from `models/_component-definition.json`; run `npm run build:json`
after model changes.

## Files

- [razer-site-footer.js](./razer-site-footer.js)
- [razer-site-footer.css](./razer-site-footer.css) — carries the shared
  `rzrm` token preamble guarded by `tests/razer-mice/tokens.test.mjs`
- [_razer-site-footer.json](./_razer-site-footer.json)
