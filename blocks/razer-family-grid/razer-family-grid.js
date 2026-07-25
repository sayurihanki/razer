import {
  readRows, textReader, cellHTML, cellLink, cellImage, el, ctaLink,
} from '../../scripts/razer-chroma.js';

/*
 * Row contract (repeat `card`; the first `card-wide` row spans the grid):
 *   eyebrow   | The Razer arsenal
 *   title     | Built to break limits.
 *   intro     | From portable power to total immersion...
 *   card-wide | Systems · Flagship | Razer Blade 18 | Copy | [Explore](url) | image
 *   card      | Control · Wireless | Razer Basilisk... | Copy | [Meet](url) | image
 *
 * The wide card gets the solid CTA and the standard cards get the ghost CTA,
 * matching the source; the variant is derived rather than authored.
 */

const DEFAULTS = {
  eyebrow: 'The Razer arsenal',
  title: 'Built to break limits.',
  intro: 'From portable power to total immersion, find the family that changes how you play and create.',
  cards: [
    {
      wide: true,
      index: 'Systems · Flagship',
      title: 'Razer Blade 18',
      copy: 'The edge of performance for gamers & AI devs.',
      link: { href: 'https://www.razer.com/gaming-laptops/razer-blade-18', label: 'Explore Blade 18' },
      image: { src: '/images/blade-18.webp', alt: 'Razer Blade 18 gaming laptop' },
    },
    {
      wide: false,
      index: 'Control · Wireless',
      title: 'Razer Basilisk V3 Pro 35K',
      copy: 'Fully customizable wireless ergonomic RGB gaming mouse.',
      link: { href: '/gaming-mice/razer-basilisk-v3-pro-35k', label: 'Meet Basilisk' },
      image: { src: '/images/basilisk-family.webp', alt: 'Razer Basilisk V3 Pro 35K gaming mouse' },
    },
    {
      wide: false,
      index: 'Immersion · Chroma',
      title: 'Razer Soma Chroma',
      copy: 'True Integration. RGB Immersion.',
      link: { href: 'https://www.razer.com/gaming-chairs/razer-soma-chroma', label: 'Discover Soma' },
      image: { src: '/images/soma-chroma.webp', alt: 'Razer Soma Chroma RGB system' },
    },
  ],
};

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = readRows(block);
  const text = textReader(rows);
  const cellFor = (key) => rows.find((r) => r.key === key)?.cells[0];
  const textAt = (cells, i) => cells?.[i]?.textContent.trim() || '';

  const authored = rows.filter((r) => r.key === 'card' || r.key === 'card-wide');
  const cards = authored.length
    ? authored.map(({ key, cells }) => ({
      wide: key === 'card-wide',
      index: textAt(cells, 0),
      title: textAt(cells, 1),
      copy: textAt(cells, 2),
      link: cellLink(cells[3], 'Learn more'),
      image: cellImage(cells[4]),
    }))
    : DEFAULTS.cards;

  const grid = el('div', { class: 'family-grid' }, cards.map((card) => {
    const article = el('article', { class: `family-card${card.wide ? ' family-wide' : ''}` });
    if (card.image?.src) {
      // The img must stay a direct child: the object-fit rules target
      // `.family-card > img`, so a <picture> wrapper would break them.
      article.append(el('img', { src: card.image.src, alt: card.image.alt || '', loading: 'lazy' }));
    }
    article.append(el('div', { class: 'family-overlay' }));
    article.append(el('span', { class: 'card-index' }, [card.index]));
    const content = el('div', { class: 'family-content' }, [
      el('h3', {}, [card.title]),
      el('p', {}, [card.copy]),
    ]);
    if (card.link) {
      content.append(card.wide
        ? ctaLink(card.link, 'button-primary')
        : ctaLink(card.link, 'button-ghost', '›'));
    }
    article.append(content);
    return article;
  }));

  const heading = el('div', { class: 'section-heading' }, [
    el('div', {}, [
      el('p', { class: 'eyebrow' }, [text('eyebrow', DEFAULTS.eyebrow)]),
      el('h2', { html: cellHTML(cellFor('title')) || DEFAULTS.title }),
    ]),
    el('p', {}, [text('intro', DEFAULTS.intro)]),
  ]);

  const section = el('section', {
    class: 'section family-section',
    id: 'families',
  }, [el('div', { class: 'shell' }, [heading, grid])]);

  block.textContent = '';
  block.append(section);
}
