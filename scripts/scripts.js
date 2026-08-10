import {
  buildBlock,
  getMetadata,
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';
import {
  loadCommerceEager,
  loadCommerceLazy,
  initializeCommerce,
  applyTemplates,
  decorateLinks,
  loadErrorPage,
  decorateSections,
  IS_UE,
  IS_DA,
} from './commerce.js';

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    // Check if h1 or picture is already inside a hero block
    if (h1.closest('.hero') || picture.closest('.hero')) {
      return; // Don't create a duplicate hero block
    }
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }

    if (!main.querySelector('.hero')) buildHeroBlock(main);
  } catch (error) {
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
export function decorateMain(main) {
  decorateLinks(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
}

/*
 * Blocks that opt out of the Razer visual language. The minipage family is
 * a separate, self-contained design that shares only the razer- name
 * prefix, so marking it would restyle it.
 */
const RAZER_DESIGN_SYSTEM_EXCLUDES = /^razer-minipage/;

/**
 * Stamps the Razer design-system marker classes onto every Razer block and
 * the EDS section wrapping it.
 *
 * styles/razer-design-system.css is loaded globally from head.html, so
 * tokens, typography and the page foundation need no marker. These two
 * classes carry the things that must not apply page-wide:
 *  - .rzr-block  scopes the content primitives (.shell, .eyebrow,
 *    .section-heading, .button) and makes block links inherit their
 *    context's colour instead of the authored-link green;
 *  - .rzr-section makes the EDS section full-bleed, overriding the
 *    boilerplate's centred max-width column.
 *
 * Matching on data-block-name (set by decorateBlock) rather than a class
 * substring keeps this to real blocks whose name starts with razer-.
 *
 * @param {Element} main The container element
 */
function markRazerBlocks(main) {
  main.querySelectorAll('div.block[data-block-name^="razer-"]').forEach((block) => {
    if (RAZER_DESIGN_SYSTEM_EXCLUDES.test(block.dataset.blockName)) return;
    block.classList.add('rzr-block');
    block.closest('.section')?.classList.add('rzr-section');
  });
}

/**
 * True when the page carries the razer site chrome (razer-site-header) in
 * main and therefore never renders the boilerplate nav — whether the block
 * was authored onto the page or built in by buildRazerChrome.
 *
 * @param {Document} doc The container document
 * @returns {boolean}
 */
export function pageUsesOwnChrome(doc = document) {
  return !!doc.querySelector('main .razer-site-header');
}

/**
 * Builds the razer site chrome into pages that don't author it, so cart,
 * checkout, the account pages and every other storefront page inherited
 * from the boilerplate carry the same header and footer as the authored
 * razer pages instead of the boilerplate nav.
 *
 * Both blocks render their full preset from an empty table (see their
 * READMEs), so an empty block is the whole content contract — an author
 * who wants to override entries adds the real block to the page and this
 * step steps aside.
 *
 * Deliberately called from loadEager against the page's own main rather
 * than from decorateMain: decorateMain also runs over every loaded
 * fragment (including the header's own /mini-cart), which must not grow
 * a nested header. Running before decorateMain lets the built sections
 * pick up the normal section/block decoration.
 *
 * `chrome: none` in page metadata opts a page out and gives it the
 * boilerplate header and footer back.
 *
 * @param {Element} main The container element
 */
function buildRazerChrome(main) {
  if (getMetadata('chrome') === 'none') return;

  if (!main.querySelector('.razer-site-header')) {
    const section = document.createElement('div');
    section.append(buildBlock('razer-site-header', ''));
    main.prepend(section);
  }

  if (!main.querySelector('.razer-site-footer')) {
    const section = document.createElement('div');
    section.append(buildBlock('razer-site-footer', ''));
    main.append(section);
  }
}

/**
 * Collapses the boilerplate <header> and <footer> on pages that don't use
 * them, in the eager phase so the reserved --nav-height space never paints
 * as an empty band above the first section (and never jumps away later).
 *
 * Two signals, both known before first paint:
 * - the page carries the razer site chrome: it brings its own fixed header
 *   and footer, and whatever /nav and /footer hold (a leftover commerce
 *   nav, or a 404) must not surface next to them;
 * - the header block observed a missing nav fragment earlier this session
 *   (sessionStorage echo, same pattern as fonts-loaded): the first such page
 *   can only collapse once its fetch 404s, but every following page hides
 *   the header up front. The header block un-hides it if the nav comes back.
 *   This one says nothing about /footer, so it collapses the header alone.
 *
 * @param {Element} doc The container element
 */
function collapseBoilerplateChrome(doc) {
  const ownChrome = pageUsesOwnChrome(doc);
  let collapse = ownChrome;
  if (!collapse) {
    try {
      collapse = !!sessionStorage.getItem('nav-missing');
    } catch (e) {
      // do nothing
    }
  }
  if (!collapse) return;
  doc.querySelector('body > header')?.classList.add('nav-missing');
  if (ownChrome) doc.querySelector('body > footer')?.classList.add('chrome-owned');
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();

  const main = doc.querySelector('main');
  if (main) {
    try {
      await initializeCommerce();
      buildRazerChrome(main);
      decorateMain(main);
      markRazerBlocks(main);
      collapseBoilerplateChrome(doc);
      applyTemplates(doc);
      await loadCommerceEager();
    } catch (e) {
      console.error('Error initializing commerce configuration:', e);
      loadErrorPage(418);
    }
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/*
 * Blocks imported from the jenhankib2bbodea source repository that reference
 * the source's design tokens without a fallback value. They need
 * styles/bodea-shared.css or those declarations are dropped.
 */
const BODEA_TOKEN_BLOCKS = [
  'age-gate',
  'age-verification',
  'catalog-highlights',
  'commerce-account-hub',
  'form',
  'form-4',
  'guided-selling-luxe',
  'hero-3',
  'hero-5',
  'hero-6',
  'medal-rack-configurator',
  'newsletter',
  'product-configurator-luxe',
  'product-highlights',
  'product-teaser',
  'quiz-router',
  'search',
  'store-locator',
  'table',
  'tabs',
  'uniform-configurator',
  'vip-hero-block',
  'vip-hero-mccs',
  'vip-member-block',
  'vip-member-block-real-v2',
];

/**
 * Loads the imported source design tokens, but only when a block that needs
 * them is actually on the page.
 *
 * Deliberately not part of the global stylesheet chain: installing the
 * source's brand tokens globally would put its glassmorphic system on every
 * razer page. A page using none of these blocks never requests this file.
 *
 * @param {Element} doc The container element
 */
function loadBodeaSharedTokens(doc) {
  const selector = BODEA_TOKEN_BLOCKS.map((name) => `.${name}.block`).join(',');
  if (!doc.querySelector(selector)) return;
  loadCSS(`${window.hlx.codeBasePath}/styles/bodea-shared.css`);
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  // The boilerplate header and footer are collapsed on pages carrying the
  // razer chrome, so loading them would only spend a /nav and a /footer
  // fetch (plus both blocks' CSS and JS) on markup nobody sees.
  const ownChrome = pageUsesOwnChrome(doc);

  if (!ownChrome) loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  if (!ownChrome) loadFooter(doc.querySelector('footer'));

  loadCommerceLazy();

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadBodeaSharedTokens(doc);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

// UE Editor support before page load
if (IS_UE) {
  // eslint-disable-next-line import/no-unresolved
  await import(`${window.hlx.codeBasePath}/scripts/ue.js`).then(({ default: ue }) => ue());
}

loadPage();

(async function loadDa() {
  if (!IS_DA) return;
  // eslint-disable-next-line import/no-unresolved
  import('https://da.live/scripts/dapreview.js').then(({ default: daPreview }) => daPreview(loadPage));
}());
