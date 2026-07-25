import {
  readRows, textReader, cellHTML, cellLink, cellImage, el, ctaLink,
} from '../../scripts/razer-chroma.js';

/*
 * Row contract (every row optional; omitted rows fall back to DEFAULTS):
 *   eyebrow       | Razer Seiren V3 Chroma 32-Bit DSP
 *   title         | Light up your voice
 *   body          | Clearer sound. Full-color presence.
 *   image         | /images/seiren-hero-desktop.webp
 *   image-mobile  | /images/seiren-hero-mobile.webp
 *   image-alt     | Three Razer Seiren V3 Chroma microphones...
 *   cta-ghost     | [Learn more](https://...)
 *   cta-primary   | [Buy now](https://www.razer.com/store)
 *   scroll-label  | Explore the ecosystem
 *   scroll-target | #proof
 */

const DEFAULTS = {
  eyebrow: 'Razer Seiren V3 Chroma 32-Bit DSP',
  title: 'Light up your voice',
  body: 'Clearer sound. Full-color presence.',
  image: '/images/seiren-hero-desktop.webp',
  imageMobile: '/images/seiren-hero-mobile.webp',
  imageAlt: 'Three Razer Seiren V3 Chroma microphones illuminated with RGB lighting',
  ctaGhost: { href: 'https://www.razer.com/streaming-microphones/razer-seiren-v3-chroma', label: 'Learn more' },
  ctaPrimary: { href: 'https://www.razer.com/store', label: 'Buy now' },
  scrollLabel: 'Explore the ecosystem',
  scrollTarget: '#proof',
};

const HERO_TITLE_ID = 'razer-home-hero-title';

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = readRows(block);
  const text = textReader(rows);
  const cellFor = (key) => rows.find((r) => r.key === key)?.cells[0];

  const desktop = cellImage(cellFor('image'));
  const mobile = cellImage(cellFor('image-mobile'));
  const alt = text('image-alt', desktop?.alt || DEFAULTS.imageAlt);

  // <picture> with an authored mobile source, matching the source markup. The
  // img must stay a direct child so the object-fit rules apply.
  const picture = el('picture', { class: 'home-hero-media' });
  const mobileSrc = mobile?.src || DEFAULTS.imageMobile;
  if (mobileSrc) {
    picture.append(el('source', { media: '(max-width: 767px)', srcset: mobileSrc }));
  }
  picture.append(el('img', { src: desktop?.src || DEFAULTS.image, alt }));

  const ghost = cellLink(cellFor('cta-ghost'), DEFAULTS.ctaGhost.label) || DEFAULTS.ctaGhost;
  const primary = cellLink(cellFor('cta-primary'), DEFAULTS.ctaPrimary.label) || DEFAULTS.ctaPrimary;

  const content = el('div', { class: 'shell home-hero-content' }, [
    el('p', { class: 'eyebrow' }, [text('eyebrow', DEFAULTS.eyebrow)]),
    el('h1', { id: HERO_TITLE_ID, html: cellHTML(cellFor('title')) || DEFAULTS.title }),
    el('p', {}, [text('body', DEFAULTS.body)]),
    el('div', { class: 'button-row' }, [
      ctaLink(ghost, 'button-ghost', '›'),
      ctaLink(primary, 'button-primary'),
    ]),
  ]);

  const scroll = el('a', {
    class: 'hero-scroll',
    href: text('scroll-target', DEFAULTS.scrollTarget),
  }, [`${text('scroll-label', DEFAULTS.scrollLabel)} `]);
  scroll.append(el('span', { 'aria-hidden': 'true' }, ['↓']));

  const section = el('section', {
    class: 'home-hero',
    'aria-labelledby': HERO_TITLE_ID,
  }, [
    picture,
    el('div', { class: 'hero-atmosphere', 'aria-hidden': 'true' }),
    content,
    scroll,
  ]);

  block.textContent = '';
  block.append(section);
}
