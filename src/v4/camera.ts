// A virtual camera over the whole MV (grid + sections). v6: it moves only when
// the move shows something new; everything else holds still.
//  27.6–29.7   onto Read(me.ts) → file not found (she does not exist yet)
//  30.9–31.4   into plot.py's figure, where the full-frame plot takes over (S0_full)
//  40.7–41.3   back out to the notebook for the limit
//  65.1–66.8   into only.you as the hand reaches out of its window (SATISFACTION)
//  132–134.5, 145–147.7  onto the lone composer: are you still there? / please answer. / execute(me)
// While the camera is pushed in, the sung line is held on screen by the lyric
// guard (LyricGuard.tsx), which sits outside the camera.
// screen = (p − c) · s + (960, 540). Outside the keys the camera is identity.
import {ease, Ease, lerp} from '../v3/core';
import type {P2} from './shell/lib';

export type Cam = {s: number; c: P2};
type Key = Cam & {t: number; e: Ease};

const ID: Cam = {s: 1, c: [960, 540]};
// the bottom of the intro transcript, where Read(me.ts) answers "file not found"
const ME_NF: Cam = {s: 2.1, c: [560, 770]};
// verse 1: into plot.py's figure, ×2, where the full-frame layer takes over (S0_full)
const PLOT_IN: Cam = {s: 2, c: [1438, 468]};
// chorus 1: the body of the only.you window (S1_chorus RW) filling the frame
// v7: framed a little lower so the keyword at the window's foot clears the lyric (bottom left)
const HAND: Cam = {s: 2.1, c: [1470, 482]};
// S3's lone composer (560..1360, y 900) and the undelivered message above it, ×1.9
const PLEA: Cam = {s: 1.9, c: [960, 790]};

const k = (t: number, cam: Cam, e: Ease = ease.inOutCubic): Key => ({t, s: cam.s, c: cam.c, e});

const KEYS: Key[] = [
  k(27.6, ID),
  k(28.1, ME_NF),
  k(29.2, ME_NF),
  k(29.65, ID),
  k(30.85, ID),
  k(31.35, PLOT_IN),
  k(40.7, PLOT_IN),
  k(41.3, ID),
  k(65.1, ID),
  k(65.6, HAND),
  k(66.3, HAND),
  k(66.75, ID),
  k(131.4, ID),
  k(132.1, PLEA),
  k(133.95, PLEA),
  k(134.5, ID),
  k(144.5, ID),
  k(144.95, PLEA),
  k(146.05, PLEA),
  k(146.45, ID),
  k(146.85, PLEA),
  k(147.6, PLEA),
  k(147.66, ID, ease.linear),
];

export const cameraAt = (t: number): Cam => {
  if (t <= KEYS[0].t || t >= KEYS[KEYS.length - 1].t) return ID;
  let i = 0;
  while (i < KEYS.length - 1 && KEYS[i + 1].t <= t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const p = b.e(Math.max(0, Math.min(1, (t - a.t) / (b.t - a.t))));
  return {s: lerp(a.s, b.s, p), c: [lerp(a.c[0], b.c[0], p), lerp(a.c[1], b.c[1], p)]};
};

// CSS transform for a 1920×1080 layer with transform-origin 0 0.
export const cameraTransform = (t: number) => {
  const {s, c} = cameraAt(t);
  if (s === 1 && c[0] === 960 && c[1] === 540) return undefined;
  return `translate(${(960 - c[0] * s).toFixed(2)}px, ${(540 - c[1] * s).toFixed(2)}px) scale(${s.toFixed(5)})`;
};
