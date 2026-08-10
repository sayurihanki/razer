/**
 * Guards the razer-pdp-hero configurator pricing contract.
 *
 * The configured total drives the animated price in the PDP summary,
 * so it must stay `base-price` + finish + model + care deltas, format
 * with thousands separators and two decimals, and tolerate missing
 * selections. Also pins the baked-in defaults the DA handoff and the
 * PLP card link depend on: the default selection resolves to the
 * US$159.99 mouse-only Black configuration, and every default finish,
 * model, and care key stays stable and priced as authored.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  computeTotal,
  formatPrice,
  DEFAULT_SETTINGS,
  DEFAULT_SELECTION,
  DEFAULT_FINISHES,
  DEFAULT_MODELS,
  DEFAULT_CARES,
  DEFAULT_IMAGES,
} from '../../blocks/razer-pdp-hero/razer-pdp-hero.js';

const byKey = (entries, key) => entries.find((entry) => entry.key === key);

test('the default selection totals the US$159.99 base configuration', () => {
  const base = Number.parseFloat(DEFAULT_SETTINGS['base-price']);
  const selections = [
    byKey(DEFAULT_FINISHES, DEFAULT_SELECTION.finish),
    byKey(DEFAULT_MODELS, DEFAULT_SELECTION.model),
    byKey(DEFAULT_CARES, DEFAULT_SELECTION.care),
  ];
  selections.forEach((entry) => assert.ok(entry, 'default selection keys must resolve'));
  assert.equal(computeTotal(base, selections), 159.99);
  assert.equal(
    formatPrice(DEFAULT_SETTINGS['currency-prefix'], computeTotal(base, selections)),
    'US$159.99',
  );
});

test('deltas stack in the offline fallback total', () => {
  // computeTotal governs the offline render, but the deltas are the same ones
  // live mode adds, so both paths now agree with the cart: 159.99 + 40 + 29.99.
  const base = Number.parseFloat(DEFAULT_SETTINGS['base-price']);
  const total = computeTotal(base, [
    byKey(DEFAULT_FINISHES, 'finish-03'), // Phantom Green, no surcharge
    byKey(DEFAULT_MODELS, 'model-01'), // + Mouse Dock Pro +40
    byKey(DEFAULT_CARES, 'care-01'), // RazerCare Elite +29.99
  ]);
  assert.equal(Math.round(total * 100), 22998);
  assert.equal(formatPrice('US$', total), 'US$229.98');
});

test('finish deltas stay zero because the variants carry no surcharge', () => {
  // Every Basilisk child SKU prices at 159.99. A finish delta here would be
  // double-counted against the variant price in live mode and simply wrong
  // offline. Verified by `npm run verify:razer-pdp-contract -- --with-cart`.
  DEFAULT_FINISHES.forEach((finish) => {
    assert.equal(finish.delta, 0, `${finish.key} must not carry a surcharge`);
  });
});

test('the commerce contract the DA handoff and the catalog both depend on', () => {
  assert.equal(DEFAULT_SETTINGS.sku, 'Razer Basilisk V3 Pro 35K');
  // The Admin carries the model and care surcharges, so the PDP prices them.
  // Drop to `catalog` to show only what Catalog Service can prove.
  assert.equal(DEFAULT_SETTINGS['price-source'], 'catalog+deltas');
  assert.equal(DEFAULT_SETTINGS['add-to-cart-label'], 'Add to Cart');
  // The razer.com anchor survives as the offline fallback.
  assert.ok(DEFAULT_SETTINGS['cta-href'].startsWith('https://www.razer.com/'));
  // These deltas are a contract with the Admin, not decoration.
  assert.equal(byKey(DEFAULT_MODELS, 'model-01').delta, 40);
  assert.equal(byKey(DEFAULT_MODELS, 'model-02').delta, 20);
  assert.equal(byKey(DEFAULT_CARES, 'care-01').delta, 29.99);
});

test('missing selections and bad inputs do not break the total', () => {
  assert.equal(computeTotal(100, [undefined, null, { delta: Number.NaN }]), 100);
  assert.equal(computeTotal(Number.NaN, [{ delta: 5 }]), 5);
  assert.equal(formatPrice('US$', -1), 'US$0.00');
  assert.equal(formatPrice('US$', 1234.5), 'US$1,234.50');
});

test('the baked-in gallery ships four shots with alt text and captions', () => {
  assert.equal(DEFAULT_IMAGES.length, 4);
  DEFAULT_IMAGES.forEach((image) => {
    assert.ok(image.src.startsWith('/images/'), `${image.key} src is repo-hosted`);
    assert.ok(image.alt.length > 0, `${image.key} carries alt text`);
    assert.ok(image.caption.length > 0, `${image.key} carries a caption`);
  });
});
