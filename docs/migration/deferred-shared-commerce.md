# Deferred shared-commerce changes

Migration wave: "Port shared commerce behavior in isolated waves" (plan Step 11).

## Outcome

**No source change was ported into razer's shared commerce blocks, and none was
force-fitted.** This is a deliberate result, not skipped work. The reasoning and
the evidence are below so the decision can be re-litigated with data rather than
re-derived.

## Why

Three measurements drove it.

**1. Nothing imported depends on them.** Every cross-block dependency among the
53 imported blocks resolves to either `fragment` (razer's, where this migration
added `mountFragment`) or to another imported block:

| Imported block | depends on |
|---|---|
| `customer-segment-personalization-block` | `fragment` |
| `quiz-router`, `quiz-router-mccs` | `fragment` |
| `live-block-premium`, `vip-member-block-real-v2` | `live-block` (imported) |
| `product-configurator-luxe` | `product-teaser` (imported) |
| `razer-minipage-block2` | `razer-minipage` (imported) |

Not one imported block reaches into `product-details`, `product-list-page`,
`commerce-cart`, `commerce-checkout`, the account blocks, or the B2B blocks. The
governing rule — port only what imported features require — therefore requires
nothing here.

**2. razer's implementations are the newer ones.** The source is
`aem-boilerplate-commerce` 4.0.1 on `@dropins/*` v3; razer is 5.0.0 on v4, with
`account`, `auth`, `order` and `recommendations` a full major version ahead.
Where the two diverge most, razer is the richer side:

- `product-details.js` — 351 razer-only lines against 220 source-only
- `product-recommendations.js` — 80 razer-only against 27 source-only, on a
  package that went 3.x -> 4.0.4
- `product-details/requisition-list.js` — 73 razer-only against 15 source-only

Porting v3-era logic onto these would be a downgrade wearing the shape of a
merge, which the migration rules explicitly forbid.

**3. Most of the source delta is its brand, not its behavior.** Of 3651
source-only lines across the 39 files, the largest contributions are CSS:
`header.css` (654), `accordion.css` (312),
`commerce-company-roles-permissions.css` (151),
`commerce-company-users.css` (136),
`commerce-b2b-requisition-list-view.css` (134),
`commerce-company-credit.css` (124). These are the glassmorphic restyling of
razer's B2B and account surfaces. Installing them would restyle live B2B
features and fail visual isolation (acceptance test 11).

## What would change the answer

Port from this list when — and only when — one of these becomes true:

- an imported block is wired to a shared commerce block and needs behavior razer
  lacks;
- a specific source behavior is requested on its own merits, in which case it
  should be reimplemented against razer's v4 APIs rather than copied; or
- razer adopts the source's visual language deliberately, as a design decision
  with its own visual-regression pass — not as a side effect of migration.

## Full inventory

39 shared-different files under `blocks/`, 1118 razer-only lines, 3651
source-only lines.

| File | razer-only lines | source-only lines |
|---|---:|---:|
| `blocks/header/header.css` | 186 | 654 |
| `blocks/product-details/product-details.js` | 351 | 220 |
| `blocks/header/header.js` | 37 | 397 |
| `blocks/accordion/accordion.css` | 61 | 312 |
| `blocks/targeted-block/targeted-block.js` | 25 | 238 |
| `blocks/product-list-page/product-list-page.js` | 51 | 192 |
| `blocks/accordion/accordion.js` | 15 | 147 |
| `blocks/commerce-company-roles-permissions/commerce-company-roles-permissions.css` | 3 | 151 |
| `blocks/product-details/product-details.css` | 18 | 131 |
| `blocks/commerce-company-users/commerce-company-users.css` | 1 | 136 |
| `blocks/commerce-b2b-requisition-list-view/commerce-b2b-requisition-list-view.css` | 1 | 134 |
| `blocks/commerce-company-credit/commerce-company-credit.css` | 1 | 124 |
| `blocks/commerce-company-credit/commerce-company-credit.js` | 15 | 108 |
| `blocks/product-recommendations/product-recommendations.js` | 80 | 27 |
| `blocks/commerce-b2b-requisition-list/commerce-b2b-requisition-list.css` | 1 | 101 |
| `blocks/commerce-company-profile/commerce-company-profile.css` | 1 | 101 |
| `blocks/product-details/requisition-list.js` | 73 | 15 |
| `blocks/commerce-account-sidebar/commerce-account-sidebar.css` | 11 | 54 |
| `blocks/product-list-page/README.md` | 64 | 0 |
| `blocks/commerce-company-structure/commerce-company-structure.css` | 5 | 56 |
| `blocks/product-details/_product-details.json` | 19 | 41 |
| `blocks/fragment/fragment.js` | 2 | 48 |
| `blocks/commerce-addresses/commerce-addresses.css` | 1 | 48 |
| `blocks/commerce-account-nav/commerce-account-nav.js` | 4 | 41 |
| `blocks/commerce-b2b-requisition-list-view/commerce-b2b-requisition-list-view.js` | 37 | 8 |
| `blocks/commerce-orders-list/commerce-orders-list.css` | 1 | 34 |
| `blocks/commerce-b2b-negotiable-quote/commerce-b2b-negotiable-quote.js` | 10 | 24 |
| `blocks/footer/footer.css` | 1 | 22 |
| `blocks/commerce-customer-information/commerce-customer-information.css` | 1 | 21 |
| `blocks/header/README.md` | 10 | 9 |
| `blocks/fragment/fragment.css` | 1 | 17 |
| `blocks/targeted-block/targeted-block.css` | 1 | 16 |
| `blocks/product-details/README.md` | 6 | 10 |
| `blocks/enrichment/enrichment.js` | 10 | 4 |
| `blocks/product-recommendations/README.md` | 7 | 5 |
| `blocks/commerce-b2b-requisition-list/commerce-b2b-requisition-list.js` | 3 | 3 |
| `blocks/commerce-cart/commerce-cart.js` | 1 | 2 |
| `blocks/commerce-checkout/containers.js` | 3 | 0 |
| `blocks/commerce-account-nav/commerce-account-nav.css` | 0 | 0 |

Total: 39 files, 1118 razer-only lines, 3651 source-only lines.
