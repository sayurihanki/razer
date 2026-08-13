/**
 * Razer Blade 18 hero — the cinematic opening of the product page.
 *
 * The Blade is a black machine whose only expression is light: the Chroma
 * keyboard, the panel, the logo. So the hero is built out of light rather than
 * photography — an aurora field, a perspective floor, and the machine itself
 * drawn as vector art with a live Chroma keyboard and a running wave on the
 * panel.
 *
 * Drawing it rather than shooting it is also the honest answer to what this
 * repository actually ships: /images/blade-18.webp is a 355px card crop, which
 * would be a blurred smear at hero scale. Vector art is crisp at every size,
 * costs no image download on the LCP path, and can animate the two things the
 * product is sold on. The photograph still appears further down the page, at
 * the size it was cut for.
 *
 * Table contract (5 columns, typed rows; column 1 is the row type):
 *   setting | <key>  | <value>
 *   chip    | <key>  | <label> | <value>
 *   cta     | <key>  | <label> | <href>  | <variant>
 *
 * See scripts/razer-authoring.js for the merge semantics the whole
 * razer-blade18-* family shares.
 */

import {
  el, escapeMarkup, mergeList, mergeSettings, parseTable, revealOnScroll,
} from '../../scripts/razer-authoring.js';

export const DEFAULT_SETTINGS = {
  eyebrow: 'Gaming Laptops — Flagship',
  title: 'Razer Blade 18',
  tagline: 'Desktop power, folded flat.',
  body: 'A GeForce RTX 5090 at up to 175W and an 18-inch panel that switches from UHD+ colour work to 440Hz competition — in a CNC-milled aluminium unibody.',
  'scroll-label': 'Scroll to explore',
  'scroll-href': '#dual-mode',
  'screen-alt': 'Razer Blade 18 open on a desk, its Chroma keyboard and display lit',
  wordmark: 'RAZER',
};

export const DEFAULT_CHIPS = [
  { key: 'chip-01', label: 'Graphics', value: 'GeForce RTX 5090' },
  { key: 'chip-02', label: 'Processor', value: 'Intel Core Ultra 9 275HX' },
  { key: 'chip-03', label: 'Display', value: '18" UHD+ 240Hz / FHD+ 440Hz' },
  { key: 'chip-04', label: 'Graphics power', value: 'Up to 175W TGP' },
];

export const DEFAULT_CTAS = [
  {
    key: 'cta-01',
    label: 'Configure & buy',
    href: '#configure',
    variant: 'primary',
  },
  {
    key: 'cta-02',
    label: 'See the dual-mode display',
    href: '#dual-mode',
    variant: 'outline',
  },
];

/* ── The machine ────────────────────────────────────────────────── */

/*
 * Geometry, in the 1000×660 user space the viewBox sets up. Named rather than
 * inlined because the lid, hinge, deck and keyboard all have to agree: move the
 * hinge and four other shapes follow it.
 */
const LID = {
  x: 155, y: 24, w: 690, h: 452, r: 10,
};
const SCREEN = {
  x: 170, y: 38, w: 660, h: 412,
};
const HINGE_Y = 476;
const DECK = {
  top: 486, bottom: 596, topInset: 155, bottomInset: 75,
};

/* Key weights per row, so the widths read as a real keyboard rather than a
   uniform grid: a long left shift, a wide return, one bar across the bottom. */
const KEY_ROWS = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1.4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.6],
  [1.6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.4],
  [1.8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  [2.3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.6],
  [1.2, 1.2, 1.2, 6.4, 1.2, 1.2, 1.2, 1.2],
];

/* The wave on the panel. Five ribbons that overshoot the screen on both sides,
   so the drift never reveals an end. */
const RIBBONS = [
  { d: 'M60 300C240 168 372 392 520 252 668 112 800 292 940 196', w: 3.4, tone: 'a' },
  { d: 'M60 344C220 236 396 428 548 306 700 184 812 340 940 262', w: 2.6, tone: 'b' },
  { d: 'M60 250C264 336 348 148 512 232 676 316 764 176 940 244', w: 2.2, tone: 'c' },
  { d: 'M60 372C232 308 372 204 548 358 704 494 816 262 940 308', w: 1.8, tone: 'd' },
  { d: 'M60 214C216 108 428 300 576 186 716 78 828 226 940 160', w: 1.4, tone: 'e' },
];

/**
 * Interpolates the deck's left and right edge at a given depth.
 *
 * The deck is a trapezoid — narrow at the hinge, wide at the front lip — so
 * every row of keys sits between a different pair of edges. This returns that
 * pair, which is what gives the keyboard its perspective.
 *
 * @param {number} y Vertical position in user space
 * @returns {{left: number, right: number}} The deck edges at that depth
 */
function deckEdges(y) {
  const t = (y - DECK.top) / (DECK.bottom - DECK.top);
  const spread = (DECK.topInset - DECK.bottomInset) * t;
  return { left: DECK.topInset - spread, right: 1000 - DECK.topInset + spread };
}

/**
 * Lays out the Chroma keyboard.
 *
 * Each key carries `--k`, its position along a single diagonal running from the
 * top-left key to the bottom-right one. The stylesheet turns that into an
 * animation-delay, so one colour wave travels the whole deck instead of every
 * key cycling in lockstep.
 *
 * @returns {string} The `<rect>` markup for every key
 */
function keyboardMarkup() {
  const top = 498;
  const bottom = 558;
  const rowHeight = (bottom - top) / KEY_ROWS.length;
  const inset = 78;
  const gap = 3;

  return KEY_ROWS.map((weights, row) => {
    const y = top + row * rowHeight;
    const edges = deckEdges(y + rowHeight / 2);
    const left = edges.left + inset;
    const width = (edges.right - inset) - left;
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    const unit = (width - gap * (weights.length - 1)) / total;

    let x = left;
    return weights.map((weight, column) => {
      const keyWidth = unit * weight;
      const rect = `<rect class="b18-key" x="${x.toFixed(1)}" y="${(y + 1).toFixed(1)}" width="${keyWidth.toFixed(1)}" height="${(rowHeight - 2.4).toFixed(1)}" rx="1.6" style="--k:${row * 2 + column}"/>`;
      x += keyWidth + gap;
      return rect;
    }).join('');
  }).join('');
}

/**
 * Draws the Blade 18 as vector art.
 *
 * @param {object} config The merged settings
 * @returns {string} The SVG markup
 */
function machineMarkup(config) {
  const deckPath = `M${DECK.topInset} ${DECK.top}H${1000 - DECK.topInset}L${1000 - DECK.bottomInset} ${DECK.bottom}H${DECK.bottomInset}Z`;
  const chinY = SCREEN.y + SCREEN.h;

  return `
    <svg class="b18-machine" viewBox="0 0 1000 660" role="img" aria-label="${escapeMarkup(config['screen-alt'])}" focusable="false">
      <defs>
        <linearGradient id="b18-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#26262a"/>
          <stop offset="0.5" stop-color="#141417"/>
          <stop offset="1" stop-color="#0a0a0c"/>
        </linearGradient>
        <linearGradient id="b18-deck" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#202024"/>
          <stop offset="1" stop-color="#0b0b0d"/>
        </linearGradient>
        <linearGradient id="b18-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#fff" stop-opacity="0.02"/>
          <stop offset="0.5" stop-color="#fff" stop-opacity="0.3"/>
          <stop offset="1" stop-color="#fff" stop-opacity="0.02"/>
        </linearGradient>
        <linearGradient id="b18-glass" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stop-color="#0d1a12"/>
          <stop offset="1" stop-color="#05070a"/>
        </linearGradient>
        <linearGradient id="b18-sheen" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stop-color="#fff" stop-opacity="0.08"/>
          <stop offset="0.45" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <radialGradient id="b18-bloom" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stop-color="#44d62c" stop-opacity="0.5"/>
          <stop offset="0.55" stop-color="#1c8f3d" stop-opacity="0.16"/>
          <stop offset="1" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="b18-pool" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stop-color="#44d62c" stop-opacity="0.34"/>
          <stop offset="1" stop-color="#44d62c" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="b18-a" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#0affa0"/><stop offset="0.5" stop-color="#44d62c"/><stop offset="1" stop-color="#d9ff45"/>
        </linearGradient>
        <linearGradient id="b18-b" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#00e0ff"/><stop offset="0.6" stop-color="#0affa0"/><stop offset="1" stop-color="#44d62c"/>
        </linearGradient>
        <linearGradient id="b18-c" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#44d62c"/><stop offset="0.5" stop-color="#ffe066"/><stop offset="1" stop-color="#0affa0"/>
        </linearGradient>
        <linearGradient id="b18-d" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#0080ff"/><stop offset="0.7" stop-color="#00e0ff"/><stop offset="1" stop-color="#0affa0"/>
        </linearGradient>
        <linearGradient id="b18-e" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#d9ff45"/><stop offset="0.6" stop-color="#44d62c"/><stop offset="1" stop-color="#00e0ff"/>
        </linearGradient>
        <filter id="b18-soft" x="-40%" y="-60%" width="180%" height="220%">
          <feGaussianBlur stdDeviation="9"/>
        </filter>
        <clipPath id="b18-screen">
          <rect x="${SCREEN.x}" y="${SCREEN.y}" width="${SCREEN.w}" height="${SCREEN.h}" rx="3"/>
        </clipPath>
      </defs>

      <ellipse class="b18-bloom" cx="500" cy="300" rx="470" ry="290" fill="url(#b18-bloom)"/>

      <g class="b18-lid">
        <rect x="${LID.x}" y="${LID.y}" width="${LID.w}" height="${LID.h}" rx="${LID.r}" fill="url(#b18-lid)"/>
        <rect x="${LID.x}" y="${LID.y}" width="${LID.w}" height="${LID.h}" rx="${LID.r}" fill="none" stroke="url(#b18-edge)" stroke-width="1.2"/>

        <rect x="${SCREEN.x}" y="${SCREEN.y}" width="${SCREEN.w}" height="${SCREEN.h}" rx="3" fill="url(#b18-glass)"/>
        <g clip-path="url(#b18-screen)">
          <g class="b18-wave">
            ${RIBBONS.map((ribbon) => `<path class="b18-ribbon b18-ribbon-${ribbon.tone}" d="${ribbon.d}" fill="none" stroke="url(#b18-${ribbon.tone})" stroke-width="${ribbon.w * 3}" stroke-linecap="round" filter="url(#b18-soft)" opacity="0.55"/>`).join('')}
            ${RIBBONS.map((ribbon) => `<path class="b18-ribbon b18-ribbon-${ribbon.tone}" d="${ribbon.d}" fill="none" stroke="url(#b18-${ribbon.tone})" stroke-width="${ribbon.w}" stroke-linecap="round"/>`).join('')}
          </g>
          <image class="b18-mark" href="/images/razer-logo.svg" x="452" y="196" width="96" height="96" opacity="0.96"/>
          <rect x="${SCREEN.x}" y="${SCREEN.y}" width="${SCREEN.w}" height="${SCREEN.h}" fill="url(#b18-sheen)"/>
        </g>
        <rect x="${SCREEN.x}" y="${SCREEN.y}" width="${SCREEN.w}" height="${SCREEN.h}" rx="3" fill="none" stroke="#000" stroke-opacity="0.7"/>

        <circle cx="500" cy="31" r="2" fill="#2c2c30"/>
        <text class="b18-wordmark" x="500" y="${chinY + 18}" text-anchor="middle">${escapeMarkup(config.wordmark)}</text>
      </g>

      <rect x="195" y="${HINGE_Y}" width="610" height="10" rx="3" fill="#0d0d0f"/>
      <rect x="195" y="${HINGE_Y}" width="610" height="2" fill="#fff" fill-opacity="0.06"/>

      <g class="b18-base">
        <path d="${deckPath}" fill="url(#b18-deck)"/>
        <path d="M${DECK.topInset} ${DECK.top}H${1000 - DECK.topInset}" stroke="url(#b18-edge)" stroke-width="1.2" fill="none"/>
        <g class="b18-keys">${keyboardMarkup()}</g>
        <path d="M420 564H580L590 588H410Z" fill="#141418" stroke="#2a2a30" stroke-width="0.8"/>
        <path d="M${DECK.bottomInset} ${DECK.bottom}H${1000 - DECK.bottomInset}L${1000 - DECK.bottomInset - 6} ${DECK.bottom + 11}H${DECK.bottomInset + 6}Z" fill="#0a0a0c"/>
        <path d="M${DECK.bottomInset} ${DECK.bottom}H${1000 - DECK.bottomInset}" stroke="url(#b18-edge)" stroke-width="1" fill="none"/>
      </g>

      <ellipse class="b18-pool" cx="500" cy="614" rx="430" ry="30" fill="url(#b18-pool)"/>
    </svg>`;
}

/* ── Render ─────────────────────────────────────────────────────── */

/**
 * Follows the pointer with the machine, by a few pixels.
 *
 * Enough to make the hero feel like a lit stage rather than a flat image, and
 * little enough that nobody notices it as an effect. Skipped for coarse
 * pointers, where there is no hover to track, and for reduced motion.
 *
 * @param {Element} scene The element the pointer is tracked across
 * @param {Element} stage The element that moves
 */
function trackPointer(scene, stage) {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (still || coarse) return;

  let frame = 0;
  scene.addEventListener('pointermove', (event) => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const box = scene.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      stage.style.setProperty('--tilt-x', `${(-y * 2.4).toFixed(2)}deg`);
      stage.style.setProperty('--tilt-y', `${(x * 3.6).toFixed(2)}deg`);
      stage.style.setProperty('--shift', `${(x * 14).toFixed(1)}px`);
    });
  });

  scene.addEventListener('pointerleave', () => {
    stage.style.removeProperty('--tilt-x');
    stage.style.removeProperty('--tilt-y');
    stage.style.removeProperty('--shift');
  });
}

/**
 * loads and decorates the block
 *
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const parsed = parseTable(block, ['chip', 'cta']);
  const config = mergeSettings(parsed, DEFAULT_SETTINGS);
  const chips = mergeList(parsed, 'chip', DEFAULT_CHIPS, ['label', 'value'], { required: 'value' });
  const ctas = mergeList(parsed, 'cta', DEFAULT_CTAS, ['label', 'href', 'variant']);

  const copy = el('div', 'hero-copy');
  if (config.eyebrow) copy.append(el('p', 'eyebrow', [config.eyebrow]));
  if (config.title) copy.append(el('h1', 'hero-title', [config.title]));
  if (config.tagline) copy.append(el('p', 'hero-tagline', [config.tagline]));
  if (config.body) copy.append(el('p', 'hero-body', [config.body]));

  if (ctas.length) {
    const row = el('div', 'button-row');
    ctas.forEach((cta) => {
      const link = el('a', `button button-${cta.variant || 'outline'}`, [cta.label]);
      link.href = cta.href || '#';
      row.append(link);
    });
    copy.append(row);
  }

  const stage = el('div', 'hero-stage');
  stage.innerHTML = machineMarkup(config);

  const scene = el('div', 'hero-scene', [
    el('span', 'scene-numeral', ['18']),
    stage,
  ]);
  scene.querySelector('.scene-numeral').setAttribute('aria-hidden', 'true');

  const inner = el('div', 'shell hero-inner', [copy, scene]);

  const atmosphere = el('div', 'hero-atmosphere', [
    el('span', 'atmosphere-aurora'),
    el('span', 'atmosphere-grid'),
  ]);
  atmosphere.setAttribute('aria-hidden', 'true');

  const marquee = el('ul', 'hero-marquee');
  chips.forEach((chip) => {
    marquee.append(el('li', 'marquee-chip', [
      el('span', 'chip-label', [chip.label]),
      el('span', 'chip-value', [chip.value]),
    ]));
  });

  const rail = el('div', 'hero-rail', [
    el('div', 'shell', [marquee]),
  ]);

  const section = el('section', 'blade-hero', [atmosphere, inner, chips.length && rail]);

  if (config['scroll-label'] && config['scroll-href']) {
    const cue = el('a', 'hero-cue', [
      el('span', 'cue-text', [config['scroll-label']]),
      el('span', 'cue-line'),
    ]);
    cue.href = config['scroll-href'];
    cue.querySelector('.cue-line').setAttribute('aria-hidden', 'true');
    inner.append(cue);
  }

  block.replaceChildren(section);

  revealOnScroll([copy, scene, rail].filter(Boolean));
  trackPointer(scene, stage);
}
