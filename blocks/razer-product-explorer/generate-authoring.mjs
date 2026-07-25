/**
 * Regenerates the DA.live copy-paste artifacts for razer-product-explorer
 * from the block's own baked-in presets, so the pasteable table and the
 * runtime defaults can never disagree.
 *
 * Usage: node blocks/razer-product-explorer/generate-authoring.mjs
 * Outputs: razer-product-explorer-da-live.html, razer-product-explorer-table.txt
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// The block module only touches the DOM inside decorate(), so importing
// the preset constants is safe under plain Node.
const {
  DEFAULT_SETTINGS,
  DEFAULT_FILTER_GROUPS,
  DEFAULT_SORTS,
  DEFAULT_PRODUCTS,
} = await import('./razer-product-explorer.js');

const COLUMNS = 12;
const here = path.dirname(fileURLToPath(import.meta.url));

const rows = [];
rows.push(['razer-product-explorer']);

['sort-default', 'show-results-label', 'empty-title', 'empty-body', 'service-note']
  .forEach((key) => rows.push(['setting', key, DEFAULT_SETTINGS[key]]));

DEFAULT_FILTER_GROUPS.forEach((group) => {
  rows.push(['filter-group', group.key, group.legend]);
  group.options.forEach((option) => {
    rows.push(['filter-option', group.key, option.key, option.label, option.match]);
  });
});

DEFAULT_SORTS.forEach((sort) => rows.push(['sort-option', sort.key, sort.label]));

DEFAULT_PRODUCTS.forEach((product) => {
  rows.push([
    'product',
    product.key,
    'true',
    product.image,
    product.title,
    product.family,
    product.playstyle,
    product.connectivity,
    product.badge,
    product.priceText,
    String(product.priceValue),
    product.url,
  ]);
  rows.push([
    'product-detail',
    product.key,
    product.description,
    product.attributes.join('\n'),
    product.availabilityLead,
    '',
    '',
    '',
    product.configureUrl,
  ]);
});

const escapeHtml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const htmlRows = rows.map((cells) => {
  if (cells.length === 1) {
    return `          <tr>\n            <td>${escapeHtml(cells[0])}</td>\n          </tr>`;
  }
  const padded = [...cells];
  while (padded.length < COLUMNS) padded.push('');
  const tds = padded
    .map((cell) => `            <td>${escapeHtml(cell).replaceAll('\n', '<br>')}</td>`)
    .join('\n');
  return `          <tr>\n${tds}\n          </tr>`;
}).join('\n');

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Razer Product Explorer DA.live Copy-Paste Handoff</title>
  </head>
  <body>
    <div>
      <table>
        <tbody>
${htmlRows}
        </tbody>
      </table>
    </div>
  </body>
</html>
`;

const txt = `${rows
  .map((cells) => cells.map((cell) => cell.replaceAll('\n', ' | ')).join('\t'))
  .join('\n')}\n`;

await writeFile(path.join(here, 'razer-product-explorer-da-live.html'), html);
await writeFile(path.join(here, 'razer-product-explorer-table.txt'), txt);
process.stdout.write(`wrote ${rows.length} rows\n`);
