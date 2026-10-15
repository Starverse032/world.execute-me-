// <Status> (spinner line) and <Header> (top bar). docs/design_v4.md §3.7.
import React from 'react';
import {clamp01, FPS, K, useT} from '../../v3/core';
import {Spark} from '../../v3/geo';
import {anomaly, band, corrupt, hash, stepJ} from '../chaos';
import {CODE} from '../fonts';
import {P2, r2} from './lib';

export type Verb = {t: number; verb: string; done?: boolean};

// Claude's spark in a status line at (x, y) — the tether's Claude end.
export const statusSpark = (x: number, y: number): P2 => [x + 18, y];

export const elapsedStr = (sec: number) => {
  sec = Math.max(0, Math.floor(sec));
  return sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}m ${sec % 60}s`;
};
const tokStr = (n: number) => (n < 1000 ? `${Math.round(n)}` : `${(n / 1000).toFixed(1)}k`);
const corruptDigits = (s: string, t: number, amt: number, seed: number) => {
  const c = corrupt(s, t, amt, seed);
  // only digits may change
  return s
    .split('')
    .map((ch, i) => (/[0-9]/.test(ch) ? c[i] : ch))
    .join('');
};

// x = left edge, y = vertical centre of the line. The spark sits at (x+18, y).
export const Status: React.FC<{
  x: number;
  y: number;
  verbs: Verb[];
  t0: number; // elapsed counts from here; the line fades in over 5 frames
  t1?: number; // fades out over 5 frames
  a?: number;
  tokens?: (t: number) => number; // default ≈ 40 tokens/s + 380
  size?: number; // default 18
  opacity?: number;
  seed?: number;
}> = ({x, y, verbs, t0, t1, a: aProp, tokens, size = 18, opacity = 1, seed = 9}) => {
  const {t} = useT();
  if (t < t0 || !verbs.length) return null;
  const a = aProp ?? anomaly(t);
  const o = opacity * clamp01((t - t0) * FPS / 5) * (t1 !== undefined ? 1 - clamp01((t - t1) * FPS / 5) : 1);
  if (o <= 0) return null;
  let vi = 0;
  verbs.forEach((v, i) => {
    if (t >= v.t) vi = i;
  });
  const v = verbs[vi];
  const by = y + size * 0.36;
  if (v.done && t >= v.t) {
    return (
      <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: o}}>
        <Spark x={x + 18} y={y} R={11} color={K.creamDim} />
        <text x={x + 40} y={by} fontFamily={CODE} fontSize={size} fill={K.creamDim}>
          {v.verb}
        </text>
      </svg>
    );
  }
  // verb: types in over 4 frames when it changes; flickers at a > 0.7
  let verb = v.verb;
  const fl = band(a, 0.7, 0.75);
  if (fl > 0 && Math.floor(t * FPS / 3) % 2 === 1 && hash(seed, Math.floor(t * 10)) < fl) {
    const alt = verbs[(vi + verbs.length - 1) % verbs.length];
    verb = alt.verb;
  }
  const vf = (t - Math.max(v.t, t0)) * FPS;
  const vn = vf < 4 ? Math.ceil((verb.length * Math.max(0, vf + 1)) / 5) : verb.length;
  let el = t - t0;
  const jb = band(a, 0.3, 0.4);
  if (jb > 0) el += Math.abs(stepJ(t, seed, 40 * a * jb, 3));
  const tok = tokens ? tokens(t) : 380 + 41 * (t - t0);
  let meta = ` (${elapsedStr(el)} · ↑ ${tokStr(tok)} tokens · esc to interrupt)`;
  if (jb > 0) meta = corruptDigits(meta, t, 0.5 * a * jb, seed + 1);
  return (
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: o}}>
      <Spark x={x + 18} y={y} R={11} rot={(t - t0) * 120} />
      <text x={x + 40} y={by} fontFamily={CODE} fontSize={size} xmlSpace="preserve">
        <tspan fill={K.orange}>{verb.slice(0, vn) + (vn >= verb.length ? '…' : '')}</tspan>
        <tspan fill={K.creamDim}>{meta}</tspan>
      </text>
    </svg>
  );
};

// ------------------------------------------------------------------ header
// 12-hour clock string from seconds since midnight: 11:59:07 AM.
export const clockStr = (sec: number) => {
  const s = ((Math.floor(sec) % 86400) + 86400) % 86400;
  const h24 = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`;
};

// Top bar, y = 0..44, full width (or w). Left: spark, `claude`, path.
// Right: model · clock.
export const Header: React.FC<{
  path?: string;
  model?: string;
  clock?: string;
  a?: number;
  t0?: number; // hairline plots left→right over 12 frames, text types in
  t1?: number; // fades out over 6 frames
  x?: number;
  y?: number;
  w?: number;
  opacity?: number;
  seed?: number;
}> = ({path = '~/world', model = 'claude-opus', clock = '', a: aProp, t0, t1, x = 0, y = 0, w = 1920, opacity = 1, seed = 11}) => {
  const {t} = useT();
  if (t0 !== undefined && t < t0) return null;
  const a = aProp ?? anomaly(t);
  const p = t0 !== undefined ? clamp01((t - t0) * FPS / 12) : 1;
  const o = opacity * (t1 !== undefined ? 1 - clamp01((t - t1) * FPS / 6) : 1);
  if (o <= 0) return null;
  const amt = a > 0.3 ? 0.3 * a * band(a, 0.3, 0.5) : 0;
  const ty = y + 28;
  const typ = (s: string) => s.slice(0, Math.floor(p * s.length + 1e-6));
  const pathS = amt ? corrupt(path, t, amt, seed) : path;
  const clockS = amt ? corruptDigits(clock, t, amt * 1.5, seed + 1) : clock;
  const jx = a > 0.5 ? stepJ(t, seed, 4 * band(a, 0.5, 0.7), 8) : 0;
  return (
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: o}}>
      <path d={`M ${x} ${y + 44} L ${r2(x + w * p)} ${y + 44}`} stroke={K.cream} strokeOpacity={0.25} strokeWidth={1} />
      <g transform={jx ? `translate(${r2(jx)} 0)` : undefined} opacity={p}>
        <Spark x={x + 36} y={y + 22} R={10} rot={t * 30} />
        <text x={x + 58} y={ty} fontFamily={CODE} fontSize={17} xmlSpace="preserve">
          <tspan fill={K.cream} fillOpacity={0.7}>
            {typ('claude')}
          </tspan>
          <tspan fill={K.cream} fillOpacity={0.45}>
            {'  ' + typ(pathS)}
          </tspan>
        </text>
        <text x={x + w - 36} y={ty} textAnchor="end" fontFamily={CODE} fontSize={17} xmlSpace="preserve">
          <tspan fill={K.creamDim}>{typ(model)}</tspan>
          {clock && <tspan fill={K.creamDim} fillOpacity={0.6}>{'  ·  '}</tspan>}
          {clock && <tspan fill={K.cream} fillOpacity={0.7}>{typ(clockS)}</tspan>}
        </text>
      </g>
    </svg>
  );
};
