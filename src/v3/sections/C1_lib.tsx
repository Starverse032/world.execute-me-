// Section C1 helpers: analytic polylines (partial plots with a pen head, no
// getLength per frame), dashed sub-polylines, shape samplers, expanding rings
// and the per-ray spark / dial. Spec: docs/design_full.md, Section C.
import React from 'react';
import {beat, beatIndex, clamp01, ease, FPS, K, prog} from '../core';
import {PenHead} from '../geo';

export type Pt = [number, number];
export const F = (f: number) => f / FPS;
export const r2 = (v: number) => Math.round(v * 100) / 100;
export const DEG = Math.PI / 180;
export const CC: Pt = [960, 390]; // lyric stage centre
export const DD: Pt = [960, 430]; // instrumental / climax stage centre
export const BAR = (60 / 130) * 4;
export const NS = 'non-scaling-stroke';

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
// Point at fraction u (0..1) of the total length.
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
// Dashes (on/off px, phase fixed to the polyline start) inside [a, b] (fractions):
// trimming either end never makes the dash pattern crawl.
export const dashD = (pts: Pt[], a: number, b: number, on = 6, off = 6, c = cumLen(pts)) => {
  const L = c[c.length - 1];
  const sa = clamp01(a) * L, sb = clamp01(b) * L;
  let d = '';
  for (let s0 = Math.floor(sa / (on + off)) * (on + off); s0 < sb; s0 += on + off) {
    const x0 = Math.max(s0, sa), x1 = Math.min(s0 + on, sb);
    if (x1 <= x0) continue;
    const sp = subPoly(pts, x0 / L, x1 / L, c);
    if (sp) d += dPoly(sp.pts);
  }
  return d;
};

// A polyline plotted from fraction `from` to `p`, pen head at the moving end.
export const Stroke: React.FC<{
  pts: Pt[];
  p?: number;
  from?: number;
  c?: Float64Array;
  color?: string;
  w?: number;
  opacity?: number;
  pen?: boolean;
  penAt?: 'end' | 'start';
  t?: number;
  closed?: boolean;
  ns?: boolean;
}> = ({pts, p = 1, from = 0, c, color = K.cream, w = 1.5, opacity = 1, pen = true, penAt = 'end', t, closed = false, ns = false}) => {
  if (p <= from || opacity <= 0) return null;
  const ve = ns ? NS : undefined;
  if (from <= 0 && p >= 1)
    return <path d={dPoly(pts, closed)} fill="none" stroke={color} strokeWidth={w} opacity={r2(opacity)} strokeLinecap="round" strokeLinejoin="round" vectorEffect={ve} />;
  const s = subPoly(pts, from, p, c);
  if (!s) return null;
  const tip = penAt === 'end' ? s.b : s.a;
  const showPen = pen && (penAt === 'end' ? p < 1 : from > 0);
  return (
    <>
      <path d={dPoly(s.pts)} fill="none" stroke={color} strokeWidth={w} opacity={r2(opacity)} strokeLinecap="round" strokeLinejoin="round" vectorEffect={ve} />
      {showPen && <PenHead x={tip[0]} y={tip[1]} t={t} opacity={opacity > 0.5 ? 1 : opacity * 2} />}
    </>
  );
};

// ------------------------------------------------------------------ shapes as points
// Ellipse (rotated rot°) from its top, clockwise; n segments.
export const ellPts = (cx: number, cy: number, rx: number, ry: number, rot = 0, n = 96): Pt[] => {
  const r = rot * DEG, cr = Math.cos(r), sr = Math.sin(r);
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const x = rx * Math.cos(a), y = ry * Math.sin(a);
    out.push([cx + x * cr - y * sr, cy + x * sr + y * cr]);
  }
  return out;
};
export const circPts = (cx: number, cy: number, r: number, n = 120) => ellPts(cx, cy, r, r, 0, n);
export const quadPts = (a: Pt, c: Pt, b: Pt, n = 48): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, v = 1 - u;
    out.push([v * v * a[0] + 2 * u * v * c[0] + u * u * b[0], v * v * a[1] + 2 * u * v * c[1] + u * u * b[1]]);
  }
  return out;
};
export const scalePts = (pts: Pt[], o: Pt, k: number): Pt[] => pts.map(([x, y]) => [o[0] + (x - o[0]) * k, o[1] + (y - o[1]) * k]);

// ------------------------------------------------------------------ rings
// Ring expanding r0 → r1 over dur from t0, opacity o0 → 0 (linear).
export const ExpRing: React.FC<{t: number; t0: number; dur: number; cx: number; cy: number; r0: number; r1: number; color?: string; o0?: number; w?: number}> = ({
  t,
  t0,
  dur,
  cx,
  cy,
  r0,
  r1,
  color = K.orange,
  o0 = 0.45,
  w = 1,
}) => {
  const x = (t - t0) / dur;
  if (x < 0 || x >= 1) return null;
  return <circle cx={cx} cy={cy} r={r2(r0 + (r1 - r0) * x)} fill="none" stroke={color} strokeWidth={w} opacity={r2(o0 * (1 - x))} />;
};

// 15° step on every beat after t0 (each step eased over 6 frames, easeOutCubic).
export const beatSteps = (t: number, t0: number) => {
  const n0 = beatIndex(t0) + 1;
  const n = beatIndex(t);
  if (n < n0) return 0;
  return 15 * (n - n0) + 15 * prog(t, beat(n), beat(n) + 6 / FPS, ease.outCubic);
};

// ------------------------------------------------------------------ spark / dial
const JIT = [0, 4, -3, 2, -4, 3, 0, -2, 4, -3, 2, -1];
const LEN = [1.0, 0.8, 0.95, 0.76, 0.98, 0.84, 0.93, 0.78, 1.0, 0.82, 0.96, 0.79];
export const rayAngle = (i: number) => -90 + 30 * i + JIT[i];
export const rayLen = (i: number) => LEN[i];
// Tapered ray i (same geometry as geo.tsx Spark), g = 0..1 length factor.
export const rayD = (R: number, i: number, g: number) => {
  const a = rayAngle(i) * DEG;
  const r0 = 0.1 * R, w0 = 0.075 * R, w1 = 0.025 * R;
  const c = Math.cos(a), s = Math.sin(a), px = -s, py = c;
  const tip = Math.max(r0 + w1, R * LEN[i] * g);
  const P = (r: number, w: number) => `${r2(r * c + px * w)} ${r2(r * s + py * w)}`;
  return `M ${P(r0, w0)} L ${P(tip - w1, w1)} A ${r2(w1)} ${r2(w1)} 0 0 0 ${P(tip - w1, -w1)} L ${P(r0, -w0)} Z`;
};
// fill: orange fill opacity; stroke/w/o: outline colour, width, opacity.
export type RayStyle = {fill?: number; stroke?: string; w?: number; o?: number};
export const Dial: React.FC<{
  x: number;
  y: number;
  R: number;
  rot?: number;
  grow?: (i: number) => number;
  hub?: number; // hub scale 0..1
  ray: (i: number) => RayStyle;
  hubStyle?: RayStyle;
  ns?: boolean; // keep stroke widths under a scaled parent
}> = ({x, y, R, rot = 0, grow, hub = 1, ray, hubStyle, ns = false}) => {
  if (R <= 0) return null;
  const ve = ns ? NS : undefined;
  const el = (key: string, d: string | null, st: RayStyle, circle?: number) => {
    const fill = st.fill ?? 0;
    const hasStroke = !!st.stroke && (st.o ?? 1) > 0;
    if (fill <= 0 && !hasStroke) return null;
    const common = {
      fill: fill > 0 ? K.orange : 'none',
      fillOpacity: fill > 0 ? r2(fill) : undefined,
      stroke: hasStroke ? st.stroke : 'none',
      strokeWidth: st.w ?? 1,
      strokeOpacity: hasStroke ? r2(st.o ?? 1) : undefined,
      strokeLinejoin: 'round' as const,
      vectorEffect: ve,
    };
    return circle !== undefined ? <circle key={key} r={r2(circle)} {...common} /> : <path key={key} d={d!} {...common} />;
  };
  return (
    <g transform={`translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)})`}>
      {JIT.map((_, i) => {
        const g = grow ? grow(i) : 1;
        return g > 0.001 ? el(`r${i}`, rayD(R, i, g), ray(i)) : null;
      })}
      {hub > 0 && el('hub', null, hubStyle ?? ray(0), 0.14 * R * hub)}
    </g>
  );
};
