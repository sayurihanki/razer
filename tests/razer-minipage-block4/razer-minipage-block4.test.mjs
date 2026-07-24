/* eslint-env node */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

import {
  DEFAULT_CONTENT,
  buildEditableExperience,
  parseAuthorRows,
  sanitizeAuthoredUrl,
  THEME_TOKEN_DEFINITIONS,
  UI_SETTING_PATHS,
} from '../../blocks/razer-minipage-block4/razer-minipage-block4.js';

const BLOCK_DIRECTORY = new URL('../../blocks/razer-minipage-block4/', import.meta.url);
const BEHAVIOR_SETTING_KEYS = [
  'navigation',
  'footer',
  'motion',
  'scroll-progress',
  'background-grid',
  'show-highlights',
  'show-features',
  'show-specifications',
  'show-related-products',
];

function findByKey(items, key) {
  return items.find((item) => item.key === key);
}

function makeTextElement(text = '', options = {}) {
  const strong = options.strong
    ? makeTextElement(options.strong)
    : null;
  return {
    innerText: text,
    textContent: text,
    nextElementSibling: options.nextElementSibling || null,
    querySelector(selector) {
      return selector === 'strong' ? strong : null;
    },
    querySelectorAll() {
      return [];
    },
  };
}

function makeAttributeElement(attributes = {}) {
  return {
    ...attributes,
    getAttribute(name) {
      return attributes[name] === undefined ? null : String(attributes[name]);
    },
  };
}

function makeImageFixture(image, sources = []) {
  const sourceElements = sources.map((source) => makeAttributeElement(source));
  const imageElement = {
    ...makeAttributeElement(image),
    alt: image.alt,
    currentSrc: image.src,
    height: image.height,
    src: image.src,
    width: image.width,
  };
  const pictureElement = {
    children: [...sourceElements, imageElement],
    querySelector(selector) {
      return selector === 'img[src]' ? imageElement : null;
    },
    querySelectorAll(selector) {
      return selector.includes('source') ? sourceElements : [];
    },
  };
  imageElement.closest = (selector) => (selector === 'picture' ? pictureElement : null);
  imageElement.parentElement = pictureElement;
  return { imageElement, pictureElement, sourceElements };
}

function makeCell(text = '', options = {}) {
  const imageFixture = options.image
    ? makeImageFixture(options.image, options.sources)
    : null;
  const linkElement = options.link
    ? {
      ...makeAttributeElement({ href: options.link.href }),
      href: options.link.href,
      innerText: options.link.label,
      textContent: options.link.label,
    }
    : null;
  const paragraphs = (options.paragraphs || []).map((paragraph) => (
    makeTextElement(paragraph)
  ));
  const listItems = (options.listItems || []).map((item) => (
    makeTextElement(item.text || item, { strong: item.strong })
  ));
  const headings = (options.headings || []).map(({ title, body, lead }) => (
    makeTextElement(title, {
      nextElementSibling: makeTextElement(body, { strong: lead }),
    })
  ));

  return {
    innerText: text,
    textContent: text,
    querySelector(selector) {
      if (selector === 'img[src]') return imageFixture?.imageElement || null;
      if (selector === 'picture') return imageFixture?.pictureElement || null;
      if (selector === 'a[href]') return linkElement;
      return null;
    },
    querySelectorAll(selector) {
      if (selector.includes('source')) return imageFixture?.sourceElements || [];
      if (selector === 'p') return paragraphs;
      if (selector === 'li') return listItems;
      if (selector === 'h3') return headings;
      return [];
    },
  };
}

function makeRow(...cells) {
  return {
    children: cells.map((cell) => (
      typeof cell === 'string' ? makeCell(cell) : cell
    )),
  };
}

function imageRecord(type, key, src, extra = {}) {
  return {
    type,
    key,
    image: {
      alt: `${key} image`,
      height: 600,
      src,
      width: 800,
    },
    ...extra,
  };
}

function stableKeys(items) {
  return items.map(({ key }) => key);
}

function countMatches(source, expression) {
  return (source.match(expression) || []).length;
}

function countHandoffRows(source, type) {
  const escapedType = type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return countMatches(
    source,
    new RegExp(`<td>\\s*${escapedType}\\s*</td>`, 'g'),
  );
}

test('default authored experience preserves the complete Block 2 inventory', () => {
  const sourceSnapshot = JSON.stringify(DEFAULT_CONTENT);
  const {
    backgroundGrid,
    content,
    config,
    styles,
  } = buildEditableExperience([]);

  assert.equal(content.id, 'razer-minipage-block4-authored');
  assert.equal(content.product.gallery.length, 6);
  assert.deepEqual(
    content.product.optionGroups.map((group) => group.options.length),
    [4, 3, 2],
  );
  assert.equal(content.product.delivery.length, 2);
  assert.equal(content.product.trust.length, 3);
  assert.equal(content.highlights.length, 3);
  assert.equal(content.features.length, 12);
  assert.equal(content.features.flatMap((feature) => feature.media).length, 22);
  assert.equal(content.specifications.length, 21);
  assert.equal(content.relatedProducts.length, 5);
  assert.equal(config.navigation, true);
  assert.equal(config.footer, true);
  assert.equal(config.motion, true);
  assert.equal(config.scrollProgress, true);
  assert.equal(config.showSpecifications, true);
  assert.equal(backgroundGrid, true);
  assert.deepEqual(styles, {});
  assert.equal(JSON.stringify(DEFAULT_CONTENT), sourceSnapshot);
});

test('stable keyed rows edit every authored experience area without cross-leakage', () => {
  const records = [
    { type: 'setting', key: 'ui-navigation-buy-now-label', value: 'Build yours' },
    { type: 'setting', key: 'token-green', value: '#ff5a1f' },
    {
      type: 'brand',
      image: {
        src: '/brand.svg', alt: 'Demo brand', width: 40, height: 40,
      },
    },
    {
      type: 'product',
      title: 'Editable Product',
      pickup: 'Pickup in 12 stores',
      url: '/products/editable',
    },
    imageRecord('gallery-image', 'gallery-02', '/gallery-two.jpg'),
    { type: 'option-group', key: 'group-01', label: 'Finish' },
    {
      type: 'option',
      groupKey: 'group-01',
      key: 'option-02',
      label: 'Pearl',
      price: '+US$10.00',
      selected: true,
    },
    {
      type: 'delivery', key: 'delivery-01', label: 'Tomorrow', value: 'Free',
    },
    { type: 'trust', key: 'trust-02', text: 'Lifetime support' },
    { type: 'highlight', key: 'highlight-03', text: 'Author-controlled highlight' },
    {
      type: 'feature',
      key: 'feature-03',
      side: 'left',
      title: 'Editable feature',
      paragraphs: ['Editable body'],
      bullets: [{ lead: 'Speed', text: 'Instant' }],
      detailGroups: [{ title: 'Detail', lead: 'Lead.', text: 'Copy' }],
      note: 'Editable note',
      link: { label: 'Explore', href: '/technology' },
    },
    imageRecord('feature-media', 'media-01', '/feature.jpg', {
      featureKey: 'feature-03',
    }),
    {
      type: 'specification', key: 'spec-01', label: 'Finish', value: 'Pearl',
    },
    {
      ...imageRecord('related-product', 'related-01', '/related.png'),
      title: 'Related Editable Product',
      price: 'US$99.00',
      url: '/related',
      linkLabel: 'Open product',
    },
  ];
  const { content, styles } = buildEditableExperience(records);

  assert.equal(content.ui.navigation.buyNowLabel, 'Build yours');
  assert.equal(styles['--rm-green'], '#ff5a1f');
  assert.equal(styles['--rm-green-rgb'], '255 90 31');
  assert.equal(content.ui.navigation.logo.src, '/brand.svg');
  assert.equal(content.product.title, 'Editable Product');
  assert.equal(content.product.pickup, 'Pickup in 12 stores');
  assert.equal(findByKey(content.product.gallery, 'gallery-02').src, '/gallery-two.jpg');
  assert.equal(content.product.optionGroups[0].label, 'Finish');
  assert.equal(content.product.optionGroups[0].options[1].selected, true);
  assert.equal(
    content.product.optionGroups[0].options.filter((option) => option.selected).length,
    1,
  );
  assert.deepEqual(findByKey(content.product.delivery, 'delivery-01'), {
    key: 'delivery-01',
    label: 'Tomorrow',
    value: 'Free',
  });
  assert.equal(content.product.trust[1], 'Lifetime support');
  assert.equal(content.highlights[2], 'Author-controlled highlight');
  assert.equal(findByKey(content.features, 'feature-03').title, 'Editable feature');
  assert.equal(findByKey(content.features, 'feature-03').media[0].src, '/feature.jpg');
  assert.equal(findByKey(content.specifications, 'spec-01').value, 'Pearl');
  assert.equal(findByKey(content.relatedProducts, 'related-01').linkLabel, 'Open product');
  assert.equal(DEFAULT_CONTENT.product.title, 'Razer Basilisk V3 Pro 35K');
});

test('DOM row reader retains Block 2 field positions for all 13 row types', () => {
  const image = {
    alt: 'Authored asset',
    height: 675,
    src: '/media/authored.webp',
    width: 1200,
  };
  const block = {
    children: [
      makeRow('setting', 'token-green', '#55ee33'),
      makeRow('brand', makeCell('', { image }), '120', '40'),
      makeRow(
        'product',
        'SKU-4',
        'Black',
        'Authored Mouse',
        'Complete subtitle',
        'US$129.99',
        'US$159.99',
        '18% off',
        '/products/authored',
        'Pickup today',
      ),
      makeRow('gallery-image', '02', 'true', makeCell('', { image }), '1200', '675'),
      makeRow('option-group', '01', 'true', 'Finish'),
      makeRow('option', '01', '02', 'true', 'White', '+US$10.00', 'true'),
      makeRow('delivery', '01', 'true', 'Delivery', 'Free'),
      makeRow('trust', '02', 'true', 'Two-year warranty'),
      makeRow('highlight', '03', 'true', '35K optical sensor'),
      makeRow(
        'feature',
        '01',
        'true',
        'left',
        'Precision',
        'Optional authored feature',
        'One concise line',
        makeCell('First paragraph\nSecond paragraph', {
          paragraphs: ['First paragraph', 'Second paragraph'],
        }),
        makeCell('Speed — Instant', {
          listItems: [{ strong: 'Speed', text: 'Speed — Instant' }],
        }),
        makeCell('Sensor detail', {
          headings: [{
            body: 'Precision. Tracks on glass.',
            lead: 'Precision.',
            title: 'Sensor detail',
          }],
        }),
        'Optional note',
        makeCell('Explore', {
          link: { href: '/technology', label: 'Explore' },
        }),
      ),
      makeRow(
        'feature-media',
        '01',
        '01',
        'true',
        makeCell('', { image }),
        '1200',
        '675',
      ),
      makeRow('specification', '01', 'true', 'Sensor', 'Focus Pro 35K'),
      makeRow(
        'related-product',
        '01',
        'true',
        makeCell('', { image }),
        'Related Mouse',
        'US$99.99',
        'US$119.99',
        'Save 17%',
        '/products/related',
        'View details',
      ),
    ],
  };

  const records = parseAuthorRows(block);
  const byType = Object.fromEntries(records.map((record) => [record.type, record]));

  assert.deepEqual(records.map(({ type }) => type), [
    'setting',
    'brand',
    'product',
    'gallery-image',
    'option-group',
    'option',
    'delivery',
    'trust',
    'highlight',
    'feature',
    'feature-media',
    'specification',
    'related-product',
  ]);
  assert.deepEqual(
    { key: byType.setting.key, value: byType.setting.value },
    { key: 'token-green', value: '#55ee33' },
  );
  assert.equal(byType.brand.image.src, '/media/authored.webp');
  assert.equal(byType.brand.width, 120);
  assert.equal(byType.brand.height, 40);
  assert.equal(byType.product.sku, 'SKU-4');
  assert.equal(byType.product.title, 'Authored Mouse');
  assert.equal(byType.product.pickup, 'Pickup today');
  assert.equal(byType['gallery-image'].key, 'gallery-02');
  assert.equal(byType['option-group'].key, 'group-01');
  assert.equal(byType.option.groupKey, 'group-01');
  assert.equal(byType.option.key, 'option-02');
  assert.equal(byType.option.selected, true);
  assert.equal(byType.delivery.value, 'Free');
  assert.equal(byType.trust.text, 'Two-year warranty');
  assert.equal(byType.highlight.text, '35K optical sensor');
  assert.equal(byType.feature.side, 'left');
  assert.deepEqual(byType.feature.paragraphs, ['First paragraph', 'Second paragraph']);
  assert.equal(byType.feature.bullets[0].lead, 'Speed');
  assert.equal(byType.feature.detailGroups[0].title, 'Sensor detail');
  assert.deepEqual(byType.feature.link, { href: '/technology', label: 'Explore' });
  assert.equal(byType['feature-media'].featureKey, 'feature-01');
  assert.equal(byType.specification.value, 'Focus Pro 35K');
  assert.equal(byType['related-product'].linkLabel, 'View details');
});

test('merge mode, enabled flags, and explicit empty values are deterministic', () => {
  const parsedRows = parseAuthorRows({
    children: [
      makeRow(
        'product',
        '',
        '',
        '',
        '__empty__',
        '',
        '__empty__',
        '__empty__',
        '',
        '__empty__',
      ),
      makeRow(
        'feature',
        '01',
        'true',
        '',
        '',
        '',
        '__empty__',
        '__empty__',
        '__empty__',
        '__empty__',
        '__empty__',
        '__empty__',
      ),
      makeRow('specification', '01', 'true', '', '__empty__'),
    ],
  });
  const { content } = buildEditableExperience([
    ...parsedRows,
    imageRecord('gallery-image', 'gallery-02', '/media/edited-gallery.webp'),
    { type: 'gallery-image', key: 'gallery-01', enabled: false },
    { type: 'option-group', key: 'group-02', enabled: false },
    {
      type: 'option',
      groupKey: 'group-02',
      key: 'option-01',
      label: 'Must not recreate disabled group',
    },
    { type: 'trust', key: 'trust-02', enabled: false },
    { type: 'highlight', key: 'highlight-03', text: 'Author-controlled highlight' },
  ]);
  const feature = findByKey(content.features, 'feature-01');

  assert.equal(content.product.subtitle, '');
  assert.equal(content.product.originalPrice, '');
  assert.equal(content.product.discount, '');
  assert.equal(content.product.pickup, '');
  assert.deepEqual(stableKeys(content.product.gallery), [
    'gallery-02',
    'gallery-03',
    'gallery-04',
    'gallery-05',
    'gallery-06',
  ]);
  assert.equal(findByKey(content.product.gallery, 'gallery-02').src, '/media/edited-gallery.webp');
  assert.equal(findByKey(content.product.optionGroups, 'group-02'), undefined);
  assert.equal(content.product.trust.length, 2);
  assert.equal(content.highlights[2], 'Author-controlled highlight');
  assert.equal(feature.subtitle, '');
  assert.deepEqual(feature.paragraphs, []);
  assert.deepEqual(feature.bullets, []);
  assert.deepEqual(feature.detailGroups, []);
  assert.equal(feature.note, '');
  assert.equal(feature.link, null);
  assert.equal(findByKey(content.specifications, 'spec-01').value, '');
});

test('replace mode rebuilds authored collections and stable-key sorts relationships', () => {
  const records = [
    { type: 'setting', key: 'content-mode', value: 'replace' },
    imageRecord('gallery-image', 'gallery-10', '/gallery-10.webp'),
    imageRecord('gallery-image', 'gallery-02', '/gallery-02.webp'),
    imageRecord('gallery-image', 'gallery-01', '/gallery-01.webp'),
    { type: 'gallery-image', key: 'gallery-00', enabled: false },
    { type: 'option-group', key: 'group-02', label: 'Connection' },
    { type: 'option-group', key: 'group-01', label: 'Finish' },
    {
      type: 'option',
      groupKey: 'group-02',
      key: 'option-02',
      label: 'Wireless',
    },
    {
      type: 'option',
      groupKey: 'group-01',
      key: 'option-02',
      label: 'White',
    },
    {
      type: 'option',
      groupKey: 'group-01',
      key: 'option-01',
      label: 'Black',
    },
    {
      type: 'delivery', key: 'delivery-02', label: 'Pickup', value: 'Today',
    },
    {
      type: 'delivery', key: 'delivery-01', label: 'Delivery', value: 'Free',
    },
    { type: 'trust', key: 'trust-02', text: 'Returns' },
    { type: 'trust', key: 'trust-01', text: 'Warranty' },
    { type: 'highlight', key: 'highlight-02', text: 'Wireless' },
    { type: 'highlight', key: 'highlight-01', text: '35K sensor' },
    {
      type: 'feature', key: 'feature-02', title: 'Second', side: 'left',
    },
    {
      type: 'feature', key: 'feature-01', title: 'First', side: 'right',
    },
    imageRecord('feature-media', 'media-02', '/feature-2-2.webp', {
      featureKey: 'feature-02',
    }),
    imageRecord('feature-media', 'media-01', '/feature-2-1.webp', {
      featureKey: 'feature-02',
    }),
    imageRecord('feature-media', 'media-01', '/feature-1-1.webp', {
      featureKey: 'feature-01',
    }),
    {
      type: 'specification', key: 'spec-10', label: 'Ten', value: '10',
    },
    {
      type: 'specification', key: 'spec-02', label: 'Two', value: '2',
    },
    {
      type: 'specification', key: 'spec-01', label: 'One', value: '1',
    },
    {
      ...imageRecord('related-product', 'related-02', '/related-2.webp'),
      title: 'Second product',
      price: 'US$2.00',
      url: '/related-2',
    },
    {
      ...imageRecord('related-product', 'related-01', '/related-1.webp'),
      title: 'First product',
      price: 'US$1.00',
      url: '/related-1',
    },
  ];

  const { content } = buildEditableExperience(records);

  assert.deepEqual(stableKeys(content.product.gallery), [
    'gallery-01',
    'gallery-02',
    'gallery-10',
  ]);
  assert.deepEqual(stableKeys(content.product.optionGroups), ['group-01', 'group-02']);
  assert.deepEqual(
    stableKeys(findByKey(content.product.optionGroups, 'group-01').options),
    ['option-01', 'option-02'],
  );
  assert.deepEqual(
    stableKeys(findByKey(content.product.optionGroups, 'group-02').options),
    ['option-02'],
  );
  assert.deepEqual(stableKeys(content.product.delivery), ['delivery-01', 'delivery-02']);
  assert.deepEqual(content.product.trust, ['Warranty', 'Returns']);
  assert.deepEqual(content.highlights, ['35K sensor', 'Wireless']);
  assert.deepEqual(stableKeys(content.features), ['feature-01', 'feature-02']);
  assert.deepEqual(
    stableKeys(findByKey(content.features, 'feature-02').media),
    ['media-01', 'media-02'],
  );
  assert.equal(
    findByKey(content.features, 'feature-01').media[0].src,
    '/feature-1-1.webp',
  );
  assert.deepEqual(stableKeys(content.specifications), ['spec-01', 'spec-02', 'spec-10']);
  assert.deepEqual(stableKeys(content.relatedProducts), ['related-01', 'related-02']);
});

test('option groups always retain one deterministic selected option', () => {
  const baseRecords = [
    { type: 'setting', key: 'content-mode', value: 'replace' },
    { type: 'option-group', key: 'group-01', label: 'Finish' },
    {
      type: 'option',
      groupKey: 'group-01',
      key: 'option-03',
      label: 'Third',
      selected: false,
    },
    {
      type: 'option',
      groupKey: 'group-01',
      key: 'option-01',
      label: 'First',
      selected: false,
    },
    {
      type: 'option',
      groupKey: 'group-01',
      key: 'option-02',
      label: 'Disabled selection',
      selected: true,
      enabled: false,
    },
  ];
  const fallback = buildEditableExperience(baseRecords).content.product.optionGroups[0];

  assert.equal(fallback.options[0].key, 'option-01');
  assert.equal(fallback.options[0].selected, true);
  assert.equal(fallback.options.filter(({ selected }) => selected).length, 1);

  const explicit = buildEditableExperience([
    ...baseRecords,
    {
      type: 'option',
      groupKey: 'group-01',
      key: 'option-03',
      label: 'Third',
      selected: true,
    },
  ]).content.product.optionGroups[0];

  assert.equal(findByKey(explicit.options, 'option-03').selected, true);
  assert.equal(explicit.options.filter(({ selected }) => selected).length, 1);
});

test('authored URLs allow web and local targets but reject unsafe destinations', () => {
  const executable = ['java', 'script:alert(1)'].join('');

  assert.equal(
    sanitizeAuthoredUrl(' https://www.razer.com/product '),
    'https://www.razer.com/product',
  );
  assert.equal(sanitizeAuthoredUrl('http://example.com/product'), 'http://example.com/product');
  assert.equal(sanitizeAuthoredUrl('/products/mouse'), '/products/mouse');
  assert.equal(sanitizeAuthoredUrl('./mouse'), './mouse');
  assert.equal(sanitizeAuthoredUrl('../mouse'), '../mouse');
  assert.equal(sanitizeAuthoredUrl('#details'), '#details');
  assert.equal(sanitizeAuthoredUrl(executable, '/fallback'), '/fallback');
  assert.equal(sanitizeAuthoredUrl('data:text/html,bad', '/fallback'), '/fallback');
  assert.equal(sanitizeAuthoredUrl('//example.com/redirect', '/fallback'), '/fallback');
  assert.equal(sanitizeAuthoredUrl('ftp://example.com/file', '/fallback'), '/fallback');

  const { content } = buildEditableExperience([
    { type: 'product', url: executable },
    {
      type: 'feature',
      key: 'feature-01',
      link: { label: 'Unsafe', href: executable },
    },
    { type: 'related-product', key: 'related-01', url: '//example.com/redirect' },
  ]);
  assert.equal(content.product.url, DEFAULT_CONTENT.product.url);
  assert.equal(content.features[0].link.href, DEFAULT_CONTENT.features[0].link?.href || '');
  assert.equal(content.relatedProducts[0].url, DEFAULT_CONTENT.relatedProducts[0].url);
});

test('theme and behavior settings validate values and remain block scoped', () => {
  const unsafe = buildEditableExperience([
    { type: 'setting', key: 'sticky-offset', value: '10px; color: red' },
    { type: 'setting', key: 'token-green', value: 'red; background: white' },
    { type: 'setting', key: 'token-body', value: 'Body; src: url(evil)' },
    { type: 'setting', key: 'token-green-rgb', value: '256 0 0' },
    { type: 'setting', key: 'token-green-shadow', value: 'url(https://example.com/pixel)' },
  ]);
  const safe = buildEditableExperience([
    { type: 'setting', key: 'navigation', value: 'false' },
    { type: 'setting', key: 'background-grid', value: 'no' },
    { type: 'setting', key: 'sticky-offset', value: 'clamp(48px, 5vw, 72px)' },
    { type: 'setting', key: 'token-green', value: '#ff5a1f' },
    { type: 'setting', key: 'token-display', value: '"Rajdhani", sans-serif' },
  ]);

  assert.equal(unsafe.config.stickyOffset, 'var(--nav-height, 64px)');
  assert.equal(unsafe.styles['--rm-green'], undefined);
  assert.equal(unsafe.styles['--rm-body'], undefined);
  assert.equal(unsafe.styles['--rm-green-rgb'], undefined);
  assert.equal(unsafe.styles['--rm-green-shadow'], undefined);
  assert.equal(safe.config.navigation, false);
  assert.equal(safe.backgroundGrid, false);
  assert.equal(safe.config.stickyOffset, 'clamp(48px, 5vw, 72px)');
  assert.equal(safe.styles['--rm-green'], '#ff5a1f');
  assert.equal(safe.styles['--rm-green-rgb'], '255 90 31');
  assert.equal(safe.styles['--rm-display'], '"Rajdhani", sans-serif');
});

test('responsive picture sources, alt text, and intrinsic geometry survive authoring', () => {
  const sources = [
    {
      media: '(min-width: 1200px)',
      sizes: '50vw',
      srcset: '/media/mouse-1500.webp 1500w',
      type: 'image/webp',
    },
    {
      media: '(min-width: 768px)',
      sizes: '70vw',
      srcset: '/media/mouse-1199.avif 1199w',
      type: 'image/avif',
    },
    {
      media: '(max-width: 767px)',
      sizes: '100vw',
      srcset: '/media/mouse-767.webp 767w',
      type: 'image/webp',
    },
  ];
  const block = {
    children: [
      makeRow(
        'gallery-image',
        '01',
        'true',
        makeCell('', {
          image: {
            alt: 'Responsive authored mouse',
            height: 900,
            src: '/media/mouse-fallback.webp',
            width: 1500,
          },
          sources,
        }),
        '1500',
        '900',
      ),
    ],
  };
  const record = parseAuthorRows(block)[0];

  assert.equal(record.image.src, '/media/mouse-fallback.webp');
  assert.equal(record.image.alt, 'Responsive authored mouse');
  assert.equal(record.image.width, 1500);
  assert.equal(record.image.height, 900);
  assert.deepEqual(record.image.sources, sources);

  const { content } = buildEditableExperience([
    { type: 'setting', key: 'content-mode', value: 'replace' },
    record,
  ]);
  const [galleryImage] = content.product.gallery;

  assert.equal(galleryImage.width, 1500);
  assert.equal(galleryImage.height, 900);
  assert.equal(galleryImage.width / galleryImage.height, 5 / 3);
  assert.equal(galleryImage.alt, 'Responsive authored mouse');
  assert.deepEqual(galleryImage.sources, sources);
});

test('all 71 public settings plus content mode are represented in the Block 4 model', async () => {
  const model = JSON.parse(
    await readFile(new URL('_razer-minipage-block4.json', BLOCK_DIRECTORY), 'utf8'),
  );
  const settingModel = model.models.find(
    ({ id }) => id === 'razer-minipage-block4-setting',
  );
  const settingKeys = new Set(
    settingModel.fields.find(({ name }) => name === 'key').options.map(({ value }) => value),
  );
  const publicSettingKeys = new Set([
    ...BEHAVIOR_SETTING_KEYS,
    'sticky-offset',
    ...Object.keys(UI_SETTING_PATHS),
    ...Object.keys(THEME_TOKEN_DEFINITIONS),
  ]);

  assert.equal(publicSettingKeys.size, 71);
  assert.equal(settingKeys.size, 72);
  assert.equal(settingKeys.has('content-mode'), true);
  publicSettingKeys.forEach((key) => assert.equal(settingKeys.has(key), true, key));
  assert.equal(model.models.length, 13);
  assert.equal(model.filters[0].components.length, 13);
  model.models.forEach(({ id }) => assert.match(id, /^razer-minipage-block4-/));
  model.filters[0].components.forEach((component) => {
    const id = typeof component === 'string' ? component : component.id;
    assert.match(id, /^razer-minipage-block4-/);
  });
});

test('standalone JS and CSS meet source, event, observer, and gzip budgets', async () => {
  const [javascript, css] = await Promise.all([
    readFile(new URL('razer-minipage-block4.js', BLOCK_DIRECTORY), 'utf8'),
    readFile(new URL('razer-minipage-block4.css', BLOCK_DIRECTORY), 'utf8'),
  ]);
  const javascriptGzip = gzipSync(javascript).byteLength;
  const cssGzip = gzipSync(css).byteLength;
  const listenerTypes = [...javascript.matchAll(
    /addEventListener\s*\(\s*['"`]([^'"`]+)['"`]/g,
  )].map((match) => match[1]);
  const observerCount = countMatches(
    javascript,
    /new\s+IntersectionObserver\s*\(/g,
  );

  assert.ok(javascriptGzip < 22 * 1024, 'Block 4 JS must stay below 22 KB gzip');
  assert.ok(cssGzip < 7 * 1024, 'Block 4 CSS must stay below 7 KB gzip');
  assert.ok(
    javascriptGzip + cssGzip <= 28 * 1024,
    'Block 4 combined JS and CSS must stay at or below 28 KB gzip',
  );
  assert.doesNotMatch(javascript, /^\s*import\s/m);
  assert.doesNotMatch(
    javascript,
    /(?:from\s*|import\s*\(\s*)['"][^'"]*(?:razer-minipage-block[123]|\/razer-minipage\/)/,
  );
  assert.doesNotMatch(javascript, /razer-minipage-block[123]/);
  assert.doesNotMatch(css, /@import\b/i);
  assert.doesNotMatch(javascript, /fonts\.(?:googleapis|gstatic)\.com/i);
  assert.doesNotMatch(css, /fonts\.(?:googleapis|gstatic)\.com/i);
  assert.ok(listenerTypes.length <= 12, 'Block 4 must use no more than 12 listeners');
  assert.equal(
    listenerTypes.filter((type) => type === 'click').length,
    1,
    'interactive controls must share one delegated click handler',
  );
  assert.equal(
    listenerTypes.filter((type) => type === 'keydown').length,
    1,
    'interactive controls must share one delegated keyboard handler',
  );
  assert.ok(observerCount <= 2, 'Block 4 must create no more than two observers');
  assert.match(javascript, /requestAnimationFrame/);
  assert.match(javascript, /visibilitychange/);
  assert.match(javascript, /document\.(?:hidden|visibilityState)/);
  assert.match(javascript, /pointermove/);
  assert.match(javascript, /will-change|willChange/);
  assert.match(css, /\.razer-minipage-block4/);
  assert.doesNotMatch(
    css,
    /(^|})\s*(?::root|html|body|header|footer|main)\s*(?:,|\{)/m,
  );
  assert.doesNotMatch(css, /(^|})\s*\*\s*(?:,|\{)/m);
});

test('gallery source enforces responsive, deferred, and priority image delivery', async () => {
  const javascript = await readFile(
    new URL('razer-minipage-block4.js', BLOCK_DIRECTORY),
    'utf8',
  );
  const highPriorityCount = countMatches(
    javascript,
    /fetchpriority=(?:\\?["'])high(?:\\?["'])/g,
  );
  const directEagerCount = countMatches(
    javascript,
    /loading=(?:\\?["'])eager(?:\\?["'])/g,
  );
  const conditionalInitialEager = (
    /loading\s*=\s*eager\s*\?\s*["']eager["']\s*:\s*["']lazy["']/.test(javascript)
    && /eager:\s*index\s*===\s*0/.test(javascript)
  );

  assert.equal(highPriorityCount, 1, 'only one high-priority image template is allowed');
  assert.equal(
    directEagerCount === 1 || conditionalInitialEager,
    true,
    'only the initial gallery index may use the eager rendering path',
  );
  assert.match(javascript, /(?:loading=(?:\\?["'])lazy|["']lazy["'])/);
  assert.match(javascript, /<picture\b/);
  assert.match(javascript, /\b767\b/);
  assert.match(javascript, /\b1199\b/);
  assert.match(javascript, /\b1500\b/);
  assert.match(
    javascript,
    /(?:THUMBNAIL[^=\n]*=\s*78|width=(?:\\?["'])78(?:\\?["'])|thumbnail\s*\?\s*78)/i,
  );
  assert.match(
    javascript,
    /(?:data-(?:deferred-)?src(?:set)?|<template\b)/i,
    'inactive full-resolution sources must not be materialized in initial markup',
  );
  assert.match(javascript, /\.decode\s*\(/);
  assert.match(javascript, /pointerover|pointerenter/);
  assert.match(javascript, /focusin/);
  assert.match(
    javascript,
    /(?:in.?flight|pendingGallery|galleryLoads|loadCache)/i,
    'alternate gallery requests need an in-flight deduplication cache',
  );
  assert.match(
    javascript,
    /(?:latest|sequence|request(?:Id|Token)|selectionToken|loadVersion)/i,
    'gallery loading needs a latest-selection-wins guard',
  );
});

test('Block 2 motion signatures and reduced-motion fallback remain intact', async () => {
  const [javascript, css] = await Promise.all([
    readFile(new URL('razer-minipage-block4.js', BLOCK_DIRECTORY), 'utf8'),
    readFile(new URL('razer-minipage-block4.css', BLOCK_DIRECTORY), 'utf8'),
  ]);

  assert.match(css, /animation:[^;]*7s[^;]*ease-in-out[^;]*1\.6s[^;]*infinite/);
  assert.match(css, /filter:\s*blur\(5px\)/);
  assert.match(css, /opacity\s+800ms/);
  assert.match(css, /clip-path\s+950ms/);
  assert.match(css, /opacity\s+620ms/);
  assert.match(css, /transform\s+720ms/);
  assert.match(css, /animation:[^;]*650ms/);
  assert.match(css, /animation:[^;]*900ms/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(javascript, /duration:\s*420/);
  assert.match(javascript, /cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\)/);
  assert.match(javascript, /scrollIntoView/);
  assert.match(javascript, /behavior:[^,\n]*['"]smooth['"]/);
  assert.match(javascript, /prefers-reduced-motion:\s*reduce/);
});

test('exact Rajdhani and Titillium Web Latin fonts are self-hosted with OFL notices', async () => {
  const [
    css,
    rajdhaniLicense,
    titilliumLicense,
  ] = await Promise.all([
    readFile(new URL('razer-minipage-block4.css', BLOCK_DIRECTORY), 'utf8'),
    readFile(new URL('fonts/rajdhani/OFL.txt', BLOCK_DIRECTORY), 'utf8'),
    readFile(new URL('fonts/titillium-web/OFL.txt', BLOCK_DIRECTORY), 'utf8'),
  ]);
  const fontFaces = css.match(/@font-face\s*\{[^}]+\}/g) || [];
  const expectedFonts = [
    ['Rajdhani', 500, 'fonts/rajdhani/rajdhani-500-latin.woff2'],
    ['Rajdhani', 600, 'fonts/rajdhani/rajdhani-600-latin.woff2'],
    ['Rajdhani', 700, 'fonts/rajdhani/rajdhani-700-latin.woff2'],
    ['Titillium Web', 300, 'fonts/titillium-web/titillium-web-300-latin.woff2'],
    ['Titillium Web', 400, 'fonts/titillium-web/titillium-web-400-latin.woff2'],
    ['Titillium Web', 600, 'fonts/titillium-web/titillium-web-600-latin.woff2'],
    ['Titillium Web', 700, 'fonts/titillium-web/titillium-web-700-latin.woff2'],
  ];

  assert.equal(fontFaces.length, 7);
  expectedFonts.forEach(([family, weight, path]) => {
    const escapedFamily = family.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const face = fontFaces.find((candidate) => (
      new RegExp(`font-family:\\s*["']?${escapedFamily}["']?`).test(candidate)
      && candidate.includes(`font-weight: ${weight}`)
    ));
    assert.ok(face, `${family} ${weight} must have a local font face`);
    assert.match(face, /font-display:\s*swap/);
    assert.ok(face.includes(path), `${family} ${weight} must load ${path}`);
    assert.match(face, /format\(["']woff2["']\)/);
    assert.match(face, /unicode-range:/);
  });
  assert.match(css, /--rm-display:\s*"Rajdhani"/);
  assert.match(css, /--rm-body:\s*"Titillium Web"/);
  assert.match(rajdhaniLicense, /SIL OPEN FONT LICENSE/i);
  assert.match(titilliumLicense, /SIL OPEN FONT LICENSE/i);
});

test('full DA handoff has all 159 authored rows and native PDP Metadata only', async () => {
  const handoff = await readFile(
    new URL('razer-minipage-block4-da-live.html', BLOCK_DIRECTORY),
    'utf8',
  );
  const tableNames = [...handoff.matchAll(
    /<table>\s*<tbody>\s*<tr>\s*<td>\s*([^<]+?)\s*<\/td>/g,
  )].map((match) => match[1]);
  const inventory = {
    setting: 71,
    brand: 1,
    product: 1,
    'gallery-image': 6,
    'option-group': 3,
    option: 9,
    delivery: 2,
    trust: 3,
    highlight: 3,
    feature: 12,
    'feature-media': 22,
    specification: 21,
    'related-product': 5,
  };
  const authoredRowCount = Object.entries(inventory).reduce((total, [type, count]) => {
    const actual = countHandoffRows(handoff, type);
    assert.equal(actual, count, `${type} row count`);
    return total + actual;
  }, 0);

  assert.deepEqual(tableNames, ['razer-minipage-block4', 'Metadata']);
  assert.equal(authoredRowCount, 159);
  assert.match(handoff, /<td>\s*Title\s*<\/td>\s*<td>\s*[^<]+\s*<\/td>/);
  assert.match(handoff, /<td>\s*Description\s*<\/td>\s*<td>\s*[^<]+\s*<\/td>/);
  assert.match(
    handoff,
    /<td>\s*Image\s*<\/td>\s*<td>\s*<img\s+[^>]*src="https?:\/\/[^"]+"/,
  );
  assert.match(handoff, /<td>\s*Template\s*<\/td>\s*<td>\s*pdp\s*<\/td>/);
  assert.doesNotMatch(handoff, /Copy the rendered table/i);
});
