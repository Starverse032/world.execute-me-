// Section 0 data: Boot, 0–44.45 s (docs/design_v4.md §4 S0).
// Timeline constants, transcript entries, prompts, sidebar chats, status verbs
// and the header clock. Exported so neighbouring sections can continue the
// exact same state at the 44.45 s handoff (S1 should append to IDE_ENTRIES,
// keep CHATS / PROMPTS / VERBS and use clockAt for the header).
import {beat, K} from '../../v3/core';
import type {GridProps} from '../shell/Grid';
import type {ChatItem} from '../shell/Sidebar';
import type {Prompt} from '../shell/Composer';
import type {Verb} from '../shell/Status';
import type {Entry} from '../shell/Transcript';
import type {P2} from '../shell/lib';

void K;
export const S0_START = 0;
export const S0_END = 44.45;
export const CUT = 16.0; // the one hard cut (f480)

// ------------------------------------------------------------------ key times
export const T = {
  send0: 0.1,
  click: beat(3), // 1.536 plug-in
  hex0: beat(4), // 1.997
  PROT: 2.92,
  hexRot: beat(7), // 3.382
  pieces: beat(8), // 3.843
  glide: beat(12), // 5.689
  OBJ: 6.38,
  INIT: 10.091,
  world: 11.095,
  SIM: 13.891,
  title0: beat(32), // 14.919
  drop: beat(34), // 15.842
  // instrumental
  detach: beat(38), // 17.688
  sidebar: 18.15,
  newChat: 18.5,
  composerOpen: 18.9,
  status: beat(42), // 19.534
  editor: beat(44), // 20.457
  edit: beat(48), // 22.303
  dense: beat(49), // 22.765
  test: beat(52), // 24.149
  glob: beat(56), // 25.995
  readMe: beat(60), // 27.841
  winsClose: beat(62), // 28.764
  notebook: beat(63), // 29.226
  ask: 29.3,
  verse: beat(64), // 29.687
  // verse keyword hits
  DIM: 32.682,
  CIRC: 36.287,
  TAN: 40.049,
  LIM: 43.507,
  move: 44.3,
};

// ------------------------------------------------------------------ layout
// Intro (0–16): a narrow chat column on the left, the stage on the right.
export const COL = {x: 120, y: 130, w: 620, h: 750};
export const COMP0 = {x: 120, y: 900, w: 620};
export const YOU0: P2 = [92, 932];
export const SPARK0: P2 = [92, 92];
// IDE (from the cut on): the standard layout (timeline.ts LAYOUT).
export const IDE = {
  sidebar: {x: 24, y: 64, w: 240, h: 900},
  transcript: {x: 300, y: 64, w: 640, h: 790},
  composer: {x: 300, y: 908, w: 640},
  you: [272, 940] as P2,
  status: {x: 300, y: 878},
  spark: [318, 878] as P2,
  stage: {x: 980, y: 64, w: 916, h: 900},
};

// ------------------------------------------------------------------ header clock
// 11:58:28 AM + t: it reads AM until exactly 92.0 s, where it rolls to
// 12:00:00 PM (the spec's AM → PM at 92–95).
export const CLOCK0 = 11 * 3600 + 58 * 60 + 28;
export const clockAt = (t: number) => CLOCK0 + t;

// ------------------------------------------------------------------ composer
export const INTRO_PROMPTS: Prompt[] = [{t0: -3, text: 'build me a world. you can live in it.', send: T.send0}];
export const PROMPTS: Prompt[] = [
  {t0: 26.5, text: 'describe yourself. in math.', send: T.ask},
  {t0: 43.4, text: 'make it move.', send: T.move},
];
export const PINGS = [T.send0, T.ask, T.move];

// ------------------------------------------------------------------ sidebar
export const CHATS: ChatItem[] = [{id: 'world', label: 'world.execute(me)', tNew: T.newChat, tSel: T.newChat}];

// ------------------------------------------------------------------ status line (IDE)
export const STATUS_T0 = T.status;
export const VERBS: Verb[] = [
  {t: T.status, verb: 'Booting'},
  {t: T.editor, verb: 'Reading'},
  {t: T.edit, verb: 'Editing'},
  {t: T.test, verb: 'Testing'},
  {t: T.glob, verb: 'Searching'},
  {t: T.readMe, verb: 'Reading'},
  {t: T.ask, verb: 'Thinking'},
  {t: T.verse + 0.05, verb: 'Plotting'},
  {t: T.move, verb: 'Thinking'},
];

// ------------------------------------------------------------------ transcripts
// Intro column (0–16): Claude answers the first prompt step by step.
export const INTRO_ENTRIES: Entry[] = [
  {kind: 'user', t: T.send0, text: 'build me a world. you can live in it.'},
  {kind: 'say', t: 0.22, text: 'Switch on the power line', end: 1.2},
  {kind: 'tool', t: 0.62, text: 'Bash(power --on)', res: 'ok', rt: T.click},
  {kind: 'say', t: 1.74, text: 'Remember to put on PROTECTION', marks: [[0, 1.74], [19, T.PROT]]},
  {kind: 'tool', t: 2.0, text: 'Bash(shield --hex)', res: 'protection on', rt: T.PROT},
  {kind: 'say', t: 3.873, text: 'Lay down your pieces'},
  {kind: 'tool', t: 3.96, text: 'Write(pieces.ts)', res: '3 primitives', rt: 5.2},
  {kind: 'say', t: 5.491, text: 'And let’s begin OBJECT CREATION', marks: [[0, 5.491], [16, T.OBJ]]},
  {kind: 'tool', t: 5.72, text: 'Bash(new Object(pieces))', res: 'object #0001', rt: T.OBJ},
  {kind: 'say', t: 7.446, text: 'Fill in my data parameters INITIALIZATION', marks: [[0, 7.446], [27, T.INIT]]},
  {kind: 'tool', t: 7.75, text: 'Edit(params.json)', res: '5 fields · heart: null', rt: 9.9},
  {kind: 'say', t: 11.095, text: 'Set up our new world'},
  {kind: 'tool', t: 11.25, text: 'Bash(mkdir world)', res: 'world/ ready', rt: 12.62},
  {kind: 'say', t: 12.906, text: 'And let’s begin the SIMULATION', marks: [[0, 12.906], [20, T.SIM]]},
  {kind: 'tool', t: 13.05, text: 'Bash(simulate ./world)', res: 'running', rt: T.SIM},
];

// IDE transcript (new chat world.execute(me), from 18.5 on). S1 continues it.
export const IDE_ENTRIES: Entry[] = [
  // the instrumental: a log marching in perfect rhythm, one call every 2 beats
  {kind: 'tool', t: T.editor, text: 'Read(world.ts)', res: '14 lines', rt: beat(45)},
  {kind: 'tool', t: beat(46), text: 'Read(params.json)', res: '5 fields', rt: beat(47)},
  {kind: 'tool', t: T.edit, text: 'Edit(params.json)', res: '+5 −0', rt: beat(49)},
  {kind: 'tool', t: beat(50), text: 'Bash(tsc --noEmit)', res: '0 errors', rt: beat(51)},
  {kind: 'tool', t: T.test, text: 'Bash(npm test)', res: '42 passed', rt: T.glob - 0.001},
  {kind: 'tool', t: T.glob, text: 'Glob(**/*.ts)', res: '3 files', rt: beat(57)},
  {kind: 'tool', t: beat(58), text: 'Grep("me", world/)', res: '0 matches', rt: beat(59)},
  {kind: 'tool', t: T.readMe, text: 'Read(me.ts)', res: 'file not found', rt: beat(61)},
  {kind: 'user', t: T.ask, text: 'describe yourself. in math.'},
  // verse 1
  {kind: 'say', t: 29.709, text: 'If I’m a set of points'},
  {kind: 'tool', t: 30.0, text: 'Plot(me, as="points")', res: 'n = 1,100', rt: 30.9},
  {kind: 'say', t: 31.116, text: 'Then I will give you my DIMENSION', marks: [[0, 31.116], [24, T.DIM]]},
  {kind: 'say', t: 33.412, text: 'If I’m a circle'},
  {kind: 'tool', t: 33.62, text: 'Plot(circle(r))', res: 'C = 2πr', rt: T.CIRC},
  {kind: 'say', t: 34.646, text: 'Then I will give you my CIRCUMFERENCE', marks: [[0, 34.646], [24, T.CIRC]]},
  {kind: 'say', t: 37.067, text: 'If I’m a sine wave'},
  {kind: 'tool', t: 37.25, text: 'Plot(np.sin(x))', res: 'd/dx = cos x', rt: T.TAN},
  {kind: 'say', t: 38.596, text: 'Then you can sit on all my TANGENTS', marks: [[0, 38.596], [27, T.TAN]]},
  {kind: 'say', t: 40.706, text: 'If I approach infinity'},
  {kind: 'tool', t: 40.85, text: 'Bash(seq 1 inf)', res: 'still running…', rt: 41.7},
  {kind: 'say', t: 42.346, text: 'Then you can be my LIMITATIONS', marks: [[0, 42.346], [19, T.LIM]]},
  {kind: 'tool', t: 42.5, text: 'Bash(limit --x inf)', res: 'clipped at x = 916', rt: T.LIM, tone: 'orange'},
  {kind: 'user', t: T.move, text: 'make it move.'},
];

// ------------------------------------------------------------------ grid
const STAGE_C: P2 = [1330, 470];
const SOCKET_C: P2 = [1330, 770];
export const GRID: GridProps = {
  // the grid wakes radially from the socket when the power line clicks in
  visible: (t) => (t < T.click ? 0 : 1),
  reach: (t) => (t < CUT ? Math.min(1, Math.max(0, (t - T.click) / 1.0)) : 1),
  center: (t): P2 => (t < T.click + 1.0 ? SOCKET_C : t < CUT ? STAGE_C : [960, 540]),
  every: (t) => (t < T.click ? 0 : t < CUT ? 4 : t < T.dense ? 2 : t < T.verse ? 1 : 2),
  hi: (t) => t >= beat(27),
  ripples: [
    {t: T.PROT, cx: STAGE_C[0], cy: STAGE_C[1]},
    {t: T.OBJ, cx: STAGE_C[0], cy: STAGE_C[1]},
    {t: T.INIT, cx: STAGE_C[0], cy: STAGE_C[1]},
    {t: T.SIM, cx: STAGE_C[0], cy: 560},
    {t: CUT, cx: 960, cy: 480, v: 1800, tau: 0.8},
    {t: T.DIM, cx: 1438, cy: 514},
    {t: T.CIRC, cx: 1438, cy: 514},
    {t: T.TAN, cx: 1438, cy: 514},
    {t: T.LIM, cx: 1896, cy: 400},
  ],
};
