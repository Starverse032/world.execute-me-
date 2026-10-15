// v4 font stacks. Importing this module registers:
//  - the v3 faces (SERIF, CODE, MATH) via src/v3/core.ts,
//  - 'CODE4' / 'MATH4': the same JetBrains Mono / STIX italic, subset with the
//    extra glyphs v4 needs (● › ⚠ ↑ ² ³ − box drawing …). They are listed first
//    in the stacks below, so always import CODE / MATH from here, not v3/core.
//  - 'CJK': public/fonts3/CJK.woff2 (only 넷 and 六).
// Glyphs NOT in any font (draw them as SVG): ✻ (use <Spark>), ⎿ (<Elbow>), ✓ (<Check>).
import {continueRender, delayRender, staticFile} from 'remotion';
import '../v3/core';

export const SERIF = "'SERIF', Georgia, serif";
export const CODE = "'CODE4', 'CODE', 'DejaVu Sans Mono', monospace";
export const MATH = "'MATH4', 'MATH', 'DejaVu Serif', serif";
export const CJK = "'CJK', 'CODE4', sans-serif";

// JetBrains Mono advance width is exactly 0.6 em for every glyph, at every weight.
export const MONO_ADV = 0.6;
export const monoW = (s: string, size: number) => s.length * MONO_ADV * size;

let ready = false;
const listeners = new Set<() => void>();
export const fontsReady = () => ready;
export const onFontsReady = (f: () => void) => {
  listeners.add(f);
  return () => listeners.delete(f);
};

const handle = delayRender('fonts-v4');
Promise.all(
  (
    [
      ['CODE4', 'fonts4/CODE.woff2', {weight: '100 800'}],
      ['MATH4', 'fonts4/MATH-400i.woff2', {weight: '400', style: 'italic'}],
      ['CJK', 'fonts3/CJK.woff2', {weight: '100 900'}],
    ] as [string, string, FontFaceDescriptors][]
  ).map(([family, file, desc]) => {
    const face = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, desc);
    document.fonts.add(face);
    return face.load();
  }),
)
  .then(() => document.fonts.ready)
  .then(() => {
    ready = true;
    // let components that measured text with fallback metrics re-measure,
    // then release the render two animation frames later
    listeners.forEach((f) => f());
    requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle)));
  })
  .catch((e) => {
    console.warn('v4 fonts failed to load', e);
    ready = true;
    continueRender(handle);
  });
