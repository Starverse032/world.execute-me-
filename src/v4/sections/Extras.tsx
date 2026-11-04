// v6: the two v5.1 additions that were kept (everything else from v5.1 is
// removed). Drawn inside the camera layer, in the scenes' screen coordinates.
//  0:00–0:16  power reaches the core and lights it · a test dot bounces off the
//             shield · each parameter changes the object (hair, flower, ribbon,
//             book, heart left empty) · the simulation gets a boundary
//  0:53–0:55  "travel": the past runs backwards across the stage side
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ease, K, lerp, prog, useT} from '../../v3/core';
import {hash} from '../chaos';
import {CODE} from '../fonts';
import {P2, r2} from '../shell/lib';
import {figAt, GLOBE, HC, HEX_R, PLUG_IN, PW_FIELDS} from './S0_geo';
import {T as T0} from './s0.data';
import {L as L1} from './s1.data';

const svgAt = {position: 'absolute' as const, left: 0, top: 0, overflow: 'visible' as const};

// ================================================================== 0:00–0:16
const Opening: React.FC<{t: number}> = ({t}) => {
  if (t > 15.0) return null;
  const els: React.ReactNode[] = [];
  // power: three sparks run up from the plug to the shield's centre, and the core lights
  for (let i = 0; i < 3; i++) {
    const p = prog(t, T0.click + i * 0.08, T0.click + 0.42 + i * 0.08, ease.inCubic);
    if (p > 0 && p < 1) els.push(<circle key={`p${i}`} cx={HC[0]} cy={r2(lerp(PLUG_IN[1], HC[1], p))} r={5 - i} fill={K.orange} />);
  }
  const lit = prog(t, T0.hex0 - 0.05, T0.hex0 + 0.05);
  const coreO = lit * (1 - prog(t, T0.pieces - 0.1, T0.pieces + 0.2));
  if (coreO > 0) {
    els.push(<circle key="core" cx={HC[0]} cy={HC[1]} r={14} fill={K.orange} opacity={coreO} />);
    const q = prog(t, T0.hex0, T0.hex0 + 0.5);
    if (q < 1) els.push(<circle key="coreR" cx={HC[0]} cy={HC[1]} r={r2(14 + 70 * ease.outCubic(q))} fill="none" stroke={K.orange} strokeWidth={2} opacity={1 - q} />);
  }
  // protection: a test dot comes in, touches the shield and is thrown back
  const D0: P2 = [1830, 160];
  const dir: P2 = [(D0[0] - HC[0]) / Math.hypot(D0[0] - HC[0], D0[1] - HC[1]), (D0[1] - HC[1]) / Math.hypot(D0[0] - HC[0], D0[1] - HC[1])];
  const hit: P2 = [HC[0] + dir[0] * (HEX_R * 0.9), HC[1] + dir[1] * (HEX_R * 0.9)];
  const tIn: [number, number] = [2.95, 3.3], tOut: [number, number] = [3.3, 3.75];
  if (t >= tIn[0] && t < tOut[1]) {
    const pin = prog(t, tIn[0], tIn[1], ease.inQuad);
    const pout = prog(t, tOut[0], tOut[1], ease.outCubic);
    const pos: P2 = t < tIn[1] ? [lerp(D0[0], hit[0], pin), lerp(D0[1], hit[1], pin)] : [lerp(hit[0], 1900, pout), lerp(hit[1], 360, pout)];
    els.push(<circle key="td" cx={r2(pos[0])} cy={r2(pos[1])} r={6} fill={K.cream} />);
    const f = prog(t, tIn[1], tIn[1] + 0.3);
    if (t >= tIn[1] && f < 1) els.push(<circle key="tf" cx={r2(hit[0])} cy={r2(hit[1])} r={r2(8 + 30 * f)} fill="none" stroke={K.orange} strokeWidth={2.5} opacity={1 - f} />);
  }
  // initialization: each field changes the object as it is filled in
  if (t >= PW_FIELDS[0].t) {
    const g = figAt(t);
    const o = 1 - prog(t, 14.6, 14.95);
    const on = (i: number) => prog(t, PW_FIELDS[i].t + 0.08, PW_FIELDS[i].t + 0.22);
    const {c, r} = g.head;
    const s = r / 56;
    // hair: the head gets an orange crown and two long strands
    if (on(0) > 0)
      els.push(
        <g key="hair" opacity={o * on(0)}>
          <path d={`M ${r2(c[0] - r)} ${r2(c[1])} A ${r2(r)} ${r2(r)} 0 0 1 ${r2(c[0] + r)} ${r2(c[1])}`} fill="none" stroke={K.orange} strokeWidth={r2(8 * s)} />
          <path d={`M ${r2(c[0] - r)} ${r2(c[1])} L ${r2(c[0] - r * 1.15)} ${r2(c[1] + r * 2.4)} M ${r2(c[0] + r)} ${r2(c[1])} L ${r2(c[0] + r * 1.15)} ${r2(c[1] + r * 2.4)}`} stroke={K.orange} strokeWidth={r2(5 * s)} />
        </g>,
      );
    // ornament: a flower on the head
    if (on(1) > 0) {
      const fc: P2 = [c[0] + r * 0.72, c[1] - r * 0.72];
      els.push(
        <g key="flower" opacity={o * on(1)}>
          {Array.from({length: 8}, (_, k) => (
            <circle key={k} cx={r2(fc[0] + Math.cos((k * Math.PI) / 4) * 12 * s)} cy={r2(fc[1] + Math.sin((k * Math.PI) / 4) * 12 * s)} r={r2(6 * s)} fill={K.orange} />
          ))}
          <circle cx={r2(fc[0])} cy={r2(fc[1])} r={r2(6 * s)} fill={K.cream} />
        </g>,
      );
    }
    // ribbon: a black bow below the head
    if (on(2) > 0) {
      const b: P2 = [c[0], c[1] + r * 1.25];
      els.push(<path key="bow" d={`M ${r2(b[0])} ${r2(b[1])} L ${r2(b[0] - 22 * s)} ${r2(b[1] - 12 * s)} L ${r2(b[0] - 22 * s)} ${r2(b[1] + 12 * s)} Z M ${r2(b[0])} ${r2(b[1])} L ${r2(b[0] + 22 * s)} ${r2(b[1] - 12 * s)} L ${r2(b[0] + 22 * s)} ${r2(b[1] + 12 * s)} Z`} fill={K.ink} stroke={K.cream} strokeWidth={1.5} opacity={o * on(2)} />);
    }
    // book: the square fills and becomes a book
    if (on(3) > 0) {
      const bk = g.book;
      els.push(<rect key="book" x={r2(bk.c[0] - bk.w / 2)} y={r2(bk.c[1] - bk.h / 2)} width={r2(bk.w)} height={r2(bk.h)} fill={K.orangeDeep} opacity={0.85 * o * on(3)} transform={`rotate(${bk.rot} ${r2(bk.c[0])} ${r2(bk.c[1])})`} />);
    }
    // heart: null — a place at her chest that stays unlit
    if (on(4) > 0) {
      const a = g.tri[0], m: P2 = [(g.tri[1][0] + g.tri[2][0]) / 2, (g.tri[1][1] + g.tri[2][1]) / 2];
      const h: P2 = [lerp(a[0], m[0], 0.24), lerp(a[1], m[1], 0.24)];
      els.push(<circle key="heart" cx={r2(h[0])} cy={r2(h[1])} r={r2(11 * s)} fill={K.bg} stroke={K.orange} strokeWidth={2} strokeDasharray="4 4" opacity={o * on(4)} />);
    }
  }
  // simulation: a boundary closes around the world it will live in
  if (t >= 13.0) {
    const p = prog(t, 13.0, T0.SIM, ease.inOutCubic);
    const o = 1 - prog(t, 14.6, 14.95);
    const x0 = GLOBE.c[0] - 330, y0 = GLOBE.c[1] - 290, w = 660, h = 560;
    const per = 2 * (w + h);
    els.push(<rect key="bound" x={x0} y={y0} width={w} height={h} fill="none" stroke={t >= T0.SIM && t < T0.SIM + 0.12 ? K.orange : K.cream} strokeOpacity={0.6} strokeWidth={2} strokeDasharray={`${r2(per * p)} ${per}`} opacity={o} />);
  }
  return <svg width={1} height={1} style={svgAt}>{els}</svg>;
};

// ================================================================== 0:51.4–0:55 travel: the past runs backwards
// v8: full screen. The particles are born where the dizzy polygons imploded
// (the centre), still turning; they straighten into streams running right to
// left in three depth layers (far: small and slow, near: long fast streaks),
// with pages and year ticks among them; the stream is fastest at the AD → BC
// hop, then slows and gathers into the timeline's marker by "And we can unite".
// The live lyric line in the conversation stays clear (particles fade there).
const TR = {t0: 51.3, hop: 54.61, end: L1.unite};
const BURST: P2 = [960, 540];
const MARK: P2 = [1440, 594]; // the timeline's "we are here" marker (S1_pre TLW + TL_MX, TL_AY)
const LYR = {x0: 40, x1: 940, y0: 680, y1: 870}; // the conversation's live line
const YEARS = ['2008', '1840', '1066', '476', '1 AD', '1 BC', '300 BC', '2008', '1492', '79'];
// the stream's travelled distance (px at depth 1): accelerating to the hop, then easing off
const dist = (t: number) => {
  const a = Math.max(0, t - 51.9);
  const b = Math.max(0, t - TR.hop);
  return 600 * a * a * 0.5 + 1400 * a - 900 * b * b;
};
const Travel: React.FC<{t: number}> = ({t}) => {
  if (t < TR.t0 || t > TR.end) return null;
  const o = prog(t, TR.t0, TR.t0 + 0.12) * (1 - prog(t, TR.end - 0.12, TR.end));
  const straight = prog(t, 51.6, 52.3, ease.inOutCubic); // burst → stream
  const gather = prog(t, 54.75, 55.05, ease.inCubic); // stream → the marker
  const els: React.ReactNode[] = [];
  const N = 96;
  for (let i = 0; i < N; i++) {
    const z = [0.35, 0.65, 1][i % 3];
    const kind = i % 11 === 0 ? 'page' : i % 9 === 4 ? 'year' : 'streak';
    // burst: out from the centre along a turning ray
    const a0 = 2 * Math.PI * hash(54, i) + 1.2 * (t - TR.t0);
    const rB = (60 + 1300 * z) * ease.outCubic(prog(t, TR.t0, TR.t0 + 1.1)) * (0.4 + 0.6 * hash(55, i));
    const pB: P2 = [BURST[0] + Math.cos(a0) * rB, BURST[1] + Math.sin(a0) * rB * 0.62];
    // stream: right → left, wrapping, its own lane
    const lane = 30 + 1020 * hash(51, i);
    const span = 2200;
    const xs = 2060 - ((((dist(t) * z + span * hash(53, i)) % span) + span) % span);
    const pS: P2 = [xs, lane];
    let p: P2 = [lerp(pB[0], pS[0], straight), lerp(pB[1], pS[1], straight)];
    p = [lerp(p[0], MARK[0], gather), lerp(p[1], MARK[1], gather)];
    // stay off the live lyric line
    const dx = Math.max(LYR.x0 - p[0], 0, p[0] - LYR.x1), dy = Math.max(LYR.y0 - p[1], 0, p[1] - LYR.y1);
    const clear = Math.min(1, Math.hypot(dx, dy) / 50);
    const op = o * clear * (0.25 + 0.55 * z) * (1 - 0.6 * gather);
    if (op <= 0.01) continue;
    const speed = straight * Math.min(1, (dist(t + 0.05) - dist(t)) / 60);
    const len = (8 + 150 * z * speed) * (1 - gather);
    if (kind === 'page') els.push(<rect key={i} x={r2(p[0])} y={r2(p[1] - 22 * z)} width={r2(30 * z + 6)} height={r2(40 * z + 8)} fill="none" stroke={K.cream} strokeWidth={1.5} opacity={op} />);
    else if (kind === 'year')
      els.push(
        <g key={i} opacity={op}>
          <path d={`M ${r2(p[0])} ${r2(p[1] - 10)} L ${r2(p[0])} ${r2(p[1] + 10)}`} stroke={K.cream} strokeWidth={1.5} />
          <text x={r2(p[0] + 6)} y={r2(p[1] + 26)} fontFamily={CODE} fontSize={13} fill={K.creamDim}>
            {YEARS[i % YEARS.length]}
          </text>
        </g>,
      );
    else els.push(<path key={i} d={`M ${r2(p[0])} ${r2(p[1])} L ${r2(p[0] + len)} ${r2(p[1])}`} stroke={i % 5 === 0 ? K.orange : K.cream} strokeWidth={0.8 + 1.8 * z} strokeLinecap="round" opacity={op} />);
  }
  return <svg width={1} height={1} style={svgAt}>{els}</svg>;
};


export const ExtrasV5: React.FC = () => {
  const {t} = useT();
  return (
    <AbsoluteFill>
      <Opening t={t} />
      <Travel t={t} />
    </AbsoluteFill>
  );
};
