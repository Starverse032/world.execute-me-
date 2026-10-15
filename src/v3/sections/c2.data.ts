// Section C2 timeline data (logs, status verbs, persistent-UI states, line patches).
// 177.246–211.96 s, shots C14–C22. Spec: docs/design_full.md C.0 (rows from 177.24 on),
// which supersedes docs/design_C.md.
import type {SectionData, UiSeg} from '../tl';
import {snap} from '../tl';

// Lyric layout throughout: composer, log at (240, 772), status at (264, 852).
const L = (from: number, extra: Partial<UiSeg> = {}): UiSeg => ({
  from,
  composer: true,
  log: {x: 240, y: 772},
  status: 'lyric',
  hud: 'light',
  grid: 'hi',
  ...extra,
});
const RC = (cx: number, cy: number, every: number) => ({cx, cy, every});

export const DATA: SectionData = {
  logs: [
    {t: 177.3, call: 'Read(love.md)', rt: 179.929, res: 'Read 1,210 lines'},
    {t: 180.9, call: 'Search(pattern: "love")', rt: 181.901, res: 'Found 2 functions'},
    {t: 182.1, call: 'Plot(x(t), y(t), 0..2π)', rt: 183.5, res: 'ok'},
    // assistant text (cream bullet, no ⎿ line)
    {t: snap(183.646), call: 'Every question reduces to two equations.', rt: snap(183.646), res: ''},
    {t: 184.6, call: 'Plot(heart, t: 0..2π)', rt: 187.665, res: 'closed curve · 1 region'},
    {t: 193.981, call: 'Bash(unrender me)', rt: 194.905, res: 'merged 1,210 points'},
    {t: 195.827, call: 'Edit(params.json)', rt: 196.75, res: '6 fields unset'},
    {t: 197.7, call: 'Write(pieces.ts)', rt: 199.981, res: 'Removed 6 primitives'},
    {t: 200.442, call: 'Bash(rmdir world)', rt: 201.365, res: 'world/ removed'},
    {t: 203.211, call: 'Bash(sandbox --disable)', rt: 203.673, res: 'protection off'},
    {t: snap(205.811), call: 'world.execute(me)', rt: 207.08, res: 'exit 0'},
  ],
  status: [
    {t: 177.246, verb: 'Pondering'},
    {t: 180.857, verb: 'Musing'},
    {t: 184.54, verb: 'Manifesting'},
    {t: 188.483, verb: 'Lingering'},
    {t: 191.4, verb: 'Unwinding'},
    {t: snap(205.811), verb: 'Executing'},
    {t: 207.55, verb: 'Worked for 3m 31s'},
  ],
  ui: [
    L(177.246, {ripple: RC(1240, 390, 2)}), // C14–C16: HUD light, grid back to gridHi
    L(188.3, {log: null, ripple: RC(1240, 430, 2)}), // C17–C18: log zone hidden (emotional beat)
    L(193.975, {ripple: RC(960, 390, 2)}), // C19: log returns (fades in), ripples from C
    L(200.44, {ripple: null, grid: 'retract'}), // C20: grid retracts into C (R = 1300 − 1400·(t − 200.44))
    L(201.365, {ripple: null, grid: 'off', hud: 'full'}), // C21: the seed, beat counter back
    L(207.08, {ripple: null, grid: 'off', hud: 'light'}), // audio stops: beat counter off
  ],
  // one-off ripple from the (still empty) heart area on the C15 hit (f5509)
  ripples: [{t: snap(183.646), cx: 1240, cy: 390}],
  paths: [
    {t: 187.665, path: '~/world/heart'},
    {t: 193.981, path: '~/world'},
    {t: 201.365, path: '~'},
  ],
  patches: {
    '177.246': {kwX: 560, kwY: 390, kwSize: 160},
    '180.857': {kwX: 1240, kwY: 390, kwSize: 170},
    '184.54': {kwX: 560, kwY: 390, kwSize: 160},
    '190.801': {kwX: 560, kwY: 390, kwSize: 160},
    '205.811': {out: 207.08, kwOut: 206.88, kwKnockout: false},
  },
};
