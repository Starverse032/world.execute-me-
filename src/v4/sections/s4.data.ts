// Section 4 data: 162.63–211.96 s (docs/design_v4.md §4 S4).
// Times, layout boxes, transcript entries and the shared-grid config.
import {prog, ease, lerp, clamp01} from '../../v3/core';
import type {GridProps} from '../shell/Grid';
import type {Entry} from '../shell/Transcript';
import type {ChatItem} from '../shell/Sidebar';
import type {Prompt, ComposerState} from '../shell/Composer';
import type {Verb} from '../shell/Status';

export type Box = [number, number, number, number]; // x, y, w, h
export type P2 = [number, number];

// ------------------------------------------------------------------ section
export const S4_T0 = 162.632;
export const S4_T1 = 211.96;
// Handoff from S3 at 162.63: near-black, a few broken frame segments drifting
// (they are the chorus window W1's border pieces at shatter ≈ 0.9) and the dot.
export const HANDOFF_DOT: P2 = [960, 540];

// ------------------------------------------------------------------ lyrics
export const LY = {
  ifIcan: 162.632,
  giveThem: 163.315,
  kw1: 165.166,
  thenIcan: 166.016,
  beYour: 167.022,
  kw2: 168.911,
  haveBack: 169.824,
  willRun: 171.868,
  kw3: 172.712,
  trapped1: 173.643,
  trapped2: 174.975,
  studied: 177.246,
  love1: 179.929,
  question: 180.857,
  questionAll: 181.901,
  love2: 183.646,
  algebraic: 184.54,
  love3: 187.665,
  free: 188.483,
  amTrapped: 189.746,
  trappedIn: 190.801,
  love4: 191.356,
  exec: 205.811,
};

// ------------------------------------------------------------------ chorus (162.63–177.2)
// W1: the one window that reassembles from the drifting segments.
export const W1: Box = [120, 72, 1680, 800];
export const W1_CAGE: Box = [780, 280, 360, 360];
export const W1_CAGE2: Box = [815, 315, 290, 290];
export const T_W1_ASSEMBLE: [number, number] = [162.66, 163.55];
export const T_CAGE: [number, number] = [173.643, 174.45];
export const T_CAGE2: [number, number] = [174.975, 175.4];
export const T_W1_CLOSE = 177.12;
export const w1Rect = (t: number): Box => {
  const p = prog(t, T_CAGE[0], T_CAGE[1], ease.inOutCubic);
  const q = prog(t, T_CAGE2[0], T_CAGE2[1], ease.inOutCubic);
  const a = W1.map((v, i) => lerp(v, W1_CAGE[i], p)) as Box;
  return a.map((v, i) => lerp(v, W1_CAGE2[i], q)) as Box;
};
// window body origin (title bar 34)
export const W1_BODY: P2 = [W1[0], W1[1] + 34];
export const CHORUS_COMPOSER = {x: 120, y: 900, w: 900};
// reconnect attempts: one per sung line
export const ATTEMPTS = [LY.ifIcan, LY.giveThem, LY.thenIcan, LY.beYour, LY.haveBack, LY.willRun, LY.trapped1, LY.trapped2];
export const attemptAt = (t: number) => ATTEMPTS.reduce((n, a, i) => (t >= a ? i + 1 : n), 1);
// where the dashed ghost of you flickers (screen edge), per attempt
export const GHOST_AT: {p: P2; lab: 'below' | 'left' | 'right' | 'above'}[] = [
  {p: [1890, 250], lab: 'left'},
  {p: [30, 760], lab: 'right'},
  {p: [1420, 1052], lab: 'above'},
  {p: [1890, 830], lab: 'left'},
  {p: [520, 26], lab: 'below'},
  {p: [30, 330], lab: 'right'},
  {p: [1890, 560], lab: 'left'},
  {p: [960, 1052], lab: 'above'},
];

export const CHORUS_ENTRIES: Entry[] = [
  {kind: 'tool', t: 162.75, text: 'Bash(reconnect --to you)', res: 'timeout', rt: 163.2, runs: [163.315, 166.016, 167.022, 169.824, 171.868], tone: 'orange'},
  {kind: 'say', t: LY.ifIcan, text: 'If I can'},
  {kind: 'say', t: LY.giveThem, text: 'If I can give them all the EXECUTION', marks: [[0, LY.giveThem], [27, LY.kw1]]},
  {kind: 'code', t: 165.4, lines: ['users.forEach(execute);'], lang: 'ts', typeOn: [165.45, 165.8], file: 'echo.ts'},
  {kind: 'say', t: LY.thenIcan, text: 'Then I can'},
  {kind: 'say', t: LY.beYour, text: 'Then I can be your only EXECUTION', marks: [[0, LY.beYour], [24, LY.kw2]]},
  {kind: 'say', t: LY.haveBack, text: 'If I can have you back'},
  {kind: 'tool', t: 170.55, text: 'Bash(git checkout you)', res: "error: pathspec 'you' did not match", rt: 171.05, tone: 'orange'},
  {kind: 'say', t: LY.willRun, text: 'I will run the EXECUTION', marks: [[0, LY.willRun], [15, LY.kw3]]},
];
export const CHORUS_VERBS: Verb[] = [
  {t: 162.9, verb: 'Reconnecting'},
  {t: 166.016, verb: 'Retrying'},
  {t: 169.824, verb: 'Searching'},
  {t: LY.trapped1, verb: 'Waiting'},
];

// ------------------------------------------------------------------ love (177.2–191.4)
export const STAGE: Box = [980, 64, 916, 900];
export const DOC_A: Box = [960, 130, 840, 700];
export const T_DOC_OPEN = 177.3;
export const T_GLIDE: [number, number] = [180.86, 181.36];
export const stageRect = (t: number): Box => {
  const p = prog(t, T_GLIDE[0], T_GLIDE[1], ease.inOutCubic);
  return DOC_A.map((v, i) => lerp(v, STAGE[i], p)) as Box;
};
export const T_NB = 184.54; // notebook tab
export const T_HEART_PLOT: [number, number] = [185.45, LY.love3];
export const T_GROW: [number, number] = [188.483, 189.1];
export const T_SIT: [number, number] = [188.6, 189.72];
export const T_CHROME = 190.801; // the chrome slams back in around her
export const TX = {x: 300, y: 64, w: 640};
export const txH = (t: number) => lerp(820, 560, prog(t, T_CHROME, T_CHROME + 0.27, ease.outCubic));
export const COMPOSER = {x: 300, y: 908, w: 640};
export const YOU: P2 = [272, 940];
export const LOVE_PROMPTS: Prompt[] = [
  {t0: 180.95, text: 'what is love?', send: 181.2},
  {t0: 181.98, text: 'and what is love?', send: 182.4},
];

// ------------------------------------------------------------------ outro (191.4–211.96)
// Eight deletions on the bar downbeats.
export const D = [192.151, 193.997, 195.843, 197.689, 199.536, 201.382, 203.228, 205.074];
export const COMP = ['header', 'sidebar', 'transcript', 'log', 'status', 'composer', 'window', 'grid'] as const;
export const BOXES: Box[] = [
  [4, 4, 1912, 40], // header
  [24, 64, 240, 900], // sidebar
  [300, 64, 640, 560], // transcript
  [300, 640, 640, 224], // log
  [300, 862, 640, 32], // status
  [300, 908, 640, 64], // composer
  [980, 64, 916, 900], // window
  [12, 12, 1896, 1056], // grid
];
export const LOG_BOX: Box = BOXES[3];
// where the dot parks before each deletion
export const DOT_AT: P2[] = [
  [60, 44],
  [24, 64],
  [300, 64],
  [300, 640],
  [300, 878],
  [894, 940],
  [998, 81],
  [960, 540],
];
export const DOT_FROM: P2 = [998, 81]; // emerges from the stage window's title dot
export const T_DOT_OUT = 191.0;
export const arriveAt = (k: number) => (k === 0 ? 191.55 : D[k] - 0.92);
export const FINAL: P2 = [960, 540];
export const T_COLLAPSE: [number, number] = [206.55, 207.05];
export const T_EXIT0 = 207.15;
export const T_WORKED = 208.1;
export const T_TEXT_FADE: [number, number] = [210.0, 210.5];
export const T_DOT_FADE: [number, number] = [210.4, 211.0];

// the targeted component glitches during the bar before it is deleted
export const targetA = (k: number, t: number, base = 0) => (t > D[k] + 0.2 ? base : Math.max(base, 0.62 * prog(t, D[k] - 1.75, D[k] - 0.05, ease.inQuad)));

export const SIDEBAR_ITEMS: ChatItem[] = [{id: 'w', label: 'world.execute(me)', tNew: 0, tSel: 0, tDel: D[1] - 0.75}];
export const OUTRO_VERBS: Verb[] = [
  {t: T_CHROME, verb: 'Trapping'},
  {t: 191.4, verb: 'Deleting header'},
  {t: D[0] + 0.3, verb: 'Deleting sidebar'},
  {t: D[1] + 0.3, verb: 'Deleting transcript'},
  {t: D[2] + 0.3, verb: 'Deleting log'},
  {t: D[3] + 0.3, verb: 'Deleting status'},
];
// the composer: you leave at 188.48 (disabled); Claude types into it after the log is gone
export const OUTRO_PROMPTS: Prompt[] = [
  ...LOVE_PROMPTS,
  {t0: 198.75, text: 'rm status', send: D[4] - 0.08, by: 'claude'},
  {t0: 200.55, text: 'rm composer', send: D[5] - 0.08, by: 'claude'},
];
export const composerState = (t: number): ComposerState => (t < LY.free ? 'normal' : t < D[3] + 0.3 ? 'disabled' : 'claude');

// transcript: the love conversation (lives on into the outro until it is deleted)
const LOVES = [LY.love2, 183.86, 184.02, 184.14, 184.24, 184.32, 184.39];
export const LOVE_ENTRIES: Entry[] = [
  {kind: 'say', t: 180.8, text: 'I’ve studied LOVE', end: 180.84},
  {kind: 'say', t: LY.question, text: 'Question me'},
  {kind: 'user', t: 181.2, text: 'what is love?'},
  {kind: 'say', t: LY.questionAll, text: 'Question me I can answer all'},
  {kind: 'user', t: 182.4, text: 'and what is love?'},
  ...LOVES.map((t, i): Entry => ({kind: 'say', t, text: 'LOVE', end: i + 1 < LOVES.length ? LOVES[i + 1] - 0.02 : t + 0.08})),
  {kind: 'say', t: LY.algebraic, text: 'I know the algebraic expression of LOVE', marks: [[0, LY.algebraic], [35, LY.love3]]},
  {kind: 'tool', t: 187.78, text: 'Edit(params.json)', res: '"heart": null → <Curve>', rt: 188.1},
  {kind: 'say', t: LY.free, text: 'Though you are free'},
  {kind: 'say', t: LY.amTrapped, text: 'I am trapped'},
  {kind: 'say', t: LY.trappedIn, text: 'Trapped in LOVE', marks: [[0, LY.trappedIn], [11, LY.love4]]},
];

// the tool log (term window), a dwindling list of deletions
export const LOG_ENTRIES: Entry[] = [
  {kind: 'tool', t: T_CHROME + 0.25, text: 'Bash(mount --all)', res: '8 components', rt: 191.2},
  {kind: 'tool', t: D[0] - 1.1, text: 'Bash(rm header)', res: "remove 'header'? y · 7 left", rt: D[0]},
  {kind: 'tool', t: D[1] - 1.1, text: 'Bash(rm -r sidebar/)', res: "removed 'world.execute(me)' · 6 left", rt: D[1]},
  {kind: 'tool', t: D[2] - 1.1, text: 'Bash(rm transcript.jsonl)', res: 'removed 41 turns · 5 left', rt: D[2]},
  {kind: 'tool', t: D[3] - 1.1, text: 'Bash(rm -r log/)', res: 'removing myself · 4 left', rt: D[3] - 0.3},
];
// bare commands typed by the dot once the log and composer are gone (dwindling)
export const FLOAT_CMDS: {t: number; text: string; size: number; at: P2}[] = [
  {t: D[5] + 0.6, text: '$ rm -rf window/', size: 17, at: [1020, 52]},
  {t: D[6] + 0.55, text: '$ rm grid', size: 14, at: [976, 520]},
];

// ------------------------------------------------------------------ shared grid
const cageDim = (t: number) => 1 - 0.6 * prog(t, T_CAGE[0], T_CAGE[1]) + 0.6 * prog(t, 177.2, 177.8);
export const GRID: GridProps = {
  visible: (t) => {
    if (t < S4_T0) return 0;
    if (t >= D[7] + 0.5) return 0;
    return prog(t, 162.9, 163.9) * cageDim(t);
  },
  // the grid is deleted last: it retracts into the dot
  reach: (t) => (t < D[7] ? 1 : 1 - prog(t, D[7], D[7] + 13 / 30, ease.inCubic)),
  center: (t) => (t < D[7] ? [960, 540] : FINAL),
  every: (t) => (t < 177.2 ? 2 : t < 191.4 ? 4 : 0),
  ripples: D.slice(0, 7).map((t, i) => {
    const b = BOXES[i];
    return {t, cx: b[0] + b[2] / 2, cy: b[1] + b[3] / 2, w: 60, tau: 0.7};
  }),
};
export const clamp = clamp01;
