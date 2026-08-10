/**
 * Razer Product Explorer block for EDS document authoring.
 *
 * Reproduces the gaming-mice product explorer from the Razer demo page:
 * desktop filter sidebar, results toolbar (count + sort), responsive
 * product-card grid, mobile filter drawer with backdrop, and the
 * empty-results state. The full catalog of 10 mice plus all filter
 * groups are baked in, so a table containing only the block name
 * renders the exact source experience. Authored rows override or
 * extend items by stable key.
 *
 * Table contract (12 columns, typed rows; column 1 is the row type):
 * setting:        setting | <key> | <value>
 * filter-group:   filter-group | group-key | legend
 * filter-option:  filter-option | group-key | option-key | label | match-value
 * sort-option:    sort-option | key | label
 * product:        product | key | enabled | image | title | family |
 *                 playstyle | connectivity | badge | price-text |
 *                 price-value | url
 * product-detail: product-detail | key | description | attributes |
 *                 availability-lead | availability-note | detail-label |
 *                 configure-label | configure-url
 *
 * Filters OR within a group and AND across groups. Sorting keeps the
 * authored order for `featured` and ties. Filter state stays in memory
 * (no URL params), matching the source page; the block root exposes
 * `data-rzrm-visible` and `data-rzrm-sort` as test hooks.
 *
 * The literal `__empty__` clears a preset value; `enabled = false`
 * removes a preset product.
 */

const CLEAR_TOKEN = '__empty__';
const FALSY_VALUES = new Set(['0', 'off', 'false', 'no']);

export const DEFAULT_SETTINGS = {
  'aria-filters-label': 'Product filters',
  'count-word': 'gaming',
  'count-noun-singular': 'mouse',
  'count-noun-plural': 'mice',
  'sort-default': 'featured',
  'sort-label': 'Sort by',
  'filters-title': 'Filter',
  'clear-all-label': 'Clear all',
  'mobile-filter-label': 'Filters',
  'drawer-title': 'Filters',
  'drawer-close-label': 'Close filters',
  'show-results-label': 'Show {count} results',
  'empty-title': 'No mice match those filters',
  'empty-body': 'Clear a filter or use the guided finder to match a family to your playstyle.',
  'empty-clear-label': 'Clear filters',
  'empty-cta-label': 'Open gear finder',
  'empty-cta-href': '/gear-finder',
  'service-note': 'RazerStore support available',
  'detail-label': 'View details',
  'configure-label': 'Configure',
};

export const DEFAULT_FILTER_GROUPS = [
  {
    key: 'family',
    legend: 'Product family',
    options: [
      { key: 'viper', label: 'Viper', match: 'Viper' },
      { key: 'deathadder', label: 'DeathAdder', match: 'DeathAdder' },
      { key: 'basilisk', label: 'Basilisk', match: 'Basilisk' },
      { key: 'cobra', label: 'Cobra', match: 'Cobra' },
      { key: 'naga', label: 'Naga', match: 'Naga' },
    ],
  },
  {
    key: 'connectivity',
    legend: 'Connectivity',
    options: [
      { key: 'wireless', label: 'Wireless', match: 'Wireless' },
      { key: 'wired', label: 'Wired', match: 'Wired' },
      { key: 'multi-mode', label: 'Multi-mode', match: 'Multi-mode' },
    ],
  },
  {
    key: 'playstyle',
    legend: 'Playstyle',
    options: [
      { key: 'esports', label: 'Esports', match: 'Esports' },
      { key: 'immersive', label: 'Immersive', match: 'Immersive' },
      { key: 'portable', label: 'Portable', match: 'Portable' },
      { key: 'mmo', label: 'MMO', match: 'MMO' },
    ],
  },
];

export const DEFAULT_SORTS = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-low', label: 'Price: Low to high' },
  { key: 'price-high', label: 'Price: High to low' },
  { key: 'name', label: 'Name' },
];

export const DEFAULT_PRODUCTS = [
  {
    key: 'product-01',
    title: 'Razer Viper V3 Pro',
    family: 'Viper',
    playstyle: 'Esports',
    connectivity: 'Wireless',
    badge: 'Esports',
    priceText: 'US$159.99',
    priceValue: 159.99,
    url: 'https://www.razer.com/gaming-mice/Razer-Viper-V3-Pro/RZ01-05120100-R3U1',
    image: '/images/razer-mice/products/viper-v3-pro.webp',
    description: 'Ultra-lightweight symmetrical wireless esports gaming mouse with HyperPolling 8000 Hz',
    attributes: ['Wireless', 'Claw / Fingertip', '54 g'],
    availabilityLead: 'Available in selected configurations',
    configureUrl: 'https://www.razer.com/gaming-mice/Razer-Viper-V3-Pro/RZ01-05120100-R3U1#buy',
  },
  {
    key: 'product-02',
    title: 'Razer Viper V3 HyperSpeed',
    family: 'Viper',
    playstyle: 'Esports',
    connectivity: 'Wireless',
    badge: '',
    priceText: 'US$69.99',
    priceValue: 69.99,
    url: 'https://www.razer.com/gaming-mice/razer-viper-v3-hyperspeed',
    image: '/images/razer-mice/products/viper-v3-hyperspeed.webp',
    description: 'Wireless symmetrical esports gaming mouse',
    attributes: ['Wireless', 'Claw / Fingertip'],
    availabilityLead: 'Check current availability',
    configureUrl: 'https://www.razer.com/gaming-mice/razer-viper-v3-hyperspeed#buy',
  },
  {
    key: 'product-03',
    title: 'Razer DeathAdder V4 Pro',
    family: 'DeathAdder',
    playstyle: 'Esports',
    connectivity: 'Wireless',
    badge: 'New',
    priceText: 'US$169.99',
    priceValue: 169.99,
    url: 'https://www.razer.com/gaming-mice/razer-deathadder-v4-pro/RZ01-05330100-R3U1',
    image: '/images/razer-mice/products/deathadder-v4-pro.webp',
    description: 'Ultra-lightweight ergonomic wireless esports gaming mouse with Razer Optical Scroll Wheel',
    attributes: ['Wireless', 'Palm / Claw', '56 g · Black'],
    availabilityLead: 'Available in selected configurations',
    configureUrl: 'https://www.razer.com/gaming-mice/razer-deathadder-v4-pro/RZ01-05330100-R3U1#buy',
  },
  {
    key: 'product-04',
    title: 'Razer DeathAdder V3 HyperSpeed',
    family: 'DeathAdder',
    playstyle: 'Esports',
    connectivity: 'Wireless',
    badge: '',
    priceText: 'US$99.99',
    priceValue: 99.99,
    url: 'https://www.razer.com/gaming-mice/razer-deathadder-v3-hyperspeed',
    image: '/images/razer-mice/products/deathadder-v3-hyperspeed.webp',
    description: 'Ultra-lightweight wireless ergonomic esports mouse',
    attributes: ['Wireless', 'Palm / Claw'],
    availabilityLead: 'Check current availability',
    configureUrl: 'https://www.razer.com/gaming-mice/razer-deathadder-v3-hyperspeed#buy',
  },
  {
    key: 'product-05',
    title: 'Razer Basilisk Mobile',
    family: 'Basilisk',
    playstyle: 'Portable',
    connectivity: 'Wireless',
    badge: 'Mobile',
    priceText: 'US$89.99',
    priceValue: 89.99,
    url: 'https://www.razer.com/gaming-mice/razer-basilisk-mobile',
    image: '/images/razer-mice/products/basilisk-mobile.webp',
    description: 'Portable ergonomic wireless gaming mouse',
    attributes: ['Wireless', 'Ergonomic'],
    availabilityLead: 'Check current availability',
    configureUrl: 'https://www.razer.com/gaming-mice/razer-basilisk-mobile#buy',
  },
  {
    key: 'product-06',
    title: 'Razer Basilisk V3 Pro 35K',
    family: 'Basilisk',
    playstyle: 'Immersive',
    connectivity: 'Multi-mode',
    badge: 'Featured',
    priceText: 'US$159.99 · Black',
    priceValue: 159.99,
    url: '/gaming-mice/razer-basilisk-v3-pro-35k/rz01-05240100-r3u1',
    image: '/images/razer-mice/products/basilisk-v3-pro-35k.webp',
    description: 'Fully customizable wireless ergonomic RGB gaming mouse',
    attributes: ['Multi-mode', 'Right-handed ergonomic', '112 g'],
    availabilityLead: 'Available in multiple finishes',
    configureUrl: '/gaming-mice/razer-basilisk-v3-pro-35k/rz01-05240100-r3u1#configure',
  },
  {
    key: 'product-07',
    title: 'Razer Basilisk V3 35K',
    family: 'Basilisk',
    playstyle: 'Immersive',
    connectivity: 'Wired',
    badge: '',
    priceText: 'US$79.99',
    priceValue: 79.99,
    url: 'https://www.razer.com/gaming-mice/razer-basilisk-v3-35k',
    image: '/images/razer-mice/products/basilisk-v3-35k.webp',
    description: 'Fully customizable ergonomic RGB gaming mouse',
    attributes: ['Wired', 'Right-handed ergonomic'],
    availabilityLead: 'Check current availability',
    configureUrl: 'https://www.razer.com/gaming-mice/razer-basilisk-v3-35k#buy',
  },
  {
    key: 'product-08',
    title: 'Razer Cobra Pro',
    family: 'Cobra',
    playstyle: 'Immersive',
    connectivity: 'Multi-mode',
    badge: 'Chroma',
    priceText: 'US$129.99',
    priceValue: 129.99,
    url: 'https://www.razer.com/gaming-mice/razer-cobra-pro',
    image: '/images/razer-mice/products/cobra-pro.webp',
    description: 'Customizable wireless gaming mouse with Razer Chroma RGB',
    attributes: ['Multi-mode', 'Claw / Fingertip'],
    availabilityLead: 'Check current availability',
    configureUrl: 'https://www.razer.com/gaming-mice/razer-cobra-pro#buy',
  },
  {
    key: 'product-09',
    title: 'Razer Cobra',
    family: 'Cobra',
    playstyle: 'Esports',
    connectivity: 'Wired',
    badge: '',
    priceText: 'From US$39.99',
    priceValue: 39.99,
    url: 'https://www.razer.com/gaming-mice/razer-cobra',
    image: '/images/razer-mice/products/cobra.webp',
    description: 'Lightweight wired gaming mouse with Razer Chroma RGB',
    attributes: ['Wired', 'Claw / Fingertip', '58 g'],
    availabilityLead: 'Availability varies by edition',
    configureUrl: 'https://www.razer.com/gaming-mice/razer-cobra#buy',
  },
  {
    key: 'product-10',
    title: 'Razer Naga V2 Pro',
    family: 'Naga',
    playstyle: 'MMO',
    connectivity: 'Multi-mode',
    badge: 'MMO',
    priceText: 'US$179.99',
    priceValue: 179.99,
    url: 'https://www.razer.com/gaming-mice/razer-naga-v2-pro',
    image: '/images/razer-mice/products/naga-v2-pro.webp',
    description: 'Ergonomic wireless MMO gaming mouse',
    attributes: ['Multi-mode', 'Palm / Claw'],
    availabilityLead: 'Check current availability',
    configureUrl: 'https://www.razer.com/gaming-mice/razer-naga-v2-pro#buy',
  },
];

const IMAGE_SIZE = { width: 900, height: 600 };

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

function readList(cell) {
  if (!cell) return [];
  const items = [...cell.querySelectorAll('li')].map((li) => li.innerText.trim());
  if (items.length) return items.filter(Boolean);
  return cellText(cell)
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function applyValue(authored, preset) {
  if (!authored) return preset;
  if (authored === CLEAR_TOKEN) return '';
  return authored;
}

function parsePriceValue(priceText) {
  const first = priceText
    .replace(/[^0-9.]/g, ' ')
    .trim()
    .split(/\s+/)[0];
  return Number.parseFloat(first);
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

/* ── Parse ─────────────────────────────────────────────────────── */

function parseRows(block) {
  const settings = new Map();
  const groups = new Map();
  const options = [];
  const sorts = [];
  const products = new Map();
  const details = new Map();

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const type = cellText(cells[0]).toLowerCase();

    if (type === 'setting') {
      const key = cellText(cells[1]).toLowerCase();
      if (key) settings.set(key, cellText(cells[2]));
      return;
    }

    if (type === 'filter-group') {
      const key = cellText(cells[1]).toLowerCase();
      if (key) groups.set(key, { key, legend: cellText(cells[2]) });
      return;
    }

    if (type === 'filter-option') {
      const groupKey = cellText(cells[1]).toLowerCase();
      const key = cellText(cells[2]).toLowerCase();
      if (groupKey && key) {
        options.push({
          groupKey,
          key,
          label: cellText(cells[3]),
          match: cellText(cells[4]),
        });
      }
      return;
    }

    if (type === 'sort-option') {
      const key = cellText(cells[1]).toLowerCase();
      if (key) sorts.push({ key, label: cellText(cells[2]) });
      return;
    }

    if (type === 'product') {
      const key = cellText(cells[1]).toLowerCase();
      if (!key) return;
      products.set(key, {
        key,
        enabled: cellText(cells[2]),
        image: readImageSource(cells[3]),
        title: cellText(cells[4]),
        family: cellText(cells[5]),
        playstyle: cellText(cells[6]),
        connectivity: cellText(cells[7]),
        badge: cellText(cells[8]),
        priceText: cellText(cells[9]),
        priceValue: cellText(cells[10]),
        url: readHref(cells[11]),
      });
      return;
    }

    if (type === 'product-detail') {
      const key = cellText(cells[1]).toLowerCase();
      if (!key) return;
      details.set(key, {
        description: cellText(cells[2]),
        attributes: readList(cells[3]),
        availabilityLead: cellText(cells[4]),
        availabilityNote: cellText(cells[5]),
        detailLabel: cellText(cells[6]),
        configureLabel: cellText(cells[7]),
        configureUrl: readHref(cells[8]),
      });
    }
  });

  return {
    settings, groups, options, sorts, products, details,
  };
}

/* ── Merge with presets ────────────────────────────────────────── */

function mergeSettings(authored) {
  const merged = { ...DEFAULT_SETTINGS };
  authored.forEach((value, key) => {
    if (!(key in merged) && key !== 'content-mode') return;
    if (key === 'content-mode') return;
    merged[key] = value === CLEAR_TOKEN ? '' : value;
  });
  return merged;
}

function mergeFilterGroups(parsed, replace) {
  const base = replace ? [] : DEFAULT_FILTER_GROUPS.map((group) => ({
    ...group,
    options: group.options.map((option) => ({ ...option })),
  }));
  const merged = new Map(base.map((group) => [group.key, group]));

  parsed.groups.forEach((entry, key) => {
    const preset = merged.get(key) || { key, legend: '', options: [] };
    preset.legend = applyValue(entry.legend, preset.legend);
    merged.set(key, preset);
  });

  parsed.options.forEach((entry) => {
    const group = merged.get(entry.groupKey);
    if (!group) return;
    const preset = group.options.find((option) => option.key === entry.key);
    if (preset) {
      preset.label = applyValue(entry.label, preset.label);
      preset.match = applyValue(entry.match, preset.match);
    } else if (entry.label) {
      group.options.push({
        key: entry.key,
        label: entry.label,
        match: entry.match || entry.label,
      });
    }
  });

  return [...merged.values()].filter((group) => group.legend && group.options.length);
}

function mergeSorts(parsed, replace) {
  if (!parsed.sorts.length) return replace ? [] : DEFAULT_SORTS;
  const merged = new Map(
    (replace ? [] : DEFAULT_SORTS).map((sort) => [sort.key, { ...sort }]),
  );
  parsed.sorts.forEach((entry) => {
    const preset = merged.get(entry.key) || { key: entry.key, label: '' };
    preset.label = applyValue(entry.label, preset.label);
    merged.set(entry.key, preset);
  });
  return [...merged.values()].filter((sort) => sort.label);
}

function mergeProducts(parsed, replace) {
  const merged = new Map();
  if (!replace) {
    DEFAULT_PRODUCTS.forEach((product) => merged.set(product.key, { ...product }));
  }

  parsed.products.forEach((entry, key) => {
    if (FALSY_VALUES.has(entry.enabled.toLowerCase())) {
      merged.delete(key);
      return;
    }
    const preset = merged.get(key) || {
      key,
      title: '',
      family: '',
      playstyle: '',
      connectivity: '',
      badge: '',
      priceText: '',
      priceValue: NaN,
      url: '',
      image: '',
      description: '',
      attributes: [],
      availabilityLead: '',
      configureUrl: '',
    };
    preset.image = applyValue(entry.image, preset.image);
    preset.title = applyValue(entry.title, preset.title);
    preset.family = applyValue(entry.family, preset.family);
    preset.playstyle = applyValue(entry.playstyle, preset.playstyle);
    preset.connectivity = applyValue(entry.connectivity, preset.connectivity);
    preset.badge = applyValue(entry.badge, preset.badge);
    preset.priceText = applyValue(entry.priceText, preset.priceText);
    if (entry.priceValue) {
      preset.priceValue = Number.parseFloat(entry.priceValue);
    } else if (entry.priceText && entry.priceText !== CLEAR_TOKEN) {
      preset.priceValue = parsePriceValue(entry.priceText);
    }
    preset.url = applyValue(entry.url, preset.url);
    merged.set(key, preset);
  });

  parsed.details.forEach((entry, key) => {
    const preset = merged.get(key);
    if (!preset) return;
    preset.description = applyValue(entry.description, preset.description);
    if (entry.attributes.length) {
      preset.attributes = entry.attributes.filter((item) => item !== CLEAR_TOKEN);
    }
    preset.availabilityLead = applyValue(entry.availabilityLead, preset.availabilityLead);
    if (entry.availabilityNote) preset.availabilityNote = applyValue(entry.availabilityNote, '');
    if (entry.detailLabel) preset.detailLabel = applyValue(entry.detailLabel, '');
    if (entry.configureLabel) preset.configureLabel = applyValue(entry.configureLabel, '');
    preset.configureUrl = applyValue(entry.configureUrl, preset.configureUrl);
  });

  return [...merged.values()]
    .filter((product) => product.title)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((product, index) => ({ ...product, order: index }));
}

/* ── Render ────────────────────────────────────────────────────── */

function buildFilterFields(groupsConfig) {
  const wrap = document.createDocumentFragment();
  groupsConfig.forEach((group) => {
    const fieldset = el('fieldset', 'filter-group');
    const legend = el('legend', '', [text(group.legend)]);
    fieldset.append(legend);
    group.options.forEach((option) => {
      const input = el('input');
      input.type = 'checkbox';
      input.dataset.filterGroup = group.key;
      input.dataset.filterValue = option.key;
      const label = el('label', '', [input, el('span', '', [text(option.label)])]);
      fieldset.append(label);
    });
    wrap.append(fieldset);
  });
  return wrap;
}

function buildProductCard(product, config) {
  const card = el('article', 'product-card');
  card.dataset.key = product.key;

  const media = el('a', 'product-image');
  if (product.url) media.href = product.url;
  media.setAttribute('aria-label', `View ${product.title}`);
  if (product.image) {
    const img = el('img');
    img.src = product.image;
    img.alt = product.title;
    img.loading = 'lazy';
    img.width = IMAGE_SIZE.width;
    img.height = IMAGE_SIZE.height;
    media.append(img);
  }
  if (product.badge) {
    media.append(el('span', 'product-badge', [text(product.badge)]));
  }
  card.append(media);

  const body = el('div', 'product-card-body');

  body.append(el('p', 'product-family', [text(`${product.family} · ${product.playstyle}`)]));

  const titleLink = el('a', '', [text(product.title)]);
  if (product.url) titleLink.href = product.url;
  body.append(el('h2', '', [titleLink]));

  if (product.description) body.append(el('p', '', [text(product.description)]));

  if (product.attributes.length) {
    body.append(el('div', 'product-attributes', product.attributes.map(
      (attribute) => el('span', '', [text(attribute)]),
    )));
  }

  if (product.availabilityLead) {
    const check = el('span', '', [text('✓')]);
    check.setAttribute('aria-hidden', 'true');
    const note = product.availabilityNote || config['service-note'];
    body.append(el('div', 'product-service', [
      check,
      el('span', '', [
        el('strong', '', [text(product.availabilityLead)]),
        note ? el('small', '', [text(note)]) : null,
      ]),
    ]));
  }

  const footer = el('div', 'product-card-footer');
  footer.append(el('strong', '', [text(product.priceText)]));
  const actions = el('div');
  const details = el('a', 'button button-compact', [
    text(product.detailLabel || config['detail-label']),
  ]);
  if (product.url) details.href = product.url;
  actions.append(details);
  if (product.configureUrl) {
    const configure = el('a', 'button button-ghost button-small', [
      text(`${product.configureLabel || config['configure-label']} `),
      el('span', '', [text('›')]),
    ]);
    configure.href = product.configureUrl;
    actions.append(configure);
  }
  footer.append(actions);
  body.append(footer);
  card.append(body);

  return card;
}

/* ── Decorate ──────────────────────────────────────────────────── */

/**
 * Loads and decorates the block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const parsed = parseRows(block);
  const replace = (parsed.settings.get('content-mode') || 'merge').toLowerCase() === 'replace';
  const config = mergeSettings(parsed.settings);
  const groupsConfig = mergeFilterGroups(parsed, replace);
  const sortsConfig = mergeSorts(parsed, replace);
  const products = mergeProducts(parsed, replace);

  const state = {
    selected: new Map(groupsConfig.map((group) => [group.key, new Set()])),
    sort: config['sort-default'],
  };

  block.textContent = '';

  /* Desktop filter sidebar */
  const filterTitle = el('div', 'filter-title', [el('strong', '', [text(config['filters-title'])])]);
  const clearAll = el('button', '', [text(config['clear-all-label'])]);
  clearAll.type = 'button';
  clearAll.hidden = true;
  filterTitle.append(clearAll);
  const aside = el('aside', 'desktop-filters', [filterTitle, buildFilterFields(groupsConfig)]);
  aside.setAttribute('aria-label', config['aria-filters-label']);

  /* Toolbar */
  const mobileButton = el('button', 'mobile-filter-button', [text(config['mobile-filter-label'])]);
  mobileButton.type = 'button';
  const mobileCount = el('span');
  mobileCount.hidden = true;
  mobileButton.append(mobileCount);

  const countNode = el('strong');
  const select = el('select');
  sortsConfig.forEach((sort) => {
    const option = el('option', '', [text(sort.label)]);
    option.value = sort.key;
    if (sort.key === state.sort) option.selected = true;
    select.append(option);
  });
  const sortLabel = el('label', '', [text(config['sort-label']), select]);
  const toolbar = el('div', 'results-toolbar', [
    el('div', '', [mobileButton, countNode]),
    sortLabel,
  ]);

  /* Grid + empty state */
  const grid = el('div', 'product-grid');
  const cards = products.map((product) => {
    const card = buildProductCard(product, config);
    grid.append(card);
    return { product, card };
  });

  const emptyZero = el('span', '', [text('0')]);
  emptyZero.setAttribute('aria-hidden', 'true');
  const emptyClear = el('button', 'button button-primary', [text(config['empty-clear-label'])]);
  emptyClear.type = 'button';
  const emptyCta = el('a', 'button button-outline', [text(config['empty-cta-label'])]);
  if (config['empty-cta-href']) emptyCta.href = config['empty-cta-href'];
  const empty = el('div', 'empty-results', [
    emptyZero,
    el('h2', '', [text(config['empty-title'])]),
    el('p', '', [text(config['empty-body'])]),
    el('div', '', [emptyClear, emptyCta]),
  ]);
  empty.hidden = true;

  const results = el('div', 'plp-results', [toolbar, grid, empty]);
  const shellNode = el('div', 'plp-shell shell', [aside, results]);

  /* Mobile drawer + backdrop */
  const drawerClose = el('button', '', [text('×')]);
  drawerClose.type = 'button';
  drawerClose.setAttribute('aria-label', config['drawer-close-label']);
  const drawerHead = el('div', 'panel-head', [
    el('strong', '', [text(config['drawer-title'])]),
    drawerClose,
  ]);
  const drawerFilterTitle = el('div', 'filter-title', [el('strong', '', [text(config['filters-title'])])]);
  const drawerClearAll = el('button', '', [text(config['clear-all-label'])]);
  drawerClearAll.type = 'button';
  drawerClearAll.hidden = true;
  drawerFilterTitle.append(drawerClearAll);
  const drawerBody = el('div', 'filter-drawer-body', [drawerFilterTitle, buildFilterFields(groupsConfig)]);
  const showResults = el('button', 'button button-primary');
  showResults.type = 'button';
  const drawerFooter = el('div', 'filter-drawer-footer', [showResults]);
  const drawer = el('div', 'filter-drawer', [drawerHead, drawerBody, drawerFooter]);
  drawer.setAttribute('aria-hidden', 'true');
  drawer.inert = true;

  const backdrop = el('div', 'backdrop');
  backdrop.setAttribute('aria-hidden', 'true');

  block.append(shellNode, drawer, backdrop);

  /* ── Behavior ── */

  const activeCount = () => [...state.selected.values()]
    .reduce((sum, set) => sum + set.size, 0);

  const matches = (product) => groupsConfig.every((group) => {
    const chosen = state.selected.get(group.key);
    if (!chosen || !chosen.size) return true;
    const value = product[group.key] || '';
    return group.options.some(
      (option) => chosen.has(option.key) && option.match === value,
    );
  });

  const compare = (a, b) => {
    if (state.sort === 'price-low' || state.sort === 'price-high') {
      const aPrice = Number.isNaN(a.product.priceValue) ? Infinity : a.product.priceValue;
      const bPrice = Number.isNaN(b.product.priceValue) ? Infinity : b.product.priceValue;
      if (aPrice !== bPrice) {
        return state.sort === 'price-low' ? aPrice - bPrice : bPrice - aPrice;
      }
    } else if (state.sort === 'name') {
      const byName = a.product.title.localeCompare(b.product.title);
      if (byName) return byName;
    }
    return a.product.order - b.product.order;
  };

  const apply = () => {
    const visible = cards.filter(({ product }) => matches(product));
    const visibleSet = new Set(visible);
    cards.forEach((entry) => {
      entry.card.hidden = !visibleSet.has(entry);
    });
    grid.append(...[...cards].sort(compare).map((entry) => entry.card));

    const count = visible.length;
    const noun = count === 1 ? config['count-noun-singular'] : config['count-noun-plural'];
    countNode.textContent = `${count} ${config['count-word']} ${noun}`;
    showResults.textContent = config['show-results-label'].replace('{count}', count);

    const active = activeCount();
    clearAll.hidden = active === 0;
    drawerClearAll.hidden = active === 0;
    mobileCount.hidden = active === 0;
    mobileCount.textContent = active > 0 ? String(active) : '';

    empty.hidden = count !== 0;
    grid.hidden = count === 0;

    block.dataset.rzrmVisible = String(count);
    block.dataset.rzrmSort = state.sort;
  };

  const syncInputs = (groupKey, optionKey, checked) => {
    block.querySelectorAll(
      `input[data-filter-group="${groupKey}"][data-filter-value="${optionKey}"]`,
    ).forEach((input) => {
      input.checked = checked;
    });
  };

  const clearFilters = () => {
    state.selected.forEach((set) => set.clear());
    block.querySelectorAll('input[data-filter-group]').forEach((input) => {
      input.checked = false;
    });
    apply();
  };

  block.addEventListener('change', (event) => {
    const input = event.target.closest('input[data-filter-group]');
    if (!input) return;
    const { filterGroup, filterValue } = input.dataset;
    const set = state.selected.get(filterGroup);
    if (!set) return;
    if (input.checked) {
      set.add(filterValue);
    } else {
      set.delete(filterValue);
    }
    syncInputs(filterGroup, filterValue, input.checked);
    apply();
  });

  select.addEventListener('change', () => {
    state.sort = select.value;
    apply();
  });

  clearAll.addEventListener('click', clearFilters);
  drawerClearAll.addEventListener('click', clearFilters);
  emptyClear.addEventListener('click', clearFilters);

  let scrollLocked = false;
  const setDrawer = (open) => {
    drawer.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    drawer.inert = !open;
    if (open && !scrollLocked) {
      document.body.style.overflow = 'hidden';
      scrollLocked = true;
    } else if (!open && scrollLocked) {
      document.body.style.overflow = '';
      scrollLocked = false;
    }
    if (open) {
      drawerClose.focus();
    } else if (document.activeElement && drawer.contains(document.activeElement)) {
      mobileButton.focus();
    }
  };

  mobileButton.addEventListener('click', () => setDrawer(true));
  drawerClose.addEventListener('click', () => setDrawer(false));
  showResults.addEventListener('click', () => setDrawer(false));
  backdrop.addEventListener('click', () => setDrawer(false));
  block.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
      setDrawer(false);
    }
  });

  apply();
}
