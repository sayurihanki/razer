/**
 * Guards the authoring contract the razer-blade18-* family shares.
 *
 * Every block in the family ships its design as baked-in defaults so a DA.live
 * table holding nothing but the block name renders the finished section. That
 * promise is only worth anything if the merge rules hold: an empty cell keeps
 * the preset, `__empty__` clears it, a new key appends, clearing an entry's
 * required field removes it, and `content-mode: replace` drops the presets
 * entirely. Those five rules are what the five READMEs tell authors, and this
 * is what stops the code and the documentation drifting apart.
 *
 * The DOM is faked rather than shimmed with jsdom, matching the approach the
 * rest of tests/ already takes.
 */

/* eslint-env node */
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyValue,
  escapeMarkup,
  mergeList,
  mergeSettings,
  parseTable,
} from '../../scripts/razer-authoring.js';

import { DEFAULT_GROUPS, DEFAULT_SPECS } from '../../blocks/razer-blade18-specs/razer-blade18-specs.js';
import { DEFAULT_MODES } from '../../blocks/razer-blade18-dualmode/razer-blade18-dualmode.js';
import { DEFAULT_BUILDS } from '../../blocks/razer-blade18-configure/razer-blade18-configure.js';
import { DEFAULT_STATS } from '../../blocks/razer-blade18-power/razer-blade18-power.js';
import { DEFAULT_CHIPS } from '../../blocks/razer-blade18-hero/razer-blade18-hero.js';

/* ── Fake DOM ───────────────────────────────────────────────────── */

const cell = (text) => ({ textContent: text, querySelector: () => null });
const row = (...texts) => ({ children: texts.map(cell) });
const block = (...rows) => ({ children: rows });

const PRESET_SETTINGS = { eyebrow: 'Display', heading: 'One panel.' };
const PRESET_ITEMS = [
  { key: 'item-01', label: 'First', value: 'One' },
  { key: 'item-02', label: 'Second', value: 'Two' },
];

const parse = (...rows) => parseTable(block(...rows), ['item']);

/* ── The five rules ─────────────────────────────────────────────── */

test('an empty table renders the block preset unchanged', () => {
  const parsed = parse();
  assert.deepEqual(mergeSettings(parsed, PRESET_SETTINGS), PRESET_SETTINGS);
  assert.deepEqual(
    mergeList(parsed, 'item', PRESET_ITEMS, ['label', 'value']),
    PRESET_ITEMS,
  );
});

test('an authored cell overrides its preset, and an empty one keeps it', () => {
  const parsed = parse(
    row('setting', 'heading', 'Two machines.'),
    row('item', 'item-01', '', 'Uno'),
  );
  const config = mergeSettings(parsed, PRESET_SETTINGS);
  assert.equal(config.heading, 'Two machines.');
  assert.equal(config.eyebrow, 'Display', 'an unauthored setting keeps its preset');

  const items = mergeList(parsed, 'item', PRESET_ITEMS, ['label', 'value']);
  assert.equal(items[0].label, 'First', 'an empty cell keeps the preset field');
  assert.equal(items[0].value, 'Uno');
});

test('__empty__ clears a value where an empty cell would not', () => {
  const parsed = parse(row('setting', 'eyebrow', '__empty__'));
  assert.equal(mergeSettings(parsed, PRESET_SETTINGS).eyebrow, '');
  assert.equal(applyValue('__empty__', 'preset'), '');
  assert.equal(applyValue('', 'preset'), 'preset');
});

test('clearing the required field removes the entry', () => {
  const parsed = parse(row('item', 'item-01', '__empty__'));
  const items = mergeList(parsed, 'item', PRESET_ITEMS, ['label', 'value']);
  assert.deepEqual(items.map((item) => item.key), ['item-02']);
});

test('a new key appends after the presets', () => {
  const parsed = parse(row('item', 'item-03', 'Third', 'Three'));
  const items = mergeList(parsed, 'item', PRESET_ITEMS, ['label', 'value']);
  assert.deepEqual(items.map((item) => item.key), ['item-01', 'item-02', 'item-03']);
  assert.equal(items[2].value, 'Three');
});

test('content-mode: replace drops the presets on both settings and lists', () => {
  const parsed = parse(
    row('setting', 'content-mode', 'replace'),
    row('setting', 'heading', 'Only this.'),
    row('item', 'item-09', 'Only', 'Mine'),
  );
  const config = mergeSettings(parsed, PRESET_SETTINGS);
  assert.equal(config.heading, 'Only this.');
  assert.equal(config.eyebrow, '', 'replace mode clears settings the author did not write');

  const items = mergeList(parsed, 'item', PRESET_ITEMS, ['label', 'value']);
  assert.deepEqual(items.map((item) => item.key), ['item-09']);
});

/* ── Parsing ────────────────────────────────────────────────────── */

test('rows of an unknown type are ignored rather than rendered', () => {
  const parsed = parse(row('note', 'todo', 'ask legal about the price'));
  assert.equal(parsed.rows.get('item').size, 0);
  assert.deepEqual(
    mergeList(parsed, 'item', PRESET_ITEMS, ['label', 'value']),
    PRESET_ITEMS,
  );
});

test('row types and keys are matched case-insensitively', () => {
  const parsed = parse(row('ITEM', 'Item-01', 'Shouted'));
  const items = mergeList(parsed, 'item', PRESET_ITEMS, ['label', 'value']);
  assert.equal(items[0].label, 'Shouted');
  assert.equal(items.length, 2, 'the row matched the preset rather than appending');
});

/* ── Escaping ───────────────────────────────────────────────────── */

test('authored text reaching an SVG string cannot carry markup', () => {
  const escaped = escapeMarkup('<script>alert("x")</script>');
  assert.ok(!escaped.includes('<'), 'no raw angle brackets survive');
  assert.ok(!escaped.includes('"'), 'no raw quote can close an attribute');
  assert.equal(escapeMarkup('Chroma & light'), 'Chroma &amp; light');
});

/* ── Baked-in defaults ──────────────────────────────────────────── */

test('every preset spec names a group that exists', () => {
  const groups = new Set(DEFAULT_GROUPS.map((group) => group.key));
  const orphans = DEFAULT_SPECS
    .filter((spec) => !groups.has(spec.group))
    .map((spec) => `${spec.key} → ${spec.group}`);
  assert.deepEqual(orphans, [], 'a spec pointing at no group silently falls into the first one');
});

test('preset keys are unique within every block', () => {
  [
    ['hero chips', DEFAULT_CHIPS],
    ['dual-mode modes', DEFAULT_MODES],
    ['power stats', DEFAULT_STATS],
    ['specs groups', DEFAULT_GROUPS],
    ['specs rows', DEFAULT_SPECS],
    ['configure builds', DEFAULT_BUILDS],
  ].forEach(([name, entries]) => {
    const keys = entries.map((entry) => entry.key);
    assert.equal(new Set(keys).size, keys.length, `${name} has a duplicate key`);
  });
});

test('the dual-mode presets carry the two modes the block draws', () => {
  assert.deepEqual(DEFAULT_MODES.map((mode) => mode.key), ['mode-01', 'mode-02']);
  assert.deepEqual(DEFAULT_MODES.map((mode) => mode.refresh), ['240', '440']);
  DEFAULT_MODES.forEach((mode) => {
    const parts = (mode.resolution.match(/\d+/g) || []).map(Number);
    assert.equal(parts.length, 2, `${mode.key} resolution must parse into two numbers`);
  });
});

test('exactly one configuration is flagged as the featured build', () => {
  const flagged = DEFAULT_BUILDS.filter((build) => build.flag);
  assert.equal(flagged.length, 1, 'two featured cards would level the row and lose the emphasis');
});

test('every power stat counts from a parseable figure', () => {
  DEFAULT_STATS.forEach((stat) => {
    assert.ok(
      !Number.isNaN(Number.parseFloat(stat.value)),
      `${stat.key} must hold a number for the count-up`,
    );
  });
});
