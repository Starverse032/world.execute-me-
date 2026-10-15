// Anomaly curve and vector "glitch" helpers (docs/design_v4.md §3.1).
// Everything is a pure function of t (seconds). No blur, no noise textures:
// only offsets, doubled strokes, missing / overshooting segments and glyph swaps.
import {clamp01} from '../v3/core';

// ------------------------------------------------------------------ hashing
// Fast integer hash → [0, 1). hash(seed, a, b) is stable for the same inputs.
export const hash = (seed: number, a = 0, b = 0) => {
  let h = (seed | 0) ^ Math.imul(a | 0, 0x9e3779b1) ^ Math.imul((b | 0) + 0x632be5ab, 0x85ebca77);
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};
// Signed variant → [-1, 1).
export const hashS = (seed: number, a = 0, b = 0) => hash(seed, a, b) * 2 - 1;

// ------------------------------------------------------------------ anomaly(t)
// Plateaus from the spec; value changes between plateaus are 0.5 s smooth ramps
// centred on the boundary, the two long ramps (88.6–99, 131.2–147.6) are eased.
const KNOTS: [number, number][] = [
  [88.6, 0],
  [98.75, 0.15],
  [99.25, 0.3],
  [103.25, 0.3],
  [103.75, 0.2],
  [110.65, 0.2],
  [111.15, 0.45],
  [118.05, 0.45],
  [118.55, 0.6],
  [131.2, 0.6],
  [147.35, 0.95],
  [147.85, 1],
  [162.35, 1],
  [162.85, 0.55],
  [176.95, 0.55],
  [177.45, 0.3],
  [191.15, 0.3],
  [191.65, 0.15],
  [205.55, 0.15],
  [206.05, 0],
];
const smooth = (x: number) => x * x * (3 - 2 * x);
export const anomaly = (t: number) => {
  if (t <= KNOTS[0][0]) return 0;
  const last = KNOTS[KNOTS.length - 1];
  if (t >= last[0]) return last[1];
  let i = 0;
  while (KNOTS[i + 1][0] <= t) i++;
  const [t0, v0] = KNOTS[i];
  const [t1, v1] = KNOTS[i + 1];
  return v0 + (v1 - v0) * smooth((t - t0) / (t1 - t0));
};

// Strength of an effect that starts at anomaly `from` and is full at `to`.
// Lets every threshold in the spec fade in instead of popping.
export const band = (a: number, from: number, to: number) => smooth(clamp01((a - from) / (to - from)));

// ------------------------------------------------------------------ stepped jitter
// A random offset in [-amp, amp] held for 1/hz seconds (digital, no blur).
export const stepJ = (t: number, seed: number, amp: number, hz = 10) => (amp === 0 ? 0 : hashS(seed, Math.floor(t * hz + 1e-6)) * amp);

// ------------------------------------------------------------------ corrupt
const GLYPHS = '#%&@$*+=?/\\|<>01';
// Replaces a fraction `amount` of the non-space characters with glitch glyphs.
// The choice is re-rolled every 3 frames (0.1 s).
export const corrupt = (text: string, t: number, amount: number, seed = 1) => {
  if (amount <= 0 || !text) return text;
  const k = Math.floor(t * 10 + 1e-6);
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === ' ' || c === '\n' || hash(seed, i, k) >= amount) out += c;
    else out += GLYPHS[Math.floor(hash(seed + 7, i, k) * GLYPHS.length)];
  }
  return out;
};

// ------------------------------------------------------------------ glitchRect
// One border side. Offsets are in px, rot in degrees about the side's midpoint.
// over0 / over1: how far the straight part extends past its start / end corner
// (an overshooting corner line). gap: [u0, u1] fraction of the side missing.
export type GlitchSeg = {dx: number; dy: number; over0: number; over1: number; vis: boolean; gap: [number, number] | null; rot: number};

// The four sides (top, right, bottom, left) of a glitching frame at anomaly a.
//  a ≤ 0.15  perfect.
//  a > 0.15  ±2 px stepped jitter (8 hz); one corner overshoots up to 18 px.
//  a > 0.4   gaps open, sides may vanish briefly.
//  a > 0.7   sides detach (±10 px) and rotate up to 6°, more overshoot.
export const glitchRect = (t: number, seed: number, a: number): GlitchSeg[] => {
  const j = band(a, 0.15, 0.25);
  const g = band(a, 0.4, 0.5);
  const d = band(a, 0.7, 0.8);
  const k = Math.floor(t * 8 + 1e-6);
  // the corner that overshoots changes every half second
  const corner = Math.floor(hash(seed + 3, Math.floor(t * 2 + 1e-6)) * 4);
  const out: GlitchSeg[] = [];
  for (let s = 0; s < 4; s++) {
    const sd = seed * 31 + s * 7;
    const amp = 2 * j + 8 * d;
    const dx = hashS(sd, k, 1) * amp;
    const dy = hashS(sd, k, 2) * amp;
    // side s ends at corner s (top ends at top-right = corner 0, …)
    const overBase = 18 * j * (0.5 + 0.5 * hash(sd, k, 3));
    let over1 = s === corner ? overBase : 0;
    let over0 = s === (corner + 1) % 4 ? overBase * 0.4 : 0;
    if (d > 0) {
      over0 += 26 * d * hash(sd, k, 4);
      over1 += 26 * d * hash(sd, k, 5);
    }
    let gap: [number, number] | null = null;
    if (g > 0 && hash(sd, k, 6) < 0.45 * g + 0.3 * d) {
      const c = 0.15 + 0.7 * hash(sd, k, 7);
      const len = (0.06 + 0.22 * hash(sd, k, 8)) * (0.5 + 0.5 * g + d);
      gap = [Math.max(0, c - len / 2), Math.min(1, c + len / 2)];
    }
    const vis = !(g > 0.5 && hash(sd, k, 9) < 0.05 * g + 0.12 * d);
    const rot = d > 0 ? hashS(sd, k, 10) * 6 * d : 0;
    out.push({dx, dy, over0, over1, vis, gap, rot});
  }
  return out;
};
