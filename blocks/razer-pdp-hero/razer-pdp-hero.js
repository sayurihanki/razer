/**
 * Razer PDP Hero block for EDS document authoring.
 *
 * The commerce heart of the Basilisk V3 Pro 35K product detail page:
 * breadcrumbs, product masthead, a four-shot gallery with crossfade,
 * swipe, and keyboard navigation, and the three-step guided
 * configurator (finish, model, RazerCare) with a live running total,
 * followed by the RazerStore services strip. Styling stays close to
 * razer.com: flat dark surfaces, green accents, and motion limited to
 * the crossfade and the price roll. All content is baked in, so a
 * table containing only the block name renders the complete
 * experience. Authored rows override or extend entries by stable key.
 *
 * Table contract (6 columns, typed rows; column 1 is the row type):
 * setting: setting | <key> | <value>
 * crumb:   crumb | key | label | href (empty href marks current page)
 * image:   image | key | src | alt | caption
 * keyspec: keyspec | key | text
 * finish:  finish | key | label | delta | swatch
 *          (swatch: black | white | phantom-green | phantom-white)
 * model:   model | key | label | note | delta
 * care:    care | key | label | note | delta
 * service: service | key | glyph | title | body
 *
 * Motion honors `prefers-reduced-motion`: the crossfade and the price
 * tween both collapse to instant states.
 *
 * The literal `__empty__` clears a preset value; an empty label on a
 * keyed row removes the preset entry.
 */

const CLEAR_TOKEN = '__empty__';

export const DEFAULT_SETTINGS = {
  'breadcrumb-label': 'Breadcrumb',
  title: 'Razer Basilisk V3 Pro 35K',
  subtitle: 'Fully Customizable Wireless Ergonomic RGB Gaming Mouse',
  'subtitle-link-label': 'Learn more >',
  'subtitle-link-href': 'https://www.razer.com/gaming-mice/razer-basilisk-v3-pro-35k',
  'gallery-label': 'Product gallery and configuration',
  'prev-label': 'Previous product image',
  'next-label': 'Next product image',
  'thumbs-label': 'Product images',
  'specs-link-label': 'View all specifications',
  'specs-link-href': '#tech-specs',
  'config-eyebrow': 'Guided configuration',
  'config-title': 'Configure yours',
  'config-body': 'Choose a finish, model, and protection option. The price below reflects the selections shown; Razer.com confirms live availability and checkout.',
  'finish-legend': 'Color / Design',
  'model-legend': 'Model',
  'care-legend': 'Add RazerCare protection',
  'care-help-label': 'Check out the coverage at a glance',
  'care-help-href': 'https://www.razer.com/razercare',
  'summary-label': 'Your configuration',
  'price-label': 'Configured total',
  'price-note': 'Before shipping and tax',
  'currency-prefix': 'US$',
  'base-price': '159.99',
  'cta-label': 'Continue on Razer.com',
  'cta-href': 'https://www.razer.com/gaming-mice/razer-basilisk-v3-pro-35k/RZ01-05240100-R3U1',
  'availability-note': 'Live inventory, regional pricing, pickup, and purchasing are confirmed on Razer.com.',
  'services-label': 'RazerStore services',
};

export const DEFAULT_CRUMBS = [
  { key: 'crumb-01', label: 'Home', href: '/' },
  { key: 'crumb-02', label: 'Gaming Mice', href: '/pc/gaming-mice' },
  { key: 'crumb-03', label: 'Basilisk V3 Pro 35K', href: 'https://www.razer.com/gaming-mice/razer-basilisk-v3-pro-35k' },
  { key: 'crumb-04', label: 'Black', href: '' },
];

export const DEFAULT_IMAGES = [
  {
    key: 'image-01',
    src: '/images/razer-mice/products/basilisk-v3-pro-35k.webp',
    alt: 'Razer Basilisk V3 Pro 35K in black, three-quarter studio view',
    caption: 'Razer Basilisk V3 Pro 35K in black, studio view',
  },
  {
    key: 'image-02',
    src: '/images/razer-mice/pdp/basilisk-angle.webp',
    alt: 'Razer Basilisk V3 Pro 35K low angle with Chroma underglow on a dark desk',
    caption: 'Multi-zone Chroma underglow, seen low across the desk',
  },
  {
    key: 'image-03',
    src: '/images/razer-mice/pdp/basilisk-top-chroma.webp',
    alt: 'Top view of the Razer Basilisk V3 Pro 35K with full rainbow underglow beside a keyboard',
    caption: 'Top view with the full 13-zone lighting ring active',
  },
  {
    key: 'image-04',
    src: '/images/razer-mice/pdp/basilisk-buttons.webp',
    alt: 'Razer Basilisk V3 Pro 35K surrounded by eleven mapped game commands',
    caption: '11 programmable buttons, mapped your way',
  },
];

export const DEFAULT_KEYSPECS = [
  { key: 'keyspec-01', text: 'Configurable Razer™ HyperScroll Tilt Wheel' },
  { key: 'keyspec-02', text: 'Razer™ Focus Pro 35K Optical Sensor Gen-2' },
  { key: 'keyspec-03', text: 'Up to 140 Hours on Razer™ HyperSpeed Wireless' },
];

export const DEFAULT_FINISHES = [
  {
    key: 'finish-01', label: 'Black', delta: 0, swatch: 'black',
  },
  {
    key: 'finish-02', label: 'White', delta: 0, swatch: 'white',
  },
  {
    key: 'finish-03', label: 'Phantom Green Edition', delta: 10, swatch: 'phantom-green',
  },
  {
    key: 'finish-04', label: 'Phantom White Edition', delta: 10, swatch: 'phantom-white',
  },
];

export const DEFAULT_MODELS = [
  {
    key: 'model-01', label: 'Basilisk V3 Pro 35K + Mouse Dock Pro', note: '', delta: 40,
  },
  {
    key: 'model-02', label: 'Basilisk V3 Pro 35K + Wireless Charging Puck', note: '', delta: 20,
  },
  {
    key: 'model-03', label: 'Basilisk V3 Pro 35K', note: 'Mouse only', delta: 0,
  },
];

export const DEFAULT_CARES = [
  {
    key: 'care-01', label: 'RazerCare Elite for Mice', note: '', delta: 29.99,
  },
  {
    key: 'care-02', label: 'No, thank you', note: 'No added cost', delta: 0,
  },
];

export const DEFAULT_SERVICES = [
  {
    key: 'service-01', glyph: '↯', title: 'Next Business Day Shipping', body: 'Get in the game sooner',
  },
  {
    key: 'service-02', glyph: '↺', title: 'Risk Free Return', body: 'Shop direct with confidence',
  },
  {
    key: 'service-03', glyph: '◎', title: 'Comprehensive Support', body: 'Help across the lifecycle of your gear',
  },
];

export const DEFAULT_SELECTION = {
  finish: 'finish-01',
  model: 'model-03',
  care: 'care-02',
};

const SWIPE_THRESHOLD = 40;
const PRICE_TWEEN_MS = 360;
const IMAGE_SIZE = { width: 1200, height: 800 };

/**
 * Computes the configured total from the base price and the deltas of
 * the selected finish, model, and care entries.
 * @param {number} basePrice base product price
 * @param {Array<{delta: number}|undefined>} selections selected entries
 * @returns {number} total price
 */
export function computeTotal(basePrice, selections) {
  return selections.reduce(
    (sum, entry) => sum + (entry && Number.isFinite(entry.delta) ? entry.delta : 0),
    Number.isFinite(basePrice) ? basePrice : 0,
  );
}

/**
 * Formats a price with thousands separators and two decimals.
 * @param {string} prefix currency prefix
 * @param {number} value price value
 * @returns {string} formatted price
 */
export function formatPrice(prefix, value) {
  const fixed = Math.max(0, value).toFixed(2);
  const [whole, cents] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${prefix}${grouped}.${cents}`;
}

/* ── Authoring helpers ─────────────────────────────────────────── */

function cellText(cell) {
  if (!cell) return '';
  return cell.innerText.trim();
}

function readHref(cell) {
  if (!cell) return '';
  const anchor = cell.querySelector('a[href]');
  if (anchor) return anchor.getAttribute('href') || '';
  return cellText(cell);
}

function readImageSource(cell) {
  if (!cell) return '';
  const image = cell.querySelector('img');
  if (image) return image.getAttribute('src') || '';
  return readHref(cell);
}

function applyValue(authored, preset) {
  if (!authored) return preset;
  if (authored === CLEAR_TOKEN) return '';
  return authored;
}

function applyNumber(authored, preset) {
  if (!authored) return preset;
  if (authored === CLEAR_TOKEN) return 0;
  const parsed = Number.parseFloat(authored.replace(/[^0-9.-]/g, ''));
  return Number.isNaN(parsed) ? preset : parsed;
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
  const lists = {
    crumb: new Map(),
    image: new Map(),
    keyspec: new Map(),
    finish: new Map(),
    model: new Map(),
    care: new Map(),
    service: new Map(),
  };

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const type = cellText(cells[0]).toLowerCase();

    if (type === 'setting') {
      const key = cellText(cells[1]).toLowerCase();
      if (key) settings.set(key, { value: cellText(cells[2]), cell: cells[2] });
      return;
    }
    if (!lists[type]) return;
    const key = cellText(cells[1]).toLowerCase();
    if (!key) return;
    lists[type].set(key, cells);
  });

  return { settings, lists };
}

function mergeSettings(settings, replace) {
  const merged = { ...DEFAULT_SETTINGS };
  if (replace) Object.keys(merged).forEach((key) => { merged[key] = ''; });
  settings.forEach((entry, key) => {
    if (key === 'content-mode') return;
    if (!(key in DEFAULT_SETTINGS)) return;
    const isLink = key.endsWith('-href');
    const value = isLink ? readHref(entry.cell) : entry.value;
    merged[key] = applyValue(value, merged[key]);
  });
  return merged;
}

function mergeKeyed(presets, authored, replace, build) {
  const merged = new Map();
  if (!replace) presets.forEach((entry) => merged.set(entry.key, { ...entry }));
  authored.forEach((cells, key) => {
    const preset = merged.get(key);
    const entry = build(cells, preset || null, key);
    if (!entry.label && !entry.text && !entry.src) {
      merged.delete(key);
      return;
    }
    merged.set(key, entry);
  });
  return [...merged.values()].sort((a, b) => a.key.localeCompare(b.key));
}

function mergeContent(parsed) {
  const modeEntry = parsed.settings.get('content-mode');
  const replace = ((modeEntry && modeEntry.value) || 'merge').toLowerCase() === 'replace';
  const config = mergeSettings(parsed.settings, replace);

  const crumbs = mergeKeyed(DEFAULT_CRUMBS, parsed.lists.crumb, replace, (cells, preset, key) => ({
    key,
    label: applyValue(cellText(cells[2]), preset ? preset.label : ''),
    href: applyValue(readHref(cells[3]), preset ? preset.href : ''),
  }));

  const images = mergeKeyed(DEFAULT_IMAGES, parsed.lists.image, replace, (cells, preset, key) => ({
    key,
    src: applyValue(readImageSource(cells[2]), preset ? preset.src : ''),
    alt: applyValue(cellText(cells[3]), preset ? preset.alt : ''),
    caption: applyValue(cellText(cells[4]), preset ? preset.caption : ''),
  }));

  const keyspecs = mergeKeyed(
    DEFAULT_KEYSPECS,
    parsed.lists.keyspec,
    replace,
    (cells, preset, key) => ({
      key,
      text: applyValue(cellText(cells[2]), preset ? preset.text : ''),
    }),
  );

  const finishes = mergeKeyed(
    DEFAULT_FINISHES,
    parsed.lists.finish,
    replace,
    (cells, preset, key) => ({
      key,
      label: applyValue(cellText(cells[2]), preset ? preset.label : ''),
      delta: applyNumber(cellText(cells[3]), preset ? preset.delta : 0),
      swatch: applyValue(cellText(cells[4]).toLowerCase(), preset ? preset.swatch : 'black'),
    }),
  );

  const buildOption = (cells, preset, key) => ({
    key,
    label: applyValue(cellText(cells[2]), preset ? preset.label : ''),
    note: applyValue(cellText(cells[3]), preset ? preset.note : ''),
    delta: applyNumber(cellText(cells[4]), preset ? preset.delta : 0),
  });
  const models = mergeKeyed(DEFAULT_MODELS, parsed.lists.model, replace, buildOption);
  const cares = mergeKeyed(DEFAULT_CARES, parsed.lists.care, replace, buildOption);

  const services = mergeKeyed(
    DEFAULT_SERVICES,
    parsed.lists.service,
    replace,
    (cells, preset, key) => ({
      key,
      glyph: applyValue(cellText(cells[2]), preset ? preset.glyph : ''),
      title: applyValue(cellText(cells[3]), preset ? preset.title : ''),
      body: applyValue(cellText(cells[4]), preset ? preset.body : ''),
    }),
  );

  return {
    config, crumbs, images, keyspecs, finishes, models, cares, services,
  };
}

/* ── Render helpers ────────────────────────────────────────────── */

function buildBreadcrumbs(content) {
  const nav = el('nav', 'pdp-breadcrumbs rzrm-shell');
  nav.setAttribute('aria-label', content.config['breadcrumb-label']);
  content.crumbs.forEach((crumb, index) => {
    if (index > 0) {
      const sep = el('span', 'crumb-sep', [text('›')]);
      sep.setAttribute('aria-hidden', 'true');
      nav.append(sep);
    }
    if (crumb.href) {
      const link = el('a', '', [text(crumb.label)]);
      link.href = crumb.href;
      nav.append(link);
    } else {
      const here = el('span', 'crumb-current', [text(crumb.label)]);
      here.setAttribute('aria-current', 'page');
      nav.append(here);
    }
  });
  return nav;
}

function buildMasthead(content) {
  const head = el('header', 'pdp-masthead rzrm-shell');
  const h1 = el('h1', '', [text(content.config.title)]);
  h1.id = 'pdp-title';
  head.append(h1);
  const sub = el('p', '', [text(content.config.subtitle)]);
  if (content.config['subtitle-link-label'] && content.config['subtitle-link-href']) {
    sub.append(text(' '));
    const link = el('a', '', [text(content.config['subtitle-link-label'])]);
    link.href = content.config['subtitle-link-href'];
    sub.append(link);
  }
  head.append(sub);
  return head;
}

function buildGallery(content, refs) {
  // No entrance animation here: the stage image is the LCP element and
  // must paint immediately.
  const gallery = el('div', 'pdp-gallery');

  const stage = el('div', 'gallery-stage');
  const frame = el('div', 'stage-frame');

  const front = el('img', 'stage-img is-front');
  const first = content.images[0];
  if (first) {
    front.src = first.src;
    front.alt = first.alt;
  }
  front.width = IMAGE_SIZE.width;
  front.height = IMAGE_SIZE.height;
  front.setAttribute('fetchpriority', 'high');

  const back = el('img', 'stage-img is-back');
  back.alt = '';
  back.width = IMAGE_SIZE.width;
  back.height = IMAGE_SIZE.height;
  back.setAttribute('aria-hidden', 'true');

  frame.append(front, back);

  const arrows = el('div', 'gallery-arrows');
  const prev = el('button', 'stage-arrow', [text('‹')]);
  prev.type = 'button';
  prev.setAttribute('aria-label', content.config['prev-label']);
  const next = el('button', 'stage-arrow', [text('›')]);
  next.type = 'button';
  next.setAttribute('aria-label', content.config['next-label']);
  arrows.append(prev, next);

  stage.append(frame, arrows);
  gallery.append(stage);

  const thumbs = el('div', 'gallery-thumbs');
  thumbs.setAttribute('aria-label', content.config['thumbs-label']);
  const thumbButtons = content.images.map((image, index) => {
    const thumb = el('button');
    thumb.type = 'button';
    thumb.setAttribute('aria-label', `Show image ${index + 1}`);
    thumb.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
    if (index === 0) thumb.classList.add('is-active');
    const img = el('img');
    img.src = image.src;
    img.alt = '';
    img.loading = 'lazy';
    img.width = 300;
    img.height = 200;
    thumb.append(img);
    thumbs.append(thumb);
    return thumb;
  });
  gallery.append(thumbs);

  const counter = el('span');
  const caption = el('strong');
  const captionWrap = el('div', 'gallery-caption', [counter, caption]);
  captionWrap.setAttribute('aria-live', 'polite');
  gallery.append(captionWrap);

  if (content.keyspecs.length) {
    const list = el('ul', 'gallery-specs', content.keyspecs.map(
      (spec) => el('li', '', [text(spec.text)]),
    ));
    gallery.append(list);
  }

  if (content.config['specs-link-label']) {
    const specsLink = el('a', 'text-link gallery-spec-link', [
      text(`${content.config['specs-link-label']} `),
      el('span', '', [text('↓')]),
    ]);
    specsLink.href = content.config['specs-link-href'];
    gallery.append(specsLink);
  }

  Object.assign(refs, {
    stage, front, back, prev, next, thumbButtons, counter, caption,
  });
  return gallery;
}

function buildOptionButton(entry, extra = null) {
  const button = el('button');
  button.type = 'button';
  button.dataset.key = entry.key;
  button.setAttribute('aria-pressed', 'false');
  if (extra) button.append(extra);
  button.append(el('strong', 'option-label', [text(entry.label)]));
  const detail = entry.note || (entry.delta ? `+ ${formatPrice('US$', entry.delta)}` : '');
  if (detail) {
    button.append(el('span', entry.note ? 'option-note' : 'option-delta', [text(detail)]));
  }
  return button;
}

function buildConfigurator(content, refs) {
  const section = el('section', 'pdp-configurator');
  section.id = 'configure';
  section.setAttribute('aria-labelledby', 'configure-title');

  const heading = el('div', 'config-heading');
  if (content.config['config-eyebrow']) {
    heading.append(el('p', 'eyebrow', [text(content.config['config-eyebrow'])]));
  }
  const title = el('h2', '', [text(content.config['config-title'])]);
  title.id = 'configure-title';
  heading.append(title);
  if (content.config['config-body']) {
    heading.append(el('p', '', [text(content.config['config-body'])]));
  }
  const note = heading.querySelector('p:not(.eyebrow)');
  if (note) note.classList.add('config-note');
  section.append(heading);

  const steps = [
    {
      group: 'finish',
      legend: content.config['finish-legend'],
      entries: content.finishes,
      className: 'finish-step',
      optionsClass: 'finish-options',
    },
    {
      group: 'model',
      legend: content.config['model-legend'],
      entries: content.models,
      className: 'model-step',
      optionsClass: 'model-options',
    },
    {
      group: 'care',
      legend: content.config['care-legend'],
      entries: content.cares,
      className: 'care-step',
      optionsClass: 'care-options',
    },
  ];

  refs.optionButtons = new Map();
  steps.forEach((step, index) => {
    if (!step.entries.length) return;
    const fieldset = el('fieldset', `config-step ${step.className}`);
    const legend = el('legend');
    legend.append(el('span', 'step-num', [text(String(index + 1).padStart(2, '0'))]));
    legend.append(text(` ${step.legend}`));
    fieldset.append(legend);
    if (step.group === 'care' && content.config['care-help-label']) {
      const help = el('a', 'config-help', [
        text(`${content.config['care-help-label']} `),
        el('span', '', [text('↗')]),
      ]);
      help.href = content.config['care-help-href'];
      fieldset.append(help);
    }
    const options = el('div', step.optionsClass);
    const buttons = step.entries.map((entry) => {
      const swatch = step.group === 'finish' ? el('i', `swatch ${entry.swatch}`) : null;
      const button = buildOptionButton(entry, swatch);
      button.dataset.group = step.group;
      options.append(button);
      return { entry, button };
    });
    refs.optionButtons.set(step.group, buttons);
    fieldset.append(options);
    section.append(fieldset);
  });

  const summary = el('div', 'config-summary');
  summary.setAttribute('aria-live', 'polite');
  const chosen = el('div', 'config-chosen');
  chosen.append(el('span', 'summary-eyebrow', [text(content.config['summary-label'])]));
  refs.summaryFinish = el('strong', 'summary-finish');
  refs.summaryModel = el('small', 'summary-model');
  chosen.append(refs.summaryFinish, refs.summaryModel);
  const price = el('div', 'config-price');
  price.append(el('span', 'summary-eyebrow', [text(content.config['price-label'])]));
  refs.priceValue = el('strong', 'price-value');
  price.append(refs.priceValue);
  if (content.config['price-note']) {
    price.append(el('small', 'price-note', [text(content.config['price-note'])]));
  }
  summary.append(chosen, price);
  if (content.config['cta-label']) {
    const cta = el('a', 'button button-primary config-cta', [text(content.config['cta-label'])]);
    cta.href = content.config['cta-href'];
    summary.append(cta);
  }
  section.append(summary);

  if (content.config['availability-note']) {
    section.append(el('p', 'availability-note', [text(content.config['availability-note'])]));
  }
  return section;
}

function buildServices(content) {
  if (!content.services.length) return null;
  const strip = el('section', 'pdp-services rzrm-shell');
  strip.setAttribute('aria-label', content.config['services-label']);
  content.services.forEach((service) => {
    const item = el('div', 'service-item');
    const glyph = el('span', 'service-glyph', [text(service.glyph)]);
    glyph.setAttribute('aria-hidden', 'true');
    const copy = el('p', 'service-copy', [
      el('strong', '', [text(service.title)]),
      service.body ? el('small', '', [text(service.body)]) : null,
    ]);
    item.append(glyph, copy);
    strip.append(item);
  });
  return strip;
}

/* ── Behavior ──────────────────────────────────────────────────── */

function initGallery(content, refs, reduceMotion) {
  const state = { index: 0, tick: 0 };
  const total = content.images.length;

  const setCaption = (index) => {
    const image = content.images[index];
    refs.counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    refs.caption.textContent = image.caption || image.alt || '';
  };

  // Timer-driven (not rAF) so switches still complete while the
  // document is hidden; the tick token lets rapid clicks supersede an
  // in-flight crossfade instead of locking it out.
  const goTo = (nextIndex) => {
    const index = (nextIndex + total) % total;
    if (index === state.index) return;
    const image = content.images[index];
    state.index = index;
    state.tick += 1;
    const { tick } = state;

    refs.thumbButtons.forEach((thumb, thumbIndex) => {
      thumb.classList.toggle('is-active', thumbIndex === index);
      thumb.setAttribute('aria-pressed', thumbIndex === index ? 'true' : 'false');
    });
    setCaption(index);

    const showDirectly = () => {
      refs.front.src = image.src;
      refs.front.alt = image.alt;
      refs.back.classList.remove('is-showing');
    };
    if (reduceMotion.matches) {
      showDirectly();
      return;
    }

    refs.back.src = image.src;
    const raise = () => {
      if (state.tick !== tick) return;
      refs.back.classList.add('is-showing');
      window.setTimeout(() => {
        if (state.tick !== tick) return;
        showDirectly();
      }, 440);
    };
    if (refs.back.complete) {
      window.setTimeout(raise, 20);
    } else {
      refs.back.addEventListener('load', raise, { once: true });
      refs.back.addEventListener('error', () => {
        if (state.tick === tick) showDirectly();
      }, { once: true });
    }
  };

  refs.prev.addEventListener('click', () => goTo(state.index - 1));
  refs.next.addEventListener('click', () => goTo(state.index + 1));
  refs.thumbButtons.forEach((thumb, index) => {
    thumb.addEventListener('click', () => goTo(index));
  });

  refs.stage.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(state.index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(state.index + 1);
    }
  });

  let pointerStart = null;
  refs.stage.addEventListener('pointerdown', (event) => {
    pointerStart = { x: event.clientX, y: event.clientY };
  });
  refs.stage.addEventListener('pointerup', (event) => {
    if (!pointerStart) return;
    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
      goTo(deltaX < 0 ? state.index + 1 : state.index - 1);
    }
  });

  setCaption(0);

  const preload = () => {
    content.images.slice(1).forEach((image) => {
      const img = new Image();
      img.src = image.src;
    });
  };
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preload, { timeout: 2500 });
  } else {
    window.setTimeout(preload, 1200);
  }
}

function initConfigurator(content, refs, reduceMotion) {
  const groups = {
    finish: content.finishes,
    model: content.models,
    care: content.cares,
  };
  const selection = {};
  Object.keys(groups).forEach((group) => {
    const preset = DEFAULT_SELECTION[group];
    const entries = groups[group];
    if (!entries.length) return;
    selection[group] = entries.some((entry) => entry.key === preset)
      ? preset
      : entries[entries.length - 1].key;
  });

  const basePrice = Number.parseFloat(content.config['base-price']) || 0;
  const prefix = content.config['currency-prefix'];
  let shownTotal = null;
  let tween = 0;
  let settle = 0;

  const selected = (group) => groups[group]
    && groups[group].find((entry) => entry.key === selection[group]);

  const renderPrice = (value) => {
    refs.priceValue.textContent = formatPrice(prefix, value);
  };

  // The rAF roll is decoration only; a settle timer guarantees the
  // final value even when rAF never fires (hidden document).
  const animatePrice = (target) => {
    window.cancelAnimationFrame(tween);
    window.clearTimeout(settle);
    if (shownTotal === null || reduceMotion.matches) {
      shownTotal = target;
      renderPrice(target);
      return;
    }
    const from = shownTotal;
    shownTotal = target;
    if (Math.abs(target - from) < 0.005) return;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - start) / PRICE_TWEEN_MS);
      const eased = 1 - (1 - progress) ** 3;
      renderPrice(from + (target - from) * eased);
      if (progress < 1) tween = window.requestAnimationFrame(step);
    };
    tween = window.requestAnimationFrame(step);
    settle = window.setTimeout(() => {
      window.cancelAnimationFrame(tween);
      renderPrice(target);
    }, PRICE_TWEEN_MS + 60);
  };

  const sync = () => {
    Object.keys(groups).forEach((group) => {
      const buttons = refs.optionButtons.get(group) || [];
      buttons.forEach(({ entry, button }) => {
        const isSelected = entry.key === selection[group];
        button.classList.toggle('is-selected', isSelected);
        button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      });
    });
    const finish = selected('finish');
    const model = selected('model');
    if (finish) refs.summaryFinish.textContent = finish.label;
    if (model) refs.summaryModel.textContent = model.label;
    animatePrice(computeTotal(basePrice, [selected('finish'), selected('model'), selected('care')]));
  };

  refs.optionButtons.forEach((buttons, group) => {
    buttons.forEach(({ entry, button }) => {
      button.addEventListener('click', () => {
        if (selection[group] === entry.key) return;
        selection[group] = entry.key;
        sync();
      });
    });
  });

  sync();
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

  const hero = el('section', 'pdp-hero');
  hero.setAttribute('aria-labelledby', 'pdp-title');
  if (content.crumbs.length) hero.append(buildBreadcrumbs(content));
  hero.append(buildMasthead(content));

  const commerce = el('div', 'pdp-commerce rzrm-shell');
  commerce.setAttribute('role', 'group');
  commerce.setAttribute('aria-label', content.config['gallery-label']);
  if (content.images.length) commerce.append(buildGallery(content, refs));
  commerce.append(buildConfigurator(content, refs));
  hero.append(commerce);

  const services = buildServices(content);
  if (services) hero.append(services);

  block.append(hero);

  if (content.images.length) initGallery(content, refs, reduceMotion);
  initConfigurator(content, refs, reduceMotion);
}
