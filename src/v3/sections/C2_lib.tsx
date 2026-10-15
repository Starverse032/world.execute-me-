// Section C2 helpers: the heart curve (C14–C19), analytic partial polylines,
// inverse easings, typed key = value labels and the spark ray outlines.
// Spec: docs/design_C.md C14–C22.
import React from 'react';
import {clamp01, CODE, env, FPS, K, lastOnset, O, prog} from '../core';
import {PenHead} from '../geo';

export type Pt = [number, number];
export const F = (f: number) => f / FPS; // frame → seconds
export const r2 = (v: number) => Math.round(v * 100) / 100;
export const DEG = Math.PI / 180;
export const TAU = Math.PI * 2;

// ------------------------------------------------------------------ inverse easings
// inverse of easeInOutCubic
export const invIOC = (y: number) => (y < 0.5 ? Math.cbrt(y / 4) : 1 - Math.cbrt(2 * (1 - y)) / 2);
// inverse of easeInOutSine
export const invIOS = (y: number) => Math.acos(1 - 2 * clamp01(y)) / Math.PI;

// ------------------------------------------------------------------ the heart
// X(t) = 16 sin³t, Y(t) = 13 cos t − 5 cos 2t − 2 cos 3t − cos 4t.
export const hX = (t: number) => 16 * Math.pow(Math.sin(t), 3);
export const hY = (t: number) => 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
// The s = 18 heart at H = (1240, 354): notch (1240, 264), tip (1240, 660).
export const HEART = {x: 1240, y: 354, s: 18};
// Scale centre of the heart group (iris, heartbeat): the iris centre.
export const HC = {x: 1240, y: 430};
export const heartXY = (t: number, k = 1): Pt => {
  const x = HEART.x + HEART.s * hX(t), y = HEART.y - HEART.s * hY(t);
  return [HC.x + k * (x - HC.x), HC.y + k * (y - HC.y)];
};
export const HN = 720; // samples, starting at the notch (t = 0), clockwise
// Unit heart (k = 1) polyline, closed back at the notch.
export const HEART_PTS: Pt[] = Array.from({length: HN + 1}, (_, j) => heartXY((TAU * j) / HN));
export const scalePts = (pts: Pt[], k: number, cx = HC.x, cy = HC.y): Pt[] => pts.map(([x, y]) => [cx + k * (x - cx), cy + k * (y - cy)]);

// Heart path up to parameter t (0..2π) with the exact tip (for param-timed plots).
export const heartUpTo = (tp: number, k = 1): Pt[] => {
  const n = Math.min(HN, Math.floor((tp / TAU) * HN));
  const out: Pt[] = [];
  for (let j = 0; j <= n; j++) out.push(k === 1 ? HEART_PTS[j] : heartXY((TAU * j) / HN, k));
  out.push(heartXY(Math.min(TAU, tp), k));
  return out;
};

// Heart path string at scale k (fewer samples: used for CSS clip paths).
const CLIP_N = 360;
export const heartClipD = (k = 1) => {
  let s = '';
  for (let j = 0; j < CLIP_N; j++) {
    const [x, y] = heartXY((TAU * j) / CLIP_N, k);
    s += `${j ? 'L' : 'M'}${r2(x)} ${r2(y)}`;
  }
  return s + 'Z';
};
export const HEART_CLIP_1 = heartClipD(1);

// Point-in-heart test (unit heart, k = 1, or scaled by k about HC).
export const inHeart = (x: number, y: number, k = 1) => {
  const px = HC.x + (x - HC.x) / k, py = HC.y + (y - HC.y) / k;
  let inside = false;
  for (let i = 0, j = HN - 1; i < HN; j = i++) {
    const [xi, yi] = HEART_PTS[i], [xj, yj] = HEART_PTS[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

// ------------------------------------------------------------------ timing shared by the heart group
export const T_HB = 190.751; // b413: the heartbeat starts
export const F_KW17 = 5741; // "Trapped in LO-O-OVE"
export const F_CUT18 = 5742; // fills cut out, she becomes points
export const T_UNHEART = 193.981; // b420: the heart un-plots
// Lub-dub scale of the heart group about HC: 0.03 / 0.015 per beat from b413
// (0.04 / 0.02 from f5742), plus an extra 0.05 / 0.025 beat on the f5741 hit.
export const heartbeat = (t: number) => {
  if (t < T_HB - 0.05 || t >= T_UNHEART) return 1;
  let s = 1;
  const tb = lastOnset(t);
  if (tb >= T_HB - 0.05) {
    const a = tb < F(F_CUT18) ? 0.03 : 0.04;
    s += a * env(t - tb) + (a / 2) * env(t - tb - 0.15);
  }
  const tk = F(F_KW17);
  s += 0.05 * env(t - tk) + 0.025 * env(t - tk - 0.15);
  return s;
};

// ------------------------------------------------------------------ polylines
export const cumLen = (pts: Pt[]) => {
  const c = new Float64Array(pts.length);
  for (let i = 1; i < pts.length; i++) c[i] = c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return c;
};
const at = (pts: Pt[], c: Float64Array, s: number): {i: number; p: Pt} => {
  let lo = 0, hi = pts.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (c[m] <= s) lo = m;
    else hi = m;
  }
  const seg = c[hi] - c[lo];
  const u = seg > 0 ? (s - c[lo]) / seg : 0;
  return {i: lo, p: [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * u, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * u]};
};
// Point at fraction u (0..1) of the length.
export const polyAt = (pts: Pt[], u: number, c = cumLen(pts)): Pt => at(pts, c, clamp01(u) * c[c.length - 1]).p;
// Sub-polyline between fractions a and b of the total length.
export const subPoly = (pts: Pt[], a: number, b: number, c = cumLen(pts)) => {
  const L = c[c.length - 1];
  const sa = clamp01(a) * L, sb = clamp01(b) * L;
  if (sb <= sa || pts.length < 2) return null;
  const A = at(pts, c, sa), B = at(pts, c, sb);
  const out: Pt[] = [A.p];
  for (let i = A.i + 1; i <= B.i; i++) out.push(pts[i]);
  out.push(B.p);
  return {pts: out, a: A.p, b: B.p};
};
export const dPoly = (pts: Pt[], closed = false) => {
  let s = '';
  for (let i = 0; i < pts.length; i++) s += `${i ? 'L' : 'M'}${r2(pts[i][0])} ${r2(pts[i][1])}`;
  return closed ? s + 'Z' : s;
};

// A polyline drawn from 0 to fraction p of its length, pen head at the tip.
export const Stroke: React.FC<{
  pts: Pt[];
  p?: number;
  c?: Float64Array;
  color?: string;
  w?: number;
  opacity?: number;
  pen?: boolean;
  t?: number;
  closed?: boolean;
  dash?: string;
}> = ({pts, p = 1, c, color = K.cream, w = 1.5, opacity = 1, pen = true, t, closed = false, dash}) => {
  if (p <= 0 || opacity <= 0) return null;
  const common = {fill: 'none', stroke: color, strokeWidth: w, opacity, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeDasharray: dash};
  if (p >= 1) return <path d={dPoly(pts, closed)} {...common} />;
  const s = subPoly(pts, 0, p, c);
  if (!s) return null;
  return (
    <>
      <path d={dPoly(s.pts)} {...common} />
      {pen && <PenHead x={s.b[0]} y={s.b[1]} t={t} opacity={opacity > 0.5 ? 1 : opacity * 2} />}
    </>
  );
};

// ------------------------------------------------------------------ text
export const ADV = (size: number) => 0.6 * size; // JetBrains Mono advance

// `key = value` label typed to n chars: key cream 70 %, `=` creamDim, value cream.
export const KV: React.FC<{x: number; y: number; k: string; v: string; n: number; size?: number; opacity?: number}> = ({x, y, k, v, n, size = 22, opacity = 1}) => {
  if (n <= 0 || opacity <= 0) return null;
  const parts: [string, React.SVGProps<SVGTSpanElement>][] = [
    [k, {fill: K.cream, fillOpacity: O.hi}],
    [' = ', {fill: K.creamDim}],
    [v, {fill: K.cream}],
  ];
  let used = 0;
  const spans = parts.map(([s, st], i) => {
    const seg = s.slice(0, Math.max(0, n - used));
    used += s.length;
    return seg ? (
      <tspan key={i} {...st}>
        {seg}
      </tspan>
    ) : null;
  });
  return (
    <text x={r2(x)} y={r2(y)} fontFamily={CODE} fontSize={size} opacity={opacity} style={{whiteSpace: 'pre'}}>
      {spans}
    </text>
  );
};

// Characters shown when a string types over `frames` frames from t0.
export const typed = (len: number, t0: number, t: number, frames: number) => Math.round(len * prog(t, t0, t0 + frames / FPS));

// ------------------------------------------------------------------ spark rays
export const JIT = [0, 4, -3, 2, -4, 3, 0, -2, 4, -3, 2, -1];
export const LEN = [1.0, 0.8, 0.95, 0.76, 0.98, 0.84, 0.93, 0.78, 1.0, 0.82, 0.96, 0.79];
// Ray i of a spark of radius R at the origin (tapered quad with a rounded tip).
export const rayD = (R: number, i: number, g = 1) => {
  const a = ((-90 + 30 * i + JIT[i]) * Math.PI) / 180;
  const r0 = 0.1 * R, w0 = 0.075 * R, w1 = 0.025 * R;
  const c = Math.cos(a), s = Math.sin(a), px = -s, py = c;
  const tip = Math.max(r0 + w1, R * LEN[i] * g);
  const P = (r: number, w: number) => `${r2(r * c + px * w)} ${r2(r * s + py * w)}`;
  return `M ${P(r0, w0)} L ${P(tip - w1, w1)} A ${r2(w1)} ${r2(w1)} 0 0 0 ${P(tip - w1, -w1)} L ${P(r0, -w0)} Z`;
};
