/**
 * Razer Blade 18 configurations and closing call to action.
 *
 * Three build cards and one last invitation. This is the only place on the page
 * that names a price, and the only place the product photograph appears — at
 * the size it was actually cut for, rather than blown up into a hero.
 *
 * Table contract (8 columns, typed rows; column 1 is the row type):
 *   setting | <key> | <value>
 *   build   | <key> | <name> | <gpu> | <memory> | <storage> | <price> | <flag>
 *   assure  | <key> | <label>
 *
 * A build carrying any `flag` text is the highlighted one and wears that text
 * as its ribbon. See scripts/razer-authoring.js for the merge semantics.
 */

import {
  el, mergeList, mergeSettings, parseTable, revealOnScroll,
} from '../../scripts/razer-authoring.js';

export const DEFAULT_SETTINGS = {
  'anchor-id': 'configure',
  eyebrow: 'Configurations',
  heading: 'Pick your ceiling.',
  body: 'Every Blade 18 ships with the same 18-inch dual-mode panel, the same Core Ultra 9 275HX and the same cooling stack. What you choose is how much graphics power sits underneath it.',
  'price-prefix': 'From',
  currency: 'US$',
  'cta-label': 'Configure at Razer.com',
  'cta-href': 'https://www.razer.com/gaming-laptops/razer-blade-18',
  'closing-title': 'Built to outlast the generation.',
  'closing-body': 'Two memory slots, two M.2 bays and a chassis milled from one piece of aluminium. The Blade 18 is meant to be opened, upgraded and kept.',
  'closing-cta-label': 'Explore the Blade 18',
  'closing-cta-href': 'https://www.razer.com/gaming-laptops/razer-blade-18',
  'closing-image': '/images/blade-18.webp',
  'closing-image-alt': 'Razer Blade 18 open on a desk, its Chroma keyboard and wave wallpaper lit in a dark room',
  'price-note': 'Prices are indicative US recommended retail and exclude tax. Availability and configuration vary by region.',
};

export const DEFAULT_BUILDS = [
  {
    key: 'build-01',
    name: 'Blade 18 · RTX 5070 Ti',
    gpu: 'GeForce RTX 5070 Ti, 12GB GDDR7',
    memory: '16GB DDR5-5600',
    storage: '1TB PCIe Gen4',
    price: '3,499.99',
    flag: '',
  },
  {
    key: 'build-02',
    name: 'Blade 18 · RTX 5080',
    gpu: 'GeForce RTX 5080, 16GB GDDR7',
    memory: '32GB DDR5-5600',
    storage: '1TB PCIe Gen4',
    price: '3,999.99',
    flag: '',
  },
  {
    key: 'build-03',
    name: 'Blade 18 · RTX 5090',
    gpu: 'GeForce RTX 5090, 24GB GDDR7',
    memory: '32GB DDR5-5600',
    storage: '2TB PCIe Gen4',
    price: '4,499.99',
    flag: 'Full 175W',
  },
];

export const DEFAULT_ASSURE = [
  { key: 'assure-01', label: 'Free shipping' },
  { key: 'assure-02', label: '14-day returns' },
  { key: 'assure-03', label: '1-year warranty' },
  { key: 'assure-04', label: 'RazerCare available' },
];

/**
 * loads and decorates the block
 *
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const parsed = parseTable(block, ['build', 'assure']);
  const config = mergeSettings(parsed, DEFAULT_SETTINGS, ['closing-image']);
  const builds = mergeList(parsed, 'build', DEFAULT_BUILDS, [
    'name', 'gpu', 'memory', 'storage', 'price', 'flag',
  ], { required: 'name' });
  const assurances = mergeList(parsed, 'assure', DEFAULT_ASSURE, ['label']);

  const heading = el('div', 'section-heading', [
    el('div', '', [
      config.eyebrow && el('p', 'eyebrow', [config.eyebrow]),
      config.heading && el('h2', '', [config.heading]),
    ]),
    config.body && el('p', '', [config.body]),
  ]);

  const grid = el('ul', 'build-grid');
  builds.forEach((build) => {
    const rows = el('dl', 'build-rows');
    [
      ['Graphics', build.gpu],
      ['Memory', build.memory],
      ['Storage', build.storage],
    ].forEach(([label, value]) => {
      if (!value) return;
      rows.append(el('dt', '', [label]), el('dd', '', [value]));
    });

    const cta = el('a', 'button button-primary', [config['cta-label']]);
    cta.href = config['cta-href'] || '#';
    /* The destination is razer.com, not this page — say so rather than
       leaving three identically-labelled links for a screen reader. */
    cta.setAttribute('aria-label', `${config['cta-label']}: ${build.name}`);

    const card = el('li', `build-card${build.flag ? ' is-featured' : ''}`, [
      build.flag && el('span', 'build-flag', [build.flag]),
      el('h3', 'build-name', [build.name]),
      rows,
      build.price && el('p', 'build-price', [
        config['price-prefix'] && el('span', 'price-prefix', [config['price-prefix']]),
        el('span', 'price-figure', [`${config.currency || ''}${build.price}`]),
      ]),
      config['cta-label'] && cta,
    ]);
    grid.append(card);
  });

  const assureRail = el('ul', 'build-assure');
  assurances.forEach((item) => assureRail.append(el('li', '', [item.label])));

  const closingCopy = el('div', 'closing-copy', [
    config['closing-title'] && el('h3', 'closing-title', [config['closing-title']]),
    config['closing-body'] && el('p', 'closing-body', [config['closing-body']]),
    config['closing-cta-label'] && el('div', 'button-row', [(() => {
      const link = el('a', 'button button-outline', [config['closing-cta-label']]);
      link.href = config['closing-cta-href'] || '#';
      return link;
    })()]),
  ]);

  let closingFigure = null;
  if (config['closing-image']) {
    const image = el('img', 'closing-image');
    image.src = config['closing-image'];
    image.alt = config['closing-image-alt'] || '';
    image.loading = 'lazy';
    image.decoding = 'async';
    /* The asset's intrinsic size, so the box is reserved before it lands. */
    image.width = 355;
    image.height = 640;
    closingFigure = el('figure', 'closing-figure', [image]);
  }

  const closing = el('div', 'closing-panel', [closingFigure, closingCopy]);

  const section = el('section', 'blade-configure', [
    el('div', 'shell', [
      heading,
      builds.length && grid,
      assurances.length && assureRail,
      config['price-note'] && el('p', 'price-note', [config['price-note']]),
      closing,
    ]),
  ]);
  if (config['anchor-id']) section.id = config['anchor-id'];

  block.replaceChildren(section);
  revealOnScroll([heading, grid, assureRail, closing].filter(Boolean));
}
