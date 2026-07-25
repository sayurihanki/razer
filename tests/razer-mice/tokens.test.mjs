/**
 * Guards the duplicated `rzrm` token preamble against drift.
 *
 * Every razer-mice block stylesheet carries an identical token/reset
 * preamble between the `rzrm:tokens:start` and `rzrm:tokens:end`
 * markers (with only the block's own name substituted). This test
 * normalizes the block name out of each slice and asserts all copies
 * are byte-identical, so a fix applied to one block cannot silently
 * miss the other seven.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const BLOCKS = [
  'razer-site-header',
  'razer-family-rail',
  'razer-promo-bar',
  'razer-plp-hero',
  'razer-proof-banner',
  'razer-plp-intro',
  'razer-product-explorer',
  'razer-site-footer',
];

const START_MARKER = '/* rzrm:tokens:start */';
const END_MARKER = '/* rzrm:tokens:end */';

async function readTokenSlice(blockName) {
  const cssPath = path.join(repoRoot, 'blocks', blockName, `${blockName}.css`);
  const css = await readFile(cssPath, 'utf8');
  const start = css.indexOf(START_MARKER);
  const end = css.indexOf(END_MARKER);
  assert.notEqual(start, -1, `${blockName}.css is missing ${START_MARKER}`);
  assert.notEqual(end, -1, `${blockName}.css is missing ${END_MARKER}`);
  assert.ok(end > start, `${blockName}.css has its token markers out of order`);
  return css
    .slice(start + START_MARKER.length, end)
    .replaceAll(blockName, '%BLOCK%');
}

test('every razer-mice block carries an identical rzrm token preamble', async () => {
  const slices = await Promise.all(BLOCKS.map(readTokenSlice));
  const [reference] = slices;
  assert.ok(reference.trim().length > 0, 'reference token slice is empty');
  BLOCKS.forEach((blockName, index) => {
    assert.equal(
      slices[index],
      reference,
      `${blockName}.css token preamble drifted from ${BLOCKS[0]}.css`,
    );
  });
});

test('the token preamble keeps its load-bearing values', async () => {
  const slice = await readTokenSlice(BLOCKS[0]);
  [
    '--rzrm-green: #44d62c',
    '--rzrm-surface-card: #212121',
    '--rzrm-shell: min(1200px, calc(100vw - 48px))',
    '--rzrm-shell: min(960px, calc(100vw - 32px))',
    '--rzrm-shell: calc(100vw - 24px)',
    '@media (min-width: 681px)',
    '@media (min-width: 1101px)',
  ].forEach((expected) => {
    assert.ok(slice.includes(expected), `token preamble lost "${expected}"`);
  });
});
