// S1 chorus 1 (58.6–74.0): six stimulus windows (STIMULATIONS), the hand
// reaching out through its window (SATISFACTION), happy.py + run --execution
// (EXECUTION), and the recursive IDE-inside-its-own-stage with the camera
// zoom into the innermost copy (SIMULATION).
import React from 'react';
import {beat, ease, env, FPS, K, lastOnset, prog, pulse, useT} from '../../v3/core';
import {Check} from '../../v3/geo';
import {LineArt} from '../char/LineArt';
import {CodeBlock} from '../shell/Code';
import {KwCode} from '../shell/KwCode';
import {Frame, r2} from '../shell/lib';
import {Win} from '../shell/Win';
import {At, circD, HoldImages, Mono, P, P2, poly, pp, TAU} from './S1_lib';
import {L, STAGE} from './s1.data';

// ================================================================== stimuli (58.6–63.0)
const STIM_T = [128, 129, 130, 131, 132, 133].map((n) => beat(n)); // 59.22 … 61.53
const STIM_NAMES = ['sine', 'square', 'saw', 'pulse', 'orbit', 'dots'];
const CW = 284, CH = 252;
const cell = (i: number) => ({x: 992 + (i % 3) * 302, y: 168 + Math.floor(i / 3) * 274});
const BURSTS = [L.STIM, beat(135), beat(136)]; // 61.96, 62.45, 62.91

const wave = (kind: number, u: number) => {
  const s = Math.sin(TAU * u);
  if (kind === 0) return s;
  if (kind === 1) return s >= 0 ? 0.8 : -0.8;
  if (kind === 2) return 2 * (u - Math.floor(u)) - 1;
  if (kind === 3) {
    const f = u - Math.floor(u);
    return f < 0.08 ? -1 + f * 12 : f < 0.16 ? 1 - (f - 0.08) * 25 : 0;
  }
  return s;
};

const StimBody: React.FC<{t: number; i: number}> = ({t, i}) => {
  const bw = CW, bh = CH - 34;
  const cy = bh / 2 + 4;
  const burst = Math.max(...BURSTS.map((b) => env(t - b, 0.18)));
  const amp = 52 * (1 + 0.25 * pulse(t) + 0.45 * burst);
  const out: React.ReactNode[] = [];
  out.push(<path key="ax" d={`M 16 ${cy} L ${bw - 16} ${cy}`} stroke={K.line2} strokeWidth={1} />);
  if (i <= 3) {
    const pts: P2[] = [];
    const N = 90;
    for (let k = 0; k <= N; k++) {
      const x = 16 + ((bw - 32) * k) / N;
      const u = (k / N) * 2.2 - (t - STIM_T[i]) * 1.1;
      pts.push([x, cy - amp * 0.82 * wave(i, u)]);
    }
    out.push(<path key="w" d={poly(pts)} fill="none" stroke={K.cream} strokeWidth={1.5} strokeLinejoin="round" />);
    out.push(<circle key="h" cx={r2(pts[N][0])} cy={r2(pts[N][1])} r={4} fill={K.orange} />);
  } else if (i === 4) {
    // Lissajous orbit 3:2
    const pts: P2[] = [];
    const ph = (t - STIM_T[i]) * 1.4;
    for (let k = 0; k <= 160; k++) {
      const a = (k / 160) * TAU;
      pts.push([bw / 2 + 0.95 * amp * Math.sin(3 * a + ph), cy + 0.85 * amp * Math.sin(2 * a)]);
    }
    out.push(<path key="w" d={poly(pts)} fill="none" stroke={K.cream} strokeWidth={1.5} />);
    const a = ((t - STIM_T[i]) * 0.6) % 1 * TAU;
    out.push(<circle key="h" cx={r2(bw / 2 + 0.95 * amp * Math.sin(3 * a + ph))} cy={r2(cy + 0.85 * amp * Math.sin(2 * a))} r={4} fill={K.orange} />);
  } else {
    // dot matrix lighting on beats
    const on = Math.floor((lastOnset(t) - 59) / 0.4615 + 0.5);
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 8; c++) {
        const k = r * 8 + c;
        const lit = (k * 7 + on * 5) % 11 < 3 || burst > 0.4;
        out.push(<circle key={k} cx={30 + c * 32} cy={cy - 54 + r * 36} r={lit ? 6 : 3} fill={lit ? K.orange : K.creamDim} opacity={lit ? 0.6 + 0.4 * pulse(t) : 0.45} />);
      }
  }
  return <At>{out}</At>;
};

const Stimuli: React.FC<{t: number}> = ({t}) => {
  if (t < 59.0 || t > 63.3) return null;
  return (
    <>
      {STIM_T.map((t0, i) => {
        const c = cell(i);
        const fl = Math.max(...BURSTS.map((b) => (t >= b ? env(t - b, 0.15) : 0)));
        return (
          <React.Fragment key={i}>
            <Win x={c.x} y={c.y} w={CW} h={CH} title={`stim[${i}] · ${STIM_NAMES[i]}`} kind={i % 2 ? 'term' : 'plain'} tOpen={t0} tClose={62.62 + i * 0.06} a={0} seed={30 + i} focus={fl > 0.3}>
              <StimBody t={t} i={i} />
            </Win>
            {fl > 0.02 && t < 62.62 + i * 0.06 && (
              <At>
                <Frame x={c.x} y={c.y} w={CW} h={CH} t={t} color={K.orange} opacity={fl} sw={2} />
              </At>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

// ================================================================== only.you: the hand (63.4–66.6)
export const RW = {x: 1060, y: 150, w: 820, h: 560};
const RB = {x0: RW.x, y0: RW.y + 34, x1: RW.x + RW.w, y1: RW.y + RW.h}; // body box
const K0 = (RB.y1 - RB.y0) / 941;
const LEFT_SRC = 150; // source x at the body's left edge at rest
const ANCHOR: P2 = [1150, 420]; // wrist (source px), the push pivot
const PIV: P2 = [RB.x0 + (ANCHOR[0] - LEFT_SRC) * K0, RB.y0 + ANCHOR[1] * K0];
const PUSH0 = L.SATIS - 0.1, PUSH1 = L.SATIS + 0.32;
const handScale = (t: number) => 1 + 0.22 * prog(t, PUSH0, PUSH1, ease.outCubic) + 0.01 * Math.sin(TAU * (t - PUSH1) * 0.8) * (t > PUSH1 ? 1 : 0);
// hulls (source px) of the index finger and the thumb: the only parts allowed out of the frame
const INDEX: P2[] = [[372, 525], [300, 516], [196, 436], [168, 402], [170, 368], [240, 354], [330, 378], [372, 392]];
const THUMB: P2[] = [[488, 150], [490, 40], [522, 24], [610, 44], [705, 92], [745, 150]];

const Hand: React.FC<{t: number}> = ({t}) => {
  if (t < 63.55 || t > 66.6) return null;
  const s = handScale(t);
  const k = K0 * s;
  const x = PIV[0] - ANCHOR[0] * k, y = PIV[1] - ANCHOR[1] * k;
  const D = (p: P2): P2 => [x + p[0] * k, y + p[1] * k];
  const idx = INDEX.map(D), th = THUMB.map(D);
  // union of the window body and the two hulls (hull points clamped onto the border)
  const pts: P2[] = [
    [RB.x0, RB.y0],
    ...th.map(([px, py]): P2 => [px, Math.min(py, RB.y0)]),
    [RB.x1, RB.y0],
    [RB.x1, RB.y1],
    [RB.x0, RB.y1],
    ...idx.map(([px, py]): P2 => [Math.min(px, RB.x0), py]),
  ];
  const cp = `polygon(${pts.map(([px, py]) => `${r2(px)}px ${r2(py)}px`).join(', ')})`;
  const out = s > 1.001;
  return (
    <>
      {out && (
        <At o={1 - prog(t, 66.1, 66.3)}>
          <path d={poly(idx, true)} fill={K.surface} />
          <path d={poly(th, true)} fill={K.surface} />
        </At>
      )}
      <HoldImages style={{clipPath: cp}} expect={t > 63.63 && t < 66.49}>
        <LineArt pose="hand" x={x} y={y} scale={k} reveal={[63.62, 65.2]} unreveal={[66.12, 66.5]} />
      </HoldImages>
    </>
  );
};

const Reach: React.FC = () => (
  <Win {...RW} title="only.you" tOpen={63.3} tClose={66.52} a={0} seed={41} focus>
    <></>
  </Win>
);

// ================================================================== happy.py + run (66.6–70.05)
const HW = {x: 1000, y: 108, w: 540, h: 480};
const RUNW = {x: 1296, y: 430, w: 584, h: 320};
const HAPPY_C: P2 = [270, 300];

const HappyBody: React.FC<{t: number}> = ({t}) => {
  const [cx, cy] = HAPPY_C;
  const smile: P2[] = [];
  for (let k = 0; k <= 40; k++) {
    const x = -72 + (144 * k) / 40;
    smile.push([cx + x, cy + 58 - (x * x) / 96]);
  }
  const eye = (t0: number, ex: number) => {
    const q = prog(t, t0, t0 + 0.12, ease.outCubic);
    return q > 0 ? <circle cx={ex} cy={cy - 34} r={9 * q * (1 + 0.25 * pulse(t))} fill={K.cream} /> : null;
  };
  return (
    <>
      <CodeBlock x={22} y={14} size={18} lines={['def smile(x):', '    return x * x / 4', 'plot(smile, eyes=2)']} lang="py" typeOn={[66.72, 67.35]} caret />
      <At>
        <path d={`M ${cx - 190} ${cy} L ${cx + 190} ${cy} M ${cx} ${cy - 150} L ${cx} ${cy + 140}`} stroke={K.cream} strokeOpacity={0.25} strokeWidth={1} />
        <P d={circD(cx, cy, 128)} p={pp(t, 67.4, 0.42)} t={t} />
        <P d={poly(smile)} p={pp(t, 67.86, 0.34)} t={t} color={K.orange} w={3} />
        {eye(beat(147), cx - 44)}
        {eye(beat(147) + 0.23, cx + 44)}
        <Mono x={cx + 140} y={cy + 128} s={14} o={prog(t, 68.3, 68.5)}>
          {':)'}
        </Mono>
      </At>
    </>
  );
};

const SPIN = ['|', '/', '-', '\\'];
const RunBody: React.FC<{t: number}> = ({t}) => {
  const p0 = 68.9, done = L.EXEC;
  const q = prog(t, p0, done);
  const n = Math.round(q * 20);
  const bar = '[' + '='.repeat(Math.max(0, n - 1)) + (n > 0 && n < 20 ? '>' : n >= 20 ? '=' : '') + ' '.repeat(20 - n) + ']';
  const spin = SPIN[Math.floor(t * FPS / 2) % 4];
  const isDone = t >= done;
  return (
    <>
      <CodeBlock x={22} y={16} size={20} lineNo={false} lines={['$ run --execution']} lang="sh" typeOn={[68.32, 68.8]} caret={t < p0} />
      <At>
        {t >= p0 && (
          <Mono x={22} y={96} s={20} c={K.cream}>
            {(isDone ? '  ' : spin + ' ') + bar + ` ${String(Math.round(q * 100)).padStart(3)}%`}
          </Mono>
        )}
        {isDone && (
          <g opacity={prog(t, done, done + 0.1)}>
            <Check x={26} y={142} p={prog(t, done, done + 0.12)} />
            <Mono x={52} y={146} s={20} c={K.cream}>
              done in 0.4s
            </Mono>
            <Mono x={22} y={190} s={18} o={prog(t, done + 0.3, done + 0.4)}>
              exit 0
            </Mono>
          </g>
        )}
      </At>
    </>
  );
};

// ================================================================== SIMULATION recursion (70.08–74.3)
const SIM_OPEN = 70.08;
export const MINI_K = 860 / 1920;
const MW = {x: 1008, y: 272, w: 860, h: 34 + 1080 * MINI_K};
const MINI_T = [0, beat(153), beat(155), beat(157), beat(157)]; // depth d's mini opens at MINI_T[d+1]
const MAX_DEPTH = 4;
const ZOOM0 = L.SIM, ZOOM1 = 73.85;
const PSTAR: P2 = [MW.x / (1 - MINI_K), (MW.y + 34) / (1 - MINI_K)];
const zoomZ = (t: number) => Math.pow(1 / MINI_K, t >= ZOOM1 ? 0 : prog(t, ZOOM0, ZOOM1, ease.inOutCubic));
export const simZoom = (t: number) => {
  const z = zoomZ(t);
  if (z === 1) return undefined;
  return `translate(${r2(PSTAR[0])}px, ${r2(PSTAR[1])}px) scale(${z.toFixed(5)}) translate(${r2(-PSTAR[0])}px, ${r2(-PSTAR[1])}px)`;
};
// draw a level as outlines only when it is tiny on screen
export const liteAt = (t: number, depth: number) => depth >= 3 && Math.pow(MINI_K, depth) * zoomZ(t) < 0.15;
// the top level is entirely off screen near the end of the zoom
export const hideTop = (t: number) => zoomZ(t) > 2.05;

const Sim: React.FC<{t: number; depth: number; nested: (d: number) => React.ReactNode}> = ({t, depth, nested}) => {
  const tOpenMini = MINI_T[depth + 1];
  const closeMini = depth === 0 ? ZOOM1 : undefined;
  const showNested = depth + 1 <= MAX_DEPTH && t >= tOpenMini;
  return (
    <>
      {(depth > 0 || t < 74.05) && <Win {...STAGE} title="simulation" tOpen={depth === 0 ? SIM_OPEN : 0} a={0} seed={50} />}
      {showNested && (
        <div style={{position: 'absolute', left: STAGE.x, top: STAGE.y + 34, width: STAGE.w, height: STAGE.h - 34, overflow: 'hidden'}}>
          <Win x={MW.x - STAGE.x} y={MW.y - STAGE.y - 34} w={MW.w} h={MW.h} title="world.execute(me)" tOpen={tOpenMini} tClose={closeMini} a={0} seed={51 + depth}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `scale(${MINI_K})`}}>{nested(depth + 1)}</div>
          </Win>
        </div>
      )}
    </>
  );
};

// ================================================================== stage + overlay
export const ChorusStage: React.FC<{depth: number; nested: (d: number) => React.ReactNode}> = ({depth, nested}) => {
  const {t} = useT();
  return (
    <>
      {depth === 0 && <Stimuli t={t} />}
      {depth === 0 && t >= 63.2 && t < 66.7 && <Reach />}
      {depth === 0 && t >= 66.5 && t < 70.2 && (
        <>
          <Win {...HW} title="happy.py" tOpen={L.happy} tClose={69.98} a={0} seed={44}>
            <HappyBody t={t} />
          </Win>
          <Win {...RUNW} title="zsh — ~/world" kind="term" tOpen={L.run - 0.1} tClose={70.04} a={0} seed={45} focus>
            <RunBody t={t} />
          </Win>
        </>
      )}
      {t >= SIM_OPEN - 0.1 && <Sim t={t} depth={depth} nested={nested} />}
    </>
  );
};

// Burst rays around a point on a hit (beat bursts for STIMULATIONS).
const Burst: React.FC<{t: number; t0: number; x: number; y: number; r0: number; r1: number; n?: number; seed?: number}> = ({t, t0, x, y, r0, r1, n = 16}) => {
  const q = (t - t0) / 0.38;
  if (q < 0 || q > 1) return null;
  const e = ease.outCubic(q);
  return (
    <g opacity={1 - q}>
      {Array.from({length: n}, (_, i) => {
        const a = (i / n) * TAU + 0.2;
        const ra = r0 + (r1 - r0) * e, rb = ra + 34 * (1 - q);
        return <path key={i} d={`M ${r2(x + Math.cos(a) * ra)} ${r2(y + Math.sin(a) * ra * 0.42)} L ${r2(x + Math.cos(a) * rb)} ${r2(y + Math.sin(a) * rb * 0.42)}`} stroke={i % 2 ? K.cream : K.orange} strokeWidth={2} strokeLinecap="round" />;
      })}
    </g>
  );
};

export const ChorusOverlay: React.FC = () => {
  const {t} = useT();
  if (t < 61.5 || t > 74.2) return null;
  const sx = STAGE.x + STAGE.w / 2;
  return (
    <>
      {t >= 63.5 && t < 66.7 && <Hand t={t} />}
      <At>
        {BURSTS.map((b, i) => (
          <Burst key={i} t={t} t0={b} x={sx} y={866} r0={300} r1={520} />
        ))}
      </At>
      <KwCode t0={L.STIM} t1={L.thenIcan + 0.05} pre="give(you, ..." kw="STIMULATIONS" post=")" x={sx} y={900} size={82} a={0} />
      <KwCode t0={L.SATIS} t1={L.happy - 0.12} pre="you." kw="SATISFACTION" post="++;" x={sx} y={890} size={96} a={0} />
      <KwCode t0={L.EXEC} t1={L.trapped - 0.1} pre="await " kw="EXECUTION" post="();" x={sx} y={890} size={110} a={0} />
      <KwCode t0={L.SIM} t1={73.92} pre="new " kw="SIMULATION" post="(this);" x={960} y={600} size={150} a={0} style="solid" />
    </>
  );
};

