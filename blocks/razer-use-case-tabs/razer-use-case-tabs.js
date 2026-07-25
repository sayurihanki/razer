import {
  readRows, textReader, cellHTML, el,
} from '../../scripts/razer-chroma.js';

/*
 * Row contract (repeat `tab`; omit everything for DEFAULTS):
 *   eyebrow | One ecosystem · Every style
 *   title   | Play it your way.
 *   intro   | Choose the experience you want...
 *   tab     | Competitive / Esports | Zero hesitation | React first. Stay precise. |
 *             Copy... | HyperSpeed Wireless, Focus Pro sensor, Esports form factors
 *
 * Tags are a single comma-separated cell so a tab stays one table row.
 */

const DEFAULTS = {
  eyebrow: 'One ecosystem · Every style',
  title: 'Play it your way.',
  intro: 'Choose the experience you want. The ecosystem responds with gear made for it.',
  tabs: [
    {
      id: 'competitive',
      label: 'Competitive / Esports',
      eyebrow: 'Zero hesitation',
      title: 'React first. Stay precise.',
      copy: 'Low-latency wireless, lightweight control, and focused form factors for players who measure every input.',
      tags: ['HyperSpeed Wireless', 'Focus Pro sensor', 'Esports form factors'],
    },
    {
      id: 'immersive',
      label: 'Immersive / Customizable',
      eyebrow: 'Total immersion',
      title: 'Make the setup yours.',
      copy: 'Layer Chroma RGB, configurable controls, and ergonomic hardware into a battle station with real presence.',
      tags: ['Chroma RGB', 'Synapse profiles', 'Ergonomic control'],
    },
    {
      id: 'mobile',
      label: 'Mobile / Multi-platform',
      eyebrow: 'Play anywhere',
      title: 'Move without compromise.',
      copy: 'Take familiar control across mobile, console, and PC with gear designed around modern multi-platform play.',
      tags: ['Portable control', 'Cross-platform audio', 'Flexible setups'],
    },
    {
      id: 'creator',
      label: 'Creator / Streaming',
      eyebrow: 'Create in full color',
      title: 'Sound clear. Look unmistakable.',
      copy: 'Microphones, lighting, and creator-ready hardware bring polish and personality to every broadcast.',
      tags: ['32-bit DSP', 'Stream control', 'Chroma lighting'],
    },
  ],
};

/** Turns a label into a DOM-id-safe slug. */
function slug(value, fallback) {
  const id = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return id || fallback;
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

  const authored = rows.filter((r) => r.key === 'tab');
  const tabs = authored.length
    ? authored.map(({ cells }, i) => ({
      id: slug(textAt(cells, 0), `tab-${i + 1}`),
      label: textAt(cells, 0),
      eyebrow: textAt(cells, 1),
      title: textAt(cells, 2),
      copy: textAt(cells, 3),
      tags: textAt(cells, 4).split(',').map((t) => t.trim()).filter(Boolean),
    }))
    : DEFAULTS.tabs;

  const panelEyebrow = el('p', { class: 'eyebrow' });
  const panelTitle = el('h3');
  const panelCopy = el('p');
  const tagRow = el('div', { class: 'tag-row' });

  const panel = el('article', {
    class: 'use-case-panel',
    role: 'tabpanel',
  }, [
    el('div', { class: 'signal-orbit', 'aria-hidden': 'true' }, [el('span')]),
    el('div', { class: 'use-case-copy' }, [panelEyebrow, panelTitle, panelCopy, tagRow]),
  ]);

  const tablist = el('div', {
    class: 'use-case-tabs',
    role: 'tablist',
    'aria-label': 'Gaming use cases',
  });

  const buttons = tabs.map((tab) => {
    const button = el('button', {
      type: 'button',
      role: 'tab',
      id: `tab-${tab.id}`,
      'aria-controls': `panel-${tab.id}`,
    }, [tab.label]);
    button.append(el('span', {}, ['›']));
    tablist.append(button);
    return button;
  });

  const select = (index) => {
    const tab = tabs[index];
    buttons.forEach((button, i) => {
      button.setAttribute('aria-selected', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
    });
    panel.id = `panel-${tab.id}`;
    panel.setAttribute('aria-labelledby', `tab-${tab.id}`);
    panelEyebrow.textContent = tab.eyebrow;
    panelTitle.textContent = tab.title;
    panelCopy.textContent = tab.copy;
    tagRow.textContent = '';
    tab.tags.forEach((tag) => tagRow.append(el('span', {}, [tag])));
  };

  buttons.forEach((button, i) => {
    button.addEventListener('click', () => select(i));
    button.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const next = (i + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      select(next);
      buttons[next].focus();
    });
  });

  const heading = el('div', { class: 'section-heading' }, [
    el('div', {}, [
      el('p', { class: 'eyebrow' }, [text('eyebrow', DEFAULTS.eyebrow)]),
      el('h2', { html: cellHTML(cellFor('title')) || DEFAULTS.title }),
    ]),
    el('p', {}, [text('intro', DEFAULTS.intro)]),
  ]);

  const section = el('section', { class: 'section use-case-section' }, [
    el('div', { class: 'shell' }, [
      heading,
      el('div', { class: 'use-case-layout' }, [tablist, panel]),
    ]),
  ]);

  block.textContent = '';
  block.append(section);
  select(0);
}
