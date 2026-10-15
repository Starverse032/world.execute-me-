// Section 1: Active, 44.45–88.6 s (docs/design_v4.md §4 S1).
// Playful, multi-window, still orderly (anomaly 0 everywhere: every shared
// component gets a = 0). Beats:
//   44.45 scope: AC → DC (diff)            47.67 blind my vision: eyelids + slit
//   49.53 so dizzy: spinning polygons      51.36 timeline: A.D → B.C (no year 0)
//   55.08 you.ts + me.ts unite → us.ts     58.0  new chat "chorus"
//   58.6  six stimulus windows → STIMULATIONS
//   63.5  only.you: the hand reaches out through the frame (SATISFACTION)
//   66.6  happy.py smile + run --execution (EXECUTION)
//   70.08 the whole IDE nests inside its own stage (Droste) → zoom (SIMULATION)
//   74.05 editor tabs: eggplant / tomato / cat / god → the eye opens (EXISTENCE)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useT} from '../../v3/core';
import {preloadPoses} from '../char/LineArt';
import {Chrome} from './S1_chrome';
import {ChorusOverlay, ChorusStage, hideTop, liteAt, simZoom} from './S1_chorus';
import {DizzyOverlay, DotHandoff, NoteTail, Scope, Timeline, Unite, chromeDim} from './S1_pre';
import {VerseOverlay, VerseStage} from './S1_verse';
import {S1_END, S1_START} from './s1.data';

preloadPoses('hand', 'eye');

// The stage windows at time t. `depth` > 0 inside the SIMULATION recursion.
export const Stage: React.FC<{depth: number}> = ({depth}) => {
  const {t} = useT();
  return (
    <>
      {depth === 0 && t < 45.0 && <NoteTail />}
      {depth === 0 && t < 51.5 && <Scope />}
      {depth === 0 && t < 45.0 && <DotHandoff />}
      {depth === 0 && t >= 51.2 && t < 55.5 && <Timeline />}
      {depth === 0 && t >= 54.9 && t < 59 && <Unite />}
      {depth === 0 && t >= 73.8 && <VerseStage />}
      {t >= 58.5 && t < 74.3 && <ChorusStage depth={depth} nested={(d) => <IDE depth={d} />} />}
    </>
  );
};

// One full IDE (chrome + stage). Used at depth 0 and inside the recursion.
export const IDE: React.FC<{depth: number}> = ({depth}) => {
  const {t} = useT();
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}}>
      <Chrome dim={depth === 0 ? chromeDim(t) : 1} lite={liteAt(t, depth)} hide={depth === 0 && hideTop(t)} />
      <div style={{position: 'absolute', inset: 0, opacity: depth === 0 ? chromeDim(t) : 1}}>
        <Stage depth={depth} />
      </div>
    </div>
  );
};

export const Section1: React.FC = () => {
  const {t} = useT();
  if (t < S1_START || t >= S1_END) return null;
  const z = simZoom(t);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: z}}>
        <IDE depth={0} />
      </div>
      <DizzyOverlay />
      <ChorusOverlay />
      <VerseOverlay />
    </AbsoluteFill>
  );
};
