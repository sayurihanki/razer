import {
  readRows, textReader, cellHTML, cellLink, el,
} from '../../scripts/razer-chroma.js';

/*
 * Row contract (repeat `step`, `question`, `choice`, `match`):
 *   eyebrow  | Guided setup
 *   title    | Find your signal.
 *   intro    | Three quick choices...
 *   steps-title | From playstyle<br>to full setup.
 *   step     | Find your playstyle | Start with how you compete, create, or explore.
 *   question | playstyle | What drives your setup?
 *   choice   | playstyle | competitive | Competitive | Fast inputs and low weight
 *   match    | viper | Viper | Razer Viper V3 Pro | Copy... | url
 *   reveal   | Reveal my match
 *   reset    | Reset choices
 *
 * Matching precedence is fixed and mirrors the source component:
 *   creator|audio -> seiren, mmo -> naga, mobile|portable -> mobile,
 *   competitive|lightweight -> viper, else basilisk.
 * The `match` rows only supply the copy for each outcome key.
 */

const DEFAULTS = {
  eyebrow: 'Guided setup',
  title: 'Find your signal.',
  intro: 'Three quick choices. One clear starting point for your next Razer setup.',
  stepsTitle: 'From playstyle<br>to full setup.',
  reveal: 'Reveal my match',
  reset: 'Reset choices',
  steps: [
    ['Find your playstyle', 'Start with how you compete, create, or explore.'],
    ['Match your setup', 'Narrow the experience around platform and priorities.'],
    ['Configure & compare', 'Review compatible families and key differences.'],
    ['RazerCare & support', 'Protect your gear and keep help close.'],
  ],
  questions: [
    {
      key: 'playstyle',
      title: 'What drives your setup?',
      choices: [
        ['competitive', 'Competitive', 'Fast inputs and low weight'],
        ['immersive', 'Immersive', 'Deep control and Chroma RGB'],
        ['mmo', 'MMO', 'Commands within thumb reach'],
        ['creator', 'Creator', 'Clear voice and flexible control'],
      ],
    },
    {
      key: 'platform',
      title: 'Where do you play most?',
      choices: [
        ['pc', 'PC', 'Desktop or laptop setup'],
        ['console', 'Console', 'Living-room play'],
        ['mobile', 'Mobile / Mixed', 'Portable and multi-platform'],
      ],
    },
    {
      key: 'priority',
      title: 'What matters first?',
      choices: [
        ['lightweight', 'Lightweight', 'Quick, precise movement'],
        ['control', 'Customizable control', 'Buttons, profiles, scroll'],
        ['portable', 'Portability', 'Move between setups'],
        ['audio', 'Sound & presence', 'Creator-ready voice'],
      ],
    },
  ],
  matches: {
    viper: {
      family: 'Viper',
      name: 'Razer Viper V3 Pro',
      copy: 'Ultra-lightweight symmetrical control built around competitive speed.',
      href: 'https://www.razer.com/gaming-mice/Razer-Viper-V3-Pro/RZ01-05120100-R3U1',
    },
    basilisk: {
      family: 'Basilisk',
      name: 'Razer Basilisk V3 Pro 35K',
      copy: 'Ergonomic, multi-mode control with deep customization and Chroma RGB.',
      href: '/gaming-mice/razer-basilisk-v3-pro-35k/rz01-05240100-r3u1',
    },
    naga: {
      family: 'Naga',
      name: 'Razer Naga V2 Pro',
      copy: 'An MMO-focused family designed to keep more commands within reach.',
      href: 'https://www.razer.com/gaming-mice/razer-naga-v2-pro',
    },
    mobile: {
      family: 'Portable',
      name: 'Razer Basilisk Mobile',
      copy: 'An ergonomic wireless mouse designed to travel between setups.',
      href: 'https://www.razer.com/gaming-mice/razer-basilisk-mobile',
    },
    seiren: {
      family: 'Creator',
      name: 'Razer Seiren V3 Chroma 32-Bit DSP',
      copy: 'A creator-first microphone that pairs clear voice with Chroma presence.',
      href: 'https://www.razer.com/streaming-microphones/razer-seiren-v3-chroma',
    },
  },
};

/**
 * Resolves the recommended match key from the current answers.
 *
 * Order matters: creator intent wins over everything, then MMO, then
 * portability, then competitive. Exported so the precedence can be tested
 * without a DOM.
 *
 * @param {{playstyle: string, platform: string, priority: string}} answers Selections
 * @returns {string} The winning match key
 */
export function resolveMatch(answers) {
  if (answers.playstyle === 'creator' || answers.priority === 'audio') return 'seiren';
  if (answers.playstyle === 'mmo') return 'naga';
  if (answers.platform === 'mobile' || answers.priority === 'portable') return 'mobile';
  if (answers.playstyle === 'competitive' || answers.priority === 'lightweight') return 'viper';
  return 'basilisk';
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = readRows(block);
  const text = textReader(rows);
  const cellFor = (key) => rows.find((r) => r.key === key)?.cells[0];
  const textAt = (cells, i) => cells?.[i]?.textContent.trim() || '';

  const stepRows = rows.filter((r) => r.key === 'step');
  const steps = stepRows.length
    ? stepRows.map(({ cells }) => [textAt(cells, 0), textAt(cells, 1)])
    : DEFAULTS.steps;

  const questionRows = rows.filter((r) => r.key === 'question');
  const questions = questionRows.length
    ? questionRows.map(({ cells }) => {
      const key = textAt(cells, 0);
      return {
        key,
        title: textAt(cells, 1),
        choices: rows
          .filter((r) => r.key === 'choice' && textAt(r.cells, 0) === key)
          .map(({ cells: c }) => [textAt(c, 1), textAt(c, 2), textAt(c, 3)]),
      };
    })
    : DEFAULTS.questions;

  const matchRows = rows.filter((r) => r.key === 'match');
  const matches = matchRows.length
    ? Object.fromEntries(matchRows.map(({ cells }) => [textAt(cells, 0), {
      family: textAt(cells, 1),
      name: textAt(cells, 2),
      copy: textAt(cells, 3),
      href: cellLink(cells[4])?.href || '#',
    }]))
    : DEFAULTS.matches;

  const answers = {};
  questions.forEach((q) => { answers[q.key] = ''; });

  const progressBar = el('span');
  const progress = el('div', { class: 'finder-progress' }, [progressBar]);
  const revealButton = el('button', {
    class: 'button button-primary',
    type: 'button',
    disabled: 'disabled',
  }, [text('reveal', DEFAULTS.reveal)]);
  const resetButton = el('button', { class: 'text-button', type: 'button' }, [
    text('reset', DEFAULTS.reset),
  ]);
  resetButton.hidden = true;
  const result = el('div', { class: 'finder-result', 'aria-live': 'polite' });

  const answered = () => Object.values(answers).filter(Boolean).length;

  const syncState = () => {
    const count = answered();
    progressBar.style.width = `${(count / questions.length) * 100}%`;
    progress.setAttribute('aria-label', `${count} of ${questions.length} questions answered`);
    revealButton.disabled = count < questions.length;
    resetButton.hidden = count === 0;
  };

  const questionGrid = el('div', { class: 'finder-question-grid' }, questions.map((q, qi) => {
    const choices = el('div', { class: 'finder-choices' });
    q.choices.forEach(([value, label, detail]) => {
      const button = el('button', { type: 'button', 'aria-pressed': 'false' }, [
        el('strong', {}, [label]),
        el('small', {}, [detail]),
      ]);
      button.addEventListener('click', () => {
        answers[q.key] = value;
        [...choices.children].forEach((sibling) => {
          const selected = sibling === button;
          sibling.classList.toggle('is-selected', selected);
          sibling.setAttribute('aria-pressed', String(selected));
        });
        result.classList.remove('is-visible');
        result.textContent = '';
        syncState();
      });
      choices.append(button);
    });

    const legend = el('legend', {}, [el('span', {}, [String(qi + 1).padStart(2, '0')]), q.title]);
    return el('fieldset', { class: 'finder-question' }, [legend, choices]);
  }));

  revealButton.addEventListener('click', () => {
    const match = matches[resolveMatch(answers)] || Object.values(matches)[0];
    result.textContent = '';
    result.append(
      el('div', {}, [
        el('p', { class: 'eyebrow' }, [`Your signal: ${match.family}`]),
        el('h3', {}, [match.name]),
        el('p', {}, [match.copy]),
      ]),
      (() => {
        const link = el('a', { class: 'button button-outline', href: match.href }, ['Explore match ']);
        link.append(el('span', { 'aria-hidden': 'true' }, ['↗']));
        return link;
      })(),
    );
    result.classList.add('is-visible');
  });

  resetButton.addEventListener('click', () => {
    questions.forEach((q) => { answers[q.key] = ''; });
    questionGrid.querySelectorAll('.finder-choices button').forEach((button) => {
      button.classList.remove('is-selected');
      button.setAttribute('aria-pressed', 'false');
    });
    result.classList.remove('is-visible');
    result.textContent = '';
    syncState();
  });

  const card = el('div', { class: 'finder-card' }, [
    progress,
    questionGrid,
    el('div', { class: 'finder-actions' }, [revealButton, resetButton]),
    result,
  ]);

  const serviceCopy = el('div', { class: 'service-copy' }, [
    el('h3', { html: cellHTML(cellFor('steps-title')) || DEFAULTS.stepsTitle }),
    el('ol', {}, steps.map(([title, copy], i) => el('li', {}, [
      el('span', {}, [String(i + 1).padStart(2, '0')]),
      el('div', {}, [el('strong', {}, [title]), el('p', {}, [copy])]),
    ]))),
  ]);

  const heading = el('div', { class: 'section-heading' }, [
    el('div', {}, [
      el('p', { class: 'eyebrow' }, [text('eyebrow', DEFAULTS.eyebrow)]),
      el('h2', { html: cellHTML(cellFor('title')) || DEFAULTS.title }),
    ]),
    el('p', {}, [text('intro', DEFAULTS.intro)]),
  ]);

  const section = el('section', { class: 'section finder-section', id: 'finder' }, [
    el('div', { class: 'shell' }, [
      heading,
      el('div', { class: 'service-model' }, [serviceCopy, card]),
    ]),
  ]);

  block.textContent = '';
  block.append(section);
  syncState();
}
