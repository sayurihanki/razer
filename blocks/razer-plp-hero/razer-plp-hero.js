/**
 * Razer PLP Hero block for EDS document authoring.
 *
 * Reproduces the `.plp-hero` section from the Razer gaming-mice demo
 * page: centered green display heading, supporting copy, and a muted
 * looping hero video with a pause/play control. Content is baked in, so
 * a table containing only the block name renders the exact source hero.
 *
 * Table contract (3 columns, typed rows):
 * setting: setting | <key> | <value>
 *   keys: heading, heading-id, body, video (path/link), video-label,
 *         pause-label, play-label, content-mode (merge|replace)
 *
 * Accessibility/behavior:
 * - The pause control carries `aria-pressed` and swaps its label and
 *   glyph (`Ⅱ` / `▶`).
 * - Under `prefers-reduced-motion: reduce` the video is hidden by CSS;
 *   JS additionally pauses it and strips `autoplay`, and reacts to the
 *   media query changing mid-session.
 *
 * The literal `__empty__` clears a preset value (an empty cell keeps it).
 */

const CLEAR_TOKEN = '__empty__';

const DEFAULT_CONTENT = {
  heading: 'Gaming Mice',
  headingId: 'gaming-mice-title',
  body: 'Whether you’re looking for a wired or wireless mouse, one specialized for FPS or MOBA, or a design that suits your mouse grip, our extensive arsenal of high-performance mice has something for every gamer.',
  video: '/images/razer-mice/mice-hero.mp4',
  videoLabel: 'A cinematic lineup of Razer gaming mice',
  pauseLabel: 'Pause hero animation',
  playLabel: 'Play hero animation',
};

const EMPTY_CONTENT = {
  heading: '',
  headingId: '',
  body: '',
  video: '',
  videoLabel: '',
  pauseLabel: '',
  playLabel: '',
};

const PAUSE_GLYPH = 'Ⅱ'; // Ⅱ ROMAN NUMERAL TWO, as in the source
const PLAY_GLYPH = '▶';

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

function setControlState(control, playing, content) {
  control.setAttribute('aria-pressed', playing ? 'false' : 'true');
  control.setAttribute('aria-label', playing ? content.pauseLabel : content.playLabel);
  control.querySelector('span').textContent = playing ? PAUSE_GLYPH : PLAY_GLYPH;
}

function buildMedia(content) {
  const video = el('video');
  video.muted = true;
  video.loop = true;
  video.autoplay = true;
  video.setAttribute('playsinline', '');
  video.preload = 'metadata';
  if (content.videoLabel) video.setAttribute('aria-label', content.videoLabel);

  const source = el('source');
  source.src = content.video;
  source.type = 'video/mp4';
  video.append(source);

  const glyph = el('span', '', [document.createTextNode(PAUSE_GLYPH)]);
  glyph.setAttribute('aria-hidden', 'true');
  const control = el('button', 'media-control', [glyph]);
  control.type = 'button';
  setControlState(control, true, content);

  control.addEventListener('click', () => {
    const playing = !video.paused;
    if (playing) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
    setControlState(control, !playing, content);
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const applyMotionPreference = () => {
    if (reducedMotion.matches) {
      video.pause();
      video.removeAttribute('autoplay');
    }
  };
  applyMotionPreference();
  reducedMotion.addEventListener('change', applyMotionPreference);

  return el('div', 'plp-hero-media', [video, control]);
}

/**
 * Loads and decorates the block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const settings = new Map();
  const settingCells = new Map();

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cellText(cells[0]).toLowerCase() !== 'setting') return;
    const key = cellText(cells[1]).toLowerCase();
    if (key) {
      settings.set(key, cellText(cells[2]));
      settingCells.set(key, cells[2]);
    }
  });

  const replace = (settings.get('content-mode') || 'merge').toLowerCase() === 'replace';
  const base = replace ? EMPTY_CONTENT : DEFAULT_CONTENT;

  const authoredVideo = settingCells.has('video')
    ? readHref(settingCells.get('video'))
    : '';

  const content = {
    heading: applyValue(settings.get('heading') || '', base.heading),
    headingId: applyValue(settings.get('heading-id') || '', base.headingId),
    body: applyValue(settings.get('body') || '', base.body),
    video: applyValue(authoredVideo, base.video),
    videoLabel: applyValue(settings.get('video-label') || '', base.videoLabel),
    pauseLabel: applyValue(settings.get('pause-label') || '', base.pauseLabel),
    playLabel: applyValue(settings.get('play-label') || '', base.playLabel),
  };

  block.textContent = '';

  const copy = el('div', 'plp-hero-copy rzrm-shell');
  if (content.heading) {
    const heading = el('h1', '', [document.createTextNode(content.heading)]);
    if (content.headingId) heading.id = content.headingId;
    copy.append(heading);
  }
  if (content.body) {
    copy.append(el('p', '', [document.createTextNode(content.body)]));
  }

  const hero = el('section', 'plp-hero', [copy]);
  if (content.headingId) hero.setAttribute('aria-labelledby', content.headingId);
  if (content.video) hero.append(buildMedia(content));

  block.append(hero);
}
