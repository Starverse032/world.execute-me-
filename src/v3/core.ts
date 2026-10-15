// Shared tokens, fonts, timing and easing for the v3 (minimal geometric) demo.
// Design spec: docs/design_v3.md. Every element is a pure function of t = frame / 30.
import {continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import beats from '../beats.json';

// ------------------------------------------------------------------ colours
export const K = {
  bg: '#0E0D0C',
  surface: '#191816',
  grid: '#2A2824',
  gridHi: '#34312C',
  line2: '#45413A',
  creamDim: '#8F887C',
  cream: '#E9E3D5',
  orange: '#D97757',
  // character-only tokens (used inside the processed art)
  charCream: '#DCD3C1',
  charShade: '#A99F8C',
  orangeDeep: '#A4553B',
  ink: '#1C1A17',
};
// The only opacity steps allowed for cream strokes.
export const O = {full: 1, hi: 0.7, mid: 0.45, lo: 0.25};

// ------------------------------------------------------------------ fonts
export const SERIF = "'SERIF', Georgia, serif"; // Newsreader 500: lyrics
export const CODE = "'CODE', 'DejaVu Sans Mono', monospace"; // JetBrains Mono (variable): UI, keywords, title
export const MATH = "'MATH', 'DejaVu Serif', serif"; // STIX Two Text italic: math symbols

const fontHandle = delayRender('fonts-v3');
Promise.all(
  [
    ['SERIF', 'fonts3/SERIF-500.woff2', {weight: '500'}],
    ['CODE', 'fonts3/CODE.woff2', {weight: '100 900'}],
    ['MATH', 'fonts3/MATH-400i.woff2', {weight: '400', style: 'italic'}],
  ].map(([family, file, desc]) => {
    const face = new FontFace(family as string, `url(${staticFile(file as string)}) format('woff2')`, desc as FontFaceDescriptors);
    document.fonts.add(face);
    return face.load();
  }),
).then(() => continueRender(fontHandle));

// ------------------------------------------------------------------ layout
export const W = 1920;
export const H = 1080;
export const C = {x: 960, y: 390}; // stage centre during lyric sections
export const FPS = 30;
export const END = 46.0; // demo end
export const SONG = 211.96; // full song length

// ------------------------------------------------------------------ time
export const useT = () => {
  const frame = useCurrentFrame();
  return {frame, t: frame / FPS};
};
export const fr = (t: number) => Math.round(t * FPS);

// Nominal beat grid: t_n = 0.151 + 0.4615 n (130 BPM).
export const B0 = 0.151;
export const BEAT = 60 / 130;
export const beat = (n: number) => B0 + BEAT * n;
export const beatIndex = (t: number) => Math.floor((t - B0) / BEAT + 1e-6);

// Pulse onsets: the detected beat when it is within ±40 ms of the nominal one,
// otherwise the nominal beat. Used only for pulses, never for scheduling.
const DETECTED = beats as number[];
const ONSETS: number[] = [];
for (let n = 0; beat(n) < SONG + 1; n++) {
  const nom = beat(n);
  let best = nom;
  for (const d of DETECTED) if (Math.abs(d - nom) <= 0.04 && Math.abs(d - nom) < Math.abs(best - nom)) best = d;
  ONSETS.push(best);
}
// Time of the latest onset at or before t (−∞ when none), counting every
// `every`-th beat from beat `offset`.
export const lastOnset = (t: number, every = 1, offset = 0) => {
  let lo = 0, hi = ONSETS.length - 1, idx = -1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (ONSETS[m] <= t) {
      idx = m;
      lo = m + 1;
    } else hi = m - 1;
  }
  if (idx < offset) return -Infinity;
  return ONSETS[idx - ((idx - offset) % every)];
};
// env(x) = exp(−x / 0.12) for x ≥ 0.
export const env = (x: number, tau = 0.12) => (x < 0 || !isFinite(x) ? 0 : Math.exp(-x / tau));
// Beat pulse 0..1 at t (every Nth beat).
export const pulse = (t: number, every = 1, tau = 0.12) => env(t - lastOnset(t, every), tau);

// ------------------------------------------------------------------ easing
export type Ease = (x: number) => number;
export const ease = {
  linear: (x: number) => x,
  inOutCubic: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outExpo: (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inCubic: (x: number) => x * x * x,
  outCubic: (x: number) => 1 - Math.pow(1 - x, 3),
  inQuad: (x: number) => x * x,
  outQuart: (x: number) => 1 - Math.pow(1 - x, 4),
  inOutSine: (x: number) => -(Math.cos(Math.PI * x) - 1) / 2,
};
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
// Progress 0..1 of t through [a, b], eased.
export const prog = (t: number, a: number, b: number, e: Ease = ease.linear) => e(clamp01((t - a) / (b - a)));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
// Fade in over [a, a+fin], out over [b−fout, b] (seconds).
export const win = (t: number, a: number, b: number, fin = 0.2, fout = 0.2) =>
  t < a || t > b ? 0 : Math.min(fin > 0 ? clamp01((t - a) / fin) : 1, fout > 0 ? clamp01((b - t) / fout) : 1);
// Stroke draw-on time at the default 1200 px/s, clamped to 4..24 frames.
export const plotDur = (len: number) => Math.max(4, Math.min(24, (len / 1200) * FPS)) / FPS;

// Seeded PRNG (mulberry32) for deterministic jitter.
export const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
  return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
};
