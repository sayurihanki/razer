/**
 * Razer PDP Story block for EDS document authoring.
 *
 * The feature narrative of the Basilisk V3 Pro 35K product page,
 * modeled on razer.com's image-led PDP storytelling: a full-bleed
 * backdrop band with the "apex of immersion" heading, a static stat
 * rail, three alternating media sections (HyperScroll wheel, Chroma
 * RGB, programmable buttons) that put the product photography front
 * and center, and a pair of compact numeral tiles for the sensor and
 * wireless specs. All content is baked in, so a table containing only
 * the block name renders the complete experience. Authored rows
 * override or extend entries by stable key.
 *
 * Table contract (8 columns, typed rows; column 1 is the row type):
 * setting: setting | <key> | <value>
 * stat:    stat | key | value | suffix | label
 * feature: feature | key | index-label | numeral | title | body | image
 *          (a feature with an image renders as a media section; one
 *          without an image renders as a numeral tile. Author image
 *          cells as pictures to control alt text; plain paths fall
 *          back to the title.)
 *
 * Motion is limited to a single fade-up per section, disabled under
 * `prefers-reduced-motion`.
 *
 * The literal `__empty__` clears a preset value; an empty title on a
 * keyed row removes the preset entry.
 */

const CLEAR_TOKEN = '__empty__';

export const DEFAULT_SETTINGS = {
  kicker: 'Razer Basilisk V3 Pro 35K',
  heading: 'The apex of immersion and customization',
  body: 'Set your immersion to maximum with a wireless ergonomic RGB gaming mouse that’s more advanced and customizable than ever.',
  backdrop: '/images/razer-mice/pdp/basilisk-stats.webp',
  'backdrop-alt': '',
  'stats-label': 'Performance at a glance',
};

export const DEFAULT_STATS = [
  {
    key: 'stat-01', value: 35000, suffix: '', label: 'DPI on Focus Pro 35K Gen-2',
  },
  {
    key: 'stat-02', value: 140, suffix: '', label: 'Hours on HyperSpeed Wireless',
  },
  {
    key: 'stat-03', value: 11, suffix: '', label: 'Programmable buttons',
  },
  {
    key: 'stat-04', value: 90, suffix: 'M', label: 'Clicks on Optical Switches Gen-3',
  },
];

export const DEFAULT_FEATURES = [
  {
    key: 'feature-01',
    index: '01 · Scroll',
    numeral: '',
    title: 'Razer HyperScroll Tilt Wheel',
    body: 'Move between tactile cycling and smooth free-spinning modes, with Smart-Reel behavior configurable through Razer Synapse 4.',
    image: '/images/razer-mice/pdp/basilisk-angle.webp',
    imageAlt: 'Razer Basilisk V3 Pro 35K seen low across a desk, its scroll wheel and underglow lit',
  },
  {
    key: 'feature-02',
    index: '02 · Immersion',
    numeral: '',
    title: 'Razer Chroma RGB',
    body: 'Scroll wheel, logo, and multi-zone underglow lighting can be configured alongside compatible devices.',
    image: '/images/razer-mice/pdp/basilisk-top-chroma.webp',
    imageAlt: 'Top view of the Razer Basilisk V3 Pro 35K with its full 13-zone underglow active beside a keyboard',
  },
  {
    key: 'feature-03',
    index: '03 · Control',
    numeral: '',
    title: '11 programmable buttons',
    body: 'Every command within reach — remap all 11 buttons and double your inputs with Razer HyperShift through Razer Synapse 4.',
    image: '/images/razer-mice/pdp/basilisk-buttons.webp',
    imageAlt: 'Razer Basilisk V3 Pro 35K surrounded by eleven mapped game commands',
  },
  {
    key: 'feature-04',
    index: '04 · Precision',
    numeral: '35K',
    title: 'Focus Pro 35K Optical Sensor Gen-2',
    body: '35,000 DPI sensitivity and 70 G acceleration, paired with deep adjustment options for precise tracking.',
    image: '',
    imageAlt: '',
  },
  {
    key: 'feature-05',
    index: '05 · Wireless',
    numeral: '140H',
    title: 'Flexible, multi-mode connection',
    body: 'Use Razer HyperSpeed Wireless, Bluetooth, or a wired USB connection. Battery life reaches up to 140 hours on HyperSpeed Wireless.',
    image: '',
    imageAlt: '',
  },
];

const MEDIA_SIZE = { width: 1200, height: 800 };

/* ── Authoring helpers ─────────────────────────────────────────── */

function cellText(cell) {
  if (!cell) return '';
  return cell.innerText.trim();
}

function readImage(cell) {
  if (!cell) return { src: '', alt: '' };
  const image = cell.querySelector('img');
  if (image) {
    return { src: image.getAttribute('src') || '', alt: image.getAttribute('alt') || '' };
  }
  const anchor = cell.querySelector('a[href]');
  if (anchor) return { src: anchor.getAttribute('href') || '', alt: '' };
  return { src: cellText(cell), alt: '' };
}

function applyValue(authored, preset) {
  if (!authored) return preset;
  if (authored === CLEAR_TOKEN) return '';
  return authored;
}

function el(tag, className = '', children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  children.forEach((child) => {
    if (child) node.append(child);
  });
  return node;
}

function text(value) {
  return document.createTextNode(value);
}

/* ── Parse and merge ───────────────────────────────────────────── */

function parseRows(block) {
  const settings = new Map();
  const settingCells = new Map();
  const stats = new Map();
  const features = new Map();

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const type = cellText(cells[0]).toLowerCase();
    const key = cellText(cells[1]).toLowerCase();
    if (type === 'setting') {
      if (key) {
        settings.set(key, cellText(cells[2]));
        settingCells.set(key, cells[2]);
      }
      return;
    }
    if (!key) return;
    if (type === 'stat') stats.set(key, cells);
    if (type === 'feature') features.set(key, cells);
  });

  return {
    settings, settingCells, stats, features,
  };
}

function mergeContent(parsed) {
  const replace = (parsed.settings.get('content-mode') || 'merge').toLowerCase() === 'replace';

  const config = { ...DEFAULT_SETTINGS };
  if (replace) Object.keys(config).forEach((key) => { config[key] = ''; });
  Object.keys(DEFAULT_SETTINGS).forEach((key) => {
    const authored = key === 'backdrop'
      ? readImage(parsed.settingCells.get(key)).src
      : parsed.settings.get(key) || '';
    config[key] = applyValue(authored, config[key]);
  });

  const stats = new Map();
  if (!replace) DEFAULT_STATS.forEach((stat) => stats.set(stat.key, { ...stat }));
  parsed.stats.forEach((cells, key) => {
    const preset = stats.get(key) || {
      key, value: 0, suffix: '', label: '',
    };
    const rawValue = cellText(cells[2]);
    if (rawValue) {
      const parsedValue = Number.parseFloat(rawValue.replace(/[^0-9.]/g, ''));
      preset.value = Number.isNaN(parsedValue) ? preset.value : parsedValue;
    }
    preset.suffix = applyValue(cellText(cells[3]), preset.suffix);
    preset.label = applyValue(cellText(cells[4]), preset.label);
    if (!preset.label) {
      stats.delete(key);
      return;
    }
    stats.set(key, preset);
  });

  const features = new Map();
  if (!replace) DEFAULT_FEATURES.forEach((entry) => features.set(entry.key, { ...entry }));
  parsed.features.forEach((cells, key) => {
    const preset = features.get(key) || {
      key, index: '', numeral: '', title: '', body: '', image: '', imageAlt: '',
    };
    preset.index = applyValue(cellText(cells[2]), preset.index);
    preset.numeral = applyValue(cellText(cells[3]), preset.numeral);
    preset.title = applyValue(cellText(cells[4]), preset.title);
    preset.body = applyValue(cellText(cells[5]), preset.body);
    const image = readImage(cells[6]);
    preset.image = applyValue(image.src, preset.image);
    if (image.alt) preset.imageAlt = image.alt;
    if (!preset.title) {
      features.delete(key);
      return;
    }
    features.set(key, preset);
  });

  return {
    config,
    stats: [...stats.values()].sort((a, b) => a.key.localeCompare(b.key)),
    features: [...features.values()].sort((a, b) => a.key.localeCompare(b.key)),
  };
}

/* ── Render ────────────────────────────────────────────────────── */

function buildBand(config) {
  const band = el('div', 'story-band');
  if (config.backdrop) {
    const backdrop = el('img', 'band-backdrop');
    backdrop.src = config.backdrop;
    backdrop.alt = config['backdrop-alt'];
    backdrop.loading = 'lazy';
    backdrop.decoding = 'async';
    backdrop.width = 1600;
    backdrop.height = 1067;
    if (!config['backdrop-alt']) backdrop.setAttribute('role', 'presentation');
    band.append(backdrop);
  }
  const scrim = el('div', 'band-scrim');
  scrim.setAttribute('aria-hidden', 'true');
  band.append(scrim);

  const inner = el('div', 'band-inner shell');
  if (config.kicker) inner.append(el('p', 'story-kicker', [text(config.kicker)]));
  if (config.heading) inner.append(el('h2', 'story-heading', [text(config.heading)]));
  if (config.body) inner.append(el('p', 'story-body', [text(config.body)]));
  band.append(inner);
  return band;
}

function formatStat(value, suffix) {
  return `${Math.round(value).toLocaleString('en-US')}${suffix}`;
}

function buildStats(config, stats) {
  if (!stats.length) return null;
  const list = el('ul', 'story-stats shell');
  list.setAttribute('aria-label', config['stats-label']);
  stats.forEach((stat) => {
    list.append(el('li', '', [
      el('strong', '', [text(formatStat(stat.value, stat.suffix))]),
      el('span', '', [text(stat.label)]),
    ]));
  });
  return list;
}

function buildMediaFeature(entry) {
  const section = el('article', 'feature-media');
  section.dataset.reveal = '';

  const media = el('div', 'feature-media-frame');
  const img = el('img');
  img.src = entry.image;
  img.alt = entry.imageAlt || entry.title;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.width = MEDIA_SIZE.width;
  img.height = MEDIA_SIZE.height;
  media.append(img);

  const copy = el('div', 'feature-copy');
  if (entry.index) copy.append(el('p', 'card-index', [text(entry.index)]));
  copy.append(el('h3', '', [text(entry.title)]));
  if (entry.body) copy.append(el('p', 'feature-body', [text(entry.body)]));

  section.append(media, copy);
  return section;
}

function buildTileFeature(entry) {
  const tile = el('article', 'feature-tile');
  if (entry.index) tile.append(el('p', 'card-index', [text(entry.index)]));
  if (entry.numeral) tile.append(el('strong', 'tile-numeral', [text(entry.numeral)]));
  tile.append(el('h3', '', [text(entry.title)]));
  if (entry.body) tile.append(el('p', 'feature-body', [text(entry.body)]));
  return tile;
}

function buildFeatures(features) {
  if (!features.length) return null;
  const wrap = el('div', 'story-features shell');
  const tiles = el('div', 'feature-tiles');
  tiles.dataset.reveal = '';
  features.forEach((entry) => {
    if (entry.image) {
      wrap.append(buildMediaFeature(entry));
    } else {
      tiles.append(buildTileFeature(entry));
    }
  });
  if (tiles.children.length) wrap.append(tiles);
  return wrap;
}

/* ── Behavior ──────────────────────────────────────────────────── */

function initReveals(block) {
  const targets = block.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((target) => target.classList.add('is-inview'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-inview');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach((target) => observer.observe(target));
}

/* ── Decorate ──────────────────────────────────────────────────── */

/**
 * Loads and decorates the block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const content = mergeContent(parseRows(block));

  block.textContent = '';

  const story = el('section', 'pdp-story');
  story.append(buildBand(content.config));
  const stats = buildStats(content.config, content.stats);
  if (stats) story.append(stats);
  const features = buildFeatures(content.features);
  if (features) story.append(features);
  block.append(story);

  initReveals(block);
}
