import { readRows, el } from '../../scripts/razer-chroma.js';

/*
 * Row contract (repeat `item` for each benefit; omit everything for DEFAULTS):
 *   feature | #1 Mouse Brand | Source: ProSettings.net, "Pro Gaming Gear..."
 *   item    | ↯ | Next Business Day Shipping | Get in the game sooner.
 *   item    | ↺ | Risk Free Return           | Shop direct with confidence.
 *   label   | RazerStore benefits and proof
 *
 * The first article is deliberately a different shape from the rest: it is the
 * highlighted `.proof-feature` panel, and the responsive border logic keys off
 * nth-child, so the article order here is load-bearing.
 */

const DEFAULTS = {
  label: 'RazerStore benefits and proof',
  feature: ['#1 Mouse Brand', 'Source: ProSettings.net, “Pro Gaming Gear of the Year 2025.”'],
  items: [
    ['↯', 'Next Business Day Shipping', 'Get in the game sooner.'],
    ['↺', 'Risk Free Return', 'Shop direct with confidence.'],
    ['◎', 'Comprehensive Support', 'Help across the lifecycle of your gear.'],
  ],
};

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = readRows(block);
  const cellsFor = (key) => rows.find((r) => r.key === key)?.cells;
  const textAt = (cells, i) => cells?.[i]?.textContent.trim() || '';

  const featureCells = cellsFor('feature');
  const feature = featureCells
    ? [textAt(featureCells, 0), textAt(featureCells, 1)]
    : DEFAULTS.feature;

  const authored = rows.filter((r) => r.key === 'item');
  const items = authored.length
    ? authored.map(({ cells }) => [textAt(cells, 0), textAt(cells, 1), textAt(cells, 2)])
    : DEFAULTS.items;

  const grid = el('div', { class: 'shell proof-grid' }, [
    el('article', { class: 'proof-feature' }, [
      el('strong', {}, [feature[0]]),
      el('p', {}, [feature[1]]),
    ]),
    ...items.map(([glyph, title, copy]) => el('article', {}, [
      el('span', { 'aria-hidden': 'true' }, [glyph]),
      el('div', {}, [el('strong', {}, [title]), el('p', {}, [copy])]),
    ])),
  ]);

  const label = rows.find((r) => r.key === 'label')?.cells[0]?.textContent.trim();
  const section = el('section', {
    class: 'proof-strip',
    id: 'proof',
    'aria-label': label || DEFAULTS.label,
  }, [grid]);

  block.textContent = '';
  block.append(section);
}
