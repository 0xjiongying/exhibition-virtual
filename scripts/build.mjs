// Stages the static site into dist/ so hosts configured with the common
// "npm run build" + publish dist defaults (Render, Netlify, etc.) serve the
// exact same files GitHub Pages serves from the repo root.
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';

const SITE = ['index.html', 'js', 'assets'];

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
for (const item of SITE) {
  if (!existsSync(item)) throw new Error(`missing site file: ${item}`);
  cpSync(item, `dist/${item}`, { recursive: true });
}
console.log('staged into dist/: ' + SITE.join(', '));
