/**
 * Unit coverage for the razer-site-header cart-count labels.
 *
 * The cart button's aria-label and the panel heading were frozen strings
 * ("Open cart, 0 items", "Cart (0)") back when the panel was decorative. They
 * are now templates driven by the `cart/data` event, so these tests pin the
 * substitution — including the singular form, which is the case a plain
 * `{count}` replacement gets wrong.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_SETTINGS,
  formatCount,
} from '../../blocks/razer-site-header/razer-site-header.js';

test('formatCount substitutes the live cart quantity', () => {
  assert.equal(formatCount('Cart ({count})', 0), 'Cart (0)');
  assert.equal(formatCount('Cart ({count})', 3), 'Cart (3)');
  assert.equal(formatCount('Open cart, {count} items', 12), 'Open cart, 12 items');
});

test('formatCount prefers the singular template at one item', () => {
  assert.equal(formatCount('Cart ({count})', 1, 'Cart (1)'), 'Cart (1)');
  assert.equal(formatCount('Open cart, {count} items', 1, 'Open cart, 1 item'), 'Open cart, 1 item');
  // Without a singular template the plural form still renders a valid label.
  assert.equal(formatCount('Cart ({count})', 1), 'Cart (1)');
});

test('formatCount treats missing or nonsense counts as an empty cart', () => {
  assert.equal(formatCount('Cart ({count})', undefined), 'Cart (0)');
  assert.equal(formatCount('Cart ({count})', null), 'Cart (0)');
  assert.equal(formatCount('Cart ({count})', -4), 'Cart (0)');
  assert.equal(formatCount('Cart ({count})', 2.7), 'Cart (2)');
  assert.equal(formatCount('', 5), '');
});

test('the cart labels ship as templates, not frozen zero-counts', () => {
  assert.match(DEFAULT_SETTINGS['cart-button-label'], /\{count\}/);
  assert.match(DEFAULT_SETTINGS['cart-heading'], /\{count\}/);
  assert.equal(DEFAULT_SETTINGS['cart-button-label-one'], 'Open cart, 1 item');
  assert.equal(DEFAULT_SETTINGS['cart-heading-one'], 'Cart (1)');
  // The panel opens itself after an add unless an author turns it off.
  assert.equal(DEFAULT_SETTINGS['cart-autoopen'], 'true');
});
