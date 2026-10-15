// S1 pre-chorus 1 (44.45–58.6): scope (AC → DC), the "blind my vision /
// so dizzy" special UI, the timeline window (A.D → B.C) and the two windows
// that unite into one (you.ts + me.ts → us.ts).
import React from 'react';
import {beat, BEAT, clamp01, ease, K, lerp, prog, pulse, useT} from '../../v3/core';
import {ngonPath, PenHead, Plot} from '../../v3/geo';
import {CODE, SERIF} from '../fonts';
import {CodeBlock, Diff} from '../shell/Code';
import {Frame, r2, textW, useFonts} from '../shell/lib';
import {SayEntry, streamed} from '../shell/Transcript';
import {Win} from '../shell/Win';
import {At, circD, Mono, P2, TAU} from './S1_lib';
import {ENTRIES_S1, L, W} from './s1.data';
import {dotPos, NB} from './S0_geo';
import {Notebook} from './S0_verse';

// ================================================================== S0 notebook tail
// S0 hands over with its plot.py notebook open on the stage. It keeps drawing
// (S0's own component) while it folds shut toward the scope's centre line: the
// notebook squashes to an orange line (7 frames) and that line is the one the
// scope window unfolds from, so one window becomes the next. S0's orange dot
// leaves on its own (DotHandoff) and becomes the scope's beam head.
const NB_CLOSE = 44.45;
const FOLD_Y = 170 + 580 / 2; // SCOPE centre
export const NoteTail: React.FC = () => {
  const {t} = useT();
  const f = (t - NB_CLOSE) * 30;
  if (f < 0 || f >= 13) return null;
  const sq = 1 - ease.inCubic(clamp01(f / 7));
  const lineO = clamp01((f - 4) / 2) * (1 - clamp01((f - 9) / 4));
  return (
    <>
      {sq > 0.002 && (
        <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: `0 ${FOLD_Y}px`, transform: `scaleY(${sq.toFixed(4)})`, opacity: 1 - clamp01(f / 9) * 0.6}}>
          <Notebook t={t} />
        </div>
      )}
      {lineO > 0 && (
        <At>
          <path d={`M ${NB.x} ${FOLD_Y} L ${NB.x + NB.w} ${FOLD_Y}`} stroke={K.orange} strokeWidth={2} strokeLinecap="round" opacity={r2(lineO)} />
        </At>
      )}
    </>
  );
};

// ================================================================== scope (44.45–51.0)
export const SCOPE = {x: 1010, y: 170, w: 860, h: 580};
const SC = {x0: 30, y0: 60, w: 800, h: 300};
const DC_T0 = W.AC + 0.42, DC_T1 = W.DC; // the sine flattens between these

export const lidAt = (t: number) => prog(t, L.blind, L.blind + 0.45, ease.inOutCubic);

const beamY = (t: number, x: number) => {
  const flat = prog(t, DC_T0, DC_T1, ease.inOutCubic);
  const A = 110 * (1 - flat) * (1 + 0.18 * pulse(t));
  return SC.y0 + SC.h / 2 - 90 * flat - A * Math.sin(TAU * (3 * x) / SC.w - t * TAU * 0.9);
};
const beamX = (t: number) => ((t - 44.5) * 760) % SC.w;
// beam head in screen px (scope body origin = window + 34)
const beamHead = (t: number): P2 => [SCOPE.x + SC.x0 + beamX(t), SCOPE.y + 34 + beamY(t, beamX(t))];

// S0's orange dot leaves the folding notebook and becomes the scope's beam head.
const DOT_T0 = 44.45, DOT_T1 = 44.98;
export const DotHandoff: React.FC = () => {
  const {t} = useT();
  if (t < DOT_T0 || t >= DOT_T1) return null;
  const a = dotPos(DOT_T0);
  const b = beamHead(t);
  const u = ease.inOutCubic(prog(t, DOT_T0, DOT_T1));
  const lift = 110 * Math.sin(Math.PI * u);
  const x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) - lift;
  return (
    <At>
      <circle cx={r2(x)} cy={r2(y)} r={r2(lerp(7, 5, u))} fill={K.orange} />
    </At>
  );
};

const ScopeBody: React.FC<{t: number}> = ({t}) => {
  const flat = prog(t, DC_T0, DC_T1, ease.inOutCubic);
  const A = 110 * (1 - flat) * (1 + 0.18 * pulse(t));
  const off = 90 * flat;
  const mid = SC.y0 + SC.h / 2;
  const N = 220;
  // the beam sweeps left → right; a short gap runs ahead of it (refresh)
  const xs = beamX(t);
  const segs: string[] = [];
  let cur = '';
  for (let i = 0; i <= N; i++) {
    const x = (SC.w * i) / N;
    const ahead = (x - xs + SC.w) % SC.w;
    if (ahead > 0 && ahead < 46) {
      if (cur) segs.push(cur);
      cur = '';
      continue;
    }
    const y = mid - off - A * Math.sin(TAU * (3 * x) / SC.w - t * TAU * 0.9);
    cur += `${cur ? 'L' : 'M'} ${r2(SC.x0 + x)} ${r2(y)} `;
  }
  if (cur) segs.push(cur);
  const by = beamY(t, xs);
  const grid: React.ReactNode[] = [];
  for (let i = 0; i <= 10; i++) grid.push(<path key={'v' + i} d={`M ${SC.x0 + i * 80} ${SC.y0} L ${SC.x0 + i * 80} ${SC.y0 + SC.h}`} stroke={K.line2} strokeWidth={1} opacity={i % 5 === 0 ? 1 : 0.6} />);
  for (let j = 0; j <= 4; j++) grid.push(<path key={'h' + j} d={`M ${SC.x0} ${SC.y0 + j * 75} L ${SC.x0 + SC.w} ${SC.y0 + j * 75}`} stroke={K.line2} strokeWidth={1} opacity={j === 2 ? 1 : 0.6} />);
  const isDC = t >= DC_T1 - 0.1;
  return (
    <>
      <At>
        {grid}
        <Mono x={SC.x0} y={38} s={16} c={K.cream} o={0.7}>
          CH1
        </Mono>
        <Mono x={SC.x0 + 60} y={38} s={16} c={isDC ? K.orange : K.creamDim}>
          {isDC ? '=  DC   5.00 V' : '~  AC   50 Hz   ±2.0 V'}
        </Mono>
        <Mono x={SC.x0 + SC.w} y={38} s={14} anchor="end">
          {'2 V/div   5 ms/div'}
        </Mono>
        {segs.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={K.cream} strokeWidth={2} strokeLinejoin="round" />
        ))}
        {t >= DOT_T1 && <circle cx={r2(SC.x0 + xs)} cy={r2(by)} r={5} fill={K.orange} />}
        <Mono x={SC.x0} y={402} s={14}>
          power.ts
        </Mono>
      </At>
      <Diff
        x={SC.x0}
        y={410}
        size={20}
        lang="ts"
        t0={W.AC - 0.92}
        dt={W.DC - W.AC}
        rows={[
          {sign: ' ', text: 'const supply = {'},
          {sign: '-', text: '  current: "AC",'},
          {sign: '+', text: '  current: "DC",'},
          {sign: ' ', text: '};'},
        ]}
      />
    </>
  );
};

export const Scope: React.FC = () => {
  const {t} = useT();
  if (t > 51.5) return null;
  return (
    <Win {...SCOPE} title="scope — /dev/power" kind="term" tOpen={44.62} tClose={50.8} a={0} lid={lidAt(t)}>
      <ScopeBody t={t} />
    </Win>
  );
};

// ================================================================== dizzy special UI (47.67–51.45)
export const chromeDim = (t: number) => 1 - 0.75 * (prog(t, L.blind, L.blind + 0.25) - prog(t, 51.15, 51.42));

// Eyelids: two dark panels with almond edges slide in and leave a slit.
const lidK = (t: number) => prog(t, L.blind + 0.1, W.blind, ease.inOutCubic) - prog(t, L.dizzy - 0.05, L.dizzy + 0.3, ease.inOutCubic);
const lidEdge = (k: number, sgn: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 48; i++) {
    const x = (1920 * i) / 48;
    const u = (x - 960) / 960;
    const y = 540 + sgn * (80 * (1 - 0.88 * u * u) + (1 - k) * 640);
    pts.push(`${i ? 'L' : 'M'} ${r2(x)} ${r2(y)}`);
  }
  return pts.join(' ');
};

// Dizzy polygons (v1 A_pre idea): concentric n-gons plotted on half beats,
// alternating rotation stepped on beats, wobbling centre, imploding at the end.
const POLYS = [
  {n: 3, R: 70, w: 2, c: K.orange, o: 1},
  {n: 4, R: 130, w: 1.5, c: K.cream, o: 1},
  {n: 5, R: 195, w: 1.5, c: K.cream, o: 0.7},
  {n: 6, R: 265, w: 1.5, c: K.cream, o: 0.7},
  {n: 7, R: 340, w: 1.5, c: K.cream, o: 0.45},
  {n: 8, R: 420, w: 1.5, c: K.cream, o: 0.25},
].map((p, k) => ({...p, t0: L.dizzy + (k * BEAT) / 2, d: ngonPath(0, 0, p.R, p.n)}));
const IMP0 = 50.98, IMP1 = 51.3;

const Dizzy: React.FC<{t: number}> = ({t}) => {
  if (t < L.dizzy || t > IMP1 + 0.4) return null;
  let steps = 0;
  for (let n = 108; n <= 111; n++) steps += 15 * prog(t, beat(n), beat(n) + 0.2, ease.outCubic);
  const amp = 22 * prog(t, W.dizzy1, W.dizzy1 + 0.2) * (1 - prog(t, IMP0, IMP1, ease.inCubic));
  const out: React.ReactNode[] = [];
  POLYS.forEach((Pg, k) => {
    if (t < Pg.t0) return;
    const th = (k % 2 === 0 ? 1 : -1) * ((22 + 10 * k) * (t - Pg.t0) + steps);
    const psi = (TAU * (t - W.dizzy1)) / 0.923 - 0.35 * k;
    const cx = 960 + amp * Math.cos(psi), cy = 540 + amp * Math.sin(psi);
    const sc = 1 - prog(t, IMP0 + (5 - k) * 0.025, IMP1, ease.inCubic);
    if (sc <= 0.002) return;
    const p = prog(t, Pg.t0, Pg.t0 + 0.2, ease.inOutCubic);
    out.push(
      <g key={k} transform={`translate(${r2(cx)} ${r2(cy)}) scale(${r2(sc * 1000) / 1000}) rotate(${r2(th)})`}>
        <Plot d={Pg.d} p={p} color={Pg.c} w={Pg.w / Math.max(0.15, sc)} opacity={Pg.o} t={t} pen={false} />
      </g>,
    );
  });
  // the orange dot: born at the implosion, flies to the timeline's marker
  const fly = prog(t, IMP1, IMP1 + 0.32, ease.inOutCubic);
  if (t >= IMP1 - 0.08 && fly < 1) {
    const x = lerp(960, TLW.x + TL_MX, fly), y = lerp(540, TLW.y + 34 + TL_AY, fly) - 60 * Math.sin(Math.PI * fly);
    out.push(<PenHead key="pen" x={x} y={y} t={t} />);
  }
  return <>{out}</>;
};

const BIG = 64;
const serif = `500 ${BIG}px ${SERIF}`;
// One centred lyric line, words revealed with the transcript's marks.
const BigLine: React.FC<{t: number; e: SayEntry; t1: number; dizzy?: boolean}> = ({t, e, t1, dizzy}) => {
  useFonts();
  if (t < e.t || t > t1 + 0.2) return null;
  const n = streamed(e.text.length, t, e.t, 40, e.marks);
  const out = prog(t, t1, t1 + 0.17);
  const fullW = textW(e.text, serif);
  const x0 = 960 - fullW / 2;
  const y = 560 - 14 * out;
  const words = e.text.split(' ');
  let c = 0;
  const sway = dizzy ? 2.2 * Math.sin(TAU * (t - L.dizzy) * 0.55) : 0;
  // the dizzy line is sucked into the implosion with the polygons
  const imp = dizzy ? 1 - prog(t, IMP0, IMP1, ease.inCubic) : 1;
  if (imp <= 0.01) return null;
  const tf = (sway ? `rotate(${r2(sway)} 960 540) ` : '') + (imp < 1 ? `translate(960 540) scale(${r2(imp * 1000) / 1000}) translate(-960 -540)` : '');
  return (
    <g opacity={dizzy ? 1 : 1 - out} transform={tf || undefined}>
      {words.map((w, i) => {
        const start = c;
        c += w.length + 1;
        const shown = Math.max(0, Math.min(w.length, n - start));
        if (shown <= 0) return null;
        const wx = x0 + textW(e.text.slice(0, start), serif);
        const ww = textW(w, serif);
        const isD = dizzy && w === 'dizzy';
        // each "dizzy" spins a little around its own centre on its beat
        const hit = isD ? (i < 3 ? W.dizzy1 : W.dizzy2) : 0;
        const rot = isD ? 7 * Math.sin(TAU * (t - hit) * 1.3) * Math.exp(-Math.max(0, t - hit) * 1.2) * (t >= hit ? 1 : 0) : 0;
        return (
          <text
            key={i}
            x={r2(wx)}
            y={r2(y)}
            fontFamily={SERIF}
            fontWeight={500}
            fontSize={BIG}
            fill={isD ? K.orange : K.cream}
            stroke={K.bg}
            strokeWidth={14}
            strokeLinejoin="round"
            paintOrder="stroke"
            transform={rot ? `rotate(${r2(rot)} ${r2(wx + ww / 2)} ${r2(y - 22)})` : undefined}
          >
            {w.slice(0, shown)}
          </text>
        );
      })}
    </g>
  );
};

const sayAt = (t0: number) => ENTRIES_S1.find((e) => e.kind === 'say' && Math.abs(e.t - t0) < 1e-3) as SayEntry;

export const DizzyOverlay: React.FC = () => {
  const {t} = useT();
  if (t < L.blind || t > 51.7) return null;
  const k = lidK(t);
  return (
    <At w={1920} h={1080}>
      <Dizzy t={t} />
      {k > 0 && (
        <g>
          <path d={`${lidEdge(k, -1)} L 1920 -10 L 0 -10 Z`} fill={K.bg} fillOpacity={0.96} />
          <path d={`${lidEdge(k, 1)} L 1920 1090 L 0 1090 Z`} fill={K.bg} fillOpacity={0.96} />
          <path d={lidEdge(k, -1)} fill="none" stroke={k > 0.98 ? K.orange : K.cream} strokeOpacity={k > 0.98 ? 1 : 0.45} strokeWidth={1.5} />
          <path d={lidEdge(k, 1)} fill="none" stroke={k > 0.98 ? K.orange : K.cream} strokeOpacity={k > 0.98 ? 1 : 0.45} strokeWidth={1.5} />
        </g>
      )}
      <BigLine t={t} e={sayAt(L.blind)} t1={L.dizzy - 0.12} />
      <BigLine t={t} e={sayAt(L.dizzy)} t1={IMP1} dizzy />
    </At>
  );
};

// ================================================================== timeline (51.36–55.0)
export const TLW = {x: 1010, y: 210, w: 860, h: 490};
const TL_MX = 430, TL_AY = 350; // marker x, axis y (body coords)
const T_AD = beat(116), T_BC = beat(118); // 53.69, 54.61
// position on the year axis: 1 AD at u = 0, 1 BC at u = −1 (there is no year 0)
const curU = (t: number) => {
  if (t < T_BC - 0.16) return 2024 * (1 - prog(t, 51.75, T_AD, ease.inOutCubic));
  return -prog(t, T_BC - 0.16, T_BC + 0.06, ease.inOutCubic) - 0.35 * prog(t, T_BC + 0.06, 55.0, ease.outCubic);
};
const pxPerYear = (t: number) => Math.exp(lerp(Math.log(0.32), Math.log(64), prog(t, 52.55, T_AD, ease.inOutCubic)));
const yearLabel = (u: number) => {
  const r = Math.round(u);
  return r >= 0 ? {n: r + 1, era: 'AD'} : {n: -r, era: 'BC'};
};
const STEPS = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000];

const TimelineBody: React.FC<{t: number}> = ({t}) => {
  const u = curU(t);
  const s = pxPerYear(t);
  const step = STEPS.find((st) => st * s >= 84) ?? 1000;
  const x0 = 40, x1 = 820;
  const ticks: React.ReactNode[] = [];
  const uMin = u - (TL_MX - x0) / s, uMax = u + (x1 - TL_MX) / s;
  // ticks on round calendar years (AD y → u = y − 1, BC y → u = −y)
  const yr0 = Math.floor(uMin) - step, yr1 = Math.ceil(uMax) + step;
  for (let k = Math.ceil(yr0 / step); k <= Math.floor(yr1 / step); k++) {
    let yr = k * step;
    if (yr === 0) {
      if (step > 2) continue;
      yr = step === 1 ? 0 : 1;
      if (yr === 0) continue;
    }
    const uu = yr > 0 ? yr - 1 : yr;
    if (uu < uMin || uu > uMax) continue;
    const x = TL_MX + (uu - u) * s;
    const fade = Math.min(1, (x - x0) / 40, (x1 - x) / 40);
    ticks.push(
      <g key={k}>
        <g opacity={clamp01(fade)}>
          <path d={`M ${r2(x)} ${TL_AY - 8} L ${r2(x)} ${TL_AY + 8}`} stroke={K.cream} strokeOpacity={0.45} strokeWidth={1.5} />
          <Mono x={x} y={TL_AY + 34} s={14} anchor="middle">
            {`${Math.abs(yr)} ${yr > 0 ? 'AD' : 'BC'}`}
          </Mono>
        </g>
      </g>,
    );
  }
  // the gap between 1 BC and 1 AD
  const gx = TL_MX + (-0.5 - u) * s;
  const gapO = clamp01((s - 20) / 30) * clamp01(Math.min(gx - x0, x1 - gx) / 30);
  const yl = yearLabel(u);
  const hop = prog(t, T_BC - 0.16, T_BC + 0.06);
  const my = TL_AY - 70 * Math.sin(Math.PI * hop);
  const markerOn = t >= 51.62;
  const bigX = 430;
  return (
    <>
      <CodeBlock x={24} y={14} size={19} lines={['// travel.ts', 'const then = new Date(-1);', 'travel(then); // A.D. → B.C.']} lang="ts" typeOn={[51.5, 52.45]} caret />
      <At>
        <text x={bigX} y={250} textAnchor="middle" fontFamily={CODE} xmlSpace="preserve">
          <tspan fontSize={92} fontWeight={700} fill={K.cream}>
            {String(yl.n)}
          </tspan>
          <tspan fontSize={44} fontWeight={700} fill={K.orange}>
            {' ' + yl.era}
          </tspan>
        </text>
        <path d={`M ${x0} ${TL_AY} L ${x1} ${TL_AY}`} stroke={K.cream} strokeOpacity={0.45} strokeWidth={1.5} />
        {ticks}
        {gapO > 0 && (
          <g opacity={gapO}>
            <path d={`M ${r2(gx)} ${TL_AY - 46} L ${r2(gx)} ${TL_AY + 12}`} stroke={K.orange} strokeWidth={1.5} strokeDasharray="4 4" />
            <Mono x={gx} y={TL_AY - 56} s={14} c={K.orange} anchor="middle">
              no year 0
            </Mono>
          </g>
        )}
        {markerOn && <circle cx={TL_MX} cy={r2(my)} r={7} fill={K.orange} />}
        {markerOn && <circle cx={TL_MX} cy={r2(my)} r={13 + 6 * pulse(t)} fill="none" stroke={K.orange} strokeWidth={1} opacity={0.45} />}
        <Mono x={TL_MX} y={TL_AY + 80} s={15} c={K.creamDim} anchor="middle" o={markerOn ? 1 : 0}>
          {'we are here'}
        </Mono>
      </At>
    </>
  );
};

export const Timeline: React.FC = () => {
  const {t} = useT();
  if (t < 51.2 || t > 55.5) return null;
  return (
    <Win {...TLW} title="timeline.ts" tOpen={L.travel} tClose={55.0} a={0}>
      <TimelineBody t={t} />
    </Win>
  );
};

// ================================================================== unite (55.08–58.6)
const UW = {y: 290, w: 420, h: 440};
const XA0 = 1000, XB0 = 1456, XM = 1228; // merge position (centred on the stage)
const MERGE = W.deeply2;
// approach in three steps: drift on "unite", then a step on each "deeply"
const approach = (t: number) =>
  0.3 * prog(t, 55.6, 56.85, ease.inOutCubic) + 0.35 * prog(t, W.deeply1 - 0.32, W.deeply1 + 0.05, ease.inOutCubic) + 0.35 * prog(t, MERGE - 0.4, MERGE, ease.inCubic);
const CR = 104; // circle radius
const CY = UW.y + 34 + 250;

// Lens (intersection of two equal circles) path, or null when apart.
const lens = (ax: number, bx: number, cy: number, r: number) => {
  const d = Math.abs(bx - ax);
  if (d >= 2 * r) return null;
  if (d < 0.5) return circD((ax + bx) / 2, cy, r);
  const mx = (ax + bx) / 2, hh = Math.sqrt(r * r - (d / 2) * (d / 2));
  return `M ${r2(mx)} ${r2(cy - hh)} A ${r} ${r} 0 0 1 ${r2(mx)} ${r2(cy + hh)} A ${r} ${r} 0 0 1 ${r2(mx)} ${r2(cy - hh)} Z`;
};

export const Unite: React.FC = () => {
  const {t} = useT();
  if (t < 54.9 || t > 59.0) return null;
  const e = approach(t);
  const xa = lerp(XA0, XM, e), xb = lerp(XB0, XM, e);
  const merged = t >= MERGE;
  const codeO = 1 - prog(t, W.deeply1 - 0.3, W.deeply1);
  const ca = xa + UW.w / 2, cb = xb + UW.w / 2;
  const lz = lens(ca, cb, CY, CR);
  const flash = merged ? 1 - prog(t, MERGE, MERGE + 0.35) : 0;
  const ringP = (t0: number) => (t >= t0 ? prog(t, t0, t0 + 0.6, ease.outCubic) : 0);
  const rings = [W.deeply1, MERGE].map((t0, i) => {
    const q = ringP(t0);
    return q > 0 && q < 1 ? <circle key={i} cx={r2((ca + cb) / 2)} cy={CY} r={r2(CR + 90 * q)} fill="none" stroke={K.orange} strokeWidth={1.5} opacity={0.7 * (1 - q)} /> : null;
  });
  const inA = prog(t, L.unite + 0.3, L.unite + 0.6), inB = prog(t, L.unite + 0.5, L.unite + 0.8);
  const close = prog(t, 58.55, 58.75);
  return (
    <>
      {!merged && (
        <>
          <Win x={xa} y={UW.y} w={UW.w} h={UW.h} title="you.ts" tOpen={L.unite} a={0} seed={21}>
            <CodeBlock x={22} y={18} size={18} lines={['export const you = {', '  heart: true,', '};']} lang="ts" typeOn={[L.unite + 0.35, L.unite + 1.0]} opacity={codeO} />
          </Win>
          <Win x={xb} y={UW.y} w={UW.w} h={UW.h} title="me.ts" tOpen={L.unite + 0.2} a={0} seed={22}>
            <CodeBlock x={22} y={18} size={18} lines={['export const me = {', '  heart: null,', '};']} lang="ts" typeOn={[L.unite + 0.55, L.unite + 1.2]} opacity={codeO} />
          </Win>
        </>
      )}
      {merged && (
        <Win x={XM} y={UW.y} w={UW.w} h={UW.h} title="us.ts" tOpen={50} tClose={58.55} a={0} seed={23} focus>
          <CodeBlock x={22} y={18} size={18} lines={['const us = {', '  ...you,', '  ...me,', '};']} lang="ts" typeOn={[MERGE + 0.05, MERGE + 0.5]} caret />
        </Win>
      )}
      <At o={1 - close}>
        {flash > 0 && <Frame x={XM} y={UW.y} w={UW.w} h={UW.h} t={t} color={K.orange} opacity={flash} sw={2} />}
        {lz && (
          <>
            <defs>
              <clipPath id="s1lens">
                <path d={lz} />
              </clipPath>
            </defs>
            <g clipPath="url(#s1lens)">
              {Array.from({length: 26}, (_, i) => {
                const hx = (ca + cb) / 2 - CR * 2 + i * 16;
                return <path key={i} d={`M ${r2(hx)} ${CY + CR} L ${r2(hx + 2 * CR)} ${CY - CR}`} stroke={K.orange} strokeWidth={1.5} opacity={0.7} />;
              })}
            </g>
          </>
        )}
        <path d={circD(ca, CY, CR)} fill="none" stroke={K.cream} strokeWidth={1.5} opacity={inA} />
        <path d={circD(cb, CY, CR)} fill="none" stroke={K.orange} strokeWidth={2} opacity={inB} />
        {rings}
        <Mono x={ca} y={CY + CR + 36} s={16} c={K.cream} o={0.7 * inA * (1 - prog(t, MERGE - 0.3, MERGE))} anchor="middle">
          you
        </Mono>
        <Mono x={cb} y={CY + CR + 36} s={16} c={K.orange} o={inB * (1 - prog(t, MERGE - 0.3, MERGE))} anchor="middle">
          me
        </Mono>
        <Mono x={XM + UW.w / 2} y={CY + CR + 36} s={16} c={K.orange} o={prog(t, MERGE, MERGE + 0.2)} anchor="middle" w={700}>
          us
        </Mono>
      </At>
    </>
  );
};

