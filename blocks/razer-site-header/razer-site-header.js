/**
 * Razer Site Header block for EDS document authoring.
 *
 * Reproduces the full site chrome from the Razer gaming-mice demo page:
 * skip link, global nav with Store mega menu, category nav, backdrop,
 * mobile navigation panel, cart panel (light-themed), and the search
 * dialog with its small client-side index. All content is baked in, so
 * a table containing only the block name renders the exact source
 * header. Authored rows override or extend entries by stable key.
 *
 * Table contract (6 columns, typed rows; column 1 is the row type):
 * setting:        setting | <key> | <value>
 * nav:            nav | key | label | href | kind (link|menu)
 * mega-column:    mega-column | key | label
 * mega-link:      mega-link | column-key | key | label | href | feature
 * category:       category | key | label | href
 * mobile-link:    mobile-link | key | label | href
 * panel-cta:      panel-cta | label | href
 * cart-cta:       cart-cta | label | href
 * search-popular: search-popular | key | label | href | terms
 *
 * EDS constraint: every block lives inside its own section wrapper, so
 * `position: sticky` cannot escape it. The header is `position: fixed`
 * instead, with a spacer kept in sync via ResizeObserver, so removing
 * rows (e.g. the category nav) shrinks the reserved space automatically.
 *
 * The literal `__empty__` clears a preset value; `enabled` is expressed
 * by clearing the label.
 */

const CLEAR_TOKEN = '__empty__';

export const DEFAULT_SETTINGS = {
  logo: '/images/razer-mice/razer-logo.svg',
  'logo-alt': '',
  'home-href': '/',
  'home-label': 'Razer home',
  'skip-label': 'Skip to main content',
  'skip-href': '#main-content',
  'nav-aria-label': 'Global navigation',
  'category-aria-label': 'Product categories',
  'search-button-label': 'Search',
  'cart-button-label': 'Open cart, 0 items',
  'menu-button-label': 'Open menu',
  'menu-heading': 'Menu',
  'menu-close-label': 'Close menu',
  'mobile-aria-label': 'Mobile navigation',
  'cart-heading': 'Cart (0)',
  'cart-close-label': 'Close cart',
  'cart-aria-label': 'Shopping cart',
  'cart-empty-title': 'Your cart is empty',
  'cart-empty-body': 'Build a loadout around the way you play.',
  'search-heading': 'Search razer.com',
  'search-close-label': 'Close search',
  'search-label': 'What are you looking for?',
  'search-placeholder': 'Try “Basilisk”',
  'search-submit-label': 'Search',
  'search-popular-label': 'Popular',
  'search-empty-message': 'No matches. Try a product family or “gear finder.”',
};

export const DEFAULT_NAV = [
  {
    key: 'nav-01', label: 'Store', href: '', kind: 'menu',
  },
  {
    key: 'nav-02', label: 'PC', href: '/pc/gaming-mice', kind: 'link',
  },
  {
    key: 'nav-03', label: 'Console', href: 'https://www.razer.com/console-gaming', kind: 'link',
  },
  {
    key: 'nav-04', label: 'Mobile', href: 'https://www.razer.com/mobile', kind: 'link',
  },
  {
    key: 'nav-05', label: 'Furniture & Lifestyle', href: 'https://www.razer.com/lifestyle', kind: 'link',
  },
  {
    key: 'nav-06', label: 'Gold & Silver', href: 'https://www.razer.com/razer-gold', kind: 'link',
  },
  {
    key: 'nav-07', label: 'Community', href: 'https://www.razer.com/community', kind: 'link',
  },
  {
    key: 'nav-08', label: 'Razer.AI', href: 'https://www.razer.ai/', kind: 'link',
  },
  {
    key: 'nav-09', label: 'Support', href: 'https://support.razer.com/', kind: 'link',
  },
];

export const DEFAULT_MEGA_COLUMNS = [
  { key: 'explore', label: 'Explore' },
  { key: 'categories', label: 'Categories' },
  { key: 'featured', label: 'Featured' },
  { key: 'more', label: 'More about' },
];

export const DEFAULT_MEGA_LINKS = [
  {
    columnKey: 'explore', key: 'link-01', label: 'Shop the latest', href: '/pc/gaming-mice', feature: true,
  },
  {
    columnKey: 'explore', key: 'link-02', label: 'Find your gear', href: '/gear-finder', feature: true,
  },
  {
    columnKey: 'explore', key: 'link-03', label: 'Only at Razer', href: 'https://www.razer.com/exclusives', feature: true,
  },
  {
    columnKey: 'categories', key: 'link-01', label: 'Laptops & Accessories', href: 'https://www.razer.com/gaming-laptops', feature: false,
  },
  {
    columnKey: 'categories', key: 'link-02', label: 'Mice', href: '/pc/gaming-mice', feature: false,
  },
  {
    columnKey: 'categories', key: 'link-03', label: 'Mats', href: 'https://www.razer.com/pc/gaming-mouse-mats', feature: false,
  },
  {
    columnKey: 'categories', key: 'link-04', label: 'Keyboards', href: 'https://www.razer.com/pc/gaming-keyboards-and-keypads', feature: false,
  },
  {
    columnKey: 'featured', key: 'link-01', label: 'Razer Basilisk V3 Pro 35K', href: '/gaming-mice/razer-basilisk-v3-pro-35k/RZ01-05240100-R3U1', feature: false,
  },
  {
    columnKey: 'featured', key: 'link-02', label: 'Razer Viper V3 Pro', href: 'https://www.razer.com/gaming-mice/Razer-Viper-V3-Pro/RZ01-05120100-R3U1', feature: false,
  },
  {
    columnKey: 'featured', key: 'link-03', label: 'Razer Blade 18', href: 'https://www.razer.com/gaming-laptops/razer-blade-18', feature: false,
  },
  {
    columnKey: 'more', key: 'link-01', label: 'RazerStores', href: 'https://www.razer.com/razerstores', feature: false,
  },
  {
    columnKey: 'more', key: 'link-02', label: 'Help', href: 'https://support.razer.com/', feature: false,
  },
  {
    columnKey: 'more', key: 'link-03', label: 'FAQ', href: 'https://www.razer.com/store-faq', feature: false,
  },
  {
    columnKey: 'more', key: 'link-04', label: 'RazerCare', href: 'https://www.razer.com/razercare', feature: false,
  },
];

export const DEFAULT_CATEGORIES = [
  { key: 'category-01', label: 'Laptops & Accessories', href: 'https://www.razer.com/gaming-laptops' },
  { key: 'category-02', label: 'Mice', href: '/pc/gaming-mice' },
  { key: 'category-03', label: 'Mats', href: 'https://www.razer.com/pc/gaming-mouse-mats' },
  { key: 'category-04', label: 'Keyboards', href: 'https://www.razer.com/pc/gaming-keyboards-and-keypads' },
  { key: 'category-05', label: 'Controllers', href: 'https://www.razer.com/console-gaming/controllers' },
  { key: 'category-06', label: 'Headsets', href: 'https://www.razer.com/pc/gaming-headsets-and-audio' },
  { key: 'category-07', label: 'Speakers', href: 'https://www.razer.com/pc/gaming-speakers' },
  { key: 'category-08', label: 'Chairs', href: 'https://www.razer.com/gaming-chairs' },
  { key: 'category-09', label: 'Content Creation', href: 'https://www.razer.com/content-creation' },
  { key: 'category-10', label: 'Skins', href: 'https://www.razer.com/skins' },
  { key: 'category-11', label: 'PC Components', href: 'https://www.razer.com/pc/components' },
  { key: 'category-12', label: 'Software', href: 'https://www.razer.com/software' },
];

export const DEFAULT_MOBILE_LINKS = [
  { key: 'mobile-01', label: 'Store', href: '/pc/gaming-mice' },
  { key: 'mobile-02', label: 'PC', href: '/pc/gaming-mice' },
  { key: 'mobile-03', label: 'Console', href: 'https://www.razer.com/console-gaming' },
  { key: 'mobile-04', label: 'Mobile', href: 'https://www.razer.com/mobile' },
  { key: 'mobile-05', label: 'Furniture & Lifestyle', href: 'https://www.razer.com/lifestyle' },
  { key: 'mobile-06', label: 'Gold & Silver', href: 'https://www.razer.com/razer-gold' },
  { key: 'mobile-07', label: 'Community', href: 'https://www.razer.com/community' },
  { key: 'mobile-08', label: 'Razer.AI', href: 'https://www.razer.ai/' },
  { key: 'mobile-09', label: 'Support', href: 'https://support.razer.com/' },
];

export const DEFAULT_PANEL_CTA = { label: 'Find your gear', href: '/gear-finder' };
export const DEFAULT_CART_CTA = { label: 'Browse gaming mice', href: '/pc/gaming-mice' };

export const DEFAULT_SEARCH_INDEX = [
  {
    key: 'search-01', label: 'Gaming mice', href: '/pc/gaming-mice', terms: 'mouse mice basilisk viper cobra naga deathadder',
  },
  {
    key: 'search-02', label: 'Razer Basilisk V3 Pro 35K', href: '/gaming-mice/razer-basilisk-v3-pro-35k/RZ01-05240100-R3U1', terms: 'basilisk ergonomic wireless 35k',
  },
  {
    key: 'search-03', label: 'Find your gear', href: '/gear-finder', terms: 'quiz configurator compare guide finder',
  },
  {
    key: 'search-04', label: 'Razer Blade laptops', href: 'https://www.razer.com/gaming-laptops', terms: 'blade laptop pc',
  },
];

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

function mergeKeyed(presets, authored, fields, replace) {
  const merged = new Map();
  if (!replace) presets.forEach((item) => merged.set(item.key, { ...item }));
  authored.forEach((entry, key) => {
    const preset = merged.get(key)
      || fields.reduce((acc, field) => ({ ...acc, [field]: '' }), { key });
    fields.forEach((field) => {
      preset[field] = applyValue(entry[field], preset[field]);
    });
    merged.set(key, preset);
  });
  return [...merged.values()]
    .filter((item) => item.label)
    .sort((a, b) => a.key.localeCompare(b.key));
}

/* ── Parse ─────────────────────────────────────────────────────── */

function parseRows(block) {
  const parsed = {
    settings: new Map(),
    settingCells: new Map(),
    nav: new Map(),
    megaColumns: new Map(),
    megaLinks: new Map(),
    categories: new Map(),
    mobileLinks: new Map(),
    panelCta: null,
    cartCta: null,
    searchIndex: new Map(),
  };

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const type = cellText(cells[0]).toLowerCase();
    const key = cellText(cells[1]).toLowerCase();

    if (type === 'setting') {
      if (key) {
        parsed.settings.set(key, cellText(cells[2]));
        parsed.settingCells.set(key, cells[2]);
      }
      return;
    }
    if (type === 'nav' && key) {
      parsed.nav.set(key, {
        label: cellText(cells[2]),
        href: readHref(cells[3]),
        kind: cellText(cells[4]).toLowerCase(),
      });
      return;
    }
    if (type === 'mega-column' && key) {
      parsed.megaColumns.set(key, { label: cellText(cells[2]) });
      return;
    }
    if (type === 'mega-link' && key) {
      const linkKey = cellText(cells[2]).toLowerCase();
      if (!linkKey) return;
      parsed.megaLinks.set(`${key}/${linkKey}`, {
        columnKey: key,
        linkKey,
        label: cellText(cells[3]),
        href: readHref(cells[4]),
        feature: cellText(cells[5]).toLowerCase(),
      });
      return;
    }
    if (type === 'category' && key) {
      parsed.categories.set(key, {
        label: cellText(cells[2]),
        href: readHref(cells[3]),
      });
      return;
    }
    if (type === 'mobile-link' && key) {
      parsed.mobileLinks.set(key, {
        label: cellText(cells[2]),
        href: readHref(cells[3]),
      });
      return;
    }
    if (type === 'panel-cta') {
      parsed.panelCta = { label: cellText(cells[1]), href: readHref(cells[2]) };
      return;
    }
    if (type === 'cart-cta') {
      parsed.cartCta = { label: cellText(cells[1]), href: readHref(cells[2]) };
      return;
    }
    if (type === 'search-popular' && key) {
      parsed.searchIndex.set(key, {
        label: cellText(cells[2]),
        href: readHref(cells[3]),
        terms: cellText(cells[4]),
      });
    }
  });

  return parsed;
}

/* ── Build ─────────────────────────────────────────────────────── */

function buildIconButton(className, label) {
  const glyph = el('span');
  glyph.setAttribute('aria-hidden', 'true');
  const button = el('button', `icon-button ${className}`, [glyph]);
  button.type = 'button';
  button.setAttribute('aria-label', label);
  return button;
}

function buildPanelHead(title, closeLabel) {
  const close = el('button', '', [text('×')]);
  close.type = 'button';
  close.setAttribute('aria-label', closeLabel);
  const head = el('div', 'panel-head', [el('strong', '', [text(title)]), close]);
  return { head, close };
}

/**
 * Loads and decorates the block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const parsed = parseRows(block);
  const replace = (parsed.settings.get('content-mode') || 'merge').toLowerCase() === 'replace';

  const config = { ...DEFAULT_SETTINGS };
  parsed.settings.forEach((value, key) => {
    if (!(key in config)) return;
    config[key] = value === CLEAR_TOKEN ? '' : value;
  });
  if (parsed.settingCells.has('logo')) {
    config.logo = applyValue(readImageSource(parsed.settingCells.get('logo')), config.logo);
  }

  const nav = mergeKeyed(DEFAULT_NAV, parsed.nav, ['label', 'href', 'kind'], replace);
  const megaColumns = mergeKeyed(DEFAULT_MEGA_COLUMNS, parsed.megaColumns, ['label'], replace);
  const megaLinkPresets = DEFAULT_MEGA_LINKS.map((link) => ({
    ...link,
    key: `${link.columnKey}/${link.key}`,
    feature: link.feature ? 'true' : '',
  }));
  const megaLinks = mergeKeyed(
    megaLinkPresets,
    parsed.megaLinks,
    ['label', 'href', 'feature'],
    replace,
  );
  const categories = mergeKeyed(DEFAULT_CATEGORIES, parsed.categories, ['label', 'href'], replace);
  const mobileLinks = mergeKeyed(DEFAULT_MOBILE_LINKS, parsed.mobileLinks, ['label', 'href'], replace);
  const searchIndex = mergeKeyed(
    DEFAULT_SEARCH_INDEX,
    parsed.searchIndex,
    ['label', 'href', 'terms'],
    replace,
  );

  const panelCtaBase = replace ? { label: '', href: '' } : DEFAULT_PANEL_CTA;
  const panelCta = {
    label: applyValue(parsed.panelCta?.label || '', panelCtaBase.label),
    href: applyValue(parsed.panelCta?.href || '', panelCtaBase.href),
  };
  const cartCtaBase = replace ? { label: '', href: '' } : DEFAULT_CART_CTA;
  const cartCta = {
    label: applyValue(parsed.cartCta?.label || '', cartCtaBase.label),
    href: applyValue(parsed.cartCta?.href || '', cartCtaBase.href),
  };

  block.textContent = '';

  /* Skip link */
  if (config['skip-label']) {
    const skip = el('a', 'skip-link', [text(config['skip-label'])]);
    skip.href = config['skip-href'] || '#main-content';
    block.append(skip);
  }

  /* Global nav */
  const brand = el('a', 'brand-mark');
  brand.href = config['home-href'];
  brand.setAttribute('aria-label', config['home-label']);
  const logo = el('img');
  logo.src = config.logo;
  logo.alt = config['logo-alt'];
  logo.width = 35;
  logo.height = 35;
  brand.append(logo);

  const desktopNav = el('div', 'desktop-nav');
  let megaButton = null;
  nav.forEach((item) => {
    if (item.kind === 'menu') {
      const button = el('button', 'nav-link', [text(item.label)]);
      button.type = 'button';
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', 'store-mega-menu');
      if (!megaButton) megaButton = button;
      desktopNav.append(button);
      return;
    }
    const link = el('a', 'nav-link', [text(item.label)]);
    if (item.href) link.href = item.href;
    desktopNav.append(link);
  });

  const searchButton = buildIconButton('search-icon', config['search-button-label']);
  const cartButton = buildIconButton('cart-icon', config['cart-button-label']);
  const menuButton = buildIconButton('menu-icon', config['menu-button-label']);
  const actions = el('div', 'nav-actions', [searchButton, cartButton, menuButton]);

  const globalNav = el('nav', 'global-nav rzrm-shell', [brand, desktopNav, actions]);
  globalNav.setAttribute('aria-label', config['nav-aria-label']);

  /* Mega menu */
  const megaGrid = el('div', 'rzrm-shell mega-grid');
  megaColumns.forEach((column) => {
    const columnNode = el('div', '', [el('p', 'menu-label', [text(column.label)])]);
    megaLinks
      .filter((link) => link.columnKey === column.key)
      .forEach((link) => {
        const isFeature = link.feature === 'true';
        const anchor = el('a', isFeature ? 'mega-feature' : '', [text(link.label)]);
        if (isFeature) anchor.append(text(' '), el('span', '', [text('›')]));
        if (link.href) anchor.href = link.href;
        columnNode.append(anchor);
      });
    megaGrid.append(columnNode);
  });
  const megaMenu = el('div', 'mega-menu', [megaGrid]);
  megaMenu.id = 'store-mega-menu';
  megaMenu.setAttribute('aria-hidden', 'true');

  /* Category nav */
  const categoryScroll = el('div', 'rzrm-shell category-scroll');
  categories.forEach((category) => {
    const link = el('a', '', [text(category.label)]);
    if (category.href) link.href = category.href;
    categoryScroll.append(link);
  });
  const categoryNav = el('nav', 'category-nav', [categoryScroll]);
  categoryNav.setAttribute('aria-label', config['category-aria-label']);

  const header = el('header', 'site-header', [globalNav, megaMenu]);
  if (categories.length) header.append(categoryNav);

  /* Spacer keeps page content clear of the fixed header */
  const spacer = el('div', 'site-header-spacer');
  spacer.setAttribute('aria-hidden', 'true');

  /* Backdrop */
  const backdrop = el('div', 'backdrop');
  backdrop.setAttribute('aria-hidden', 'true');

  /* Mobile panel */
  const mobileHead = buildPanelHead(config['menu-heading'], config['menu-close-label']);
  const mobileLinksNode = el('div', 'mobile-links');
  mobileLinks.forEach((item) => {
    const link = el('a', '', [text(item.label), el('span', '', [text('›')])]);
    if (item.href) link.href = item.href;
    mobileLinksNode.append(link);
  });
  const mobilePanel = el('aside', 'side-panel mobile-panel', [mobileHead.head, mobileLinksNode]);
  mobilePanel.setAttribute('aria-label', config['mobile-aria-label']);
  if (panelCta.label) {
    const cta = el('a', 'button button-primary panel-cta', [text(panelCta.label)]);
    if (panelCta.href) cta.href = panelCta.href;
    mobilePanel.append(cta);
  }

  /* Cart panel */
  const cartHead = buildPanelHead(config['cart-heading'], config['cart-close-label']);
  const cartIcon = el('span', 'empty-cart-icon');
  cartIcon.setAttribute('aria-hidden', 'true');
  const emptyCart = el('div', 'empty-cart', [
    cartIcon,
    el('h2', '', [text(config['cart-empty-title'])]),
    el('p', '', [text(config['cart-empty-body'])]),
  ]);
  if (cartCta.label) {
    const cta = el('a', 'button button-primary', [text(cartCta.label)]);
    if (cartCta.href) cta.href = cartCta.href;
    emptyCart.append(cta);
  }
  const cartPanel = el('aside', 'side-panel cart-panel', [cartHead.head, emptyCart]);
  cartPanel.setAttribute('aria-label', config['cart-aria-label']);

  /* Search dialog */
  const searchHead = buildPanelHead(config['search-heading'], config['search-close-label']);
  const searchInput = el('input');
  searchInput.id = 'site-search';
  searchInput.placeholder = config['search-placeholder'];
  searchInput.autocomplete = 'off';
  const searchSubmit = el('button', '', [text(config['search-submit-label'])]);
  searchSubmit.type = 'submit';
  const searchLabel = el('label', '', [text(config['search-label'])]);
  searchLabel.htmlFor = 'site-search';
  const searchForm = el('form', 'search-form', [
    searchLabel,
    el('div', 'search-input-wrap', [searchInput, searchSubmit]),
  ]);
  searchForm.noValidate = true;
  const searchResultsLabel = el('p', 'menu-label', [text(config['search-popular-label'])]);
  const searchResultsList = el('div');
  const searchResults = el('div', 'search-results', [searchResultsLabel, searchResultsList]);
  const searchDialog = el('div', 'search-dialog', [searchHead.head, searchForm, searchResults]);
  searchDialog.setAttribute('role', 'dialog');
  searchDialog.setAttribute('aria-modal', 'true');
  searchDialog.setAttribute('aria-label', config['search-heading']);
  searchDialog.setAttribute('aria-hidden', 'true');

  block.append(spacer, header, backdrop, mobilePanel, cartPanel, searchDialog);

  /* ── Behavior ── */

  const panels = [
    { node: megaMenu, isMega: true },
    { node: mobilePanel },
    { node: cartPanel },
    { node: searchDialog },
  ];

  const anyOpen = () => panels.some(({ node }) => node.classList.contains('is-open'));

  const closeAll = () => {
    panels.forEach(({ node }) => {
      node.classList.remove('is-open');
      node.setAttribute('aria-hidden', 'true');
    });
    if (megaButton) megaButton.setAttribute('aria-expanded', 'false');
    backdrop.classList.remove('is-open');
  };

  const openPanel = (target) => {
    closeAll();
    target.classList.add('is-open');
    target.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('is-open');
  };

  if (megaButton) {
    megaButton.addEventListener('click', () => {
      const isOpen = megaMenu.classList.contains('is-open');
      if (isOpen) {
        closeAll();
      } else {
        openPanel(megaMenu);
        megaButton.setAttribute('aria-expanded', 'true');
      }
    });
  }
  searchButton.addEventListener('click', () => {
    openPanel(searchDialog);
    searchInput.focus();
  });
  cartButton.addEventListener('click', () => openPanel(cartPanel));
  menuButton.addEventListener('click', () => openPanel(mobilePanel));
  mobileHead.close.addEventListener('click', closeAll);
  cartHead.close.addEventListener('click', closeAll);
  searchHead.close.addEventListener('click', closeAll);
  backdrop.addEventListener('click', closeAll);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && anyOpen()) closeAll();
  });

  /* Search: tiny client-side index, same behavior as the source */
  const renderSearchResults = () => {
    const query = searchInput.value.trim().toLowerCase();
    const results = query
      ? searchIndex.filter(
        (entry) => `${entry.label} ${entry.terms}`.toLowerCase().includes(query),
      )
      : searchIndex.slice(0, 3);

    searchResultsLabel.textContent = query
      ? `${results.length} result${results.length === 1 ? '' : 's'}`
      : config['search-popular-label'];

    searchResultsList.textContent = '';
    if (!results.length) {
      searchResultsList.append(
        el('p', 'search-empty', [text(config['search-empty-message'])]),
      );
      return;
    }
    results.forEach((entry) => {
      const link = el('a', '', [text(entry.label), el('span', '', [text('›')])]);
      if (entry.href) link.href = entry.href;
      link.addEventListener('click', closeAll);
      searchResultsList.append(link);
    });
  };
  renderSearchResults();
  searchInput.addEventListener('input', renderSearchResults);
  searchForm.addEventListener('submit', (event) => event.preventDefault());

  /* Fixed-header spacer, measured so authored changes stay in sync */
  const syncSpacer = () => {
    spacer.style.height = `${header.getBoundingClientRect().height}px`;
  };
  syncSpacer();
  window.addEventListener('resize', syncSpacer);
  if (typeof ResizeObserver !== 'undefined') {
    // Also observe the header itself: authored content (e.g. removing the
    // category rows) can change its height without a viewport resize.
    new ResizeObserver(syncSpacer).observe(header);
  }
}
