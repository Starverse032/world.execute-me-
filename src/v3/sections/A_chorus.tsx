// Section A, chorus 1 stage geometry: shot 25 (16 spokes, impulses,
// STIMULATIONS), shot 27 (smile → play triangle, EXECUTION burst) and shot 28
// (the globe returns, "me" and "you" trapped inside, SIMULATION orbit).
// Shot 26 / moment 3 lives in A_char.tsx (it must sit above the art).
// Spec: docs/design_A.md A.1 shots 25, 27, 28.
import React from 'react';
import {beat, BEAT, clamp01, ease, FPS, K, lerp, O, prog, pulse} from '../core';
import {circlePath, ellipsePath, fnPath, linePath, PenHead, Plot, polyPath} from '../geo';
import {DEG, F, kv, Ln, math, mono, P2, Path, r2, TAU, Txt} from './A_lib';

const b = beat;
const f6 = 6 / FPS, f8 = 8 / FPS;

// ------------------------------------------------------------------ shot 25: spokes and impulses
const B128 = b(128), B129 = b(129), B135 = b(135);
const HIT25 = F(1859);
const P_ORDER = [0, 9, 4, 13, 2, 11, 6, 15, 1, 8, 5, 12, 3, 10, 7, 14];
const LAUNCH: number[] = [];
P_ORDER.forEach((s, j) => (LAUNCH[s] = j < 8 ? b(129 + Math.floor(j / 2)) : F(1847)));
const TRAVEL = 12 / FPS;
const STRETCH = 62.92; // moment 3: the pen dot stretches into the scan line

const Spokes: React.FC<{t: number}> = ({t}) => {
  if (t < B128 || t >= B135 + 10 / FPS) return null;
  const out: React.ReactNode[] = [];
  const grow = prog(t, B128, B128 + f6, ease.outExpo);
  const un = prog(t, B135, B135 + f8, ease.inOutCubic);
  const rEnd = lerp(40, 260, grow * (1 - un));
  const nodeO = prog(t, B128 + f6, B128 + f6 + 1 / FPS) * (1 - prog(t, B135, B135 + f6));
  // arrivals so far (counter)
  let n = 0;
  for (let i = 0; i < 16; i++) {
    const a = (-90 + 22.5 * i) * DEG;
    const c = Math.cos(a), s = Math.sin(a);
    if (rEnd > 40.5) out.push(<Ln key={'s' + i} x1={960 + 40 * c} y1={390 + 40 * s} x2={960 + rEnd * c} y2={390 + rEnd * s} w={1} o={O.mid} />);
    const ta = LAUNCH[i] + TRAVEL;
    // impulse: 3 px orange 36 px segment travelling r 40 → 260 in 12 frames
    const q = (t - LAUNCH[i]) / TRAVEL;
    if (q >= 0 && q < 1) {
      const h = 40 + 220 * q, tl = Math.max(40, h - 36);
      out.push(<Ln key={'i' + i} x1={960 + tl * c} y1={390 + tl * s} x2={960 + h * c} y2={390 + h * s} w={3} c={K.orange} cap="butt" />);
    }
    const arrived = t >= ta - 1e-6;
    if (arrived) n++;
    if (nodeO > 0) {
      const nx = 960 + 260 * c, ny = 390 + 260 * s;
      out.push(
        <circle
          key={'n' + i}
          cx={r2(nx)}
          cy={r2(ny)}
          r={4}
          fill={arrived ? K.orange : K.bg}
          stroke={arrived ? K.orange : K.cream}
          strokeOpacity={arrived ? 1 : O.hi}
          strokeWidth={1}
          opacity={nodeO}
        />,
      );
      const rq = (t - ta) / (9 / FPS);
      if (rq >= 0 && rq < 1) out.push(<circle key={'nr' + i} cx={r2(nx)} cy={r2(ny)} r={r2(lerp(4, 24, rq))} fill="none" stroke={K.orange} strokeWidth={1} opacity={0.45 * (1 - rq)} />);
    }
  }
  // hub r = 40, pulsing on beats; un-plots with the spokes
  const hr = 40 * (1 + 0.25 * pulse(t));
  const hp = Math.min(prog(t, B128, B128 + f6, ease.inOutCubic), 1 - un);
  out.push(<Plot key="hub" d={circlePath(960, 390, hr)} p={hp} w={1} opacity={O.mid} pen={false} />);
  // counter
  out.push(<Txt key="cnt" t={t} t0={B129} tOut={B135} x={1800} y={170} anchor="end" parts={kv('sent', `${n} / 16`)} />);
  return <>{out}</>;
};

// ------------------------------------------------------------------ shot 27: happy → ./run.sh → EXECUTION
const B144 = b(144), B145 = b(145), B146 = b(146), B147 = b(147), B148 = b(148), B152 = b(152);
const PEN_IN = 66.843; // the scan has contracted into the pen dot at C
const HIT27 = F(2078);
const smileY = (x: number) => 470 - 0.0025 * (x - 960) * (x - 960);
const SMILE_L = fnPath(smileY, 960, 760, 60);
const SMILE_R = fnPath(smileY, 960, 1160, 60);
const TRI: P2[] = [
  [900, 286.1],
  [1080, 390],
  [900, 493.9],
];
const TRI_D = polyPath(TRI, true);
const EYES: P2[] = [
  [880, 320],
  [1040, 320],
];
// 24 burst rays, clipped to the stage rect
const BURST = Array.from({length: 24}, (_, i) => (15 * i * Math.PI) / 180);

const Happy: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < PEN_IN || t >= B152 + 10 / FPS) return null;
  const out: React.ReactNode[] = [];
  const un = prog(t, B148, B148 + f6, ease.inOutCubic); // face un-plot
  // smile: two pen heads from the middle outward (8 frames)
  const sp = Math.min(prog(t, B145, B145 + f8, ease.inOutCubic), 1 - un);
  if (t >= B145) {
    const fl = frame >= 2040 && frame < 2043; // b147 flash, 3 frames
    const back = prog(t, F(2043), F(2049)); // 3 px orange → 2 px cream over 6 frames
    const plotting = t < B145 + f8;
    [SMILE_L, SMILE_R].forEach((d, i) => {
      out.push(<Plot key={'sm' + i} d={d} p={sp} w={2} t={t} pen={plotting} />);
      if (fl) out.push(<Path key={'smo' + i} d={d} c={K.orange} w={3} />);
      else if (frame >= 2043 && back < 1 && sp > 0) out.push(<Plot key={'smo' + i} d={d} p={sp} color={K.orange} w={lerp(3, 2, back)} opacity={1 - back} pen={false} />);
    });
  }
  // eyes: dots (b146), then closed happy arcs (b147)
  if (t >= B146) {
    const sIn = prog(t, B146, B146 + 4 / FPS, ease.outExpo);
    const k = prog(t, B147, B147 + 4 / FPS, ease.inOutCubic);
    const pl = 1 + 0.4 * pulse(t);
    const eo = 1 - un;
    EYES.forEach(([ex, ey], i) => {
      const r = 7 * sIn * (1 - k) * pl;
      if (r > 0.05) out.push(<circle key={'e' + i} cx={ex} cy={ey} r={r2(r)} fill={K.cream} opacity={eo} />);
      if (k > 0) {
        const sc = k * pl;
        out.push(
          <path
            key={'ea' + i}
            d={polyPath([
              [ex - 14 * sc, ey + 6 * sc],
              [ex, ey - 6 * sc],
              [ex + 14 * sc, ey + 6 * sc],
            ])}
            stroke={K.cream}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={eo}
          />,
        );
      }
    });
    // face circle r = 230 from 12 o'clock, 14 frames
    const fp = Math.min(prog(t, B146, B146 + 14 / FPS, ease.inOutCubic), 1 - un);
    out.push(<Plot key="face" d={circlePath(960, 390, 230)} p={fp} w={1} opacity={O.mid} t={t} pen={t < B146 + 14 / FPS} />);
    out.push(<Txt key="hx" t={t} t0={B146} tOut={B148} x={1230} y={520} opacity={O.hi} parts={[math('happy(x) = x', 30), math('2', 20, K.cream, 12)]} />);
  }
  // play triangle: plotted clockwise, easeInQuad, closing exactly on f2078
  if (t >= F(2054)) {
    const unT = prog(t, B152, B152 + f6, ease.inOutCubic);
    const hit = frame >= 2078;
    if (!hit) out.push(<Plot key="tri" d={TRI_D} p={prog(t, F(2054), HIT27, ease.inQuad)} w={1.5} t={t} />);
    else {
      if (frame < 2081) out.push(<path key="trif" d={TRI_D} fill={K.orange} stroke={K.orange} strokeWidth={2} strokeLinejoin="round" />);
      else out.push(<Plot key="tri" d={TRI_D} p={1 - unT} color={K.orange} w={2} pen={false} />);
    }
    out.push(<Txt key="run" t={t} t0={B148} tOut={B152} x={900} y={548} parts={[mono('./run.sh', 22)]} />);
    // radial burst
    const f = frame - 2078;
    if (f >= 0 && f <= 14) {
      const e = ease.outExpo(clamp01(f / 10));
      const ri = lerp(150, 480, e), ro = lerp(170, 520, e);
      const o = 0.7 * (1 - clamp01((f - 4) / 10));
      out.push(
        <clipPath key="bc" id="a27clip">
          <rect x={120} y={110} width={1680} height={550} />
        </clipPath>,
      );
      out.push(
        <g key="burst" clipPath="url(#a27clip)" opacity={o}>
          {BURST.map((a, i) => (
            <Ln key={i} x1={960 + ri * Math.cos(a)} y1={390 + ri * Math.sin(a)} x2={960 + ro * Math.cos(a)} y2={390 + ro * Math.sin(a)} w={1} />
          ))}
        </g>,
      );
    }
  }
  // the pen: C → (960, 470); the smile's right pen parks at its end until b148;
  // then the triangle's own pen; after the hit it rests on the closing vertex
  if (t < B145) {
    const g = prog(t, PEN_IN, B145, ease.inOutCubic);
    out.push(<PenHead key="pen" x={960} y={lerp(390, 470, g)} t={t} />);
  } else if (t >= B145 + f8 && t < B148 + 4 / FPS) {
    out.push(<PenHead key="pen" x={1160} y={370} t={t} scale={1 - prog(t, B148, B148 + 4 / FPS, ease.inCubic)} />);
  } else if (frame >= 2078 && t < B152) out.push(<PenHead key="pen" x={900} y={286.1} t={t} />);
  return <>{out}</>;
};

// ------------------------------------------------------------------ shot 28: the globe returns
const B153 = b(153), B154 = b(154), B155 = b(155), B156 = b(156), B157 = b(157), B158 = b(158), B160 = b(160);
const ROT0 = 71.764, KW28 = F(2195), BAR = 4 * BEAT;
const STOP = 73.845, ARRIVE = STOP + 0.385;
const GR = 200;
const spinDeg = (t: number) => {
  if (t < ROT0) return 0;
  const d1 = 40 * (KW28 - ROT0);
  if (t < KW28) return 40 * (t - ROT0);
  const rampT = 4 / FPS;
  const dt = Math.min(t, KW28 + rampT) - KW28;
  const d2 = d1 + 40 * dt + (100 / (2 * rampT)) * dt * dt;
  return t < KW28 + rampT ? d2 : d2 + 140 * (t - KW28 - rampT);
};
const tiltDeg = (t: number) => {
  if (t < B156) return 0;
  if (t < B157) return -15 * prog(t, B156, B156 + f8, ease.inOutCubic);
  if (t < B158) return lerp(-15, 15, prog(t, B157, B157 + f8, ease.inOutCubic));
  return lerp(15, 0, prog(t, B158, B158 + f8, ease.inOutCubic));
};

// Billiards inside r = 186, precomputed at 1/120 s (specular reflection).
const BIL = (() => {
  const dt = 1 / 120;
  const steps = Math.ceil((STOP - B153) / dt) + 2;
  const balls = [
    {p: [930, 390], v: [160, -110]},
    {p: [990, 390], v: [-130, 150]},
  ];
  const pos: P2[][] = [[], []];
  const hits: {t: number; a: number}[] = [];
  for (let k = 0; k <= steps; k++) {
    balls.forEach((bl, i) => {
      pos[i].push([bl.p[0], bl.p[1]]);
      bl.p[0] += bl.v[0] * dt;
      bl.p[1] += bl.v[1] * dt;
      const dx = bl.p[0] - 960, dy = bl.p[1] - 390, dist = Math.hypot(dx, dy);
      if (dist >= 186) {
        const nx = dx / dist, ny = dy / dist;
        const vn = bl.v[0] * nx + bl.v[1] * ny;
        bl.v[0] -= 2 * vn * nx;
        bl.v[1] -= 2 * vn * ny;
        const back = 186 - (dist - 186);
        bl.p[0] = 960 + nx * back;
        bl.p[1] = 390 + ny * back;
        hits.push({t: B153 + (k + 1) * dt, a: Math.atan2(ny, nx)});
      }
    });
  }
  const at = (i: number, t: number): P2 => {
    const x = clamp01((t - B153) / (STOP - B153)) * (STOP - B153) * 120;
    const k = Math.min(pos[i].length - 2, Math.floor(x));
    const f = x - k;
    return [lerp(pos[i][k][0], pos[i][k + 1][0], f), lerp(pos[i][k][1], pos[i][k + 1][1], f)];
  };
  return {at, hits};
})();

// Orbit: rx 400, ry 92, rotated −12° about C; the far half inside the globe disc is hidden (25 %).
const ORB = {rx: 400, ry: 92, rot: -12 * DEG};
const orbAt = (phi: number): P2 => {
  const x = ORB.rx * Math.cos(phi), y = ORB.ry * Math.sin(phi);
  return [960 + x * Math.cos(ORB.rot) - y * Math.sin(ORB.rot), 390 + x * Math.sin(ORB.rot) + y * Math.cos(ORB.rot)];
};
const orbHidden = (phi: number) => {
  const [x, y] = orbAt(phi);
  return Math.sin(phi) < 0 && Math.hypot(x - 960, y - 390) < GR;
};
const orbRuns = (a: number, bb: number, samples: number) => {
  const runs: {hidden: boolean; pts: P2[]}[] = [];
  for (let i = 0; i <= samples; i++) {
    const phi = a + ((bb - a) * i) / samples;
    const hid = orbHidden(phi);
    const pt = orbAt(phi);
    const last = runs[runs.length - 1];
    if (!last || last.hidden !== hid) {
      if (last) last.pts.push(pt);
      runs.push({hidden: hid, pts: [pt]});
    } else last.pts.push(pt);
  }
  return runs.filter((r) => r.pts.length > 1);
};
const ORBIT_RUNS = orbRuns(0, TAU, 360).map((r) => ({hidden: r.hidden, d: polyPath(r.pts)}));
const MERID = [0, 30, 60, 90, 120, 150];
const EQ = ellipsePath(960, 390, GR, 36);
const PAR = [ellipsePath(960, 390 - 114.7, 163.8, 29.5), ellipsePath(960, 390 + 114.7, 163.8, 29.5)];
const OUTLINE = circlePath(960, 390, GR);

const Globe: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < B152 || t >= ARRIVE + 0.5) return null;
  const out: React.ReactNode[] = [];
  const un = 1 - prog(t, B160, B160 + f8, ease.inOutCubic);
  const lineP = (t0: number) => Math.min(prog(t, t0, t0 + f8, ease.inOutCubic), un);
  const grp: React.ReactNode[] = [];
  grp.push(<Plot key="out" d={OUTLINE} p={lineP(B152)} w={1.5} opacity={O.hi} t={t} pen={un >= 1} />);
  if (t >= B153) grp.push(<Plot key="eq" d={EQ} p={lineP(B153)} w={1} opacity={O.mid} t={t} pen={un >= 1} />);
  if (t >= B154) PAR.forEach((d, i) => grp.push(<Plot key={'par' + i} d={d} p={lineP(B154)} w={1} opacity={O.mid} t={t} pen={un >= 1} />));
  if (t >= B155) {
    const pM = lineP(B155);
    const spin = spinDeg(t);
    MERID.forEach((l0) => {
      if (l0 === 90 && spin === 0) return; // coincides with the outline until the globe spins
      const lam = (l0 + spin) * DEG;
      const rx = GR * Math.abs(Math.sin(lam));
      const op = Math.cos(lam) < 0 ? O.lo : O.mid;
      const d = rx < 0.5 ? linePath(960, 390 - GR, 960, 390 + GR) : ellipsePath(960, 390, rx, GR);
      grp.push(<Plot key={'m' + l0} d={d} p={pM} w={1} opacity={op} t={t} pen={un >= 1} />);
    });
  }
  out.push(
    <g key="globe" transform={`rotate(${r2(tiltDeg(t))} 960 390)`}>
      {grp}
    </g>,
  );
  // orbit and satellite (f2195), fade on b160
  if (frame >= 2195) {
    const oo = 1 - prog(t, B160, B160 + f6);
    if (oo > 0) {
      ORBIT_RUNS.forEach((r, i) => out.push(<path key={'o' + i} d={r.d} fill="none" stroke={K.cream} strokeWidth={1} opacity={(r.hidden ? O.lo : O.mid) * oo} />));
      const phi = -(TAU * (t - KW28)) / BAR;
      [1, 0.6, 0.3].forEach((op, j) => {
        const a = phi + (2 + 18 * j) * DEG;
        orbRuns(a, a + 17 * DEG, 12).forEach((r, q) =>
          out.push(
            <path key={`tr${j}-${q}`} d={polyPath(r.pts)} fill="none" stroke={K.orange} strokeWidth={3} strokeLinecap="butt" opacity={op * (r.hidden ? 0.35 : 1) * oo} />,
          ),
        );
      });
      const [sx, sy] = orbAt(phi);
      out.push(<circle key="sat" cx={r2(sx)} cy={r2(sy)} r={6} fill={K.orange} opacity={(orbHidden(phi) ? 0.35 : 1) * oo} />);
    }
  }
  // wall-hit ticks outside the outline (fade over 8 frames)
  BIL.hits.forEach((h, i) => {
    const q = (t - h.t) / f8;
    if (q < 0 || q >= 1) return;
    const c = Math.cos(h.a), s = Math.sin(h.a);
    out.push(<Ln key={'h' + i} x1={960 + 201 * c} y1={390 + 201 * s} x2={960 + 211 * c} y2={390 + 211 * s} w={1} o={1 - q} />);
  });
  // "me" (orange) and "you" (cream ring), then both glide to C
  if (t >= B153) {
    const sIn = prog(t, B153, B153 + 3 / FPS, ease.outExpo);
    const pl = 1 + 0.5 * pulse(t);
    const g = prog(t, STOP, ARRIVE, ease.inOutCubic);
    const me = BIL.at(0, t), you = BIL.at(1, t);
    const mx = lerp(me[0], 960, g), my = lerp(me[1], 390, g);
    const yx = lerp(you[0], 960, g), yy = lerp(you[1], 390, g);
    const yo = 1 - prog(t, ARRIVE - 4 / FPS, ARRIVE);
    if (yo > 0) out.push(<circle key="you" cx={r2(yx)} cy={r2(yy)} r={r2(6 * sIn * pl)} fill="none" stroke={K.cream} strokeWidth={1.5} opacity={yo} />);
    // "me" becomes the pen head as it arrives
    const k = prog(t, ARRIVE - 3 / FPS, ARRIVE);
    if (t < ARRIVE) out.push(<circle key="me" cx={r2(mx)} cy={r2(my)} r={r2(lerp(5, 4, k) * sIn * pl)} fill={K.orange} />);
    if (k > 0 && t < ARRIVE) out.push(<PenHead key="pen" x={mx} y={my} t={t} opacity={k} />);
  }
  return <>{out}</>;
};

export const Chorus: React.FC<{t: number; frame: number}> = ({t, frame}) => (
  <>
    <Spokes t={t} />
    {t >= B128 && t < STRETCH && <PenHead x={960} y={390} t={t} />}
    <Happy t={t} frame={frame} />
    <Globe t={t} frame={frame} />
  </>
);
export {HIT25, B144, PEN_IN, ARRIVE};
