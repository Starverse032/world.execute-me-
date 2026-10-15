// Section B, shots B5–B8 (103.49–118.40 s): the six strings (VIBRATIONS), the
// progress ring (COMPLETION), the wheel whose nodes leave one by one ("You have
// left"), and character moment 5 (pose `sit`, ISOLATION).
// Spec: docs/design_B.md B.1 shots B5–B8, B.2 moment 5.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {beat, CODE, ease, FPS, K, lerp, O, prog} from '../core';
import {PenHead} from '../geo';
import {ArcStroke, beatEnv, C, dPoly, F, polar, Pt, r2, Seg} from './B_util';

const f6 = 6 / FPS;

// ------------------------------------------------------------------ B5–B6: strings
const SY = [240, 300, 360, 420, 480, 540];
const SX0 = 360, SX1 = 1560;
const PLOT_T = [beat(225), beat(224.5), beat(224), beat(224), beat(224.5), beat(225)];
const ALL = [0, 1, 2, 3, 4, 5];
const HIT5 = F(3189); // VIBRATIONS
const KW5_GONE = 107.02 + 6 / FPS; // keyword fully gone (107.22)
const PLUCKS: {t: number; s: number[]; A0: number}[] = [
  {t: beat(226), s: [2], A0: 14},
  {t: beat(227), s: [3], A0: 14},
  {t: beat(228), s: [1, 4], A0: 14},
  {t: beat(229), s: [0, 5], A0: 14},
  {t: HIT5, s: ALL, A0: 18},
  {t: beat(231), s: ALL, A0: 8},
];
const POSTS_T = beat(224); // 103.536
const DAMP = beat(232); // 107.228: strings damp and un-plot
const DAMP_B = DAMP + 8 / FPS; // 107.495

const lastPluck = (i: number, t: number) => {
  let r: {t: number; A0: number} | null = null;
  for (const p of PLUCKS) if (p.s.includes(i) && t >= p.t) r = p;
  return r;
};
const amp = (i: number, t: number) => {
  const p = lastPluck(i, t);
  if (!p) return {A: 0, tp: 0};
  let A = p.A0 * Math.exp(-(t - p.t) / 0.6);
  if (t > DAMP) A *= Math.exp(-(t - DAMP) / 0.1);
  return {A, tp: p.t};
};
const disp = (i: number, x: number, t: number, A: number, tp: number) =>
  A * Math.sin((i + 1) * Math.PI * ((x - SX0) / (SX1 - SX0))) * Math.sin(2 * Math.PI * 5 * (t - tp));

const Strings: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < POSTS_T || t > DAMP_B + 0.05) return null;
  const un = prog(t, DAMP, DAMP_B, ease.inOutCubic);
  const xa = lerp(SX0, 960, un), xb = lerp(SX1, 960, un);
  const postP = prog(t, POSTS_T, POSTS_T + 8 / FPS, ease.inOutCubic);
  const postH = 180 * postP * (1 - un);
  const out: React.ReactNode[] = [];
  // posts, plotted from y 390 outward and un-plotted back to it
  for (const x of [SX0, SX1]) {
    if (postH <= 0) continue;
    const moving = postP < 1 || un > 0;
    out.push(<Seg key={`pu${x}`} a={[x, 390]} b={[x, 390 - postH]} w={1.5} opacity={O.hi} pen={false} />);
    out.push(<Seg key={`pd${x}`} a={[x, 390]} b={[x, 390 + postH]} w={1.5} opacity={O.hi} pen={false} />);
    if (moving) {
      out.push(<PenHead key={`ph1${x}`} x={x} y={390 - postH} t={t} />);
      out.push(<PenHead key={`ph2${x}`} x={x} y={390 + postH} t={t} />);
    }
  }
  const hitF = frame - 3189;
  ALL.forEach((i) => {
    const y = SY[i];
    const p = prog(t, PLOT_T[i], PLOT_T[i] + 15 / FPS, ease.inOutCubic);
    if (p <= 0) return;
    // style: before the hit 1.5 px cream while ringing (A > 4); after it 1 px cream 70 %
    // (45 % for the four middle strings while the keyword is up)
    const {A, tp} = amp(i, t);
    let w = 1, o: number = O.hi;
    if (frame < 3189) {
      if (A > 4) (w = 1.5), (o = 1);
    } else if (t < KW5_GONE && i >= 1 && i <= 4) o = O.mid;
    const flashO = hitF >= 0 && hitF < 3 ? 1 : hitF >= 3 && hitF < 9 ? 1 - (hitF - 2) / 7 : 0;
    if (p < 1) {
      // plotting from x 960 outward, two pens
      const L = 600 * p;
      out.push(<Seg key={`sl${i}`} a={[960, y]} b={[960 - L, y]} w={w} opacity={o} t={t} />);
      out.push(<Seg key={`sr${i}`} a={[960, y]} b={[960 + L, y]} w={w} opacity={o} t={t} />);
      return;
    }
    const pts: Pt[] = [];
    const n = 200;
    for (let k = 0; k <= n; k++) {
      const x = xa + ((xb - xa) * k) / n;
      pts.push([x, y + disp(i, x, t, A, tp)]);
    }
    const d = dPoly(pts);
    if (hitF < 0 || hitF >= 3) out.push(<path key={`s${i}`} d={d} fill="none" stroke={K.cream} strokeWidth={w} opacity={o} strokeLinejoin="round" />);
    if (flashO > 0) out.push(<path key={`so${i}`} d={d} fill="none" stroke={K.orange} strokeWidth={hitF < 3 ? 2 : lerp(2, 1, (hitF - 2) / 7)} opacity={r2(flashO)} strokeLinejoin="round" />);
    if (un > 0 && un < 1) {
      out.push(<PenHead key={`pa${i}`} x={pts[0][0]} y={pts[0][1]} t={t} />);
      out.push(<PenHead key={`pb${i}`} x={pts[n][0]} y={pts[n][1]} t={t} />);
    }
  });
  // pluck markers: an orange dot at the first antinode, fading over 8 frames
  PLUCKS.forEach((pk, j) => {
    const x8 = (t - pk.t) / (8 / FPS);
    if (x8 < 0 || x8 >= 1) return;
    pk.s.forEach((i) => {
      const x = SX0 + 600 / (i + 1);
      const {A, tp} = amp(i, t);
      out.push(<circle key={`pk${j}_${i}`} cx={r2(x)} cy={r2(SY[i] + disp(i, x, t, A, tp))} r={4} fill={K.orange} opacity={r2(1 - x8)} />);
    });
  });
  return <g>{out}</g>;
};

// ------------------------------------------------------------------ B6–B8: ring, nodes, wheel
const HAND_T = beat(233); // 107.689
const RING_A = 107.82;
const HIT6 = F(3307); // COMPLETION
const TICK_B = [234, 235, 236, 237, 238].map(beat);
const ringP = (t: number) => ease.inQuad(prog(t, RING_A, HIT6));
const penA = (t: number) => -90 + 360 * ringP(t);
const WHEEL_T = beat(240); // 110.920
const DEPART: {t: number; k: number}[] = [
  {t: 110.9, k: 4},
  {t: 112.22, k: 1},
  {t: 113.1, k: 5},
  {t: 114.18, k: 2},
  {t: 114.92, k: 3},
  {t: 115.78, k: 0},
];
export const DRIFT = {a: 113.1, b: 115.9, to: [1640, 300] as Pt};
export const seedPos = (t: number): Pt => {
  const q = prog(t, DRIFT.a, DRIFT.b, ease.inOutSine); // peak ~383 px/s (inOutCubic would be ~730)
  return [lerp(C.x, DRIFT.to[0], q), lerp(C.y, DRIFT.to[1], q)];
};
// wheel rotation: −6°/s from 110.92, easing linearly to a stop over 113.10–113.40 (−13.98°)
const psi = (t: number) => {
  if (t < WHEEL_T) return 0;
  if (t < 113.1) return -6 * (t - WHEEL_T);
  const x = Math.min(t, 113.4) - 113.1;
  return -6 * (113.1 - WHEEL_T) - 6 * (x - (x * x) / 0.6);
};
const depart = (k: number, t: number) => {
  const d = DEPART.find((e) => e.k === k)!;
  return prog(t, d.t, d.t + 0.5, ease.inOutSine); // 120 px: peak ~377 px/s
};

const Wheel: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < HAND_T || t > 116.35) return null;
  const hf = frame - 3307;
  const out: React.ReactNode[] = [];
  const ps = psi(t);
  // --- the ring
  if (t < 110.9) {
    const p = ringP(t);
    const flash = hf >= 0 && hf < 3;
    const o = hf < 3 ? 1 : lerp(1, O.hi, prog(t, F(3310), F(3316)));
    if (p > 0) {
      out.push(<ArcStroke key="ring" cx={C.x} cy={C.y} r={230} a0={-90} sweep={360} p={p} w={flash ? 2 : 1.5} color={flash ? K.orange : K.cream} opacity={o} pen={false} />);
      if (hf >= 3 && hf < 9) out.push(<ArcStroke key="ringO" cx={C.x} cy={C.y} r={230} a0={-90} sweep={360} p={1} w={lerp(2, 1.5, (hf - 2) / 7)} color={K.orange} opacity={1 - (hf - 2) / 7} pen={false} />);
      if (p < 1) {
        const [px, py] = polar(C.x, C.y, 230, penA(t));
        out.push(<PenHead key="pen" x={px} y={py} scale={1 + 0.8 * beatEnv(t, 234, 238)} />);
      }
    }
  } else {
    const ro = lerp(O.hi, O.mid, prog(t, WHEEL_T, WHEEL_T + f6));
    const rw = lerp(1.5, 1, prog(t, WHEEL_T, WHEEL_T + f6));
    for (let k = 0; k < 6; k++) {
      const p = 1 - depart(k, t);
      out.push(<ArcStroke key={`arc${k}`} cx={C.x} cy={C.y} r={230} a0={-90 + 60 * k + ps} sweep={60} p={p} w={rw} opacity={ro} t={t} pen={p < 1} />);
    }
  }
  // --- hand (radius line) and readout during the ring plot
  if (t < HIT6 + 8 / FPS) {
    const un = prog(t, HIT6, HIT6 + f6, ease.inOutCubic);
    const hp = Math.min(prog(t, HAND_T, HAND_T + 4 / FPS, ease.inOutCubic), 1 - un);
    const a = t < RING_A ? -90 : penA(t);
    out.push(<Seg key="hand" a={[C.x, C.y]} b={polar(C.x, C.y, 230, a)} p={hp} w={1} opacity={O.mid} t={t} pen={t < RING_A && hp < 1} />);
    // beat ticks left on the ring
    TICK_B.forEach((tb, j) => {
      if (t < tb) return;
      const ta = penA(tb);
      out.push(<Seg key={`tk${j}`} a={polar(C.x, C.y, 238, ta)} b={polar(C.x, C.y, 222, ta)} p={1 - un} w={1} opacity={O.hi} pen={false} cap="butt" />);
    });
  }
  if (t >= RING_A && t < HIT6 + 10 / FPS) {
    const p = ringP(t);
    const [rx, ry] = polar(C.x, C.y, 258, penA(t));
    const done = hf >= 0;
    const ro = !done ? 1 : hf < 3 ? 1 : 1 - (hf - 2) / 6;
    const txt = done ? '100%' : `${String(Math.floor(100 * p)).padStart(3, '0')}%`;
    if (ro > 0)
      out.push(
        <text key="pct" x={r2(rx)} y={r2(ry + 6)} textAnchor="middle" fontFamily={CODE} fontSize={16} fill={done && hf < 3 ? K.orange : K.creamDim} opacity={r2(ro)}>
          {txt}
        </text>,
      );
  }
  // --- the six "you" nodes and their spokes
  if (hf >= 0) {
    const sIn = ease.outExpo(Math.min(1, hf / 6));
    const spokeP = prog(t, HIT6, HIT6 + f6, ease.inOutCubic);
    const pulseR = 1 + 0.25 * beatEnv(t, 239, 255);
    const seed = seedPos(t);
    for (let k = 0; k < 6; k++) {
      const dp = t >= 110.9 ? depart(k, t) : 0;
      if (dp >= 1) continue;
      const [nx, ny] = polar(C.x, C.y, 230 + 120 * dp, -90 + 60 * k + ps);
      const rN = 12 * sIn * pulseR;
      // spoke: seed (14 px out) to the node's edge; un-plots from the node end toward the seed
      const dx = nx - seed[0], dy = ny - seed[1];
      const L = Math.hypot(dx, dy);
      const ux = dx / L, uy = dy / L;
      const a: Pt = [seed[0] + 14 * ux, seed[1] + 14 * uy];
      const b: Pt = [nx - 12 * ux, ny - 12 * uy];
      out.push(<Seg key={`sp${k}`} a={a} b={b} p={Math.min(spokeP, 1 - dp)} w={1} opacity={O.mid} t={t} pen={dp > 0} />);
      out.push(<ArcStroke key={`nd${k}`} cx={nx} cy={ny} r={rN} a0={-90} sweep={360} p={1 - dp} w={1.5} pen={false} />);
    }
  }
  return <g>{out}</g>;
};

// ------------------------------------------------------------------ B8: moment 5 (pose `sit`)
// Box x 1520–1760, y 300–660 (2:3 art), right of the ISOLATION glyphs (x ≤ 1500).
export const SIT = {x: 1520, y: 300, w: 240, h: 360};
const SCAN_A = beat(251); // 115.997 (f3480)
const SCAN_M = beat(252); // 116.459 (f3494)
const HIT8 = F(3518); // ISOLATION
const CUT8 = 3549; // b256: fills cut out
const GONE8 = 3552; // line art gone (shards take over)

const scanY = (t: number) => (t < SCAN_M ? lerp(300, 660, prog(t, SCAN_A, SCAN_M)) : lerp(660, 300, prog(t, SCAN_M, HIT8)));

// Her art plus the scan line, readout and the closing dot (all undimmed).
export const MomentSit: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < SCAN_A - 0.1 || frame >= GONE8) return null;
  const y = scanY(t);
  let linesBot: number = SIT.h; // px clipped from the bottom
  let flatTop: number = SIT.h; // px clipped from the top
  if (t >= SCAN_A && t < SCAN_M) linesBot = 660 - y;
  else if (t >= SCAN_M) {
    linesBot = 0;
    flatTop = frame >= 3518 ? 0 : y - 300;
  }
  const flatOn = t >= SCAN_M && frame < CUT8;
  const linesO = frame < CUT8 ? 1 : 1 - (frame - CUT8) / (GONE8 - CUT8);
  const grow = prog(t, SCAN_A, SCAN_A + 4 / FPS, ease.outExpo);
  const shrink = frame < 3518 ? 0 : Math.min(1, (frame - 3518) / 4);
  const half = 145 * grow * (1 - shrink);
  const showLine = t >= SCAN_A && frame < 3522;
  const dotS = frame < 3518 ? 0 : frame < 3522 ? 1 : Math.max(0, 1 - (frame - 3522) / 6);
  const img: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: '100%', height: '100%'};
  return (
    <>
      <div style={{position: 'absolute', left: SIT.x, top: SIT.y, width: SIT.w, height: SIT.h}}>
        <Img src={staticFile('char/sit_flat.png')} style={{...img, clipPath: `inset(${r2(Math.max(0, flatTop))}px 0 0 0)`, opacity: flatOn && flatTop < SIT.h ? 1 : 0}} />
        <Img src={staticFile('char/sit_lines.png')} style={{...img, clipPath: `inset(0 0 ${r2(Math.max(0, linesBot))}px 0)`, opacity: linesBot >= SIT.h ? 0 : linesO}} />
      </div>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {showLine && half > 0.5 && (
          <>
            <path d={`M${r2(1640 - half)} ${r2(y)}L${r2(1640 + half)} ${r2(y)}`} stroke={K.orange} strokeWidth={2} />
            {frame < 3518 && (
              <text x={1487} y={r2(y + 5)} textAnchor="end" fontFamily={CODE} fontSize={16} fill={K.creamDim} opacity={grow}>
                {`y ${String(Math.round(y)).padStart(4, '0')}`}
              </text>
            )}
          </>
        )}
        {dotS > 0 && <PenHead x={1640} y={300} t={t} scale={dotS} />}
      </svg>
    </>
  );
};

// ------------------------------------------------------------------ export (stage geometry)
export const CHORUS_A = POSTS_T - 0.05;
export const CHORUS_B = 116.4;
export const Chorus: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < CHORUS_A || t > CHORUS_B) return null;
  return (
    <g>
      <Strings t={t} frame={frame} />
      <Wheel t={t} frame={frame} />
    </g>
  );
};
export {SCAN_A, scanY};
