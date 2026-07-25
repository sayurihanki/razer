# Acceptance report

Branch `codex/migrate-jenhankib2bbodea-into-razer`, source `834527d`, target base `67de5e9`.

Every "pass" below was executed and observed. Tests that could not run are marked
**BLOCKED** with the reason — none are reported as passes.

| # | Acceptance test | Result |
|---|---|---|
| 1 | Integrity | **Pass** — 0 mismatches across 346 identity + target-only checksums; 0 file deletions |
| 2 | Inventory | **Pass** — 53/53 imported blocks, 127 block dirs, 90 block `_*.json`, 6/6 B2B blocks intact |
| 3 | Identity | **Pass** — no operational source URL in any active file; DA mount, store codes, B2B flags unchanged |
| 4 | Generated runtime | **Pass** — clean `npm ci` from empty `node_modules`, zero tracked-file drift, no `package-lock` change |
| 5 | Static imports (v3→v4 gate) | **Pass** — 391 relative, 513 dropin specifiers, 477 named dropin imports all resolve |
| 6 | Authoring models | **Pass** — valid JSON, 0 ids lost, 0 duplicates in all three generated files |
| 7 | Lint and tests | **Pass** — `npm run lint` clean, 123/123 unit tests |
| 8 | Package validation | **Pass** — byte-identical across consecutive runs; 127 blocks; reports razer's v5 versions |
| 9 | razer regression smoke | **BLOCKED — no content** |
| 10 | Imported feature smoke | **Partial** — demo pages verified in-browser; block-on-page paths blocked |
| 11 | Visual isolation | **BLOCKED — no content** |
| 12 | Accessibility | **Partial** — static ARIA fix verified; interactive passes blocked |
| 13 | Browser health | **Partial** — see below |
| 14 | Security baseline | **Pass** — `npm audit` identical to baseline (3/14/15/5, total 37); no secrets |
| 15 | Integration (`aem up`) | **Partial** — server boots and serves; Cypress blocked on credentials |

## The blocker: razer has no authored content

Every route returns 404 — locally under `aem up` **and** on the published
`https://main--razer--sayurihanki.aem.live/` and `.aem.page/`. razer is a
three-commit boilerplate clone whose DA mount
(`content.da.live/sayurihanki/razer/`) holds no documents.

Acceptance tests 9, 11 and 12 exercise *authored pages*: the storefront, PDP, cart,
checkout, account, and the full B2B path (company management, purchase orders,
negotiable quotes, requisition lists, quick order, seller-assisted buying). With no
pages, there is nothing to exercise and nothing to capture at 375/768/1440 px.

This is a content/environment gap, not a migration defect, and it is not fixable from
the code side. **The B2B regression path in particular remains unverified at runtime.**
It must be run before this reaches production.

## What was verified at runtime

`aem up` boots and serves the repo. Imported block assets and `styles/bodea-shared.css`
resolve (HTTP 200). Two imported blocks were exercised in a real browser:

- **`razer-minipage-demo.html`** — renders completely (gallery, pricing, variant
  selection, nav). **Zero console errors.** Real evidence that an imported block
  executes correctly against razer's v5/dropins-v4 tree.
- **`uniform-configurator-demo.html`** — the six-step wizard renders with live preview
  and garment selection.

### Console errors, attributed

`uniform-configurator-demo.html` logs two errors:

```
failed to load module for header TypeError: Cannot read properties of null (reading 'firstElementChild')
    at Module.decorate (blocks/header/header.js:182)
failed to load module for footer TypeError: ... (blocks/footer/footer.js:169)
```

**Not migration-induced.** `/nav.plain.html` and `/footer.plain.html` return 404, so
razer's `loadFragment` returns `null` and its boilerplate header/footer dereference it
without a null check. This is pre-existing razer behavior under an empty content mount
and reproduces identically on `main`. The migration's header edits are at lines 351 and
389, unrelated to line 182.

Worth fixing on its own merits — a null guard in `header.js` and `footer.js` would turn
a hard failure into graceful degradation — but that is razer's own bug, outside this
migration's scope.

## Environment-dependent, recorded rather than counted as passes

- **`npm run verify:uniform-contract` — fails.** It queries live Commerce for
  `USMC-OFFICER-BLUES-PACKAGE` and reports `Missing commerce-core-endpoint; ... resolves
  as a SimpleProductView without customizable option metadata`, so all 17 expected
  options are absent. This reflects razer's Commerce catalog, not imported code; the
  demo product's custom options are not configured on razer's instance.
- **`npm run test:integration`** — skips by design unless `RUN_INTEGRATION=1`; Cypress
  specs need Commerce credentials and a running storefront.
- **`.hlxignore` `tests/` rule** — unverifiable locally. The dev server enforces no
  `.hlxignore` rule at all (`package.json` and `AGENTS.md` also serve 200), so the rule
  was written to match the existing `cypress/` convention and takes effect on
  `.aem.live` / `.aem.page`.

## Known gaps

### Still open

1. **B2B runtime regression is unverified** (test 9) — highest-priority follow-up, and
   blocked until razer has authored content.
2. **`search-bar` runs unpersonalized by customer group.** The customer-group *writer*
   chain was deliberately not ported; `getSearchContext()` resolves to the guest group
   `MA==`. Adopting it needs validation against razer's B2B pricing.
3. **22 tokens remain undefined** for some imported blocks — undefined in the source
   repo too, so pre-existing upstream debt. No values were invented.
4. **Two razer blocks** (`carousel`, `commerce-account-nav`) reference undefined tokens
   on `main`. Pre-existing, untouched.

### Closed after the report was first written

- **`accordion.full-details` unstyled table** — now styled with razer's
  `--color-neutral-*` and shape tokens, scoped under `.accordion.full-details` so
  default accordions are unaffected. Verified in-browser at 1280 px (40% label column,
  `table-cell`, 1px separators) and 375 px (stacked, separators between pairs only).
- **`razer-minipage` Google Fonts request** — Rajdhani and Titillium Web are now
  self-hosted in the block. Verified in-browser: zero `googleapis`/`gstatic` requests,
  all seven local woff2 fetched, all seven `@font-face` entries `loaded`. This removed
  the last third-party request any imported block made.
- **`header.js:182` / `footer.js:169` uncaught TypeErrors** — both blocks now guard the
  null fragment and warn instead of throwing. The configurator demo went from four
  uncaught `TypeError`s to **zero console errors**. razer's own pre-existing bug, fixed
  because the empty content mount makes it fire on every page.
