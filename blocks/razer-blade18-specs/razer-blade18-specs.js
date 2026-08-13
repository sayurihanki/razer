/**
 * Razer Blade 18 technical specifications.
 *
 * The quiet section, deliberately. Everything above it argues; this one only
 * answers, so it is set as a reference document — grouped definition lists, a
 * sticky index beside them on desktop, and no motion beyond the one entrance
 * the rest of the page uses.
 *
 * Table contract (6 columns, typed rows; column 1 is the row type):
 *   setting | <key> | <value>
 *   group   | <key> | <label>
 *   spec    | <key> | <group> | <label> | <value>
 *
 * A spec whose `group` names no group falls into the first one, so a stray key
 * still renders rather than vanishing. See scripts/razer-authoring.js for the
 * merge semantics.
 */

import {
  el, mergeList, mergeSettings, parseTable, revealOnScroll,
} from '../../scripts/razer-authoring.js';

export const DEFAULT_SETTINGS = {
  'anchor-id': 'tech-specs',
  eyebrow: 'Technical specifications',
  heading: 'The whole sheet.',
  body: 'Every figure for the 2025 Razer Blade 18. Configurations vary by region and retailer.',
  'index-label': 'Jump to',
};

export const DEFAULT_GROUPS = [
  { key: 'group-01', label: 'Display' },
  { key: 'group-02', label: 'Graphics' },
  { key: 'group-03', label: 'Processor' },
  { key: 'group-04', label: 'Memory and storage' },
  { key: 'group-05', label: 'Connectivity' },
  { key: 'group-06', label: 'Audio and camera' },
  { key: 'group-07', label: 'Chassis' },
];

export const DEFAULT_SPECS = [
  {
    key: 'spec-01', group: 'group-01', label: 'Panel', value: '18" Dual Mode IPS, 16:10',
  },
  {
    key: 'spec-02', group: 'group-01', label: 'Modes', value: 'UHD+ 3840 × 2400 at 240Hz / FHD+ 1920 × 1200 at 440Hz',
  },
  {
    key: 'spec-03', group: 'group-01', label: 'Colour', value: '100% DCI-P3, Calman verified',
  },
  {
    key: 'spec-04', group: 'group-01', label: 'Brightness', value: '500 nits',
  },
  {
    key: 'spec-05', group: 'group-01', label: 'Sync', value: 'NVIDIA G-SYNC compatible',
  },
  {
    key: 'spec-06', group: 'group-02', label: 'GPU', value: 'Up to NVIDIA GeForce RTX 5090 Laptop GPU, 24GB GDDR7',
  },
  {
    key: 'spec-07', group: 'group-02', label: 'Other options', value: 'GeForce RTX 5080 (16GB) or RTX 5070 Ti (12GB)',
  },
  {
    key: 'spec-08', group: 'group-02', label: 'Graphics power', value: 'Up to 175W total graphics power',
  },
  {
    key: 'spec-09', group: 'group-03', label: 'CPU', value: 'Intel Core Ultra 9 275HX',
  },
  {
    key: 'spec-10', group: 'group-03', label: 'Cores', value: '24 cores, up to 5.4GHz',
  },
  {
    key: 'spec-11', group: 'group-04', label: 'Memory', value: 'Up to 32GB DDR5-5600, dual channel, two slots',
  },
  {
    key: 'spec-12', group: 'group-04', label: 'Storage', value: 'Two M.2 slots, up to 8TB PCIe Gen4',
  },
  {
    key: 'spec-13', group: 'group-05', label: 'Wireless', value: 'Wi-Fi 7 (802.11be), Bluetooth 5.4',
  },
  {
    key: 'spec-14', group: 'group-05', label: 'Ports', value: 'Thunderbolt 4, HDMI 2.1, USB-A, UHS-II SD card reader, 3.5mm combo',
  },
  {
    key: 'spec-15', group: 'group-05', label: 'Security', value: 'Kensington lock slot',
  },
  {
    key: 'spec-16', group: 'group-06', label: 'Audio', value: 'Six speakers with THX Spatial Audio',
  },
  {
    key: 'spec-17', group: 'group-06', label: 'Camera', value: '5MP IR camera, Windows Hello, privacy shutter',
  },
  {
    key: 'spec-18', group: 'group-07', label: 'Build', value: 'CNC-milled T6-grade aluminium unibody, anodised',
  },
  {
    key: 'spec-19', group: 'group-07', label: 'Dimensions', value: '21.99–27.94mm × 275.4mm × 399.96mm',
  },
  {
    key: 'spec-20', group: 'group-07', label: 'Keyboard', value: 'Per-key Razer Chroma RGB, 1.5mm travel, glass touchpad',
  },
];

/**
 * loads and decorates the block
 *
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const parsed = parseTable(block, ['group', 'spec']);
  const config = mergeSettings(parsed, DEFAULT_SETTINGS);
  const groups = mergeList(parsed, 'group', DEFAULT_GROUPS, ['label']);
  const specs = mergeList(parsed, 'spec', DEFAULT_SPECS, ['group', 'label', 'value'], {
    required: 'value',
  });

  if (!groups.length || !specs.length) {
    block.replaceChildren();
    return;
  }

  const heading = el('div', 'section-heading', [
    el('div', '', [
      config.eyebrow && el('p', 'eyebrow', [config.eyebrow]),
      config.heading && el('h2', '', [config.heading]),
    ]),
    config.body && el('p', '', [config.body]),
  ]);

  /* Bucket by group first, so a group that ends up empty — every one of its
     specs cleared by an author — never renders as a heading over nothing. */
  const buckets = new Map(groups.map((group) => [group.key, []]));
  specs.forEach((spec) => {
    const target = buckets.has(spec.group) ? spec.group : groups[0].key;
    buckets.get(target).push(spec);
  });

  const filled = groups.filter((group) => buckets.get(group.key).length);

  const index = el('nav', 'specs-index');
  index.setAttribute('aria-label', config['index-label'] || 'Specifications');
  const indexList = el('ul');
  filled.forEach((group) => {
    const anchor = el('a', '', [group.label]);
    anchor.href = `#b18-${group.key}`;
    indexList.append(el('li', '', [anchor]));
  });
  if (config['index-label']) index.append(el('p', 'index-label', [config['index-label']]));
  index.append(indexList);

  const table = el('div', 'specs-table');
  filled.forEach((group) => {
    const rows = el('dl', 'spec-rows');
    buckets.get(group.key).forEach((spec) => {
      rows.append(
        el('dt', '', [spec.label]),
        el('dd', '', [spec.value]),
      );
    });
    const groupNode = el('section', 'spec-group', [
      el('h3', 'group-title', [group.label]),
      rows,
    ]);
    groupNode.id = `b18-${group.key}`;
    table.append(groupNode);
  });

  const layout = el('div', 'specs-layout', [index, table]);

  const section = el('section', 'blade-specs', [
    el('div', 'shell', [heading, layout]),
  ]);
  if (config['anchor-id']) section.id = config['anchor-id'];

  block.replaceChildren(section);
  revealOnScroll([heading, layout]);
}
