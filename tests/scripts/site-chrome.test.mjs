/**
 * Guards the site-chrome invariants in scripts.js.
 *
 * buildRazerChrome is what puts the Razer header and footer on every page
 * that does not author them, and what makes pageUsesOwnChrome true so the
 * boilerplate nav stays collapsed. When it does not run, the page silently
 * falls back to the Bodea-branded /nav fragment — a page that still works
 * but no longer looks like this site. That failure is invisible to every
 * other test in the suite, so the invariants are asserted here.
 *
 * scripts.js cannot be imported under Node (aem.js and commerce.js both
 * need `window` at module scope), so these read the source, in the same
 * idiom as tests/design-system.test.mjs.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const readScripts = () => readFile(path.join(repoRoot, 'scripts', 'scripts.js'), 'utf8');

/** The body of a named function declaration, brace-matched. */
function functionBody(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `scripts.js no longer defines ${name}()`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }
  throw new Error(`could not find the end of ${name}()`);
}

test('the chrome is built before main is decorated', async () => {
  const source = await readScripts();
  const eager = functionBody(source, 'loadEager');

  const built = eager.indexOf('buildRazerChrome(main)');
  const decorated = eager.indexOf('decorateMain(main)');

  assert.notEqual(built, -1, 'loadEager no longer builds the razer chrome');
  assert.notEqual(decorated, -1, 'loadEager no longer decorates main');
  // The built sections have to exist before decorateMain runs or they never
  // become sections and the header block never loads.
  assert.ok(built < decorated, 'buildRazerChrome must run before decorateMain');
});

test('the chrome is built against the page main, never a fragment', async () => {
  const source = await readScripts();
  // decorateMain also runs over every loaded fragment (the header mounts
  // /mini-cart through it), so a chrome build called from there would nest a
  // header inside the cart drawer.
  const decorateMainBody = functionBody(source, 'decorateMain');
  assert.ok(
    !decorateMainBody.includes('buildRazerChrome'),
    'buildRazerChrome must not be called from decorateMain — fragments run through it too',
  );
});

test('only page metadata can opt a page out of the chrome', async () => {
  const source = await readScripts();
  const body = functionBody(source, 'buildRazerChrome');

  assert.match(
    body,
    /getMetadata\('chrome'\) === 'none'/,
    'the chrome opt-out is no longer the documented `chrome: none` metadata',
  );
  // Anything else that returns early would drop the chrome on pages nobody
  // opted out, which is exactly the regression this file exists to catch.
  const earlyReturns = body.match(/^\s*if \(.*\) return;/gm) ?? [];
  assert.equal(
    earlyReturns.length,
    1,
    `buildRazerChrome grew an extra early return:\n${earlyReturns.join('\n')}`,
  );
});

test('the chrome build covers both the header and the footer', async () => {
  const source = await readScripts();
  const body = functionBody(source, 'buildRazerChrome');

  ['razer-site-header', 'razer-site-footer'].forEach((block) => {
    assert.ok(
      body.includes(`buildBlock('${block}', '')`),
      `buildRazerChrome no longer builds ${block}`,
    );
    // Guard against doubling up on pages that author the block themselves.
    assert.ok(
      body.includes(`main.querySelector('.${block}')`),
      `buildRazerChrome no longer checks for an authored ${block}`,
    );
  });
});

test('the boilerplate nav and footer stay off own-chrome pages', async () => {
  const source = await readScripts();
  const lazy = functionBody(source, 'loadLazy');

  assert.match(
    lazy,
    /if \(!ownChrome\) loadHeader\(/,
    'loadLazy loads the boilerplate header unconditionally again',
  );
  assert.match(
    lazy,
    /if \(!ownChrome\) loadFooter\(/,
    'loadLazy loads the boilerplate footer unconditionally again',
  );
  assert.match(
    lazy,
    /const ownChrome = pageUsesOwnChrome\(doc\)/,
    'loadLazy no longer derives ownChrome from pageUsesOwnChrome',
  );
});

test('collapsing the boilerplate chrome runs on every page load', async () => {
  const source = await readScripts();
  const eager = functionBody(source, 'loadEager');
  assert.ok(
    eager.includes('collapseBoilerplateChrome(doc)'),
    'loadEager no longer collapses the boilerplate chrome',
  );
});
