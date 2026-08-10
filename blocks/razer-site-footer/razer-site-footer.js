/**
 * Razer Site Footer block for EDS document authoring.
 *
 * Reproduces the `.site-footer` from the Razer gaming-mice demo page:
 * newsletter signup strip, brand column with social links, four link
 * columns (Shop / Explore / Support / Company), and the legal row. All
 * content is baked in, so a table containing only the block name
 * renders the exact source footer. Authored rows override or extend
 * entries by stable key.
 *
 * Table contract (6 columns, typed rows; column 1 is the row type):
 * setting:     setting | <key> | <value>
 * social:      social | key | label | aria-label | href
 * column:      column | key | heading
 * column-link: column-link | column-key | key | label | href
 * legal-link:  legal-link | key | label | href
 *
 * The newsletter form validates client-side only (parity with the
 * source demo): a valid email shows the success message, anything else
 * the error message, via an `aria-live` region. Nothing is sent.
 *
 * The literal `__empty__` clears a preset value; clearing a label
 * removes the entry.
 */

const CLEAR_TOKEN = '__empty__';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const DEFAULT_SETTINGS = {
  logo: '/images/razer-mice/razer-logo.svg',
  'logo-alt': '',
  tagline: 'FOR GAMERS.\nBY GAMERS.™',
  'social-aria-label': 'Social media',
  'newsletter-eyebrow': 'Stay in the ecosystem',
  'newsletter-heading': 'Gear drops. Technology. Team Razer.',
  'newsletter-body': 'Get product news and Razer releases in your inbox.',
  'newsletter-label': 'Email address',
  'newsletter-placeholder': 'Email address',
  'newsletter-cta': 'Sign up',
  'newsletter-success': 'Thanks — this demo validates the form without sending your address.',
  'newsletter-error': 'Enter a valid email address.',
  copyright: 'Copyright © 2026 Razer Inc. All rights reserved.',
  locale: 'United States · English',
};

export const DEFAULT_SOCIAL = [
  {
    key: 'social-01', label: 'IG', ariaLabel: 'Instagram', href: 'https://www.instagram.com/razer/',
  },
  {
    key: 'social-02', label: 'YT', ariaLabel: 'YouTube', href: 'https://www.youtube.com/razer',
  },
  {
    key: 'social-03', label: 'TW', ariaLabel: 'Twitch', href: 'https://www.twitch.tv/razer',
  },
  {
    key: 'social-04', label: 'DC', ariaLabel: 'Discord', href: 'https://discord.com/invite/razer',
  },
];

export const DEFAULT_COLUMNS = [
  { key: 'column-01', heading: 'Shop' },
  { key: 'column-02', heading: 'Explore' },
  { key: 'column-03', heading: 'Support' },
  { key: 'column-04', heading: 'Company' },
];

export const DEFAULT_COLUMN_LINKS = [
  {
    columnKey: 'column-01', key: 'link-01', label: 'RazerStores', href: '/pc/gaming-mice',
  },
  {
    columnKey: 'column-01', key: 'link-02', label: 'Store Locator', href: '/support',
  },
  {
    columnKey: 'column-01', key: 'link-03', label: 'Purchase Programs', href: 'https://www.razer.com/corporate-programs',
  },
  {
    columnKey: 'column-01', key: 'link-04', label: 'Only at Razer', href: '/pc/gaming-mice',
  },
  {
    columnKey: 'column-01', key: 'link-05', label: 'Razer Silver', href: '/pc/gaming-mice',
  },
  {
    columnKey: 'column-02', key: 'link-01', label: 'Technology', href: '/pc/gaming-mice',
  },
  {
    columnKey: 'column-02', key: 'link-02', label: 'Chroma RGB', href: 'https://www.razer.com/chroma',
  },
  {
    columnKey: 'column-02', key: 'link-03', label: 'Concepts', href: 'https://www.razer.com/concepts',
  },
  {
    columnKey: 'column-02', key: 'link-04', label: 'Esports', href: '/pc/gaming-mice',
  },
  {
    columnKey: 'column-02', key: 'link-05', label: 'Collabs', href: 'https://www.razer.com/collabs',
  },
  {
    columnKey: 'column-03', key: 'link-01', label: 'Get Help', href: '/support',
  },
  {
    columnKey: 'column-03', key: 'link-02', label: 'Registration & Warranty', href: '/customer/account',
  },
  {
    columnKey: 'column-03', key: 'link-03', label: 'RazerStore Support', href: '/support',
  },
  {
    columnKey: 'column-03', key: 'link-04', label: 'RazerCare', href: 'https://www.razer.com/razercare',
  },
  {
    columnKey: 'column-03', key: 'link-05', label: 'Manage Razer ID', href: '/customer/account',
  },
  {
    columnKey: 'column-03', key: 'link-06', label: 'Accessibility Statement', href: 'https://www.razer.com/accessibility',
  },
  {
    columnKey: 'column-04', key: 'link-01', label: 'About Us', href: 'https://www.razer.com/about-razer',
  },
  {
    columnKey: 'column-04', key: 'link-02', label: 'Careers', href: 'https://careers.razer.com/',
  },
  {
    columnKey: 'column-04', key: 'link-03', label: 'Newsroom', href: 'https://press.razer.com/',
  },
  {
    columnKey: 'column-04', key: 'link-04', label: 'Contact Us', href: 'https://www.razer.com/contact-us',
  },
];

export const DEFAULT_LEGAL_LINKS = [
  { key: 'legal-01', label: 'Legal Terms', href: '/privacy-policy' },
  { key: 'legal-02', label: 'Privacy Policy', href: '/privacy-policy' },
  { key: 'legal-03', label: 'Cookie Policy', href: 'https://www.razer.com/cookie-policy' },
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
  return [...merged.values()].sort((a, b) => a.key.localeCompare(b.key));
}

/* ── Decorate ──────────────────────────────────────────────────── */

/**
 * Loads and decorates the block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const parsed = {
    settings: new Map(),
    settingCells: new Map(),
    social: new Map(),
    columns: new Map(),
    columnLinks: new Map(),
    legalLinks: new Map(),
  };

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const type = cellText(cells[0]).toLowerCase();
    const key = cellText(cells[1]).toLowerCase();

    if (type === 'setting' && key) {
      parsed.settings.set(key, cellText(cells[2]));
      parsed.settingCells.set(key, cells[2]);
      return;
    }
    if (type === 'social' && key) {
      parsed.social.set(key, {
        label: cellText(cells[2]),
        ariaLabel: cellText(cells[3]),
        href: readHref(cells[4]),
      });
      return;
    }
    if (type === 'column' && key) {
      parsed.columns.set(key, { heading: cellText(cells[2]) });
      return;
    }
    if (type === 'column-link' && key) {
      const linkKey = cellText(cells[2]).toLowerCase();
      if (!linkKey) return;
      parsed.columnLinks.set(`${key}/${linkKey}`, {
        columnKey: key,
        label: cellText(cells[3]),
        href: readHref(cells[4]),
      });
      return;
    }
    if (type === 'legal-link' && key) {
      parsed.legalLinks.set(key, {
        label: cellText(cells[2]),
        href: readHref(cells[3]),
      });
    }
  });

  const replace = (parsed.settings.get('content-mode') || 'merge').toLowerCase() === 'replace';

  const config = { ...DEFAULT_SETTINGS };
  parsed.settings.forEach((value, key) => {
    if (!(key in config)) return;
    config[key] = value === CLEAR_TOKEN ? '' : value;
  });
  if (parsed.settingCells.has('logo')) {
    config.logo = applyValue(readImageSource(parsed.settingCells.get('logo')), config.logo);
  }

  const social = mergeKeyed(DEFAULT_SOCIAL, parsed.social, ['label', 'ariaLabel', 'href'], replace)
    .filter((item) => item.label);
  const columnPresets = DEFAULT_COLUMNS.map((column) => ({ ...column }));
  const columns = mergeKeyed(columnPresets, parsed.columns, ['heading'], replace)
    .filter((column) => column.heading);
  const columnLinkPresets = DEFAULT_COLUMN_LINKS.map((link) => ({
    ...link,
    key: `${link.columnKey}/${link.key}`,
  }));
  const columnLinks = mergeKeyed(columnLinkPresets, parsed.columnLinks, ['label', 'href'], replace)
    .filter((link) => link.label);
  const legalLinks = mergeKeyed(DEFAULT_LEGAL_LINKS, parsed.legalLinks, ['label', 'href'], replace)
    .filter((link) => link.label);

  block.textContent = '';

  const footer = el('footer', 'site-footer');

  /* Newsletter */
  if (config['newsletter-heading']) {
    const copy = el('div', '', [
      config['newsletter-eyebrow'] ? el('p', 'eyebrow', [text(config['newsletter-eyebrow'])]) : null,
      el('h2', '', [text(config['newsletter-heading'])]),
      config['newsletter-body'] ? el('p', '', [text(config['newsletter-body'])]) : null,
    ]);

    const input = el('input');
    input.id = 'newsletter-email';
    input.type = 'email';
    input.placeholder = config['newsletter-placeholder'];
    const submit = el('button', '', [text(config['newsletter-cta'])]);
    submit.type = 'submit';
    const label = el('label', '', [text(config['newsletter-label'])]);
    label.htmlFor = 'newsletter-email';
    const message = el('p', 'form-message');
    message.setAttribute('aria-live', 'polite');
    const form = el('form', '', [
      label,
      el('div', 'newsletter-input', [input, submit]),
      message,
    ]);
    form.noValidate = true;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      message.textContent = EMAIL_PATTERN.test(input.value.trim())
        ? config['newsletter-success']
        : config['newsletter-error'];
    });

    footer.append(el('section', 'newsletter-section', [
      el('div', 'shell newsletter-grid', [copy, form]),
    ]));
  }

  /* Main columns */
  const main = el('div', 'shell footer-main');

  const brand = el('div', 'footer-brand');
  if (config.logo) {
    const logo = el('img');
    logo.src = config.logo;
    logo.alt = config['logo-alt'];
    logo.width = 42;
    logo.height = 42;
    brand.append(logo);
  }
  if (config.tagline) {
    const tagline = el('p');
    config.tagline.split('\n').forEach((line, index) => {
      if (index) tagline.append(el('br'));
      tagline.append(text(line));
    });
    brand.append(tagline);
  }
  if (social.length) {
    const socials = el('div', 'social-links');
    socials.setAttribute('aria-label', config['social-aria-label']);
    social.forEach((item) => {
      const link = el('a', '', [text(item.label)]);
      if (item.ariaLabel) link.setAttribute('aria-label', item.ariaLabel);
      if (item.href) link.href = item.href;
      socials.append(link);
    });
    brand.append(socials);
  }
  main.append(brand);

  columns.forEach((column) => {
    const nav = el('nav', 'footer-column', [el('h3', '', [text(column.heading)])]);
    nav.setAttribute('aria-label', `${column.heading} links`);
    columnLinks
      .filter((link) => link.columnKey === column.key)
      .forEach((link) => {
        const anchor = el('a', '', [text(link.label)]);
        if (link.href) anchor.href = link.href;
        nav.append(anchor);
      });
    main.append(nav);
  });
  footer.append(main);

  /* Legal row */
  const legal = el('div', 'shell footer-legal');
  if (config.copyright) legal.append(el('span', '', [text(config.copyright)]));
  if (legalLinks.length) {
    const links = el('div');
    legalLinks.forEach((link) => {
      const anchor = el('a', '', [text(link.label)]);
      if (link.href) anchor.href = link.href;
      links.append(anchor);
    });
    legal.append(links);
  }
  if (config.locale) legal.append(el('span', '', [text(config.locale)]));
  footer.append(legal);

  block.append(footer);
}
