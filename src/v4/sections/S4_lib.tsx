// S4 helpers: the implicit heart (x² + y² − 1)³ − x²y³ = 0, polyline strokes
// with a pen head, the lyric caption, the stretched LO-O-OVE keyword, the
// targeting brackets and the orange dot.
import React from 'react';
import {clamp01, ease, FPS, K, prog, pulse} from '../../v3/core';
import {PenHead} from '../../v3/geo';
import {CODE, MONO_ADV, SERIF} from '../fonts';
import {r2, textW, useFonts} from '../shell/lib';
import type {P2} from './s4.data';

// ------------------------------------------------------------------ the heart
// Polar solve of (r² − 1)³ = r⁵ cos²θ sin³θ (bisection). The curve is star-shaped
// about the origin; notch (0, 1), tip (0, −1), x ∈ ±1.139, y ∈ [−1, 1.237].
const rAt = (th: number) => {
  const c = Math.cos(th), s = Math.sin(th), k = c * c * s * s * s;
  let lo = 0, hi = 2;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if ((m * m - 1) ** 3 - m ** 5 * k < 0) lo = m;
    else hi = m;
  }
  return lo;
};
export const HN = 360;
// unit heart, starting at the notch, clockwise on screen (y up in math coords)
export const UNIT_HEART: P2[] = Array.from({length: HN + 1}, (_, j) => {
  const th = Math.PI / 2 - (2 * Math.PI * j) / HN;
  const r = rAt(th);
  return [r * Math.cos(th), r * Math.sin(th)];
});
export type HeartGeo = {ox: number; oy: number; S: number};
export const heartPts = (g: HeartGeo): P2[] => UNIT_HEART.map(([x, y]) => [g.ox + g.S * x, g.oy - g.S * y]);
export const heartD = (g: HeartGeo) => dPoly(heartPts(g), true);

// ------------------------------------------------------------------ polylines
export const cumLen = (pts: P2[]) => {
  const c = new Float64Array(pts.length);
  for (let i = 1; i < pts.length; i++) c[i] = c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return c;
};
const at = (pts: P2[], c: Float64Array, s: number): {i: number; p: P2} => {
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
export const polyAt = (pts: P2[], u: number, c = cumLen(pts)): P2 => at(pts, c, clamp01(u) * c[c.length - 1]).p;
export const subPoly = (pts: P2[], a: number, b: number, c = cumLen(pts)) => {
  const L = c[c.length - 1];
  const sa = clamp01(a) * L, sb = clamp01(b) * L;
  if (sb <= sa || pts.length < 2) return null;
  const A = at(pts, c, sa), B = at(pts, c, sb);
  const out: P2[] = [A.p];
  for (let i = A.i + 1; i <= B.i; i++) out.push(pts[i]);
  out.push(B.p);
  return {pts: out, b: B.p};
};
export const dPoly = (pts: P2[], closed = false) => {
  let s = '';
  for (let i = 0; i < pts.length; i++) s += `${i ? 'L' : 'M'}${r2(pts[i][0])} ${r2(pts[i][1])}`;
  return closed ? s + 'Z' : s;
};
// N points evenly spaced along a closed or open polyline
export const samplePoly = (pts: P2[], n: number, phase = 0.5): P2[] => {
  const c = cumLen(pts);
  return Array.from({length: n}, (_, i) => polyAt(pts, (i + phase) / n, c));
};

export const Stroke: React.FC<{
  pts: P2[];
  p?: number;
  color?: string;
  w?: number;
  opacity?: number;
  pen?: boolean;
  t?: number;
  closed?: boolean;
  dash?: string;
}> = ({pts, p = 1, color = K.cream, w = 1.5, opacity = 1, pen = true, t, closed = false, dash}) => {
  if (p <= 0 || opacity <= 0) return null;
  const common = {fill: 'none', stroke: color, strokeWidth: w, opacity, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeDasharray: dash};
  if (p >= 1) return <path d={dPoly(pts, closed)} {...common} />;
  const s = subPoly(pts, 0, p);
  if (!s) return null;
  return (
    <>
      <path d={dPoly(s.pts)} {...common} />
      {pen && <PenHead x={s.b[0]} y={s.b[1]} t={t} />}
    </>
  );
};

// ------------------------------------------------------------------ geometry pieces
export const circlePts = (cx: number, cy: number, r: number, n = 64): P2[] =>
  Array.from({length: n + 1}, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
export const polyClosed = (pts: P2[]): P2[] => [...pts, pts[0]];
export const rotPts = (pts: P2[], c: P2, deg: number): P2[] => {
  const a = (deg * Math.PI) / 180, co = Math.cos(a), si = Math.sin(a);
  return pts.map(([x, y]) => [c[0] + (x - c[0]) * co - (y - c[1]) * si, c[1] + (x - c[0]) * si + (y - c[1]) * co]);
};
export const lerpPts = (a: P2[], b: P2[], p: number): P2[] => a.map((q, i) => [q[0] + (b[i][0] - q[0]) * p, q[1] + (b[i][1] - q[1]) * p]);

// ------------------------------------------------------------------ lyric caption
// A lone lyric line (special UIs): ● + SERIF text streaming at ≥ 40 ch/s, ALL-CAPS
// words in mono orange. kwAt: the part from that char index streams from that time.
const isKw = (w: string) => /^[A-Z][A-Z\-_]+$/.test(w.replace(/[^A-Za-z_\-]/g, '')) && w.replace(/[^A-Z]/g, '').length >= 2;
export const Caption: React.FC<{
  t: number;
  t0: number;
  t1: number; // lift-fade out over 5 frames from here
  text: string;
  x: number;
  y: number; // baseline
  size?: number;
  anchor?: 'start' | 'middle';
  marks?: [number, number][];
  bullet?: boolean;
}> = ({t, t0, t1, text, x, y, size = 56, anchor = 'start', marks, bullet = true}) => {
  useFonts();
  if (t < t0 || t > t1 + 5 / FPS) return null;
  const out = prog(t, t1, t1 + 5 / FPS);
  const words = text.split(' ').map((s) => ({s, kw: isKw(s)}));
  const font = `500 ${size}px ${SERIF}`;
  const ks = size * 0.82;
  const sp = textW(' ', font);
  const ww = words.map((w) => (w.kw ? w.s.length * MONO_ADV * ks : textW(w.s, font)));
  const full = ww.reduce((m, v) => m + v, 0) + sp * (words.length - 1);
  const bw = bullet ? size * 0.55 : 0;
  const left = anchor === 'middle' ? x - (full + bw) / 2 : x;
  // streamed chars
  const ms = marks ?? [[0, t0]];
  let n = 0;
  ms.forEach(([c, ts], j) => {
    if (t < ts) return;
    const end = j + 1 < ms.length ? ms[j + 1][0] : text.length;
    n = Math.min(end, c + Math.floor((t - ts) * 40 + 1e-6));
  });
  const streaming = n < text.length;
  let used = 0, cx = left + bw;
  const els: React.ReactNode[] = [];
  words.forEach((w, i) => {
    const vis = Math.max(0, Math.min(w.s.length, n - used));
    used += w.s.length + 1;
    if (vis > 0)
      els.push(
        <text key={i} x={r2(cx)} y={y} fontFamily={w.kw ? CODE : SERIF} fontWeight={w.kw ? 700 : 500} fontSize={w.kw ? ks : size} fill={w.kw ? K.orange : K.cream} xmlSpace="preserve">
          {w.s.slice(0, vis)}
        </text>,
      );
    cx += ww[i] + sp;
  });
  return (
    <g opacity={1 - out} transform={out ? `translate(0 ${r2(-14 * out)})` : undefined}>
      {bullet && <circle cx={r2(left + size * 0.14)} cy={r2(y - size * 0.3)} r={size * 0.1} fill={streaming ? K.orange : K.creamDim} opacity={streaming ? 0.6 + 0.4 * pulse(t) : 1} />}
      {els}
    </g>
  );
};

// ------------------------------------------------------------------ LO-O-OVE
// The stretched keyword: chunks slam in on the held vowels (each 1.04 → 1),
// solid while it grows, then outline 8 frames after the last chunk. Exit: fade + lift.
export const StretchKw: React.FC<{
  t: number;
  pre?: string;
  post?: string;
  chunks: [string, number][];
  t1: number;
  x: number;
  y: number;
  size: number;
  anchor?: 'start' | 'middle';
  knock?: boolean;
}> = ({t, pre = '', post = '', chunks, t1, x, y, size, anchor = 'middle', knock = true}) => {
  const t0 = chunks[0][1];
  if (t < t0 - 4 / FPS || t > t1 + 5 / FPS) return null;
  const ps = size * 0.42;
  const kw = chunks.map((c) => c[0]).join('');
  const preW = pre.length * MONO_ADV * ps, kwW = kw.length * MONO_ADV * size;
  const total = preW + kwW + post.length * MONO_ADV * ps;
  const left = anchor === 'middle' ? x - total / 2 : x;
  const nPre = t >= t0 ? pre.length : Math.floor(clamp01((t - t0 + 4 / FPS) / (4 / FPS)) * pre.length);
  let shown = '', lastT = -Infinity;
  for (const [s, ts] of chunks) if (t >= ts) {
    shown += s;
    lastT = ts;
  }
  const done = shown.length === kw.length;
  const tEnd = chunks[chunks.length - 1][1];
  const nPost = done ? Math.min(post.length, Math.floor((t - tEnd) * FPS * 2 + 1)) : 0;
  const fillO = !done ? 1 : 1 - clamp01(((t - tEnd) * FPS - 8) / 8);
  const f = (t - lastT) * FPS;
  const sc = f >= 0 && f < 4 ? 1.04 - 0.04 * ease.outCubic(f / 4) : 1;
  const out = prog(t, t1, t1 + 5 / FPS);
  const kx = left + preW;
  const kcx = kx + kwW / 2, kcy = y - size * 0.36;
  const sw = Math.max(1.5, size / 70);
  const knockS = {stroke: K.bg, strokeLinejoin: 'round' as const, style: {paintOrder: 'stroke' as const}};
  return (
    <g opacity={1 - out} transform={out ? `translate(0 ${r2(-14 * out)})` : undefined}>
      {nPre > 0 && (
        <text x={r2(left)} y={y} fontFamily={CODE} fontSize={ps} fill={K.creamDim} xmlSpace="preserve" {...(knock ? {...knockS, strokeWidth: ps * 0.35} : {})}>
          {pre.slice(0, nPre)}
        </text>
      )}
      {shown && (
        <g transform={sc !== 1 ? `translate(${r2(kcx)} ${r2(kcy)}) scale(${r2(sc * 1000) / 1000}) translate(${r2(-kcx)} ${r2(-kcy)})` : undefined}>
          {knock && (
            <text x={r2(kx)} y={y} fontFamily={CODE} fontWeight={700} fontSize={size} fill={K.bg} stroke={K.bg} strokeWidth={size * 0.1} strokeLinejoin="round" xmlSpace="preserve">
              {shown}
            </text>
          )}
          <text x={r2(kx)} y={y} fontFamily={CODE} fontWeight={700} fontSize={size} fill={K.orange} fillOpacity={fillO} stroke={K.orange} strokeWidth={sw} strokeLinejoin="round" xmlSpace="preserve" style={{paintOrder: 'stroke'}}>
            {shown}
          </text>
        </g>
      )}
      {nPost > 0 && (
        <text x={r2(kx + kwW)} y={y} fontFamily={CODE} fontSize={ps} fill={K.creamDim} xmlSpace="preserve" {...(knock ? {...knockS, strokeWidth: ps * 0.35} : {})}>
          {post.slice(0, nPost)}
        </text>
      )}
    </g>
  );
};
// chunk times for a held LO-O-OVE from t0 to tEnd
export const loveChunks = (t0: number, tEnd: number): [string, number][] => {
  const d = (tEnd - t0) / 4;
  return [
    ['LO', t0],
    ['-O', t0 + d],
    ['-O', t0 + 2 * d],
    ['VE', t0 + 3 * d],
  ];
};

// ------------------------------------------------------------------ targeting brackets
// Orange corner marks lock onto a box (shrinking in from +24 px over 6 frames)
// and blink on eighth notes until the deletion.
export const Brackets: React.FC<{t: number; t0: number; t1: number; box: [number, number, number, number]; len?: number}> = ({t, t0, t1, box, len = 22}) => {
  if (t < t0 || t >= t1) return null;
  const lock = ease.outCubic(clamp01((t - t0) * FPS / 6));
  const pad = 24 * (1 - lock) + 6;
  const blinkOn = lock < 1 || Math.floor((t - t0) / (60 / 130 / 2)) % 2 === 0;
  const o = blinkOn ? 1 : 0.35;
  const [x, y, w, h] = box;
  const x0 = x - pad, y0 = y - pad, x1 = x + w + pad, y1 = y + h + pad;
  const L = Math.min(len, w / 3, h / 2 + 4);
  const d = [
    `M ${r2(x0)} ${r2(y0 + L)} L ${r2(x0)} ${r2(y0)} L ${r2(x0 + L)} ${r2(y0)}`,
    `M ${r2(x1 - L)} ${r2(y0)} L ${r2(x1)} ${r2(y0)} L ${r2(x1)} ${r2(y0 + L)}`,
    `M ${r2(x1)} ${r2(y1 - L)} L ${r2(x1)} ${r2(y1)} L ${r2(x1 - L)} ${r2(y1)}`,
    `M ${r2(x0 + L)} ${r2(y1)} L ${r2(x0)} ${r2(y1)} L ${r2(x0)} ${r2(y1 - L)}`,
  ].join(' ');
  return <path d={d} fill="none" stroke={K.orange} strokeWidth={2} opacity={o * lock} strokeLinecap="square" />;
};

// ------------------------------------------------------------------ the orange dot (r = 7)
export const Dot: React.FC<{t: number; x: number; y: number; opacity?: number; ring?: boolean}> = ({t, x, y, opacity = 1, ring = true}) =>
  opacity > 0 ? (
    <g opacity={opacity}>
      {ring && <circle cx={r2(x)} cy={r2(y)} r={13 * (1 + 0.35 * pulse(t))} fill="none" stroke={K.orange} strokeWidth={1} opacity={0.45} />}
      <circle cx={r2(x)} cy={r2(y)} r={7} fill={K.orange} />
    </g>
  ) : null;
