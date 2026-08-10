/**
 * Razer PLP Intro block for EDS document authoring.
 *
 * Reproduces the `.plp-intro` section from the Razer gaming-mice demo
 * page: eyebrow, heading, supporting copy, and a ghost CTA, with the
 * `#products` anchor targeted by the family rail. Content is baked in,
 * so a table containing only the block name renders the exact source
 * section. Authored rows override individual fields.
 *
 * Table contract (3 columns, typed rows):
 * setting: setting | <key> | <value>
 *   keys: anchor-id, eyebrow, heading, body, content-mode (merge|replace)
 * cta:     cta | <label> | <href>
 *
 * The literal `__empty__` clears a preset value (an empty cell keeps it).
 */

const CLEAR_TOKEN = '__empty__';

const DEFAULT_CONTENT = {
  anchorId: 'products',
  eyebrow: 'Choose your control',
  heading: 'Find your next mouse',
  body: 'Filter by family, connection, and playstyle. Every result links to a complete product page or Razer.com purchase experience.',
  ctaLabel: 'Use the gear finder',
  ctaHref: '/gear-finder',
};

const EMPTY_CONTENT = {
  anchorId: '',
  eyebrow: '',
  heading: '',
  body: '',
  ctaLabel: '',
  ctaHref: '',
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
  let cta = null;

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const type = cellText(cells[0]).toLowerCase();
    if (type === 'setting') {
      const key = cellText(cells[1]).toLowerCase();
      if (key) settings.set(key, cellText(cells[2]));
      return;
    }
    if (type === 'cta' && !cta) {
      cta = { label: cellText(cells[1]), href: readHref(cells[2]) };
    }
  });

  const replace = (settings.get('content-mode') || 'merge').toLowerCase() === 'replace';
  const base = replace ? EMPTY_CONTENT : DEFAULT_CONTENT;

  const content = {
    anchorId: applyValue(settings.get('anchor-id') || '', base.anchorId),
    eyebrow: applyValue(settings.get('eyebrow') || '', base.eyebrow),
    heading: applyValue(settings.get('heading') || '', base.heading),
    body: applyValue(settings.get('body') || '', base.body),
    ctaLabel: applyValue(cta?.label || '', base.ctaLabel),
    ctaHref: applyValue(cta?.href || '', base.ctaHref),
  };

  block.textContent = '';

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

  const section = el('section', 'plp-intro rzr-shell', [copy]);
  if (content.anchorId) section.id = content.anchorId;

  if (content.ctaLabel) {
    const arrow = el('span', '', [document.createTextNode('›')]);
    const link = el('a', 'button button-ghost', [
      document.createTextNode(`${content.ctaLabel} `),
      arrow,
    ]);
    if (content.ctaHref) link.href = content.ctaHref;
    section.append(link);
  }

  block.append(section);
}
