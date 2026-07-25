# Additive Safe Migration — `jenhankib2bbodea` → `razer`

Branch: `codex/migrate-jenhankib2bbodea-into-razer`

This directory holds the inventory, checksum, and validation artifacts for the migration.
It is generated evidence, not policy. Source-repo migration documents that predate this
work are quarantined under `jenhankib2bbodea-source-reference/` and describe the *source*
repository's own history — they are **not** current razer migration policy.

## Artifacts

| File | What it is |
|---|---|
| `migration-manifest.json` | Machine-readable classification of all 4704 paths, with source and target blob hashes |
| `preserved-paths.sha256` | SHA-256 baseline for the 349 paths that must not change |
| `source-stylelint-baseline.json` | Source Stylelint run under the shared config, recorded before import |
| `jenhankib2bbodea-source-reference/` | Relocated obsolete source-repo migration docs |

## Pinned revisions (Step 1)

| | Repo | Revision | Notes |
|---|---|---|---|
| Source | `sayurihanki/jenhankib2bbodea` | `834527d4db938f5cc9eefb3522207eaa60d5c688` | Local `main`, **1 commit ahead of `origin/main` (`2333e34`)**. The extra commit adds `razer-minipage-block4` (+18 files). Selected deliberately; see "Source revision" below. |
| Target | `sayurihanki/razer` | `67de5e9fbe5f3ab58c136b233add501d82c48f23` | Local `main` == `origin/main`, clean tree |

### Source revision

The migration plan pinned `2333e34` (`origin/main`). The local clone carries one
**unpushed** commit adding a 53rd block, `razer-minipage-block4`. That block was
included at the user's direction. It is well-isolated — it ships its own
Rajdhani/Titillium Web `.woff2` files inside the block directory rather than
requesting Google Fonts, so it satisfies the "no global font leakage" rule by
construction.

Consequence for acceptance criteria: the plan's "52 source-only blocks / 50 metadata
files" becomes **53 blocks / 51 metadata files**.

## Baseline (Step 1, re-verified — not inherited from the plan)

Every figure in the plan's baseline table reproduced exactly against `origin/main`.
Figures below are against the *selected* source revision (`834527d`), which adds 18 files.

| Metric | Value |
|---|---:|
| Source tracked files | 4364 (4346 at `2333e34`) |
| Target tracked files | 3338 |
| Shared paths | 2998 |
| — identical | 2516 |
| — different | 482 |
| Source-only paths | 1366 (1348 at `2333e34`) |
| Target-only paths | 340 |
| Source-only block dirs | 53 (52 at `2333e34`) |
| Target-only block dirs | 6 (all B2B — preserve) |

### What the raw numbers overstate

Raw path counts conflate generated output with authored code. After classification:

| Disposition | Count | Meaning |
|---|---:|---|
| `no-op` | 2516 | Byte-identical; nothing to do |
| `regenerate` | 1191 | Generated output (dropins, portability package, component JSON) — never copied |
| `import` | **552** | Authored source-only files actually copied |
| `preserve` | 345 | Target-only + razer identity; must not change |
| `port-semantically` | **94** | Shared-different authored files needing real review |
| `relocate` | 4 | Obsolete source migration docs |
| `exclude` | 2 | Deferred with reason |

The two figures that matter: **552 files to import** and **94 files to port by hand** —
not 1366 and 482. Of the plan's 482 shared-different files, 388 are generated dropin
output that regeneration handles.

The 94 break down as: 27 Cypress, 11 `scripts/`, 10 root config, 39 across 22 `blocks/`
dirs, 4 `models/`, 3 `styles/`.

## Runtime gap — narrower than "v3 → v4"

The plan frames the gap as a uniform major-version jump. Measured, only **four** drop-ins
are true major bumps:

| Major (real adaptation risk) | Minor (mechanical) | Target-only |
|---|---|---|
| `account` `~3.0.0` → `^4.0.0` | `cart` `3.0`→`^3.3`, `checkout` `3.0.1`→`^3.3`, `pdp` `3.0`→`^3.2`, `personalization`, `product-discovery`, `payment-services`, `wishlist`, `company-management` `1.0`→`^1.3`, `requisition-list` `1.0`→`^1.4`, `purchase-order`, `quote-management` | `quick-order` `^1.1.0` |
| `auth` `~3.0.0` → `^4.0.0` | | |
| `order` `~3.0.0` → `^4.0.0` | | |
| `recommendations` `~3.0.0` → `^4.0.4` | | |

Adaptation effort concentrates on blocks touching **account / auth / order /
recommendations**. `commerce-account-hub` is the highest-risk single import (it touches
three of the four). Presentation-only blocks carry effectively zero version risk.

`@dropins/tools` `~1.6.0` → `^1.9.0` and `@dropins/build-tools` `1.0.1` → `1.2.0`.

## Health gates (Step 1, measured)

| Gate | Result |
|---|---|
| razer `npm ci` | **Pass** (exit 0, 914 packages) |
| razer tracked-file drift after `npm ci` + postinstall | **None** — clean tree; committed `scripts/__dropins__` (2851 files) matches the v5 lockfile exactly, and `package-lock.json` is unchanged |
| razer `npm run lint` | **Pass**, clean |
| razer `npm audit` | **37** — 3 low / 14 moderate / 15 high / 5 critical. Direct vulnerable: `@adobe/aem-cli`, `@adobe/magento-storefront-event-collector`. Must not increase. |
| source `npm run test:unit` | **Pass** — 123 tests, 0 failures (across 19 test files; the plan's "19 unit tests" counts files) |
| source Stylelint | **Fail — 49 errors** (see below) |

### Stylelint: the plan's assumption was wrong in both directions

`.stylelintrc.json` is **byte-identical** between the two repos, and razer currently lints
clean. So any CSS imported as-is carries its errors straight into razer and breaks
acceptance test 7.

The plan expected failures in `theme-purple.css`, `rack-finder-pages.css`, and
"glassmorphic helpers". Measured, **those files are clean**. The actual 49 errors:

| File | Errors | Imported? |
|---|---:|---|
| `blocks/vip-member-block/vip-member-block.css` | 38 | Yes |
| `styles/fonts.css` | 4 | **No** — razer keeps its own |
| `blocks/tabs/tabs.css` | 3 | Yes |
| `blocks/commerce-company-profile/commerce-company-profile.css` | 2 | **No** — shared; razer's version is kept and passes |
| `blocks/vip-hero-block/vip-hero-block.css` | 1 | Yes |
| `blocks/search-bar/search-bar.css` | 1 | Yes |

Only **43 errors across 4 imported files** actually threaten razer's lint. Of those, 38
are auto-fixable notation rules (`alpha-value-notation`, `color-function-notation`,
`color-function-alias-notation`, `rule-empty-line-before`). **5 need manual review:**

- `blocks/tabs/tabs.css` — 3 × `property-no-vendor-prefix` (`-webkit-backdrop-filter`)
- `blocks/search-bar/search-bar.css` — 1 × `property-no-vendor-prefix` (`-webkit-backdrop-filter`)
- `blocks/vip-hero-block/vip-hero-block.css` — 1 × `declaration-block-no-redundant-longhand-properties`

The `-webkit-backdrop-filter` prefixes are **intentional Safari support**, not lint debt.
They should be kept and the rule disabled inline per-line rather than "fixed" — removing
them silently degrades the glassmorphic rendering on Safari. This is recorded so the
styling wave does not blanket-`--fix` its way into a visual regression.

## Ported shared-file changes, and what was deliberately not ported

The import surfaced 4 `import/named` failures — imported blocks reaching for exports razer
does not have. These are **shared-file export gaps, not dropin v3/v4 breaks**, so they were
ported semantically onto razer's base rather than by replacing razer's files.

### `scripts/commerce.js` — added `encodeSkuForUrl`, `getSearchContext`

Source `commerce.js` has 8 exports razer lacks. Only the **read-only** subset needed by
imported blocks was ported:

| Ported | Why it is safe |
|---|---|
| `encodeSkuForUrl` | Pure string transform, no state |
| `getStoredCustomerGroupUid` | `sessionStorage` read, try/caught |
| `getSearchViewHistory` | `localStorage` read over `${storeViewCode}:productViewHistory` — **a key razer already writes**, in the same `{date, sku}` shape |
| `getSearchContext` | Composes the two above |

**Deliberately not ported** — the customer-group *writer* chain
(`fetchCustomerGroupUid`, `setCatalogCustomerGroupHeader`,
`refreshCatalogCustomerGroupHeader`, `refreshCatalogServiceEndpoint`, plus the
`CUSTOMER_GROUP_UID_QUERY` GraphQL document). That chain issues network calls, mutates the
`Magento-Customer-Group` fetch header, and rebuilds the Catalog Service endpoint. Importing
it would change request behavior on **every existing razer page**, which the migration
rules forbid.

Consequence, stated plainly: nothing currently writes the customer-group session key, so
`getSearchContext()` always reports the guest group `'MA=='`. `search-bar` therefore runs
**unpersonalized by customer group** — view-history personalization works, group-based
personalization does not. This is a real functional gap, not a silent one; adopting the
writer chain is follow-up work that must be validated against razer's B2B pricing.

razer's own `QUICK_ORDER_PATH` export (used by its target-only `commerce-b2b-quick-order`
block) is untouched.

### `blocks/fragment/fragment.js` — added `mountFragment`

Exported for `quiz-router`. razer's `decorate` still uses its original
`block.replaceChildren(...)` and was **not** rewired to the source's section-hoisting
behavior. The source version is arguably better, but switching it would change fragment
rendering on existing razer pages and put acceptance test 11 (visual isolation) at risk.
Deferred as a standalone improvement.

### Lint fixes applied to imported code

- 27 auto-fixable formatting errors in `vip-member-block.js`.
- 5 fixed by hand: 2 `no-nested-ternary` and 1 `max-len` in
  `uniform-configurator.commerce.js`, 2 `max-len` in `auth-diagnostics.js`. Rewritten for
  readability, not suppressed. (These fail in the source repo too.)
- 38 auto-fixable CSS notation errors.
- 4 `-webkit-backdrop-filter` declarations in `tabs.css` and `search-bar.css` carry a
  scoped `stylelint-disable-next-line`. Stylelint reports them as "fixable", but its fix is
  to **delete** them, which silently breaks glassmorphic rendering on Safari. A per-line
  disable was chosen over relaxing razer's shared `.stylelintrc.json`, so the exception
  stays with the code that needs it instead of becoming repo-wide policy.

## Notes for later waves

- **The pre-commit hook runs `build:json`.** Any commit touching `blocks/` regenerates
  `component-definition.json`, `component-models.json`, and `component-filters.json`. They
  cannot be byte-pinned; validate them by **ID preservation** instead. Verified after the
  import: `+5 / +87 / +16` entries, **0 lost**. `preserved-paths.sha256` still lists these
  three — treat those three lines as informational, not as a breach.
- `.eslintignore` differs by one line, and in razer's favour: **razer** has `*.min.js`, the
  source does not. Nothing to port.
- `scripts/aem.js` is marked **NEVER MODIFY** in `AGENTS.md`. It is shared-different; any
  source behavior it carries must be reached another way.

## Excluded from import (deferred, with reason)

| Path | Reason |
|---|---|
| `tmp-uniform-configurator-preview.html` | Transient preview scratch file; not a deliverable |
| `test-results/.last-run.json` | Local test-runner state; machine-specific, not portable |

## Rules in force

Recorded here so they survive context loss. Full statement lives in the migration plan.

- Never delete a razer file. No `D` entries in the migration diff.
- razer identity (`config.json`, `fstab.yaml`, `default-site.json`, `head.html`,
  `favicon.ico`) preserved byte-for-byte. Store stays `razer` / `razerstoreview`.
- razer's B2B posture stays **enabled**; the 6 target-only B2B blocks are untouched.
- Never downgrade razer's v5 / dropins-v4 baseline. Adapt imports up.
- Source global brand (Google fonts, glassmorphic tokens, `theme-purple.css`,
  `rack-finder-pages.css`) is opt-in and block-scoped — never in `head.html`, global
  fonts, or the production header.
- Shared files use razer as the base; source behavior is ported semantically, never by
  file replacement.
- A failing wave is reverted alone; prior passing waves stand.
