import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entryPath = resolve(root, 'src/styles.css');
const outPath = resolve(root, 'dist/styles.css');

const importPattern = /^@import\s+['"](.+?)['"];\s*$/gm;

async function inlineLocalImports(css, fromPath, seen = new Set()) {
  const matches = Array.from(css.matchAll(importPattern));
  let result = css;

  for (const match of matches) {
    const [fullImport, importPath] = match;

    if (!importPath.startsWith('.')) {
      continue;
    }

    const absoluteImportPath = resolve(dirname(fromPath), importPath);
    if (seen.has(absoluteImportPath)) {
      result = result.replace(fullImport, '');
      continue;
    }

    seen.add(absoluteImportPath);
    const importedCss = await readFile(absoluteImportPath, 'utf8');
    const inlinedCss = await inlineLocalImports(importedCss, absoluteImportPath, seen);
    result = result.replace(fullImport, `\n${inlinedCss.trim()}\n`);
  }

  return result;
}

const entryCss = await readFile(entryPath, 'utf8');
const bundledCss = await inlineLocalImports(entryCss, entryPath);

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, bundledCss);
