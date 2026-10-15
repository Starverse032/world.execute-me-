// Section C1, shots C4–C8 (140.43–162.63 s): the loading spark that becomes the
// dial, the 12 EXECUTION pose cuts (panels in the Char layer), the count
// hexagon, the EXECUTION #13 shockwave and the pen dot's return to C.
// Spec: docs/design_full.md Section C, shots C4–C8.
import React, {useLayoutEffect, useRef} from 'react';
import {Img, staticFile} from 'remotion';
import {beat, clamp01, CODE, ease, FPS, fr, K, lerp, O, prog} from '../core';
import {PenHead} from '../geo';
import {CC, DD, Dial, ExpRing, F, Pt, r2, RayStyle} from './C1_lib';
import {PTS_F} from './C1_build';
import PA from '../../../public/char/a_points.json';
import PSIT from '../../../public/char/sit_points.json';
import PDEFY from '../../../public/char/defy_points.json';

const f4 = 4 / FPS, f6 = 6 / FPS;

// ------------------------------------------------------------------ hits
type Pose = 'a' | 'reach' | 'float' | 'defy' | 'read' | 'sit';
type Hit = {t: number; f: number; pose: Pose; panel: 'L' | 'R'; crop: 'full' | 'medium' | 'close'; tr: 'flat' | 'lines'};
const H = (t: number, pose: Pose, panel: 'L' | 'R', crop: Hit['crop'], tr: Hit['tr']): Hit => ({t, f: fr(t), pose, panel, crop, tr});
export const HITS: Hit[] = [
  H(147.66, 'a', 'L', 'full', 'flat'),
  H(148.6, 'reach', 'R', 'full', 'flat'),
  H(149.52, 'float', 'L', 'full', 'flat'),
  H(150.54, 'defy', 'R', 'full', 'flat'),
  H(151.52, 'read', 'L', 'medium', 'flat'),
  H(152.28, 'sit', 'R', 'medium', 'lines'),
  H(153.16, 'float', 'L', 'medium', 'flat'),
  H(153.98, 'defy', 'R', 'medium', 'lines'),
  H(155.2, 'reach', 'L', 'close', 'flat'),
  H(156.08, 'a', 'R', 'close', 'lines'),
  H(157.04, 'float', 'L', 'close', 'flat'),
  H(158.0, 'defy', 'R', 'close', 'flat'),
];
export const COUNT_F = [4767, 4780, 4790, 4807, 4821, 4834]; // EIN DOS TROIS NE FEM LIU
export const EXEC13_F = 4848;
const END_F = COUNT_F[0]; // hard cut at EIN

// Face anchors (nx, ny) measured on public/char/<pose>_flat.png (centre of the
// skin blob of the face), used for the medium / close crops and the push origin.
const FACE: Record<Pose, Pt> = {
  a: [0.519, 0.119],
  reach: [0.479, 0.114],
  float: [0.504, 0.11],
  defy: [0.49, 0.112],
  read: [0.489, 0.118],
  sit: [0.472, 0.176],
};
const NAME: Record<Pose, string> = {a: 'stand', reach: 'reach', float: 'float', defy: 'defy', read: 'read', sit: 'sit'};
const ASPECT = (p: Pose) => (p === 'a' ? 938 / 1680 : 1120 / 1680);
const PANEL = {L: {x: 300, y: 120, w: 480, h: 680}, R: {x: 1140, y: 120, w: 480, h: 680}};
const CROP = {full: {h: 660, top: 130}, medium: {h: 1100, top: 120}, close: {h: 1700, top: 100}};
const POINTS: Partial<Record<Pose, number[][]>> = {
  a: (PA as {points: number[][]}).points,
  sit: (PSIT as {points: number[][]}).points,
  defy: (PDEFY as {points: number[][]}).points,
};

const hitAt = (frame: number) => {
  let k = -1;
  for (let i = 0; i < HITS.length; i++) if (frame >= HITS[i].f) k = i;
  return frame >= END_F ? -1 : k;
};
// Rays executed so far (ray k−1 on hit k), with the frame each was executed.
const execFrame = (i: number) => HITS[i].f;

// ------------------------------------------------------------------ spark → dial
const T0 = F(PTS_F); // hub appears (b304)
const RAY_T = Array.from({length: 12}, (_, i) => beat(304 + i));
const GROW = [beat(313), beat(316)]; // R 60 → 320
const FILL_OUT = [beat(313), beat(313) + 0.4];
const SETTLE = [beat(316), beat(316) + f6];
const SHOCK = [F(EXEC13_F), F(EXEC13_F + 12)];

const sparkR = (t: number) => lerp(60, 320, ease.inOutCubic(prog(t, GROW[0], GROW[1])));

const HEX: Pt[] = [
  [960, 170],
  [1185, 300],
  [1185, 560],
  [960, 690],
  [735, 560],
  [735, 300],
];

// The count hexagon: node + index on each word, edge v_j → v_{j+1} in 7 frames.
const Hexagon: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (frame < COUNT_F[0]) return null;
  return (
    <g>
      {HEX.map((v, j) => {
        const f0 = COUNT_F[j];
        if (frame < f0) return null;
        const p = clamp01((frame - f0) / 7);
        const w = HEX[(j + 1) % 6];
        const x = lerp(v[0], w[0], p), y = lerp(v[1], w[1], p);
        return (
          <path key={`e${j}`} d={`M${v[0]} ${v[1]}L${r2(x)} ${r2(y)}`} stroke={K.cream} strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        );
      })}
      {HEX.map((v, j) => {
        const f0 = COUNT_F[j];
        if (frame < f0) return null;
        const p = clamp01((frame - f0) / 7);
        const w = HEX[(j + 1) % 6];
        const dx = v[0] - DD[0], dy = v[1] - DD[1], L = Math.hypot(dx, dy);
        const lx = v[0] + (dx / L) * 18, ly = v[1] + (dy / L) * 18;
        return (
          <g key={`n${j}`}>
            <circle cx={v[0]} cy={v[1]} r={5} fill={K.orange} />
            <text x={r2(lx)} y={r2(ly + 5)} textAnchor="middle" fontFamily={CODE} fontSize={16} fill={K.creamDim}>
              {j + 1}
            </text>
            {p < 1 && frame < SHOCK[0] * FPS && <PenHead x={lerp(v[0], w[0], p)} y={lerp(v[1], w[1], p)} t={t} />}
          </g>
        );
      })}
    </g>
  );
};

// Spark (C4) → dial (C5) → executed rays (C6–C7) → shockwave (C8).
export const SparkDial: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (frame < PTS_F || t >= SHOCK[1]) return null;
  const R = sparkR(t);
  const grow = (i: number) => clamp01((t - RAY_T[i]) / f4);
  const fill = 1 - prog(t, FILL_OUT[0], FILL_OUT[1]);
  const outIn = prog(t, FILL_OUT[0], FILL_OUT[1]);
  const settle = prog(t, SETTLE[0], SETTLE[1]);
  const pending: RayStyle = {stroke: K.cream, w: 1, o: O.mid};
  let ray: (i: number) => RayStyle;
  let hubStyle: RayStyle;
  const layers: React.ReactNode[] = [];
  if (t < SETTLE[0] || settle < 1) {
    // filled spark, then the orange outline takes over, then it settles to cream
    const orangeO = outIn * (1 - settle);
    const st: RayStyle = {fill, stroke: orangeO > 0 ? K.orange : undefined, w: 1.5, o: orangeO};
    layers.push(<Dial key="o" x={DD[0]} y={DD[1]} R={R} grow={grow} ray={() => st} />);
    if (settle > 0) layers.push(<Dial key="c" x={DD[0]} y={DD[1]} R={R} grow={grow} ray={() => ({stroke: K.cream, w: 1, o: O.mid * settle})} />);
  } else {
    ray = (i) => {
      if (i >= HITS.length || frame < execFrame(i)) return pending;
      const df = frame - execFrame(i);
      return df < 3 ? {fill: 1, stroke: K.orange, w: 2, o: 1} : {stroke: K.orange, w: 2, o: 1};
    };
    hubStyle = pending;
    layers.push(<Dial key="d" x={DD[0]} y={DD[1]} R={R} ray={ray} hubStyle={hubStyle} ns />);
  }
  // shockwave: dial + hexagon scale 1 → 2.6 about D (easeOutExpo), fade out, widths kept
  const sp = prog(t, SHOCK[0], SHOCK[1]);
  const sc = 1 + 1.6 * ease.outExpo(sp);
  const g = (
    <g opacity={r2(1 - sp)} transform={sp > 0 ? `translate(${DD[0]} ${DD[1]}) scale(${r2(sc * 1000) / 1000}) translate(${-DD[0]} ${-DD[1]})` : undefined}>
      {layers}
      <Hexagon t={t} frame={frame} />
    </g>
  );
  return g;
};

// Beat and hit rings (orange 45 %, 1 px).
export const ClimaxRings: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (frame < PTS_F || frame > EXEC13_F + 20) return null;
  return (
    <>
      {[304, 308].map((n) => (
        <ExpRing key={`a${n}`} t={t} t0={beat(n)} dur={0.4} cx={DD[0]} cy={DD[1]} r0={310} r1={360} />
      ))}
      {[316, 317, 318, 319].map((n) => (
        <ExpRing key={`b${n}`} t={t} t0={beat(n)} dur={0.4} cx={DD[0]} cy={DD[1]} r0={320} r1={420} />
      ))}
      {HITS.map((h, i) => (
        <ExpRing key={`h${i}`} t={t} t0={F(h.f)} dur={0.4} cx={DD[0]} cy={DD[1]} r0={320} r1={440} />
      ))}
      <ExpRing t={t} t0={F(EXEC13_F)} dur={0.6} cx={DD[0]} cy={DD[1]} r0={320} r1={1400} />
    </>
  );
};

// C8: the pen dot fades in at D (161.98) and glides to C (162.00–162.30).
export const ReturnDot: React.FC<{t: number}> = ({t}) => {
  if (t < 161.98 || t >= 162.632) return null;
  const o = prog(t, 161.98, 161.98 + 3 / FPS);
  const p = prog(t, 162.0, 162.3, ease.inOutCubic);
  return <PenHead x={DD[0]} y={lerp(DD[1], CC[1], p)} t={t} opacity={o} />;
};

// ------------------------------------------------------------------ pose cuts (Char layer)
const PointsCanvas: React.FC<{pts: number[][]; box: {x: number; y: number; w: number; h: number}; face: Pt; k: number; w: number; h: number; frame: number}> = ({
  pts,
  box,
  face,
  k,
  w,
  h,
  frame,
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext('2d')!;
    g.clearRect(0, 0, w, h);
    for (const cls of [0, 2, 1]) {
      g.fillStyle = cls === 1 ? K.orange : K.cream;
      g.globalAlpha = cls === 2 ? 0.5 : 1;
      g.beginPath();
      for (const [nx, ny, c] of pts) {
        if (c !== cls) continue;
        const x = face[0] + (box.x + nx * box.w - face[0]) * k;
        const y = face[1] + (box.y + ny * box.h - face[1]) * k;
        g.moveTo(x + 1.8, y);
        g.arc(x, y, 1.8, 0, Math.PI * 2);
      }
      g.fill();
    }
    g.globalAlpha = 1;
  }, [pts, box, face, k, w, h, frame]);
  return <canvas ref={ref} width={w} height={h} style={{position: 'absolute', left: 0, top: 0, width: w, height: h}} />;
};

export const PoseCut: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const k = hitAt(frame);
  if (k < 0) return null;
  const hit = HITS[k];
  const nextT = k + 1 < HITS.length ? HITS[k + 1].t : F(END_F);
  const P = PANEL[hit.panel];
  const cr = CROP[hit.crop];
  const bw = cr.h * ASPECT(hit.pose);
  const pcx = P.x + P.w / 2;
  const fa = FACE[hit.pose];
  const bx = hit.crop === 'full' ? pcx - bw / 2 : pcx - fa[0] * bw;
  // box in panel-local coordinates
  const box = {x: bx - P.x, y: cr.top - P.y, w: bw, h: cr.h};
  const face: Pt = [box.x + fa[0] * bw, box.y + fa[1] * cr.h];
  const push = 1 + 0.03 * clamp01((t - F(hit.f)) / (nextT - F(hit.f)));
  const df = frame - hit.f;
  const scan = df <= 6;
  const sy = P.h * clamp01(df / 6); // scan line, panel-local
  const img = (layer: 'flat' | 'lines') => (
    <div
      style={{
        position: 'absolute',
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        transform: `scale(${r2(push * 10000) / 10000})`,
        transformOrigin: `${r2(face[0] - box.x)}px ${r2(face[1] - box.y)}px`,
      }}
    >
      <Img src={staticFile(`char/${hit.pose}_${layer}.png`)} style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%'}} />
    </div>
  );
  const full: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: P.w, height: P.h};
  const upper = hit.tr === 'flat' ? img('flat') : img('lines');
  const lower =
    hit.tr === 'flat' ? (
      img('lines')
    ) : (
      <PointsCanvas pts={POINTS[hit.pose]!} box={box} face={face} k={push} w={P.w} h={P.h} frame={frame} />
    );
  const num = String(k + 1).padStart(2, '0');
  return (
    <>
      <div style={{position: 'absolute', left: P.x, top: P.y, width: P.w, height: P.h, overflow: 'hidden', background: K.bg}}>
        <div style={{...full, clipPath: scan ? `inset(0 0 ${r2(P.h - sy)}px 0)` : undefined}}>{upper}</div>
        {scan && <div style={{...full, clipPath: `inset(${r2(sy)}px 0 0 0)`}}>{lower}</div>}
      </div>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <rect x={P.x + 0.5} y={P.y + 0.5} width={P.w - 1} height={P.h - 1} fill="none" stroke={K.cream} strokeWidth={1} opacity={O.mid} />
        {scan && <path d={`M${P.x} ${r2(P.y + sy)}L${P.x + P.w} ${r2(P.y + sy)}`} stroke={K.orange} strokeWidth={2} />}
        <text x={P.x + 12} y={146} fontFamily={CODE} fontSize={16} stroke={K.bg} strokeWidth={6} strokeLinejoin="round" style={{paintOrder: 'stroke', whiteSpace: 'pre'}}>
          <tspan fill={K.creamDim}>{'exec '}</tspan>
          <tspan fill={K.orange}>{num}</tspan>
          <tspan fill={K.creamDim}>{`/12 · ${NAME[hit.pose]}`}</tspan>
        </text>
      </svg>
    </>
  );
};
