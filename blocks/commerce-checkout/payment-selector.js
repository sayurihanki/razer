/* eslint-disable max-len */

/**
 * Razer demo payment selector.
 *
 * A presentation-only payment method picker rendered alongside the (hidden)
 * PaymentMethods dropin. The dropin keeps the cart's real payment method
 * (checkmo) selected and synchronized, so orders always place through the
 * live method regardless of which tile is chosen here.
 *
 * The tiles simulate their real flows — PayPal connects, the wallets
 * authorize, Klarna schedules real installments off the cart total, Razer
 * Gold debits a wallet balance — but every flow is local theatre: nothing
 * in this file calls the cart API, opens a window, or sends data anywhere.
 */

// eslint-disable-next-line import/no-unresolved
import { events } from '@dropins/tools/event-bus.js';

const DEMO_LINE = 'Demo — a simulated flow. Nothing is charged, stored or sent.';

const CHECK_ICON = '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** Small suffix marks swapped into the card-number field on brand detection. */
const CARD_BRANDS = [
  {
    id: 'visa',
    label: 'Visa',
    test: (digits) => /^4/.test(digits),
    mark: '<svg viewBox="0 0 40 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><text x="1" y="13" font-size="13" font-weight="800" font-style="italic" fill="#b8c6ff" font-family="Arial, sans-serif">VISA</text></svg>',
  },
  {
    id: 'mastercard',
    label: 'Mastercard',
    test: (digits) => /^(5[1-5]|2(22[1-9]|2[3-9]\d|[3-6]\d{2}|7[01]\d|720))/.test(digits),
    mark: '<svg viewBox="0 0 36 22" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="14" cy="11" r="9" fill="#eb001b"/><circle cx="23" cy="11" r="9" fill="#f79e1b" fill-opacity="0.85"/></svg>',
  },
  {
    id: 'amex',
    label: 'Amex',
    test: (digits) => /^3[47]/.test(digits),
    mark: '<svg viewBox="0 0 40 22" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="40" height="22" rx="3" fill="#2e77bc"/><text x="20" y="15" text-anchor="middle" font-size="9" font-weight="700" fill="#fff" font-family="Arial, sans-serif">AMEX</text></svg>',
  },
  {
    id: 'discover',
    label: 'Discover',
    test: (digits) => /^(6011|65)/.test(digits),
    mark: '<svg viewBox="0 0 40 22" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="40" height="22" rx="3" fill="#f4f4f4"/><text x="4" y="15" font-size="8" font-weight="700" fill="#1a1a1a" font-family="Arial, sans-serif">DISC</text><circle cx="32" cy="11" r="5" fill="#f76e20"/></svg>',
  },
];

const APPLE_GLYPH = '<path d="M9.5 5.9c.6-.8 1.1-1.9.9-3-.9.1-2 .7-2.7 1.5-.6.7-1.1 1.8-.9 2.9 1 0 2-.6 2.7-1.4zm2.6 6.9c0-2 1.6-3 1.7-3.1-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.5 2.1 2.5 2 1-.1 1.4-.6 2.6-.6s1.6.6 2.6.6c1.1 0 1.8-1 2.4-2 .8-1.1 1.1-2.2 1.1-2.3-.1 0-2.1-.8-2.1-3z" fill="currentColor"/>';

// ---------------------------------------------------------------------------
// Cart total — read from the event bus so the simulated flows quote the real
// order amount, and follow it when the cart changes.
// ---------------------------------------------------------------------------

function readCartTotal() {
  const cart = events.lastPayload('cart/data') ?? events.lastPayload('cart/initialized');
  const total = cart?.total?.includingTax;
  return total?.value != null
    ? { value: total.value, currency: total.currency || 'USD' }
    : { value: 0, currency: 'USD' };
}

function formatMoney({ value, currency }) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  } catch (e) {
    return `$${value.toFixed(2)}`;
  }
}

/** Split the total into 4 installments that add back up to the exact cents. */
function splitInFour({ value, currency }) {
  const cents = Math.round(value * 100);
  const base = Math.floor(cents / 4);
  const first = cents - base * 3;
  return [first, base, base, base].map((c) => ({ value: c / 100, currency }));
}

function installmentDates() {
  return [0, 14, 28, 42].map((days) => {
    const date = new Date(Date.now() + days * 86400000);
    return days === 0 ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
}

// ---------------------------------------------------------------------------
// Panel templates
// ---------------------------------------------------------------------------

function demoLine() {
  return `<span class="payment-selector__demo-line">${DEMO_LINE}</span>`;
}

function cardPanel() {
  return `
    <form class="payment-selector__card-form" novalidate autocomplete="off">
      <div class="payment-selector__field payment-selector__field--number">
        <label for="payment-selector-card-number">Card Number</label>
        <span class="payment-selector__field-shell">
          <input id="payment-selector-card-number" type="text" inputmode="numeric" maxlength="19" placeholder="1234 5678 9012 3456" autocomplete="off" spellcheck="false">
          <span class="payment-selector__card-brand" data-brand="none" aria-hidden="true"></span>
        </span>
      </div>
      <div class="payment-selector__field-row">
        <div class="payment-selector__field">
          <label for="payment-selector-card-expiry">Expiry</label>
          <input id="payment-selector-card-expiry" type="text" inputmode="numeric" maxlength="5" placeholder="MM/YY" autocomplete="off" spellcheck="false">
        </div>
        <div class="payment-selector__field">
          <label for="payment-selector-card-cvv">CVV</label>
          <input id="payment-selector-card-cvv" type="password" inputmode="numeric" maxlength="4" placeholder="&bull;&bull;&bull;" autocomplete="off">
        </div>
      </div>
      <div class="payment-selector__field">
        <label for="payment-selector-card-name">Name on Card</label>
        <input id="payment-selector-card-name" type="text" placeholder="As printed on card" autocomplete="off" spellcheck="false">
      </div>
      <div class="payment-selector__status payment-selector__status--ok payment-selector__card-status" hidden></div>
      ${demoLine()}
    </form>
  `;
}

const PAYPAL_WORDMARK = '<svg viewBox="0 0 62 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><text x="0" y="14" font-size="14" font-weight="700" font-style="italic" fill="#003087" font-family="Arial, sans-serif">Pay</text><text x="26" y="14" font-size="14" font-weight="700" font-style="italic" fill="#0070ba" font-family="Arial, sans-serif">Pal</text></svg>';

const WALLET_FLOWS = {
  paypal: {
    delay: 1100,
    render(state, ctx) {
      if (state === 'idle') {
        return `
          <button type="button" class="payment-selector__wallet-button payment-selector__wallet-button--paypal">${PAYPAL_WORDMARK}</button>
          <span class="payment-selector__panel-line">You'd approve the payment on PayPal — this demo connects instantly instead.</span>
        `;
      }
      if (state === 'busy') {
        return `
          <span class="payment-selector__progress"><span class="payment-selector__spinner" aria-hidden="true"></span>Connecting to PayPal&hellip;</span>
        `;
      }
      return `
        <span class="payment-selector__status payment-selector__status--ok">${CHECK_ICON}Connected as <strong>jenifer@example.com</strong></span>
        <span class="payment-selector__panel-line">PayPal balance approved for <strong>${formatMoney(ctx.total)}</strong>.</span>
        <a href="#" class="payment-selector__reset">Disconnect</a>
      `;
    },
  },
  applepay: {
    delay: 1300,
    render(state, ctx) {
      if (state === 'idle') {
        return `
          <button type="button" class="payment-selector__wallet-button payment-selector__wallet-button--apple"><svg viewBox="0 0 48 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g transform="translate(4 2)">${APPLE_GLYPH}</g><text x="20" y="18" font-size="15" font-weight="600" fill="currentColor" font-family="Arial, sans-serif">Pay</text></svg></button>
          <span class="payment-selector__panel-line">Double-click the side button on a real device — here, one click does it.</span>
        `;
      }
      if (state === 'busy') {
        return `
          <span class="payment-selector__progress"><span class="payment-selector__spinner" aria-hidden="true"></span>Confirm with Face ID&hellip;</span>
        `;
      }
      return `
        <span class="payment-selector__status payment-selector__status--ok">${CHECK_ICON}Payment authorized &middot; <strong>${formatMoney(ctx.total)}</strong></span>
        <span class="payment-selector__panel-line">Apple Pay &middot; Visa &bull;&bull;&bull;&bull; 4242</span>
        <a href="#" class="payment-selector__reset">Reset demo</a>
      `;
    },
  },
  googlepay: {
    delay: 900,
    render(state, ctx) {
      if (state === 'idle') {
        return `
          <button type="button" class="payment-selector__wallet-button payment-selector__wallet-button--google"><svg viewBox="0 0 52 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><text x="4" y="18" font-size="17" font-weight="700" fill="#4285f4" font-family="Arial, sans-serif">G</text><text x="19" y="18" font-size="15" font-weight="600" fill="currentColor" font-family="Arial, sans-serif">Pay</text></svg></button>
          <span class="payment-selector__panel-line">Picks the card saved to your Google account.</span>
        `;
      }
      if (state === 'busy') {
        return `
          <span class="payment-selector__progress"><span class="payment-selector__spinner" aria-hidden="true"></span>Fetching your saved cards&hellip;</span>
        `;
      }
      return `
        <span class="payment-selector__status payment-selector__status--ok">${CHECK_ICON}Visa &bull;&bull;&bull;&bull; 4242 selected &middot; <strong>${formatMoney(ctx.total)}</strong></span>
        <span class="payment-selector__panel-line">From your Google account.</span>
        <a href="#" class="payment-selector__reset">Change card</a>
      `;
    },
  },
};

function klarnaPanel(total) {
  const parts = splitInFour(total);
  const dates = installmentDates();
  const rows = parts.map((amount, i) => `
    <span class="payment-selector__schedule-stop${i === 0 ? ' payment-selector__schedule-stop--now' : ''}">
      <span class="payment-selector__schedule-dot" aria-hidden="true"></span>
      <span class="payment-selector__schedule-date">${dates[i]}</span>
      <span class="payment-selector__schedule-amount">${formatMoney(amount)}</span>
    </span>
  `).join('');
  return `
    <span class="payment-selector__panel-line">4 interest-free payments of <strong>${formatMoney(parts[1])}</strong>, every two weeks. No fees when you pay on time.</span>
    <span class="payment-selector__schedule">${rows}</span>
    ${demoLine()}
  `;
}

const RAZER_GOLD_BALANCE = 500;

function razerGoldPanel(total) {
  const { currency } = total;
  const remaining = { value: Math.max(0, RAZER_GOLD_BALANCE - total.value), currency };
  const short = total.value > RAZER_GOLD_BALANCE
    ? { value: total.value - RAZER_GOLD_BALANCE, currency }
    : null;
  const silver = Math.floor(total.value * 2);
  return `
    <span class="payment-selector__wallet-row"><span>Wallet balance</span><strong class="payment-selector__gold">${formatMoney({ value: RAZER_GOLD_BALANCE, currency })}</strong></span>
    <span class="payment-selector__wallet-row"><span>This order</span><strong>&minus;${formatMoney(total)}</strong></span>
    <span class="payment-selector__wallet-row payment-selector__wallet-row--total"><span>${short ? 'Top up needed' : 'Remaining'}</span><strong class="payment-selector__gold">${formatMoney(short ?? remaining)}</strong></span>
    <span class="payment-selector__status payment-selector__status--ok">${CHECK_ICON}Earn <strong>${silver.toLocaleString('en-US')} Razer Silver</strong> with this order</span>
    ${demoLine()}
  `;
}

function checkmoPanel() {
  return '<span class="payment-selector__panel-line">Place your order now and mail a check or money order. Your order ships as soon as the payment clears.</span>';
}

// ---------------------------------------------------------------------------
// Method roster. `live: true` marks the one method actually applied to the
// cart by the hidden PaymentMethods dropin.
// ---------------------------------------------------------------------------

const METHODS = [
  {
    code: 'card',
    label: 'Credit / Debit Card',
    sublabel: 'Visa · Mastercard · Amex · Discover',
    badge: 'Demo',
    mark: '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="1" y="2.5" width="34" height="19" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="1" y="6.5" width="34" height="3.6" fill="currentColor"/><rect x="4.5" y="14" width="9" height="2.4" rx="1" fill="currentColor" opacity="0.7"/></svg>',
    panel: () => cardPanel(),
  },
  {
    code: 'paypal',
    label: 'PayPal',
    sublabel: 'Pay with your PayPal balance or linked accounts',
    badge: 'Demo',
    mark: '<svg viewBox="0 0 60 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><text x="0" y="18" font-size="16" font-weight="700" font-style="italic" fill="#fff" font-family="Arial, sans-serif">Pay</text><text x="28" y="18" font-size="16" font-weight="700" font-style="italic" fill="#6cb8f0" font-family="Arial, sans-serif">Pal</text></svg>',
    panel: () => `<span class="payment-selector__flow" data-state="idle"></span>${demoLine()}`,
    flow: 'paypal',
  },
  {
    code: 'applepay',
    label: 'Apple Pay',
    sublabel: 'Pay with Touch ID or Face ID',
    badge: 'Demo',
    mark: `<svg viewBox="0 0 48 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g transform="translate(2 2)">${APPLE_GLYPH}</g><text x="18" y="18" font-size="15" font-weight="600" fill="currentColor" font-family="Arial, sans-serif">Pay</text></svg>`,
    panel: () => `<span class="payment-selector__flow" data-state="idle"></span>${demoLine()}`,
    flow: 'applepay',
  },
  {
    code: 'googlepay',
    label: 'Google Pay',
    sublabel: 'Use cards saved to your Google account',
    badge: 'Demo',
    mark: '<svg viewBox="0 0 52 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><text x="0" y="18" font-size="17" font-weight="700" fill="#4285f4" font-family="Arial, sans-serif">G</text><text x="15" y="18" font-size="15" font-weight="600" fill="currentColor" font-family="Arial, sans-serif">Pay</text></svg>',
    panel: () => `<span class="payment-selector__flow" data-state="idle"></span>${demoLine()}`,
    flow: 'googlepay',
  },
  {
    code: 'klarna',
    label: 'Klarna',
    sublabel: 'Pay in 4 interest-free installments',
    badge: 'Demo',
    mark: '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="36" height="24" rx="4" fill="#ffb3c7"/><text x="18" y="17" text-anchor="middle" font-size="13" font-weight="700" fill="#17120f" font-family="Arial, sans-serif">K.</text></svg>',
    panel: (total) => klarnaPanel(total),
    dynamic: true,
  },
  {
    code: 'razer-gold',
    label: 'Razer Gold',
    sublabel: 'Pay with your wallet, earn Razer Silver',
    badge: 'Demo',
    mark: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="#f5c451"/><circle cx="12" cy="12" r="7.6" fill="none" stroke="#8a6a1e" stroke-width="1.2"/><text x="12" y="16.4" text-anchor="middle" font-size="11" font-weight="800" fill="#5c440f" font-family="Arial, sans-serif">G</text></svg>',
    panel: (total) => razerGoldPanel(total),
    dynamic: true,
  },
  {
    code: 'checkmo',
    label: 'Check / Money Order',
    sublabel: 'Mail your payment after placing the order',
    badge: 'Available',
    live: true,
    mark: '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="1" y="3" width="34" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 9h12M5 13h8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M23 14l3 3 6-7" fill="none" stroke="var(--rzr-green, #44d62c)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    panel: () => checkmoPanel(),
  },
];

const DEFAULT_METHOD = 'card';

// ---------------------------------------------------------------------------
// Behavior
// ---------------------------------------------------------------------------

function luhnValid(digits) {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = Number(digits[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return digits.length >= 13 && sum % 10 === 0;
}

function expiryValid(text) {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(text);
  if (!match) return false;
  const year = 2000 + Number(match[2]);
  const month = Number(match[1]);
  const now = new Date();
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

function buildTile(method, total) {
  const selected = method.code === DEFAULT_METHOD;
  const badgeModifier = method.live ? ' payment-selector__badge--live' : '';
  return `
    <div class="payment-selector__tile${selected ? ' payment-selector__tile--selected' : ''}" data-method="${method.code}">
      <input type="radio" class="payment-selector__input" id="payment-selector-${method.code}" name="razer-payment-demo" value="${method.code}"${selected ? ' checked' : ''}>
      <label class="payment-selector__face" for="payment-selector-${method.code}">
        <span class="payment-selector__mark" aria-hidden="true">${method.mark}</span>
        <span class="payment-selector__labels">
          <span class="payment-selector__label">${method.label}</span>
          <span class="payment-selector__sublabel">${method.sublabel}</span>
        </span>
        <span class="payment-selector__badge${badgeModifier}">${method.badge}</span>
      </label>
      <div class="payment-selector__panel"${selected ? '' : ' hidden'}>
        <div class="payment-selector__panel-inner" data-panel="${method.code}">${method.panel(total)}</div>
      </div>
    </div>
  `;
}

function wireSelection(root) {
  root.querySelectorAll('.payment-selector__input').forEach((input) => {
    input.addEventListener('change', () => {
      root.querySelectorAll('.payment-selector__tile').forEach((tile) => {
        const isSelected = tile.dataset.method === input.value;
        tile.classList.toggle('payment-selector__tile--selected', isSelected);
        const panel = tile.querySelector('.payment-selector__panel');
        if (panel) panel.hidden = !isSelected;
      });
    });
  });
}

function wireCardForm(root) {
  const form = root.querySelector('.payment-selector__card-form');
  if (!form) return;

  form.addEventListener('submit', (event) => event.preventDefault());

  const number = form.querySelector('#payment-selector-card-number');
  const expiry = form.querySelector('#payment-selector-card-expiry');
  const cvv = form.querySelector('#payment-selector-card-cvv');
  const name = form.querySelector('#payment-selector-card-name');
  const brandEl = form.querySelector('.payment-selector__card-brand');
  const status = form.querySelector('.payment-selector__card-status');

  const refreshStatus = () => {
    const digits = number.value.replace(/\D/g, '');
    const brand = CARD_BRANDS.find((candidate) => candidate.test(digits));
    const complete = Boolean(brand) && luhnValid(digits)
      && expiryValid(expiry.value)
      && cvv.value.length >= 3
      && name.value.trim().length > 0;
    if (complete) {
      status.innerHTML = `${CHECK_ICON}Card ready &middot; ${brand.label} &bull;&bull;&bull;&bull; ${digits.slice(-4)}`;
    }
    status.hidden = !complete;
  };

  number.addEventListener('input', () => {
    const digits = number.value.replace(/\D/g, '').slice(0, 16);
    number.value = digits.replace(/(.{4})/g, '$1 ').trim();

    const brand = CARD_BRANDS.find((candidate) => candidate.test(digits));
    brandEl.dataset.brand = brand?.id ?? 'none';
    brandEl.innerHTML = brand?.mark ?? '';

    number.classList.toggle('payment-selector__input-valid', Boolean(brand) && luhnValid(digits));
    refreshStatus();
  });

  expiry.addEventListener('input', () => {
    const digits = expiry.value.replace(/\D/g, '').slice(0, 4);
    expiry.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    refreshStatus();
  });

  cvv.addEventListener('input', () => {
    cvv.value = cvv.value.replace(/\D/g, '').slice(0, 4);
    refreshStatus();
  });

  name.addEventListener('input', refreshStatus);
}

function wireWalletFlows(root, getTotal, timers) {
  METHODS.filter((method) => method.flow).forEach((method) => {
    const flowSpec = WALLET_FLOWS[method.flow];
    const flow = root.querySelector(`[data-panel="${method.code}"] .payment-selector__flow`);
    if (!flow) return;

    const setState = (state) => {
      flow.dataset.state = state;
      flow.innerHTML = flowSpec.render(state, { total: getTotal() });
      if (state === 'busy') {
        timers.set(method.code, setTimeout(() => setState('done'), flowSpec.delay));
      }
    };

    flow.addEventListener('click', (event) => {
      if (event.target.closest('.payment-selector__wallet-button')) {
        setState('busy');
      }
      const reset = event.target.closest('.payment-selector__reset');
      if (reset) {
        event.preventDefault();
        clearTimeout(timers.get(method.code));
        setState('idle');
      }
    });

    setState('idle');
  });
}

/**
 * Renders the demo payment selector into the given container.
 * @param {HTMLElement} container - DOM element to render the selector in
 * @returns {{ remove: () => void }} - Registry-compatible container API
 */
export function renderPaymentSelectorUI(container) {
  let total = readCartTotal();
  const timers = new Map();

  const root = document.createElement('fieldset');
  root.className = 'payment-selector';
  root.innerHTML = `
    <legend class="payment-selector__heading">Payment</legend>
    <span class="payment-selector__note">Demo store — no real payment is processed. Orders are placed via Check / Money Order.</span>
    <div class="payment-selector__tiles">
      ${METHODS.map((method) => buildTile(method, total)).join('')}
    </div>
  `;

  wireSelection(root);
  wireCardForm(root);
  wireWalletFlows(root, () => total, timers);

  // Re-quote the dynamic panels when the cart total changes.
  const subscription = events.on('cart/data', (cart) => {
    const next = cart?.total?.includingTax;
    if (next?.value == null || next.value === total.value) return;
    total = { value: next.value, currency: next.currency || 'USD' };
    METHODS.filter((method) => method.dynamic).forEach((method) => {
      const panel = root.querySelector(`[data-panel="${method.code}"]`);
      if (panel) panel.innerHTML = method.panel(total);
    });
  });

  container.appendChild(root);

  return {
    remove: () => {
      subscription?.off?.();
      timers.forEach((id) => clearTimeout(id));
      root.remove();
    },
  };
}

export default renderPaymentSelectorUI;
