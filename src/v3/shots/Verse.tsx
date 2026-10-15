// Shots 13–19 (33.41–46.00 s), everything except the point cloud:
// circle, rolling unroll (2πr), sine wave, tangents, approach to infinity,
// the limit curve, and the tail (floor line, iris reveal of art b, boundary).
// Spec: docs/design_v3.md §4 shots 13–19, §5 moment C.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp01, CODE, ease, FPS, K, lerp, MATH, O, prog, useT} from '../core';
import {KEYWORDS} from '../data';
import {Arrow, circlePath, linePath, PenHead, Plot, polyPath, Spark, Svg} from '../geo';
import meta from '../char_meta.json';

const F = (f: number) => f / FPS;
// Keyword frames come from the shared timeline (data.ts), so each hit here
// lands on exactly the frame the stage keyword (ui.tsx StageKeyword) appears.
// This shot draws no keyword text of its own.
const kwFrame = (kw: string, fallback: number) => {
  const k = KEYWORDS.find((k) => k.kw === kw);
  return k ? Math.round(k.t * FPS) : fallback;
};
const HF14 = kwFrame('CIRCUMFERENCE', 1089);
const HF16 = kwFrame('TANGENTS', 1202);
const HF18 = kwFrame('LIMITATIONS', 1305);
const r2 = (v: number) => Math.round(v * 100) / 100;
const TAU = Math.PI * 2;

// ------------------------------------------------------------------ timing
const CIRC_A = 33.6, CIRC_B = 34.4; // shot 13 circle plot
const RAD_T = 34.2; // radius, centre dot, r label
const GLIDE_A = 34.65, GLIDE_B = 34.95; // shot 14 glide + baseline
const HIT14 = F(HF14); // 36.30: unroll complete
const S15 = 37.07, MORPH_B = 37.6, AXIS_A = 37.3, AXIS_B = 37.6;
const PRE16 = 38.45, S16 = 38.6, SLIDE_B = 40.6, HIT16 = F(HF16);
const S17 = 40.71, FLAT_B = 41.1;
const TICK_T = [40.763, 40.994, 41.225, 41.455, 41.686, 41.917, 42.148];
const LEM_A = 41.4, LEM_B = 42.3;
const S18 = 42.35, SLIDE18_B = 42.65, ASY_A = 42.4, ASY_B = 42.7, CRV_A = 42.55, HIT18 = F(HF18);
const S19 = 44.455, UNPLOT_B = 44.79, MORPH19_B = 44.8;
const PEN_GLIDE_A = 44.36, PEN_GLIDE_B = 44.6;
const IRIS_A = 44.6, IRIS_B = 45.0;
const BOUND_A = 45.378, BOUND_B = 45.778;
const SPARK_T = 44.917;

const f6 = 6 / FPS;
const f5 = 5 / FPS;

// ------------------------------------------------------------------ geometry
const R = 160;
const C13 = {x: 960, y: 400};
const X0 = 457; // unroll start / wave origin
const CIRC = TAU * R; // 1005.3
const BASE_Y = 560;
const WP = 1006; // wave domain width (4π)
const WX1 = X0 + WP;
const AX_Y = 420;

const waveY = (x: number, yb: number, A: number) => yb - A * Math.sin((4 * Math.PI * (x - X0)) / WP);
const wavePath = (yb: number, A: number) => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 200; i++) {
    const x = X0 + (WP * i) / 200;
    pts.push([x, waveY(x, yb, A)]);
  }
  return polyPath(pts);
};
const slope = (u: number, A: number) => -A * ((4 * Math.PI) / WP) * Math.cos(4 * Math.PI * u);
const wavePt = (u: number, A: number) => ({x: X0 + WP * u, y: waveY(X0 + WP * u, AX_Y, A)});

// Arc polyline from angle a0 to a1 (radians, screen space: 0 = 3 o'clock, + = clockwise).
const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const n = Math.max(2, Math.ceil((Math.abs(a1 - a0) / TAU) * 128));
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return polyPath(pts);
};

// Lemniscate of Bernoulli at (960, 260), a = 200, starting at the crossing.
const LEM = (() => {
  const a = 200, pts: [number, number][] = [];
  for (let i = 0; i <= 320; i++) {
    const s = Math.PI / 2 + (TAU * i) / 320;
    const d = 1 + Math.sin(s) ** 2;
    pts.push([960 + (a * Math.cos(s)) / d, 260 + (a * Math.sin(s) * Math.cos(s)) / d]);
  }
  return polyPath(pts);
})();

// Limit curve y = 220 + 400·e^(−(x − 360)/240).
const limY = (x: number) => 220 + 400 * Math.exp(-(x - 360) / 240);
const limPath = (xe: number) => {
  const n = Math.max(2, Math.ceil((160 * (xe - 360)) / 1008));
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const x = 360 + ((xe - 360) * i) / n;
    pts.push([x, limY(x)]);
  }
  return polyPath(pts);
};

// Halving ticks toward x = 1800 (7 timed + 20 in the burst).
const TICK_X = Array.from({length: 27}, (_, k) => 1800 - 1343 / 2 ** k);
const penRunX = (t: number) => 1800 - 1343 * Math.exp(-2.2 * (t - S17));

// Art b placement (moment C): figure height 360, width ≤ 340, bottom on y = 600, centred x = 960.
const B = (() => {
  const m = meta.b;
  const [bx0, by0, bx1, by1] = m.bbox;
  const s = Math.min(360 / ((by1 - by0) * m.h), 340 / ((bx1 - bx0) * m.w));
  const w = m.w * s, h = m.h * s;
  return {left: 960 - ((bx0 + bx1) / 2) * w, top: 600 - by1 * h, w, h};
})();

// ------------------------------------------------------------------ small parts
const Ln: React.FC<{x1: number; y1: number; x2: number; y2: number; c?: string; w?: number; o?: number; dash?: string}> = ({
  x1,
  y1,
  x2,
  y2,
  c = K.cream,
  w = 1.5,
  o = 1,
  dash,
}) => (o <= 0 ? null : <path d={linePath(x1, y1, x2, y2)} stroke={c} strokeWidth={w} opacity={o} strokeDasharray={dash} strokeLinecap="round" fill="none" />);

const Path: React.FC<{d: string; c?: string; w?: number; o?: number}> = ({d, c = K.cream, w = 1.5, o = 1}) =>
  o <= 0 ? null : <path d={d} stroke={c} strokeWidth={w} opacity={o} fill="none" strokeLinecap="round" strokeLinejoin="round" />;

// Text that types in over `dur` and exits by lifting 14 px and fading over 5 frames.
const Txt: React.FC<{
  t: number;
  t0: number;
  tOut?: number;
  x: number;
  y: number;
  parts: {s: string; font: string; size: number; color: string; italic?: boolean}[];
  anchor?: 'start' | 'middle' | 'end';
  opacity?: number;
  dur?: number;
}> = ({t, t0, tOut = Infinity, x, y, parts, anchor = 'start', opacity = 1, dur = f5}) => {
  if (t < t0) return null;
  const ex = clamp01((t - tOut) / f5);
  const o = opacity * (1 - ex);
  if (o <= 0) return null;
  const total = parts.reduce((a, p) => a + Array.from(p.s).length, 0);
  let shown = Math.ceil(total * clamp01((t - t0 + 1 / FPS) / dur));
  return (
    <text x={r2(x)} y={r2(y - 14 * ex)} textAnchor={anchor} opacity={o}>
      {parts.map((p, i) => {
        const ch = Array.from(p.s);
        const vis = Math.max(0, Math.min(ch.length, shown));
        shown -= vis;
        const style = {fontFamily: p.font, fontSize: p.size, fontStyle: p.italic ? 'italic' : 'normal'};
        return (
          <React.Fragment key={i}>
            {vis > 0 && (
              <tspan {...style} fill={p.color}>
                {ch.slice(0, vis).join('')}
              </tspan>
            )}
            {vis < ch.length && (
              <tspan {...style} fill={p.color} fillOpacity={0}>
                {ch.slice(vis).join('')}
              </tspan>
            )}
          </React.Fragment>
        );
      })}
    </text>
  );
};
const math = (s: string, size: number, color: string = K.cream) => ({s, font: MATH, size, color, italic: true});
const mono = (s: string, size: number, color: string = K.creamDim) => ({s, font: CODE, size, color});

// ------------------------------------------------------------------ shots 13–14: circle and unroll
const CircleUnroll: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < CIRC_A || t >= S15 + 0.5) return null;
  const hit = frame >= HF14;
  const glide = prog(t, GLIDE_A, GLIDE_B, ease.inOutCubic);
  const p = prog(t, GLIDE_B, HIT14, ease.inOutSine);
  const cx = t < GLIDE_B ? lerp(C13.x, X0, glide) : X0 + CIRC * p;
  const cy = C13.y;
  const out: React.ReactNode[] = [];

  // baseline (1 px cream 45 %), plotted with the glide, fades at shot 15
  const baseO = O.mid * (1 - prog(t, S15, S15 + f6));
  if (t >= GLIDE_A) out.push(<Plot key="base" d={linePath(X0, BASE_Y, WX1, BASE_Y)} p={prog(t, GLIDE_A, GLIDE_B, ease.inOutCubic)} w={1} opacity={baseO} t={t} />);

  // circle / remaining arc
  if (t < GLIDE_B) {
    out.push(<Plot key="circ" d={circlePath(cx, cy, R)} p={prog(t, CIRC_A, CIRC_B, ease.inOutCubic)} w={2} t={t} />);
  } else if (p < 1) {
    const a0 = Math.PI / 2; // contact point (bottom); remaining arc runs forward (counter-clockwise on screen)
    out.push(<Path key="arc" d={arcPath(cx, cy, R, a0, a0 - TAU * (1 - p))} w={2} />);
  }

  // laid segment
  if (t >= GLIDE_B && t < S15) {
    if (!hit) out.push(<Ln key="seg" x1={X0} y1={BASE_Y} x2={cx} y2={BASE_Y} w={2} />);
    else {
      const xe = X0 + CIRC;
      out.push(<Ln key="seg" x1={X0} y1={BASE_Y} x2={xe} y2={BASE_Y} w={3} c={K.orange} />);
      out.push(<Ln key="tk0" x1={X0} y1={BASE_Y - 8} x2={X0} y2={BASE_Y + 8} w={2} c={K.orange} />);
      out.push(<Ln key="tk1" x1={xe} y1={BASE_Y - 8} x2={xe} y2={BASE_Y + 8} w={2} c={K.orange} />);
    }
  }
  // end ticks fade at shot 15
  if (t >= S15) {
    const o = 1 - prog(t, S15, S15 + f6);
    const xe = X0 + CIRC;
    out.push(<Ln key="tk0" x1={X0} y1={BASE_Y - 8} x2={X0} y2={BASE_Y + 8} w={2} c={K.orange} o={o} />);
    out.push(<Ln key="tk1" x1={xe} y1={BASE_Y - 8} x2={xe} y2={BASE_Y + 8} w={2} c={K.orange} o={o} />);
  }

  // radius marker + centre dot (rotate 2πp clockwise while rolling, fade as the circle runs out)
  if (t >= RAD_T && p < 1) {
    const ang = TAU * p;
    const o = 1 - clamp01((p - 0.86) / 0.14);
    const d = linePath(cx, cy, cx + R * Math.cos(ang), cy + R * Math.sin(ang));
    out.push(<Plot key="rad" d={d} p={prog(t, RAD_T, RAD_T + 4 / FPS, ease.inOutCubic)} w={1.5} opacity={O.hi * o} pen={false} />);
    out.push(<circle key="cd" cx={r2(cx)} cy={cy} r={3} fill={K.cream} opacity={o} />);
  }
  // r label rides with the circle, exits as the glide starts
  out.push(<Txt key="r" t={t} t0={RAD_T + 2 / FPS} tOut={GLIDE_A} x={cx + R / 2} y={cy - 14} anchor="middle" parts={[math('r', 36)]} />);

  // contact pen head while rolling
  if (t >= GLIDE_B && !hit) out.push(<PenHead key="pen" x={cx} y={BASE_Y} t={t} />);

  // 2πr label
  if (hit) out.push(<Txt key="2pr" t={t} t0={HIT14} tOut={S15} x={X0 + CIRC / 2} y={541} anchor="middle" parts={[math('2πr', 40)]} dur={3 / FPS} />);
  return <>{out}</>;
};

// ------------------------------------------------------------------ shots 15–17: wave, tangents, flattening
const waveA = (t: number) => (t < S15 ? 0 : t < S17 ? 140 * prog(t, S15, MORPH_B, ease.inOutCubic) : 140 * (1 - prog(t, S17, FLAT_B, ease.inOutCubic)));
const waveYb = (t: number) => lerp(BASE_Y, AX_Y, prog(t, S15, MORPH_B, ease.inOutCubic));

// Slider parameter u: the resting pen glides to u = 0.04, then the dot slides to 0.96.
const sliderU = (t: number) =>
  t < PRE16 ? 0 : t < S16 ? 0.04 * prog(t, PRE16, S16, ease.inOutCubic) : 0.04 + 0.92 * prog(t, S16, SLIDE_B, ease.inOutSine);

const tangentD = (u: number, A: number, half: number) => {
  const P = wavePt(u, A);
  const m = slope(u, A);
  const n = Math.hypot(1, m);
  const dx = half / n, dy = (half * m) / n;
  return linePath(P.x - dx, P.y - dy, P.x + dx, P.y + dy);
};

const Wave: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < S15 || t >= S18 + 0.5) return null;
  const out: React.ReactNode[] = [];
  const A = waveA(t);
  const yb = waveYb(t);

  // the wave itself; morphs out of the orange segment and fades once flat
  const wO = 1 - prog(t, FLAT_B, FLAT_B + f6);
  if (wO > 0) {
    const d = wavePath(yb, A);
    out.push(<Path key="w" d={d} w={2} o={wO} />);
    const orangeO = 1 - prog(t, S15, S15 + f6);
    if (orangeO > 0) out.push(<Path key="wo" d={d} w={3} c={K.orange} o={orangeO} />);
  }

  // π tick labels
  const PI = ['0', 'π', '2π', '3π', '4π'];
  PI.forEach((s, k) =>
    out.push(<Txt key={'pi' + k} t={t} t0={AXIS_A + (2 * k) / FPS} tOut={S17} x={X0 + (WP / 4) * k} y={600} anchor="middle" parts={[math(s, 26, K.cream)]} opacity={O.hi} dur={2 / FPS} />),
  );

  // resting pen at the wave's left end (37.07–38.60), then the slider
  const u = sliderU(t);
  if (t < S16) {
    const fin = prog(t, S15, S15 + 3 / FPS);
    const P = t < PRE16 ? {x: X0, y: yb} : wavePt(u, A);
    out.push(<PenHead key="pen" x={P.x} y={P.y} t={t} opacity={fin} />);
  } else if (t < S17 + f6) {
    const P = wavePt(u, A);
    const k = prog(t, S16, S16 + 3 / FPS);
    const fo = 1 - prog(t, S17, S17 + f6);
    out.push(
      <g key="slider" opacity={fo}>
        <circle cx={r2(P.x)} cy={r2(P.y)} r={9} fill="none" stroke={K.orange} strokeWidth={1} opacity={0.45 * (1 - k)} />
        <circle cx={r2(P.x)} cy={r2(P.y)} r={lerp(4, 5, k)} fill={K.orange} />
      </g>,
    );
  }

  // fan of 17 tangents at f1202
  if (frame >= HF16 && t < S17 + 8 / FPS) {
    const un = 1 - prog(t, S17, S17 + 8 / FPS, ease.inOutCubic);
    for (let k = 0; k <= 16; k++) {
      const g = ease.outCubic(clamp01((t - HIT16 - (k * 0.5) / FPS + 1 / FPS) / (4 / FPS)));
      const half = 100 * g * un;
      if (half > 0.5) out.push(<Path key={'fan' + k} d={tangentD(k / 16, A, half)} w={1} o={O.mid} />);
    }
  }

  // active tangent + "you" circle
  if (t >= S16 && t < S17 + 8 / FPS) {
    const grow = prog(t, S16, S16 + 8 / FPS, ease.inOutCubic) * (1 - prog(t, S17, S17 + 8 / FPS, ease.inOutCubic));
    const hit = frame >= HF16;
    if (grow > 0) out.push(<Path key="tan" d={tangentD(u, A, 180 * grow)} w={hit ? 2 : 1.5} c={hit ? K.orange : K.cream} />);
    const P = wavePt(u, A);
    const m = slope(u, A);
    const n = Math.hypot(1, m);
    const dx = 1 / n, dy = m / n; // along the tangent, forward
    const nx = m / n, ny = -1 / n; // upward normal
    const yc = {x: P.x + 64 * dx + 11.5 * nx, y: P.y + 64 * dy + 11.5 * ny};
    const yp = prog(t, S16 + 4 / FPS, S16 + 10 / FPS, ease.inOutCubic) * (1 - prog(t, S17, S17 + 8 / FPS, ease.inOutCubic));
    if (yp > 0) {
      // start the circle at its contact point with the tangent
      const a0 = (Math.atan2(-ny, -nx) * 180) / Math.PI;
      out.push(<Plot key="you" d={circlePath(yc.x, yc.y, 10, a0)} p={yp} w={1.5} pen={false} />);
    }
  }
  return <>{out}</>;
};

// ------------------------------------------------------------------ axis (37.30 → 44.79)
// Axis geometry over time: left end, right end, y.
const axisGeo = (t: number) => {
  let x1 = 420, x2 = 1500, y = AX_Y;
  if (t >= S17) x2 = lerp(1500, 1800, prog(t, S17, S17 + 8 / FPS, ease.inOutCubic));
  if (t >= S18) {
    const m = prog(t, S18, SLIDE18_B, ease.inOutCubic);
    x1 = lerp(420, 360, m);
    x2 = lerp(1800, 1560, m);
    y = lerp(AX_Y, 620, m);
  }
  return {x1, x2, y};
};
// Maps an x on the shot-17 axis (420–1800) onto the current axis.
const mapX = (t: number, x: number) => {
  const g = axisGeo(t);
  return g.x1 + ((x - 420) * (g.x2 - g.x1)) / 1380;
};

const Axis: React.FC<{t: number}> = ({t}) => {
  if (t < AXIS_A || t >= UNPLOT_B) return null;
  const g = axisGeo(t);
  const o = lerp(O.lo, O.mid, prog(t, S17, S17 + f6));
  const out: React.ReactNode[] = [];
  const pIn = prog(t, AXIS_A, AXIS_B, ease.inOutCubic);
  const pOut = 1 - prog(t, S19, UNPLOT_B, ease.inOutCubic);
  const xe = g.x1 + (g.x2 - g.x1) * pIn * pOut;
  out.push(<Ln key="ax" x1={g.x1} y1={g.y} x2={xe} y2={g.y} w={1} o={o} />);
  if (t >= S17) {
    const ao = prog(t, S17, S17 + 4 / FPS) * (1 - prog(t, S19, S19 + 4 / FPS));
    if (ao > 0) out.push(<Arrow key="arr" x={g.x2} y={g.y} angle={0} size={10} w={1} color={K.cream} opacity={o * ao} />);
  }
  return <>{out}</>;
};

// ------------------------------------------------------------------ shot 17: halving ticks, runner, lemniscate
const Infinity17: React.FC<{t: number}> = ({t}) => {
  if (t < S17 || t >= S18 + 0.5) return null;
  const out: React.ReactNode[] = [];
  const g = axisGeo(t);
  const un = 1 - prog(t, S18, S18 + 8 / FPS, ease.inOutCubic); // un-plot factor

  // trace behind the runner (merges with the flattened wave)
  const runX = penRunX(Math.min(t, S18));
  const traceEnd = X0 + (runX - X0) * un;
  if (traceEnd > X0 + 0.5) out.push(<Ln key="trace" x1={mapX(t, X0)} y1={g.y} x2={mapX(t, traceEnd)} y2={g.y} w={2} />);

  // ticks: 7 timed, then a burst of 20 over 4 frames
  for (let k = 0; k < TICK_X.length; k++) {
    const t0 = k < 7 ? TICK_T[k] : TICK_T[6] + 1 / FPS + ((k - 7) / 20) * (4 / FPS);
    if (t < t0) break;
    const hh = k < 7 ? 8 : 6;
    const p = clamp01((t - t0 + 1 / FPS) / ((k < 7 ? 3 : 2) / FPS)) * un;
    if (p <= 0) continue;
    const x = mapX(t, TICK_X[k]);
    out.push(<Ln key={'tk' + k} x1={x} y1={g.y - hh} x2={x} y2={g.y - hh + 2 * hh * p} w={1} o={O.hi} />);
  }
  ['1', '2', '4', '8'].forEach((s, k) =>
    out.push(<Txt key={'tl' + k} t={t} t0={TICK_T[k]} tOut={S18} x={mapX(t, TICK_X[k])} y={g.y + 36} anchor="middle" parts={[mono(s, 20)]} dur={1 / FPS} />),
  );

  // runner pen head
  const po = prog(t, S17, S17 + 2 / FPS) * (1 - prog(t, S18, S18 + 4 / FPS));
  if (po > 0) out.push(<PenHead key="run" x={mapX(t, runX)} y={g.y} t={t} opacity={po} />);

  // lemniscate
  const lp = t < S18 ? prog(t, LEM_A, LEM_B, ease.inOutCubic) : 1 - prog(t, S18, S18 + 8 / FPS, ease.inOutCubic);
  out.push(<Plot key="lem" d={LEM} p={lp} w={2} t={t} pen={t < S18} />);
  return <>{out}</>;
};

// ------------------------------------------------------------------ shots 18–19: limit, tail
const Limit: React.FC<{t: number; frame: number; full?: boolean}> = ({t, frame, full = false}) => {
  if (t < ASY_A) return null;
  const out: React.ReactNode[] = [];
  const hit = frame >= HF18;

  // asymptote: dashed → solid orange → morphs into the floor line
  if (!hit) {
    out.push(<Plot key="asy" d={linePath(360, 220, 1560, 220)} p={prog(t, ASY_A, ASY_B, ease.inOutCubic)} w={2} opacity={O.hi} dash="12 10" t={t} cap="butt" />);
  } else {
    const m = prog(t, S19, MORPH19_B, ease.inOutCubic);
    const x1 = lerp(360, 640, m), x2 = lerp(1560, 1280, m), y = lerp(220, 600, m), w = lerp(2, 1.5, m);
    out.push(<Ln key="floor" x1={x1} y1={y} x2={x2} y2={y} w={w} o={O.mid * m} />);
    out.push(<Ln key="asyO" x1={x1} y1={y} x2={x2} y2={y} w={w} c={K.orange} o={1 - m} />);
  }

  // decelerating curve; un-plots from its tip at the tail
  if (t >= CRV_A && t < UNPLOT_B) {
    const q = prog(t, CRV_A, HIT18, ease.outQuart);
    const back = 1 - prog(t, S19, UNPLOT_B, ease.inOutCubic);
    const xe = 360 + 1008 * q * back;
    if (xe > 360.5) out.push(<Path key="crv" d={limPath(xe)} w={2} />);
  }

  // labels
  out.push(<Txt key="L" t={t} t0={HIT18} tOut={S19} x={340} y={234} anchor="end" parts={[math('L', 40)]} dur={1 / FPS} />);
  out.push(<Txt key="lim" t={t} t0={HIT18} tOut={S19} x={1560} y={200} anchor="end" parts={[mono('limit = ', 22), math('L', 26, K.creamDim)]} />);

  // pen: curve tip → glide to the iris centre → closes into the iris
  if (t >= CRV_A && t < IRIS_A + 4 / FPS) {
    const q = prog(t, CRV_A, HIT18, ease.outQuart);
    const tip = {x: 360 + 1008 * q, y: limY(360 + 1008 * q)};
    // in the full MV the pen stays on the tip (section A takes it from there)
    const gp = full ? 0 : prog(t, PEN_GLIDE_A, PEN_GLIDE_B, ease.inOutCubic);
    const x = lerp(tip.x, 960, gp), y = lerp(tip.y, 400, gp);
    const s = 1 - prog(t, IRIS_A, IRIS_A + 4 / FPS, ease.inCubic);
    out.push(<PenHead key="pen" x={x} y={y} t={t} scale={Math.max(0.001, s)} />);
  }
  return <>{out}</>;
};

const IrisArt: React.FC<{t: number}> = ({t}) => {
  if (t < IRIS_A) return null;
  const r = 240 * prog(t, IRIS_A, IRIS_B, ease.outExpo);
  return (
    <AbsoluteFill style={{clipPath: `circle(${r2(r)}px at 960px 400px)`}}>
      <Img
        src={staticFile('char/b_flat.png')}
        style={{position: 'absolute', left: r2(B.left), top: r2(B.top), width: r2(B.w), height: r2(B.h)}}
      />
    </AbsoluteFill>
  );
};

const IrisLines: React.FC<{t: number}> = ({t}) => {
  if (t < IRIS_A) return null;
  const r = 240 * prog(t, IRIS_A, IRIS_B, ease.outExpo);
  return (
    <>
      {r > 0.5 && <circle cx={960} cy={400} r={r2(r)} fill="none" stroke={K.cream} strokeWidth={1.5} opacity={O.mid} />}
      <Plot d={circlePath(960, 400, 256)} p={prog(t, BOUND_A, BOUND_B, ease.inOutCubic)} color={K.orange} w={1} opacity={0.45} t={t} />
    </>
  );
};

// ------------------------------------------------------------------ exports
export const Verse: React.FC<{full?: boolean}> = ({full = false}) => {
  const {t, frame} = useT();
  if (t < CIRC_A) return null;
  return (
    <AbsoluteFill>
      <Svg>
        <Axis t={t} />
        <CircleUnroll t={t} frame={frame} />
        <Wave t={t} frame={frame} />
        <Infinity17 t={t} />
        <Limit t={t} frame={frame} full={full} />
      </Svg>
      <IrisArt t={t} />
      <Svg>
        <IrisLines t={t} />
      </Svg>
    </AbsoluteFill>
  );
};

// Drawn above the global fade: the final spark (R = 18 at (960, 128)).
export const VerseTop: React.FC = () => {
  const {t} = useT();
  if (t < SPARK_T) return null;
  const grow = prog(t, SPARK_T, SPARK_T + 8 / FPS, ease.outExpo);
  const o = 1 - prog(t, 45.7, 45.95);
  if (o <= 0) return null;
  return (
    <Svg>
      <Spark x={960} y={128} R={18} rot={4 * (t - SPARK_T)} grow={grow} hub={clamp01(grow * 3)} opacity={o} />
    </Svg>
  );
};
