// Section 0: Boot, 0–44.45 s (docs/design_v4.md §4 S0).
//   0.0–16.0  intro: chat column + stage; the orange dot carries every step
//             (power line → shield → pieces → object → params → globe → title)
//   16.0      the one hard cut: the title flashes to orange outline
//   16.0–29.7 instrumental: the title shrinks into the header path, the IDE
//             chrome draws itself on beats, a perfect-rhythm tool log
//   29.7–44.45 verse 1: plot.py notebook; her first appearance as points that
//             connect into line art; circle → 2πr; sine + tangents; the limit
//             clipped by the window frame.
// Handoff at 44.45: standard IDE layout with the notebook window still open.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {beat, beatIndex, clamp01, ease, FPS, K, lerp, prog, pulse, useT} from '../../v3/core';
import {Spark} from '../../v3/geo';
import {preloadPoses} from '../char/LineArt';
import {Composer, ComposerState, TetherG, YouNodeG} from '../shell/Composer';
import {Layer, P2} from '../shell/lib';
import {Sidebar} from '../shell/Sidebar';
import {clockStr, Header, Status} from '../shell/Status';
import {Transcript} from '../shell/Transcript';
import {BootWindows, Guides, HEADER_T0, headerPath, TitleCut} from './S0_boot';
import {dotPos, dotR, n2, NB} from './S0_geo';
import {Intro, sparkIntro} from './S0_intro';
import {Notebook} from './S0_verse';
import {CHATS, clockAt, CUT, IDE, PINGS, PROMPTS, S0_END, SPARK0, STATUS_T0, T, VERBS, IDE_ENTRIES, YOU0} from './s0.data';

preloadPoses('stand');
const Fr = (f: number) => f / FPS;

// ------------------------------------------------------------------ Claude's spark (tether end)
const BLOOM: P2 = [960, 700];
const FLIGHT: [number, number] = [19.0, STATUS_T0];
const statusRot = (t: number) => (t - STATUS_T0) * 120;
const bloomRot = (t: number) => 8 * (t - CUT) + 15 * Math.max(0, beatIndex(t) - beatIndex(CUT)) + 15 * prog(t, beat(beatIndex(t)), beat(beatIndex(t)) + Fr(6), ease.outCubic) - 15;
// position, radius, rotation of Claude's spark at t (null once Status owns it)
const sparkAt = (t: number): {x: number; y: number; R: number; rot: number; rays: number} | null => {
  if (t < CUT) {
    const s = sparkIntro(t);
    return {...s, rays: 12};
  }
  if (t >= STATUS_T0 + Fr(5)) return null;
  const bloom = prog(t, CUT, CUT + Fr(8), ease.outCubic);
  const fp = prog(t, FLIGHT[0], FLIGHT[1], ease.inOutCubic);
  return {
    x: lerp(BLOOM[0], IDE.spark[0], fp),
    y: lerp(BLOOM[1], IDE.spark[1], fp) - 60 * Math.sin(Math.PI * fp),
    R: lerp(48 * (1 + 0.08 * pulse(t, 2)), 11, fp),
    rot: lerp(bloomRot(t), statusRot(t), fp),
    rays: 12 * bloom,
  };
};
const tetherEnd = (t: number): P2 => {
  const s = sparkAt(t);
  return s ? [s.x, s.y] : IDE.spark;
};
const youAt = (t: number): P2 => (t < CUT ? YOU0 : IDE.you);

const Persistent: React.FC<{t: number}> = ({t}) => {
  const sp = sparkAt(t);
  const you = youAt(t);
  // rings from the bloom spark on b36 / b38
  const rings = t >= CUT && t < 19.2 ? [beat(36), beat(38)].map((tb, i) => {
    const p = (t - tb) / 1.2;
    if (p < 0 || p > 1) return null;
    return <circle key={i} cx={BLOOM[0]} cy={BLOOM[1]} r={n2(48 + 672 * ease.outCubic(p))} fill="none" stroke={K.cream} strokeWidth={1} opacity={0.45 * (1 - p)} />;
  }) : null;
  return (
    <Layer>
      {rings}
      <TetherG t={t} from={you} to={tetherEnd(t)} t0={-Fr(10)} sends={t < CUT ? [T.send0] : [T.ask, T.move]} />
    </Layer>
  );
};

const SparkTop: React.FC<{t: number}> = ({t}) => {
  const sp = sparkAt(t);
  const you = youAt(t);
  return (
    <Layer>
      <YouNodeG t={t} x={you[0]} y={you[1]} pings={PINGS} />
      {sp && <Spark x={sp.x} y={sp.y} R={sp.R} rot={sp.rot} rays={sp.rays} />}
    </Layer>
  );
};

// ------------------------------------------------------------------ the orange dot
const Dot: React.FC<{t: number}> = ({t}) => {
  if (t < T.send0) return null;
  const [x, y] = dotPos(t);
  const r = dotR(t);
  const docked = r < 5;
  const s = docked ? 1 : 1 + 0.25 * pulse(t);
  // at LIMITATIONS the dot hits the window frame: a short recoil + a lit border segment
  const lf = (t - T.LIM) * FPS;
  const recoil = lf >= 0 && lf < 4 ? -6 * Math.sin((Math.PI * lf) / 4) : 0;
  const hit = lf >= 0 ? 1 - clamp01(lf / 14) : 0;
  const ringO = docked || (t >= CUT && t < T.detach) ? 0 : 0.45;
  return (
    <Layer>
      {hit > 0 && <path d={`M ${NB.x + NB.w} ${n2(y - 44)} L ${NB.x + NB.w} ${n2(y + 44)}`} stroke={K.orange} strokeWidth={2.5} opacity={hit} strokeLinecap="round" />}
      <g transform={`translate(${n2(x + recoil)} ${n2(y)}) scale(${n2(s)})`}>
        {ringO > 0 && <circle r={r + 7} fill="none" stroke={K.orange} strokeWidth={1 / s} opacity={ringO} />}
        <circle r={r} fill={K.orange} />
      </g>
    </Layer>
  );
};

// ------------------------------------------------------------------ IDE chrome (from the cut)
const composerState = (): ComposerState => 'normal';
const IdeChrome: React.FC<{t: number}> = ({t}) => (
  <>
    <Sidebar {...IDE.sidebar} items={CHATS} t0={T.sidebar} a={0} />
    <Transcript {...IDE.transcript} entries={IDE_ENTRIES} a={0} />
    <Status x={IDE.status.x} y={IDE.status.y} verbs={VERBS} t0={STATUS_T0} a={0} />
    {t >= HEADER_T0 && <Header path={headerPath(t)} clock={clockStr(clockAt(t))} t0={HEADER_T0} a={0} />}
  </>
);

export const Section0: React.FC = () => {
  const {t} = useT();
  if (t < 0 || t >= S0_END) return null;
  const intro = t < CUT;
  return (
    <AbsoluteFill>
      {intro ? (
        <Intro t={t} />
      ) : (
        <>
          <Guides t={t} />
          <BootWindows t={t} />
          <Notebook t={t} />
          <IdeChrome t={t} />
        </>
      )}
      <Persistent t={t} />
      {!intro && <Composer {...IDE.composer} prompts={PROMPTS} state={composerState} tOpen={T.composerOpen} a={0} />}
      <SparkTop t={t} />
      {!intro && <TitleCut t={t} />}
      <Dot t={t} />
    </AbsoluteFill>
  );
};
void SPARK0;
