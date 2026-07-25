/**
 * Razer PDP Story block for EDS document authoring.
 *
 * The cinematic narrative band of the Basilisk V3 Pro 35K product page:
 * a full-bleed backdrop render with parallax and gradient scrim, the
 * "apex of immersion" display heading, a count-up stat rail, and four
 * feature cards with animated visuals (HyperScroll ring, sensor
 * crosshair, wireless radar, Chroma chip) plus a pointer-tracked
 * spotlight. All content is baked in, so a table containing only the
 * block name renders the complete experience. Authored rows override
 * or extend entries by stable key.
 *
 * Table contract (7 columns, typed rows; column 1 is the row type):
 * setting: setting | <key> | <value>
 * stat:    stat | key | value | suffix | label
 * feature: feature | key | index-label | glyph | title | body | variant
 *          (variant: wheel | sensor | wireless | chroma)
 *
 * Count-ups and all ambient animation honor `prefers-reduced-motion`
 * and only run while the section is in view.
 *
 * The literal `__empty__` clears a preset value; an empty label/title
 * on a keyed row removes the preset entry.
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
    glyph: '∞',
    title: 'Razer HyperScroll Tilt Wheel',
    body: 'Move between tactile cycling and smooth free-spinning modes, with Smart-Reel behavior configurable through Razer Synapse 4.',
    variant: 'wheel',
  },
  {
    key: 'feature-02',
    index: '02 · Precision',
    glyph: '35K',
    title: 'Focus Pro 35K Optical Sensor Gen-2',
    body: '35,000 DPI sensitivity and 70 G acceleration, paired with deep adjustment options for precise tracking.',
    variant: 'sensor',
  },
  {
    key: 'feature-03',
    index: '03 · Wireless',
    glyph: '140H',
    title: 'Flexible, multi-mode connection',
    body: 'Use Razer HyperSpeed Wireless, Bluetooth, or a wired USB connection. Battery life reaches up to 140 hours on HyperSpeed Wireless.',
    variant: 'wireless',
  },
  {
    key: 'feature-04',
    index: '04 · Immersion',
    glyph: 'RGB',
    title: 'Razer Chroma RGB',
    body: 'Scroll wheel, logo, and multi-zone underglow lighting can be configured alongside compatible devices.',
    variant: 'chroma',
  },
];

const COUNT_MS = 1100;

/* ── Authoring helpers ─────────────────────────────────────────── */

function cellText(cell) {
  if (!cell) return '';
  return cell.innerText.trim();
}

function readImageSource(cell) {
  if (!cell) return '';
  const image = cell.querySelector('img');
  if (image) return image.getAttribute('src') || '';
  const anchor = cell.querySelector('a[href]');
  if (anchor) return anchor.getAttribute('href') || '';
  return cellText(cell);
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
      ? readImageSource(parsed.settingCells.get(key))
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
      key, index: '', glyph: '', title: '', body: '', variant: '',
    };
    preset.index = applyValue(cellText(cells[2]), preset.index);
    preset.glyph = applyValue(cellText(cells[3]), preset.glyph);
    preset.title = applyValue(cellText(cells[4]), preset.title);
    preset.body = applyValue(cellText(cells[5]), preset.body);
    preset.variant = applyValue(cellText(cells[6]).toLowerCase(), preset.variant);
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

function buildBand(config, refs) {
  const band = el('div', 'story-band');
  if (config.backdrop) {
    const backdrop = el('img', 'band-backdrop');
    backdrop.src = config.backdrop;
    backdrop.alt = config['backdrop-alt'];
    backdrop.loading = 'lazy';
    backdrop.width = 1600;
    backdrop.height = 1067;
    if (!config['backdrop-alt']) backdrop.setAttribute('role', 'presentation');
    band.append(backdrop);
    refs.backdrop = backdrop;
  }
  const scrim = el('div', 'band-scrim');
  scrim.setAttribute('aria-hidden', 'true');
  band.append(scrim);

  const inner = el('div', 'band-inner rzrm-shell');
  if (config.kicker) {
    const kicker = el('p', 'story-kicker', [text(config.kicker)]);
    kicker.dataset.reveal = '';
    inner.append(kicker);
  }
  if (config.heading) {
    const heading = el('h2', 'story-heading', [text(config.heading)]);
    heading.dataset.reveal = '';
    heading.style.setProperty('--reveal-i', '1');
    inner.append(heading);
  }
  if (config.body) {
    const body = el('p', 'story-body', [text(config.body)]);
    body.dataset.reveal = '';
    body.style.setProperty('--reveal-i', '2');
    inner.append(body);
  }
  band.append(inner);
  return band;
}

function formatStat(value, suffix) {
  const rounded = Math.round(value);
  return `${rounded.toLocaleString('en-US')}${suffix}`;
}

function buildStats(config, stats, refs) {
  if (!stats.length) return null;
  const list = el('ul', 'story-stats rzrm-shell');
  list.setAttribute('aria-label', config['stats-label']);
  refs.counters = stats.map((stat, index) => {
    const value = el('strong', '', [text(formatStat(0, stat.suffix))]);
    const item = el('li', '', [value, el('span', '', [text(stat.label)])]);
    item.dataset.reveal = '';
    item.style.setProperty('--reveal-i', String(index));
    list.append(item);
    return { stat, node: value };
  });
  return list;
}

function buildFeatureVisual(entry) {
  const visual = el('div', 'feature-visual');
  visual.setAttribute('aria-hidden', 'true');
  const ring = el('span', 'visual-ring');
  const glyph = el('strong', 'feature-glyph', [text(entry.glyph)]);
  visual.append(ring, glyph);
  return visual;
}

function buildFeatures(features) {
  if (!features.length) return null;
  const grid = el('div', 'story-features rzrm-shell');
  features.forEach((entry, index) => {
    const card = el('article', 'feature-card');
    if (entry.variant) card.dataset.variant = entry.variant;
    card.dataset.reveal = '';
    card.style.setProperty('--reveal-i', String(index));
    if (entry.index) card.append(el('span', 'card-index', [text(entry.index)]));
    if (entry.glyph) card.append(buildFeatureVisual(entry));
    card.append(el('h3', '', [text(entry.title)]));
    if (entry.body) card.append(el('p', '', [text(entry.body)]));
    grid.append(card);
  });
  return grid;
}

/* ── Behavior ──────────────────────────────────────────────────── */

function initCounters(refs, reduceMotion) {
  if (!refs.counters || !refs.counters.length) return;
  const finish = ({ stat, node }) => {
    node.textContent = formatStat(stat.value, stat.suffix);
  };
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    refs.counters.forEach(finish);
    return;
  }
  const run = (entry) => {
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - start) / COUNT_MS);
      const eased = 1 - (1 - progress) ** 3;
      entry.node.textContent = formatStat(entry.stat.value * eased, entry.stat.suffix);
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((observed) => {
      if (!observed.isIntersecting) return;
      const counter = refs.counters.find(({ node }) => node === observed.target);
      if (counter) run(counter);
      observer.unobserve(observed.target);
    });
  }, { threshold: 0.6 });
  refs.counters.forEach(({ node }) => observer.observe(node));
}

function initParallax(block, refs, reduceMotion) {
  if (!refs.backdrop) return;
  const finePointer = window.matchMedia('(pointer: fine)');
  if (reduceMotion.matches || !finePointer.matches) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    const bounds = refs.backdrop.parentElement.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    if (bounds.bottom < 0 || bounds.top > viewport) return;
    const progress = (bounds.top + bounds.height / 2 - viewport / 2) / viewport;
    refs.backdrop.style.transform = `translateY(${(progress * -36).toFixed(1)}px) scale(1.12)`;
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  update();
}

function initSpotlight(block) {
  const cards = block.querySelectorAll('.feature-card');
  cards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${(((event.clientX - bounds.left) / bounds.width) * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(((event.clientY - bounds.top) / bounds.height) * 100).toFixed(1)}%`);
    });
  });
}

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
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  targets.forEach((target) => observer.observe(target));
}

/* ── Decorate ──────────────────────────────────────────────────── */

/**
 * Loads and decorates the block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const content = mergeContent(parseRows(block));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const refs = {};

  block.textContent = '';

  const story = el('section', 'pdp-story');
  story.append(buildBand(content.config, refs));
  const stats = buildStats(content.config, content.stats, refs);
  if (stats) story.append(stats);
  const features = buildFeatures(content.features);
  if (features) story.append(features);
  block.append(story);

  initCounters(refs, reduceMotion);
  initParallax(block, refs, reduceMotion);
  initSpotlight(block);
  initReveals(block);
}
