// Section B (see docs/design_B.md), 88.60–131.20 s (f2658–f3936). Each layer
// returns null outside the section.
//   B_pre.tsx     B1–B4  Venus/Mars, AM–PM dial, S/M swap, trance spirals
//   B_chorus.tsx  B5–B8  strings, progress ring, the wheel that empties, moment 5 (sit)
//   B_bridge.tsx  B9–B12 shards, the heart, moment 6 (defy) and the iris onto the seed
import React from 'react';
import {beat, clamp01, ease, FPS, prog, useT} from '../core';
import {PenHead, Svg} from '../geo';
import {PreChorus} from './B_pre';
import {Chorus, MomentSit, SCAN_A, scanY, seedPos} from './B_chorus';
import {Bridge, MomentDefy} from './B_bridge';
import {C} from './B_util';

const F0 = 2658, F1 = 3936;
const inB = (frame: number) => frame >= F0 && frame <= F1;

// The seed (orange pen head at rest, pulsing on every beat) in the stage layer.
// 88.60–116.13: at C, drifting to (1640, 300) over 113.10–115.90, then it rides the
// sit scan line for 4 frames. 121.536–125.689: back at C under the heart. The
// final set-down (f3923–f3936) is drawn above the iris in MomentDefy.
const SEED_B = {in: beat(263), out: 125.508, gone: 125.689};
const Seed: React.FC<{t: number}> = ({t}) => {
  if (t < SCAN_A + 4 / FPS) {
    const [x, y] = t < SCAN_A ? seedPos(t) : [1640, scanY(t)];
    return <PenHead x={x} y={y} t={t} />;
  }
  if (t >= SEED_B.in && t < SEED_B.gone) {
    const s = Math.min(ease.outExpo(clamp01((t - SEED_B.in) / (4 / FPS))), 1 - prog(t, SEED_B.out, SEED_B.gone));
    return s > 0 ? <PenHead x={C.x} y={C.y} t={t} scale={s} /> : null;
  }
  return null;
};

// Stage geometry: dimmed to 60 % on keyword frames with the rest of the stage.
export const SectionB: React.FC = () => {
  const {t, frame} = useT();
  if (!inB(frame)) return null;
  return (
    <Svg>
      <PreChorus t={t} frame={frame} />
      <Chorus t={t} frame={frame} />
      <Bridge t={t} frame={frame} />
      <Seed t={t} />
    </Svg>
  );
};

// Character layers: not dimmed, drawn under the stage keyword and the UI.
// Moment 5 (sit, B8) and moment 6 (defy, B11–B12, with its spark, leaders and iris).
export const SectionBChar: React.FC = () => {
  const {t, frame} = useT();
  if (!inB(frame)) return null;
  return (
    <>
      <MomentSit t={t} frame={frame} />
      <MomentDefy t={t} frame={frame} />
    </>
  );
};

// Nothing of Section B sits above the persistent UI.
export const SectionBTop: React.FC = () => null;
