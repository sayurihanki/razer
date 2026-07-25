/**
 * Razer Family Rail block for EDS document authoring.
 *
 * Reproduces the `.mouse-family-rail` icon navigation from the Razer
 * gaming-mice demo page: a horizontally scrollable strip of product
 * family links (Cobra, DeathAdder, Viper, …) with optional NEW badges.
 * All 11 entries are baked in, so a table containing only the block
 * name renders the exact source rail. Authored rows override or extend
 * entries by key; row order is preserved by key order.
 *
 * Table contract (6 columns, typed rows):
 * setting: setting | <key> | <value> | - | - | -
 *   keys: aria-label, content-mode (merge|replace)
 * family:  family | <key> | <label> | <href> | <icon> | <badge>
 *   - key: stable identifier, e.g. `family-03` (zero-padded, sort-stable)
 *   - icon: uploaded image, pasted link, or plain path
 *   - badge: e.g. `NEW`; `enabled=false` is expressed by an empty label
 *     plus `__empty__`
 *
 * The literal `__empty__` clears a preset value (an empty cell keeps it).
 */

const CLEAR_TOKEN = '__empty__';

const DEFAULT_ARIA_LABEL = 'Gaming mouse families';

const DEFAULT_FAMILIES = [
  {
    key: 'family-01', label: 'Cobra', href: '#products', icon: '/images/razer-mice/nav/cobra.svg', badge: 'NEW',
  },
  {
    key: 'family-02', label: 'Signature Edition', href: 'https://www.razer.com/gaming-mice/razer-signature-edition', icon: '/images/razer-mice/nav/signature-edition.svg', badge: '',
  },
  {
    key: 'family-03', label: 'DeathAdder', href: '#products', icon: '/images/razer-mice/nav/deathadder.svg', badge: '',
  },
  {
    key: 'family-04', label: 'Viper', href: '#products', icon: '/images/razer-mice/nav/viper.svg', badge: 'NEW',
  },
  {
    key: 'family-05', label: 'Naga', href: '#products', icon: '/images/razer-mice/nav/naga.svg', badge: '',
  },
  {
    key: 'family-06', label: 'Basilisk', href: '#products', icon: '/images/razer-mice/nav/basilisk.svg', badge: 'NEW',
  },
  {
    key: 'family-07', label: 'Orochi', href: 'https://www.razer.com/gaming-mice/razer-orochi-v2', icon: '/images/razer-mice/nav/orochi.svg', badge: '',
  },
  {
    key: 'family-08', label: 'Pro Click', href: 'https://www.razer.com/productivity/razer-pro-click-v2', icon: '/images/razer-mice/nav/pro-click.svg', badge: 'NEW',
  },
  {
    key: 'family-09', label: 'Compare', href: 'https://www.razer.com/shop/mice/gaming-mice', icon: '/images/razer-mice/nav/compare.svg', badge: '',
  },
  {
    key: 'family-10', label: 'Accessories', href: 'https://www.razer.com/shop/mice/gaming-mice-accessories', icon: '/images/razer-mice/nav/accessories.svg', badge: '',
  },
  {
    key: 'family-11', label: 'Customs', href: 'https://www.razer.com/customs', icon: '/images/razer-mice/nav/customs.svg', badge: '',
  },
];

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

function parseRows(block) {
  const settings = new Map();
  const authored = new Map();

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const type = cellText(cells[0]).toLowerCase();
    if (type === 'setting') {
      const key = cellText(cells[1]).toLowerCase();
      if (key) settings.set(key, cellText(cells[2]));
      return;
    }
    if (type !== 'family') return;
    const key = cellText(cells[1]).toLowerCase();
    if (!key) return;
    authored.set(key, {
      key,
      label: cellText(cells[2]),
      href: readHref(cells[3]),
      icon: readImageSource(cells[4]),
      badge: cellText(cells[5]),
    });
  });

  return { settings, authored };
}

function mergeFamilies(authored, replace) {
  const merged = new Map();
  if (!replace) {
    DEFAULT_FAMILIES.forEach((family) => merged.set(family.key, { ...family }));
  }

  authored.forEach((entry, key) => {
    const preset = merged.get(key) || {
      key, label: '', href: '', icon: '', badge: '',
    };
    merged.set(key, {
      key,
      label: applyValue(entry.label, preset.label),
      href: applyValue(entry.href, preset.href),
      icon: applyValue(entry.icon, preset.icon),
      badge: applyValue(entry.badge, preset.badge),
    });
  });

  return [...merged.values()]
    .filter((family) => family.label)
    .sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Loads and decorates the block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const { settings, authored } = parseRows(block);
  const replace = (settings.get('content-mode') || 'merge').toLowerCase() === 'replace';
  const families = mergeFamilies(authored, replace);

  block.textContent = '';
  if (!families.length) return;

  const scroll = el('div', 'mouse-family-scroll rzrm-shell');

  families.forEach((family) => {
    const link = el('a');
    if (family.href) link.href = family.href;

    const iconWrap = el('span', 'mouse-family-icon');
    if (family.icon) {
      const icon = el('img');
      icon.src = family.icon;
      icon.alt = '';
      iconWrap.append(icon);
    }
    link.append(iconWrap, el('span', '', [document.createTextNode(family.label)]));

    if (family.badge) {
      link.append(el('small', '', [document.createTextNode(family.badge)]));
    }

    scroll.append(link);
  });

  const rail = el('nav', 'mouse-family-rail', [scroll]);
  rail.setAttribute('aria-label', applyValue(settings.get('aria-label') || '', DEFAULT_ARIA_LABEL));
  block.append(rail);
}
