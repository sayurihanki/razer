/**
 * Razer Blade 18 power and thermals.
 *
 * The performance argument, in three registers: a rail of numbers that count
 * up as it arrives, a technical drawing of the cooling stack that animates the
 * heat path, and a set of cards for the parts that do not need a diagram.
 *
 * The cooling schematic is the centrepiece and is drawn rather than
 * photographed for the same reason the hero machine is: nobody has a
 * photograph of the inside of this laptop, and the thing worth showing — where
 * the heat goes — is a diagram anyway. It is drawn in the register Razer uses
 * for engineering material: thin lines, one accent, no shading.
 *
 * Table contract (7 columns, typed rows; column 1 is the row type):
 *   setting | <key> | <value>
 *   stat    | <key> | <value> | <unit> | <label>
 *   flow    | <key> | <label>
 *   card    | <key> | <index> | <title> | <body> | <meta>
 *
 * See scripts/razer-authoring.js for the merge semantics.
 */

import {
  countTo, el, escapeMarkup, mergeList, mergeSettings, parseTable, revealOnScroll,
} from '../../scripts/razer-authoring.js';

export const DEFAULT_SETTINGS = {
  'anchor-id': 'performance',
  eyebrow: 'Performance',
  heading: 'Everything, at once.',
  body: 'A desktop-class GPU and a 24-core processor share one vapour chamber and three fans, so the Blade 18 holds its clocks instead of trading them away.',
  'thermal-eyebrow': 'Cooling',
  'thermal-title': 'One vapour chamber. Three fans.',
  'thermal-body': 'A full-width vapour chamber spreads heat off the CPU and GPU dies the moment it appears, then hands it to fin stacks at both flanks and the rear. Three fans pull cool air across the whole stack — which is how 175 watts fits inside a chassis this thin.',
  'flow-label': 'Heat path',
  'schematic-alt': 'Cutaway diagram of the Blade 18 cooling system: a vapour chamber over the CPU and GPU dies, heat pipes to three fin stacks, and three fans',
};

export const DEFAULT_STATS = [
  {
    key: 'stat-01', value: '175', unit: 'W', label: 'Maximum graphics power',
  },
  {
    key: 'stat-02', value: '24', unit: 'GB', label: 'GDDR7 on the RTX 5090',
  },
  {
    key: 'stat-03', value: '5.4', unit: 'GHz', label: 'Max turbo, Core Ultra 9',
  },
  {
    key: 'stat-04', value: '24', unit: '', label: 'Processor cores',
  },
];

export const DEFAULT_FLOW = [
  { key: 'flow-01', label: 'Dies' },
  { key: 'flow-02', label: 'Vapour chamber' },
  { key: 'flow-03', label: 'Heat pipes' },
  { key: 'flow-04', label: 'Fin stacks' },
  { key: 'flow-05', label: 'Exhaust' },
];

export const DEFAULT_CARDS = [
  {
    key: 'card-01',
    index: '01',
    title: 'GeForce RTX 5090 Laptop GPU',
    body: 'Blackwell architecture with 24GB of GDDR7 and DLSS 4 multi frame generation, running at up to 175W in the top configuration.',
    meta: 'Up to 175W TGP',
  },
  {
    key: 'card-02',
    index: '02',
    title: 'Intel Core Ultra 9 275HX',
    body: 'Twenty-four cores reaching 5.4GHz, with the headroom to keep a compile, a render and a capture running behind whatever is on screen.',
    meta: '24 cores · 5.4GHz',
  },
  {
    key: 'card-03',
    index: '03',
    title: 'Memory and storage you can open',
    body: 'Dual-channel DDR5 in two accessible slots, and two M.2 bays taking up to 8TB of Gen4 storage. The machine is not sealed against you.',
    meta: 'DDR5 · 2× M.2',
  },
  {
    key: 'card-04',
    index: '04',
    title: 'Per-key Razer Chroma RGB',
    body: 'Every key individually lit and individually addressable, with 1.5mm of travel and a precision glass touchpad below it.',
    meta: 'Chroma · 1.5mm travel',
  },
];

/* ── The schematic ──────────────────────────────────────────────── */

/* Fin stacks, as [x, y, blade-count, vertical] — both flanks and two rear
   banks, which is where the Blade 18 actually vents. */
const FINS = [
  [40, 196, 11, true],
  [200, 36, 20, false],
  [560, 36, 20, false],
  [828, 196, 11, true],
];

/* Each fan sits between the chamber and the fin stack it feeds, so the drawing
   reads left to right as die → chamber → pipe → fan → fins. */
const FANS = [
  { x: 130, y: 240 },
  { x: 450, y: 90 },
  { x: 780, y: 240 },
];

/* Drawn twice — once as pipe, once as the travelling heat dash on top — so the
   two can never disagree about where the heat goes. */
const PIPES = [
  'M300 240 C250 240 210 240 176 240',
  'M598 240 C650 240 690 240 734 240',
  'M330 205 C325 160 370 118 408 104',
  'M568 205 C573 160 530 118 492 104',
];

/**
 * Draws one fin stack.
 *
 * @param {number[]} fin The [x, y, count, vertical] tuple
 * @returns {string} The fin markup
 */
function finMarkup([x, y, count, vertical]) {
  return Array.from({ length: count }, (_, index) => {
    const offset = index * 8;
    return vertical
      ? `<line x1="${x}" y1="${y + offset}" x2="${x + 46}" y2="${y + offset}"/>`
      : `<line x1="${x + offset}" y1="${y}" x2="${x + offset}" y2="${y + 40}"/>`;
  }).join('');
}

/**
 * Draws one fan: a housing, a hub, and seven blades that turn.
 *
 * @param {{x: number, y: number}} fan The fan's centre
 * @param {number} index Its position in the row, used to stagger the spin
 * @returns {string} The fan markup
 */
function fanMarkup(fan, index) {
  const blades = Array.from({ length: 7 }, (_, blade) => {
    const angle = (blade / 7) * 360;
    return `<path d="M0 -6 C16 -14 30 -8 34 4 C22 -2 10 0 0 6Z" transform="rotate(${angle})"/>`;
  }).join('');
  return `
    <g class="b18-fan" transform="translate(${fan.x} ${fan.y})">
      <circle class="b18-fan-housing" r="46"/>
      <g class="b18-fan-rotor" style="--spin:${index}">${blades}</g>
      <circle class="b18-fan-hub" r="9"/>
    </g>`;
}

/**
 * Draws the cooling stack.
 *
 * @param {object} config The merged settings
 * @returns {string} The SVG markup
 */
function schematicMarkup(config) {
  return `
    <svg class="b18-schematic" viewBox="0 0 900 470" role="img" aria-label="${escapeMarkup(config['schematic-alt'])}" focusable="false">
      <defs>
        <linearGradient id="b18-chamber" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#44d62c" stop-opacity="0.16"/>
          <stop offset="1" stop-color="#00e0ff" stop-opacity="0.06"/>
        </linearGradient>
      </defs>

      <rect class="b18-chassis" x="18" y="18" width="864" height="434" rx="16"/>

      <g class="b18-fins">${FINS.map(finMarkup).join('')}</g>

      <rect class="b18-chamber" x="230" y="150" width="440" height="180" rx="12" fill="url(#b18-chamber)"/>
      <rect class="b18-chamber-edge" x="230" y="150" width="440" height="180" rx="12"/>

      <g class="b18-pipes">${PIPES.map((d) => `<path d="${d}"/>`).join('')}</g>

      <g class="b18-dies">
        <rect x="300" y="205" width="88" height="70" rx="5"/>
        <rect x="510" y="205" width="88" height="70" rx="5"/>
        <text class="b18-die-label" x="344" y="245">CPU</text>
        <text class="b18-die-label" x="554" y="245">GPU</text>
      </g>

      ${FANS.map(fanMarkup).join('')}

      <g class="b18-flow">${PIPES.map((d) => `<path d="${d}"/>`).join('')}</g>
    </svg>`;
}

/* ── Render ─────────────────────────────────────────────────────── */

/**
 * Counts the stat rail up the first time it is seen.
 *
 * @param {Element} rail The rail element
 * @param {object[]} stats The merged stats
 */
function animateStats(rail, stats) {
  const numbers = [...rail.querySelectorAll('.stat-number')];
  const run = () => numbers.forEach((node, index) => {
    const target = Number.parseFloat(stats[index].value);
    if (Number.isNaN(target)) return;
    const decimals = (stats[index].value.split('.')[1] || '').length;
    countTo(node, target, { duration: 1100, decimals });
  });

  if (!('IntersectionObserver' in window)) {
    run();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      run();
      observer.disconnect();
    });
  }, { threshold: 0.4 });
  observer.observe(rail);
}

/**
 * loads and decorates the block
 *
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const parsed = parseTable(block, ['stat', 'flow', 'card']);
  const config = mergeSettings(parsed, DEFAULT_SETTINGS);
  const stats = mergeList(parsed, 'stat', DEFAULT_STATS, ['value', 'unit', 'label']);
  const flow = mergeList(parsed, 'flow', DEFAULT_FLOW, ['label']);
  const cards = mergeList(parsed, 'card', DEFAULT_CARDS, ['index', 'title', 'body', 'meta'], {
    required: 'title',
  });

  const heading = el('div', 'section-heading', [
    el('div', '', [
      config.eyebrow && el('p', 'eyebrow', [config.eyebrow]),
      config.heading && el('h2', '', [config.heading]),
    ]),
    config.body && el('p', '', [config.body]),
  ]);

  /* Numbers start at zero and count, so the unit has to sit outside the node
     the counter writes into or it would be overwritten every frame. */
  const rail = el('ul', 'power-stats');
  stats.forEach((stat) => {
    rail.append(el('li', 'power-stat', [
      el('p', 'stat-figure', [
        el('span', 'stat-number', ['0']),
        stat.unit && el('span', 'stat-unit', [stat.unit]),
      ]),
      el('p', 'stat-label', [stat.label]),
    ]));
  });

  const drawing = el('div', 'thermal-drawing');
  drawing.innerHTML = schematicMarkup(config);

  const flowList = el('ol', 'thermal-flow');
  flow.forEach((step) => flowList.append(el('li', '', [step.label])));

  const thermalCopy = el('div', 'thermal-copy', [
    config['thermal-eyebrow'] && el('p', 'eyebrow', [config['thermal-eyebrow']]),
    config['thermal-title'] && el('h3', 'thermal-title', [config['thermal-title']]),
    config['thermal-body'] && el('p', 'thermal-body', [config['thermal-body']]),
    flow.length && el('div', 'flow-block', [
      config['flow-label'] && el('p', 'flow-label', [config['flow-label']]),
      flowList,
    ]),
  ]);

  const thermal = el('div', 'thermal-panel', [drawing, thermalCopy]);

  const cardGrid = el('ul', 'power-cards');
  cards.forEach((card) => {
    cardGrid.append(el('li', 'power-card', [
      card.index && el('span', 'card-index', [card.index]),
      el('h3', 'card-title', [card.title]),
      card.body && el('p', 'card-body', [card.body]),
      card.meta && el('p', 'card-meta', [card.meta]),
    ]));
  });

  const section = el('section', 'blade-power', [
    el('div', 'shell', [
      heading,
      stats.length && rail,
      thermal,
      cards.length && cardGrid,
    ]),
  ]);
  if (config['anchor-id']) section.id = config['anchor-id'];

  block.replaceChildren(section);

  if (stats.length) animateStats(rail, stats);
  revealOnScroll([heading, rail, thermal, cardGrid].filter(Boolean));
}
