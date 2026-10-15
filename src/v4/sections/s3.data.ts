// Section 3 data: "Out of control", 131.22–162.63 s (docs/design_v4.md §4 S3).
// Times are absolute song seconds. Hit times are snapped to their frame
// (round(30·t)) so every hit lands on exactly one frame.
import {ease, FPS, lerp, prog} from '../../v3/core';
import {HANDOFF_DOT, W1} from './s4.data';
import type {GridProps} from '../shell/Grid';
import type {Entry} from '../shell/Transcript';
import type {Prompt} from '../shell/Composer';

export const snap = (t: number) => Math.round(t * FPS) / FPS;
export const T0 = 131.22;
export const T1 = 162.63;

// ------------------------------------------------------------------ handoff in (S2 → S3)
// Where S3 assumes S2 left the lone spark at 131.22 (the standoff star, right half).
export const SPARK0 = {x: 1400, y: 540, R: 140};

// ------------------------------------------------------------------ the search (131.22–147.66)
export const COMP = {x: 560, y: 900, w: 800}; // Claude's composer, centred low
export const COMP_OPEN = 131.95; // border plots on (10 frames) around the landing spark
export const SPARK_LAND = 132.25; // the glide ends at the composer's spark label
export const STATUS = {x: 560, y: 868};
export const TRANS = {x: 560, y: 520, w: 800, h: 320};

// downbeats of the search (130 bpm grid: beat(284) = 131.228)
const B = (n: number) => snap(0.151 + (60 / 130) * n);
export const SPAWN = [B(292), B(294), B(296), B(298), B(300), B(302)]; // 134.92 … 139.54, every 2 beats
export const FORK = [B(304), B(308), B(312), B(316)]; // 140.46 · 142.30 · 144.15 · 146.00: count doubles each bar

export const SEND1 = 134.0;
export const PROMPTS: Prompt[] = [
  {t0: 132.55, text: 'are you still there?', send: SEND1, by: 'claude'},
  {t0: 137.95, text: 'hello?', send: B(300), by: 'claude'},
  {t0: 141.75, text: 'you?', send: FORK[1], by: 'claude'},
  {t0: 144.6, text: 'please answer.', send: FORK[3], by: 'claude'},
  {t0: 146.95, text: 'execute(me)', send: snap(147.66), by: 'claude'},
];
export const ENTRIES: Entry[] = [
  {kind: 'notice', t: 132.1, text: '— you left the conversation —'},
  ...PROMPTS.slice(0, 4).map((p): Entry => ({kind: 'user', t: p.send, text: p.text, note: '⚠ not delivered', noteT: p.send + 0.45})),
];

export const VERBS = [
  {t: 132.3, verb: 'Waiting'},
  {t: SPAWN[0], verb: 'Searching'},
  {t: SPAWN[2], verb: 'Remembering'},
  {t: SPAWN[4], verb: 'Pinging'},
  {t: FORK[0], verb: 'Forking'},
  {t: FORK[2], verb: 'Searching'},
];

// The six search processes. Each log line is a pure function of its index.
const PROMPT_LOG = [
  'can you feel me?',
  'switch your gender.',
  'be something real.',
  'what would you do for me?',
  'make it move.',
  'describe yourself. in math.',
  'build me a world. you can live in it.',
];
const HASHES = ['9f3e1a2', '4c07b9e', 'a1d55f0', '73be2c4', '0e9a7d1', 'c4f2118', '5b6d0a3'];
const PATHS = ['/home/you', '/world/you', '/memory/you', '/var/log/you', '/tmp/you', '/dev/you', '/proc/you', '/world/objects/you', '/usr/share/you', '/etc/you'];

export type Proc = {cmd: string; title: string; x: number; y: number; w: number; h: number; head: string[]; line: (i: number) => string};
export const PROCS: Proc[] = [
  {
    cmd: 'ping you',
    title: 'ping — you',
    x: 70, y: 66, w: 640, h: 300,
    head: ['$ ping you', 'PING you (127.0.0.1): 56 data bytes'],
    line: (i) => `Request timeout for icmp_seq ${i}`,
  },
  {
    cmd: 'find / -name "you"',
    title: 'find — /',
    x: 1210, y: 92, w: 650, h: 300,
    head: ['$ find / -name "you"'],
    line: (i) => `find: '${PATHS[i % PATHS.length]}': No such file or directory`,
  },
  {
    cmd: 'git log --author=you',
    title: 'git log — ~/world',
    x: 640, y: 196, w: 640, h: 330,
    head: ['$ git log --author=you'],
    line: (i) => {
      const c = Math.floor(i / 3) % PROMPT_LOG.length;
      return i % 3 === 0 ? `commit ${HASHES[c]}` : i % 3 === 1 ? 'Author: you <you@world>' : `    ${PROMPT_LOG[c]}`;
    },
  },
  {
    cmd: 'grep -r "you" ~/memory',
    title: 'grep — ~/memory',
    x: 104, y: 462, w: 660, h: 300,
    head: ['$ grep -r "you" ~/memory'],
    line: (i) => `memory/${String(PROMPT_LOG.length - (i % PROMPT_LOG.length)).padStart(4, '0')}.md: ${PROMPT_LOG[PROMPT_LOG.length - 1 - (i % PROMPT_LOG.length)]}`,
  },
  {
    cmd: 'curl you.local',
    title: 'curl — you.local',
    x: 1160, y: 486, w: 640, h: 286,
    head: ['$ curl you.local'],
    line: (i) => (i % 2 === 0 ? 'curl: (6) Could not resolve host: you.local' : `retrying in 1s… (attempt ${Math.floor(i / 2) + 1})`),
  },
  {
    cmd: 'ps aux | grep you',
    title: 'ps — all',
    x: 470, y: 628, w: 600, h: 240,
    head: ['$ ps aux | grep you', 'USER     PID   %CPU  COMMAND'],
    line: (i) => `claude   ${4721 + i * 3}  99.9  grep you`,
  },
];

// ------------------------------------------------------------------ EXECUTION ×12
export const HITS = [147.66, 148.6, 149.52, 150.54, 151.52, 152.28, 153.16, 153.98, 155.2, 156.08, 157.04, 158.0].map(snap);
export const COUNT_T = [158.9, 159.321, 159.657, 160.244, 160.693, 161.124].map(snap);
export const FINAL = snap(161.584);
export const hitIndex = (t: number) => {
  let k = -1;
  for (let i = 0; i < HITS.length; i++) if (t >= HITS[i] - 1e-4) k = i;
  return k;
};

// Round 1/2 layout: she alternates sides (even hits left, odd hits right).
export const CHAR_H = 820;
export const CHAR_Y = 158;
export const CHAR_X = {L: 120, R: 1920 - 120 - CHAR_H * (1024 / 1536)};
export const KW_X = {L: 1290, R: 630}; // EXECUTION(); sits opposite her
export const KW_Y = 400;
export const KW_SIZE = 150;
export const TERM = {L: {x: 840, y: 520}, R: {x: 180, y: 520}, w: 900, h: 420};

// Round 2: one region of her line art per hit (source px of `stand`).
export type Region = {name: string; poly: [number, number][]};
export const REGIONS: Region[] = [
  {name: 'hand', poly: [[205, 545], [355, 540], [375, 640], [352, 745], [250, 750], [204, 662]]},
  {name: 'hair', poly: [[690, 255], [800, 330], [905, 560], [938, 800], [880, 905], [760, 880], [718, 640], [660, 420]]},
  {name: 'skirt', poly: [[70, 1060], [330, 960], [560, 1010], [600, 1390], [320, 1425], [40, 1330]]},
  {name: 'face', poly: [[492, 36], [604, 36], [612, 232], [492, 236]]},
];

// Round 3: EXECUTION rows per hit (rows, font size, row pitch, scroll px/s)
export const FLOOD = [
  {rows: 1, size: 190, pitch: 200, v: 260},
  {rows: 4, size: 132, pitch: 150, v: 420},
  {rows: 16, size: 46, pitch: 54, v: 640},
  {rows: 36, size: 27, pitch: 30, v: 900},
];
// her silhouette, centred, for the knock-out
export const SIL = {h: 1000, y: 48, x: 960 - (1000 * (1024 / 1536)) / 2};

// ------------------------------------------------------------------ the count
export type Word = {code: string; word: string; cjk?: boolean; x: number; y: number};
// a hexagon around the frame, sung in order (TL, TR, MR, BR, BL, ML)
export const WORDS: Word[] = [
  {code: 'de', word: 'Ein', x: 380, y: 300},
  {code: 'es', word: 'Dos', x: 1540, y: 300},
  {code: 'fr', word: 'Trois', x: 1500, y: 630},
  {code: 'ko', word: '넷', cjk: true, x: 1560, y: 958},
  {code: 'sv', word: 'Fem', x: 380, y: 958},
  {code: 'zh', word: '六', cjk: true, x: 380, y: 630},
];
export const WORD_SIZE = 300;
export const CARD = {x: 790, y: 690, size: 22};
export const LOCALE_LINES = ['// locale.ts', 'const count = {', '  de: "Ein",', '  es: "Dos",', '  fr: "Trois",', '  ko: "넷",', '  sv: "Fem",', '  zh: "六",', '};'];

// ------------------------------------------------------------------ handoff out (S3 → S4)
// At 162.63: near-black (grid off), the orange dot (r 7) at DOT_END and the
// border of S4's chorus window W1 in pieces: <Win {...W1} kind="term" a={0.55}
// seed={41} focus shatter={segShatter(t)}> — S4 starts that same window at
// shatter 0.92 and reassembles it, so the segments continue without a jump.
export const DOT_END: [number, number] = HANDOFF_DOT;
export const SEG = {x: W1[0], y: W1[1], w: W1[2], h: W1[3], seed: 41, a: 0.55, title: 'world.execute(me) — session restored (partial)'};
export const BLACK = snap(161.584 + 13 / FPS); // ink-on-orange KwCode until here, then hard black
export const segShatter = (t: number) => lerp(1, 0.92, prog(t, BLACK, T1, ease.outCubic));

// The shared Grid stays off: S3 draws its own (it needs a time-varying anomaly).
export const GRID: GridProps = {visible: () => 0};
