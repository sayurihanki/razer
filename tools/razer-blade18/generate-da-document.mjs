/**
 * Writes the Blade 18 page's DA document out of the blocks' own defaults.
 *
 * The razer-blade18-* family ships its whole design as baked-in defaults, so
 * the page renders correctly from a document holding nothing but five block
 * names. That is a good property for a developer and a bad one for an editor:
 * the Universal Editor can only address content that exists in the document, so
 * a collection living in a JS constant has nothing to select, reorder or
 * delete.
 *
 * This materialises those constants as authoring rows. The rendered page does
 * not change — every row carries exactly the value the block would otherwise
 * have supplied itself — but every chip, mode, stat, spec and build becomes a
 * real item in the editor.
 *
 * It reads the DEFAULT_* exports rather than a second transcription of them, so
 * re-running it after changing a default keeps the document honest.
 *
 * Usage:
 *   node tools/razer-blade18/generate-da-document.mjs [outfile]
 */

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const blockPath = (name) => path.join(repoRoot, 'blocks', name, `${name}.js`);

const hero = await import(blockPath('razer-blade18-hero'));
const dualmode = await import(blockPath('razer-blade18-dualmode'));
const power = await import(blockPath('razer-blade18-power'));
const specs = await import(blockPath('razer-blade18-specs'));
const configure = await import(blockPath('razer-blade18-configure'));

/**
 * Escapes text for HTML body position.
 *
 * @param {string} value The text
 * @returns {string} The escaped text
 */
const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

/**
 * Renders one authoring row.
 *
 * Trailing empty cells are kept so every row in a block is the same width,
 * which is what lets the item definition address a column by nth-child.
 *
 * @param {string[]} cells The row's cells, left to right
 * @param {number} width The block's column count
 * @returns {string} The row markup
 */
function row(cells, width) {
  const padded = [...cells, ...Array(Math.max(0, width - cells.length)).fill('')];
  return `        <div>${padded.map((cell) => `<div>${esc(cell)}</div>`).join('')}</div>`;
}

/**
 * Renders a block, its settings first and then each collection in turn.
 *
 * @param {string} name The block name
 * @param {number} width The block's column count
 * @param {object} settings The block's DEFAULT_SETTINGS
 * @param {Array<[string, object[], string[]]>} groups Row type, entries, fields
 * @returns {string} The block markup
 */
function block(name, width, settings, groups) {
  const rows = Object.entries(settings)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => row(['setting', key, value], width));

  groups.forEach(([type, entries, fields]) => {
    entries.forEach((entry) => {
      rows.push(row([type, entry.key, ...fields.map((f) => entry[f] ?? '')], width));
    });
  });

  return `      <div class="${name}">
${rows.join('\n')}
      </div>`;
}

const sections = [
  block('razer-blade18-hero', 5, hero.DEFAULT_SETTINGS, [
    ['chip', hero.DEFAULT_CHIPS, ['label', 'value']],
    ['cta', hero.DEFAULT_CTAS, ['label', 'href', 'variant']],
  ]),
  block('razer-blade18-dualmode', 8, dualmode.DEFAULT_SETTINGS, [
    ['mode', dualmode.DEFAULT_MODES, ['label', 'badge', 'resolution', 'refresh', 'headline', 'body']],
    ['spec', dualmode.DEFAULT_SPECS, ['label', 'value']],
  ]),
  block('razer-blade18-power', 7, power.DEFAULT_SETTINGS, [
    ['stat', power.DEFAULT_STATS, ['value', 'unit', 'label']],
    ['flow', power.DEFAULT_FLOW, ['label']],
    ['card', power.DEFAULT_CARDS, ['index', 'title', 'body', 'meta']],
  ]),
  block('razer-blade18-specs', 6, specs.DEFAULT_SETTINGS, [
    ['group', specs.DEFAULT_GROUPS, ['label']],
    ['spec', specs.DEFAULT_SPECS, ['group', 'label', 'value']],
  ]),
  block('razer-blade18-configure', 8, configure.DEFAULT_SETTINGS, [
    ['build', configure.DEFAULT_BUILDS, ['name', 'gpu', 'memory', 'storage', 'price', 'flag']],
    ['assure', configure.DEFAULT_ASSURE, ['label']],
  ]),
];

const metadata = `      <div class="metadata">
        <div><div>title</div><div>Razer Blade 18 | 18" Dual Mode Display, GeForce RTX 5090</div></div>
        <div><div>description</div><div>The most powerful Blade ever built: a GeForce RTX 5090 at up to 175W, an Intel Core Ultra 9 275HX, and an 18-inch panel that switches between UHD+ at 240Hz and FHD+ at 440Hz.</div></div>
        <div><div>image</div><div><img src="https://main--razer--sayurihanki.aem.live/images/blade-18.webp" alt="Razer Blade 18 open on a desk, its Chroma keyboard and display lit"></div></div>
        <div><div>og:title</div><div>Razer Blade 18 — desktop power, folded flat</div></div>
      </div>`;

const document = `<body>
  <header></header>
  <main>
${sections.map((markup, index) => (index === sections.length - 1
    ? `    <div>\n${markup}\n${metadata}\n    </div>`
    : `    <div>\n${markup}\n    </div>`)).join('\n')}
  </main>
  <footer></footer>
</body>
`;

const outfile = process.argv[2]
  || path.join(repoRoot, 'blocks/razer-blade18-hero/razer-blade-18-da-live.html');
await writeFile(outfile, document, 'utf8');

const rowCount = (document.match(/^\s*<div><div>/gm) || []).length;
process.stdout.write(`wrote ${outfile}\n${rowCount} authoring rows across ${sections.length} blocks\n`);
