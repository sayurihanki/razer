import {
  readRows, textReader, cellHTML, cellLink, el,
} from '../../scripts/razer-chroma.js';

/*
 * Row contract (repeat `card`; omit everything for DEFAULTS):
 *   eyebrow     | Engineered advantage
 *   title       | Every millisecond.<br><span>Every movement.</span>
 *   intro       | Hardware, software, and lighting technologies...
 *   index-label | TECH
 *   card        | HS | Razer HyperSpeed Wireless | Copy... | [Explore technology](url)
 *
 * Cards are numbered automatically as `<index-label> · 01`, matching the source.
 */

const DEFAULTS = {
  eyebrow: 'Engineered advantage',
  title: 'Every millisecond.<br><span>Every movement.</span>',
  intro: 'Hardware, software, and lighting technologies designed as one connected performance ecosystem.',
  indexLabel: 'TECH',
  linkLabel: 'Explore technology',
  href: 'https://www.razer.com/technology',
  cards: [
    ['HS', 'Razer HyperSpeed Wireless', 'Ultra-fast wireless performance engineered for responsive, low-latency play across compatible Razer gear.'],
    ['35K', 'Razer Focus Pro 35K Optical Sensor Gen-2', 'Advanced tracking with deep adjustment options for precise competitive control.'],
    ['RGB', 'Razer Chroma RGB', 'Dynamic lighting that brings games, devices, and battle stations into sync.'],
    ['SYN', 'Razer Synapse', 'Configure compatible devices, personalize controls, and manage profiles from one place.'],
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

  const indexLabel = text('index-label', DEFAULTS.indexLabel);

  const authored = rows.filter((r) => r.key === 'card');
  const cards = authored.length
    ? authored.map(({ cells }) => ({
      glyph: textAt(cells, 0),
      title: textAt(cells, 1),
      copy: textAt(cells, 2),
      link: cellLink(cells[3], DEFAULTS.linkLabel)
        || { href: DEFAULTS.href, label: DEFAULTS.linkLabel },
    }))
    : DEFAULTS.cards.map(([glyph, title, copy]) => ({
      glyph, title, copy, link: { href: DEFAULTS.href, label: DEFAULTS.linkLabel },
    }));

  const grid = el('div', { class: 'capability-grid' }, cards.map((card, i) => {
    const link = el('a', {
      href: card.link.href,
      'aria-label': `Learn about ${card.title}`,
    }, [`${card.link.label} `]);
    link.append(el('span', {}, ['↗']));
    return el('article', { class: 'capability-card' }, [
      el('span', { class: 'card-index' }, [`${indexLabel} · ${String(i + 1).padStart(2, '0')}`]),
      el('strong', { class: 'capability-glyph' }, [card.glyph]),
      el('h3', {}, [card.title]),
      el('p', {}, [card.copy]),
      link,
    ]);
  }));

  const heading = el('div', { class: 'section-heading' }, [
    el('div', {}, [
      el('p', { class: 'eyebrow' }, [text('eyebrow', DEFAULTS.eyebrow)]),
      el('h2', { html: cellHTML(cellFor('title')) || DEFAULTS.title }),
    ]),
    el('p', {}, [text('intro', DEFAULTS.intro)]),
  ]);

  const section = el('section', {
    class: 'section technology-section',
    id: 'technology',
  }, [el('div', { class: 'shell' }, [heading, grid])]);

  block.textContent = '';
  block.append(section);
}
