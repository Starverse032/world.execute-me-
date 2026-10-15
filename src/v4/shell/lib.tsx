// Shared helpers for the v4 shell: text measurement, state-change lookback,
// the glitchable rounded frame (used by Win, Composer, Sidebar, KwCode …) and
// small drawn glyphs. Every component here is an SVG fragment (local coords).
import React, {useEffect, useState} from 'react';
import {clamp01, ease, FPS, K, lerp} from '../../v3/core';
import {Plot} from '../../v3/geo';
import {glitchRect, hash, hashS} from '../chaos';
import {fontsReady, onFontsReady} from '../fonts';

export type P2 = [number, number];
export const F = (f: number) => f / FPS; // frames → seconds
export const r2 = (v: number) => Math.round(v * 100) / 100;
export const fprog = (t: number, t0: number, frames: number, e: (x: number) => number = ease.linear) => e(clamp01((t - t0) / (frames / FPS)));

// ------------------------------------------------------------------ measurement
let mctx: CanvasRenderingContext2D | null = null;
const wCache = new Map<string, number>();
// Canvas text width. Cached only once the fonts have loaded.
export const textW = (s: string, font: string) => {
  const key = font + '|' + s;
  const c = wCache.get(key);
  if (c !== undefined) return c;
  if (!mctx) mctx = document.createElement('canvas').getContext('2d')!;
  mctx.font = font;
  const w = mctx.measureText(s).width;
  if (fontsReady()) {
    if (wCache.size > 20000) wCache.clear();
    wCache.set(key, w);
  }
  return w;
};
// Re-render once the fonts are in (components that measure text call this).
export const useFonts = () => {
  const [, set] = useState(0);
  useEffect(() => {
    if (fontsReady()) return;
    const off = onFontsReady(() => set((x) => x + 1));
    return () => {
      off();
    };
  }, []);
  return fontsReady();
};

// Greedy word wrap with a width function.
export const wrapWords = (text: string, maxW: number, width: (s: string) => number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (cur && width(next) > maxW) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur || !lines.length) lines.push(cur);
  return lines;
};

// ------------------------------------------------------------------ lookback
// How many frames ago fn's value last changed (searching up to maxF frames
// back; Infinity when it did not), and the value before the change. Lets a
// component animate state transitions while staying a pure function of t.
export const since = <V,>(fn: (t: number) => V, t: number, maxF = 12): {f: number; prev: V; cur: V} => {
  const cur = fn(t);
  for (let k = 1; k <= maxF; k++) {
    const v = fn(t - k / FPS);
    if (v !== cur) return {f: k - 1, prev: v, cur};
  }
  return {f: Infinity, prev: cur, cur};
};

// ------------------------------------------------------------------ frame geometry
const n2 = r2;
type Side = {arc: string; a: P2; b: P2; nrm: P2; c0: P2};
const sides = (x0: number, y0: number, x1: number, y1: number, r: number): Side[] => [
  {arc: `M ${n2(x0)} ${n2(y0 + r)} A ${r} ${r} 0 0 1 ${n2(x0 + r)} ${n2(y0)}`, a: [x0 + r, y0], b: [x1 - r, y0], nrm: [0, -1], c0: [x0, y0]},
  {arc: `M ${n2(x1 - r)} ${n2(y0)} A ${r} ${r} 0 0 1 ${n2(x1)} ${n2(y0 + r)}`, a: [x1, y0 + r], b: [x1, y1 - r], nrm: [1, 0], c0: [x1, y0]},
  {arc: `M ${n2(x1)} ${n2(y1 - r)} A ${r} ${r} 0 0 1 ${n2(x1 - r)} ${n2(y1)}`, a: [x1 - r, y1], b: [x0 + r, y1], nrm: [0, 1], c0: [x1, y1]},
  {arc: `M ${n2(x0 + r)} ${n2(y1)} A ${r} ${r} 0 0 1 ${n2(x0)} ${n2(y1 - r)}`, a: [x0, y1 - r], b: [x0, y0 + r], nrm: [-1, 0], c0: [x0, y1]},
];
// Straight part from u0 to u1 (fractions), optionally displaced by a standing wave.
const straight = (s: Side, u0: number, u1: number, wave: number, phase: number, ext0 = 0, ext1 = 0) => {
  const [ax, ay] = s.a, [bx, by] = s.b;
  const L = Math.hypot(bx - ax, by - ay) || 1;
  const tx = (bx - ax) / L, ty = (by - ay) / L;
  const p0 = u0 * L - (u0 <= 0 ? ext0 : 0), p1 = u1 * L + (u1 >= 1 ? ext1 : 0);
  if (!wave) return `M ${n2(ax + tx * p0)} ${n2(ay + ty * p0)} L ${n2(ax + tx * p1)} ${n2(ay + ty * p1)}`;
  const N = Math.max(4, Math.ceil((p1 - p0) / 14));
  let d = '';
  for (let i = 0; i <= N; i++) {
    const p = p0 + ((p1 - p0) * i) / N;
    const u = clamp01(p / L);
    const off = wave * Math.sin(Math.PI * 3 * u) * Math.cos(phase);
    d += `${i ? 'L' : 'M'} ${n2(ax + tx * p + s.nrm[0] * off)} ${n2(ay + ty * p + s.nrm[1] * off)} `;
  }
  return d;
};

export const rrPath = (x: number, y: number, w: number, h: number, r: number) => {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M ${n2(x + r)} ${n2(y)} L ${n2(x + w - r)} ${n2(y)} A ${r} ${r} 0 0 1 ${n2(x + w)} ${n2(y + r)} L ${n2(x + w)} ${n2(y + h - r)} A ${r} ${r} 0 0 1 ${n2(x + w - r)} ${n2(y + h)} L ${n2(x + r)} ${n2(y + h)} A ${r} ${r} 0 0 1 ${n2(x)} ${n2(y + h - r)} L ${n2(x)} ${n2(y + r)} A ${r} ${r} 0 0 1 ${n2(x + r)} ${n2(y)} Z`;
};

// A rounded rectangle border that can glitch (anomaly a), vibrate (wave px),
// break apart (shatter 0..1) or plot itself on (plot 0..1, with pen head).
// Fill is not drawn here (draw it underneath with rrPath).
export const Frame: React.FC<{
  x?: number;
  y?: number;
  w: number;
  h: number;
  r?: number;
  t: number;
  a?: number;
  seed?: number;
  color?: string;
  opacity?: number;
  sw?: number;
  dash?: string;
  wave?: number;
  shatter?: number;
  plot?: number;
}> = ({x = 0, y = 0, w, h, r = 10, t, a = 0, seed = 1, color = K.cream, opacity = 0.25, sw = 1.5, dash, wave = 0, shatter = 0, plot = 1}) => {
  if (w <= 0 || h <= 0 || opacity <= 0 || plot <= 0) return null;
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  const common = {fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round' as const, strokeDasharray: dash, opacity};
  const calm = a <= 0.15 && !wave && shatter <= 0;
  if (calm || plot < 1) {
    if (plot < 1) return <Plot d={rrPath(x, y, w, h, r).replace(/ Z$/, '')} p={plot} color={color} w={sw} opacity={opacity} t={t} />;
    return <path d={rrPath(x, y, w, h, r)} {...common} />;
  }
  const S = sides(x, y, x + w, y + h, r);
  const G = glitchRect(t, seed, a);
  const phase = t * 2 * Math.PI * 6;
  const out: React.ReactNode[] = [];
  S.forEach((s, i) => {
    const g = G[i];
    if (!g.vis) return;
    const mx = (s.a[0] + s.b[0]) / 2, my = (s.a[1] + s.b[1]) / 2;
    const half = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]) / 2 + r;
    const rotMax = (Math.asin(Math.min(1, 28 / Math.max(28, half))) * 180) / Math.PI;
    const rot = Math.max(-rotMax, Math.min(rotMax, g.rot));
    const tf = `translate(${n2(g.dx)} ${n2(g.dy)}) rotate(${n2(rot)} ${n2(mx)} ${n2(my)})`;
    if (shatter > 0) {
      // 3 straight pieces + the corner arc, each flying along the side normal
      const pieces: string[] = [s.arc];
      const sideL = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]);
      const np = Math.max(2, Math.round(sideL / 130));
      const cuts = [0];
      for (let k = 1; k < np; k++) cuts.push((k + 0.6 * hashS(seed, i, k) * 0.5) / np);
      cuts.push(1);
      for (let k = 0; k < np; k++) pieces.push(straight(s, cuts[k], cuts[k + 1], wave, phase));
      pieces.forEach((d, k) => {
        const sd = seed * 13 + i * 5 + k;
        const dist = (40 + 160 * hash(sd, 3)) * shatter;
        const tang = hashS(sd, 4) * 0.8;
        const ox = (s.nrm[0] + tang * s.nrm[1]) * dist, oy = (s.nrm[1] - tang * s.nrm[0]) * dist;
        const rot = hashS(sd, 5) * 50 * shatter;
        // rotate each piece about its own middle
        const u0 = k === 0 ? 0 : cuts[k - 1], u1 = k === 0 ? 0 : cuts[k];
        const c: P2 = k === 0 ? s.c0 : [s.a[0] + (s.b[0] - s.a[0]) * (u0 + u1) / 2, s.a[1] + (s.b[1] - s.a[1]) * (u0 + u1) / 2];
        out.push(<path key={`${i}-${k}`} d={d} {...common} transform={`${tf} translate(${n2(ox)} ${n2(oy)}) rotate(${n2(rot)} ${n2(c[0])} ${n2(c[1])})`} />);
      });
      return;
    }
    let d = s.arc + ' ';
    if (g.gap) {
      d += straight(s, 0, g.gap[0], wave, phase, g.over0 > 0 ? r + g.over0 : 0, 0) + ' ';
      if (g.gap[1] < 1) d += straight(s, g.gap[1], 1, wave, phase, 0, g.over1 > 0 ? r + g.over1 : 0);
    } else d += straight(s, 0, 1, wave, phase, g.over0 > 0 ? r + g.over0 : 0, g.over1 > 0 ? r + g.over1 : 0);
    out.push(<path key={i} d={d} {...common} transform={tf} />);
  });
  return <>{out}</>;
};

// ------------------------------------------------------------------ layer
// HTML-level wrapper for SVG fragments (Spark, Plot, PenHead … from v3/geo):
// a 1×1 <svg> at the parent's origin with overflow visible, so children use
// the parent's px coordinates.
export const Layer: React.FC<{children: React.ReactNode; opacity?: number; style?: React.CSSProperties}> = ({children, opacity = 1, style}) => (
  <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity, ...style}}>
    {children}
  </svg>
);

// ------------------------------------------------------------------ glyphs
// Text caret: 2 px bar, `h` tall, its bottom on the baseline + h*0.2.
export const Caret: React.FC<{x: number; y: number; h: number; color?: string; opacity?: number}> = ({x, y, h, color = K.cream, opacity = 1}) =>
  opacity > 0 ? <rect x={r2(x)} y={r2(y - h * 0.8)} width={2} height={h} fill={color} opacity={opacity} /> : null;

// Up-arrow used in send buttons (drawn, bg-coloured).
export const SendArrow: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = K.bg}) => (
  <g transform={`translate(${r2(x)} ${r2(y)}) scale(${s})`}>
    <path d="M 0 7 L 0 -7 M -6 -1 L 0 -7 L 6 -1" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

// Caret blink: on during the first half of each 0.6 s (or always while typing).
export const blink = (t: number, period = 0.92) => t % period < period / 2;
export const mix = lerp;
