/*
 * Commerce layer for the razer-pdp-hero block.
 *
 * The block renders its full static design synchronously so the gallery image
 * stays the LCP element. This module is imported dynamically from decorate()
 * and hydrates the configurator on top: it resolves the authored finish, model
 * and care entries against the live Adobe Commerce catalog, swaps the
 * razer.com hand-off anchor for a real Add to Cart button, and drives the
 * displayed price from what Commerce actually reports.
 *
 * Two rules shape everything here.
 *
 * 1. The static render is the baseline. Every failure path leaves the page
 *    exactly as it renders with the tenant unreachable, so commerce can only
 *    ever add to the page, never subtract from it.
 * 2. Catalog Service cannot price custom options — ProductViewOptionValue
 *    exposes only id/title/inStock, refineProduct rejects custom-option UIDs,
 *    and this endpoint has no core products(filter:) query. So the configured
 *    total is NOT base + authored deltas in live mode; it is the variant price
 *    Commerce reports, and the true configured price is read back off the cart
 *    response after add to cart.
 *
 * Keep this module free of top-level imports of browser-only code: the pure
 * helpers below are unit-tested under `node --test`, and scripts/commerce.js,
 * scripts/aem.js and @dropins/storefront-* all throw `window is not defined`
 * outside a browser.
 */

import { formatPrice } from './razer-pdp-hero.js';

const PRODUCT_QUERY = `
  query RAZER_PDP_HERO($sku: String!, $skus: [String!]!) {
    products(skus: $skus) {
      __typename
      sku
      name
      urlKey
      inStock
      addToCartAllowed
      shortDescription
      images(roles: []) { url label roles }
      ... on SimpleProductView {
        price { final { amount { value currency } } }
      }
      ... on ComplexProductView {
        priceRange {
          minimum { final { amount { value currency } } regular { amount { value } } }
        }
        options { id title required values { id title inStock } }
      }
    }
    variants(sku: $sku) {
      variants {
        selections
        product {
          sku
          inStock
          ... on SimpleProductView { price { final { amount { value currency } } } }
        }
      }
    }
  }
`;

const GROUPS = ['finish', 'model', 'care'];
const GROUP_LISTS = { finish: 'finishes', model: 'models', care: 'cares' };
const FETCH_TIMEOUT_MS = 8000;
const ADDED_RESET_MS = 2500;
const MIN_QTY = 1;
const MAX_QTY = 99;

/* ── Pure helpers (unit-tested) ────────────────────────────────── */

/**
 * Normalizes an option title for fuzzy matching: lowercase, punctuation and
 * diacritics stripped, whitespace collapsed.
 * @param {string} value raw title
 * @returns {string} normalized title
 */
export function normalizeTitle(value) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Resolves the Commerce option-value UID for an authored entry.
 *
 * Precedence is deliberate: the authored/preset UID wins, because it is the
 * literal value `selected_options` requires, while the label is marketing copy
 * that authors are expected to edit. Title matching is the safety net for rows
 * added in DA without a UID, not the mechanism.
 * @param {{optionUid?: string, label?: string}} entry authored entry
 * @param {Array<{id: string, title: string}>} values catalog option values
 * @returns {string} resolved UID, or an empty string
 */
export function resolveEntryUid(entry, values) {
  if (!entry || !Array.isArray(values) || !values.length) return '';
  if (entry.optionUid && values.some((value) => value.id === entry.optionUid)) {
    return entry.optionUid;
  }
  const exact = values.find((value) => value.title === entry.label);
  if (exact) return exact.id;
  const normalized = normalizeTitle(entry.label);
  if (!normalized) return '';
  const fuzzy = values.find((value) => normalizeTitle(value.title) === normalized);
  return fuzzy ? fuzzy.id : '';
}

/**
 * Indexes the variants payload by the option UID that selects it.
 * @param {object} variantsPayload the `variants` half of the product query
 * @returns {Map<string, {sku: string, inStock: boolean, price: object}>} index
 */
export function indexVariants(variantsPayload) {
  const index = new Map();
  const list = variantsPayload?.variants || [];
  list.forEach((variant) => {
    const product = variant?.product;
    if (!product?.sku) return;
    (variant.selections || []).forEach((uid) => {
      index.set(uid, {
        sku: product.sku,
        inStock: product.inStock !== false,
        price: product.price?.final?.amount || null,
      });
    });
  });
  return index;
}

function scoreOption(entries, option) {
  const values = option?.values || [];
  return entries.reduce((count, entry) => (resolveEntryUid(entry, values) ? count + 1 : count), 0);
}

/**
 * Reconciles the authored finish/model/care entries with the catalog options.
 *
 * Which catalog option backs which group is derived by scoring every option
 * against every group and taking the best fit, rather than pinning the numeric
 * option ids — so the Admin renumbering the custom options does not break the
 * page.
 * @param {object} content merged block content
 * @param {object} product the catalog product
 * @param {Map<string, object>} variantsByUid output of indexVariants
 * @returns {{entries: object, unmapped: Array<object>}} reconciliation result
 */
export function mapCatalogToEntries(content, product, variantsByUid) {
  const options = [...(product?.options || [])];
  const entries = {};
  const unmapped = [];

  GROUPS.forEach((group) => {
    const authored = content[GROUP_LISTS[group]] || [];
    let best = null;
    let bestScore = 0;
    options.forEach((option) => {
      const score = scoreOption(authored, option);
      if (score > bestScore) {
        best = option;
        bestScore = score;
      }
    });
    if (best) options.splice(options.indexOf(best), 1);

    entries[group] = authored.map((entry) => {
      const optionUid = resolveEntryUid(entry, best?.values);
      const value = (best?.values || []).find((candidate) => candidate.id === optionUid);
      const variant = optionUid ? variantsByUid.get(optionUid) : null;
      const resolved = {
        ...entry,
        optionUid,
        // Custom options report inStock: null; only an explicit false is a signal.
        available: optionUid ? value?.inStock !== false && variant?.inStock !== false : false,
        variantSku: variant?.sku || '',
        variantPrice: variant?.price || null,
      };
      if (!optionUid) unmapped.push(resolved);
      return resolved;
    });
  });

  return { entries, unmapped };
}

/**
 * Resolves the price to display for a selection.
 *
 * The variant price is the authority for the finish — the child SKU carries any
 * colour surcharge, so a finish delta is never added on top of it. Custom
 * options are different: Catalog Service cannot price them at all, so under
 * `catalog+deltas` the authored model and care deltas stand in for the Admin
 * surcharges. Those deltas are a contract with the backend, verified by
 * tools/razer-pdp/verify-commerce-contract.mjs; under `catalog` they are
 * treated as unverified and dropped.
 * @param {object} product the catalog product
 * @param {object} selection current selection keyed by group
 * @param {object} entries reconciled entries keyed by group
 * @param {string} [priceSource] `catalog` or `catalog+deltas`
 * @returns {{value: number, currency: string}|null} price, or null
 */
export function resolveLivePrice(product, selection, entries, priceSource = 'catalog') {
  const finish = (entries?.finish || []).find((entry) => entry.key === selection?.finish);
  const fallback = product?.priceRange?.minimum?.final?.amount || product?.price?.final?.amount;
  const base = finish?.variantPrice && Number.isFinite(finish.variantPrice.value)
    ? finish.variantPrice
    : fallback;
  if (!base || !Number.isFinite(base.value)) return null;

  let { value } = base;
  if (priceSource === 'catalog+deltas') {
    ['model', 'care'].forEach((group) => {
      const chosen = (entries?.[group] || []).find((entry) => entry.key === selection?.[group]);
      if (chosen && Number.isFinite(chosen.delta)) value += chosen.delta;
    });
  }
  return { value: Math.round(value * 100) / 100, currency: base.currency };
}

/**
 * Clamps an authored or typed quantity to a whole number in [1, 99].
 * @param {string|number} raw quantity input
 * @returns {number} clamped quantity
 */
export function clampQuantity(raw) {
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return MIN_QTY;
  return Math.min(MAX_QTY, Math.max(MIN_QTY, parsed));
}

/**
 * Builds the addProductsToCart payload for the current selection.
 *
 * Sends the CONFIGURABLE PARENT sku and lets Commerce resolve the variant from
 * the option UIDs. Passing the child sku with `parent_sku` instead is accepted
 * by the API but produces a plain SimpleCartItem on a SKU that is not visible
 * individually in Catalog Service — the cart then has no product to render, so
 * the mini-cart shows a subtotal with no line items, and the configurable and
 * customizable option labels are lost. The parent shape yields a proper
 * ConfigurableCartItem carrying both.
 * @param {object} args build arguments
 * @param {string} args.parentSku the configurable parent SKU
 * @param {object} args.selection current selection keyed by group
 * @param {object} args.entries reconciled entries keyed by group
 * @param {number} args.quantity requested quantity
 * @returns {{sku: string, quantity: number, optionsUIDs: Array<string>}} payload
 */
export function buildCartItem({
  parentSku, selection, entries, quantity,
}) {
  const optionsUIDs = [];

  GROUPS.forEach((group) => {
    const list = entries?.[group] || [];
    if (!list.length) return;
    const chosen = list.find((entry) => entry.key === selection?.[group]);
    if (!chosen || !chosen.optionUid) {
      const error = new Error(`razer-pdp-hero: no commerce option for "${group}"`);
      error.code = 'UNMAPPED_OPTION';
      error.group = group;
      throw error;
    }
    optionsUIDs.push(chosen.optionUid);
  });

  return {
    sku: parentSku,
    quantity: clampQuantity(quantity),
    optionsUIDs,
  };
}

/**
 * Reads the line price Commerce charged for the item we just added. This is the
 * only configured total on the page that is unconditionally true.
 * @param {object} cart the CartModel returned by addProductsToCart
 * @param {string} parentSku the configurable parent SKU
 * @returns {{value: number, currency: string}|null} line price, or null
 */
export function readCartLinePrice(cart, parentSku) {
  const items = cart?.items || [];
  const wanted = String(parentSku || '').toLowerCase();
  const match = items.find((item) => String(item?.topLevelSku || '').toLowerCase() === wanted)
    || items[items.length - 1];
  const price = match?.price;
  if (price && Number.isFinite(price.value)) {
    return { value: price.value, currency: price.currency };
  }
  return null;
}

/* ── Network ───────────────────────────────────────────────────── */

/**
 * Fetches the product and its variants in a single Catalog Service call.
 * @param {string} sku the configurable parent SKU
 * @returns {Promise<object>} the raw GraphQL data payload
 */
export async function fetchProduct(sku) {
  const { CS_FETCH_GRAPHQL } = await import('../../scripts/commerce.js');
  const payload = await CS_FETCH_GRAPHQL.fetchGraphQl(PRODUCT_QUERY, {
    method: 'GET',
    cache: 'default',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    variables: { sku, skus: [sku] },
  });
  if (Array.isArray(payload?.errors) && payload.errors.length) {
    throw new Error(payload.errors.map((entry) => entry.message).join('; '));
  }
  return payload?.data || payload;
}

/**
 * Adds one configured item to the cart.
 * @param {object} item the buildCartItem payload
 * @returns {Promise<object>} the resulting CartModel
 */
export async function addToCart(item) {
  const { addProductsToCart } = await import('@dropins/storefront-cart/api.js');
  return addProductsToCart([item]);
}

/* ── DOM ───────────────────────────────────────────────────────── */

function el(tag, className = '', children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  children.forEach((child) => {
    if (child) node.append(child);
  });
  return node;
}

function buildQuantityControl(config, labels) {
  const wrap = el('div', 'config-qty');
  const legend = el('span', 'summary-eyebrow');
  legend.id = 'pdp-qty-label';
  legend.textContent = config['qty-label'];
  const control = el('div', 'qty-control');

  const step = (direction, label) => {
    const button = el('button', 'qty-step');
    button.type = 'button';
    button.dataset.step = String(direction);
    button.setAttribute('aria-label', label);
    button.textContent = direction < 0 ? '−' : '+';
    return button;
  };

  const input = el('input', 'qty-input');
  input.type = 'number';
  input.inputMode = 'numeric';
  input.min = String(MIN_QTY);
  input.max = String(MAX_QTY);
  input.step = '1';
  input.value = String(MIN_QTY);
  input.setAttribute('aria-labelledby', 'pdp-qty-label');

  control.append(step(-1, labels.decrease), input, step(1, labels.increase));
  wrap.append(legend, control);
  return { wrap, input };
}

function setState(button, state, label) {
  button.dataset.state = state;
  button.textContent = label;
  const busy = state === 'adding';
  const blocked = busy || state === 'unavailable' || state === 'unmapped';
  button.disabled = blocked;
  if (busy) button.setAttribute('aria-busy', 'true');
  else button.removeAttribute('aria-busy');
}

function attach({
  block, content, refs, product, mapping,
}) {
  const { config } = content;
  const { entries } = mapping;
  const parentSku = product.sku;

  // The anchor is the offline hand-off to razer.com; swap it only now that we
  // know the catalog answered and the product is purchasable.
  const anchor = refs.cta;
  if (!anchor) return null;
  const button = el('button', 'button button-primary config-cta');
  button.type = 'button';
  anchor.replaceWith(button);
  refs.cta = button;

  const status = el('p', 'config-cta-status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  button.after(status);

  const qty = buildQuantityControl(config, {
    decrease: config['qty-decrease-label'],
    increase: config['qty-increase-label'],
  });
  // Sits directly before the CTA so the stacked order reads
  // configuration -> price -> quantity -> buy, and so the two-column
  // breakpoint pairs it with the button rather than squeezing the summary.
  button.before(qty.wrap);

  qty.wrap.addEventListener('click', (event) => {
    const stepper = event.target.closest('.qty-step');
    if (!stepper) return;
    const next = clampQuantity(Number(qty.input.value) + Number(stepper.dataset.step));
    qty.input.value = String(next);
    qty.input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  qty.input.addEventListener('change', () => {
    qty.input.value = String(clampQuantity(qty.input.value));
  });

  // The authored `+ US$40` chips are unverifiable claims once a real buy button
  // is on the page — Catalog Service will not price custom options.
  if (config['price-source'] !== 'catalog+deltas') {
    block.querySelectorAll('.option-delta').forEach((node) => node.remove());
  }

  // Reflect real stock and drop the "purchasing is confirmed on Razer.com" copy.
  if (refs.configNote && config['config-body-live']) {
    refs.configNote.textContent = config['config-body-live'];
  }
  const stockNote = () => (product.inStock ? config['in-stock-note'] : config['out-of-stock-note']);
  const setNote = (message) => {
    if (refs.availabilityNote) refs.availabilityNote.textContent = message;
  };
  setNote(stockNote());
  // Only warn about unpriced options when we are actually not pricing them.
  if (refs.priceNote && config['price-source'] !== 'catalog+deltas'
    && config['price-options-note']) {
    refs.priceNote.textContent = config['price-options-note'];
  }

  const chosenEntry = (group, selection) => (entries[group] || [])
    .find((entry) => entry.key === selection[group]);

  const idle = () => {
    if (product.inStock === false) return ['unavailable', config['out-of-stock-label']];
    return ['idle', config['add-to-cart-label']];
  };

  // Catalog Service reporting a variant as inStock is not the same as the cart
  // accepting it: a child product that is disabled or not assigned to the
  // website still indexes, and the cart then refuses the selection. There is no
  // way to know before trying, so a refusal retires that finish for the session
  // rather than leaving a swatch that fails every time it is clicked.
  const rejectedFinishes = new Set();

  const applyAvailability = (selection) => {
    (entries.finish || []).forEach((entry) => {
      const found = (refs.optionButtons.get('finish') || [])
        .find((pair) => pair.entry.key === entry.key);
      if (!found) return;
      const usable = entry.available && !rejectedFinishes.has(entry.key);
      found.button.disabled = !usable;
      found.button.classList.toggle('is-unavailable', !usable);
    });
    if (rejectedFinishes.has(selection.finish)) {
      setState(button, 'unmapped', config['unavailable-config-label']);
      // Never leave "In stock" sitting under a button that cannot be pressed.
      setNote(config['unavailable-config-note']);
      return;
    }

    const selected = GROUPS.map((group) => chosenEntry(group, selection));
    if (selected.some((entry) => entry && !entry.optionUid)) {
      setState(button, 'unmapped', config['unavailable-config-label']);
      setNote(config['unavailable-config-note']);
      return;
    }
    if (selected.some((entry) => entry && !entry.available)) {
      setState(button, 'unavailable', config['out-of-stock-label']);
      setNote(config['out-of-stock-note']);
      return;
    }
    // Back on a buyable configuration: clear any stale rejection message.
    if (status.getAttribute('role') === 'alert') {
      status.removeAttribute('role');
      status.textContent = '';
    }
    setNote(stockNote());
    if (button.dataset.state !== 'added') setState(button, ...idle());
  };

  let addInFlight = false;
  let resetTimer = 0;

  const handleAdd = async (selection) => {
    if (addInFlight) return;
    addInFlight = true;
    window.clearTimeout(resetTimer);
    status.textContent = '';
    status.removeAttribute('role');
    setState(button, 'adding', config['adding-label']);
    try {
      const item = buildCartItem({
        parentSku, selection, entries, quantity: qty.input.value,
      });
      const cart = await addToCart(item);
      const line = readCartLinePrice(cart, parentSku);
      setState(button, 'added', config['added-label']);
      if (line) {
        const money = formatPrice(config['currency-prefix'], line.value);
        status.textContent = `${config['added-label']} — ${money}`;
        // The cart is the only authority for option pricing, so let it correct
        // the configured total rather than leaving a number we cannot verify.
        if (refs.priceValue && Math.abs(line.value - refs.liveValue) > 0.005) {
          refs.priceValue.textContent = money;
          console.info('razer-pdp-hero: configured total corrected from the cart', line.value);
        }
      } else {
        status.textContent = config['added-label'];
      }
      resetTimer = window.setTimeout(() => setState(button, ...idle()), ADDED_RESET_MS);
    } catch (error) {
      console.warn('razer-pdp-hero: add to cart failed', error);
      status.setAttribute('role', 'alert');
      if (error?.code === 'UNMAPPED_OPTION') {
        setState(button, 'unmapped', config['unavailable-config-label']);
        status.textContent = config['unavailable-config-label'];
      } else {
        // Commerce refused the configuration. Its wording ("You need to choose
        // options for your item") describes an API contract, not anything a
        // shopper can act on, so retire the finish and say so in our own words.
        rejectedFinishes.add(selection.finish);
        status.textContent = config['unavailable-config-label'];
        applyAvailability(selection);
      }
    } finally {
      addInFlight = false;
    }
  };

  return { applyAvailability, handleAdd, button };
}

// shortDescription is authored HTML from the catalog. DOMParser is used rather
// than innerHTML so nothing in it can execute or fetch while we take the text.
function stripHtml(value) {
  if (typeof value !== 'string' || !value) return '';
  const parsed = new DOMParser().parseFromString(value, 'text/html');
  return (parsed.body.textContent || '').replace(/\s+/g, ' ').trim();
}

async function emitJsonLd(content, product) {
  const price = product?.priceRange?.minimum?.final?.amount;
  if (!price) return;
  try {
    const { setJsonLd } = await import('../../scripts/commerce.js');
    setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name || content.config.title,
      sku: product.sku,
      description: stripHtml(product.shortDescription) || content.config.subtitle,
      // The catalog carries no imagery, so the repo-hosted gallery is the only
      // source — and it is what preloadImageMiddleware should be pointed at.
      image: content.images.map((image) => new URL(image.src, window.location.origin).href),
      offers: {
        '@type': 'Offer',
        price: price.value,
        priceCurrency: price.currency,
        availability: product.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        url: window.location.href,
      },
    }, 'product');
  } catch (error) {
    console.warn('razer-pdp-hero: could not publish product JSON-LD', error);
  }
}

/**
 * Hydrates the block against the live catalog. Resolves to an object with an
 * `attach(config)` hook, or to null when the page should stay static.
 * @param {Element} block the block element
 * @param {object} content merged block content
 * @param {object} refs render refs collected during decorate
 * @returns {Promise<{attach: Function}|null>} the commerce handle, or null
 */
export async function hydrate(block, content, refs) {
  const offline = (reason, detail) => {
    block.dataset.commerce = 'offline';
    if (reason) console.warn(`razer-pdp-hero: ${reason}`, detail || '');
    return null;
  };

  let { sku } = content.config;
  try {
    const { getMetadata } = await import('../../scripts/aem.js');
    sku = getMetadata('sku') || sku;
  } catch (error) {
    // No document metadata outside the pipeline; the authored setting stands.
  }
  if (!sku) return offline('no sku configured');

  let data;
  try {
    data = await fetchProduct(sku);
  } catch (error) {
    return offline('catalog unavailable', error);
  }

  const product = (data?.products || []).find((candidate) => candidate);
  if (!product) return offline('product not found', sku);
  if (product.addToCartAllowed !== true) return offline('product is not purchasable', sku);

  const mapping = mapCatalogToEntries(content, product, indexVariants(data?.variants));
  if (mapping.unmapped.length) {
    console.warn('razer-pdp-hero: options without a commerce match', mapping.unmapped
      .map((entry) => entry.key).join(', '));
  }

  block.dataset.commerce = 'live';
  emitJsonLd(content, product);

  return {
    product,
    mapping,
    attach: (configurator) => {
      const api = attach({
        block, content, refs, product, mapping,
      });
      if (!api || !configurator) return;

      configurator.setPriceRenderer((selection) => {
        const price = resolveLivePrice(
          product,
          selection,
          mapping.entries,
          content.config['price-source'],
        );
        if (!price) return null;
        refs.liveValue = price.value;
        return price.value;
      });
      configurator.onSync((selection) => api.applyAvailability(selection));
      api.button.addEventListener('click', () => api.handleAdd(configurator.selection));
      configurator.sync();
    },
  };
}
