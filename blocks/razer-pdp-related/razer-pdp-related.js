/**
 * Razer PDP Related block for EDS document authoring.
 *
 * The "More ways to play." related-products rail of the Basilisk V3
 * Pro 35K product page: section heading with the view-all link and
 * three product cards with a conventional hover lift and image zoom.
 * Motion is limited to a single fade-up for the grid. All content is
 * baked in, so a table containing only the block name renders the
 * complete section. Authored rows override or extend entries by
 * stable key.
 *
 * Table contract (8 columns, typed rows; column 1 is the row type):
 * setting: setting | <key> | <value>
 * product: product | key | image | meta | title | description | price | href
 *
 * Reveal animation honors `prefers-reduced-motion`.
 *
 * The literal `__empty__` clears a preset value; an empty title on a
 * product row removes the preset entry.
 */

const CLEAR_TOKEN = '__empty__';

export const DEFAULT_SETTINGS = {
  eyebrow: 'Related products',
  heading: 'More ways to play.',
  'link-label': 'View all gaming mice',
  'link-href': '/pc/gaming-mice',
  'cta-label': 'Browse gaming mice',
};

/*
 * None of these three exist in the Commerce catalog — the Basilisk V3 Pro 35K
 * is the only Razer SKU in it. They are editorial cards, so they carry no
 * price: an unverifiable figure sitting on the same page as a real, cart-backed
 * price is worse than no figure at all. Add the SKUs to the catalog and these
 * can be hydrated the same way razer-pdp-hero is.
 */
export const DEFAULT_PRODUCTS = [
  {
    key: 'product-01',
    image: '/images/razer-mice/products/viper-v3-pro.webp',
    meta: 'Viper · Wireless',
    title: 'Razer Viper V3 Pro',
    description: 'Ultra-lightweight symmetrical wireless esports gaming mouse with HyperPolling 8000 Hz',
    price: '',
    href: '/pc/gaming-mice',
  },
  {
    key: 'product-02',
    image: '/images/razer-mice/products/basilisk-v3-35k.webp',
    meta: 'Basilisk · Wired',
    title: 'Razer Basilisk V3 35K',
    description: 'Fully customizable ergonomic RGB gaming mouse',
    price: '',
    href: '/pc/gaming-mice',
  },
  {
    key: 'product-03',
    image: '/images/razer-mice/products/cobra-pro.webp',
    meta: 'Cobra · Multi-mode',
    title: 'Razer Cobra Pro',
    description: 'Customizable wireless gaming mouse with Razer Chroma RGB',
    price: '',
    href: '/pc/gaming-mice',
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

function mergeContent(block) {
  const settings = new Map();
  const settingCells = new Map();
  const products = new Map();

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
    if (type === 'product' && key) products.set(key, cells);
  });

  const replace = (settings.get('content-mode') || 'merge').toLowerCase() === 'replace';

  const config = { ...DEFAULT_SETTINGS };
  if (replace) Object.keys(config).forEach((key) => { config[key] = ''; });
  Object.keys(DEFAULT_SETTINGS).forEach((key) => {
    const authored = key.endsWith('-href')
      ? readHref(settingCells.get(key))
      : settings.get(key) || '';
    config[key] = applyValue(authored, config[key]);
  });

  const merged = new Map();
  if (!replace) DEFAULT_PRODUCTS.forEach((entry) => merged.set(entry.key, { ...entry }));
  products.forEach((cells, key) => {
    const preset = merged.get(key) || {
      key, image: '', meta: '', title: '', description: '', price: '', href: '',
    };
    preset.image = applyValue(readImageSource(cells[2]), preset.image);
    preset.meta = applyValue(cellText(cells[3]), preset.meta);
    preset.title = applyValue(cellText(cells[4]), preset.title);
    preset.description = applyValue(cellText(cells[5]), preset.description);
    preset.price = applyValue(cellText(cells[6]), preset.price);
    preset.href = applyValue(readHref(cells[7]), preset.href);
    if (!preset.title) {
      merged.delete(key);
      return;
    }
    merged.set(key, preset);
  });

  return {
    config,
    products: [...merged.values()].sort((a, b) => a.key.localeCompare(b.key)),
  };
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
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  targets.forEach((target) => observer.observe(target));
}

/* ── Decorate ──────────────────────────────────────────────────── */

/**
 * Loads and decorates the block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const { config, products } = mergeContent(block);

  block.textContent = '';

  const section = el('section', 'related-section');
  const shell = el('div', 'shell');

  const headingCopy = el('div');
  if (config.eyebrow) headingCopy.append(el('p', 'eyebrow', [text(config.eyebrow)]));
  if (config.heading) headingCopy.append(el('h2', '', [text(config.heading)]));
  const heading = el('div', 'section-heading', [headingCopy]);
  heading.dataset.reveal = '';
  if (config['link-label']) {
    const link = el('a', 'text-link', [
      text(`${config['link-label']} `),
      el('span', '', [text('›')]),
    ]);
    link.href = config['link-href'];
    heading.append(link);
  }
  shell.append(heading);

  if (products.length) {
    const grid = el('div', 'related-grid');
    grid.dataset.reveal = '';
    products.forEach((product) => {
      const card = el('article', 'related-card');

      if (product.image) {
        const media = el('a', 'related-media');
        media.href = product.href;
        media.setAttribute('aria-label', `View ${product.title}`);
        media.tabIndex = -1;
        const img = el('img');
        img.src = product.image;
        img.alt = product.title;
        img.loading = 'lazy';
        img.width = IMAGE_SIZE.width;
        img.height = IMAGE_SIZE.height;
        media.append(img);
        card.append(media);
      }

      const body = el('div', 'related-body');
      if (product.meta) body.append(el('span', 'related-meta', [text(product.meta)]));
      const titleLink = el('a', '', [text(product.title)]);
      titleLink.href = product.href;
      body.append(el('h3', '', [titleLink]));
      if (product.description) body.append(el('p', '', [text(product.description)]));
      if (product.price) body.append(el('strong', '', [text(product.price)]));
      if (config['cta-label']) {
        const cta = el('a', 'button button-outline', [text(config['cta-label'])]);
        cta.href = product.href;
        body.append(cta);
      }
      card.append(body);
      grid.append(card);
    });
    shell.append(grid);
  }

  section.append(shell);
  block.append(section);

  initReveals(block);
}
