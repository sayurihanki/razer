import {
  readRows, textReader, cellHTML, cellLink, cellImage, el,
} from '../../scripts/razer-chroma.js';

/*
 * Row contract (the first `card-main` spans both rows on desktop):
 *   eyebrow   | Latest from Razer
 *   title     | Inside the ecosystem.
 *   intro     | New ways to be heard, seen, and powered...
 *   card-main | Creator signal | Razer Seiren V3... | Light up your voice. | url | image
 *   card      | Immersion      | Razer Soma Chroma  | True Integration...   | url | image
 */

const DEFAULTS = {
  eyebrow: 'Latest from Razer',
  title: 'Inside the ecosystem.',
  intro: 'New ways to be heard, seen, and powered across play and creation.',
  cards: [
    {
      main: true,
      kicker: 'Creator signal',
      title: 'Razer Seiren V3 Chroma 32-Bit DSP',
      copy: 'Light up your voice.',
      href: 'https://www.razer.com/streaming-microphones/razer-seiren-v3-chroma',
      image: { src: '/images/seiren-hero-mobile.webp', alt: 'Razer Seiren V3 Chroma microphones' },
    },
    {
      main: false,
      kicker: 'Immersion',
      title: 'Razer Soma Chroma',
      copy: 'True Integration. RGB Immersion.',
      href: 'https://www.razer.com/gaming-chairs/razer-soma-chroma',
      image: { src: '/images/soma-chroma.webp', alt: 'Razer Soma Chroma' },
    },
    {
      main: false,
      kicker: 'Performance',
      title: 'Razer Blade 18',
      copy: 'The edge of performance for gamers & AI devs.',
      href: 'https://www.razer.com/gaming-laptops/razer-blade-18',
      image: { src: '/images/blade-18.webp', alt: 'Razer Blade 18' },
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

  const authored = rows.filter((r) => r.key === 'card' || r.key === 'card-main');
  const cards = authored.length
    ? authored.map(({ key, cells }) => ({
      main: key === 'card-main',
      kicker: textAt(cells, 0),
      title: textAt(cells, 1),
      copy: textAt(cells, 2),
      href: cellLink(cells[3])?.href || '',
      image: cellImage(cells[4]),
    }))
    : DEFAULTS.cards;

  const grid = el('div', { class: 'story-grid' }, cards.map((card) => {
    const anchor = el('a', {
      class: `story-card${card.main ? ' story-main' : ''}`,
      href: card.href,
    });
    if (card.image?.src) {
      anchor.append(el('img', { src: card.image.src, alt: card.image.alt || '', loading: 'lazy' }));
    }
    anchor.append(el('div', {}, [
      el('span', {}, [card.kicker]),
      el('h3', {}, [card.title]),
      el('p', {}, [card.copy]),
    ]));
    return anchor;
  }));

  const heading = el('div', { class: 'section-heading' }, [
    el('div', {}, [
      el('p', { class: 'eyebrow' }, [text('eyebrow', DEFAULTS.eyebrow)]),
      el('h2', { html: cellHTML(cellFor('title')) || DEFAULTS.title }),
    ]),
    el('p', {}, [text('intro', DEFAULTS.intro)]),
  ]);

  const section = el('section', { class: 'section story-section' }, [
    el('div', { class: 'shell' }, [heading, grid]),
  ]);

  block.textContent = '';
  block.append(section);
}
