/**
 * Guards the razer-pdp-hero commerce contract.
 *
 * The PDP is transactable only because every authored finish, model and care
 * entry carries the Adobe Commerce option-value UID that `selected_options`
 * requires. Those UIDs encode `configurable/<attribute>/<value>` and
 * `custom-option/<option>/<value>`, so an Admin renumbering the options breaks
 * add to cart silently — these tests are what catch that before production
 * does.
 *
 * The fixtures mirror the live catalog response for
 * `Razer Basilisk V3 Pro 35K`, including the three places where the authored
 * label and the catalog title genuinely disagree.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildCartItem,
  clampQuantity,
  indexVariants,
  mapCatalogToEntries,
  normalizeTitle,
  readCartLinePrice,
  resolveEntryUid,
  resolveLivePrice,
} from '../../blocks/razer-pdp-hero/razer-pdp-hero.commerce.js';
import {
  DEFAULT_CARES,
  DEFAULT_FINISHES,
  DEFAULT_MODELS,
} from '../../blocks/razer-pdp-hero/razer-pdp-hero.js';

const PARENT_SKU = 'Razer Basilisk V3 Pro 35K';

const COLOUR_VALUES = [
  { id: 'Y29uZmlndXJhYmxlLzE5OS85Mw==', title: 'Black', inStock: true },
  { id: 'Y29uZmlndXJhYmxlLzE5OS85NA==', title: 'White', inStock: true },
  { id: 'Y29uZmlndXJhYmxlLzE5OS85NQ==', title: 'Phantom Green Edition', inStock: true },
  { id: 'Y29uZmlndXJhYmxlLzE5OS85Ng==', title: 'Phantom White Edition', inStock: true },
];

// Custom options report inStock: null — the catalog has no stock concept for them.
const MODEL_VALUES = [
  {
    id: 'Y3VzdG9tLW9wdGlvbi8yNy8xOTg=',
    title: 'Basilisk V3 Pro 35K + Mouse Dock Pro',
    inStock: null,
  },
  {
    id: 'Y3VzdG9tLW9wdGlvbi8yNy8xOTk=',
    title: 'Razer Basilisk V3 Pro 35K - Razer Wireless Charging Puck',
    inStock: null,
  },
  {
    id: 'Y3VzdG9tLW9wdGlvbi8yNy8yMDA=',
    title: 'Standard Razer Basilisk V3 Pro 35K',
    inStock: null,
  },
];

const CARE_VALUES = [
  { id: 'Y3VzdG9tLW9wdGlvbi8yOC8yMDE=', title: 'RazerCare Elite for Mice', inStock: null },
  { id: 'Y3VzdG9tLW9wdGlvbi8yOC8yMDI=', title: 'No, Thank You', inStock: null },
];

const PRODUCT = {
  __typename: 'ComplexProductView',
  sku: PARENT_SKU,
  inStock: true,
  addToCartAllowed: true,
  options: [
    { id: 'color_design', title: 'color / design', values: COLOUR_VALUES },
    { id: '27', title: 'Model', required: true, values: MODEL_VALUES },
    { id: '28', title: 'Add RazerCare Protection', required: true, values: CARE_VALUES },
  ],
  priceRange: { minimum: { final: { amount: { value: 159.99, currency: 'USD' } } } },
};

const VARIANTS = {
  variants: COLOUR_VALUES.map((value) => ({
    selections: [value.id],
    product: {
      sku: `${PARENT_SKU}-${value.title}`,
      inStock: true,
      price: { final: { amount: { value: 159.99, currency: 'USD' } } },
    },
  })),
};

const CONTENT = { finishes: DEFAULT_FINISHES, models: DEFAULT_MODELS, cares: DEFAULT_CARES };

const decode = (uid) => Buffer.from(uid, 'base64').toString('utf8');
const mapped = () => mapCatalogToEntries(CONTENT, PRODUCT, indexVariants(VARIANTS));

test('every default entry carries a UID that decodes to a real commerce option', () => {
  DEFAULT_FINISHES.forEach((entry) => {
    assert.match(decode(entry.optionUid), /^configurable\/199\/\d+$/, entry.key);
  });
  DEFAULT_MODELS.forEach((entry) => {
    assert.match(decode(entry.optionUid), /^custom-option\/27\/\d+$/, entry.key);
  });
  DEFAULT_CARES.forEach((entry) => {
    assert.match(decode(entry.optionUid), /^custom-option\/28\/\d+$/, entry.key);
  });
});

test('option UIDs are unique across finishes, models and cares', () => {
  const all = [...DEFAULT_FINISHES, ...DEFAULT_MODELS, ...DEFAULT_CARES].map((e) => e.optionUid);
  assert.equal(new Set(all).size, all.length);
});

test('the authored UID wins over labels the catalog does not match', () => {
  // These three labels genuinely disagree with the catalog titles today, so
  // matching on the label alone would drop them out of the cart payload.
  const mismatches = [
    { entry: DEFAULT_MODELS[2], values: MODEL_VALUES, expected: 'Y3VzdG9tLW9wdGlvbi8yNy8yMDA=' },
    { entry: DEFAULT_MODELS[1], values: MODEL_VALUES, expected: 'Y3VzdG9tLW9wdGlvbi8yNy8xOTk=' },
    { entry: DEFAULT_CARES[1], values: CARE_VALUES, expected: 'Y3VzdG9tLW9wdGlvbi8yOC8yMDI=' },
  ];
  mismatches.forEach(({ entry, values, expected }) => {
    assert.equal(
      values.some((value) => value.title === entry.label),
      false,
      `${entry.key} label unexpectedly matches a catalog title`,
    );
    assert.equal(resolveEntryUid(entry, values), expected, entry.key);
  });
  // Stripping the UID leaves only the label, which is exactly the failure mode.
  const stripped = { ...DEFAULT_MODELS[2], optionUid: '' };
  assert.equal(resolveEntryUid(stripped, MODEL_VALUES), '');
});

test('resolveEntryUid falls back to exact then normalized titles', () => {
  const values = [{ id: 'uid-a', title: 'RazerCare Elite for Mice' }];
  assert.equal(resolveEntryUid({ label: 'RazerCare Elite for Mice' }, values), 'uid-a');
  assert.equal(resolveEntryUid({ label: 'razercare elite for mice' }, values), 'uid-a');
  assert.equal(resolveEntryUid({ label: 'Something else' }, values), '');
  // An unknown UID must not be trusted just because it was authored.
  assert.equal(resolveEntryUid({ optionUid: 'ghost', label: 'Something else' }, values), '');
  assert.equal(normalizeTitle('No, Thank You!'), 'no thank you');
});

test('all nine authored entries reconcile against the live catalog shape', () => {
  const { entries, unmapped } = mapped();
  assert.equal(unmapped.length, 0);
  assert.equal(entries.finish.length, 4);
  assert.equal(entries.model.length, 3);
  assert.equal(entries.care.length, 2);
  // Custom options report inStock: null; only an explicit false blocks a buy.
  assert.ok(entries.model.every((entry) => entry.available));
  assert.equal(entries.finish[0].variantSku, `${PARENT_SKU}-Black`);
});

test('an out-of-stock variant is marked unavailable', () => {
  const outOfStock = {
    variants: [{
      selections: ['Y29uZmlndXJhYmxlLzE5OS85Mw=='],
      product: { sku: `${PARENT_SKU}-Black`, inStock: false },
    }],
  };
  const { entries } = mapCatalogToEntries(CONTENT, PRODUCT, indexVariants(outOfStock));
  assert.equal(entries.finish[0].available, false);
  assert.equal(entries.finish[1].available, true);
});

test('buildCartItem sends the parent sku so the cart item stays configurable', () => {
  const { entries } = mapped();
  const item = buildCartItem({
    parentSku: PARENT_SKU,
    selection: { finish: 'finish-03', model: 'model-01', care: 'care-01' },
    entries,
    quantity: 2,
  });
  // Sending the child sku with parent_sku is accepted but yields a plain
  // SimpleCartItem on a SKU that is not individually visible in Catalog
  // Service, so the mini-cart renders a subtotal with no line items and the
  // option labels are lost. The parent shape is what keeps both.
  assert.deepEqual(item, {
    sku: PARENT_SKU,
    quantity: 2,
    optionsUIDs: [
      'Y29uZmlndXJhYmxlLzE5OS85NQ==',
      'Y3VzdG9tLW9wdGlvbi8yNy8xOTg=',
      'Y3VzdG9tLW9wdGlvbi8yOC8yMDE=',
    ],
  });
  assert.equal('parentSku' in item, false);
});

test('buildCartItem refuses to guess when a group has no commerce match', () => {
  const entries = { finish: [{ key: 'finish-01', optionUid: '' }], model: [], care: [] };
  assert.throws(
    () => buildCartItem({
      parentSku: PARENT_SKU, selection: { finish: 'finish-01' }, entries, quantity: 1,
    }),
    (error) => error.code === 'UNMAPPED_OPTION' && error.group === 'finish',
  );
});

test('catalog+deltas prices the custom options the catalog cannot expose', () => {
  const { entries } = mapped();
  const selection = { finish: 'finish-03', model: 'model-01', care: 'care-01' };
  // 159.99 variant + 40 Mouse Dock Pro + 29.99 RazerCare. Verified against a
  // real cart by `npm run verify:razer-pdp-contract -- --with-cart`, which is
  // the only way to prove it — Catalog Service will not price custom options.
  assert.deepEqual(
    resolveLivePrice(PRODUCT, selection, entries, 'catalog+deltas'),
    { value: 229.98, currency: 'USD' },
  );
});

test('the finish delta is never added on top of the variant price', () => {
  const { entries } = mapped();
  // The child SKU carries any colour surcharge, so adding a finish delta as
  // well would double-count it. Every Basilisk variant is 159.99 today.
  const selection = { finish: 'finish-04', model: 'model-03', care: 'care-02' };
  assert.deepEqual(
    resolveLivePrice(PRODUCT, selection, entries, 'catalog+deltas'),
    { value: 159.99, currency: 'USD' },
  );
});

test('catalog mode shows only what Catalog Service can prove', () => {
  const { entries } = mapped();
  const selection = { finish: 'finish-03', model: 'model-01', care: 'care-01' };
  assert.deepEqual(
    resolveLivePrice(PRODUCT, selection, entries, 'catalog'),
    { value: 159.99, currency: 'USD' },
  );
  // Default is the conservative mode.
  assert.deepEqual(
    resolveLivePrice(PRODUCT, selection, entries),
    { value: 159.99, currency: 'USD' },
  );
});

test('resolveLivePrice falls back to the product price range', () => {
  assert.deepEqual(
    resolveLivePrice(PRODUCT, { finish: 'finish-01' }, { finish: [] }),
    { value: 159.99, currency: 'USD' },
  );
  assert.equal(resolveLivePrice({}, {}, {}), null);
});

test('clampQuantity keeps the quantity a whole number between 1 and 99', () => {
  assert.equal(clampQuantity('0'), 1);
  assert.equal(clampQuantity(''), 1);
  assert.equal(clampQuantity('3.7'), 3);
  assert.equal(clampQuantity('999'), 99);
  assert.equal(clampQuantity('abc'), 1);
  assert.equal(clampQuantity(-5), 1);
  assert.equal(clampQuantity(4), 4);
});

test('readCartLinePrice reports what the cart actually charged', () => {
  const cart = {
    items: [
      { topLevelSku: 'other', price: { value: 10, currency: 'USD' } },
      { topLevelSku: PARENT_SKU, price: { value: 229.98, currency: 'USD' } },
    ],
  };
  assert.deepEqual(readCartLinePrice(cart, PARENT_SKU), { value: 229.98, currency: 'USD' });
  assert.equal(readCartLinePrice({ items: [] }, PARENT_SKU), null);
});
