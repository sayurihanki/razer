/**
 * Razer Blade 18 dual-mode display — the page's one interactive argument.
 *
 * The Blade 18's headline feature is a panel that runs two ways: UHD+ at 240Hz
 * for colour work, FHD+ at 440Hz for competition. That is a hard thing to sell
 * in prose and an easy thing to show, so this block shows it. Switching mode
 * re-renders a live canvas, rolls the numbers, and swaps the argument — the
 * visitor operates the feature rather than reading about it.
 *
 * What the canvas draws is a simulation, and says so in the caption. A browser
 * cannot paint at 440Hz, and the honest physical difference in sample-and-hold
 * persistence between the two modes (speed÷refresh, so roughly 3.7px against
 * 2.0px at a realistic pan rate) is too small to see on any screen this page
 * will load on. So the two things that ARE legible get drawn to scale relative
 * to each other: the pixel pitch, which really is 2× finer in UHD+, and the
 * scene pace, which is what each mode is chosen for. Nothing here is presented
 * as a measurement.
 *
 * Table contract (8 columns, typed rows; column 1 is the row type):
 *   setting | <key> | <value>
 *   mode    | <key> | <label> | <badge> | <resolution> | <refresh> | <headline> | <body>
 *   spec    | <key> | <label> | <value>
 *
 * See scripts/razer-authoring.js for the merge semantics.
 */

import {
  countTo, el, mergeList, mergeSettings, parseTable, revealOnScroll,
} from '../../scripts/razer-authoring.js';

export const DEFAULT_SETTINGS = {
  'anchor-id': 'dual-mode',
  eyebrow: 'The display',
  heading: 'One panel. Two machines.',
  body: 'Dual Mode switches the 18-inch panel between an ultra-sharp UHD+ desktop at 240Hz and a competition-grade FHD+ surface at 440Hz. Same screen, two entirely different jobs.',
  'switch-label': 'Choose a display mode',
  caption: 'Simulated for illustration: the pixel lattice is drawn at the two modes’ true 2:1 ratio, and motion persistence is exaggerated so the difference is visible on the screen you are reading this on.',
  'pitch-label': 'Pixel pitch',
  'stat-resolution': 'Resolution',
  'stat-refresh': 'Refresh rate',
  'stat-pixels': 'Pixels on screen',
};

export const DEFAULT_MODES = [
  {
    key: 'mode-01',
    label: 'Create',
    badge: 'UHD+',
    resolution: '3840 × 2400',
    refresh: '240',
    headline: 'Every pixel, in every colour.',
    body: 'Nine and a half million pixels across 18 inches, at 100% DCI-P3 and Calman-verified out of the box. Grade a timeline, model an asset, and read a full-width edit without zooming.',
  },
  {
    key: 'mode-02',
    label: 'Compete',
    badge: 'FHD+',
    resolution: '1920 × 1200',
    refresh: '440',
    headline: 'The frame you needed, sooner.',
    body: 'Drop to FHD+ and the panel runs at 440Hz. Flick aim lands where you put it, tracking stays legible through a spray, and the GPU spends its whole budget on frames instead of pixels.',
  },
];

export const DEFAULT_SPECS = [
  { key: 'spec-01', label: 'Colour', value: '100% DCI-P3' },
  { key: 'spec-02', label: 'Brightness', value: '500 nits' },
  { key: 'spec-03', label: 'Calibration', value: 'Calman verified' },
  { key: 'spec-04', label: 'Sync', value: 'NVIDIA G-SYNC' },
];

/*
 * Per-mode drawing constants.
 *
 * `pitch` is the lattice cell in CSS pixels: 3 against 6, the same 2:1 the two
 * modes' linear pixel density really differs by. `hz` drives the marker's
 * persistence trail — long where the panel holds a frame longer. `palette` is
 * the mood: UHD+ gets the full DCI-P3 spread it is sold on, FHD+ the tighter,
 * faster cyan-green of a competition scene.
 */
const RENDER = {
  'mode-01': {
    pitch: 3,
    hz: 240,
    drift: 0.22,
    tint: [68, 214, 44],
    palette: [
      ['#0affa0', '#44d62c', '#d9ff45'],
      ['#00e0ff', '#0affa0', '#44d62c'],
      ['#ffd166', '#d9ff45', '#0affa0'],
      ['#ff5fa2', '#a06bff', '#00e0ff'],
      ['#44d62c', '#00e0ff', '#d9ff45'],
    ],
  },
  'mode-02': {
    pitch: 6,
    hz: 440,
    drift: 1,
    tint: [0, 224, 255],
    palette: [
      ['#00e0ff', '#0affa0', '#44d62c'],
      ['#0080ff', '#00e0ff', '#0affa0'],
      ['#44d62c', '#0affa0', '#00e0ff'],
      ['#00e0ff', '#44d62c', '#0affa0'],
      ['#0affa0', '#00e0ff', '#0080ff'],
    ],
  },
};

/* The marker crosses at the same rate in both modes on purpose: the only thing
   that changes is how far its trail smears, which is the whole argument. */
const MARKER_RATE = 0.34;
const RIBBON_COUNT = 5;

/**
 * Reads a "3840 × 2400" resolution into its two numbers.
 *
 * @param {string} value The authored resolution
 * @returns {number[]} [width, height], or [] when it does not parse
 */
function resolutionParts(value) {
  return (value.match(/\d+/g) || []).slice(0, 2).map(Number);
}

/**
 * Formats a pixel count the way a spec sheet would.
 *
 * @param {string} resolution The resolution string
 * @returns {string} e.g. "9.2 million", or '' when the resolution does not parse
 */
function pixelCount(resolution) {
  const [width, height] = resolutionParts(resolution);
  if (!width || !height) return '';
  return `${((width * height) / 1e6).toFixed(1)} million`;
}

/* ── The panel ──────────────────────────────────────────────────── */

/**
 * Runs the simulated panel.
 *
 * One canvas, redrawn per animation frame while it is on screen. Three things
 * are drawn, and each carries a different part of the argument:
 *
 *  - the ribbon field is the mood, and its palette is the colour claim: UHD+
 *    gets the full spread, FHD+ the tighter competition scene;
 *  - the marker is the motion claim. It crosses at the same rate in both modes
 *    and only its persistence trail changes, scaled by 240÷Hz — the shape of
 *    real sample-and-hold blur, exaggerated so it is visible at all;
 *  - the lattice is the resolution claim, and the one element drawn honestly:
 *    3px against 6px, the modes' true 2:1 linear density.
 *
 * @param {HTMLCanvasElement} canvas The canvas to drive
 * @returns {{setMode: Function, stop: Function}} Controls for the caller
 */
function createPanel(canvas) {
  const context = canvas.getContext('2d');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Fixed per-ribbon character, so the field has a shape that stays put across
     mode switches instead of reshuffling under the visitor. */
  const ribbons = Array.from({ length: RIBBON_COUNT }, (_, index) => ({
    base: 0.22 + (index * 0.14),
    amp: 0.1 + ((index % 3) * 0.045),
    freq: 1.5 + (index * 0.42),
    phase: index * 1.27,
    speed: 0.5 + ((index % 4) * 0.22),
    weight: 3.2 - (index * 0.42),
  }));

  let render = RENDER['mode-01'];
  let width = 0;
  let height = 0;
  let frame = 0;
  let last = 0;
  let clock = 0;
  let running = false;

  function resize() {
    const box = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.round(box.width));
    height = Math.max(1, Math.round(box.height));
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawRibbon(ribbon, colours, alpha, weight) {
    const gradient = context.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, colours[0]);
    gradient.addColorStop(0.5, colours[1]);
    gradient.addColorStop(1, colours[2]);
    context.strokeStyle = gradient;
    context.globalAlpha = alpha;
    context.lineWidth = weight;
    context.lineCap = 'round';
    context.beginPath();
    for (let x = 0; x <= width; x += 6) {
      const t = x / width;
      const wobble = Math.sin((t * ribbon.freq * Math.PI * 2)
        + ribbon.phase + (clock * ribbon.speed * render.drift));
      const y = (ribbon.base + ribbon.amp * wobble) * height;
      if (x === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
    context.globalAlpha = 1;
  }

  function paint() {
    const [r, g, b] = render.tint;

    const sky = context.createLinearGradient(0, 0, width * 0.4, height);
    sky.addColorStop(0, '#070b0e');
    sky.addColorStop(0.6, '#05080b');
    sky.addColorStop(1, '#03050700');
    context.fillStyle = '#04070a';
    context.fillRect(0, 0, width, height);
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);

    const bloom = context.createRadialGradient(
      width * 0.5,
      height * 0.52,
      0,
      width * 0.5,
      height * 0.52,
      Math.max(width, height) * 0.62,
    );
    bloom.addColorStop(0, `rgba(${r},${g},${b},0.2)`);
    bloom.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = bloom;
    context.fillRect(0, 0, width, height);

    /* Each ribbon twice: a wide soft pass for the bloom, a thin bright pass
       for the line itself. Cheaper and steadier than a canvas blur filter. */
    context.lineJoin = 'round';
    ribbons.forEach((ribbon, index) => {
      const colours = render.palette[index % render.palette.length];
      drawRibbon(ribbon, colours, 0.16, ribbon.weight * 5);
      drawRibbon(ribbon, colours, 0.95, ribbon.weight);
    });

    /* The marker, and its trail. */
    const sweep = (clock * MARKER_RATE) % 1.2;
    const markerX = (sweep - 0.1) * width;
    const trail = width * 0.17 * (240 / render.hz);
    const smear = context.createLinearGradient(markerX - trail, 0, markerX, 0);
    smear.addColorStop(0, 'rgba(255,255,255,0)');
    smear.addColorStop(1, 'rgba(255,255,255,0.5)');
    context.fillStyle = smear;
    context.fillRect(markerX - trail, height * 0.12, trail, height * 0.76);
    context.fillStyle = 'rgba(255,255,255,0.95)';
    context.fillRect(markerX - 2, height * 0.12, 2.5, height * 0.76);

    /* The lattice, last, so everything above it reads as pixels. */
    const { pitch } = render;
    context.strokeStyle = 'rgba(0,0,0,0.5)';
    context.lineWidth = 1;
    context.beginPath();
    for (let x = 0; x <= width; x += pitch) {
      context.moveTo(x + 0.5, 0);
      context.lineTo(x + 0.5, height);
    }
    for (let y = 0; y <= height; y += pitch) {
      context.moveTo(0, y + 0.5);
      context.lineTo(width, y + 0.5);
    }
    context.stroke();
  }

  function step(now) {
    if (!running) return;
    if (last) clock += Math.min((now - last) / 1000, 0.05);
    last = now;
    paint();
    frame = requestAnimationFrame(step);
  }

  function start() {
    if (running || still) return;
    running = true;
    last = 0;
    frame = requestAnimationFrame(step);
  }

  function stop() {
    running = false;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  resize();
  paint();

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      resize();
      paint();
    }).observe(canvas);
  }

  /* Only burn frames while the panel is actually on screen, and stop when the
     tab is backgrounded — an animated canvas nobody is looking at is a battery
     bill with no upside. */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
    }, { threshold: 0.08 }).observe(canvas);
  } else {
    start();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (canvas.isConnected) start();
  });

  return {
    setMode(key) {
      render = RENDER[key] || RENDER['mode-01'];
      paint();
      return render.pitch;
    },
    stop,
  };
}

/* ── Render ─────────────────────────────────────────────────────── */

/**
 * loads and decorates the block
 *
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const parsed = parseTable(block, ['mode', 'spec']);
  const config = mergeSettings(parsed, DEFAULT_SETTINGS);
  const modes = mergeList(parsed, 'mode', DEFAULT_MODES, [
    'label', 'badge', 'resolution', 'refresh', 'headline', 'body',
  ]);
  const specs = mergeList(parsed, 'spec', DEFAULT_SPECS, ['label', 'value'], { required: 'value' });

  if (!modes.length) {
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

  /* Tabs, because that is what this is: one panel showing one of two views.
     Roving tabindex and arrow keys come with the pattern. */
  const tablist = el('div', 'mode-switch');
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', config['switch-label']);

  const canvas = el('canvas', 'panel-canvas');
  const pitchValue = el('span', 'pitch-value');
  const pitchInset = el('div', 'panel-pitch', [
    el('span', 'pitch-grid'),
    el('span', 'pitch-text', [
      el('span', 'pitch-label', [config['pitch-label']]),
      pitchValue,
    ]),
  ]);
  pitchInset.querySelector('.pitch-grid').setAttribute('aria-hidden', 'true');
  const panelFrame = el('div', 'panel-frame', [canvas, config['pitch-label'] && pitchInset]);
  const panelView = el('div', 'panel-view', [
    panelFrame,
    config.caption && el('p', 'panel-caption', [config.caption]),
  ]);

  const readouts = [
    { id: 'resolution', label: config['stat-resolution'] },
    { id: 'refresh', label: config['stat-refresh'] },
    { id: 'pixels', label: config['stat-pixels'] },
  ].filter((readout) => readout.label);

  const readoutNodes = new Map();
  const statList = el('dl', 'panel-stats');
  readouts.forEach((readout) => {
    const value = el('dd', `stat-value stat-${readout.id}`);
    readoutNodes.set(readout.id, value);
    statList.append(el('dt', 'stat-label', [readout.label]), value);
  });

  const modeHeadline = el('p', 'mode-headline');
  const modeBody = el('p', 'mode-body');
  const modeBadge = el('span', 'mode-badge');

  const detail = el('div', 'panel-detail', [
    modeBadge,
    modeHeadline,
    modeBody,
    readouts.length && statList,
  ]);
  detail.setAttribute('role', 'tabpanel');
  detail.id = 'b18-dualmode-panel';
  detail.setAttribute('tabindex', '0');

  const specRail = el('ul', 'panel-specs');
  specs.forEach((spec) => {
    specRail.append(el('li', '', [
      el('span', 'spec-label', [spec.label]),
      el('span', 'spec-value', [spec.value]),
    ]));
  });

  const panel = createPanel(canvas);
  const tabs = [];

  /**
   * Moves the block to a mode.
   *
   * @param {number} index Index into `modes`
   * @param {boolean} [focus] Whether to move focus onto the chosen tab
   */
  function select(index, focus = false) {
    const mode = modes[index];
    tabs.forEach((tab, position) => {
      const active = position === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      tab.classList.toggle('is-active', active);
    });
    if (focus) tabs[index].focus();

    panelFrame.dataset.mode = mode.key;
    /* ×4 so the lattice is legible as a swatch; the 2:1 between modes, which
       is the part that means something, is preserved. */
    const pitch = panel.setMode(mode.key);
    pitchInset.style.setProperty('--pitch', `${pitch * 4}px`);
    pitchValue.textContent = mode.resolution;

    modeBadge.textContent = mode.badge;
    modeHeadline.textContent = mode.headline;
    modeBody.textContent = mode.body;

    if (readoutNodes.has('resolution')) {
      readoutNodes.get('resolution').textContent = mode.resolution;
    }
    if (readoutNodes.has('pixels')) {
      readoutNodes.get('pixels').textContent = pixelCount(mode.resolution);
    }
    if (readoutNodes.has('refresh')) {
      const node = readoutNodes.get('refresh');
      if (!node.firstElementChild) {
        node.replaceChildren(el('span', 'stat-number'), el('span', 'stat-unit', ['Hz']));
      }
      countTo(node.firstElementChild, Number.parseInt(mode.refresh, 10) || 0, { duration: 520 });
    }

    detail.setAttribute('aria-labelledby', tabs[index].id);
  }

  modes.forEach((mode, index) => {
    const tab = el('button', 'mode-tab', [
      el('span', 'tab-label', [mode.label]),
      el('span', 'tab-meta', [`${mode.badge} · ${mode.refresh}Hz`]),
    ]);
    tab.type = 'button';
    tab.id = `b18-dualmode-tab-${index + 1}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', detail.id);
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', (event) => {
      const step = {
        ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1,
      }[event.key];
      if (!step) return;
      event.preventDefault();
      select((index + step + modes.length) % modes.length, true);
    });
    tabs.push(tab);
    tablist.append(tab);
  });

  const layout = el('div', 'dualmode-layout', [panelView, detail]);

  const section = el('section', 'blade-dualmode', [
    el('div', 'shell', [
      heading,
      tablist,
      layout,
      specs.length && specRail,
    ]),
  ]);
  if (config['anchor-id']) section.id = config['anchor-id'];

  block.replaceChildren(section);
  select(0);
  revealOnScroll([heading, tablist, layout, specRail].filter(Boolean));
}
