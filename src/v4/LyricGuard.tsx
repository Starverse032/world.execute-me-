// The lyric guard (v6). Scenes draw the sung line themselves (in the transcript,
// on a curve, in a special UI). Whenever the camera pushes in, that line can be
// carried off screen, so this layer, which sits outside the camera, takes over:
// it shows the current sung line at a fixed safe place, in the same caption
// style, on a dark plate. Full-frame shots that draw their own lyric are left alone.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FPS, prog, useT} from '../v3/core';
import {cameraAt} from './camera';
import {SIM_GUARD} from './sections/s1.data';
import {LYRICS} from './lyrics';
import {Layer} from './shell/lib';
import {Caption, LYRIC} from './sections/S4_lib';

// full-frame layers that carry their own lyric captions (song seconds)
export const OWN_CAPTIONS: [number, number][] = [
  [31.2, 41.02], // the plot (S0_full)
  [47.6, 49.6], // the eye (S1_eye); "So dizzy" is the centred v5 line (S1_pre)
  [61.86, 63.54], // the six signals, and "Then I can" held after them (S1_full)
  [66.5, 70.0], // comfort and the execution beside her (S1_closeups)
  [81.3, 84.85], // cat ears, until they fold back into cat.ts (S1_closeups)
  [88.55, 103.5], // F/M faces, the globe, S/M (S2_scenes)
];
const own = (t: number) => OWN_CAPTIONS.some(([a, b]) => t >= a && t < b);

// Where the transcript's live (sung) line sits in the unpushed frame. The guard
// fades in as that box is carried past the frame edge, so the line is never
// shown twice at full strength and never lost.
const LIVE = {x0: 280, x1: 760, y0: 690, y1: 840};
const MARGIN = {x0: 30, x1: 1890, y0: 70, y1: 1040};
const offScreen = (t: number) => {
  const {s, c} = cameraAt(t);
  if (s < 1.01) return 0;
  const X = (x: number) => (x - c[0]) * s + 960, Y = (y: number) => (y - c[1]) * s + 540;
  const over = Math.max(MARGIN.x0 - X(LIVE.x0), X(LIVE.x1) - MARGIN.x1, MARGIN.y0 - Y(LIVE.y0), Y(LIVE.y1) - MARGIN.y1, 0);
  return Math.min(1, over / 90);
};

export const LyricGuard: React.FC = () => {
  const {t} = useT();
  if (own(t)) return null;
  // v11: also through the recursion's zoom, where the program's own copies recede
  const zoom = prog(t, SIM_GUARD[0], SIM_GUARD[0] + 0.1);
  const o = t < SIM_GUARD[1] ? Math.max(offScreen(t), zoom) : offScreen(t);
  if (o <= 0) return null;
  const line = LYRICS.find((l) => t >= l.t && t < l.end);
  if (!line) return null;
  // v7: the same reading place as every full-frame shot (bottom left)
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Layer>
        <Caption t={t} t0={line.t} t1={line.end - 5 / FPS} text={line.text} {...LYRIC} plate />
      </Layer>
    </AbsoluteFill>
  );
};
