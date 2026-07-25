import {
  readRows, textReader, cellHTML, cellLink, el,
} from '../../scripts/razer-chroma.js';

/*
 * Row contract (repeat `card`; omit everything for DEFAULTS):
 *   eyebrow    | Technical resources
 *   title      | Know your gear.
 *   intro      | Focused guides for the details that change how a setup feels.
 *   kind       | Buying guide
 *   link-label | Read the guide
 *   card       | Razer Mouse Guide | Grip, shape, sensor... | /pc/gaming-mice
 *
 * Each card is an <a> whose direct children the CSS targets, so the DOM is
 * built rather than decorated in place.
 */

const DEFAULTS = {
  eyebrow: 'Technical resources',
  title: 'Know your gear.',
  intro: 'Focused guides for the details that change how a setup feels.',
  kind: 'Buying guide',
  linkLabel: 'Read the guide',
  cards: [
    ['Razer Mouse Guide', 'Grip, shape, sensor, and wireless choices.', '/pc/gaming-mice'],
    ['Razer Laptop Guide', 'Choose the right Blade for play and creation.', 'https://www.razer.com/gaming-laptops'],
    ['Razer Keyboard Guide', 'Switch feel, formats, and customization.', 'https://www.razer.com/pc/gaming-keyboards-and-keypads'],
    ['Razer Headset Guide', 'Audio, comfort, and platform compatibility.', 'https://www.razer.com/pc/gaming-headsets-and-audio'],
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

  const kind = text('kind', DEFAULTS.kind);
  const linkLabel = text('link-label', DEFAULTS.linkLabel);

  const authored = rows.filter((r) => r.key === 'card');
  const cards = authored.length
    ? authored.map(({ cells }) => ({
      title: textAt(cells, 0),
      copy: textAt(cells, 1),
      href: cellLink(cells[2])?.href || '',
    }))
    : DEFAULTS.cards.map(([title, copy, href]) => ({ title, copy, href }));

  const grid = el('div', { class: 'resource-grid' }, cards.map((card, i) => {
    const cta = el('strong', {}, [`${linkLabel} `]);
    cta.append(el('b', {}, ['↗']));
    return el('a', { class: 'resource-card', href: card.href }, [
      el('span', {}, [`${String(i + 1).padStart(2, '0')} · ${kind}`]),
      el('h3', {}, [card.title]),
      el('p', {}, [card.copy]),
      cta,
    ]);
  }));

  const heading = el('div', { class: 'section-heading' }, [
    el('div', {}, [
      el('p', { class: 'eyebrow' }, [text('eyebrow', DEFAULTS.eyebrow)]),
      el('h2', { html: cellHTML(cellFor('title')) || DEFAULTS.title }),
    ]),
    el('p', {}, [text('intro', DEFAULTS.intro)]),
  ]);

  const section = el('section', { class: 'section resource-section' }, [
    el('div', { class: 'shell' }, [heading, grid]),
  ]);

  block.textContent = '';
  block.append(section);
}
