import {
  buildBlock,
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
 * Homepage content blocks ported from the razer-chroma-reactor site. They
 * share one set of design tokens and primitives in
 * styles/razer-chroma-shared.css.
 *
 * The site chrome (razer-site-header, razer-site-footer, razer-promo-bar) is
 * deliberately absent: those blocks are self-contained, carrying their own
 * copy of the tokens, and stamping the shared marker class on them would let
 * this file's element-level rules restyle them.
 */
const RAZER_CHROMA_BLOCKS = [
  'razer-campaign-carousel',
  'razer-capability-grid',
  'razer-family-grid',
  'razer-final-cta',
  'razer-gear-finder',
  'razer-home-hero',
  'razer-home-promo-bar',
  'razer-proof-strip',
  'razer-resource-grid',
  'razer-story-grid',
  'razer-use-case-tabs',
];

/**
 * Loads the razer-chroma tokens and marks up the page for them, but only when
 * one of those blocks is actually present.
 *
 * Deliberately not part of the global stylesheet chain: these blocks are a
 * dark, full-bleed brand system, and installing it globally would restyle
 * every razer page. A page using none of these blocks never requests the file.
 *
 * Runs in the eager phase rather than the lazy one because the header and hero
 * are LCP content -- deferring the theme would flash the default light page.
 *
 * @param {Element} doc The container element
 */
function loadRazerChromaStyles(doc) {
  const blocks = doc.querySelectorAll(RAZER_CHROMA_BLOCKS.map((name) => `.${name}.block`).join(','));
  if (!blocks.length) return;
  // Marker class the shared stylesheet scopes to. A broader attribute selector
  // would also catch the unrelated razer-minipage blocks.
  blocks.forEach((block) => block.classList.add('razer-chroma'));
  document.body.classList.add('razer-chroma-page');
  loadCSS(`${window.hlx.codeBasePath}/styles/razer-chroma-shared.css`);
}

/**
 * Collapses the boilerplate <header> on pages that author the razer site
 * chrome. Those pages bring their own fixed header, so the space styles.css
 * reserves for the boilerplate nav paints as an empty band above the first
 * section -- and whatever /nav holds (a leftover commerce nav, or a 404)
 * must not surface next to the razer chrome. Runs in the eager phase so the
 * band never reaches first paint; the header block adds the same class when
 * the nav fragment is missing, which covers every other page.
 *
 * @param {Element} doc The container element
 */
function collapseBoilerplateHeader(doc) {
  if (!doc.querySelector('main .razer-site-header')) return;
  doc.querySelector('body > header')?.classList.add('nav-missing');
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
      decorateMain(main);
      loadRazerChromaStyles(doc);
      collapseBoilerplateHeader(doc);
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
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

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
