// Section A shared helpers: time/geometry utilities, typed labels (with
// retyping), the moment-A style leader label, marching-ants boxes.
// Everything is a pure function of t.
import React from 'react';
import {beat, beatIndex, clamp01, CODE, ease, FPS, K, lerp, MATH, O, prog} from '../core';
import {Check, linePath, Plot, polyPath} from '../geo';

export const F = (f: number) => f / FPS; // frame → seconds
export const f1 = 1 / FPS;
export const r2 = (v: number) => Math.round(v * 100) / 100;
export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;
export const C = {x: 960, y: 390};
export type P2 = [number, number];

// Section range (frames, inclusive).
export const A_F0 = 1334;
export const A_F1 = 2657;
export const A_T0 = F(A_F0);

// 15° step per beat strictly after t0, each step eased over 6 frames (easeOutCubic).
export const beatSteps = (t: number, t0: number, deg = 15) => {
  const n0 = beatIndex(t0 + 1e-4) + 1;
  const n = beatIndex(t);
  if (n < n0) return 0;
  return deg * (n - n0) + deg * prog(t, beat(n), beat(n) + 6 / FPS, ease.outCubic);
};

// Time since the latest nominal beat at or before t (Infinity before beat 0).
export const sinceBeat = (t: number) => {
  const n = beatIndex(t);
  return n < 0 ? Infinity : t - beat(n);
};

// Marching ants: dash offset steps 6 px on every beat (3-frame ease).
export const antsOffset = (t: number, t0: number) => {
  const n0 = beatIndex(t0 + 1e-4) + 1;
  const n = beatIndex(t);
  if (n < n0) return 0;
  return -(6 * (n - n0) + 6 * prog(t, beat(n), beat(n) + 3 / FPS, ease.outCubic));
};

// ------------------------------------------------------------------ primitives
export const Ln: React.FC<{x1: number; y1: number; x2: number; y2: number; c?: string; w?: number; o?: number; dash?: string; cap?: 'round' | 'butt'}> = ({
  x1,
  y1,
  x2,
  y2,
  c = K.cream,
  w = 1.5,
  o = 1,
  dash,
  cap = 'round',
}) => (o <= 0 ? null : <path d={linePath(x1, y1, x2, y2)} stroke={c} strokeWidth={w} opacity={o} strokeDasharray={dash} strokeLinecap={cap} fill="none" />);

export const Path: React.FC<{d: string; c?: string; w?: number; o?: number; fill?: string; dash?: string; dashOff?: number}> = ({
  d,
  c = K.cream,
  w = 1.5,
  o = 1,
  fill = 'none',
  dash,
  dashOff,
}) =>
  o <= 0 ? null : (
    <path d={d} stroke={c} strokeWidth={w} opacity={o} fill={fill} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} strokeDashoffset={dashOff} />
  );

// Circular arc polyline from a0 to a1 (radians, screen space: 0 = 3 o'clock, + = clockwise).
export const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const n = Math.max(2, Math.ceil((Math.abs(a1 - a0) / TAU) * 128));
  const pts: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return polyPath(pts);
};

// Rectangle path, clockwise from the top-left corner.
export const rectPath = (x0: number, y0: number, x1: number, y1: number) =>
  polyPath(
    [
      [x0, y0],
      [x1, y0],
      [x1, y1],
      [x0, y1],
    ],
    true,
  );

// ------------------------------------------------------------------ text
export type Part = {s: string; font: string; size: number; color: string; italic?: boolean; shift?: number; op?: number; weight?: number};
export const math = (s: string, size: number, color: string = K.cream, shift?: number): Part => ({s, font: MATH, size, color, italic: true, shift});
export const mono = (s: string, size: number, color: string = K.creamDim, op?: number, shift?: number): Part => ({s, font: CODE, size, color, op, shift});

// Text that types in over `dur` from t0 and exits by lifting 14 px and fading
// over 5 frames from tOut. Untyped characters are kept (transparent) so end /
// middle anchors stay put.
export const Txt: React.FC<{
  t: number;
  t0: number;
  tOut?: number;
  x: number;
  y: number;
  parts: Part[];
  anchor?: 'start' | 'middle' | 'end';
  opacity?: number;
  dur?: number;
}> = ({t, t0, tOut = Infinity, x, y, parts, anchor = 'start', opacity = 1, dur = 5 / FPS}) => {
  if (t < t0) return null;
  const ex = clamp01((t - tOut) / (5 / FPS));
  const o = opacity * (1 - ex);
  if (o <= 0) return null;
  const total = parts.reduce((a, p) => a + Array.from(p.s).length, 0);
  let shown = Math.ceil(total * clamp01((t - t0 + 1 / FPS) / dur));
  return (
    <text x={r2(x)} y={r2(y - 14 * ex)} textAnchor={anchor} opacity={o} style={{whiteSpace: 'pre'}}>
      {parts.map((p, i) => {
        const ch = Array.from(p.s);
        const vis = Math.max(0, Math.min(ch.length, shown));
        shown -= vis;
        const style: React.CSSProperties = {
          fontFamily: p.font,
          fontSize: p.size,
          fontStyle: p.italic ? 'italic' : 'normal',
          fontWeight: p.weight,
          baselineShift: p.shift ? `${p.shift}px` : undefined,
        };
        return (
          <React.Fragment key={i}>
            {vis > 0 && (
              <tspan style={style} fill={p.color} fillOpacity={p.op ?? 1}>
                {ch.slice(0, vis).join('')}
              </tspan>
            )}
            {vis < ch.length && (
              <tspan style={style} fill={p.color} fillOpacity={0}>
                {ch.slice(vis).join('')}
              </tspan>
            )}
          </React.Fragment>
        );
      })}
    </text>
  );
};

// A label that retypes: each state replaces the previous one, keeping the
// common prefix and typing the rest over `dur`.
export const Retype: React.FC<{
  t: number;
  states: {t0: number; s: string}[];
  tOut?: number;
  x: number;
  y: number;
  part: (s: string) => Part;
  anchor?: 'start' | 'middle' | 'end';
  dur?: number;
}> = ({t, states, tOut, x, y, part, anchor = 'start', dur = 5 / FPS}) => {
  let i = -1;
  states.forEach((st, j) => {
    if (t >= st.t0) i = j;
  });
  if (i < 0) return null;
  const cur = states[i].s;
  let pre = 0;
  if (i > 0) {
    const prev = states[i - 1].s;
    while (pre < prev.length && pre < cur.length && prev[pre] === cur[pre]) pre++;
  }
  const rest = cur.length - pre;
  const n = pre + Math.ceil(rest * clamp01((t - states[i].t0 + 1 / FPS) / dur));
  const p = part(cur);
  // typed part visible, the rest transparent (anchors stay put)
  return <Txt t={t} t0={-1} tOut={tOut} x={x} y={y} anchor={anchor} parts={[{...p, s: cur.slice(0, n)}, {...p, s: cur.slice(n), op: 0}]} dur={1e-6} />;
};

// key = value label (mono 22): key cream 70 %, " = " creamDim, value cream; types in 5 frames.
export const kv = (key: string, val: string, size = 22): Part[] => [mono(key, size, K.cream, O.hi), mono(' = ', size, K.creamDim), mono(val, size, K.cream)];

// ------------------------------------------------------------------ moment-A leader
// Label (mono 22) with a 1 px cream-45 % leader: 40 px horizontal from the
// label, then straight to an orange node at `at`. The label types in 5 frames,
// an orange check is drawn 4 frames after it. Exit (tOut): checks first, then
// the leader and label retract into the node over `outDur`.
export const LeaderLabel: React.FC<{
  t: number;
  tb: number;
  tOut: number;
  side: 'R' | 'L';
  x: number; // R: label left edge; L: label right edge
  y: number; // baseline
  key_: string;
  val: string;
  at: P2;
  outDur?: number;
  nodePulse?: number; // extra node scale (0..1)
}> = ({t, tb, tOut, side, x, y, key_, val, at, outDur = 8 / FPS, nodePulse = 0}) => {
  if (t < tb) return null;
  const LFS = 22, LADV = 0.6 * LFS;
  const full = `${key_} = ${val}`;
  const out = prog(t, tOut, tOut + outDur, ease.inOutCubic);
  const typeIn = prog(t, tb, tb + 5 / FPS);
  const n = Math.round(full.length * Math.min(typeIn, 1 - out));
  const shown = full.slice(0, n);
  const tw = full.length * LADV;
  const midY = y - 7;
  const textX = side === 'R' ? x : x - tw; // L: right-aligned text ends at x, the check follows it
  const checkX = textX + tw + 12;
  const lx0 = side === 'R' ? x - 12 : checkX + 14 + 12;
  const lx1 = side === 'R' ? lx0 - 40 : lx0 + 40;
  const lead = polyPath([at, [lx1, midY], [lx0, midY]]);
  const lp = Math.min(prog(t, tb, tb + 5 / FPS, ease.inOutCubic), 1 - out);
  const ck = Math.min(prog(t, tb + 9 / FPS, tb + 12 / FPS), 1 - prog(t, tOut, tOut + 2 / FPS));
  const node = Math.min(prog(t, tb, tb + 3 / FPS, ease.outExpo), 1 - prog(t, tOut + outDur - 3 / FPS, tOut + outDur));
  const parts = [key_, ' = ', val];
  let used = 0;
  const spans = parts.map((s, i) => {
    const seg = shown.slice(used, used + s.length);
    used += s.length;
    const st = i === 0 ? {fill: K.cream, opacity: O.hi} : i === 1 ? {fill: K.creamDim} : {fill: K.cream};
    return seg ? (
      <tspan key={i} {...st}>
        {seg}
      </tspan>
    ) : null;
  });
  return (
    <g>
      <Plot d={lead} p={lp} color={K.cream} w={1} opacity={O.mid} t={t} pen={out === 0} />
      {node > 0 && (
        <circle cx={r2(at[0])} cy={r2(at[1])} r={r2(3.5 * node * (1 + 0.5 * nodePulse))} fill={K.orange} stroke={K.bg} strokeWidth={1.5} style={{paintOrder: 'stroke'}} />
      )}
      {shown && (
        <text x={r2(textX)} y={y} fontFamily={CODE} fontSize={LFS} style={{whiteSpace: 'pre'}}>
          {spans}
        </text>
      )}
      {ck > 0 && <Check x={checkX} y={y - 3} p={ck} />}
    </g>
  );
};

// Linear interpolation of points.
export const lp2 = (a: P2, b: P2, p: number): P2 => [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
