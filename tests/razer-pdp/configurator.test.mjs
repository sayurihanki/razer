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

test('deltas stack across finish, model, and care', () => {
  const base = Number.parseFloat(DEFAULT_SETTINGS['base-price']);
  const total = computeTotal(base, [
    byKey(DEFAULT_FINISHES, 'finish-03'), // Phantom Green +10
    byKey(DEFAULT_MODELS, 'model-01'), // + Mouse Dock Pro +40
    byKey(DEFAULT_CARES, 'care-01'), // RazerCare Elite +29.99
  ]);
  assert.equal(Math.round(total * 100), 23998);
  assert.equal(formatPrice('US$', total), 'US$239.98');
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
