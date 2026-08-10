/**
 * Regenerates the DA.live copy-paste artifacts for the four Basilisk
 * V3 Pro 35K PDP blocks (razer-pdp-hero, razer-pdp-story,
 * razer-pdp-specs, razer-pdp-related) from the blocks' own baked-in
 * presets, so the pasteable tables and the runtime defaults can never
 * disagree. Also emits the full-page handoff for
 * /gaming-mice/razer-basilisk-v3-pro-35k/rz01-05240100-r3u1 at the
 * repo root (razer-basilisk-pdp-da-live.html), which authors the page
 * as empty block tables (defaults render the complete experience)
 * plus the promo-bar override and the Metadata table.
 *
 * Usage: node blocks/razer-pdp-hero/generate-authoring.mjs
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// The block modules only touch the DOM inside decorate(), so importing
// the preset constants is safe under plain Node.
const hero = await import('./razer-pdp-hero.js');
const story = await import('../razer-pdp-story/razer-pdp-story.js');
const specs = await import('../razer-pdp-specs/razer-pdp-specs.js');
const related = await import('../razer-pdp-related/razer-pdp-related.js');

const here = path.dirname(fileURLToPath(import.meta.url));
const blocksRoot = path.dirname(here);
const repoRoot = path.dirname(blocksRoot);

const PAGE_PATH = '/gaming-mice/razer-basilisk-v3-pro-35k/rz01-05240100-r3u1';

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

function tableHtml(rows, columns, indent = '      ') {
  const htmlRows = rows.map((cells) => {
    if (cells.length === 1) {
      return `${indent}    <tr>\n${indent}      <td>${escapeHtml(cells[0])}</td>\n${indent}    </tr>`;
    }
    const padded = [...cells];
    while (padded.length < columns) padded.push('');
    const tds = padded
      .map((cell) => `${indent}      <td>${escapeHtml(cell).replaceAll('\n', '<br>')}</td>`)
      .join('\n');
    return `${indent}    <tr>\n${tds}\n${indent}    </tr>`;
  }).join('\n');
  return `${indent}<table>\n${indent}  <tbody>\n${htmlRows}\n${indent}  </tbody>\n${indent}</table>`;
}

function blockDocument(title, rows, columns) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} DA.live Copy-Paste Handoff</title>
  </head>
  <body>
    <div>
${tableHtml(rows, columns)}
    </div>
  </body>
</html>
`;
}

function tableTxt(rows) {
  return `${rows
    .map((cells) => cells.map((cell) => String(cell).replaceAll('\n', ' | ')).join('\t'))
    .join('\n')}\n`;
}

/* ── razer-pdp-hero rows ───────────────────────────────────────── */

const heroRows = [['razer-pdp-hero']];
['title', 'subtitle', 'subtitle-link-href', 'base-price', 'cta-href']
  .forEach((key) => heroRows.push(['setting', key, hero.DEFAULT_SETTINGS[key]]));
hero.DEFAULT_CRUMBS.forEach((crumb) => {
  heroRows.push(['crumb', crumb.key, crumb.label, crumb.href]);
});
hero.DEFAULT_IMAGES.forEach((image) => {
  heroRows.push(['image', image.key, image.src, image.alt, image.caption]);
});
hero.DEFAULT_KEYSPECS.forEach((spec) => {
  heroRows.push(['keyspec', spec.key, spec.text]);
});
// Column 6 carries the Commerce option-value UID that add-to-cart needs.
hero.DEFAULT_FINISHES.forEach((finish) => {
  heroRows.push(['finish', finish.key, finish.label, finish.delta ? String(finish.delta) : '', finish.swatch, finish.optionUid]);
});
hero.DEFAULT_MODELS.forEach((model) => {
  heroRows.push(['model', model.key, model.label, model.note, model.delta ? String(model.delta) : '', model.optionUid]);
});
hero.DEFAULT_CARES.forEach((care) => {
  heroRows.push(['care', care.key, care.label, care.note, care.delta ? String(care.delta) : '', care.optionUid]);
});
hero.DEFAULT_SERVICES.forEach((service) => {
  heroRows.push(['service', service.key, service.glyph, service.title, service.body]);
});

/* ── razer-pdp-story rows ──────────────────────────────────────── */

const storyRows = [['razer-pdp-story']];
['kicker', 'heading', 'body', 'backdrop']
  .forEach((key) => storyRows.push(['setting', key, story.DEFAULT_SETTINGS[key]]));
story.DEFAULT_STATS.forEach((stat) => {
  storyRows.push(['stat', stat.key, String(stat.value), stat.suffix, stat.label]);
});
story.DEFAULT_FEATURES.forEach((feature) => {
  storyRows.push([
    'feature', feature.key, feature.index, feature.numeral, feature.title, feature.body, feature.image,
  ]);
});

/* ── razer-pdp-specs rows ──────────────────────────────────────── */

const specsRows = [['razer-pdp-specs']];
['eyebrow', 'heading', 'body', 'platform-title', 'support-href']
  .forEach((key) => specsRows.push(['setting', key, specs.DEFAULT_SETTINGS[key]]));
specs.DEFAULT_TAGS.forEach((tag) => specsRows.push(['tag', tag.key, tag.label]));
specs.DEFAULT_SPECS.forEach((spec) => {
  specsRows.push(['spec', spec.key, spec.label, spec.value]);
});

/* ── razer-pdp-related rows ────────────────────────────────────── */

const relatedRows = [['razer-pdp-related']];
['eyebrow', 'heading', 'link-label', 'link-href']
  .forEach((key) => relatedRows.push(['setting', key, related.DEFAULT_SETTINGS[key]]));
related.DEFAULT_PRODUCTS.forEach((product) => {
  relatedRows.push([
    'product', product.key, product.image, product.meta,
    product.title, product.description, product.price, product.href,
  ]);
});

/* ── Per-block artifacts ───────────────────────────────────────── */

const artifacts = [
  {
    block: 'razer-pdp-hero', title: 'Razer PDP Hero', rows: heroRows, columns: 6,
  },
  {
    block: 'razer-pdp-story', title: 'Razer PDP Story', rows: storyRows, columns: 8,
  },
  {
    block: 'razer-pdp-specs', title: 'Razer PDP Specs', rows: specsRows, columns: 4,
  },
  {
    block: 'razer-pdp-related', title: 'Razer PDP Related', rows: relatedRows, columns: 8,
  },
];

await Promise.all(artifacts.map(async ({
  block, title, rows, columns,
}) => {
  const dir = path.join(blocksRoot, block);
  await writeFile(path.join(dir, `${block}-da-live.html`), blockDocument(title, rows, columns));
  await writeFile(path.join(dir, `${block}-table.txt`), tableTxt(rows));
}));

/* ── Full-page handoff ─────────────────────────────────────────── */

const pageTables = [
  { rows: [['razer-site-header']], columns: 1 },
  {
    rows: [
      ['razer-promo-bar'],
      ['promo', 'Razer Back-to-School Kits: education perks plus bonus Razer skin with eligible Razer Blade purchase.', 'Shop now >', 'https://www.razer.com/education'],
    ],
    columns: 4,
  },
  { rows: [['razer-pdp-hero']], columns: 1 },
  { rows: [['razer-pdp-story']], columns: 1 },
  { rows: [['razer-pdp-specs']], columns: 1 },
  { rows: [['razer-pdp-related']], columns: 1 },
  { rows: [['razer-site-footer']], columns: 1 },
  {
    rows: [
      ['Metadata'],
      ['title', 'Razer Basilisk V3 Pro 35K | Razer'],
      ['description', 'Explore the Razer Basilisk V3 Pro 35K, a fully customizable wireless ergonomic RGB gaming mouse with Focus Pro 35K sensor and HyperScroll Tilt Wheel.'],
      ['image', '/images/razer-mice/pdp/basilisk-top-chroma.webp'],
      // detectPageType() only treats this page as a Product when the sku row is
      // present, and initializers/pdp.js reads it via getProductSku(). Must
      // match the Commerce parent SKU exactly, spaces and all.
      ['sku', hero.DEFAULT_SETTINGS.sku],
    ],
    columns: 2,
  },
];

const pageHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Razer Basilisk V3 Pro 35K PDP - DA.live Copy-Paste Handoff</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 24px; }
      table { border-collapse: collapse; width: 100%; margin: 0; }
      td { border: 1px solid #ccc; padding: 8px 12px; vertical-align: top; }
      tr:first-child td { background: #f5f5f5; font-weight: 600; }
      hr { margin: 32px 0; border: 0; border-top: 2px dashed #bbb; }
      p.note { color: #555; max-width: 72ch; }
    </style>
  </head>
  <body>
    <p class="note">Paste the tables below into the DA.live document at
      <strong>${escapeHtml(PAGE_PATH)}</strong>, in order, one table per section.
      Empty block tables render the complete baked-in experience; per-block
      override rows live in each block's own *-da-live.html handoff.</p>
${pageTables.map(({ rows, columns }) => `    <div>
${tableHtml(rows, columns)}
    </div>`).join('\n\n    <hr>\n\n')}
  </body>
</html>
`;

await writeFile(path.join(repoRoot, 'razer-basilisk-pdp-da-live.html'), pageHtml);

const total = artifacts.reduce((sum, { rows }) => sum + rows.length, 0);
process.stdout.write(`wrote ${total} block rows and the full-page handoff\n`);
