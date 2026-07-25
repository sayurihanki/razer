/**
 * Regenerates the DA.live copy-paste artifacts for razer-site-header
 * from the block's own baked-in presets, so the pasteable table and the
 * runtime defaults can never disagree.
 *
 * Usage: node blocks/razer-site-header/generate-authoring.mjs
 * Outputs: razer-site-header-da-live.html, razer-site-header-table.txt
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// The block module only touches the DOM inside decorate(), so importing
// the preset constants is safe under plain Node.
const {
  DEFAULT_NAV,
  DEFAULT_MEGA_COLUMNS,
  DEFAULT_MEGA_LINKS,
  DEFAULT_CATEGORIES,
  DEFAULT_MOBILE_LINKS,
  DEFAULT_PANEL_CTA,
  DEFAULT_CART_CTA,
  DEFAULT_SEARCH_INDEX,
} = await import('./razer-site-header.js');

const COLUMNS = 6;
const here = path.dirname(fileURLToPath(import.meta.url));

const rows = [];
rows.push(['razer-site-header']);
rows.push(['setting', 'logo', '/images/razer-mice/razer-logo.svg']);

DEFAULT_NAV.forEach((item) => {
  rows.push(['nav', item.key, item.label, item.href, item.kind]);
});
DEFAULT_MEGA_COLUMNS.forEach((column) => {
  rows.push(['mega-column', column.key, column.label]);
});
DEFAULT_MEGA_LINKS.forEach((link) => {
  rows.push([
    'mega-link', link.columnKey, link.key, link.label, link.href,
    link.feature ? 'true' : 'false',
  ]);
});
DEFAULT_CATEGORIES.forEach((category) => {
  rows.push(['category', category.key, category.label, category.href]);
});
DEFAULT_MOBILE_LINKS.forEach((link) => {
  rows.push(['mobile-link', link.key, link.label, link.href]);
});
rows.push(['panel-cta', DEFAULT_PANEL_CTA.label, DEFAULT_PANEL_CTA.href]);
rows.push(['cart-cta', DEFAULT_CART_CTA.label, DEFAULT_CART_CTA.href]);
DEFAULT_SEARCH_INDEX.forEach((entry) => {
  rows.push(['search-popular', entry.key, entry.label, entry.href, entry.terms]);
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
    .map((cell) => `            <td>${escapeHtml(cell)}</td>`)
    .join('\n');
  return `          <tr>\n${tds}\n          </tr>`;
}).join('\n');

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Razer Site Header DA.live Copy-Paste Handoff</title>
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

const txt = `${rows.map((cells) => cells.join('\t')).join('\n')}\n`;

await writeFile(path.join(here, 'razer-site-header-da-live.html'), html);
await writeFile(path.join(here, 'razer-site-header-table.txt'), txt);
process.stdout.write(`wrote ${rows.length} rows\n`);
