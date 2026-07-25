/**
 * Razer PDP Specs block for EDS document authoring.
 *
 * The technical specifications section of the Basilisk V3 Pro 35K
 * product page: section heading, the Synapse platform card with its
 * connectivity tag row and support link, and the ten-row definition
 * table with staggered reveal and row highlight. All content is baked
 * in, so a table containing only the block name renders the complete
 * section. Authored rows override or extend entries by stable key.
 *
 * Table contract (4 columns, typed rows; column 1 is the row type):
 * setting: setting | <key> | <value>
 * tag:     tag | key | label
 * spec:    spec | key | label | value
 *
 * Reveal animation honors `prefers-reduced-motion`.
 *
 * The literal `__empty__` clears a preset value; an empty label on a
 * keyed row removes the preset entry.
 */

const CLEAR_TOKEN = '__empty__';

export const DEFAULT_SETTINGS = {
  'anchor-id': 'tech-specs',
  eyebrow: 'Verified performance information',
  heading: 'Technical specifications.',
  body: 'Core specifications are sourced from Razer’s product and support documentation for model RZ01-0524.',
  'platform-eyebrow': 'Supported ecosystem',
  'platform-title': 'PC · Razer Synapse 4',
  'platform-body': 'Configure button mapping, sensor settings, on-board profiles, scroll behavior, and Chroma RGB on supported Windows PCs.',
  'support-label': 'Official support & manuals',
  'support-href': 'https://mysupport.razer.com/app/answers/detail/a_id/14675/',
};

export const DEFAULT_TAGS = [
  { key: 'tag-01', label: 'HyperSpeed 2.4 GHz' },
  { key: 'tag-02', label: 'Bluetooth' },
  { key: 'tag-03', label: 'Wired USB' },
  { key: 'tag-04', label: 'Chroma RGB' },
];

export const DEFAULT_SPECS = [
  { key: 'spec-01', label: 'Sensor', value: 'Razer Focus Pro 35K Optical Sensor Gen-2' },
  { key: 'spec-02', label: 'Sensitivity', value: '35,000 DPI' },
  { key: 'spec-03', label: 'Acceleration', value: '70 G' },
  { key: 'spec-04', label: 'Connectivity', value: 'Razer HyperSpeed Wireless · Bluetooth · Wired' },
  { key: 'spec-05', label: 'Programmable buttons', value: '11' },
  { key: 'spec-06', label: 'Profiles', value: 'On-board memory · 5 profiles' },
  { key: 'spec-07', label: 'Switches', value: 'Razer Optical Mouse Switches Gen-3 · rated for 90 million clicks' },
  { key: 'spec-08', label: 'Weight', value: '112 g / 3.95 oz · excluding dongle and cable' },
  { key: 'spec-09', label: 'Dimensions', value: '130 × 75.4 × 42.5 mm' },
  { key: 'spec-10', label: 'Software', value: 'Razer Synapse 4-enabled' },
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
  const tags = new Map();
  const specs = new Map();

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
    if (!key) return;
    if (type === 'tag') tags.set(key, cells);
    if (type === 'spec') specs.set(key, cells);
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

  const mergedTags = new Map();
  if (!replace) DEFAULT_TAGS.forEach((tag) => mergedTags.set(tag.key, { ...tag }));
  tags.forEach((cells, key) => {
    const preset = mergedTags.get(key) || { key, label: '' };
    preset.label = applyValue(cellText(cells[2]), preset.label);
    if (!preset.label) {
      mergedTags.delete(key);
      return;
    }
    mergedTags.set(key, preset);
  });

  const mergedSpecs = new Map();
  if (!replace) DEFAULT_SPECS.forEach((spec) => mergedSpecs.set(spec.key, { ...spec }));
  specs.forEach((cells, key) => {
    const preset = mergedSpecs.get(key) || { key, label: '', value: '' };
    preset.label = applyValue(cellText(cells[2]), preset.label);
    preset.value = applyValue(cellText(cells[3]), preset.value);
    if (!preset.label) {
      mergedSpecs.delete(key);
      return;
    }
    mergedSpecs.set(key, preset);
  });

  return {
    config,
    tags: [...mergedTags.values()].sort((a, b) => a.key.localeCompare(b.key)),
    specs: [...mergedSpecs.values()].sort((a, b) => a.key.localeCompare(b.key)),
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
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
  targets.forEach((target) => observer.observe(target));
}

/* ── Decorate ──────────────────────────────────────────────────── */

/**
 * Loads and decorates the block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const content = mergeContent(block);
  const { config } = content;

  block.textContent = '';

  const section = el('section', 'spec-section');
  if (config['anchor-id']) section.id = config['anchor-id'];
  const shell = el('div', 'rzrm-shell');

  const headingCopy = el('div');
  if (config.eyebrow) headingCopy.append(el('p', 'eyebrow', [text(config.eyebrow)]));
  if (config.heading) headingCopy.append(el('h2', '', [text(config.heading)]));
  const heading = el('div', 'section-heading', [headingCopy]);
  heading.dataset.reveal = '';
  if (config.body) heading.append(el('p', '', [text(config.body)]));
  shell.append(heading);

  const layout = el('div', 'spec-layout');

  const platform = el('div', 'platform-card');
  platform.dataset.reveal = '';
  if (config['platform-eyebrow']) platform.append(el('p', 'eyebrow', [text(config['platform-eyebrow'])]));
  if (config['platform-title']) platform.append(el('h3', '', [text(config['platform-title'])]));
  if (config['platform-body']) platform.append(el('p', '', [text(config['platform-body'])]));
  if (content.tags.length) {
    platform.append(el('div', 'tag-row', content.tags.map(
      (tag) => el('span', '', [text(tag.label)]),
    )));
  }
  if (config['support-label']) {
    const support = el('a', 'text-link', [
      text(`${config['support-label']} `),
      el('span', '', [text('↗')]),
    ]);
    support.href = config['support-href'];
    platform.append(support);
  }
  layout.append(platform);

  if (content.specs.length) {
    const table = el('dl', 'spec-table');
    content.specs.forEach((spec, index) => {
      const row = el('div', '', [
        el('dt', '', [text(spec.label)]),
        el('dd', '', [text(spec.value)]),
      ]);
      row.dataset.reveal = '';
      row.style.setProperty('--reveal-i', String(index));
      table.append(row);
    });
    layout.append(table);
  }

  shell.append(layout);
  section.append(shell);
  block.append(section);

  initReveals(block);
}
