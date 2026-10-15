// Section C1, shots C1–C5 stage geometry (131.20–147.66 s): the ILLEGAL
// ARGUMENTS crash (brackets, strike, burst), the 9 × 4 lattice of pieces, the
// globe at speed with three orbits, and the 1210-point engine that flows into a
// spiral and implodes into the loading spark (the spark / dial itself is in
// C1_climax.tsx). Spec: docs/design_full.md Section C, shots C1–C5.
import React, {useLayoutEffect, useRef} from 'react';
import {beat, clamp01, ease, env, FPS, K, lastOnset, lerp, O, prog, pulse} from '../core';
import {PenHead} from '../geo';
import {BAR, CC, circPts, cumLen, DD, DEG, dPoly, ellPts, ExpRing, F, Pt, quadPts, r2, Stroke, subPoly} from './C1_lib';

const f4 = 4 / FPS, f6 = 6 / FPS, f8 = 8 / FPS;

// ================================================================== C1: the crash
export const KW1_F = 3937; // ILLEGAL ARGUMENTS (b284)
const STRIKE_F = 3950; // b285: strike draws f3950–f3956
const CLOSE = [132.14, 132.55]; // b286: brackets close, strike shortens
const BURST = 132.55;
export const INSTR = 133.063; // b288: instrumental layout, lattice pens start
const BR_L = quadPts([300, 130], [140, 390], [300, 650]);
const BR_R = quadPts([1620, 130], [1780, 390], [1620, 650]);
const closeQ = (t: number) => ease.inCubic(prog(t, CLOSE[0], CLOSE[1]));

export const Crash: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (frame < KW1_F || t > INSTR + f4 + 0.01) return null;
  const s = 1 - closeQ(t);
  // brackets close about x 960 (scaleX; stroke width kept)
  const sx = (pts: Pt[]) => pts.map(([x, y]) => [960 + (x - 960) * s, y] as Pt);
  // seed: pulses on every beat and once more on the burst; fades as the lattice starts
  const fade = 1 - prog(t, INSTR, INSTR + f4);
  const ps = fade * (1 + 0.5 * Math.max(pulse(t), env(t - BURST)));
  return (
    <g>
      {s > 0.002 &&
        [BR_L, BR_R].map((b, i) => <path key={i} d={dPoly(sx(b))} fill="none" stroke={K.orange} strokeWidth={2} strokeLinecap="round" />)}
      <ExpRing t={t} t0={BURST} dur={0.5} cx={CC[0]} cy={CC[1]} r0={0} r1={480} color={K.cream} />
      {ps > 0 && <PenHead x={CC[0]} y={CC[1]} scale={ps} />}
    </g>
  );
};

// The strike line sits above the keyword (Top layer): it strikes the word out.
export const Strike: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (frame < STRIKE_F || t > CLOSE[1]) return null;
  const p = clamp01((frame - STRIKE_F) / 6);
  const q = closeQ(t);
  const x0 = lerp(348, 960, q), x1 = lerp(348 + 1224 * p, 960, q);
  if (x1 - x0 < 0.5) return null;
  return (
    <g>
      <path d={`M${r2(x0)} 390L${r2(x1)} 390`} stroke={K.orange} strokeWidth={3} strokeLinecap="butt" />
      {p < 1 && <PenHead x={x1} y={390} t={t} />}
    </g>
  );
};

// ================================================================== C2: the lattice
const AR_A = 938 / 1680;
const BW4 = 480 * AR_A;
// shot 3's arc pieces (figure F's hair quadratics), fitted to height h about (0, 0)
const fitQuad = (q: Pt[], h: number): Pt[] => {
  const pts = quadPts(q[0], q[1], q[2], 64);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of pts) (x0 = Math.min(x0, x)), (x1 = Math.max(x1, x)), (y0 = Math.min(y0, y)), (y1 = Math.max(y1, y));
  const s = h / (y1 - y0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return pts.map(([x, y]) => [(x - cx) * s, (y - cy) * s] as Pt);
};
const roundRectPts = (w: number, h: number, r: number): Pt[] => {
  const x = -w / 2, y = -h / 2, out: Pt[] = [];
  const corner = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i <= 4; i++) {
      const a = (a0 + (90 * i) / 4) * DEG;
      out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  };
  out.push([x + r, y]);
  corner(x + w - r, y + r, -90);
  corner(x + w - r, y + h - r, 0);
  corner(x + r, y + h - r, 90);
  corner(x + r, y + r, 180);
  return out;
};
// circle, arc, mirrored arc, line, triangle, rect (shot 3's pieces at 0.55)
const SHAPES: Pt[][] = [
  circPts(0, 0, 22, 64),
  fitQuad([[0.42 * BW4, 0.06 * 480], [0.1 * BW4, 0.3 * 480], [0.1 * BW4, 0.86 * 480]], 77),
  fitQuad([[0.6 * BW4, 0.06 * 480], [0.92 * BW4, 0.3 * 480], [0.9 * BW4, 0.75 * 480]], 77),
  [[-44, 0], [44, 0]],
  [[0, -44], [38.5, 44], [-38.5, 44], [0, -44]],
  roundRectPts(31, 37, 2),
];
const SHAPE_C = SHAPES.map((s) => cumLen(s));
type Cell = {x: number; y: number; type: number; t0: number; chase: number};
const CELLS: Cell[] = [];
for (let c = 0; c < 9; c++)
  for (let r = 0; r < 4; r++)
    CELLS.push({x: 240 + 180 * c, y: [235, 365, 495, 625][r], type: (c + 2 * r) % 6, t0: INSTR + 0.2308 * c, chase: beat(288 + ((c + r) % 8))});
const ROT_T = [292, 293, 294].map(beat);
const IMP = [beat(295), F(4103)]; // implosion lands on f4103
export const GLOBE_F = 4103;

const Lattice: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < INSTR || frame >= GLOBE_F) return null;
  let rot = 0;
  for (const tb of ROT_T) rot += 60 * prog(t, tb, tb + f6, ease.outCubic);
  const ca = Math.cos(rot * DEG), sa = Math.sin(rot * DEG);
  const q = ease.inCubic(prog(t, IMP[0], IMP[1]));
  const s = 1 - q;
  return (
    <g>
      {CELLS.map((cell, i) => {
        const p = clamp01((t - cell.t0) / f4);
        if (p <= 0) return null;
        const cx = lerp(cell.x, DD[0], q), cy = lerp(cell.y, DD[1], q);
        const pts = SHAPES[cell.type].map(([x, y]) => [cx + s * (x * ca - y * sa), cy + s * (x * sa + y * ca)] as Pt);
        const hot = t >= cell.chase && t < cell.chase + f6;
        return (
          <Stroke
            key={i}
            pts={pts}
            c={s === 1 && rot === 0 ? SHAPE_C[cell.type] : undefined}
            p={p}
            color={hot ? K.orange : K.cream}
            w={hot ? 2 : 1.5}
            opacity={hot ? 1 : O.hi}
            t={t}
          />
        );
      })}
    </g>
  );
};

// ================================================================== C3: the globe at speed
const GR = 220;
const SPIN = [beat(298), beat(304)];
// 140°/s from b298, easeInQuad up to 540°/s by b304, then 540°/s
const spinDeg = (t: number) => {
  if (t < SPIN[0]) return 0;
  const Dd = SPIN[1] - SPIN[0];
  const tau = Math.min(t, SPIN[1]) - SPIN[0];
  const u = tau / Dd;
  return 140 * tau + (400 * Dd * u * u * u) / 3 + 540 * Math.max(0, t - SPIN[1]);
};
const MERID = [0, 30, 60, 90, 120, 150];
const LINE_T = {eq: beat(296.5), par: beat(297), mer: beat(297.5)};
const ORB = [
  {t0: beat(298), rot: -12},
  {t0: beat(300), rot: 48},
  {t0: beat(302), rot: -72},
];
const ORB_N = 360;
// Orbit k sampled from φ = π (left end) down to −π, the satellite's direction
// (front pass left to right). hidden = far half inside the globe disk.
const orbAt = (k: number, phi: number): Pt => {
  const r = ORB[k].rot * DEG;
  const x = 400 * Math.cos(phi), y = 92 * Math.sin(phi);
  return [DD[0] + x * Math.cos(r) - y * Math.sin(r), DD[1] + x * Math.sin(r) + y * Math.cos(r)];
};
const orbHidden = (k: number, phi: number) => {
  const [x, y] = orbAt(k, phi);
  return Math.sin(phi) < 0 && Math.hypot(x - DD[0], y - DD[1]) < GR;
};
const ORB_PTS = ORB.map((_, k) => Array.from({length: ORB_N + 1}, (_, i) => orbAt(k, Math.PI - (2 * Math.PI * i) / ORB_N)));
const ORB_HID = ORB.map((_, k) => Array.from({length: ORB_N + 1}, (_, i) => orbHidden(k, Math.PI - (2 * Math.PI * i) / ORB_N)));
const satT = (k: number) => ORB[k].t0 + f8;
const satPhi = (k: number, t: number) => Math.PI - (2 * Math.PI * (t - satT(k))) / BAR;

// Orbit k plotted to p: runs split into front (45 %) and behind-the-globe (25 %).
const OrbitStroke: React.FC<{k: number; p: number; t: number; o?: number}> = ({k, p, t, o = 1}) => {
  if (p <= 0) return null;
  const pts = ORB_PTS[k], hid = ORB_HID[k];
  const nf = p * ORB_N;
  const n = Math.floor(nf);
  const tip: Pt = n >= ORB_N ? pts[ORB_N] : [lerp(pts[n][0], pts[n + 1][0], nf - n), lerp(pts[n][1], pts[n + 1][1], nf - n)];
  const runs: {h: boolean; pts: Pt[]}[] = [];
  for (let i = 0; i <= Math.min(n, ORB_N); i++) {
    const last = runs[runs.length - 1];
    if (!last || last.h !== hid[i]) {
      if (last) last.pts.push(pts[i]);
      runs.push({h: hid[i], pts: [pts[i]]});
    } else last.pts.push(pts[i]);
  }
  if (n < ORB_N) runs[runs.length - 1].pts.push(tip);
  return (
    <>
      {runs.map((r, i) =>
        r.pts.length > 1 ? <path key={i} d={dPoly(r.pts)} fill="none" stroke={K.cream} strokeWidth={1} opacity={r2((r.h ? O.lo : O.mid) * o)} strokeLinejoin="round" /> : null,
      )}
      {p < 1 && o > 0.5 && <PenHead x={tip[0]} y={tip[1]} t={t} />}
    </>
  );
};

const Satellite: React.FC<{k: number; t: number; o?: number}> = ({k, t, o = 1}) => {
  if (t < satT(k)) return null;
  const phi = satPhi(k, t);
  const out: React.ReactNode[] = [];
  [1, 0.6, 0.3].forEach((op, j) => {
    // three 17° trail pieces behind the satellite (larger φ is behind)
    const a = phi + (2 + 18 * j) * DEG;
    const seg: Pt[] = [];
    let h0: boolean | null = null;
    for (let i = 0; i <= 8; i++) {
      const ph = a + (17 * DEG * i) / 8;
      const hh = orbHidden(k, ph);
      if (h0 === null) h0 = hh;
      seg.push(orbAt(k, ph));
    }
    out.push(<path key={j} d={dPoly(seg)} fill="none" stroke={K.orange} strokeWidth={3} strokeLinecap="butt" opacity={r2(op * (h0 ? 0.35 : 1) * o)} />);
  });
  const [x, y] = orbAt(k, phi);
  out.push(<circle key="s" cx={r2(x)} cy={r2(y)} r={6} fill={K.orange} opacity={r2((orbHidden(k, phi) ? 0.35 : 1) * o)} />);
  return <>{out}</>;
};

// Globe line set at t (also sampled into the point set at the cross-fade).
type GLine = {pts: Pt[]; p: number; o: number; w: number};
const globeLines = (t: number): GLine[] => {
  const out: GLine[] = [];
  const lp = (t0: number) => prog(t, t0, t0 + f6, ease.inOutCubic);
  const pE = lp(LINE_T.eq), pP = lp(LINE_T.par), pM = lp(LINE_T.mer);
  if (pE > 0) out.push({pts: ellPts(DD[0], DD[1], GR, 40), p: pE, o: O.mid, w: 1});
  if (pP > 0) [-1, 1].forEach((sg) => out.push({pts: ellPts(DD[0], DD[1] + sg * 126, 180, 32), p: pP, o: O.mid, w: 1}));
  if (pM > 0) {
    const spin = spinDeg(t);
    for (const l0 of MERID) {
      if (l0 === 90 && pM < 1) continue; // on the outline until the globe spins
      const lam = (l0 + spin) * DEG;
      const rx = GR * Math.abs(Math.sin(lam));
      const pts: Pt[] = rx < 0.5 ? [[DD[0], DD[1] - GR], [DD[0], DD[1] + GR]] : ellPts(DD[0], DD[1], rx, GR, 0, 72);
      out.push({pts, p: pM, o: Math.cos(lam) < 0 ? O.lo : O.mid, w: 1});
    }
  }
  return out;
};

export const PTS_F = 4213; // b304: strokes become points
const XF = 3; // cross-fade frames

const Globe: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (frame < GLOBE_F || frame >= PTS_F + XF) return null;
  // during the cross-fade the strokes hold their f4212 state
  const tg = frame >= PTS_F ? F(PTS_F - 1) : t;
  const o = frame >= PTS_F ? 1 - (frame - PTS_F + 1) / XF : 1;
  const R = GR * ease.outExpo(prog(tg, F(GLOBE_F), F(GLOBE_F + 6)));
  return (
    <g opacity={r2(o)}>
      {R > 0 && <circle cx={DD[0]} cy={DD[1]} r={r2(R)} fill="none" stroke={K.cream} strokeWidth={1.5} opacity={O.hi} />}
      {globeLines(tg).map((l, i) => (
        <Stroke key={i} pts={l.pts} p={l.p} w={l.w} opacity={l.o} t={t} />
      ))}
      {ORB.map((o2, k) => (
        <React.Fragment key={k}>
          <OrbitStroke k={k} p={prog(tg, o2.t0, o2.t0 + f8)} t={t} />
          <Satellite k={k} t={tg} />
        </React.Fragment>
      ))}
      {frame < PTS_F && [296, 300].map((n) => <ExpRing key={n} t={t} t0={beat(n)} dur={0.4} cx={DD[0]} cy={DD[1]} r0={220} r1={280} />)}
    </g>
  );
};

// ================================================================== C4–C5: the point engine
const N = 1210;
const T_PTS = F(PTS_F);
const SPIRAL_END = 144.139; // 180°/s reached
const IMP_P = [beat(312), beat(313)]; // points implode into the hub
const px0 = new Float32Array(N), py0 = new Float32Array(N), orange = new Uint8Array(N);
const spR = new Float32Array(N), spA = new Float32Array(N), dly = new Float32Array(N);
(() => {
  // sample the f4212 strokes uniformly by arc length (satellites: 6 orange points each)
  const tg = F(PTS_F - 1);
  const lines: Pt[][] = [circPts(DD[0], DD[1], GR, 160), ...globeLines(tg).map((l) => l.pts), ...ORB_PTS];
  const cs = lines.map((l) => cumLen(l));
  const lens = cs.map((c) => c[c.length - 1]);
  const total = lens.reduce((a, b) => a + b, 0);
  const NSAT = 18;
  const ns = N - NSAT;
  let li = 0, acc = 0;
  for (let i = 0; i < ns; i++) {
    const s = ((i + 0.5) * total) / ns;
    while (li < lines.length - 1 && s > acc + lens[li]) acc += lens[li++];
    const sp = subPoly(lines[li], 0, (s - acc) / lens[li], cs[li]);
    const p = sp ? sp.b : lines[li][0];
    px0[i] = p[0];
    py0[i] = p[1];
    orange[i] = i % 11 === 0 ? 1 : 0;
  }
  for (let k = 0; k < 3; k++) {
    const [sx, sy] = orbAt(k, satPhi(k, tg));
    for (let j = 0; j < 6; j++) {
      const i = ns + 6 * k + j;
      const a = (j * 72 + 30 * k) * DEG;
      px0[i] = sx + (j ? 3.5 * Math.cos(a) : 0);
      py0[i] = sy + (j ? 3.5 * Math.sin(a) : 0);
      orange[i] = 1;
    }
  }
  // spiral: rank by distance from D → spiral index
  const ids = Array.from({length: N}, (_, i) => i).sort((a, b) => Math.hypot(px0[a] - DD[0], py0[a] - DD[1]) - Math.hypot(px0[b] - DD[0], py0[b] - DD[1]) || a - b);
  ids.forEach((i, k) => {
    spR[i] = 310 * Math.sqrt(k / N);
    spA[i] = k * 137.508 * DEG;
    dly[i] = (0.25 * k) / N;
  });
})();
// 20°/s, easeInQuad up to 180°/s by 144.139, then 180°/s
const spiralRot = (t: number) => {
  const Dd = SPIRAL_END - T_PTS;
  const tau = Math.max(0, Math.min(t, SPIRAL_END) - T_PTS);
  const u = tau / Dd;
  return (20 * tau + (160 * Dd * u * u * u) / 3 + 180 * Math.max(0, t - SPIRAL_END)) * DEG;
};
const BEATS = Array.from({length: 9}, (_, j) => lastOnset(beat(304 + j) + 0.041)); // b304–b312
const EIGHTHS = Array.from({length: 8}, (_, j) => beat(304.5 + j));

const PointCanvas: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext('2d')!;
    g.clearRect(0, 0, 1920, 1080);
    const fin = clamp01((frame - PTS_F + 1) / XF);
    const rot = spiralRot(t);
    const q = ease.inCubic(prog(t, IMP_P[0], IMP_P[1]));
    const bs = BEATS.filter((tb) => tb <= t && t - tb < 0.9);
    const es = EIGHTHS.filter((tb) => tb <= t && t - tb < 0.9);
    for (const o of [0, 1]) {
      g.fillStyle = o ? K.orange : K.cream;
      g.globalAlpha = fin;
      g.beginPath();
      for (let i = 0; i < N; i++) {
        if (orange[i] !== o) continue;
        const a = spA[i] + rot;
        let x = DD[0] + spR[i] * Math.cos(a), y = DD[1] + spR[i] * Math.sin(a);
        const p = ease.inOutCubic(clamp01((t - T_PTS - dly[i]) / 1.0));
        x = lerp(px0[i], x, p);
        y = lerp(py0[i], y, p);
        // beat ripple: an outward push travelling at 1500 px/s from D
        const dx = x - DD[0], dy = y - DD[1];
        const r = Math.hypot(dx, dy);
        let k = 1;
        for (const tb of bs) k += 0.06 * env(t - tb - r / 1500);
        for (const tb of es) k += 0.03 * env(t - tb - r / 1500);
        x = lerp(DD[0] + dx * k, DD[0], q);
        y = lerp(DD[1] + dy * k, DD[1], q);
        g.moveTo(x + 1.8, y);
        g.arc(x, y, 1.8, 0, Math.PI * 2);
      }
      g.fill();
    }
    g.globalAlpha = 1;
  }, [t, frame]);
  return <canvas ref={ref} width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}} />;
};

export const PointsC4: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (frame < PTS_F || t >= IMP_P[1]) return null;
  return <PointCanvas t={t} frame={frame} />;
};

// Stage geometry of C1–C3 (SVG part).
export const BuildGeo: React.FC<{t: number; frame: number}> = ({t, frame}) => (
  <>
    <Crash t={t} frame={frame} />
    <Lattice t={t} frame={frame} />
    <Globe t={t} frame={frame} />
  </>
);
