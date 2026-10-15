// Section A, shots 19–24 (44.452–59.228 s): the limit becomes the power line
// and its knife switch, AC → rectified → DC, the eye and its aperture, the
// dizzy polygons, the year axis (no year 0) and the Venn union with its tunnel.
// Spec: docs/design_A.md A.1 shots 19–24, A.4 (hand-over state).
import React from 'react';
import {beat, BEAT, clamp01, CODE, ease, FPS, K, lerp, O, prog, pulse} from '../core';
import {Arrow, circlePath, fnPath, linePath, ngonPath, PenHead, Plot} from '../geo';
import {DEG, F, f1, Ln, math, mono, Path, r2, Retype, TAU, Txt} from './A_lib';

const b = beat;
const f6 = 6 / FPS, f8 = 8 / FPS;
const T0 = F(1334);

// ------------------------------------------------------------------ shots 19–21: one line
// The limit curve collapses onto the asymptote, which becomes the power line
// (knife switch, current), then a travelling cosine (AC), full-wave rectified,
// smoothed to DC, and finally the eye's lids.
const B96 = b(96), B97 = b(97), B98 = b(98), B99 = b(99), B100 = b(100), B101 = b(101), B102 = b(102), B103 = b(103);
const B104 = b(104), B105 = b(105), B106 = b(106), B107 = b(107);
const LAND = F(1365); // lever lands
const LIM_TIP = 400 * Math.exp(-(1368 - 360) / 240); // 6.0: curve tip above the asymptote

const morphM = (t: number) => prog(t, B96, B97, ease.inOutCubic);
const extE = (t: number) => prog(t, B96, B97, ease.inOutCubic);
const glide19 = (t: number) => prog(t, B97, B98, ease.inOutCubic);
const waveA = (t: number) => 90 * prog(t, B100, B101, ease.inOutCubic);
const rectM = (t: number) => prog(t, B101, B101 + f6, ease.inOutCubic);
const dcS = (t: number) => prog(t, B102, B102 + f8, ease.inOutCubic);
const glide21 = (t: number) => prog(t, B103, B104, ease.inOutCubic);

const lineY = (x: number, t: number) => {
  if (t < B97) return 220;
  if (t < B100) return lerp(220, 390, glide19(t));
  const c = Math.cos(TAU * ((x - 1368) / 240 - (t - B100) / BEAT));
  const v = lerp(lerp(c, Math.abs(c), rectM(t)), 2 / Math.PI, dcS(t));
  return 390 - waveA(t) * v * (1 - glide21(t));
};
const lineX = (t: number): [number, number] => {
  const e = extE(t), g = glide21(t);
  return [lerp(lerp(360, 120, e), 640, g), lerp(lerp(1560, 1800, e), 1280, g)];
};
const waving = (t: number) => t >= B100 && waveA(t) * (1 - glide21(t)) * (1 - dcS(t)) > 0.01;
const linePathAt = (t: number, xa: number, xb: number) => {
  if (!waving(t)) {
    const y = lineY(960, t);
    return linePath(xa, y, xb, y);
  }
  const n = Math.max(2, Math.round((xb - xa) / 4));
  return fnPath((x) => lineY(x, t), xa, xb, n);
};

// Knife switch lever: hinge (1248, y), length 120, angle (deg, negative opens upward).
const leverAng = (t: number) => (t < B98 ? -30 * prog(t, B97, B97 + f6, ease.outExpo) : -30 * (1 - prog(t, B98, LAND, ease.inCubic)));
const unlever = (t: number) => prog(t, B99, B99 + f6, ease.inOutCubic);

const fmtV = (v: number) => {
  const s = Math.abs(v).toFixed(2);
  return (v < 0 && s !== '0.00' ? '−' : '+') + s;
};

const PowerLine: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t >= B104) return null;
  const out: React.ReactNode[] = [];
  const [xa, xb] = lineX(t);
  const g = glide19(t);
  const y0 = lineY(960, t);

  // axis y = 620 un-plots from its arrow end (8 frames); arrowhead fades over 4
  const axP = 1 - prog(t, T0, T0 + f8, ease.inOutCubic);
  if (axP > 0) {
    const xe = 360 + 1200 * axP;
    out.push(<Ln key="ax" x1={360} y1={620} x2={xe} y2={620} w={1} o={O.mid} />);
    const ao = 1 - prog(t, T0, T0 + 4 / FPS);
    if (ao > 0) out.push(<Arrow key="axa" x={xe} y={620} angle={0} size={10} w={1} color={K.cream} opacity={O.mid * ao} />);
  }
  // labels lift-fade from f1334
  out.push(<Txt key="L" t={t} t0={0} tOut={T0} x={340} y={234} anchor="end" parts={[math('L', 40)]} dur={f1} />);
  out.push(<Txt key="lim" t={t} t0={0} tOut={T0} x={1560} y={200} anchor="end" parts={[mono('limit = ', 22), math('L', 26, K.creamDim)]} dur={f1} />);

  // the limit curve morphs onto the asymptote, then fades (44.80–44.92)
  const co = 1 - prog(t, 44.8, 44.92);
  if (co > 0) {
    const m = morphM(t);
    out.push(<Path key="crv" d={fnPath((x) => 220 + 400 * Math.exp(-(x - 360) / 240) * (1 - m), 360, 1368, 160)} w={2} o={co} />);
  }

  // the line: 2 px orange → 1.5 px cream 70 % (b97 → b98); split around the lever until b99
  const split = t >= B97 && t < B99;
  const segs: [number, number][] = split ? [[xa, 1248], [1368, xb]] : [[xa, xb]];
  segs.forEach(([s0, s1], i) => {
    const d = linePathAt(t, s0, s1);
    if (g < 1) out.push(<Path key={'lo' + i} d={d} c={K.orange} w={lerp(2, 1.5, g)} o={1 - g} />);
    if (g > 0) out.push(<Path key={'lc' + i} d={d} w={1.5} o={O.hi * g} />);
  });
  // temporary pen heads at the extending ends
  const e = extE(t);
  if (e > 0 && e < 1) {
    out.push(<PenHead key="pl" x={xa} y={y0} t={t} />);
    out.push(<PenHead key="pr" x={xb} y={y0} t={t} />);
  }

  // knife switch
  if (t >= B97 && unlever(t) < 1) {
    const u = unlever(t);
    const a = leverAng(t) * DEG;
    const len = 120 * (1 - u);
    const flash = frame >= 1365 && frame < 1368;
    if (len > 0.5) out.push(<Ln key="lev" x1={1248} y1={y0} x2={1248 + len * Math.cos(a)} y2={y0 + len * Math.sin(a)} w={flash ? 3 : 2} c={flash ? K.orange : K.cream} />);
    const hr = 5 + 2.5 * pulse(t);
    const hp = Math.min(prog(t, B97, B97 + 4 / FPS), 1 - u);
    out.push(<circle key="hingeBg" cx={1248} cy={r2(y0)} r={r2(hr)} fill={K.bg} opacity={hp > 0 ? 1 : 0} />);
    out.push(<Plot key="hinge" d={circlePath(1248, y0, hr, 180)} p={hp} w={1.5} pen={false} />);
  }
  // current: orange dashes flowing left → right at 240 px/s (f1365 → b99 + 6 f)
  const curO = t >= LAND ? 1 - prog(t, B99, B99 + f6) : 0;
  if (curO > 0)
    out.push(
      <path
        key="cur"
        d={linePath(120, 390, 1800, 390)}
        stroke={K.orange}
        strokeWidth={3}
        strokeDasharray="24 96"
        strokeDashoffset={r2(-240 * (t - LAND))}
        opacity={curO}
        fill="none"
      />,
    );

  // shot 20 labels
  const LO = B103; // labels lift-fade
  out.push(
    <Retype key="ac" t={t} states={[{t0: B100, s: 'AC'}, {t0: B102, s: 'DC'}]} tOut={LO} x={120} y={250} part={(s) => mono(s, 22, K.cream, O.hi)} dur={3 / FPS} />,
  );
  out.push(
    <Retype
      key="vm"
      t={t}
      states={[
        {t0: B100, s: 'V = A cos ωt'},
        {t0: B101, s: 'V = A |cos ωt|'},
        {t0: B102, s: 'V = 2A/π'},
      ]}
      tOut={LO}
      x={1800}
      y={250}
      anchor="end"
      part={(s) => ({...math(s, 30), op: O.hi})}
    />,
  );
  // DC reference line and dimension marker (b102), un-plotted on b103
  if (t >= B102) {
    const pin = prog(t, B102, B102 + f8, ease.inOutCubic);
    const un = 1 - prog(t, B103, B103 + f6, ease.inOutCubic);
    out.push(<Plot key="ref" d={linePath(120, 390, 1800, 390)} p={Math.min(pin, un)} w={1} opacity={O.mid} dash="6 6" pen={false} cap="butt" />);
    const yTop = 390 - (390 - 332.7) * Math.min(pin, un);
    if (390 - yTop > 0.5) {
      out.push(<Ln key="dim" x1={1500} y1={390} x2={1500} y2={yTop} w={1} o={O.mid} />);
      out.push(<Ln key="dimb" x1={1496} y1={390} x2={1504} y2={390} w={1} o={O.mid} />);
      out.push(<Ln key="dimt" x1={1496} y1={yTop} x2={1504} y2={yTop} w={1} o={O.mid * Math.min(pin, un)} />);
    }
  }

  // pen: curve tip → rides the line at x 1368 (probe) → the right end of the DC line
  const m = morphM(t);
  const px = lerp(1368, 1280, glide21(t));
  const py = t < B97 ? 220 + LIM_TIP * (1 - m) : lineY(px, t);
  out.push(<PenHead key="pen" x={px} y={py} t={t} />);
  // probe readout V = (390 − y)/90
  if (t >= B100) {
    const v = (390 - lineY(1368, t)) / 90;
    out.push(<Txt key="V" t={t} t0={B100} tOut={LO} x={1388} y={py - 18} parts={[mono(`V = ${fmtV(v)}`, 16)]} dur={3 / FPS} />);
  }
  return <>{out}</>;
};

// ------------------------------------------------------------------ shot 21: the eye and its aperture
const IRIS_T = 48.381, HOUSE_T = 48.843, SHUT_F = 1472;
const lidH = (t: number) => (t < B106 ? 110 * prog(t, B104, B104 + f8, ease.inOutCubic) : 110 * (1 - prog(t, B106, B107, ease.inCubic)));
const rho = (t: number) => 150 * (1 - prog(t, HOUSE_T, F(SHUT_F), ease.inCubic));
const lidPath = (h: number, s: number) => `M 640 390 Q 960 ${r2(390 + s * 2 * h)} 1280 390`;
const CIRCLE150 = `M 810 390 A 150 150 0 1 0 1110 390 A 150 150 0 1 0 810 390 Z`;

const Eye: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < B104 || t >= B107 + 10 / FPS) return null;
  const out: React.ReactNode[] = [];
  const h = lidH(t);
  const closed = t >= B107;
  if (!closed) {
    out.push(<Path key="lu" d={lidPath(h, -1)} w={1.5} />);
    if (h > 0.05) out.push(<Path key="ld" d={lidPath(h, 1)} w={1.5} />);
  } else {
    // flat line un-plots from both ends into C (8 frames)
    const u = prog(t, B107, B107 + f8, ease.inOutCubic);
    if (u < 1) out.push(<Ln key="flat" x1={lerp(640, 960, u)} y1={390} x2={lerp(1280, 960, u)} y2={390} w={1.5} />);
    if (u > 0 && u < 1) out.push(<PenHead key="pl" x={lerp(640, 960, u)} y={390} t={t} />);
  }
  const hidden = frame >= SHUT_F; // iris and pupil are fully under the shutter
  if (!hidden) {
    out.push(<Plot key="iris" d={circlePath(960, 390, 80)} p={prog(t, IRIS_T, IRIS_T + f6, ease.inOutCubic)} w={1.5} t={t} />);
    const ps = prog(t, B105, B105 + 4 / FPS, ease.outExpo);
    if (ps > 0) {
      out.push(<circle key="ring" cx={960} cy={390} r={40} fill="none" stroke={K.cream} strokeWidth={1} opacity={O.mid * ps} />);
      out.push(<circle key="pupil" cx={960} cy={390} r={r2(26 * ps * (1 + 0.15 * pulse(t)))} fill={K.orange} />);
    }
  }
  // aperture: mask (bg, even-odd) above the eye, blades and housing above it
  if (t >= HOUSE_T) {
    const fo = 1 - prog(t, B107, B107 + f6);
    const r = rho(t);
    const V: [number, number][] = [];
    const A: number[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (-90 + 60 * i + 40 * (1 - r / 150)) * DEG;
      A.push(a);
      V.push([960 + r * Math.cos(a), 390 + r * Math.sin(a)]);
    }
    const hex = 'M ' + V.map(([x, y]) => `${r2(x)} ${r2(y)}`).join(' L ') + ' Z';
    out.push(<path key="mask" d={`${CIRCLE150} ${hex}`} fill={K.bg} fillRule="evenodd" opacity={fo} />);
    V.forEach(([vx, vy], i) => {
      const a = A[i] + 120 * DEG;
      const dx = Math.cos(a), dy = Math.sin(a);
      const ox = vx - 960, oy = vy - 390;
      const bd = ox * dx + oy * dy;
      const s = -bd + Math.sqrt(Math.max(0, bd * bd - (r * r - 150 * 150)));
      out.push(<Ln key={'bl' + i} x1={vx} y1={vy} x2={vx + s * dx} y2={vy + s * dy} w={1.5} o={fo} />);
    });
    out.push(<Plot key="house" d={circlePath(960, 390, 150)} p={prog(t, HOUSE_T, HOUSE_T + f6, ease.inOutCubic)} w={1} opacity={O.mid * fo} t={t} />);
  }
  // pen: parked on the right corner, rides the un-plot into C
  const u = prog(t, B107, B107 + f8, ease.inOutCubic);
  if (u < 1) out.push(<PenHead key="pen" x={lerp(1280, 960, u)} y={390} t={t} />);
  return <>{out}</>;
};

// ------------------------------------------------------------------ shot 22: dizzy polygons
const B108 = b(108), B109 = b(109), B111 = b(111);
const POLY = [
  {n: 3, R: 60, w: 2, c: K.orange, o: 1},
  {n: 4, R: 110, w: 1.5, c: K.cream, o: 1},
  {n: 5, R: 160, w: 1.5, c: K.cream, o: O.hi},
  {n: 6, R: 210, w: 1.5, c: K.cream, o: O.hi},
  {n: 7, R: 260, w: 1.5, c: K.cream, o: O.mid},
].map((p, k) => ({...p, t0: B107 + (k * BEAT) / 2, d: ngonPath(960, 390, p.R, p.n)}));
const IMP_A = 51.15, IMP_B = F(1540.8);

const Dizzy: React.FC<{t: number}> = ({t}) => {
  if (t < B107 || t >= IMP_B) return null;
  const out: React.ReactNode[] = [];
  // beat steps since 49.536 (b108 onward), eased 6 frames
  let steps = 0;
  for (let n = 108; n <= 111; n++) steps += 15 * prog(t, b(n), b(n) + f6, ease.outCubic);
  const a = 16 * prog(t, B109, B109 + 4 / FPS) * (1 - prog(t, IMP_A, B111, ease.inCubic));
  let lastB = -1;
  for (let n = 108; n <= 111; n++) if (t >= b(n)) lastB = b(n);
  const thick = lastB > 0 && t - lastB < 3 / FPS;
  POLY.forEach((P, k) => {
    if (t < P.t0) return;
    const th = (k % 2 === 0 ? 1 : -1) * ((24 + 12 * k) * (t - P.t0) + steps);
    const psi = (TAU * (t - B109)) / 0.923 - 0.35 * k;
    const cx = 960 + a * Math.cos(psi), cy = 390 + a * Math.sin(psi);
    const s0 = IMP_A + (4 - k) / FPS;
    const sc = 1 - prog(t, s0, IMP_B, ease.inCubic);
    if (sc <= 0.001) return;
    const p = prog(t, P.t0, P.t0 + f6, ease.inOutCubic);
    out.push(
      <g key={k} transform={`translate(${r2(cx)} ${r2(cy)}) scale(${r2(sc * 1000) / 1000}) rotate(${r2(th)}) translate(-960 -390)`}>
        <Plot d={P.d} p={p} color={P.c} w={(k === 0 && thick ? 3 : P.w) / Math.max(0.2, sc)} opacity={P.o} t={t} pen={false} />
      </g>,
    );
    // pen head at the plotting tip (outside the scaled group so it keeps its size)
    if (p > 0 && p < 1) {
      const R = P.R;
      // vertex walk: position along the polygon perimeter
      const per = p * P.n;
      const i = Math.floor(per), fr = per - i;
      const va = ((-90 + (360 / P.n) * i) * Math.PI) / 180, vb = ((-90 + (360 / P.n) * (i + 1)) * Math.PI) / 180;
      const lx = lerp(R * Math.cos(va), R * Math.cos(vb), fr), ly = lerp(R * Math.sin(va), R * Math.sin(vb), fr);
      const rr = th * DEG;
      out.push(<PenHead key={'pp' + k} x={cx + sc * (lx * Math.cos(rr) - ly * Math.sin(rr))} y={cy + sc * (lx * Math.sin(rr) + ly * Math.cos(rr))} t={t} />);
    }
  });
  return <>{out}</>;
};

// ------------------------------------------------------------------ shot 23: the year axis
const B112 = b(112), B115 = b(115), B116 = b(116), B117 = b(117), B119 = b(119);
const vOf = (u: number) => 0.24 * u + 60 * Math.sign(u);
const VC0 = vOf(2025.5), VC1 = vOf(0.5), VC2 = vOf(-0.5), VC3 = vOf(-499.5);
const sine = ease.inOutSine;
const vCur = (t: number) =>
  t < B112
    ? VC0
    : t < B115
      ? lerp(VC0, VC1, prog(t, B112, B115, sine))
      : t < B116
        ? VC1
        : t < B117
          ? lerp(VC1, VC2, prog(t, B116, B117, sine))
          : lerp(VC2, VC3, prog(t, B117, B119, sine));
const yearStr = (v: number) => {
  if (v >= 60) return `${Math.max(1, Math.round((v - 60) / 0.24 + 0.5))} A.D`;
  if (v <= -60) return `${Math.max(1, Math.round((-v - 60) / 0.24 + 0.5))} B.C`;
  return v > 0 ? '1 A.D' : '1 B.C';
};

const YearAxis: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < B111 || t >= B119 + 10 / FPS) return null;
  const out: React.ReactNode[] = [];
  const vc = vCur(t);
  const xb = 960 - vc;
  const rp = prog(t, B111, B111 + f8, ease.inOutCubic) * (1 - prog(t, B119, B119 + f8, ease.inOutCubic));
  const lf = prog(t, B119, B119 + 5 / FPS); // lift-fade of ticks, labels, readout
  const lo = 1 - lf, ly = -14 * lf;
  const cx0 = 960 - 840 * rp, cx1 = 960 + 840 * rp;
  const clipped: React.ReactNode[] = [];
  // axis segments
  const segs: [number, number][] = [
    [120, xb - 60],
    [xb + 60, 1800],
  ];
  segs.forEach(([a, c], i) => {
    const x0 = Math.max(120, a), x1 = Math.min(1800, c);
    if (x1 > x0) clipped.push(<Ln key={'ax' + i} x1={x0} y1={390} x2={x1} y2={390} w={1} o={O.mid} />);
  });
  // ticks every 100 years, majors every 500 with labels
  const ticks: React.ReactNode[] = [];
  const m0 = Math.floor((vc - 940) / 24), m1 = Math.ceil((vc + 940) / 24);
  for (let m = m0; m <= m1; m++) {
    if (m === 0) continue;
    const x = 960 + vOf(100 * m) - vc;
    if (x < 120 || x > 1800) continue;
    const major = m % 5 === 0;
    const hh = major ? 8 : 4;
    ticks.push(<Ln key={'t' + m} x1={x} y1={390 - hh} x2={x} y2={390 + hh} w={1} o={major ? O.hi : O.mid} cap="butt" />);
    if (major) {
      const lab = m > 0 ? `${100 * m} A.D` : `${-100 * m} B.C`;
      // labels fade out before they would be cut by the stage edge
      const lo2 = clamp01((Math.min(x - 120, 1800 - x) - lab.length * 6) / 24);
      if (lo2 > 0)
        ticks.push(
          <text key={'tl' + m} x={r2(x)} y={436} textAnchor="middle" fontFamily={CODE} fontSize={20} fill={K.creamDim} opacity={lo2}>
            {lab}
          </text>,
        );
    }
  }
  // gap: orange end ticks, "no year 0", era labels
  const flash = frame >= 1625 && frame < 1628;
  const gap = (
    <g key="gap">
      <Ln x1={xb - 60} y1={378} x2={xb - 60} y2={402} w={flash ? 3 : 2} c={K.orange} cap="butt" />
      <Ln x1={xb + 60} y1={378} x2={xb + 60} y2={402} w={flash ? 3 : 2} c={K.orange} cap="butt" />
    </g>
  );
  const gapText = (
    <g key="gapt" fontFamily={CODE} fill={K.creamDim}>
      <text x={r2(xb)} y={396} textAnchor="middle" fontSize={16}>
        no year 0
      </text>
      <text x={r2(xb - 70)} y={360} textAnchor="end" fontSize={20}>
        B.C
      </text>
      <text x={r2(xb + 70)} y={360} textAnchor="start" fontSize={20}>
        A.D
      </text>
    </g>
  );
  out.push(
    <clipPath key="cp" id="a23clip">
      <rect x={r2(cx0)} y={0} width={r2(Math.max(0, cx1 - cx0))} height={1080} />
    </clipPath>,
  );
  out.push(
    <g key="clip" clipPath="url(#a23clip)">
      {clipped}
      <g opacity={lo} transform={`translate(0 ${r2(ly)})`}>
        {ticks}
        {gapText}
      </g>
      <g opacity={lo}>{gap}</g>
    </g>,
  );
  // pen heads at the clip edges while revealing
  if (rp > 0 && rp < 1 && t < B119) {
    out.push(<PenHead key="cl" x={cx0} y={390} t={t} />);
    out.push(<PenHead key="cr" x={cx1} y={390} t={t} />);
  }
  // cursor tick (2 px orange), +8 px each way on every beat, returning over 6 frames
  let tb = -Infinity;
  for (let n = 111; n <= 119; n++) if (t >= b(n)) tb = b(n);
  const bump = 8 * (1 - prog(t, tb, tb + f6, ease.outCubic));
  const grow = prog(t, B111, B111 + 4 / FPS, ease.outExpo);
  const co = 1 - prog(t, B119, B119 + f6);
  const hh = (20 + bump) * grow;
  if (co > 0) out.push(<Ln key="cur" x1={960} y1={390 - hh} x2={960} y2={390 + hh} w={2} c={K.orange} o={co} cap="butt" />);
  // readout
  out.push(<Txt key="yr" t={t} t0={B111} tOut={B119} x={960} y={340} anchor="middle" parts={[mono('year = ', 22, K.cream, O.hi), mono(yearStr(vc), 22, K.cream)]} />);
  // the cursor pen hops across the gap
  const hop = t >= B116 && t < B117 ? 40 * Math.sin(Math.PI * prog(t, B116, B117, sine)) : 0;
  if (t < B119) out.push(<PenHead key="pen" x={960} y={390 - hop} t={t} />);
  return <>{out}</>;
};

// ------------------------------------------------------------------ shot 24: union, tunnel
const B120 = b(120), B121 = b(121), B122 = b(122), B123 = b(123), B124 = b(124), B126 = b(126), B128 = b(128);
const PLOT0 = B120 + 4 / FPS, PLOT1 = PLOT0 + 10 / FPS;
const UNITE = F(1708);
const dAt = (t: number) => {
  let d = 400;
  d = lerp(d, 300, prog(t, B121 - f8, B121, ease.inOutCubic));
  d = lerp(d, 180, prog(t, B122 - f8, B122, ease.inOutCubic));
  d = lerp(d, 0, prog(t, B123 - f8, B123, ease.inOutCubic));
  return d;
};
// anticlockwise circle from 9 o'clock
const ccwCircle = (cx: number, cy: number, r: number) =>
  `M ${r2(cx - r)} ${cy} A ${r} ${r} 0 0 0 ${r2(cx + r)} ${cy} A ${r} ${r} 0 0 0 ${r2(cx - r)} ${cy}`;

// tunnel depth z: rings step one ratio per eighth from b126; +3 jump at b128
export const tunnelZ = (t: number) => (t < B126 ? 0 : (t - B126) / (BEAT / 2)) + 3 * prog(t, B128, B128 + f8, ease.outExpo);
// Fade in over r 12 → 20; fade out over r 220 → 320 so the rings stay in the
// stage band and never cross the log / status zone (y > 690).
const ringO = (r: number) => (r < 12 || r > 320 ? 0 : clamp01((r - 12) / 8) * (1 - clamp01((r - 220) / 100)));

const Union: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < B119 || t >= B128 + 10 / FPS) return null;
  const out: React.ReactNode[] = [];
  const d = dAt(t);
  const ax = 960 - d / 2, bx = 960 + d / 2;
  const united = frame >= 1708;

  // circles A and B (until they unite)
  if (t >= PLOT0 && !united) {
    const p = prog(t, PLOT0, PLOT1, ease.inOutCubic);
    out.push(<Plot key="A" d={circlePath(ax, 390, 120, 0)} p={p} w={1.5} t={t} />);
    out.push(<Plot key="B" d={ccwCircle(bx, 390, 120)} p={p} w={1.5} t={t} />);
  }
  // labels A, B → A = B
  // A and B leave as the last approach starts, so they never overlap
  out.push(<Txt key="la" t={t} t0={PLOT1 - 2 / FPS} tOut={B123 - f8} x={ax} y={246} anchor="middle" parts={[math('A', 32)]} opacity={O.hi} dur={2 / FPS} />);
  out.push(<Txt key="lb" t={t} t0={PLOT1 - 2 / FPS} tOut={B123 - f8} x={bx} y={246} anchor="middle" parts={[math('B', 32)]} opacity={O.hi} dur={2 / FPS} />);
  out.push(<Txt key="lab" t={t} t0={UNITE} tOut={B126} x={960} y={246} anchor="middle" parts={[math('A = B', 32)]} opacity={O.hi} />);

  // dimension line between the centres (y 560), plotted from its middle; collapses at f1708
  if (t >= PLOT0) {
    const pin = prog(t, PLOT0, PLOT0 + f8, ease.inOutCubic);
    const col = 1 - prog(t, UNITE, UNITE + f6, ease.inCubic);
    const half = (d / 2) * pin;
    if (half > 0.3) out.push(<Ln key="dl" x1={960 - half} y1={560} x2={960 + half} y2={560} w={1} o={O.mid} />);
    const th = 4 * Math.min(pin, col);
    if (th > 0.1)
      [960 - half, 960 + half].forEach((x, i) => out.push(<Ln key={'dt' + i} x1={x} y1={560 - th} x2={x} y2={560 + th} w={1} o={O.mid} cap="butt" />));
    out.push(
      <Txt key="dv" t={t} t0={PLOT0 + 4 / FPS} tOut={B126} x={960} y={592} anchor="middle" parts={[math(`d = ${Math.round(d)}`, 28, united ? K.orange : K.creamDim)]} />,
    );
  }
  // lens (2 px orange) while d < 240
  if (!united && d < 239.5 && t >= PLOT0) {
    const hh = Math.sqrt(120 * 120 - (d / 2) * (d / 2));
    out.push(<Path key="lens" d={`M 960 ${r2(390 - hh)} A 120 120 0 0 1 960 ${r2(390 + hh)} A 120 120 0 0 1 960 ${r2(390 - hh)} Z`} c={K.orange} w={2} />);
  }
  // tunnel rings (k = 0 is the united circle, orange)
  if (united) {
    const z = tunnelZ(t);
    const fz = 1 - prog(t, B128, B128 + f8);
    const kMax = Math.floor(z + 7.01); // r ≥ 12
    for (let k = 0; k <= kMax; k++) {
      if (k >= 7 && t < B126) break;
      const r = 120 * Math.pow(0.72, k - z);
      const o = ringO(r) * fz;
      if (o <= 0) continue;
      if (k === 0) {
        out.push(<Path key="r0" d={circlePath(960, 390, r)} c={K.orange} w={2} o={o} />);
        continue;
      }
      const tk = B124 + ((k - 1) * BEAT) / 2;
      const p = k <= 6 ? prog(t, tk, tk + 4 / FPS, ease.inOutCubic) : 1;
      out.push(<Plot key={'r' + k} d={circlePath(960, 390, r)} p={p} w={1} opacity={O.hi * o} t={t} />);
    }
  }
  // pens: one at C until the split; two glide out to the circles' start points,
  // plot them, then glide back and merge at C
  if (t < B120) out.push(<PenHead key="pc" x={960} y={390} t={t} />);
  else if (t < PLOT0) {
    const g = prog(t, B120, PLOT0, ease.inOutCubic);
    out.push(<PenHead key="pa" x={lerp(960, ax + 120, g)} y={390} t={t} />);
    out.push(<PenHead key="pb" x={lerp(960, bx - 120, g)} y={390} t={t} />);
  } else if (t >= PLOT1) {
    const g = prog(t, PLOT1, PLOT1 + 4 / FPS, ease.inOutCubic);
    if (g < 1) {
      const dd = dAt(PLOT1);
      out.push(<PenHead key="pa" x={lerp(960 - dd / 2 + 120, 960, g)} y={390} t={t} />);
      out.push(<PenHead key="pb" x={lerp(960 + dd / 2 - 120, 960, g)} y={390} t={t} />);
    } else if (t < B128) out.push(<PenHead key="pc" x={960} y={390} t={t} />);
  }
  return <>{out}</>;
};

export const PreChorus: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t >= B128 + 10 / FPS) return null;
  return (
    <>
      <PowerLine t={t} frame={frame} />
      <Eye t={t} frame={frame} />
      <Dizzy t={t} />
      <DizzyPen t={t} />
      <YearAxis t={t} frame={frame} />
      <Union t={t} frame={frame} />
    </>
  );
};

// pen at C during shot 22 (after the un-plot merges), handled here so Dizzy stays geometry-only
export const DizzyPen: React.FC<{t: number}> = ({t}) => (t >= B107 + f8 && t < B111 ? <PenHead x={960} y={390} t={t} /> : null);
