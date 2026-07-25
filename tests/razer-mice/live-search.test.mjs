/**
 * Unit coverage for the razer-site-header live-search helpers.
 *
 * The search dialog ranks the baked-in product catalog (imported from
 * razer-product-explorer) plus the quick-link index. These tests pin
 * the pure ranking/highlighting functions against both the real
 * catalog data and small synthetic fixtures, so the header and the
 * explorer cannot silently drift apart on the data contract either.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_SEARCH_INDEX,
  buildLinkEntries,
  buildProductEntries,
  highlightRanges,
  searchCatalog,
  tokenizeQuery,
} from '../../blocks/razer-site-header/razer-site-header.js';
import { DEFAULT_PRODUCTS } from '../../blocks/razer-product-explorer/razer-product-explorer.js';

test('tokenizeQuery lowercases and splits on whitespace', () => {
  assert.deepEqual(tokenizeQuery('  Basilisk  V3 '), ['basilisk', 'v3']);
  assert.deepEqual(tokenizeQuery(''), []);
  assert.deepEqual(tokenizeQuery(undefined), []);
});

test('empty or blank queries return no results', () => {
  const entries = buildProductEntries(DEFAULT_PRODUCTS);
  assert.deepEqual(searchCatalog('', entries, 10), []);
  assert.deepEqual(searchCatalog('   ', entries, 10), []);
});

test('product entries carry the render contract (image, price, meta, href)', () => {
  const entries = buildProductEntries(DEFAULT_PRODUCTS);
  assert.equal(entries.length, DEFAULT_PRODUCTS.length);
  entries.forEach((entry) => {
    assert.ok(entry.title, 'title present');
    assert.match(entry.image, /^\/images\/razer-mice\/products\/.+\.webp$/);
    assert.ok(entry.priceText, 'price text present');
    assert.ok(entry.meta.includes(' · '), 'meta joins family and playstyle');
    assert.ok(entry.href, 'href present');
  });
});

test('a family query returns every product in that family', () => {
  const entries = buildProductEntries(DEFAULT_PRODUCTS);
  const results = searchCatalog('basilisk', entries, 10);
  assert.equal(results.length, 3);
  results.forEach((entry) => assert.match(entry.title, /Basilisk/));
});

test('multi-word queries AND across tokens', () => {
  const entries = buildProductEntries(DEFAULT_PRODUCTS);
  const results = searchCatalog('wireless esports', entries, 10);
  assert.ok(results.length > 0, 'expected wireless esports matches');
  results.forEach((entry) => {
    const haystack = `${entry.title} ${entry.keywords}`.toLowerCase();
    assert.ok(haystack.includes('wireless'), `${entry.title} matches wireless`);
    assert.ok(haystack.includes('esports'), `${entry.title} matches esports`);
  });
  assert.ok(
    !results.some((entry) => entry.title === 'Razer Cobra'),
    'wired Cobra is excluded',
  );
});

test('title matches outrank keyword-only matches', () => {
  const entries = [
    { title: 'Keyword only', keywords: 'viper something' },
    { title: 'Viper flagship', keywords: '' },
  ];
  const results = searchCatalog('viper', entries, 5);
  assert.equal(results[0].title, 'Viper flagship');
  assert.equal(results.length, 2);
});

test('ties keep catalog order and the limit caps results', () => {
  const entries = buildProductEntries(DEFAULT_PRODUCTS);
  const results = searchCatalog('razer', entries, 4);
  assert.equal(results.length, 4);
  assert.deepEqual(
    results.map((entry) => entry.title),
    DEFAULT_PRODUCTS.slice(0, 4).map((product) => product.title),
  );
});

test('quick links match via their terms column', () => {
  const links = buildLinkEntries(DEFAULT_SEARCH_INDEX);
  const results = searchCatalog('finder', links, 5);
  assert.ok(results.some((entry) => entry.title === 'Find your gear'));
});

test('highlightRanges finds and merges token occurrences', () => {
  assert.deepEqual(
    highlightRanges('Razer Viper V3', ['viper', 'v3']),
    [[6, 11], [12, 14]],
  );
  assert.deepEqual(highlightRanges('aaaa', ['aa', 'aaa']), [[0, 4]]);
  assert.deepEqual(highlightRanges('no match here', ['zzz']), []);
  assert.deepEqual(highlightRanges('anything', []), []);
});
