// Section A character moments, drawn in the (undimmed) character layer so the
// scan lines, frame, reticle, leaders and box sit above the art. Construction
// parts (frame, scan lines, reticle, leaders, box) take the stage dim by hand;
// her art, the palm spark, the touch rings and the iris outline do not.
//   Moment 3 (62.920–66.843, art from 63.382): pose `reach`, close-up crop, two-way scan.
//   Moment 4 (85.074–88.536): pose `float`, iris reveal, z axis, leaders, box.
// Spec: docs/design_full.md A.2 (anchors measured on public/char/*_flat.png).
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {beat, clamp01, CODE, ease, env, FPS, K, lerp, MATH, O, prog} from '../core';
import {Check, circlePath, linePath, PenHead, Plot, Spark, Svg} from '../geo';
import {stageDim} from '../ui';
import meta from '../char_meta.json';
import {antsOffset, beatSteps, F, LeaderLabel, Ln, P2, r2, rectPath} from './A_lib';

const b = beat;
const f6 = 6 / FPS;

// ------------------------------------------------------------------ moment 3 placement
// Measured on reach_flat.png (1120 × 1680 px): hair top (515, 7), face (530, 190),
// open palm (445, 527). Fit rule (design_full §0.2 #3): head top → y 130, palm →
// y 560, and (face.x + palm.x)/2 → x 960.
const REACH = {headTop: [515, 7], face: [530, 190], palm: [445, 527]};
const S3 = (560 - 130) / (REACH.palm[1] - REACH.headTop[1]);
const L3 = 960 - ((REACH.face[0] + REACH.palm[0]) / 2) * S3;
const T3 = 130 - REACH.headTop[1] * S3;
const PALM: P2 = [L3 + REACH.palm[0] * S3, T3 + REACH.palm[1] * S3]; // ≈ (925, 560)
const FR = {x0: 640, x1: 1280, y0: 110, y1: 690};

const M3 = {
  stretch: b(136), // 62.920 f1888: pen dot → line (4 frames)
  label: 63.05, // me.reach(you) types
  splitA: b(137), // 63.382: two-way split, reach_lines between the lines
  splitB: b(138), // 63.843: scan up, reach_flat below the scan line
  scanB: b(139), // 64.305: scan done, slow push starts
  pushB: 66.4,
  node: b(140), // 64.766: palm node + reticle
  hit: F(1962),
  exitA: b(144), // 66.613 f1998
  exitM: 66.776, // band closed at y 390
  exitB: 66.843, // contracted into the pen dot at C
};
const SET = 4 / FPS; // orange → cream settle
// band in which the art is visible during the exit
const exitBand = (t: number) => {
  const p = prog(t, M3.exitA, M3.exitM);
  return {top: lerp(FR.y0, 390, p), bot: lerp(FR.y1, 390, p)};
};
const tPass = M3.exitA + ((FR.y1 - PALM[1]) / (FR.y1 - 390)) * (M3.exitM - M3.exitA); // band passes the palm
// latest beat time in [n0, n1] at or before t
const lastBeatIn = (t: number, n0: number, n1: number) => {
  let tb = -Infinity;
  for (let n = n0; n <= n1; n++) if (t >= b(n)) tb = b(n);
  return tb;
};
// the scan line pulses 2 → 3 px on b136 and b137
const lineW = (t: number) => 2 + env(t - lastBeatIn(t, 136, 137));

const readout = (x: number, y: number, o = 1) => (
  <text x={x} y={r2(y + 5)} fontFamily={CODE} fontSize={16} fill={K.creamDim} opacity={o}>
    {`y ${String(Math.round(y)).padStart(4, '0')}`}
  </text>
);

const Moment3Art: React.FC<{t: number}> = ({t}) => {
  if (t < M3.splitA || t >= M3.exitB) return null;
  // visible y ranges of the two layers
  let lines: [number, number] | null = null;
  let flat: [number, number] | null = null;
  if (t < M3.splitB) {
    const p = prog(t, M3.splitA, M3.splitB);
    lines = [lerp(390, FR.y0, p), lerp(390, FR.y1, p)];
  } else if (t < M3.scanB) {
    const y = lerp(FR.y1, FR.y0, prog(t, M3.splitB, M3.scanB));
    lines = [FR.y0, y];
    flat = [y, FR.y1];
  } else if (t < M3.exitA) flat = [FR.y0, FR.y1];
  else {
    const e = exitBand(t);
    flat = [e.top, e.bot];
  }
  const k = 1 + 0.035 * prog(t, M3.scanB, M3.pushB);
  const img: React.CSSProperties = {
    position: 'absolute',
    left: r2(L3),
    top: r2(T3),
    width: r2(1120 * S3),
    height: r2(1680 * S3),
    transform: `scale(${k.toFixed(5)})`,
    transformOrigin: `${r2(PALM[0] - L3)}px ${r2(PALM[1] - T3)}px`,
  };
  const band = (r: [number, number]): React.CSSProperties => ({clipPath: `inset(${r2(r[0])}px 0px ${r2(1080 - r[1])}px 0px)`});
  return (
    <AbsoluteFill style={{clipPath: `inset(${FR.y0}px ${1920 - FR.x1}px ${1080 - FR.y1}px ${FR.x0}px)`}}>
      {flat && flat[1] - flat[0] > 0.2 && (
        <AbsoluteFill style={band(flat)}>
          <Img src={staticFile('char/reach_flat.png')} style={img} />
        </AbsoluteFill>
      )}
      {lines && lines[1] - lines[0] > 0.2 && (
        <AbsoluteFill style={band(lines)}>
          <Img src={staticFile('char/reach_lines.png')} style={img} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// a horizontal scan line that settles from 2 px orange x 620–1300 into a 1 px
// cream frame edge x 640–1280 (s = settle progress 0..1)
const scanLine = (key: string, y: number, s: number, w: number, out: React.ReactNode[]) => {
  const xa = lerp(620, FR.x0, s), xb = lerp(1300, FR.x1, s);
  if (s < 1) out.push(<Ln key={key + 'o'} x1={xa} y1={y} x2={xb} y2={y} w={w} c={K.orange} o={1 - s} cap="butt" />);
  if (s > 0) out.push(<Ln key={key + 'c'} x1={xa} y1={y} x2={xb} y2={y} w={1} o={O.mid * s} cap="butt" />);
};
const CORNERS: [number, number, number, number][] = [
  [FR.x0, FR.y0, 1, 1],
  [FR.x1, FR.y0, -1, 1],
  [FR.x1, FR.y1, -1, -1],
  [FR.x0, FR.y1, 1, -1],
];
const cornerD = (x: number, y: number, sx: number, sy: number) => `M ${x} ${r2(y + sy * 16)} L ${x} ${r2(y)} L ${x + sx * 16} ${r2(y)}`;

// Construction over the art (stage-dimmed): scan lines, frame, corner marks,
// label, palm node and reticle; plus the pen dot that becomes the scan.
const Moment3Lines: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < M3.stretch || t >= M3.exitB) return null;
  const out: React.ReactNode[] = [];
  const lab = 'me.reach(you)';
  if (t < M3.exitA) {
    // corner marks plot from 62.920 (4 frames each, 1-frame stagger)
    CORNERS.forEach(([x, y, sx, sy], i) => {
      const cp = prog(t, M3.stretch + i / FPS, M3.stretch + (i + 4) / FPS);
      if (cp > 0) out.push(<Plot key={'c' + i} d={cornerD(x, y, sx, sy)} p={cp} w={1.5} opacity={O.hi} pen={false} cap="butt" />);
    });
    const n = Math.ceil(lab.length * clamp01((t - M3.label) / (5 / FPS)));
    if (n > 0)
      out.push(
        <text key="lab" x={FR.x0} y={100} fontFamily={CODE} fontSize={16} fill={K.creamDim}>
          {lab.slice(0, n)}
        </text>,
      );
  }
  if (t < M3.splitA) {
    // pen dot stretches into a 2 px orange line x 620–1300 (4 frames, from the centre)
    const e = prog(t, M3.stretch, M3.stretch + 4 / FPS, ease.outExpo);
    out.push(<Ln key="st" x1={960 - 340 * e} y1={390} x2={960 + 340 * e} y2={390} w={lineW(t)} c={K.orange} cap="butt" />);
    const ps = 1 - prog(t, M3.stretch, M3.stretch + 4 / FPS);
    if (ps > 0) out.push(<PenHead key="pen" x={960} y={390} t={t} scale={ps} />);
  } else if (t < M3.exitA) {
    // split (63.382 → 63.843): the upper copy rises to 110, the lower falls to 690
    const p = prog(t, M3.splitA, M3.splitB);
    const yT = lerp(390, FR.y0, p), yB = lerp(390, FR.y1, p);
    const w = lineW(t);
    // the bottom line settles into the frame edge when the split lands; the top
    // line waits for the scan to arrive (64.305) and then settles
    scanLine('bl', yB, prog(t, M3.splitB, M3.splitB + SET), w, out);
    scanLine('tl', yT, prog(t, M3.scanB, M3.scanB + SET), w, out);
    const ro = 1 - prog(t, M3.splitB, M3.splitB + SET);
    if (ro > 0) {
      out.push(<React.Fragment key="rt">{readout(1308, yT, ro)}</React.Fragment>);
      out.push(<React.Fragment key="rb">{readout(1308, yB, ro)}</React.Fragment>);
    }
    // vertical frame edges grow with the split
    [FR.x0, FR.x1].forEach((x, i) => out.push(<Ln key={'v' + i} x1={x} y1={yT} x2={x} y2={yB} w={1} o={O.mid} cap="butt" />));
    // scan up (63.843 → 64.305): one orange line 690 → 110
    if (t >= M3.splitB && t < M3.scanB) {
      const y = lerp(FR.y1, FR.y0, prog(t, M3.splitB, M3.scanB));
      out.push(<Ln key="scan" x1={620} y1={y} x2={1300} y2={y} w={2} c={K.orange} cap="butt" />);
      out.push(<React.Fragment key="sro">{readout(1308, y)}</React.Fragment>);
    }
  } else {
    // exit: two orange lines close on y 390 (the frame's vertical edges and the
    // corner marks shrink with them), then the line contracts into the pen dot at C
    const {top, bot} = exitBand(t);
    const c = prog(t, M3.exitM, M3.exitB, ease.inCubic);
    const xa = lerp(FR.x0, 960, c), xb = lerp(FR.x1, 960, c);
    if (t < M3.exitM) {
      [FR.x0, FR.x1].forEach((x, i) => out.push(<Ln key={'v' + i} x1={x} y1={top} x2={x} y2={bot} w={1} o={O.mid} cap="butt" />));
      const cl = Math.min(16, (bot - top) / 2);
      CORNERS.forEach(([x, , sx, sy], i) => {
        const y = sy > 0 ? top : bot;
        out.push(<path key={'c' + i} d={`M ${x} ${r2(y + sy * cl)} L ${x} ${r2(y)} L ${x + sx * 16} ${r2(y)}`} fill="none" stroke={K.cream} strokeWidth={1.5} opacity={O.hi} />);
      });
      out.push(<Ln key="et" x1={xa} y1={top} x2={xb} y2={top} w={2} c={K.orange} cap="butt" />);
      out.push(<Ln key="eb" x1={xa} y1={bot} x2={xb} y2={bot} w={2} c={K.orange} cap="butt" />);
    } else if (c < 1) out.push(<Ln key="el" x1={xa} y1={390} x2={xb} y2={390} w={2} c={K.orange} cap="butt" />);
    // label lift-fades
    const lf = prog(t, M3.exitA, M3.exitA + 5 / FPS);
    if (lf < 1)
      out.push(
        <text key="lab" x={FR.x0} y={r2(100 - 14 * lf)} fontFamily={CODE} fontSize={16} fill={K.creamDim} opacity={1 - lf}>
          {lab}
        </text>,
      );
    if (c > 0.5) out.push(<PenHead key="pen" x={960} y={390} t={t} scale={Math.max(0.001, (c - 0.5) * 2)} />);
  }
  // palm node and reticle (b140 → the exit band passes the palm)
  if (t >= M3.node) {
    const gone = 1 - prog(t, tPass, tPass + 2 / FPS);
    if (gone > 0) {
      const pl = t < b(144) ? env(t - lastBeatIn(t, 140, 143)) : 0;
      const nIn = prog(t, M3.node, M3.node + 3 / FPS, ease.outExpo);
      const rr = lerp(48, 24, prog(t, M3.node, M3.hit));
      const hot = frame >= 1962 && frame < 1965;
      const rc = hot ? K.orange : K.cream, rw = hot ? 2 : 1, ro = hot ? 1 : O.mid;
      const rp = prog(t, M3.node, M3.node + 4 / FPS, ease.inOutCubic);
      out.push(<Plot key="ret" d={circlePath(PALM[0], PALM[1], rr)} p={rp} color={rc} w={rw} opacity={ro * gone} pen={false} />);
      if (rp >= 1)
        [0, 90, 180, 270].forEach((a) => {
          const c = Math.cos((a * Math.PI) / 180), s = Math.sin((a * Math.PI) / 180);
          out.push(<Ln key={'rt' + a} x1={PALM[0] + rr * c} y1={PALM[1] + rr * s} x2={PALM[0] + (rr + 8) * c} y2={PALM[1] + (rr + 8) * s} c={rc} w={rw} o={ro * gone} cap="butt" />);
        });
      out.push(
        <circle key="node" cx={r2(PALM[0])} cy={r2(PALM[1])} r={r2(3.5 * nIn * (1 + 0.5 * pl) * gone)} fill={K.orange} stroke={K.bg} strokeWidth={1.5} style={{paintOrder: 'stroke'}} />,
      );
    }
  }
  return <>{out}</>;
};

// Undimmed: the touch (rings + palm spark) on SATISFACTION.
const Moment3Touch: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (frame < 1962 || t >= M3.exitB) return null;
  const f = frame - 1962;
  const out: React.ReactNode[] = [];
  out.push(
    <clipPath key="cp" id="a26frame">
      <rect x={FR.x0} y={FR.y0} width={FR.x1 - FR.x0} height={FR.y1 - FR.y0} />
    </clipPath>,
  );
  const rings: React.ReactNode[] = [];
  if (f <= 12) {
    const r = 160 * ease.outExpo(clamp01(f / 10));
    rings.push(<circle key="r1" cx={r2(PALM[0])} cy={r2(PALM[1])} r={r2(r)} fill="none" stroke={K.orange} strokeWidth={3} opacity={1 - clamp01((f - 4) / 8)} />);
  }
  if (f >= 3 && f <= 15) {
    const r = 260 * ease.outExpo(clamp01((f - 3) / 10));
    rings.push(<circle key="r2" cx={r2(PALM[0])} cy={r2(PALM[1])} r={r2(r)} fill="none" stroke={K.orange} strokeWidth={1} opacity={0.45 * (1 - clamp01((f - 7) / 8))} />);
  }
  out.push(
    <g key="rings" clipPath="url(#a26frame)">
      {rings}
    </g>,
  );
  // palm spark R 22: rays bloom from the hub (4 frames), 15° per beat
  const sc = 1 - prog(t, tPass, tPass + 2 / FPS, ease.inCubic);
  const rays = 12 * clamp01((t - M3.hit) / (6 / FPS));
  const grow = ease.outExpo(prog(t, M3.hit, M3.hit + 4 / FPS));
  if (sc > 0) out.push(<Spark key="sp" x={PALM[0]} y={PALM[1]} R={22 * sc} rays={rays} grow={grow} rot={beatSteps(t, M3.hit)} />);
  return <>{out}</>;
};

// ------------------------------------------------------------------ moment 4 placement
// bbox (char_meta) → height 560, top y 110, centred x 960 (width 393 ≤ 760).
const FM = meta.float;
const S4 = 560 / ((FM.bbox[3] - FM.bbox[1]) * FM.h);
const L4 = 960 - ((FM.bbox[0] + FM.bbox[2]) / 2) * FM.w * S4;
const T4 = 110 - FM.bbox[1] * FM.h * S4;
const BOX4 = {x0: L4 + FM.bbox[0] * FM.w * S4 - 12, x1: L4 + FM.bbox[2] * FM.w * S4 + 12, y0: 110 - 12, y1: 670 + 12};
// Measured on float_flat.png: hair top (567, 34), black cravat at the chest (580, 290).
const at4 = (x: number, y: number): P2 => [L4 + x * S4, T4 + y * S4];
const HAIR_TOP = at4(567, 34);
const RIBBON = at4(580, 290);

export const M4 = {
  open: b(184), // 85.074
  axis: b(185), // 85.536
  l1: b(186),
  l2: b(187), // 86.459, release starts
  box: b(188), // 86.920
  hit: F(2638),
  close: b(191), // 88.305
  shut: F(2656),
};
// leaders and the axis retract in 7 frames (spec: 8) so the stage is empty at f2657
const OUT4 = 7 / FPS;
const drift = (t: number) => -18 * prog(t, M4.open, M4.close);
const irisR = (t: number) => {
  if (t < M4.l2) return 300 * prog(t, M4.open, M4.axis, ease.outExpo);
  if (t < M4.close) return lerp(300, 640, prog(t, M4.l2, M4.box, ease.inOutCubic));
  return 640 * (1 - prog(t, M4.close, M4.shut, ease.inCubic));
};
const irisLineO = (t: number, r: number) => (t < M4.close ? O.mid * (1 - clamp01((r - 420) / 220)) : r <= 420 ? O.mid : 0);

const Moment4Art: React.FC<{t: number}> = ({t}) => {
  if (t < M4.open || t >= M4.shut) return null;
  const r = irisR(t);
  if (r <= 0.5) return null;
  return (
    <AbsoluteFill style={{clipPath: `circle(${r2(r)}px at 960px 390px)`}}>
      <Img
        src={staticFile('char/float_flat.png')}
        style={{position: 'absolute', left: r2(L4), top: r2(T4 + drift(t)), width: r2(FM.w * S4), height: r2(FM.h * S4)}}
      />
    </AbsoluteFill>
  );
};

// Leaders and the object box (stage-dimmed), above the art.
const Moment4Lines: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < M4.l1 || t >= M4.shut) return null;
  const dy = drift(t);
  const hp = env(t - M4.hit);
  const out: React.ReactNode[] = [];
  out.push(
    <LeaderLabel key="l1" t={t} tb={M4.l1} tOut={M4.close} side="R" x={1320} y={200} key_="gravity" val="0" at={[HAIR_TOP[0], HAIR_TOP[1] + dy]} nodePulse={hp} outDur={OUT4} />,
  );
  out.push(
    <LeaderLabel key="l2" t={t} tb={M4.l2} tOut={M4.close} side="L" x={600} y={420} key_="instances" val="1" at={[RIBBON[0], RIBBON[1] + dy]} nodePulse={hp} outDur={OUT4} />,
  );
  if (t >= M4.box) {
    const un = 1 - prog(t, M4.close, M4.close + f6, ease.inOutCubic);
    const flash = frame >= 2638 && frame < 2641;
    const d = rectPath(BOX4.x0, BOX4.y0 + dy, BOX4.x1, BOX4.y1 + dy);
    if (un >= 1)
      out.push(
        <path
          key="box"
          d={d}
          fill="none"
          stroke={flash ? K.orange : K.cream}
          strokeWidth={flash ? 2 : 1}
          opacity={flash ? 1 : O.mid}
          strokeDasharray="6 6"
          strokeDashoffset={antsOffset(t, M4.box)}
        />,
      );
    else out.push(<Plot key="box" d={d} p={un} w={1} opacity={O.mid} dash="6 6" pen={false} cap="butt" />);
    const lf = prog(t, M4.close, M4.close + 5 / FPS);
    const ly = BOX4.y0 + dy - 8 - 14 * lf;
    out.push(
      <g key="obj" opacity={1 - lf}>
        <text x={r2(BOX4.x0)} y={r2(ly)} fontFamily={CODE} fontSize={16} fill={K.creamDim}>
          object #0001
        </text>
        {frame >= 2638 && <Check x={BOX4.x0 + 12 * 9.6 + 10} y={ly - 3} p={prog(t, M4.hit, M4.hit + 4 / FPS)} />}
      </g>,
    );
  }
  return <>{out}</>;
};

// Undimmed: the iris outline.
const Moment4Iris: React.FC<{t: number}> = ({t}) => {
  if (t < M4.open || t >= M4.shut) return null;
  const r = irisR(t);
  const o = irisLineO(t, r);
  if (r <= 0.5 || o <= 0) return null;
  return <circle cx={960} cy={390} r={r2(r)} fill="none" stroke={K.cream} strokeWidth={1.5} opacity={o} />;
};

export const SectionAMoments: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const dim = stageDim(t);
  const m3 = t >= M3.stretch && t < M3.exitB;
  const m4 = t >= M4.open && t < M4.shut;
  if (!m3 && !m4) return null;
  return (
    <AbsoluteFill>
      <Moment3Art t={t} />
      <Moment4Art t={t} />
      <Svg style={{opacity: dim}}>
        <Moment3Lines t={t} frame={frame} />
        <Moment4Lines t={t} frame={frame} />
      </Svg>
      <Svg>
        <Moment3Touch t={t} frame={frame} />
        <Moment4Iris t={t} />
      </Svg>
    </AbsoluteFill>
  );
};

// Stage layer (behind her): the z axis of moment 4, and the closing pen.
export const Moment4Stage: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  if (t < M4.open) return null;
  const out: React.ReactNode[] = [];
  // the pen dot at C opens into the iris
  if (t < M4.open + 4 / FPS) out.push(<PenHead key="pen0" x={960} y={390} t={t} scale={Math.max(0.001, 1 - prog(t, M4.open, M4.open + 4 / FPS, ease.inCubic))} />);
  if (t >= M4.axis) {
    const pin = prog(t, M4.axis, M4.axis + 10 / FPS, ease.inOutCubic);
    const un = prog(t, M4.close, M4.close + OUT4, ease.inOutCubic);
    const p = Math.min(pin, 1 - un);
    const d = linePath(960, 690, 960, 100);
    out.push(<Plot key="z" d={d} p={p} w={1} opacity={O.mid} t={t} pen={un === 0} />);
    if (pin >= 1 && p > 0.02) {
      const ty = lerp(690, 100, p);
      out.push(<path key="za" d={`M 953 ${r2(ty + 10)} L 960 ${r2(ty)} L 967 ${r2(ty + 10)}`} fill="none" stroke={K.cream} strokeWidth={1} opacity={O.mid} />);
    }
    const lf = prog(t, M4.close, M4.close + 5 / FPS);
    if (pin >= 1 && lf < 1) {
      const n = Math.ceil(clamp01((t - (M4.axis + 10 / FPS) + 1 / FPS) / (2 / FPS)));
      if (n > 0)
        out.push(
          <text key="zl" x={976} y={r2(112 - 14 * lf)} fontFamily={MATH} fontStyle="italic" fontSize={26} fill={K.cream} opacity={O.hi * (1 - lf)}>
            z
          </text>,
        );
    }
  }
  // the pen head scales 0 → 1 at C as the iris shuts (f2654 → f2656), so it is
  // full size at f2656–f2657 for Section B's seed at f2658
  if (frame >= 2654) out.push(<PenHead key="pen1" x={960} y={390} t={t} scale={Math.max(0.001, Math.min(1, (frame - 2653) / 3))} />);
  return <>{out}</>;
};
