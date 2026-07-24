#!/usr/bin/env node
/*
 * Module-resolution audit for the jenhankib2bbodea -> razer migration.
 *
 * This is the migration's primary correctness gate. The source repo ran
 * @dropins/* v3; razer runs v4, with account, auth, order and recommendations
 * being true major bumps. A block imported from the source can reference a
 * named export that no longer exists, and nothing else in the toolchain will
 * notice: ESLint's import/named does not follow the built browser bundles under
 * scripts/__dropins__, and those modules touch window at module scope so they
 * cannot simply be imported here to introspect.
 *
 * So this walks the source text instead:
 *   1. every relative import from blocks/ and scripts/ must resolve to a file
 *   2. every @dropins/* specifier must resolve under scripts/__dropins__
 *   3. every *named* @dropins/* import must appear in that module's exports,
 *      following `export ... from` and `export * from` re-export chains
 *
 * Static resolution is necessary but not sufficient: it proves a name is
 * exported, not that its signature or behavior is unchanged across the major
 * bump. Browser smoke tests remain required.
 *
 * Usage:  node tools/migration/audit-module-resolution.mjs
 * Exits non-zero when anything fails to resolve.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, normalize, extname } from 'node:path';

const ROOTS = ['blocks', 'scripts'];
const DROPINS_ROOT = 'scripts/__dropins__';
const SKIP_DIRS = new Set(['__dropins__', 'node_modules']);

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      if (!SKIP_DIRS.has(entry)) walk(p, out);
    } else if (['.js', '.mjs'].includes(extname(p))) {
      out.push(p);
    }
  }
  return out;
}

/** Names a built ESM module exports, following re-export chains. */
function exportsOf(entry) {
  const seen = new Set();
  const names = new Set();
  const stack = [entry];

  while (stack.length) {
    const p = stack.pop();
    if (seen.has(p) || !existsSync(p)) continue;
    seen.add(p);
    const src = readFileSync(p, 'utf8');

    for (const [, block, from] of src.matchAll(
      /export\s*\{([^}]*)\}\s*(?:from\s*['"]([^'"]+)['"])?/gs,
    )) {
      for (const part of block.split(',')) {
        const t = part.trim();
        if (!t) continue;
        names.add(t.includes(' as ') ? t.split(' as ').pop().trim() : t);
      }
      if (from) stack.push(normalize(join(dirname(p), from)));
    }
    for (const [, n] of src.matchAll(
      /export\s+(?:async\s+)?function\s+\*?\s*([A-Za-z0-9_$]+)/g,
    )) names.add(n);
    for (const [, n] of src.matchAll(
      /export\s+(?:const|let|var|class)\s+([A-Za-z0-9_$]+)/g,
    )) names.add(n);
    for (const [, from] of src.matchAll(/export\s*\*\s*from\s*['"]([^'"]+)['"]/g)) {
      stack.push(normalize(join(dirname(p), from)));
    }
  }
  return names;
}

const failures = [];
let relChecked = 0;
let dropinModules = 0;
let namedChecked = 0;
const exportCache = new Map();

for (const file of ROOTS.flatMap((r) => walk(r))) {
  const src = readFileSync(file, 'utf8');

  // relative imports must resolve to a real file
  for (const m of src.matchAll(/(?:from|import)\s*\(?\s*['"](\.[^'"]+)['"]/g)) {
    relChecked += 1;
    const target = normalize(join(dirname(file), m[1]));
    if (!existsSync(target)) {
      failures.push(`${file}: unresolved relative import '${m[1]}'`);
    }
  }

  // @dropins/* modules must exist under scripts/__dropins__
  for (const m of src.matchAll(/(?:from|import)\s*\(?\s*['"]@dropins\/([^'"]+)['"]/g)) {
    dropinModules += 1;
    if (!existsSync(join(DROPINS_ROOT, m[1]))) {
      failures.push(`${file}: unresolved dropin module '@dropins/${m[1]}'`);
    }
  }

  // named @dropins/* imports must actually be exported
  for (const m of src.matchAll(
    /import\s*\{([^}]*)\}\s*from\s*['"]@dropins\/([^'"]+)['"]/gs,
  )) {
    const modPath = join(DROPINS_ROOT, m[2]);
    if (!existsSync(modPath)) continue; // already reported above
    if (!exportCache.has(modPath)) exportCache.set(modPath, exportsOf(modPath));
    const available = exportCache.get(modPath);

    for (const part of m[1].split(',')) {
      const t = part.trim();
      if (!t) continue;
      const name = t.split(' as ')[0].trim();
      if (!name || name === '*') continue;
      namedChecked += 1;
      if (!available.has(name)) {
        failures.push(
          `${file}: '${name}' is not exported by @dropins/${m[2]} (v4)`,
        );
      }
    }
  }
}

console.log(
  `Checked ${relChecked} relative imports, ${dropinModules} dropin module `
  + `specifiers, ${namedChecked} named dropin imports.`,
);

if (failures.length) {
  console.error(`\n${failures.length} unresolved:\n`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log('All imports resolve against razer\'s v4 tree.');
