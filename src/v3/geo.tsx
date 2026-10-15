// Vector primitives shared by every shot: plotted strokes with a pen head,
// path builders, the Claude spark, and drawn glyphs (●, ⎿, ✓, arrowheads).
import React from 'react';
import {cutPath, getLength, getPointAtLength} from '@remotion/paths';
import {K, pulse} from './core';

// ------------------------------------------------------------------ path builders
const n = (v: number) => Math.round(v * 100) / 100;

export const linePath = (x1: number, y1: number, x2: number, y2: number) => `M ${n(x1)} ${n(y1)} L ${n(x2)} ${n(y2)}`;

export const polyPath = (pts: [number, number][], closed = false) =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${n(x)} ${n(y)}`).join(' ') + (closed ? ` L ${n(pts[0][0])} ${n(pts[0][1])}` : '');

// Circle as two arcs, starting at angle a0 (degrees, 0 = 3 o'clock, −90 = 12 o'clock), clockwise.
export const circlePath = (cx: number, cy: number, r: number, a0 = -90) => {
  const a = (a0 * Math.PI) / 180;
  const x0 = cx + r * Math.cos(a), y0 = cy + r * Math.sin(a);
  const x1 = cx - r * Math.cos(a), y1 = cy - r * Math.sin(a);
  return `M ${n(x0)} ${n(y0)} A ${n(r)} ${n(r)} 0 0 1 ${n(x1)} ${n(y1)} A ${n(r)} ${n(r)} 0 0 1 ${n(x0)} ${n(y0)}`;
};

// Ellipse (rotated by rot degrees) sampled as a polyline, starting at its top, clockwise.
export const ellipsePath = (cx: number, cy: number, rx: number, ry: number, rot = 0, samples = 96) => {
  const r = (rot * Math.PI) / 180;
  const pts: [number, number][] = [];
  for (let i = 0; i <= samples; i++) {
    const a = -Math.PI / 2 + (i / samples) * Math.PI * 2;
    const x = rx * Math.cos(a), y = ry * Math.sin(a);
    pts.push([cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]);
  }
  return polyPath(pts);
};

// Regular polygon, pointy-top, starting at the top vertex, clockwise.
export const ngonPath = (cx: number, cy: number, R: number, sides = 6, rotDeg = 0) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < sides; i++) {
    const a = ((-90 + rotDeg + (360 / sides) * i) * Math.PI) / 180;
    pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
  }
  return polyPath(pts, true);
};

// Rounded rect starting at the top-left corner's end, clockwise.
export const roundRectPath = (x: number, y: number, w: number, h: number, r: number) =>
  `M ${n(x + r)} ${n(y)} L ${n(x + w - r)} ${n(y)} A ${r} ${r} 0 0 1 ${n(x + w)} ${n(y + r)} L ${n(x + w)} ${n(y + h - r)} A ${r} ${r} 0 0 1 ${n(x + w - r)} ${n(y + h)} L ${n(x + r)} ${n(y + h)} A ${r} ${r} 0 0 1 ${n(x)} ${n(y + h - r)} L ${n(x)} ${n(y + r)} A ${r} ${r} 0 0 1 ${n(x + r)} ${n(y)}`;

// Sample a function y = f(x) over [x0, x1] as a polyline.
export const fnPath = (f: (x: number) => number, x0: number, x1: number, samples = 200) => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= samples; i++) {
    const x = x0 + ((x1 - x0) * i) / samples;
    pts.push([x, f(x)]);
  }
  return polyPath(pts);
};

// ------------------------------------------------------------------ length cache
const lenCache = new Map<string, number>();
export const pathLen = (d: string) => {
  let L = lenCache.get(d);
  if (L === undefined) {
    L = getLength(d);
    if (lenCache.size > 4000) lenCache.clear();
    lenCache.set(d, L);
  }
  return L;
};
export const pointAt = (d: string, p: number) => getPointAtLength(d, Math.max(0, Math.min(1, p)) * pathLen(d));

// ------------------------------------------------------------------ pen head
// Orange dot r=4 plus a 1 px orange ring r=9 at 45 %; pulses on beats.
export const PenHead: React.FC<{x: number; y: number; t?: number; opacity?: number; scale?: number}> = ({x, y, t, opacity = 1, scale = 1}) => {
  const s = scale * (t === undefined ? 1 : 1 + 0.5 * pulse(t));
  return (
    <g transform={`translate(${n(x)} ${n(y)}) scale(${n(s)})`} opacity={opacity}>
      <circle r={9} fill="none" stroke={K.orange} strokeWidth={1 / s} opacity={0.45} />
      <circle r={4} fill={K.orange} />
    </g>
  );
};

// ------------------------------------------------------------------ plotted stroke
// Draws path d from its start up to progress p (0..1). While 0 < p < 1 a pen
// head sits at the tip. For an un-plot, pass a decreasing p.
export const Plot: React.FC<{
  d: string;
  p?: number;
  color?: string;
  w?: number;
  opacity?: number;
  dash?: string;
  pen?: boolean;
  t?: number; // for the pen head's beat pulse
  fill?: string;
  cap?: 'round' | 'butt' | 'square';
}> = ({d, p = 1, color = K.cream, w = 1.5, opacity = 1, dash, pen = true, t, fill = 'none', cap = 'round'}) => {
  if (p <= 0 || opacity <= 0) return null;
  const full = p >= 1;
  const L = pathLen(d);
  let dd = d;
  let style: React.SVGProps<SVGPathElement> = {};
  if (!full) {
    if (dash) dd = cutPath(d, L * p);
    else style = {strokeDasharray: `${L} ${L}`, strokeDashoffset: L * (1 - p)};
  }
  // no pen head until ~3 px of the stroke exists (avoids one-frame loose dots)
  const tip = !full && pen && L * p >= 3 ? getPointAtLength(d, L * p) : null;
  return (
    <>
      <path d={dd} fill={full ? fill : 'none'} stroke={color} strokeWidth={w} opacity={opacity} strokeDasharray={dash} strokeLinecap={cap} strokeLinejoin="round" {...style} />
      {tip && <PenHead x={tip.x} y={tip.y} t={t} opacity={opacity > 0.5 ? 1 : opacity * 2} />}
    </>
  );
};

// ------------------------------------------------------------------ Claude spark
const JIT = [0, 4, -3, 2, -4, 3, 0, -2, 4, -3, 2, -1];
const LEN = [1.0, 0.8, 0.95, 0.76, 0.98, 0.84, 0.93, 0.78, 1.0, 0.82, 0.96, 0.79];

const rayPath = (R: number, a: number, len: number) => {
  const r0 = 0.1 * R, w0 = 0.075 * R, w1 = 0.025 * R;
  const c = Math.cos(a), s = Math.sin(a), px = -s, py = c;
  const tip = Math.max(r0 + w1, len);
  const b1 = [r0 * c + px * w0, r0 * s + py * w0];
  const b2 = [r0 * c - px * w0, r0 * s - py * w0];
  const t1 = [(tip - w1) * c + px * w1, (tip - w1) * s + py * w1];
  const t2 = [(tip - w1) * c - px * w1, (tip - w1) * s - py * w1];
  return `M ${n(b1[0])} ${n(b1[1])} L ${n(t1[0])} ${n(t1[1])} A ${n(w1)} ${n(w1)} 0 0 0 ${n(t2[0])} ${n(t2[1])} L ${n(b2[0])} ${n(b2[1])} Z`;
};

// 12 tapered rays plus a hub. rays: how many rays are shown (fractional = the
// last one is growing); grow: 0..1 length factor for all rays (bloom).
export const Spark: React.FC<{
  x: number;
  y: number;
  R: number;
  rot?: number;
  rays?: number;
  grow?: number;
  hub?: number; // 0..1 hub scale
  outline?: boolean;
  color?: string;
  opacity?: number;
  w?: number;
}> = ({x, y, R, rot = 0, rays = 12, grow = 1, hub = 1, outline = false, color = K.orange, opacity = 1, w = 1.5}) => {
  if (opacity <= 0 || R <= 0) return null;
  const paths: string[] = [];
  for (let i = 0; i < 12; i++) {
    const vis = Math.max(0, Math.min(1, rays - i));
    if (vis <= 0) continue;
    const a = ((-90 + 30 * i + JIT[i]) * Math.PI) / 180;
    paths.push(rayPath(R, a, R * LEN[i] * vis * grow));
  }
  const paint = outline ? {fill: 'none', stroke: color, strokeWidth: w} : {fill: color};
  return (
    <g transform={`translate(${n(x)} ${n(y)}) rotate(${n(rot)})`} opacity={opacity}>
      {paths.map((d, i) => (
        <path key={i} d={d} {...paint} strokeLinejoin="round" />
      ))}
      {hub > 0 && <circle r={0.14 * R * hub} {...paint} />}
    </g>
  );
};

// ------------------------------------------------------------------ drawn glyphs
export const Bullet: React.FC<{x: number; y: number; color: string; s?: number}> = ({x, y, color, s = 1}) => <circle cx={x} cy={y} r={5 * s} fill={color} />;

// ⎿ as an L-bracket, 12 × 12, plotted by p.
export const Elbow: React.FC<{x: number; y: number; p?: number; color?: string}> = ({x, y, p = 1, color = K.creamDim}) => (
  <Plot d={`M ${x} ${y - 12} L ${x} ${y} L ${x + 12} ${y}`} p={p} color={color} w={1.5} pen={false} cap="butt" />
);

// ✓ as a 14 × 10 polyline.
export const Check: React.FC<{x: number; y: number; p?: number; color?: string; w?: number}> = ({x, y, p = 1, color = K.orange, w = 2}) => (
  <Plot d={`M ${x} ${y - 4} L ${x + 5} ${y + 1} L ${x + 14} ${y - 9}`} p={p} color={color} w={w} pen={false} />
);

// Open-V arrowhead pointing along angle (degrees, 0 = right) with its tip at (x, y).
export const Arrow: React.FC<{x: number; y: number; angle: number; size?: number; color?: string; w?: number; opacity?: number}> = ({
  x,
  y,
  angle,
  size = 10,
  color = K.cream,
  w = 1.5,
  opacity = 1,
}) => {
  const a = (angle * Math.PI) / 180;
  const l = a + Math.PI - 0.5, r = a + Math.PI + 0.5;
  return (
    <path
      d={`M ${n(x + size * Math.cos(l))} ${n(y + size * Math.sin(l))} L ${n(x)} ${n(y)} L ${n(x + size * Math.cos(r))} ${n(y + size * Math.sin(r))}`}
      fill="none"
      stroke={color}
      strokeWidth={w}
      opacity={opacity}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};

// Full-frame SVG layer.
export const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>
    {children}
  </svg>
);
