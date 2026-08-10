import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

/*
 * Tests for the razer-chroma homepage block family.
 *
 * Two kinds of assertion:
 *  - Pure logic (the gear finder's match precedence) is imported and executed.
 *  - Everything else is asserted against the source text, the cheap approach
 *    already used by tests/razer-minipage -- there is no jsdom in this repo.
 */

const BLOCKS_DIR = new URL('../../blocks/', import.meta.url);
const STYLES_DIR = new URL('../../styles/', import.meta.url);
const SCRIPTS_DIR = new URL('../../scripts/', import.meta.url);

const BLOCKS = [
  'razer-campaign-carousel',
  'razer-capability-grid',
  'razer-family-grid',
  'razer-final-cta',
  'razer-gear-finder',
  'razer-home-hero',
  'razer-home-promo-bar',
  'razer-proof-strip',
  'razer-resource-grid',
  'razer-story-grid',
  'razer-use-case-tabs',
];

const read = (dir, file) => readFile(new URL(file, dir), 'utf8');

describe('razer-chroma block family', () => {
  BLOCKS.forEach((name) => {
    describe(name, () => {
      test('stylesheet stays scoped to the block', async () => {
        const css = await read(BLOCKS_DIR, `${name}/${name}.css`);
        // A block must never install global styles: those belong in the
        // conditionally-injected shared sheet.
        assert.doesNotMatch(css, /(^|\})\s*:root\s*\{/m, 'block CSS must not declare :root');
        assert.doesNotMatch(css, /(^|\})\s*(?:html|body)\s*\{/m, 'block CSS must not style html/body');
        assert.match(css, new RegExp(`\\.${name}[\\s.:>]`), 'rules must be scoped to the block class');
      });

      test('keyframes are namespaced', async () => {
        const css = await read(BLOCKS_DIR, `${name}/${name}.css`);
        const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]);
        names.forEach((keyframe) => {
          // @keyframes names are global; an unprefixed one would collide with
          // any other block on the page.
          assert.match(keyframe, /^razer-/, `@keyframes ${keyframe} must be prefixed`);
        });
      });

      test('decorator is a default-exported decorate()', async () => {
        const js = await read(BLOCKS_DIR, `${name}/${name}.js`);
        assert.match(js, /export default async function decorate\(block\)/);
        // The block must not seize the host page's chrome.
        assert.doesNotMatch(js, /document\.(body|documentElement)\.classList/);
        assert.doesNotMatch(js, /body\s*>\s*(header|footer)/);
      });

      test('ships a DA.live paste table whose first cell is the block name', async () => {
        const html = await read(BLOCKS_DIR, `${name}/${name}-da-live.html`);
        const firstCell = html.match(/<tr><td>([^<]+)<\/td><\/tr>/);
        assert.ok(firstCell, 'paste table must open with a single-cell block-name row');
        assert.equal(firstCell[1].trim(), name);
      });

      test('has the README the pre-commit hook requires', async () => {
        const readme = await read(BLOCKS_DIR, `${name}/README.md`);
        assert.match(readme, /## DA.live Authoring Model/);
        assert.match(readme, /## Behavior/);
      });

      test('consumes the design system rather than the retired chroma tokens', async () => {
        const css = await read(BLOCKS_DIR, `${name}/${name}.css`);
        // These blocks used to depend on styles/razer-chroma-shared.css, loaded
        // conditionally from a RAZER_CHROMA_BLOCKS list in scripts.js, and
        // omitting a block from that list resolved its tokens to nothing.
        // styles/razer-design-system.css now loads on every page, so the list
        // and the failure mode are both gone — what has to hold instead is that
        // no block still reaches for a token nobody declares any more.
        assert.doesNotMatch(
          css,
          /var\(\s*--(shell|dim|ink-raised|font)\b/,
          `${name}.css still reads a retired razer-chroma-shared token`,
        );
      });
    });
  });
});

describe('shared stylesheet', () => {
  test('is not wired into the global stylesheet chain', async () => {
    const head = await read(new URL('../../', import.meta.url), 'head.html');
    assert.doesNotMatch(head, /razer-chroma-shared/);
  });

  test('binds the font aliases the --rzr-font-* tokens depend on', async () => {
    const css = await read(STYLES_DIR, 'razer-chroma-shared.css');
    // Without these, --rzr-font-display/-body are invalid at computed-value
    // time and the whole family silently falls back to system fonts -- the
    // exact defect the source site ships.
    ['--font-roboto', '--font-roboto-condensed', '--font-titillium'].forEach((alias) => {
      assert.match(css, new RegExp(`${alias}:`), `${alias} must be defined at :root`);
    });
  });

  test('does not declare a bare .section rule', async () => {
    const css = await read(STYLES_DIR, 'razer-chroma-shared.css');
    // A bare `.section` would collide with EDS's own section wrappers and
    // repad every section on any page that loads this file.
    assert.doesNotMatch(css, /(^|\})\s*\.section\s*\{/m);
  });

  test('button rules outrank EDS\'s own main a.button:any-link', async () => {
    const css = await read(STYLES_DIR, 'razer-chroma-shared.css');
    assert.match(css, /a\.button:any-link/, 'needs the :any-link variant to win on specificity');
  });
});

describe('token delivery', () => {
  /*
   * There used to be a conditional loader here: scripts.js kept a
   * RAZER_CHROMA_BLOCKS list, and loadRazerChromaStyles injected
   * razer-chroma-shared.css and a marker class only on pages carrying one of
   * those blocks. It had two failure modes worth testing — loading on pages
   * that needed nothing, and a block missing from the list resolving its
   * tokens to nothing.
   *
   * styles/razer-design-system.css replaced both: it loads from head.html on
   * every page, so there is no list to fall off and no page to skip. These
   * tests assert the replacement rather than the mechanism it retired.
   */
  test('the design system loads unconditionally, not per block', async () => {
    const head = await read(new URL('../../', import.meta.url), 'head.html');
    assert.match(head, /styles\/razer-design-system\.css/);
  });

  test('the retired conditional loader is gone from scripts.js', async () => {
    const scripts = await read(SCRIPTS_DIR, 'scripts.js');
    assert.doesNotMatch(scripts, /RAZER_CHROMA_BLOCKS/, 'the block list should be gone');
    assert.doesNotMatch(scripts, /loadRazerChromaStyles/, 'the loader should be gone');
  });
});

describe('gear finder match precedence', () => {
  let resolveMatch;

  before(async () => {
    // aem.js touches window/document at import time.
    globalThis.window = { location: { search: '', href: 'http://localhost/' }, hlx: { codeBasePath: '' } };
    globalThis.document = {
      createElement: () => ({ setAttribute() {}, append() {}, classList: { add() {} } }),
      querySelector: () => null,
      querySelectorAll: () => [],
    };
    ({ resolveMatch } = await import('../../blocks/razer-gear-finder/razer-gear-finder.js'));
  });

  const cases = [
    ['creator playstyle wins outright', { playstyle: 'creator', platform: 'pc', priority: 'lightweight' }, 'seiren'],
    ['audio priority also reaches seiren', { playstyle: 'competitive', platform: 'pc', priority: 'audio' }, 'seiren'],
    ['mmo outranks platform and priority', { playstyle: 'mmo', platform: 'mobile', priority: 'portable' }, 'naga'],
    ['mobile platform', { playstyle: 'immersive', platform: 'mobile', priority: 'control' }, 'mobile'],
    ['portable priority', { playstyle: 'immersive', platform: 'pc', priority: 'portable' }, 'mobile'],
    ['competitive playstyle', { playstyle: 'competitive', platform: 'pc', priority: 'control' }, 'viper'],
    ['lightweight priority', { playstyle: 'immersive', platform: 'pc', priority: 'lightweight' }, 'viper'],
    ['everything else falls to basilisk', { playstyle: 'immersive', platform: 'pc', priority: 'control' }, 'basilisk'],
    ['no answers still resolves', {}, 'basilisk'],
  ];

  cases.forEach(([label, answers, expected]) => {
    test(label, () => assert.equal(resolveMatch(answers), expected));
  });
});
