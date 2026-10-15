// Section C1, shots C9–C13 (162.63–177.30 s), the dark final chorus: 24 "you"
// circles sent the EXECUTION, 23 removed, the last one brought back along a
// dashed path, the progress ring / world around it, the walls closing in, and
// the pen dot's glide to the read scan start (1030, 110), landing on f5319.
// Spec: docs/design_full.md Section C, shots C9–C13.
import React from 'react';
import {beat, clamp01, ease, FPS, K, lerp, O, prog, pulse} from '../core';
import {PenHead} from '../geo';
import {beatSteps, CC, circPts, cumLen, dashD, DEG, Dial, ellPts, F, polyAt, Pt, quadPts, r2, scalePts, Stroke} from './C1_lib';

const f4 = 4 / FPS, f6 = 6 / FPS, f8 = 8 / FPS;
const [CX, CY] = CC;

// ------------------------------------------------------------------ timing
const RISE = [162.632, 162.9];
const SWEEP = [163.315, 165.0];
const HIT9 = F(4955), HIT10 = F(5067), HIT12 = F(5181);
const REM0 = 166.016; // group g removal starts at REM0 + 0.2308 g
const C11 = 169.824;
const PATH_IN = [169.85, 170.25];
const TRAVEL = [170.3, 171.4];
const RING0 = 171.868;
const C13 = 173.643;
const SHRINK = [175.06, 176.9];
const EXIT = [176.7, 176.97];
const GLIDE = [176.75, 177.3];
export const LAST_F = 5319; // the dot lands at (1030, 110); C2 takes it from here

// ------------------------------------------------------------------ entities
const theta = (k: number) => -90 + 15 * k;
const pos = (k: number, r = 230): Pt => [CX + r * Math.cos(theta(k) * DEG), CY + r * Math.sin(theta(k) * DEG)];
const circStart = (k: number) => SWEEP[0] + (k / 23) * (SWEEP[1] - SWEEP[0]);
const group = (k: number) => Math.abs(k - 12); // g0 = {12}, g1 = {11, 13}, … g11 = {1, 23}
const remT = (k: number) => REM0 + 0.2308 * group(k);
const CIRC = circPts(0, 0, 12, 48); // local, from the top, clockwise
const CIRC_C = cumLen(CIRC);
const RING22 = circPts(0, 0, 22, 64);
const at = (pts: Pt[], o: Pt, s: number): Pt[] => pts.map(([x, y]) => [o[0] + x * s, o[1] + y * s]);
const PATH = quadPts([960, 160], [1300, 300], [CX, CY], 96);
const PATH_C = cumLen(PATH);

// ring r 270 → 240 → ×(340/520) and the shrink factor of the walls
const kShrink = (t: number) => lerp(1, 340 / 520, ease.inOutCubic(prog(t, SHRINK[0], SHRINK[1])));
const ringR = (t: number) => lerp(270, 240, ease.inOutCubic(prog(t, C13, 173.94))) * kShrink(t);
const exitP = (t: number) => 1 - prog(t, EXIT[0], EXIT[1]);

// ------------------------------------------------------------------ C9–C10: 24 circles
const Entities: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < SWEEP[0] || t >= C11 + f6 + 0.01) return null;
  const s = 1 + 0.3 * pulse(t);
  const filled = t >= HIT9;
  const out: React.ReactNode[] = [];
  for (let k = 0; k < 24; k++) {
    const p = clamp01((t - circStart(k)) / f6);
    if (p <= 0) continue;
    const c = pos(k);
    if (k > 0) {
      // removal: spoke and circle un-plot together (6 frames)
      const rp = 1 - prog(t, remT(k), remT(k) + f6);
      if (rp <= 0) continue;
      const spokeP = Math.min(prog(t, HIT9, HIT9 + f4), rp);
      if (spokeP > 0) out.push(<Stroke key={`s${k}`} pts={[pos(k, 20), pos(k, 218)]} p={spokeP} w={1} opacity={O.mid} t={t} pen={rp >= 1} />);
      if (filled) out.push(<circle key={`f${k}`} cx={r2(c[0])} cy={r2(c[1])} r={r2(12 * s)} fill={K.cream} opacity={r2(rp)} />);
      out.push(<Stroke key={`c${k}`} pts={at(CIRC, c, s)} c={s === 1 ? CIRC_C : undefined} p={Math.min(p, rp)} w={1.5} opacity={O.hi} pen={false} />);
    } else {
      // circle 0: kept; orange on the C10 hit
      const hot = t >= HIT10;
      const spokeOut = 1 - prog(t, C11, C11 + f6);
      const spokeP = Math.min(prog(t, HIT9, HIT9 + f4), spokeOut);
      if (spokeP > 0)
        out.push(<Stroke key="s0" pts={[pos(0, 20), pos(0, 218)]} p={spokeP} w={hot ? 2 : 1} color={hot ? K.orange : K.cream} opacity={hot ? 1 : O.mid} t={t} pen={false} />);
      if (filled && !hot) out.push(<circle key="f0" cx={r2(c[0])} cy={r2(c[1])} r={r2(12 * s)} fill={K.cream} />);
      if (!hot) out.push(<Stroke key="c0" pts={at(CIRC, c, s)} p={p} w={1.5} opacity={O.hi} pen={false} />);
    }
  }
  return <g>{out}</g>;
};

// The you-circle (orange outline + ring r 22) from the C10 hit to the C13 exit.
const You: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < HIT10 || t >= EXIT[0] + f4) return null;
  let c: Pt = pos(0);
  if (t >= TRAVEL[0]) c = polyAt(PATH, ease.inOutSine(prog(t, TRAVEL[0], TRAVEL[1])), PATH_C);
  const shrink = 1 - prog(t, EXIT[0], EXIT[0] + f4);
  const s = (1 + 0.3 * pulse(t)) * (t >= SHRINK[0] ? kShrink(t) : 1) * shrink;
  const ringP = prog(t, HIT10, HIT10 + f6);
  return (
    <g>
      <Stroke pts={at(CIRC, c, s)} w={2} color={K.orange} pen={false} />
      {ringP > 0 && <Stroke pts={at(RING22, c, s)} p={ringP} w={1} color={K.orange} opacity={O.mid} pen={false} />}
    </g>
  );
};

// The travelling pen: rises to the top, sweeps the ring, fades.
const SweepPen: React.FC<{t: number}> = ({t}) => {
  if (t < RISE[0] || t > SWEEP[1] + f4) return null;
  let x = CX, y = CY;
  if (t < SWEEP[0]) y = lerp(CY, 160, prog(t, RISE[0], RISE[1], ease.inOutCubic));
  else [x, y] = (() => {
    const a = (-90 + 345 * prog(t, SWEEP[0], SWEEP[1])) * DEG;
    return [CX + 230 * Math.cos(a), CY + 230 * Math.sin(a)];
  })();
  return <PenHead x={x} y={y} t={t} opacity={1 - prog(t, SWEEP[1], SWEEP[1] + f4)} />;
};

// The orange spark at C: blooms on the C9 hit, steps 15° per beat, shrinks as you arrive.
const CSpark: React.FC<{t: number}> = ({t}) => {
  if (t < HIT9 || t >= TRAVEL[1]) return null;
  const g = clamp01((t - HIT9) / f4);
  const R = 40 * (1 - prog(t, TRAVEL[1] - f6, TRAVEL[1]));
  const rot = beatSteps(t, REM0 - 0.02);
  return <Dial x={CX} y={CY} R={R} rot={rot} grow={() => ease.outCubic(g)} hub={ease.outExpo(g)} ray={() => ({fill: 1})} />;
};

// ------------------------------------------------------------------ C11: return path
const ReturnPath: React.FC<{t: number}> = ({t}) => {
  if (t < PATH_IN[0] || t >= TRAVEL[1]) return null;
  const p = prog(t, PATH_IN[0], PATH_IN[1], ease.inOutCubic);
  const a = t >= TRAVEL[0] ? ease.inOutSine(prog(t, TRAVEL[0], TRAVEL[1])) : 0;
  const tip = polyAt(PATH, p, PATH_C);
  return (
    <g>
      <path d={dashD(PATH, a, p, 6, 6, PATH_C)} fill="none" stroke={K.cream} strokeWidth={1} opacity={O.mid} strokeLinecap="butt" />
      {p < 1 && <PenHead x={tip[0]} y={tip[1]} t={t} />}
    </g>
  );
};

// ------------------------------------------------------------------ C12–C13: world, walls
const MERID = [0, 30, 60, 90, 120, 150];
const World: React.FC<{t: number}> = ({t}) => {
  if (t < RING0 || t >= EXIT[1]) return null;
  const R = ringR(t);
  const ex = exitP(t);
  const out: React.ReactNode[] = [];
  // progress ring: plotted from 12 o'clock, easeInQuad, closing on f5181
  const rp = Math.min(ease.inQuad(prog(t, RING0, HIT12)), ex);
  const ring = circPts(CX, CY, R, 180);
  const toCream = prog(t, C13, C13 + f6);
  if (t >= HIT12 && toCream < 1) out.push(<Stroke key="ro" pts={ring} p={rp} w={2} color={K.orange} opacity={1 - toCream} t={t} pen={false} />);
  if (t < HIT12) out.push(<Stroke key="rc" pts={ring} p={rp} w={2} t={t} />);
  if (toCream > 0) out.push(<Stroke key="rc2" pts={ring} p={rp} w={lerp(2, 1.5, toCream)} opacity={O.hi * toCream} t={t} pen={ex < 1} />);
  // globe lines inside (scale with the ring), meridians at 140°/s
  if (t >= HIT12) {
    const gs = R / 270;
    const lp = Math.min(prog(t, HIT12, HIT12 + f6, ease.inOutCubic), ex);
    out.push(<Stroke key="eq" pts={ellPts(CX, CY, 220 * gs, 40 * gs)} p={lp} w={1} opacity={O.mid} t={t} pen={false} />);
    const spin = 140 * (t - HIT12);
    MERID.forEach((l0) => {
      const lam = (l0 + spin) * DEG;
      const rx = 220 * gs * Math.abs(Math.sin(lam));
      const pts: Pt[] = rx < 0.5 ? [[CX, CY - 220 * gs], [CX, CY + 220 * gs]] : ellPts(CX, CY, rx, 220 * gs, 0, 72);
      out.push(<Stroke key={`m${l0}`} pts={pts} p={lp} w={1} opacity={Math.cos(lam) < 0 ? O.lo : O.mid} pen={false} />);
    });
  }
  return <g>{out}</g>;
};

const WALL_T = [376, 377, 378, 379].map(beat);
const DIAM_T = beat(380);
const Walls: React.FC<{t: number}> = ({t}) => {
  if (t < WALL_T[0] || t >= EXIT[1]) return null;
  const h = 260 * kShrink(t);
  const sq: Pt[] = scalePts([[-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]], [0, 0], h).map(([x, y]) => [CX + x, CY + y]);
  let p = 0;
  WALL_T.forEach((tb) => (p += prog(t, tb, tb + f8) / 4));
  const ex = exitP(t);
  const o = 0.7 + 0.3 * pulse(t);
  const dh = h * Math.SQRT2;
  const dm: Pt[] = [[CX, CY - dh], [CX + dh, CY], [CX, CY + dh], [CX - dh, CY], [CX, CY - dh]];
  const dp = Math.min(prog(t, DIAM_T, DIAM_T + f8), ex);
  return (
    <g>
      {dp > 0 && <Stroke pts={dm} p={dp} w={1} opacity={O.mid} t={t} pen={ex >= 1} />}
      <Stroke pts={sq} p={Math.min(p, ex)} w={2} opacity={o} t={t} pen={ex >= 1} />
    </g>
  );
};

// The pen dot: the you-circle shrinks into it at C, then it glides to (1030, 110).
const ExitDot: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < EXIT[0] || frame > LAST_F) return null;
  const s = prog(t, EXIT[0], EXIT[0] + f4);
  const g = prog(t, GLIDE[0], GLIDE[1], ease.inOutCubic);
  return <PenHead x={lerp(CX, 1030, g)} y={lerp(CY, 110, g)} t={t} scale={s} />;
};

export const Chorus: React.FC<{t: number; frame: number}> = ({t, frame}) => (
  <>
    <World t={t} />
    <Walls t={t} />
    <ReturnPath t={t} />
    <Entities t={t} frame={frame} />
    <CSpark t={t} />
    <You t={t} frame={frame} />
    <SweepPen t={t} />
    <ExitDot t={t} frame={frame} />
  </>
);
