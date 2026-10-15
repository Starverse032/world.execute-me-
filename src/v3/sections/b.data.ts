// Section B timeline data (logs, status verbs, persistent-UI states, line patches).
// Spec: docs/design_B.md B.0.3–B.0.6. Lines come from the LRC automatically.
import type {SectionData, UiSeg} from '../tl';
import {snap} from '../tl';
import {SHARDS} from './B_shards';

const N = SHARDS.length; // shard count (the design assumed 36)

// Persistent UI: lyric layout throughout (composer, log at 240/772, status at 264/852).
const L = (from: number, extra: Partial<UiSeg> = {}): UiSeg => ({
  from,
  composer: true,
  log: {x: 240, y: 772},
  status: 'lyric',
  hud: 'full',
  ripple: {cx: 960, cy: 390, every: 2},
  ...extra,
});
const RC = (every: number, half = false, cx = 960, cy = 390) => ({cx, cy, every, half});
const SPARK = {x: 1280, y: 390}; // moment 6 "god" spark (mirrored layout, see B.tsx)
const LIGHT = {logO: 0.7, logPrev: false, statusO: 0.45};

export const DATA: SectionData = {
  logs: [
    {t: 88.65, call: 'Edit(me.ts)', rt: 91.997, res: 'Updated me.ts with 1 addition and 1 removal'},
    {t: 92.06, call: 'Write(crontab)', rt: 95.228, res: '0 0-12 * * * whatever'},
    {t: 95.5, call: 'Bash(git mv roles/S roles/M)', rt: 98.92, res: 'renamed: roles/S to roles/M'},
    {t: 99.4, call: 'Bash(watch -n 0.4615 trance)', rt: 101.689, res: 'Every 0.4615s: trance'},
    {t: 103.55, call: 'Bash(listen --to you)', rt: 106.3, res: '6 modes · in tune'},
    {t: 107.25, call: 'TodoWrite(6 items)', rt: 110.2333, res: '6/6 completed'},
    {
      // one entry that re-runs on every "You have left" (never pushes)
      t: 110.95,
      call: 'Search(pattern: "you")',
      rt: 111.4,
      res: 'Found 5 matches',
      runs: [
        {t: 112.22, rt: snap(112.72), res: 'Found 4 matches'},
        {t: 113.1, rt: snap(113.6), res: 'Found 3 matches'},
        {t: 114.18, rt: snap(114.68), res: 'Found 2 matches'},
        {t: 114.92, rt: snap(115.42), res: 'Found 1 match'},
        {t: 115.78, rt: snap(117.2667), res: 'Found 0 matches'},
      ],
    },
    {t: 118.4, call: 'Glob(**/*.fragment)', rt: 118.766, res: `${N} files`},
    {t: 119.0, call: 'Edit(me.ts)', rt: 120.8667, res: `Updated me.ts with 0 additions and ${N} removals`},
    {t: 121.78, call: 'Draw(heart, r = 85)', rt: 122.92, res: 'ok'},
    {t: 123.0, call: 'Bash(git merge you)', rt: 124.9, res: 'CONFLICT (content): merge conflict in heart'},
    {t: 125.75, call: 'Bash(sudo kill -9 1)', rt: 126.613, res: 'me is not in the sudoers file. This incident will be reported.'},
    // resolves on Section C's ILLEGAL ARGUMENTS hit (f3937); running through the hand-over
    {t: 128.7, call: 'world.execute(me, god)', rt: 131.2333, res: 'IllegalArgumentException: god'},
  ],
  status: [
    {t: 88.587, verb: 'Switching'},
    {t: 92.015, verb: 'Scheduling'},
    {t: 95.465, verb: 'Swapping'},
    {t: 99.349, verb: 'Entrancing'},
    {t: 103.489, verb: 'Resonating'},
    {t: 107.22, verb: 'Completing'},
    {t: 110.9, verb: 'Searching'},
    {t: 115.78, verb: 'Waiting'},
    {t: 118.333, verb: 'Erasing'},
    {t: 121.728, verb: 'Mending'},
    {t: 125.708, verb: 'Challenging'},
    {t: 128.661, verb: 'Validating'},
  ],
  // Ripple windows (B.0.5). A segment's `from` must sit at or before the nominal
  // beat it should include (rippleAt looks the segment up at the beat time).
  ui: [
    L(88.6, {ripple: RC(2)}), // b192–b214, even beats from C
    L(99.8, {ripple: RC(1)}), // b216–b224, every beat
    L(105.37, {ripple: RC(1, true)}), // + off-beat eighths 105.61, 106.07 (into VIBRATIONS)
    L(106.31, {ripple: RC(1)}),
    L(109.06, {ripple: RC(1, true)}), // + off-beat eighths 109.31, 109.77, 110.23 (into COMPLETION)
    L(110.3, {ripple: RC(1)}),
    L(110.9, {ripple: RC(4), statusO: 0.45}), // downbeats b240–b252; status at 45 %
    L(110.92, {ripple: RC(4), ...LIGHT}), // log at 70 %, previous entry hidden
    L(117.2, {ripple: null, ...LIGHT}), // ISOLATION slow ripple only (one-off), then b256 one-off
    L(118.305, {ripple: null}), // HUD back to full
    L(118.5, {ripple: RC(2)}), // b258–b270, even beats from C
    L(124.8, {ripple: null}), // DISHEARTENED one-off, then silence to b272
    L(125.68, {ripple: RC(2, false, SPARK.x, SPARK.y)}), // b272–b278 from the spark
    L(128.9, {ripple: RC(1, false, SPARK.x, SPARK.y)}), // b279–b282 every beat
    L(129.4, {ripple: RC(1, true, SPARK.x, SPARK.y)}), // + off-beats 129.613, 130.074
    L(130.2, {ripple: RC(1, false, SPARK.x, SPARK.y)}),
    L(130.4, {ripple: null}), // silence before the hit
  ],
  ripples: [
    // ISOLATION: one slow ripple from her centre (R = 900·Δt, decay τ 1.0, standard 90 px ring)
    {t: 117.2667, cx: 1640, cy: 480, v: 900, tau: 1.0},
    // b256: one normal ripple from her centre as she shatters
    {t: 0.151 + (60 / 130) * 256, cx: 1640, cy: 480},
    // DISHEARTENED: one ripple from the heart
    {t: 124.9, cx: 960, cy: 410},
  ],
};
