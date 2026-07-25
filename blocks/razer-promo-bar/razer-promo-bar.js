/**
 * Razer Promo Bar block for EDS document authoring.
 *
 * Reproduces the `.sitewide-promo` strip from the Razer gaming-mice
 * demo site. Ships with a baked-in default, so a table containing only
 * the block name renders the exact source strip. Authored rows override
 * individual fields.
 *
 * Table contract (4 columns, typed rows):
 * setting: setting | <key> | <value> | -
 *   keys: content-mode (merge|replace)
 * promo:   promo | text | link-label | link-href
 *
 * The literal `__empty__` clears a preset value (an empty cell keeps it).
 */

const CLEAR_TOKEN = '__empty__';

const DEFAULT_CONTENT = {
  text: 'Gear built for every grip. Compare the full lineup or use the guided finder.',
  linkLabel: 'Find your mouse >',
  linkHref: '/gear-finder',
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

/**
 * Apply an authored value on top of a preset value.
 * Empty keeps the preset; `__empty__` clears it.
 * @param {string} authored
 * @param {string} preset
 * @returns {string}
 */
function applyValue(authored, preset) {
  if (!authored) return preset;
  if (authored === CLEAR_TOKEN) return '';
  return authored;
}

function parseRows(block) {
  const settings = new Map();
  let promo = null;

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const type = cellText(cells[0]).toLowerCase();
    if (type === 'setting') {
      const key = cellText(cells[1]).toLowerCase();
      if (key) settings.set(key, cellText(cells[2]));
      return;
    }
    if (type === 'promo' && !promo) {
      promo = {
        text: cellText(cells[1]),
        linkLabel: cellText(cells[2]),
        linkHref: readHref(cells[3]),
      };
    }
  });

  return { settings, promo };
}

/**
 * Loads and decorates the block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const { settings, promo } = parseRows(block);
  const replace = (settings.get('content-mode') || 'merge').toLowerCase() === 'replace';
  const base = replace ? { text: '', linkLabel: '', linkHref: '' } : DEFAULT_CONTENT;

  const content = {
    text: applyValue(promo?.text || '', base.text),
    linkLabel: applyValue(promo?.linkLabel || '', base.linkLabel),
    linkHref: applyValue(promo?.linkHref || '', base.linkHref),
  };

  block.textContent = '';

  if (!content.text && !content.linkLabel) return;

  const bar = document.createElement('div');
  bar.className = 'sitewide-promo';

  if (content.text) {
    const text = document.createElement('span');
    text.textContent = content.text;
    bar.append(text);
  }

  if (content.linkLabel) {
    const link = document.createElement('a');
    link.textContent = content.linkLabel;
    if (content.linkHref) link.href = content.linkHref;
    bar.append(link);
  }

  block.append(bar);
}
