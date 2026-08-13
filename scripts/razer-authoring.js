/**
 * The typed-row authoring contract shared by the razer-blade18-* family.
 *
 * Every block in that family follows the convention the razer-pdp-* blocks
 * established: the block ships its whole design as baked-in defaults, so a
 * DA.live table holding nothing but the block name renders the finished
 * section, and authored rows override or extend those defaults by stable key.
 *
 * The razer-pdp-* blocks each carry their own copy of this parser. Five more
 * copies is five more places for the semantics to drift, so the blade18 family
 * shares one — the same reasoning that put responsive-image.js in scripts/
 * rather than in each block that needs a srcset.
 *
 * Row shape, in every table: column 1 is the row type, column 2 the key, and
 * the remaining columns are the type's own fields.
 *
 *   | setting | <key>  | <value>                    |
 *   | <type>  | <key>  | <field-1> | <field-2> | …  |
 *
 * Merge semantics, identical across the family:
 *  - an empty cell keeps the preset value;
 *  - `__empty__` clears it to the empty string;
 *  - an authored row with a new key appends a new entry;
 *  - clearing an entry's required field (its label, normally) removes it;
 *  - `content-mode: replace` drops the presets and renders only what the
 *    author wrote. The default, `merge`, layers the two.
 */

export const CLEAR_TOKEN = '__empty__';

/**
 * Reads a table cell as trimmed plain text.
 *
 * @param {Element} [cell] The cell
 * @returns {string} Its text, or '' when the cell is absent
 */
export function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

/**
 * Reads a table cell as an image reference.
 *
 * Authors write these three ways and all of them have to work: a real picture
 * pasted into the cell (which carries alt text), a link to the asset, or the
 * bare path typed as text.
 *
 * @param {Element} [cell] The cell
 * @returns {{src: string, alt: string}} The reference, with '' for anything absent
 */
export function readImage(cell) {
  if (!cell) return { src: '', alt: '' };
  const image = cell.querySelector('img');
  if (image) {
    return { src: image.getAttribute('src') || '', alt: image.getAttribute('alt') || '' };
  }
  const anchor = cell.querySelector('a[href]');
  if (anchor) return { src: anchor.getAttribute('href') || '', alt: '' };
  return { src: cellText(cell), alt: '' };
}

/**
 * Layers one authored value over its preset.
 *
 * @param {string} authored The authored cell text
 * @param {string} preset The baked-in value
 * @returns {string} The value to render
 */
export function applyValue(authored, preset) {
  if (!authored) return preset;
  if (authored === CLEAR_TOKEN) return '';
  return authored;
}

/**
 * Escapes a value for interpolation into markup.
 *
 * Blocks that build SVG assemble it as a string and set innerHTML, because the
 * alternative — a hundred createElementNS calls — is unreadable. Authored text
 * reaching that string (a label, an alt attribute) is the one place it could
 * carry markup of its own, so it goes through here first. Authors are trusted,
 * but "trusted" is not a reason to concatenate their text into a DOM parser.
 *
 * @param {string} value The value to escape
 * @returns {string} The value, safe in both element and attribute position
 */
export function escapeMarkup(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Creates an element, optionally classed and populated.
 *
 * @param {string} tag Tag name
 * @param {string} [className] Class attribute
 * @param {Array<Node|string>} [children] Children; strings become text nodes
 * @returns {Element} The element
 */
export function el(tag, className = '', children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  children.forEach((child) => {
    if (child === null || child === undefined || child === false) return;
    node.append(child);
  });
  return node;
}

/**
 * Sorts the block's rows into settings and per-type key maps.
 *
 * Rows whose type is not in `types` are ignored, which is what lets an author
 * leave notes in the table without them reaching the render.
 *
 * @param {Element} block The block element
 * @param {string[]} types The row types this block understands
 * @returns {{settings: Map<string, string>, settingCells: Map<string, Element>,
 *   rows: Map<string, Map<string, Element[]>>}} The parsed table
 */
export function parseTable(block, types) {
  const settings = new Map();
  const settingCells = new Map();
  const rows = new Map(types.map((type) => [type, new Map()]));

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
    if (!key || !rows.has(type)) return;
    rows.get(type).set(key, cells);
  });

  return { settings, settingCells, rows };
}

/**
 * Reports whether the author asked for the presets to be dropped.
 *
 * @param {{settings: Map<string, string>}} parsed A parsed table
 * @returns {boolean} True for `content-mode: replace`
 */
export function isReplaceMode(parsed) {
  return (parsed.settings.get('content-mode') || 'merge').toLowerCase() === 'replace';
}

/**
 * Layers the authored settings over the block's defaults.
 *
 * Keys named in `imageKeys` read as image references rather than text, so an
 * author can paste a picture where the default holds a path.
 *
 * @param {object} parsed A parsed table
 * @param {object} defaults The block's DEFAULT_SETTINGS
 * @param {string[]} [imageKeys] Setting keys whose cell holds an image
 * @returns {object} The settings to render
 */
export function mergeSettings(parsed, defaults, imageKeys = []) {
  const replace = isReplaceMode(parsed);
  const config = { ...defaults };
  if (replace) Object.keys(config).forEach((key) => { config[key] = ''; });
  Object.keys(defaults).forEach((key) => {
    const authored = imageKeys.includes(key)
      ? readImage(parsed.settingCells.get(key)).src
      : parsed.settings.get(key) || '';
    config[key] = applyValue(authored, config[key]);
  });
  return config;
}

/**
 * Layers the authored rows of one type over that type's defaults.
 *
 * `fields` names the columns from column 3 on, in order, so a table row reads
 * straight across into the object the renderer wants. A field named in
 * `imageFields` is read as an image reference and lands as two properties:
 * the field itself and `<field>Alt`.
 *
 * @param {object} parsed A parsed table
 * @param {string} type The row type to merge
 * @param {object[]} defaults The block's defaults for that type, each with a `key`
 * @param {string[]} fields The field names, in column order from column 3
 * @param {{required?: string, imageFields?: string[]}} [options] Merge options
 * @returns {object[]} The entries to render, in preset-then-authored order
 */
export function mergeList(parsed, type, defaults, fields, options = {}) {
  const { required = 'label', imageFields = [] } = options;
  const out = new Map();
  if (!isReplaceMode(parsed)) defaults.forEach((item) => out.set(item.key, { ...item }));

  (parsed.rows.get(type) || new Map()).forEach((cells, key) => {
    const preset = out.get(key) || Object.fromEntries([
      ['key', key], ...fields.map((field) => [field, '']),
    ]);
    fields.forEach((field, index) => {
      const cell = cells[index + 2];
      if (imageFields.includes(field)) {
        const { src, alt } = readImage(cell);
        preset[field] = applyValue(src, preset[field]);
        if (alt) preset[`${field}Alt`] = alt;
        return;
      }
      preset[field] = applyValue(cellText(cell), preset[field]);
    });
    if (required && !preset[required]) {
      out.delete(key);
      return;
    }
    out.set(key, preset);
  });

  return [...out.values()];
}

/**
 * Counts an element's number from where it stands to a new value.
 *
 * Under `prefers-reduced-motion: reduce` the value is simply set — the number
 * is the content, and the count is the decoration.
 *
 * @param {Element} node The element holding the number
 * @param {number} to The value to land on
 * @param {{duration?: number, decimals?: number}} [options] Timing and precision
 */
export function countTo(node, to, options = {}) {
  const { duration = 900, decimals = 0 } = options;
  const from = Number.parseFloat(node.textContent) || 0;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still || from === to) {
    node.textContent = to.toFixed(decimals);
    return;
  }
  const started = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - started) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    node.textContent = (from + (to - from) * eased).toFixed(decimals);
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/**
 * Runs `reveal` once the element first scrolls into view.
 *
 * Blocks use this for their entrance animations, so the work is a class flip
 * rather than a scroll listener. Under `prefers-reduced-motion: reduce` — and
 * anywhere IntersectionObserver is missing — the element is revealed up front
 * instead, because the entrance is decoration and the content is not.
 *
 * @param {Element[]} nodes The elements to observe
 * @param {string} [className] The class to add when each enters the viewport
 */
export function revealOnScroll(nodes, className = 'is-in') {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still || !('IntersectionObserver' in window)) {
    nodes.forEach((node) => node.classList.add(className));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add(className);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
  nodes.forEach((node) => observer.observe(node));
}
