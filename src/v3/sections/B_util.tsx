// Section B helpers: analytic partial polylines (no getLength per frame, so
// moving or morphing strokes stay cheap), arcs, typed key = value labels,
// the per-ray spark and the beat-step rotation. Spec: docs/design_B.md.
import React from 'react';
import {beat, beatIndex, clamp01, CODE, ease, FPS, K, O, prog, pulse} from '../core';
import {PenHead} from '../geo';

export type Pt = [number, number];
export const F = (f: number) => f / FPS;
export const r2 = (v: number) => Math.round(v * 100) / 100;
export const DEG = Math.PI / 180;
export const C = {x: 960, y: 390};

// ------------------------------------------------------------------ polylines
export const cumLen = (pts: Pt[]) => {
  const c = new Float64Array(pts.length);
  for (let i = 1; i < pts.length; i++) c[i] = c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return c;
};
const at = (pts: Pt[], c: Float64Array, s: number): {i: number; p: Pt} => {
  // point at arc length s (binary search on the cumulative lengths)
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
// Sub-polyline between fractions a and b (0..1) of the total length.
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

// A polyline plotted from fraction `from` to `p`, with the pen head at the
// moving end (`penAt`: the p end, or the `from` end for a tail retract).
export const Stroke: React.FC<{
  pts: Pt[];
  p?: number;
  from?: number;
  c?: Float64Array;
  color?: string;
  w?: number;
  opacity?: number;
  dash?: string;
  pen?: boolean;
  penAt?: 'end' | 'start';
  t?: number;
  closed?: boolean;
  penScale?: number;
}> = ({pts, p = 1, from = 0, c, color = K.cream, w = 1.5, opacity = 1, dash, pen = true, penAt = 'end', t, closed = false, penScale = 1}) => {
  if (p <= from || opacity <= 0) return null;
  const full = from <= 0 && p >= 1;
  if (full)
    return <path d={dPoly(pts, closed)} fill="none" stroke={color} strokeWidth={w} opacity={opacity} strokeDasharray={dash} strokeLinecap="round" strokeLinejoin="round" />;
  const s = subPoly(pts, from, p, c);
  if (!s) return null;
  const tip = penAt === 'end' ? s.b : s.a;
  const showPen = pen && (penAt === 'end' ? p < 1 : from > 0);
  return (
    <>
      <path d={dPoly(s.pts)} fill="none" stroke={color} strokeWidth={w} opacity={opacity} strokeDasharray={dash} strokeLinecap="round" strokeLinejoin="round" />
      {showPen && <PenHead x={tip[0]} y={tip[1]} t={t} scale={penScale} opacity={opacity > 0.5 ? 1 : opacity * 2} />}
    </>
  );
};

// Straight segment from a to b, plotted to p (pen at the tip).
export const Seg: React.FC<{a: Pt; b: Pt; p?: number; color?: string; w?: number; opacity?: number; pen?: boolean; t?: number; dash?: string; cap?: 'round' | 'butt'}> = ({
  a,
  b,
  p = 1,
  color = K.cream,
  w = 1.5,
  opacity = 1,
  pen = true,
  t,
  dash,
  cap = 'round',
}) => {
  if (p <= 0 || opacity <= 0) return null;
  const q = Math.min(1, p);
  const x = a[0] + (b[0] - a[0]) * q, y = a[1] + (b[1] - a[1]) * q;
  return (
    <>
      <path d={`M${r2(a[0])} ${r2(a[1])}L${r2(x)} ${r2(y)}`} stroke={color} strokeWidth={w} opacity={opacity} strokeLinecap={cap} strokeDasharray={dash} fill="none" />
      {pen && q < 1 && <PenHead x={x} y={y} t={t} opacity={opacity > 0.5 ? 1 : opacity * 2} />}
    </>
  );
};

// Arc points, angles in degrees (0 = 3 o'clock, + = clockwise on screen).
export const arcPts = (cx: number, cy: number, r: number, a0: number, a1: number, step = 3): Pt[] => {
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / step));
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (a0 + ((a1 - a0) * i) / n) * DEG;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
};
export const polar = (cx: number, cy: number, r: number, aDeg: number): Pt => [cx + r * Math.cos(aDeg * DEG), cy + r * Math.sin(aDeg * DEG)];

// Arc plotted from a0 by sweep·p (pen at the moving end).
export const ArcStroke: React.FC<{cx: number; cy: number; r: number; a0: number; sweep: number; p?: number; color?: string; w?: number; opacity?: number; pen?: boolean; t?: number}> = ({
  cx,
  cy,
  r,
  a0,
  sweep,
  p = 1,
  color = K.cream,
  w = 1.5,
  opacity = 1,
  pen = true,
  t,
}) => {
  if (p <= 0 || opacity <= 0 || r <= 0) return null;
  const q = Math.min(1, p);
  if (q >= 1 && Math.abs(sweep) >= 360) return <circle cx={r2(cx)} cy={r2(cy)} r={r2(r)} fill="none" stroke={color} strokeWidth={w} opacity={opacity} />;
  const pts = arcPts(cx, cy, r, a0, a0 + sweep * q, Math.max(1.5, 360 / Math.max(48, r)));
  const tip = pts[pts.length - 1];
  return (
    <>
      <path d={dPoly(pts)} fill="none" stroke={color} strokeWidth={w} opacity={opacity} strokeLinecap="round" strokeLinejoin="round" />
      {pen && q < 1 && <PenHead x={tip[0]} y={tip[1]} t={t} opacity={opacity > 0.5 ? 1 : opacity * 2} />}
    </>
  );
};

// ------------------------------------------------------------------ text
export const ADV = (size: number) => 0.6 * size; // JetBrains Mono advance

// `key = value` label typed to n chars: key cream 70 %, `=` creamDim, value cream
// (or valColor). anchor 'end' keeps the full string's right edge at x.
export const KV: React.FC<{x: number; y: number; k: string; v: string; n: number; anchor?: 'start' | 'end'; size?: number; valColor?: string; opacity?: number}> = ({
  x,
  y,
  k,
  v,
  n,
  anchor = 'start',
  size = 22,
  valColor = K.cream,
  opacity = 1,
}) => {
  const parts: [string, React.SVGProps<SVGTSpanElement>][] = [
    [k, {fill: K.cream, opacity: O.hi}],
    [' = ', {fill: K.creamDim}],
    [v, {fill: valColor}],
  ];
  const fullW = (k.length + 3 + v.length) * ADV(size);
  const x0 = anchor === 'end' ? x - fullW : x;
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
  if (n <= 0 || opacity <= 0) return null;
  return (
    <text x={r2(x0)} y={r2(y)} fontFamily={CODE} fontSize={size} opacity={opacity} style={{whiteSpace: 'pre'}}>
      {spans}
    </text>
  );
};

// Characters typed by t when the whole string types over `frames` frames from t0
// (moment A's convention: 0 chars on t0, all chars on t0 + frames).
export const typed = (len: number, t0: number, t: number, frames = len) => Math.round(len * prog(t, t0, t0 + frames / FPS));

// ------------------------------------------------------------------ spark with per-ray growth
const JIT = [0, 4, -3, 2, -4, 3, 0, -2, 4, -3, 2, -1];
const LEN = [1.0, 0.8, 0.95, 0.76, 0.98, 0.84, 0.93, 0.78, 1.0, 0.82, 0.96, 0.79];
const rayD = (R: number, i: number, g: number) => {
  const a = ((-90 + 30 * i + JIT[i]) * Math.PI) / 180;
  const r0 = 0.1 * R, w0 = 0.075 * R, w1 = 0.025 * R;
  const c = Math.cos(a), s = Math.sin(a), px = -s, py = c;
  const tip = Math.max(r0 + w1, R * LEN[i] * g);
  const P = (r: number, w: number) => `${r2(r * c + px * w)} ${r2(r * s + py * w)}`;
  return `M ${P(r0, w0)} L ${P(tip - w1, w1)} A ${r2(w1)} ${r2(w1)} 0 0 0 ${P(tip - w1, -w1)} L ${P(r0, -w0)} Z`;
};
export const RaySpark: React.FC<{x: number; y: number; R: number; rot: number; grow: (i: number) => number; hub: number}> = ({x, y, R, rot, grow, hub}) => (
  <g transform={`translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)})`}>
    {JIT.map((_, i) => {
      const g = grow(i);
      return g > 0.001 ? <path key={i} d={rayD(R, i, g)} fill={K.orange} /> : null;
    })}
    {hub > 0 && <circle r={r2(0.14 * R * hub)} fill={K.orange} />}
  </g>
);

// 15° step on every beat after t0 (each step eased over 6 frames, easeOutCubic).
export const beatSteps = (t: number, t0: number) => {
  const n0 = beatIndex(t0) + 1;
  const n = beatIndex(t);
  if (n < n0) return 0;
  return 15 * (n - n0) + 15 * prog(t, beat(n), beat(n) + 6 / FPS, ease.outCubic);
};

// Beat pulse envelope (same onsets as the pen heads), only for beats n0..n1.
export const beatEnv = (t: number, n0: number, n1: number) => {
  const n = beatIndex(t);
  return n < n0 || n > n1 ? 0 : pulse(t);
};
