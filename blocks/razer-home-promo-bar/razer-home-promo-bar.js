import {
  readRows, textReader, cellLink, el,
} from '../../scripts/razer-chroma.js';

/*
 * The homepage sitewide promo strip.
 *
 * Named `razer-home-promo-bar` rather than `razer-promo-bar` because the PLP
 * page has its own promo strip block with different copy and a different
 * table contract; the two are not interchangeable.
 *
 * Row contract (every row optional; omitted rows fall back to DEFAULTS):
 *   message | Razer Back-to-School Kits: education perks plus bonus...
 *   cta     | [Shop now >](https://www.razer.com/education)
 */

const DEFAULTS = {
  message: 'Razer Back-to-School Kits: education perks plus bonus Razer skin with eligible Razer Blade purchase.',
  cta: { href: 'https://www.razer.com/education', label: 'Shop now >' },
};

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = readRows(block);
  const text = textReader(rows);
  const cta = cellLink(rows.find((r) => r.key === 'cta')?.cells[0], DEFAULTS.cta.label)
    || DEFAULTS.cta;

  const promo = el('div', { class: 'sitewide-promo' }, [
    el('span', {}, [text('message', DEFAULTS.message)]),
    el('a', { href: cta.href }, [cta.label]),
  ]);

  block.textContent = '';
  block.append(promo);
}
