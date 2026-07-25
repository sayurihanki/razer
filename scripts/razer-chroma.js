/*
 * Authoring helpers shared by the razer-chroma block family.
 *
 * All 14 blocks use the same table contract: every authored row starts with a
 * key cell, and repeated keys accumulate into a list. That keeps a card grid
 * and a single hero readable in the same DA.live table shape:
 *
 *   | razer-capability-grid |
 *   | eyebrow | Engineered advantage       |
 *   | card    | HS  | Title | Copy | Label | https://... |
 *   | card    | 35K | Title | Copy | Label | https://... |
 *
 * Authors may omit any row, so every reader here returns a usable empty value
 * rather than throwing, and blocks fall back to their shipped defaults.
 */

import { toClassName } from './aem.js';

/**
 * Reads a block's authored rows into a keyed list.
 * @param {Element} block The block element
 * @returns {Array<{key: string, cells: Element[]}>} One entry per authored row
 */
export function readRows(block) {
  return [...block.children].map((row) => {
    const cells = [...row.children];
    return { key: toClassName(cells[0]?.textContent || ''), cells: cells.slice(1) };
  });
}

/**
 * Builds a lookup over single-value rows.
 * @param {Array<{key: string, cells: Element[]}>} rows Rows from readRows
 * @returns {(key: string, fallback?: string) => string} Trimmed text by key
 */
export function textReader(rows) {
  return (key, fallback = '') => {
    const found = rows.find((r) => r.key === key);
    const text = found?.cells[0]?.textContent.trim();
    return text || fallback;
  };
}

/**
 * Reads the rich text of a cell, preserving authored inline markup such as
 * <br> and <strong>. Unwraps the <p> that EDS wraps every text cell in.
 * @param {Element} cell The authored cell
 * @returns {string} Inner HTML, or an empty string
 */
export function cellHTML(cell) {
  if (!cell) return '';
  const paragraphs = [...cell.querySelectorAll(':scope > p')];
  if (paragraphs.length === 1) return paragraphs[0].innerHTML.trim();
  return cell.innerHTML.trim();
}

/**
 * Extracts a link from a cell. Accepts either an authored anchor or a bare
 * URL, so `[Buy now](/store)` and a pasted URL both work.
 * @param {Element} cell The authored cell
 * @param {string} fallbackLabel Label to use when the cell holds a bare URL
 * @returns {{href: string, label: string}|null} The link, or null if absent
 */
export function cellLink(cell, fallbackLabel = '') {
  if (!cell) return null;
  const anchor = cell.querySelector('a');
  if (anchor) {
    return { href: anchor.getAttribute('href') || '', label: anchor.textContent.trim() || fallbackLabel };
  }
  const text = cell.textContent.trim();
  if (!text) return null;
  return { href: text, label: fallbackLabel || text };
}

/**
 * Extracts an image from a cell. Accepts an authored <img>/<picture> or a bare
 * path, so DA.live uploads and repo-relative paths both work.
 * @param {Element} cell The authored cell
 * @returns {{src: string, alt: string}|null} The image, or null if absent
 */
export function cellImage(cell) {
  if (!cell) return null;
  const img = cell.querySelector('img');
  if (img) return { src: img.getAttribute('src') || '', alt: img.getAttribute('alt') || '' };
  const text = cell.textContent.trim();
  return text ? { src: text, alt: '' } : null;
}

/**
 * Creates an element with attributes and children in one call.
 * @param {string} tag Tag name
 * @param {Object} [attrs] Attributes; `class` and `html` are handled specially
 * @param {Array<Node|string>} [children] Child nodes or text
 * @returns {Element} The new element
 */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([name, value]) => {
    if (value === undefined || value === null || value === false) return;
    if (name === 'class') node.className = value;
    else if (name === 'html') node.innerHTML = value;
    else node.setAttribute(name, value);
  });
  (Array.isArray(children) ? children : [children])
    .filter((child) => child !== null && child !== undefined)
    .forEach((child) => node.append(child));
  return node;
}

/**
 * Builds a Razer CTA anchor, including the chevron that ghost buttons carry.
 * @param {{href: string, label: string}} link The link
 * @param {string} variant `button-primary`, `button-ghost` or `button-outline`
 * @param {string} [chevron] Optional glyph appended in a span
 * @returns {Element} The anchor
 */
export function ctaLink(link, variant, chevron) {
  const anchor = el('a', { class: `button ${variant}`, href: link.href }, [
    chevron ? `${link.label} ` : link.label,
  ]);
  if (chevron) anchor.append(el('span', { 'aria-hidden': 'true' }, [chevron]));
  return anchor;
}
