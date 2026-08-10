/**
 * Guards the Razer design system as the single source of the visual language.
 *
 * This replaces tests/razer-mice/tokens.test.mjs, which asserted the opposite
 * invariant: every razer block used to carry its own byte-identical copy of the
 * `rzrm:tokens` preamble, and that test existed to stop the twelve copies
 * drifting. styles/razer-design-system.css collapsed them into one declaration
 * on :root, so the duplication the old test policed no longer exists and the
 * risk moved: a block can now quietly re-declare a token and shadow the system
 * for its own subtree, which is the same drift wearing a different hat.
 *
 * So: the system declares the tokens, blocks consume them.
 */

import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const systemPath = path.join(repoRoot, 'styles', 'razer-design-system.css');

const readSystem = () => readFile(systemPath, 'utf8');

async function razerBlockStylesheets() {
  const blocksDir = path.join(repoRoot, 'blocks');
  const entries = await readdir(blocksDir, { withFileTypes: true });
  const names = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('razer-'))
    .map((entry) => entry.name);
  const files = await Promise.all(names.map(async (name) => {
    const cssPath = path.join(blocksDir, name, `${name}.css`);
    try {
      return { name, css: await readFile(cssPath, 'utf8') };
    } catch {
      return null; // a block without its own stylesheet is fine
    }
  }));
  return files.filter(Boolean);
}

test('the design system is loaded on every page', async () => {
  const head = await readFile(path.join(repoRoot, 'head.html'), 'utf8');
  assert.match(head, /styles\/razer-design-system\.css/);
});

test('the design system declares the load-bearing tokens', async () => {
  const css = await readSystem();
  [
    '--rzr-green: #44d62c',
    '--rzr-surface-base: #000',
    '--rzr-surface-card: #212121',
    '--rzr-text-primary: #fff',
    '--rzr-shell: calc(100vw - 24px)',
    '--rzr-shell: min(960px, calc(100vw - 32px))',
    '--rzr-shell: min(1200px, calc(100vw - 48px))',
    '@media (min-width: 681px)',
    '@media (min-width: 1101px)',
  ].forEach((expected) => {
    assert.ok(css.includes(expected), `the design system lost "${expected}"`);
  });
});

test('no block re-declares a design-system token', async () => {
  const blocks = await razerBlockStylesheets();
  assert.ok(blocks.length >= 12, 'expected to find the razer block stylesheets');
  const offenders = [];
  blocks.forEach(({ name, css }) => {
    // A declaration is `--rzr-foo:`; a consumption is `var(--rzr-foo)`. Only
    // the former shadows the system.
    css.split('\n').forEach((line, index) => {
      const declaration = /(^|[;{]|^\s*)\s*(--rzr-[a-z0-9-]+)\s*:/.exec(line);
      if (declaration && !line.includes('var(')) {
        offenders.push(`${name}.css:${index + 1} declares ${declaration[2]}`);
      }
    });
  });
  assert.deepEqual(offenders, [], `blocks must consume --rzr-* tokens, not declare them:\n${offenders.join('\n')}`);
});

test('the old duplicated token preamble is gone for good', async () => {
  const blocks = await razerBlockStylesheets();
  const stragglers = blocks
    .filter(({ css }) => css.includes('rzrm:tokens:start') || css.includes('--rzrm-'))
    .map(({ name }) => name);
  assert.deepEqual(stragglers, [], `still carrying the pre-design-system tokens: ${stragglers.join(', ')}`);
});
