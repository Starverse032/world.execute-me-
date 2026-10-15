// S0 verse 1, 29.2–44.45 s: the plot.py notebook on the stage. One cell is
// re-run per verse pair (In [1]…[4]); its output draws below, plotted by the
// orange dot (drawn by S0.tsx in screen space). The character's first
// appearance: points emitted from the dot connect into crisp line art.
import React, {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {clamp01, ease, FPS, K, lerp, prog} from '../../v3/core';
import {Plot, polyPath} from '../../v3/geo';
import {LineArt, loadPose, PoseRec, strokePoints, usePose} from '../char/LineArt';
import {CODE, MATH, MONO_ADV} from '../fonts';
import {TokLine, tokenize} from '../shell/Code';
import {YouNodeG} from '../shell/Composer';
import {KwCode, kwFit} from '../shell/KwCode';
import {Caret} from '../shell/lib';
import {Win} from '../shell/Win';
import {
  AX,
  CHAR,
  CHAR_X,
  charMap,
  CIRC,
  CIRC_D,
  F_CHAR_D,
  FC_T,
  HEART_B,
  LIMC,
  limX,
  limY,
  n2,
  NB,
  ROLL,
  ROLL_L,
  slideU,
  TAU,
  WAVE,
  waveY,
  ZENO,
} from './S0_geo';
import {T} from './s0.data';

const Fr = (f: number) => f / FPS;
type P2 = [number, number];

// ------------------------------------------------------------------ cells
export const CELLS = [
  {n: 1, t0: 29.72, code: 'ax.scatter(*me.points)', done: 30.9},
  {n: 2, t0: 33.412, code: 'ax.add_patch(circle(r))', done: 34.4},
  {n: 3, t0: 37.067, code: 'ax.plot(x, np.sin(x))', done: 37.6},
  {n: 4, t0: 40.706, code: 'ax.plot(lim(f, x→∞))', done: T.LIM},
];
const TYPE_S = 0.36;
const cellAt = (t: number) => {
  let i = 0;
  CELLS.forEach((c, k) => {
    if (t >= c.t0) i = k;
  });
  return i;
};
const CellInput: React.FC<{t: number}> = ({t}) => {
  const i = cellAt(t);
  const c = CELLS[i];
  const bs = i > 0 ? Fr(4) : 0;
  let text = c.code;
  let n: number;
  if (i > 0 && t < c.t0 + bs) {
    text = CELLS[i - 1].code;
    n = Math.floor(text.length * (1 - (t - c.t0) / bs));
  } else n = Math.min(text.length, Math.floor(((t - c.t0 - bs) / TYPE_S) * text.length + 1e-6));
  n = Math.max(0, n);
  const typing = t < c.t0 + bs + TYPE_S;
  const running = !typing && t < c.done;
  const prevN = i > 0 && t < c.t0 + bs ? CELLS[i - 1].n : c.n;
  const label = running || typing ? (typing && i > 0 && t < c.t0 + bs ? `In [${prevN}]:` : 'In [*]:') : `In [${c.n}]:`;
  return (
    <g>
      <text x={20} y={46} fontFamily={CODE} fontSize={15} fill={running ? K.orange : K.creamDim}>
        {label}
      </text>
      <rect x={96} y={18} width={784} height={46} rx={6} fill={K.bg} fillOpacity={0.55} stroke={K.line2} strokeWidth={1.5} />
      {typing && <rect x={96} y={24} width={2} height={34} fill={K.orange} />}
      <TokLine toks={tokenize(text, 'py')} n={n} size={20} x={114} y={48} />
      {typing && <Caret x={114 + n * 20 * MONO_ADV + 2} y={48} h={22} color={K.orange} />}
    </g>
  );
};

// ------------------------------------------------------------------ axes
const Axes: React.FC<{t: number}> = ({t}) => {
  const p = prog(t, 29.9, 30.3, ease.inOutCubic);
  if (p <= 0) return null;
  const {x0, y0, x1, y1} = AX;
  const ticks: React.ReactNode[] = [];
  for (let x = x0 + 60; x < x1 - 10; x += 60) ticks.push(<path key={'x' + x} d={`M ${x} ${y1} L ${x} ${y1 + 6}`} />);
  for (let y = y1 - 60; y > y0 + 10; y -= 60) ticks.push(<path key={'y' + y} d={`M ${x0 - 6} ${y} L ${x0} ${y}`} />);
  return (
    <g>
      <Plot d={`M ${x0} ${y0} L ${x0} ${y1} L ${x1} ${y1}`} p={p} color={K.cream} w={1} opacity={0.45} pen={false} />
      <path d={`M ${x0} ${y0} L ${x1} ${y0} L ${x1} ${y1}`} fill="none" stroke={K.cream} strokeOpacity={0.25 * p} strokeWidth={1} />
      <g stroke={K.cream} strokeOpacity={0.45 * p} strokeWidth={1}>
        {ticks}
      </g>
    </g>
  );
};

// ------------------------------------------------------------------ cell 1 + 2: points, her, circle
const NPTS = 1100;
const PointsAndHer: React.FC<{t: number}> = ({t}) => {
  const rec = usePose('stand');
  const pts = useMemo(() => {
    if (!rec) return null;
    const src = strokePoints(rec, NPTS, 7);
    const tg = src.map((p) => charMap(p));
    const dist = tg.map((p) => Math.hypot(p[0] - HEART_B[0], p[1] - HEART_B[1]));
    const dmax = Math.max(...dist);
    // circle assignment by angle around the circle centre (points move radially)
    const ang = tg.map((p, i) => ({i, a: (Math.atan2(p[1] - CIRC.c[1], p[0] - CIRC.c[0]) + Math.PI / 2 + TAU) % TAU}));
    ang.sort((p, q) => p.a - q.a);
    const rank = new Array(tg.length).fill(0);
    ang.forEach((o, r) => (rank[o.i] = r));
    return {tg, t0: dist.map((d) => 29.95 + 0.95 * (d / dmax)), rank};
  }, [rec]);
  if (!pts || t >= CIRC.plot[1] + 0.2) return null;
  const N = pts.tg.length;
  // phases
  const cell2 = t >= CELLS[1].t0;
  const fadeDim = cell2 ? 0 : prog(t, T.DIM, T.DIM + Fr(6));
  const back = cell2 ? prog(t, CELLS[1].t0, CELLS[1].t0 + Fr(4)) : 1;
  const penP = prog(t, CIRC.plot[0], CIRC.plot[1], ease.inOutSine);
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < N; i++) {
    const tg = pts.tg[i];
    let x: number, y: number, o = 0.7, col: string = K.cream;
    if (!cell2) {
      const f = (t - pts.t0[i]) / 0.22;
      if (f <= 0) continue;
      const e = ease.outCubic(clamp01(f));
      x = lerp(HEART_B[0], tg[0], e);
      y = lerp(HEART_B[1], tg[1], e);
      if (f < 1) col = K.orange;
      o *= 1 - fadeDim;
      if (o <= 0) continue;
    } else {
      const fr = pts.rank[i] / N;
      const st = 33.5 + 0.15 * fr;
      const e = prog(t, st, st + 0.35, ease.inOutCubic);
      const a = -Math.PI / 2 + TAU * fr;
      x = lerp(tg[0], CIRC.c[0] + CIRC.r * Math.cos(a), e);
      y = lerp(tg[1], CIRC.c[1] + CIRC.r * Math.sin(a), e);
      o *= back * (penP > fr ? 1 - clamp01((penP - fr) * 30) : 1);
      if (o <= 0) continue;
    }
    dots.push(<circle key={i} cx={n2(x)} cy={n2(y)} r={1.8} fill={col} fillOpacity={o} />);
  }
  return <g>{dots}</g>;
};

const FOverlay: React.FC<{t: number}> = ({t}) => {
  if (t < FC_T.head[0] || t > T.DIM + 0.6) return null;
  const f = (t - T.DIM) * FPS;
  const hot = f >= 0 && f < 3;
  const o = f < 3 ? 1 : 1 - clamp01((f - 3) / 10);
  const col = hot ? K.orange : K.cream;
  const so = hot ? 1 : 0.45;
  const w = hot ? 1.5 : 1;
  return (
    <g opacity={o}>
      <Plot d={F_CHAR_D.head} p={prog(t, FC_T.head[0], FC_T.head[1], ease.inOutSine)} color={col} w={w} opacity={so} pen={false} />
      <Plot d={F_CHAR_D.tri} p={prog(t, FC_T.tri[0], FC_T.tri[1], ease.inOutSine)} color={col} w={w} opacity={so} pen={false} />
      <Plot d={F_CHAR_D.book} p={prog(t, FC_T.book[0], FC_T.book[1], ease.inOutSine)} color={col} w={w} opacity={so} pen={false} />
    </g>
  );
};

const Labels1: React.FC<{t: number}> = ({t}) => {
  if (t < 30.9 || t >= CELLS[1].t0) return null;
  const o = prog(t, 30.9, 30.9 + Fr(5));
  const hit = t >= T.DIM;
  const flash = hit && t < T.DIM + Fr(4);
  return (
    <g opacity={o} fontFamily={CODE} fontSize={16} textAnchor="end">
      <text x={AX.x1 - 14} y={AX.y0 + 26} fill={K.creamDim}>
        n = 1,100
      </text>
      <text x={AX.x1 - 14} y={AX.y0 + 50} fill={K.creamDim} xmlSpace="preserve">
        {'dim = '}
        <tspan fill={flash ? K.orange : K.cream} fontWeight={hit ? 700 : 400}>
          {hit ? '1' : '0'}
        </tspan>
      </text>
    </g>
  );
};

// ------------------------------------------------------------------ cell 2: circle, radius, roll
const CircleCell: React.FC<{t: number}> = ({t}) => {
  if (t < CIRC.plot[0] || t >= WAVE.morph[0]) return null;
  const g = prog(t, ROLL.glide[0], ROLL.glide[1], ease.inOutCubic);
  const c: P2 = [lerp(CIRC.c[0], ROLL.x0, g), lerp(CIRC.c[1], ROLL.cy, g)];
  const r = lerp(CIRC.r, ROLL.r, g);
  const els: React.ReactNode[] = [];
  if (t < ROLL.glide[0]) {
    els.push(<Plot key="c" d={CIRC_D} p={prog(t, CIRC.plot[0], CIRC.plot[1], ease.inOutSine)} color={K.cream} w={2} pen={false} />);
  }
  const radO = prog(t, 34.2, 34.2 + Fr(5)) * (1 - g);
  if (radO > 0) {
    els.push(
      <g key="r" opacity={radO}>
        <path d={`M ${c[0]} ${c[1]} L ${n2(c[0] + r * prog(t, 34.2, 34.2 + Fr(6), ease.outCubic))} ${c[1]}`} stroke={K.cream} strokeOpacity={0.7} strokeWidth={1.5} />
        <circle cx={c[0]} cy={c[1]} r={3} fill={K.cream} />
        <text x={n2(c[0] + r / 2)} y={c[1] - 14} textAnchor="middle" fontFamily={MATH} fontStyle="italic" fontSize={36} fill={K.cream}>
          r
        </text>
      </g>,
    );
  }
  if (t >= ROLL.glide[0]) {
    const pr = prog(t, ROLL.roll[0], ROLL.roll[1], ease.inOutSine);
    const cx = ROLL.x0 + ROLL_L * pr;
    const cc: P2 = t < ROLL.roll[0] ? c : [cx, ROLL.cy];
    const rr = t < ROLL.roll[0] ? r : ROLL.r;
    // baseline
    els.push(<Plot key="b" d={`M ${ROLL.x0} ${ROLL.base} L ${ROLL.x0 + ROLL_L + 12} ${ROLL.base}`} p={prog(t, 34.7, 34.95)} color={K.cream} w={1} opacity={0.45} pen={false} />);
    // remaining arc: from the contact point (bottom) forward
    const rem = TAU * (1 - pr);
    if (rem > 0.01) {
      const pts: P2[] = [];
      const nS = Math.max(4, Math.ceil(rem * 30));
      for (let k = 0; k <= nS; k++) {
        const a = Math.PI / 2 - (rem * k) / nS;
        pts.push([cc[0] + rr * Math.cos(a), cc[1] + rr * Math.sin(a)]);
      }
      els.push(<path key="a" d={polyPath(pts)} fill="none" stroke={K.cream} strokeWidth={2} />);
      // radius marker rotating clockwise
      const ma = TAU * pr;
      els.push(<path key="m" d={`M ${n2(cc[0])} ${n2(cc[1])} L ${n2(cc[0] + rr * Math.cos(ma))} ${n2(cc[1] + rr * Math.sin(ma))}`} stroke={K.cream} strokeOpacity={0.45} strokeWidth={1} />);
    }
    // laid segment
    const hit = t >= T.CIRC;
    const back = hit ? 0 : 0;
    void back;
    if (cx > ROLL.x0 + 0.5) els.push(<path key="s" d={`M ${ROLL.x0} ${ROLL.base} L ${n2(cx)} ${ROLL.base}`} stroke={hit ? K.orange : K.cream} strokeWidth={hit ? 3 : 2} strokeLinecap="round" />);
    if (hit) {
      const lo = prog(t, T.CIRC, T.CIRC + Fr(5));
      els.push(
        <g key="h" opacity={lo}>
          <path d={`M ${ROLL.x0} ${ROLL.base - 8} L ${ROLL.x0} ${ROLL.base + 8} M ${n2(ROLL.x0 + ROLL_L)} ${ROLL.base - 8} L ${n2(ROLL.x0 + ROLL_L)} ${ROLL.base + 8}`} stroke={K.cream} strokeWidth={1.5} />
          <text x={n2(ROLL.x0 + ROLL_L / 2)} y={ROLL.base - 26} textAnchor="middle" fontFamily={MATH} fontStyle="italic" fontSize={40} fill={K.cream}>
            2πr
          </text>
        </g>,
      );
    }
  }
  return <g>{els}</g>;
};

// ------------------------------------------------------------------ cell 3 + 4: wave, tangents, Zeno, limit
const morphYb = (t: number) => lerp(ROLL.base, WAVE.yb, prog(t, WAVE.morph[0], WAVE.morph[1], ease.inOutCubic));
const morphA = (t: number) => lerp(0, WAVE.A, prog(t, WAVE.morph[0], WAVE.morph[1], ease.inOutCubic)) * (1 - prog(t, 40.71, 41.1, ease.inOutCubic));
const slope = (u: number, A: number) => -A * ((4 * Math.PI) / WAVE.w) * Math.cos(4 * Math.PI * u);
const tangentD = (u: number, A: number, yb: number, len: number) => {
  const x = WAVE.x0 + WAVE.w * u, y = waveY(x, yb, A);
  const m = slope(u, A), L = Math.hypot(1, m);
  const dx = (len / 2) / L, dy = (m * len) / 2 / L;
  return `M ${n2(x - dx)} ${n2(y - dy)} L ${n2(x + dx)} ${n2(y + dy)}`;
};

const WaveCell: React.FC<{t: number}> = ({t}) => {
  if (t < WAVE.morph[0]) return null;
  const yb = morphYb(t), A = morphA(t);
  const els: React.ReactNode[] = [];
  const waveO = 1 - prog(t, 40.95, 41.15);
  if (waveO > 0) {
    const pts: P2[] = [];
    for (let k = 0; k <= 160; k++) {
      const x = WAVE.x0 + (WAVE.w * k) / 160;
      pts.push([x, waveY(x, yb, A)]);
    }
    const back = prog(t, WAVE.morph[0], WAVE.morph[0] + Fr(6));
    els.push(<path key="w" d={polyPath(pts)} fill="none" stroke={back < 1 ? K.orange : K.cream} strokeWidth={2} opacity={waveO} />);
  }
  // axis hairline + π labels (cell 3)
  const axO = prog(t, 37.3, 37.6) * (1 - prog(t, 40.71, 40.71 + Fr(6)));
  if (axO > 0) {
    els.push(<path key="ax" d={`M 110 ${WAVE.yb} L 850 ${WAVE.yb}`} stroke={K.cream} strokeOpacity={0.25 * axO} strokeWidth={1} />);
    ['0', 'π', '2π', '3π', '4π'].forEach((s, k) =>
      els.push(
        <text key={'l' + k} x={n2(WAVE.x0 + (WAVE.w / 4) * k)} y={562} textAnchor="middle" fontFamily={MATH} fontStyle="italic" fontSize={26} fill={K.cream} fillOpacity={0.7 * axO}>
          {s}
        </text>,
      ),
    );
  }
  // slider: tangent + you sitting on it
  const sO = prog(t, 38.45, WAVE.slide[0]) * (1 - prog(t, WAVE.slide[1], WAVE.slide[1] + Fr(6)));
  if (sO > 0) {
    const u = slideU(t);
    const hit = t >= T.TAN;
    // the fan of 17 tangents on the hit
    if (hit) {
      for (let k = 0; k <= 16; k++) {
        const o = prog(t, T.TAN + (k / 16) * Fr(8), T.TAN + (k / 16) * Fr(8) + Fr(2));
        if (o > 0) els.push(<path key={'f' + k} d={tangentD(k / 16, A, yb, 180)} stroke={K.cream} strokeOpacity={0.45 * o * sO} strokeWidth={1} />);
      }
    }
    els.push(<path key="tg" d={tangentD(u, A, yb, 300)} stroke={hit ? K.orange : K.cream} strokeWidth={hit ? 2 : 1.5} opacity={sO} strokeLinecap="round" />);
    const x = WAVE.x0 + WAVE.w * u, y = waveY(x, yb, A);
    const m = slope(u, A), L = Math.hypot(1, m);
    const nx = m / L, ny = -1 / L;
    // the you ring sits on the tangent, a little ahead of the dot
    const ahead = 46;
    const ax = x + ahead / L, ay = y + (m * ahead) / L;
    els.push(
      <g key="you" opacity={sO}>
        <YouNodeG t={t} x={n2(ax + nx * 11.5)} y={n2(ay + ny * 11.5)} labelPos="above" />
      </g>,
    );
  }
  // cell 4: the axis runs past the axes box and is cut by the window frame
  if (t >= 40.71) {
    const slide = prog(t, 42.346, 42.65, ease.inOutCubic);
    const ay = lerp(ZENO.y, LIMC.axisY, slide);
    const ap = prog(t, 40.71, 40.95, ease.inOutCubic);
    els.push(<path key="za" d={`M 110 ${n2(ay)} L ${n2(lerp(110, NB.w + 60, ap))} ${n2(ay)}`} stroke={K.cream} strokeOpacity={0.7} strokeWidth={1.5} />);
    // Zeno ticks, one per eighth note, each halfway to the edge
    const tickO = 1 - prog(t, 42.346, 42.346 + Fr(6));
    if (tickO > 0) {
      for (let k = 0; k < 26; k++) {
        const tk = k < 6 ? ZENO.t0 + k * ZENO.step : ZENO.t0 + 5 * ZENO.step + ((k - 5) / 20) * Fr(4);
        if (t < tk) continue;
        const x = ZENO.x1 - (ZENO.x1 - WAVE.x0) / Math.pow(2, k);
        els.push(<path key={'t' + k} d={`M ${n2(x)} ${ZENO.y - 7} L ${n2(x)} ${ZENO.y + 7}`} stroke={K.cream} strokeOpacity={0.7 * tickO} strokeWidth={1} />);
        if (k < 4)
          els.push(
            <text key={'tl' + k} x={n2(x)} y={ZENO.y + 32} textAnchor="middle" fontFamily={CODE} fontSize={16} fill={K.creamDim} opacity={tickO}>
              {String(2 ** k)}
            </text>,
          );
      }
    }
    // asymptote, curve
    if (t >= 42.4) {
      const hit = t >= T.LIM;
      const pa = prog(t, 42.4, 42.7, ease.inOutCubic);
      els.push(
        <path
          key="asy"
          d={`M 110 ${LIMC.asy} L ${n2(lerp(110, NB.w + 60, pa))} ${LIMC.asy}`}
          stroke={hit ? K.orange : K.cream}
          strokeOpacity={hit ? 1 : 0.7}
          strokeWidth={2}
          strokeDasharray={hit ? undefined : '12 10'}
        />,
      );
      if (t >= LIMC.t0) {
        const xe = limX(t);
        const pts: P2[] = [];
        for (let k = 0; k <= 140; k++) {
          const x = LIMC.x0 + ((xe - LIMC.x0) * k) / 140;
          pts.push([x, limY(x)]);
        }
        els.push(<path key="lc" d={polyPath(pts)} fill="none" stroke={K.cream} strokeWidth={2} />);
      }
      if (hit) {
        const o = prog(t, T.LIM, T.LIM + Fr(5));
        els.push(
          <g key="L" opacity={o}>
            <text x={80} y={LIMC.asy + 14} textAnchor="end" fontFamily={MATH} fontStyle="italic" fontSize={40} fill={K.cream}>
              L
            </text>
            <text x={114} y={LIMC.asy - 16} fontFamily={CODE} fontSize={16} fill={K.creamDim}>
              limit = L
            </text>
          </g>,
        );
      }
    }
  }
  return <g>{els}</g>;
};

// ------------------------------------------------------------------ the notebook
const KW = {x: 458, y: 792, w: 850};
const kw = (pre: string, k: string, post: string) => ({pre, kw: k, post, size: kwFit(pre, k, post, KW.w, 104)});
const K_DIM = kw('me.', 'DIMENSION', ' += 1;');
const K_CIRC = kw('const ', 'CIRCUMFERENCE', ' = 2πr;');
const K_TAN = kw('ax.plot(', 'TANGENTS', ')');
const K_LIM = kw('if (x >= ', 'LIMITATIONS', ') break;');

// Local guard for a race in usePose (LineArt.tsx): if the pose finishes loading
// between a component's first render and usePose's effect, the effect finds the
// cache filled and never forces a re-render, so the frame is captured without
// the pose (seen on ~1 in 3 fresh-tab stills). This hook always re-renders the
// notebook once loadPose resolves and holds the frame until that commit.
const useStandPose = (): PoseRec | null => {
  const rec0 = usePose('stand');
  const [rec, setRec] = useState<PoseRec | null>(rec0);
  const [hold] = useState(() => (rec0 ? null : delayRender('S0 notebook: pose stand', {timeoutInMilliseconds: 60000})));
  useEffect(() => {
    let live = true;
    const done = () => {
      if (hold !== null) requestAnimationFrame(() => requestAnimationFrame(() => continueRender(hold)));
    };
    loadPose('stand').then(
      (r) => {
        if (live) setRec(r);
        done();
      },
      () => done(),
    );
    return () => {
      live = false;
    };
  }, [hold]);
  return rec ?? rec0;
};

export const Notebook: React.FC<{t: number}> = ({t}) => {
  useStandPose();
  if (t < T.notebook) return null;
  const inkO = t < CELLS[1].t0 ? 1 : 1 - prog(t, CELLS[1].t0, CELLS[1].t0 + Fr(6));
  return (
    <Win x={NB.x} y={NB.y} w={NB.w} h={NB.h} title="plot.py — notebook" kind="editor" tOpen={T.notebook} a={0} seed={8} focus>
      {t >= 31.2 && inkO > 0 && <LineArt pose="stand" x={CHAR_X} y={CHAR.top} h={CHAR.h} reveal={[31.2, 32.6]} pen={false} inkOpacity={inkO} />}
      <svg width={NB.w} height={NB.h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <CellInput t={t} />
        <Axes t={t} />
        <PointsAndHer t={t} />
        <FOverlay t={t} />
        <Labels1 t={t} />
        <CircleCell t={t} />
        <WaveCell t={t} />
      </svg>
      <KwCode t0={T.DIM} t1={33.25} {...K_DIM} x={KW.x} y={KW.y} a={0} knock={false} />
      <KwCode t0={T.CIRC} t1={36.87} {...K_CIRC} x={KW.x} y={KW.y} a={0} knock={false} />
      <KwCode t0={T.TAN} t1={40.55} {...K_TAN} x={KW.x} y={KW.y} a={0} knock={false} />
      <KwCode t0={T.LIM} t1={44.2} {...K_LIM} x={KW.x} y={KW.y} a={0} knock={false} />
    </Win>
  );
};
