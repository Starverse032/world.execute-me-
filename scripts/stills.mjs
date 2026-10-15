// Renders a few stills of one composition with a single bundle and browser.
// usage: node scripts/stills.mjs <Composition> <scale> <frame> [frame …]
// Output: $OUT (default out/stills)/<Composition>_<frame>.png
// Set CHROME=/path/to/chrome to use a specific browser binary.
import fs from 'fs';
import path from 'path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
const [comp, scale, ...frames] = process.argv.slice(2);
const out = process.env.OUT || path.resolve('out/stills');
fs.mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chrome', process.env.CHROME ? {browserExecutable: process.env.CHROME} : {});
const composition = await selectComposition({serveUrl, id: comp, puppeteerInstance: browser});
for (const f of frames) {
  const t0 = Date.now();
  await renderStill({composition, serveUrl, frame: Number(f), output: `${out}/${comp}_${f}.png`, scale: Number(scale), puppeteerInstance: browser, logLevel: 'error'});
  console.log(f, Date.now() - t0, 'ms');
}
await browser.close({silent: true});
