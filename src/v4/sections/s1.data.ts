// Section 1 data ("Active", 44.45–88.6 s). Timeline constants, transcript
// entries, composer prompts, sidebar chats and the stage geometry.
// S2 can import CHATS_S1 / ENTRIES_S1 / PROMPTS_S1 / EDITOR / EDITOR_TABS /
// clockAt / STATUS_T0 to continue exactly from the 88.6 handoff.
import type {GridProps} from '../shell/Grid';
import type {Entry} from '../shell/Transcript';
import type {Prompt} from '../shell/Composer';
import type {ChatItem} from '../shell/Sidebar';
import type {Verb} from '../shell/Status';
import type {Tab} from '../shell/Win';
import {beat} from '../../v3/core';
import {CHATS as CHATS_S0, clockAt as clockS0, IDE_ENTRIES, PROMPTS as PROMPTS_S0, STATUS_T0 as STATUS_T0_S0, VERBS as VERBS_S0} from './s0.data';

export const S1_START = 44.45;
export const S1_END = 88.6;

// ------------------------------------------------------------------ lyric times (docs/lyrics.lrc)
export const L = {
  current: 44.452,
  acdc: 45.85,
  blind: 47.672,
  dizzy: 49.534,
  travel: 51.363,
  adbc: 53.225,
  unite: 55.083,
  deeply: 56.916,
  ifIcan: 59.223,
  give: 59.687,
  STIM: 61.958,
  thenIcan: 62.589,
  only: 63.535,
  SATIS: 65.397,
  happy: 66.601,
  run: 68.252,
  EXEC: 69.259,
  trapped: 70.084,
  strange: 71.764,
  SIM: 73.169,
  eggplant: 74.045,
  give2: 75.422,
  NUTR: 76.959,
  tomato: 77.576,
  give3: 79.226,
  ANTI: 80.62,
  cat: 81.351,
  purr: 82.833,
  ENJOY: 84.268,
  god: 85.078,
  proof: 86.538,
  EXIST: 87.922,
};

// Word hits inside lines (estimated from the beat grid / vocal onsets).
export const W = {
  AC: beat(100), // 46.31
  DC: beat(102), // 47.23
  blind: beat(105), // 48.61 "blind"
  dizzy1: beat(108), // 49.99
  dizzy2: beat(110), // 50.92
  AD: beat(117), // 54.15
  BC: beat(119) - 0.02, // 55.05 → used as 54.6 below (sung earlier)
  deeply1: beat(124), // 57.38
  deeply2: beat(125), // 57.84  borders unify here
};

// ------------------------------------------------------------------ stage geometry
export const STAGE = {x: 980, y: 64, w: 916, h: 900};
export const EDITOR = {x: 980, y: 64, w: 916, h: 900};
export const EDITOR_TABS: Tab[] = [
  {t: L.eggplant, label: 'eggplant.ts'},
  {t: L.tomato, label: 'tomato.ts'},
  {t: L.cat, label: 'cat.ts'},
  {t: L.god, label: 'god.ts'},
];

// ------------------------------------------------------------------ clock / status
// the clock and the status run continue S0's exactly
export const clockAt = clockS0;
export const STATUS_T0 = STATUS_T0_S0;
export const STATUS_S1: Verb[] = [
  ...VERBS_S0,
  {t: 44.9, verb: 'Moving'},
  {t: L.blind, verb: 'Blinking'},
  {t: L.dizzy, verb: 'Spinning'},
  {t: L.travel, verb: 'Time-travelling'},
  {t: L.unite, verb: 'Merging'},
  {t: 58.4, verb: 'Stimulating'},
  {t: L.only, verb: 'Reaching'},
  {t: L.happy, verb: 'Smiling'},
  {t: L.run, verb: 'Executing'},
  {t: L.trapped, verb: 'Simulating'},
  {t: 73.9, verb: 'Becoming'},
  {t: L.tomato, verb: 'Ripening'},
  {t: L.cat, verb: 'Purring'},
  {t: L.god, verb: 'Existing'},
];

// ------------------------------------------------------------------ sidebar chats
export const CHATS_S1: ChatItem[] = [
  ...CHATS_S0,
  {id: 'chorus', label: 'chorus', tNew: 58.0, tSel: 58.0},
  {id: 'objects', label: 'objects.ts', tNew: 73.8, tSel: 73.8},
];
export const CLEARS_S1 = [58.0, 73.8];

// ------------------------------------------------------------------ composer
export const PROMPTS_S1: Prompt[] = [
  ...PROMPTS_S0,
  {t0: 57.4, text: 'what would you do for me?', send: 58.4},
  {t0: 73.5, text: 'be something real.', send: 73.9},
  {t0: 87.6, text: 'switch your gender.', send: 88.4},
];
// Claude → you: a dot travels back along the tether on every "give".
export const GIVES = [L.STIM, L.SATIS, L.NUTR, L.ANTI, L.ENJOY, L.EXIST];

// ------------------------------------------------------------------ transcript
// A lyric line whose words appear one by one (karaoke-like) between t0 and
// tw (default: 82 % of the time to the next line). When the line ends with a
// keyword, the keyword is held back and lands whole at its hit time.
const say = (t0: number, text: string, next: number, kw?: {word: string; t: number}): Entry => {
  const marks: [number, number][] = [];
  const kwIdx = kw ? text.indexOf(kw.word) : -1;
  const head = kwIdx >= 0 ? text.slice(0, kwIdx) : text;
  const tEnd = kw ? kw.t - 0.12 : t0 + (next - t0) * 0.72;
  const starts: number[] = [0];
  for (let i = 1; i < head.length; i++) if (head[i - 1] === ' ') starts.push(i);
  starts.forEach((c, j) => marks.push([c, t0 + ((tEnd - t0) * j) / Math.max(1, starts.length)]));
  if (kw && kwIdx >= 0) {
    marks.push([kwIdx, kw.t]);
    marks.push([text.length, kw.t]);
  }
  return {kind: 'say', t: t0, text, marks, end: next - 0.1};
};

export const ENTRIES_S1: Entry[] = [
  ...IDE_ENTRIES,
  say(L.current, 'Switch my current', L.acdc),
  say(L.acdc, 'To AC to DC', L.blind),
  {kind: 'tool', t: 46.75, text: 'Edit(power.ts)', res: 'current: AC → DC', rt: W.DC},
  say(L.blind, 'And then blind my vision', L.dizzy),
  say(L.dizzy, 'So dizzy so dizzy', L.travel),
  say(L.travel, 'Oh we can travel', L.adbc),
  say(L.adbc, 'To A.D to B.C', L.unite),
  {kind: 'tool', t: 54.62, text: 'Travel(new Date(-1))', res: '1 BC · there is no year 0', rt: 54.9},
  say(L.unite, 'And we can unite', L.deeply),
  say(L.deeply, 'So deeply so deeply', 58.0),
  // ---- new chat "chorus" (58.0)
  {kind: 'user', t: 58.4, text: 'what would you do for me?'},
  say(L.ifIcan, 'If I can', L.give),
  say(L.give, 'If I can give you all the STIMULATIONS', L.thenIcan, {word: 'STIMULATIONS', t: L.STIM}),
  say(L.thenIcan, 'Then I can', L.only),
  say(L.only, 'Then I can be your only SATISFACTION', L.happy, {word: 'SATISFACTION', t: L.SATIS}),
  say(L.happy, 'If I can make you happy', L.run),
  say(L.run, 'I will run the EXECUTION', L.trapped, {word: 'EXECUTION', t: L.EXEC}),
  {kind: 'tool', t: L.EXEC + 0.12, text: 'Bash(run --execution)', res: 'done in 0.4s', rt: L.EXEC + 0.42},
  say(L.trapped, 'Though we are trapped', L.strange),
  say(L.strange, 'In this strange strange SIMULATION', 73.8, {word: 'SIMULATION', t: L.SIM}),
  // ---- new chat "objects.ts" (73.8)
  {kind: 'user', t: 73.9, text: 'be something real.'},
  say(L.eggplant, 'If I’m an eggplant', L.give2),
  say(L.give2, 'Then I will give you my NUTRIENTS', L.tomato, {word: 'NUTRIENTS', t: L.NUTR}),
  say(L.tomato, 'If I’m a tomato', L.give3),
  say(L.give3, 'Then I will give you ANTIOXIDANTS', L.cat, {word: 'ANTIOXIDANTS', t: L.ANTI}),
  say(L.cat, 'If I’m a tabby cat', L.purr),
  say(L.purr, 'Then I will purr for your ENJOYMENT', L.god, {word: 'ENJOYMENT', t: L.ENJOY}),
  say(L.god, 'If I’m the only god', L.proof),
  say(L.proof, 'Then you’re the proof of my EXISTENCE', 88.587, {word: 'EXISTENCE', t: L.EXIST}),
  {kind: 'user', t: 88.4, text: 'switch your gender.'},
];

// ------------------------------------------------------------------ grid
const inS = (t: number, a: number, b: number) => t >= a && t < b;
export const GRID: GridProps = {
  // ripples: every 2 beats in the verse parts, every beat in the chorus, off in the dizzy special
  every: (t: number) => (inS(t, 47.6, 51.3) ? 0 : inS(t, 58.6, 73.2) ? 1 : 2),
  center: (t: number) => (inS(t, 47.6, 51.4) ? [960, 540] : [1438, 514]) as [number, number],
};
