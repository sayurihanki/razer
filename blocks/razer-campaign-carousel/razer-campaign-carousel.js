import {
  readRows, cellLink, cellImage, el, ctaLink,
} from '../../scripts/razer-chroma.js';

/*
 * Row contract (repeat `slide`; omit everything for DEFAULTS):
 *   label | Featured Razer products
 *   slide | Immersive control | Razer Basilisk V3 Pro 35K | Copy |
 *           [Learn more](url) | [Buy now](url) | image
 *
 * Behaviour mirrors the source component: slides auto-advance every 6.5s,
 * the pause button stops rotation, prev/next step through, and the dots are
 * a roving-focus tablist driven by ArrowLeft/ArrowRight. Any interaction
 * stops autoplay, matching the source -- once a visitor takes control the
 * carousel does not move under them again.
 */

const INTERVAL = 6500;

const DEFAULTS = {
  label: 'Featured Razer products',
  slides: [
    {
      eyebrow: 'Immersive control',
      title: 'Razer Basilisk V3 Pro 35K',
      copy: 'The apex of immersion and customization.',
      learn: { href: '/gaming-mice/razer-basilisk-v3-pro-35k', label: 'Learn more' },
      buy: { href: '/gaming-mice/razer-basilisk-v3-pro-35k/rz01-05240100-r3u1', label: 'Buy now' },
      image: { src: '/images/basilisk-family.webp', alt: 'Razer Basilisk V3 Pro 35K gaming mouse' },
    },
    {
      eyebrow: 'Desktop performance',
      title: 'Razer Blade 18',
      copy: 'The edge of performance for gamers and AI developers.',
      learn: { href: 'https://www.razer.com/gaming-laptops/razer-blade-18', label: 'Learn more' },
      buy: { href: 'https://www.razer.com/shop/pc/gaming-laptops', label: 'Buy now' },
      image: { src: '/images/blade-18.webp', alt: 'Razer Blade 18 gaming laptop' },
    },
    {
      eyebrow: 'Chroma immersion',
      title: 'Razer Soma Chroma',
      copy: 'True integration. RGB immersion.',
      learn: { href: 'https://www.razer.com/gaming-chairs/razer-soma-chroma', label: 'Learn more' },
      buy: { href: 'https://www.razer.com/gaming-chairs/razer-soma-chroma', label: 'Buy now' },
      image: { src: '/images/soma-chroma.webp', alt: 'Razer Soma Chroma illuminated gaming chair' },
    },
  ],
};

/**
 * Reads the authored slides, falling back to the shipped defaults.
 * @param {Array} rows Rows from readRows
 * @returns {Array<Object>} Slide models
 */
export function readSlides(rows) {
  const authored = rows.filter((r) => r.key === 'slide');
  if (!authored.length) return DEFAULTS.slides;
  const textAt = (cells, i) => cells?.[i]?.textContent.trim() || '';
  return authored.map(({ cells }) => ({
    eyebrow: textAt(cells, 0),
    title: textAt(cells, 1),
    copy: textAt(cells, 2),
    learn: cellLink(cells[3], 'Learn more') || { href: '#', label: 'Learn more' },
    buy: cellLink(cells[4], 'Buy now') || { href: '#', label: 'Buy now' },
    image: cellImage(cells[5]),
  }));
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = readRows(block);
  const slides = readSlides(rows);
  const label = rows.find((r) => r.key === 'label')?.cells[0]?.textContent.trim()
    || DEFAULTS.label;

  let current = 0;
  let playing = true;
  let timer = null;

  let media = el('div', { class: 'campaign-media' });
  const eyebrow = el('p', { class: 'eyebrow' });
  const heading = el('h2');
  const copy = el('p');
  const buttonRow = el('div', { class: 'button-row' });
  const content = el('div', { class: 'shell campaign-content', 'aria-live': 'off' }, [
    eyebrow, heading, copy, buttonRow,
  ]);

  const dots = el('div', {
    class: 'campaign-dots',
    role: 'tablist',
    'aria-label': 'Choose a featured product',
  });
  const dotButtons = slides.map((slide, i) => {
    const dot = el('button', {
      id: `campaign-tab-${i}`,
      type: 'button',
      role: 'tab',
      'aria-label': `Show ${slide.title}`,
    }, [el('span', {}, [String(i + 1).padStart(2, '0')])]);
    dots.append(dot);
    return dot;
  });

  const render = () => {
    const slide = slides[current];
    // Swapping in a fresh node restarts the reveal animation, which avoids
    // the usual force-a-reflow trick.
    const fresh = el('div', { class: 'campaign-media' });
    if (slide.image?.src) {
      fresh.append(el('img', { src: slide.image.src, alt: slide.image.alt || '' }));
    }
    media.replaceWith(fresh);
    media = fresh;

    eyebrow.textContent = slide.eyebrow;
    heading.textContent = slide.title;
    copy.textContent = slide.copy;
    buttonRow.textContent = '';
    buttonRow.append(
      ctaLink(slide.learn, 'button-ghost', '›'),
      ctaLink(slide.buy, 'button-primary'),
    );
    dotButtons.forEach((dot, i) => {
      dot.setAttribute('aria-selected', String(i === current));
      dot.tabIndex = i === current ? 0 : -1;
    });
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };

  const start = () => {
    stop();
    if (!playing) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer = window.setInterval(() => {
      current = (current + 1) % slides.length;
      render();
    }, INTERVAL);
  };

  const prev = el('button', { type: 'button', 'aria-label': 'Previous featured product' }, ['‹']);
  const playPause = el('button', { type: 'button', 'aria-label': 'Pause slide rotation' }, ['Ⅱ']);
  const next = el('button', { type: 'button', 'aria-label': 'Next featured product' }, ['›']);

  // Keeps the toggle's glyph and label truthful. Manual navigation also stops
  // rotation, so the button has to re-render then too -- otherwise it keeps
  // offering to "pause" a carousel that is already stopped.
  const syncPlayButton = () => {
    playPause.textContent = playing ? 'Ⅱ' : '▶';
    playPause.setAttribute('aria-label', playing ? 'Pause slide rotation' : 'Start slide rotation');
    content.setAttribute('aria-live', playing ? 'off' : 'polite');
  };

  // Any manual interaction takes over from autoplay, as in the source.
  const goTo = (index) => {
    playing = false;
    stop();
    current = (index + slides.length) % slides.length;
    syncPlayButton();
    render();
  };

  dotButtons.forEach((dot, i) => {
    dot.addEventListener('click', () => goTo(i));
    dot.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const target = (i + (event.key === 'ArrowRight' ? 1 : -1) + slides.length) % slides.length;
      goTo(target);
      dotButtons[target].focus();
    });
  });

  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  playPause.addEventListener('click', () => {
    playing = !playing;
    syncPlayButton();
    if (playing) start(); else stop();
  });

  const controls = el('div', { class: 'shell campaign-controls' }, [
    dots,
    el('div', { class: 'campaign-arrows' }, [prev, playPause, next]),
  ]);

  const section = el('section', {
    class: 'campaign-carousel',
    'aria-roledescription': 'carousel',
    'aria-label': label,
  }, [
    media,
    el('div', { class: 'campaign-scrim', 'aria-hidden': 'true' }),
    content,
    controls,
  ]);

  block.textContent = '';
  block.append(section);
  render();
  start();
}
