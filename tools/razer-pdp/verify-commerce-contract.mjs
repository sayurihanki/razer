/* eslint-disable no-console */

/*
 * Verifies the razer-pdp-hero commerce contract against the live tenant.
 *
 * Two things can silently break the PDP, and neither shows up in unit tests:
 *
 * 1. The Admin renumbers or replaces an option value, so an `optionUid` in the
 *    block presets no longer exists. Add to cart then fails for that choice.
 * 2. The Admin changes a custom-option surcharge. Catalog Service cannot price
 *    custom options at all — `ProductViewOptionValue` exposes only
 *    id/title/inStock — so `price-source: catalog+deltas` displays the authored
 *    `delta` values on trust. If they drift from the Admin, the PDP quotes a
 *    price the cart will not honour.
 *
 * Check 1 is a pure read. Check 2 cannot be done by reading: the only place the
 * surcharges are observable is a real cart, so it creates throwaway guest carts
 * and compares the line price against `variant price + delta`. That mutates the
 * tenant (guest carts, which expire), so it is opt-in via --with-cart and is
 * never part of `npm test`.
 *
 *   node tools/razer-pdp/verify-commerce-contract.mjs
 *   node tools/razer-pdp/verify-commerce-contract.mjs --with-cart
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DEFAULT_CARES,
  DEFAULT_FINISHES,
  DEFAULT_MODELS,
  DEFAULT_SETTINGS,
} from '../../blocks/razer-pdp-hero/razer-pdp-hero.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = resolve(__dirname, '..', '..');
const withCart = process.argv.includes('--with-cart');

const PRODUCT_QUERY = `
  query RazerPdpContract($sku: String!, $skus: [String!]!) {
    products(skus: $skus) {
      __typename sku inStock addToCartAllowed
      ... on ComplexProductView {
        options { id title values { id title } }
      }
    }
    variants(sku: $sku) {
      variants {
        selections
        product {
          sku inStock
          ... on SimpleProductView { price { final { amount { value } } } }
        }
      }
    }
  }
`;

const failures = [];
const notes = [];

async function loadConfig() {
  const raw = await readFile(resolve(repoRoot, 'config.json'), 'utf8');
  const config = JSON.parse(raw).public.default;
  return {
    endpoint: config['commerce-endpoint'],
    headers: { ...config.headers.all, ...config.headers.cs },
  };
}

async function graphql({ endpoint, headers }, query, variables) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join('; '));
  }
  return payload.data;
}

function checkOptionUids(product) {
  const known = new Set(
    (product.options || []).flatMap((option) => (option.values || []).map((v) => v.id)),
  );
  const groups = [
    ['finish', DEFAULT_FINISHES],
    ['model', DEFAULT_MODELS],
    ['care', DEFAULT_CARES],
  ];
  groups.forEach(([group, entries]) => {
    entries.forEach((entry) => {
      if (!entry.optionUid) {
        failures.push(`${group} "${entry.key}" has no optionUid`);
      } else if (!known.has(entry.optionUid)) {
        failures.push(
          `${group} "${entry.key}" (${entry.label}) carries optionUid ${entry.optionUid}, `
          + 'which no longer exists on the product',
        );
      }
    });
  });
  console.log(`Option UIDs checked: ${groups.reduce((n, [, e]) => n + e.length, 0)}`);
}

async function addToGuestCart(client, sku, optionsUIDs) {
  const { createGuestCart } = await graphql(
    client,
    'mutation { createGuestCart { cart { id } } }',
    {},
  );
  const cartId = createGuestCart.cart.id;
  const result = await graphql(
    client,
    `mutation Add($cartId: String!, $items: [CartItemInput!]!) {
       addProductsToCart(cartId: $cartId, cartItems: $items) {
         user_errors { code message }
       }
     }`,
    { cartId, items: [{ sku, quantity: 1, selected_options: optionsUIDs }] },
  );
  const userErrors = result.addProductsToCart.user_errors || [];
  const read = await graphql(
    client,
    `query Cart($id: String!) {
       cart(cart_id: $id) { itemsV2(pageSize: 2) { items { prices { price { value } } } } }
     }`,
    { id: cartId },
  );
  const items = read.cart?.itemsV2?.items || [];
  return { userErrors, unit: items[0]?.prices?.price?.value ?? null };
}

/*
 * Catalog Service reporting a variant as inStock is not the same as the cart
 * accepting it — a child product that is disabled or not assigned to the
 * website still indexes, and the cart then answers REQUIRED_PARAMETER_MISSING
 * because it cannot resolve the selection. Only a real add proves a colour is
 * buyable, and this is the check that stops a broken finish reaching a shopper.
 */
async function checkFinishes(client, product) {
  const neutralModel = DEFAULT_MODELS.find((m) => m.delta === 0) || DEFAULT_MODELS[0];
  const neutralCare = DEFAULT_CARES.find((c) => c.delta === 0) || DEFAULT_CARES[0];
  const sellable = [];

  await DEFAULT_FINISHES.reduce(async (previous, finish) => {
    await previous;
    const uids = [finish.optionUid, neutralModel.optionUid, neutralCare.optionUid];
    const { userErrors, unit } = await addToGuestCart(client, product.sku, uids);
    if (userErrors.length || unit === null) {
      const why = userErrors.map((e) => e.message).join('; ') || 'the item did not persist';
      failures.push(`finish "${finish.label}" cannot be bought — ${why}`);
    } else {
      console.log(`  ok  finish "${finish.label}" → ${unit}`);
      sellable.push({ finish, unit });
    }
  }, Promise.resolve());

  return sellable;
}

async function checkPricing(client, product, sellable) {
  if (!sellable.length) {
    failures.push('no finish is buyable, so the option surcharges cannot be verified');
    return;
  }
  const { finish: baseFinish, unit: basePrice } = sellable[0];
  console.log(`\nPricing deltas against "${baseFinish.label}" (${basePrice}):`);

  const combos = [];
  DEFAULT_MODELS.forEach((model) => {
    const noCare = DEFAULT_CARES.find((care) => care.delta === 0) || DEFAULT_CARES[0];
    combos.push({ label: `model "${model.label}"`, entries: [model, noCare] });
  });
  DEFAULT_CARES.forEach((care) => {
    const noModel = DEFAULT_MODELS.find((model) => model.delta === 0) || DEFAULT_MODELS[0];
    combos.push({ label: `care "${care.label}"`, entries: [noModel, care] });
  });

  // Sequential on purpose: each iteration creates a cart on the tenant.
  await combos.reduce(async (previous, combo) => {
    await previous;
    const uids = [baseFinish.optionUid, ...combo.entries.map((entry) => entry.optionUid)];
    const expected = Math.round(
      (basePrice + combo.entries.reduce((sum, entry) => sum + entry.delta, 0)) * 100,
    ) / 100;
    const { userErrors, unit } = await addToGuestCart(client, product.sku, uids);
    if (userErrors.length) {
      failures.push(`${combo.label}: cart rejected it — ${userErrors.map((e) => e.message).join('; ')}`);
    } else if (unit === null) {
      failures.push(`${combo.label}: the item did not persist in the cart`);
    } else if (Math.abs(unit - expected) > 0.005) {
      failures.push(`${combo.label}: cart charges ${unit}, the PDP would show ${expected}`);
    } else {
      console.log(`  ok  ${combo.label} → ${unit}`);
    }
  }, Promise.resolve());
}

async function main() {
  const client = await loadConfig();
  const sku = DEFAULT_SETTINGS.sku;
  console.log(`Endpoint: ${client.endpoint}`);
  console.log(`SKU: ${sku}`);
  console.log(`price-source: ${DEFAULT_SETTINGS['price-source']}\n`);

  const data = await graphql(client, PRODUCT_QUERY, { sku, skus: [sku] });
  const product = (data.products || [])[0];
  if (!product) {
    failures.push(`product "${sku}" is not in the catalog`);
    return;
  }
  if (product.addToCartAllowed !== true) failures.push(`"${sku}" is not addToCartAllowed`);

  checkOptionUids(product);

  const variantsByUid = new Map();
  (data.variants?.variants || []).forEach((variant) => {
    (variant.selections || []).forEach((uid) => variantsByUid.set(uid, {
      sku: variant.product.sku,
      price: variant.product.price?.final?.amount?.value ?? null,
    }));
  });
  DEFAULT_FINISHES.forEach((finish) => {
    if (!variantsByUid.has(finish.optionUid)) {
      failures.push(`finish "${finish.label}" has no catalog variant`);
    }
  });
  console.log(`Variants exposed: ${variantsByUid.size}`);

  if (DEFAULT_SETTINGS['price-source'] === 'catalog+deltas' && !withCart) {
    notes.push(
      'price-source is catalog+deltas, but the option surcharges were NOT verified. '
      + 'Catalog Service cannot price custom options — re-run with --with-cart.',
    );
  }
  if (withCart) {
    console.log('\nBuyability (creates throwaway guest carts):');
    const sellable = await checkFinishes(client, product);
    await checkPricing(client, product, sellable);
  }
}

main()
  .catch((error) => {
    failures.push(error.message);
  })
  .finally(() => {
    notes.forEach((note) => console.log(`\nnote: ${note}`));
    if (failures.length) {
      console.log(`\n${failures.length} problem(s):`);
      failures.forEach((failure) => console.log(`  - ${failure}`));
      process.exitCode = 1;
    } else {
      console.log('\nContract check passed.');
    }
  });
