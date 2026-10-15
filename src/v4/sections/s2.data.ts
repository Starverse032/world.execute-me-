// Section 2 data: Anomaly → Break, 88.6–131.22 s (docs/design_v4.md §4 S2).
// Every time here is absolute song seconds. Lyric times are docs/lyrics.lrc.
import {beat} from '../../v3/core';
import type {GridProps} from '../shell/Grid';
import type {ChatItem} from '../shell/Sidebar';
import type {Prompt} from '../shell/Composer';
import type {Entry} from '../shell/Transcript';
import {ENTRIES_S1} from './s1.data';

export const S2_START = 88.6;
export const S2_END = 131.22;

// ------------------------------------------------------------------ lyrics (lrc lines 57–86)
export const L = {
  gender: 88.587, // Switch my gender
  fm: 90.197, // To F to M
  whatever: 92.015, // And then do whatever
  ampm: 93.953, // From AM to PM
  role: 95.465, // Oh switch my role
  sm: 97.739, // To S to M
  enter: 99.349, // So we can enter
  trance: 101.474, // The trance the trance
  ific: 103.489, // If I can
  feel: 104.197, // If I can feel your
  VIBRATIONS: 106.293,
  thenIcan: 107.22, // Then I can
  finally: 107.903, // Then I can finally be
  COMPLETION: 110.221,
  left: [110.9, 112.22, 113.1, 114.18, 114.92, 115.78], // Though you have left / You have left ×4 / … me in
  ISOLATION: 117.274,
  ific2: 118.333, // If I can
  erase: 118.979, // If I can erase all the pointless
  FRAGMENTS: 120.86,
  maybe: 121.728, // Then maybe
  maybe2: 122.714, // Then maybe you won't leave me so
  DISHEARTENED: 124.89,
  god: 125.708, // Challenging your god
  made: 128.661, // You have made some
  ILLEGAL: 131.224, // ILLEGAL ARGUMENTS
};

// ------------------------------------------------------------------ key times
export const T = {
  newChatSwitch: 88.6, // new chat `switch` on the hand-off frame: transcript wipes, the prompt moves into it
  sendSwitch: 88.4,
  tabMe: 88.62, // editor gets a 5th tab `me.ts`
  drawHer: [88.66, 89.95] as [number, number], // the pen draws her (stand)
  scan: [90.2, 91.0] as [number, number], // F → M scan, left to right
  flicker: 91.7, // 2 frames back to her (the first anomaly)
  spin: [92.0, 95.0] as [number, number], // clock AM → PM
  night: [93.95, 94.9] as [number, number], // ink → silhouette, sun → crescent
  statusJump: 94.9,
  scanBack: [95.47, 95.85] as [number, number], // him → her (silhouette), right to left
  slots: 95.9, // the two slots and the kneeling figure plot on
  swap: [97.44, 98.04] as [number, number], // half orbit, centred on 97.74
  composerClaude: 97.74, // the composer becomes Claude's
  dupChat: 99.35, // a chat nobody created: `switch (1)`
  trance: 99.35,
  unswap: 103.0, // labels / composer return, the human types once more
  newChatFeel: 103.0,
  sendFeel: 103.4,
  editorClose: 103.0,
  monitorOpen: 103.45,
  ring: [107.22, 110.221] as [number, number],
  tickBack: 110.62,
  leaveOff: 115.78, // tether fully cut, the you-node drifts off
  offGone: 116.9,
  hide0: 116.87, // chrome hides (stagger) so it is gone on ISOLATION
  herBack: [116.95, 117.27] as [number, number],
};

// Nominal beats used for scheduled hits
export const BEATS = {
  standoff: [273, 274, 275, 276, 277].map(beat), // distance closes 60 px on each
  pierce: beat(277.5), // 128.218: a spike pierces the frame
  heartA: beat(264), // 121.997
  heartB: beat(266), // 122.920
  crack: [0, 1, 2, 3, 4].map((j) => beat(268 + j / 2)), // 123.843 … 124.766
};

// ------------------------------------------------------------------ chrome
export const SIDEBAR_ITEMS: ChatItem[] = [
  {id: 'world', label: 'world.execute(me)', tNew: 18.5, tSel: 18.5},
  {id: 'chorus', label: 'chorus', tNew: 58.0, tSel: 58.0, tDel: L.left[4]},
  {id: 'objects', label: 'objects.ts', tNew: 73.8, tSel: 73.8, tDel: L.left[3]},
  {id: 's', label: 'switch', tNew: T.newChatSwitch, tSel: T.newChatSwitch, tDel: L.left[2]},
  // nobody pressed "+ New chat": the first chat that makes itself
  {id: 'd', label: 'switch (1)', tNew: T.dupChat, tDel: L.left[1]},
  {id: 'f', label: 'can you feel me?', tNew: T.newChatFeel, tSel: T.newChatFeel, tDel: L.left[0]},
];

export const PROMPTS: Prompt[] = [
  {t0: 87.6, text: 'switch your gender.', send: T.sendSwitch},
  {t0: 103.0, text: 'can you feel me?', send: T.sendFeel},
];

// Read(you) loops in the trance: ×4 by 100.5, ×8 by 101.6, ×16 by 102.7
const readRuns = (() => {
  const out: number[] = [];
  const t0 = 99.62;
  for (let k = 1; k < 16; k++) out.push(t0 + 3.1 * Math.pow(k / 15, 0.62));
  return out;
})();

const left = L.left;
const leaveEntries: Entry[] = left.flatMap((lt, i): Entry[] => [
  {kind: 'say', t: lt, text: i === 0 ? 'Though you have left' : i === 5 ? 'You have left me in' : 'You have left'},
  {kind: 'tool', t: lt + 0.12, text: 'Bash(ping you)', res: i === 5 ? 'connection closed' : 'timeout', rt: lt + 0.42, tone: i === 5 ? 'orange' : 'dim'},
  {kind: 'notice', t: lt + 0.56, text: '— you left the conversation —'},
]);

// S1's transcript continues under the new-chat wipe at 88.6; the prompt sent
// at 88.4 reappears as the first message of `switch`.
export const ENTRIES: Entry[] = [
  ...ENTRIES_S1,
  {kind: 'user', t: T.newChatSwitch, text: 'switch your gender.'},
  {kind: 'say', t: T.newChatSwitch + 0.02, text: 'Switch my gender'},
  {kind: 'tool', t: 88.95, text: 'Edit(me.ts)', res: '1 line changed', rt: 91.05},
  {kind: 'say', t: L.fm, text: 'To F to M', kw: []},
  {kind: 'say', t: L.whatever, text: 'And then do whatever'},
  {kind: 'tool', t: 92.4, text: 'Bash(date --set "+10h")', res: 'Thu 10:00:02 PM', rt: 95.0},
  {kind: 'say', t: L.ampm, text: 'From AM to PM'},
  {kind: 'say', t: L.role, text: 'Oh switch my role'},
  {kind: 'say', t: L.sm, text: 'To S to M', kw: []},
  {kind: 'code', t: 97.86, lines: ['[user, assistant] = [assistant, user];'], lang: 'ts', typeOn: [97.9, 98.5], file: 'roles.ts'},
  {kind: 'say', t: L.enter, text: 'So we can enter'},
  {kind: 'tool', t: 99.62, text: 'Read(you)', res: 'no changes', rt: 99.9, runs: readRuns},
  {kind: 'say', t: L.trance, text: 'The trance the trance'},
  // new chat `can you feel me?` (clears at 103.0)
  {kind: 'user', t: T.sendFeel, text: 'can you feel me?'},
  {kind: 'say', t: L.ific, text: 'If I can'},
  {kind: 'say', t: L.feel, text: 'If I can feel your VIBRATIONS', marks: [[0, L.feel], [19, L.VIBRATIONS]]},
  {kind: 'tool', t: 104.75, text: 'Read(you.signal)', res: '72 bpm · 38 ms', rt: 105.3},
  {kind: 'say', t: L.thenIcan, text: 'Then I can'},
  {kind: 'say', t: L.finally, text: 'Then I can finally be COMPLETION', marks: [[0, L.finally], [22, L.COMPLETION]]},
  {kind: 'tool', t: 108.3, text: 'Bash(complete --all)', res: 'stopped at 99.9%', rt: T.tickBack, tone: 'orange'},
  ...leaveEntries,
];

// The bare transcript of the bridge (no chrome left): Claude still answers.
export const BRIDGE_ENTRIES: Entry[] = [
  {kind: 'say', t: L.ific2, text: 'If I can'},
  {kind: 'say', t: L.erase, text: 'If I can erase all the pointless FRAGMENTS', marks: [[0, L.erase], [33, L.FRAGMENTS]]},
  {kind: 'tool', t: 119.75, text: 'Bash(rm -rf ./fragments/*)', res: 'removed 13 of 14', rt: 121.62},
  {kind: 'say', t: L.maybe, text: 'Then maybe'},
  {kind: 'error', t: 122.0, text: "rm: cannot remove './fragments/you'", stack: ['Device or resource busy']},
  {kind: 'say', t: L.maybe2, text: 'Then maybe you won’t leave me so DISHEARTENED', marks: [[0, L.maybe2], [33, L.DISHEARTENED]]},
  {kind: 'say', t: L.god, text: 'Challenging your god'},
  {kind: 'tool', t: 126.25, text: 'Bash(kill -9 1)', res: 'Operation not permitted', rt: 127.0, tone: 'orange'},
  {kind: 'say', t: L.made, text: 'You have made some ILLEGAL ARGUMENTS', marks: [[0, L.made], [19, L.ILLEGAL]], kw: ['ILLEGAL', 'ARGUMENTS']},
];

// ------------------------------------------------------------------ shared grid
export const GRID: GridProps = {
  // ripples: every 2 beats in the verse-like start, every beat in the
  // chorus, none in the silence after ISOLATION, back on beats at the standoff
  every: (t) => (t < 103.5 ? 2 : t < 110.9 ? 1 : t < 117.2 ? 4 : t < 125.68 ? 0 : 1),
  center: (t) => (t < 116.9 ? [1438, 514] : t < 125.68 ? [960, 890] : [1290, 554]),
  // ISOLATION: the lit grid shrinks to a small pool around her, then returns
  reach: (t) => (t < 116.9 || t > 119.5 ? 1 : 1 - 0.86 * Math.min(1, Math.max(0, (t - 116.95) / 0.35)) + 0.86 * Math.min(1, Math.max(0, (t - 118.3) / 1.0)) ** 2),
  ripples: [
    {t: L.ISOLATION, cx: 960, cy: 890, v: 700, w: 60, tau: 1.2},
    {t: L.DISHEARTENED, cx: 960, cy: 450, v: 1200, tau: 0.7},
    {t: L.ILLEGAL, cx: 1290, cy: 554, v: 1800, w: 70, tau: 0.6},
  ],
};
