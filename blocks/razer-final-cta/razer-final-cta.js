import {
  readRows, textReader, cellHTML, cellLink, el, ctaLink,
} from '../../scripts/razer-chroma.js';

/*
 * Row contract (every row optional; omitted rows fall back to DEFAULTS):
 *   eyebrow      | Your next setup starts here
 *   title        | Build your unfair advantage.
 *   body         | Enter the ecosystem. Tune it to your play.
 *   cta-primary  | [Shop the latest](/pc/gaming-mice)
 *   cta-ghost    | [Find your gear](/gear-finder)
 */

const DEFAULTS = {
  eyebrow: 'Your next setup starts here',
  title: 'Build your unfair advantage.',
  body: 'Enter the ecosystem. Tune it to your play.',
  ctaPrimary: { href: '/pc/gaming-mice', label: 'Shop the latest' },
  ctaGhost: { href: '/gear-finder', label: 'Find your gear' },
};

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = readRows(block);
  const text = textReader(rows);
  const cellFor = (key) => rows.find((r) => r.key === key)?.cells[0];

  const titleHTML = cellHTML(cellFor('title')) || DEFAULTS.title;
  const primary = cellLink(cellFor('cta-primary'), DEFAULTS.ctaPrimary.label) || DEFAULTS.ctaPrimary;
  const ghost = cellLink(cellFor('cta-ghost'), DEFAULTS.ctaGhost.label) || DEFAULTS.ctaGhost;

  const buttons = el('div', { class: 'button-row' }, [
    ctaLink(primary, 'button-primary'),
    ctaLink(ghost, 'button-ghost', '›'),
  ]);

  const section = el('section', { class: 'final-cta' }, [
    el('div', { class: 'final-glow', 'aria-hidden': 'true' }),
    el('div', { class: 'shell' }, [
      el('p', { class: 'eyebrow' }, [text('eyebrow', DEFAULTS.eyebrow)]),
      el('h2', { html: titleHTML }),
      el('p', {}, [text('body', DEFAULTS.body)]),
      buttons,
    ]),
  ]);

  block.textContent = '';
  block.append(section);
}
