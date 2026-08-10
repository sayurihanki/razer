/**
 * Razer Proof Banner block for EDS document authoring.
 *
 * Reproduces the `.mouse-proof` section from the Razer gaming-mice demo
 * page: brand badge image, eyebrow, heading, supporting copy, and an
 * external source link. Content is baked in, so a table containing only
 * the block name renders the exact source section. Authored rows
 * override individual fields.
 *
 * Table contract (3 columns, typed rows):
 * setting: setting | <key> | <value>
 *   keys: badge, badge-alt, eyebrow, heading, body, content-mode (merge|replace)
 * link:    link | <label> | <href>
 *
 * The `badge` setting accepts an uploaded image, a pasted link, or a
 * plain path. The literal `__empty__` clears a preset value.
 */

const CLEAR_TOKEN = '__empty__';

const DEFAULT_CONTENT = {
  badge: '/images/razer-mice/mouse-brand-badge.webp',
  badgeAlt: 'Number one mouse brand badge',
  eyebrow: 'Performance, proven',
  heading: 'Built for every kind of victory.',
  body: 'From ultra-light esports shapes to fully configurable ergonomic control, each Razer family is designed around a distinct way to play.',
  linkLabel: 'Pro Gaming Gear of the Year 2025 source',
  linkHref: 'https://prosettings.net/blog/pro-gaming-gear-of-the-year-2025/',
};

const EMPTY_CONTENT = {
  badge: '',
  badgeAlt: '',
  eyebrow: '',
  heading: '',
  body: '',
  linkLabel: '',
  linkHref: '',
};

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

/**
 * Loads and decorates the block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const settings = new Map();
  const settingCells = new Map();
  let link = null;

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const type = cellText(cells[0]).toLowerCase();
    if (type === 'setting') {
      const key = cellText(cells[1]).toLowerCase();
      if (key) {
        settings.set(key, cellText(cells[2]));
        settingCells.set(key, cells[2]);
      }
      return;
    }
    if (type === 'link' && !link) {
      link = { label: cellText(cells[1]), href: readHref(cells[2]) };
    }
  });

  const replace = (settings.get('content-mode') || 'merge').toLowerCase() === 'replace';
  const base = replace ? EMPTY_CONTENT : DEFAULT_CONTENT;

  const authoredBadge = settingCells.has('badge')
    ? readImageSource(settingCells.get('badge'))
    : '';

  const content = {
    badge: applyValue(authoredBadge, base.badge),
    badgeAlt: applyValue(settings.get('badge-alt') || '', base.badgeAlt),
    eyebrow: applyValue(settings.get('eyebrow') || '', base.eyebrow),
    heading: applyValue(settings.get('heading') || '', base.heading),
    body: applyValue(settings.get('body') || '', base.body),
    linkLabel: applyValue(link?.label || '', base.linkLabel),
    linkHref: applyValue(link?.href || '', base.linkHref),
  };

  block.textContent = '';

  const inner = el('div', 'rzr-shell mouse-proof-inner');

  if (content.badge) {
    const badge = el('img');
    badge.src = content.badge;
    badge.alt = content.badgeAlt;
    badge.loading = 'lazy';
    inner.append(badge);
  }

  const copy = el('div');
  if (content.eyebrow) {
    copy.append(el('p', 'eyebrow', [document.createTextNode(content.eyebrow)]));
  }
  if (content.heading) {
    copy.append(el('h2', '', [document.createTextNode(content.heading)]));
  }
  if (content.body) {
    copy.append(el('p', '', [document.createTextNode(content.body)]));
  }
  inner.append(copy);

  if (content.linkLabel) {
    const arrow = el('span', '', [document.createTextNode('↗')]);
    const source = el('a', 'text-link', [
      document.createTextNode(`${content.linkLabel} `),
      arrow,
    ]);
    if (content.linkHref) source.href = content.linkHref;
    inner.append(source);
  }

  block.append(el('section', 'mouse-proof', [inner]));
}
