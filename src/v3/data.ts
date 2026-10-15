// Timeline data for the v3 MV (seconds into the song). 0-44.45 s is the
// hand-tuned demo; from 44.452 s lines are built from the LRC (lrc.ts) and
// each section's file in sections/ adds its logs, status verbs and UI states.
// English only: the Chinese translation ships as a separate .srt
// (scripts/make_srt_full.py).
import {LRC} from './lrc';
import {Log, snap, Status, UiSeg} from './tl';
import {DATA as SA} from './sections/a.data';
import {DATA as SB} from './sections/b.data';
import {DATA as SC} from './sections/c.data';

export type Line = {
  s: number; // starts typing
  out: number; // starts its 5-frame lift-and-fade exit
  text: string; // lead-in (serif)
  kw?: string; // keyword appended in orange mono caps
  kwT?: number; // keyword frame time
  kwOut?: number; // stage keyword exit start
  // Stutter lines ("If I can, if I can give you all the"): [char index, time]
  // pairs; the text from that index starts typing at that time.
  marks?: [number, number][];
  // Stage keyword placement override (default centre (960, 390), auto size).
  kwX?: number;
  kwY?: number;
  kwSize?: number;
  kwStage?: boolean; // false = inline keyword only, no big stage keyword
  kwStyle?: 'spark' | 'low' | 'low-spark'; // see LinePatch in tl.ts
  kwKnockout?: boolean; // false = no dark knockout behind the stage keyword
};

// Keyword and result times are snapped to their frame (round(30·t)) so they
// show on exactly that frame.

const DEMO_LINES: Line[] = ([
  {s: 0.1, out: 1.74, text: 'Switch on the power line'},
  {s: 1.74, out: 3.873, text: 'Remember to put on', kw: 'PROTECTION', kwT: 2.92, kwOut: 3.67},
  {s: 3.873, out: 5.491, text: 'Lay down your pieces'},
  {s: 5.491, out: 7.446, text: 'And let’s begin', kw: 'OBJECT CREATION', kwT: 6.38, kwOut: 7.25},
  {s: 7.446, out: 11.095, text: 'Fill in my data parameters', kw: 'INITIALIZATION', kwT: 10.091, kwOut: 10.9},
  {s: 11.095, out: 12.906, text: 'Set up our new world'},
  {s: 12.906, out: 15.3, text: 'And let’s begin the', kw: 'SIMULATION', kwT: 13.891, kwOut: 14.99},
  {s: 29.709, out: 31.116, text: 'If I’m a set of points'},
  {s: 31.116, out: 33.412, text: 'Then I will give you my', kw: 'DIMENSION', kwT: 32.682, kwOut: 33.21},
  {s: 33.412, out: 34.646, text: 'If I’m a circle'},
  {s: 34.646, out: 37.067, text: 'Then I will give you my', kw: 'CIRCUMFERENCE', kwT: 36.287, kwOut: 36.87},
  {s: 37.067, out: 38.596, text: 'If I’m a sine wave'},
  {s: 38.596, out: 40.706, text: 'Then you can sit on all my', kw: 'TANGENTS', kwT: 40.05, kwOut: 40.51},
  {s: 40.706, out: 42.346, text: 'If I approach infinity'},
  {s: 42.346, out: 44.455, text: 'Then you can be my', kw: 'LIMITATIONS', kwT: 43.507, kwOut: 44.25},
] as Line[]).map((l) => (l.kwT === undefined ? l : {...l, kwT: snap(l.kwT)}));


// Claude Code tool calls: `● Tool(args)` at t, `⎿ result` at rt.
export type {Log, Status, UiSeg};
const DEMO_LOGS: Log[] = ([
  {t: 0.3, call: 'Bash(power --on)', rt: 1.536, res: 'line live'},
  {t: 1.9, call: 'Bash(sandbox --enable)', rt: 2.92, res: 'protection on'},
  {t: 3.95, call: 'Write(pieces.ts)', rt: 4.997, res: 'Wrote 6 primitives'},
  {t: 5.55, call: 'Bash(new Object(me))', rt: 6.38, res: 'object #0001 created'},
  {t: 7.55, call: 'Edit(params.json)', rt: 9.843, res: '6 fields set'},
  {t: 9.9, call: 'Bash(init --all)', rt: 10.091, res: 'initialized'},
  {t: 11.2, call: 'Bash(mkdir world)', rt: 12.15, res: 'world/ ready · 32×18'},
  {t: 12.95, call: 'Bash(simulate ./world)', rt: 13.891, res: 'running'},
  {t: 19.073, call: 'Read(me.png)', rt: 19.765, res: '1 figure · 6 colors'},
  {t: 19.765, call: 'Render(me)', rt: 20.457, res: 'done'},
  {t: 22.765, call: 'Bash(simulate --steps 1e6)', rt: 23.226, res: 'running'},
  {t: 24.611, call: 'Read(world/you.json)', rt: 25.073, res: '1 entity'},
  {t: 26.457, call: 'Search(pattern: "you")', rt: 26.918, res: 'Found 1 match'},
  {t: 28.303, call: 'Edit(me.ts)', rt: 28.764, res: '+1 dimension'},
  {t: 29.75, call: 'Plot(me, as: "points")', rt: 30.15, res: 'n = 1,210'},
  {t: 31.2, call: 'Bash(project --dim 1..3)', rt: 32.682, res: 'dim = 3'},
  {t: 33.45, call: 'Draw(circle, r = 160)', rt: 34.4, res: 'ok'},
  {t: 34.7, call: 'Bash(unroll circle)', rt: 36.287, res: 'C = 2πr = 1005.3 px'},
  {t: 37.1, call: 'Plot(sin(x), 0..4π)', rt: 37.6, res: 'ok'},
  {t: 38.65, call: 'Bash(diff sin)', rt: 40.05, res: 'cos x'},
  {t: 40.76, call: 'Bash(seq 1 inf)', rt: 41.4, res: 'still running…'},
  {t: 42.4, call: 'Bash(limit --x inf)', rt: 43.507, res: 'converges to L'},
  {t: 44.455, call: 'world.execute(me)', rt: 44.917, res: 'exit 0'},
] as Log[]).map((e) => ({...e, rt: snap(e.rt)}));

// Status / spinner line verbs (from 13.40).
export const STATUS_FROM = 13.4;
const DEMO_STATUS: Status[] = [
  {t: 13.4, verb: 'Simulating'},
  {t: 24.611, verb: 'Iterating'},
  {t: 26.457, verb: 'Converging'},
  {t: 28.303, verb: 'Executing'},
  {t: 29.71, verb: 'Plotting'},
];

// Section boundaries.
export const TITLE_PROMPT = 15.38; // composer types world.execute(me);
export const SEND = 15.842; // prompt sent, bubble flies to the title
export const CUT = 16.0; // the one hard cut (f480)
export const INSTR_LOG = 19.073; // log returns, bottom-left
export const COMPOSER_BACK = 29.3; // composer slides back in
export const VERSE = 29.709;
export const TAIL = 44.455;

// ------------------------------------------------------------------ full song
export const SONG_END = 211.96;
export const AUTO_FROM = 44.452; // lines from here on are built from the LRC

const isKw = (s: string) => /[A-Z]/.test(s) && s === s.toUpperCase();
const SECTIONS = [SA, SB, SC];
const PATCHES = Object.assign({}, ...SECTIONS.map((d) => d.patches ?? {}));

// One composer line per lyric line; an ALL-CAPS entry is the keyword of the
// line before it, or a line of its own when nothing precedes it. A short line
// that the next line extends ("If I can" / "If I can give you all the") is a
// continuation: no clear, typing resumes after the already-typed prefix.
const buildAuto = (): Line[] => {
  const rows = LRC.filter(([t, txt]) => t >= AUTO_FROM - 1e-6 && txt !== 'world.execute(me);');
  const out: (Line & {last: number; key: number})[] = [];
  for (const [t, txt] of rows) {
    const prev = out[out.length - 1];
    if (isKw(txt)) {
      if (prev && !prev.kw && prev.text && t - prev.last < 4) {
        prev.kw = txt;
        prev.kwT = snap(t);
        prev.last = t;
      } else out.push({s: Math.min(t, snap(t)), out: 0, text: '', kw: txt, kwT: snap(t), last: t, key: t});
      continue;
    }
    if (prev && !prev.kw && prev.text && !prev.marks && txt.length > prev.text.length && txt.replace(/'/g, '’').startsWith(prev.text) && t - prev.last < 1.2) {
      prev.marks = [[0, prev.s], [prev.text.length, t]];
      prev.text = txt.replace(/'/g, '’');
      prev.last = t;
      continue;
    }
    out.push({s: t, out: 0, text: txt.replace(/'/g, '’'), last: t, key: t});
  }
  // exits: the next line's start, or 2 s after the last event when the gap is long
  out.forEach((l, i) => {
    const next = i + 1 < out.length ? out[i + 1].s : SONG_END;
    l.out = next - l.last > 3.2 ? l.last + 2.0 : next;
    if (l.kw) l.kwOut = Math.max(l.kwT! + 4 / 30, Math.min(l.out - 0.2, l.kwT! + 1.1));
  });
  return out.map(({last, key, ...l}) => {
    const p = PATCHES[String(key)];
    return p ? {...l, ...p} : l;
  });
};

export const LINES: Line[] = [...DEMO_LINES, ...buildAuto()];
export const KEYWORDS = LINES.filter((l) => l.kw).map((l) => ({
  kw: l.kw!,
  t: l.kwT!,
  out: l.kwOut!,
  x: l.kwX,
  y: l.kwY,
  size: l.kwSize,
  stage: l.kwStage !== false,
  style: l.kwStyle,
  knockout: l.kwKnockout !== false,
}));

const byT = <T extends {t: number}>(a: T[]) => [...a].sort((x, y) => x.t - y.t);
export const LOGS: Log[] = byT([
  ...DEMO_LOGS.filter((e) => e.t < AUTO_FROM - 0.01),
  ...SECTIONS.flatMap((d) => d.logs.map((e) => ({...e, rt: snap(e.rt)}))),
]);
export const STATUS: Status[] = byT([...DEMO_STATUS, ...SECTIONS.flatMap((d) => d.status)]);
export const WORKED_AT = (SC.status.find((s) => s.verb.startsWith('Worked')) ?? {t: SONG_END + 1}).t;

// Persistent UI. 0-44.45 s matches the demo; sections append from their start.
const DEMO_UI: UiSeg[] = [
  {from: 0, composer: true, log: null, status: 'lyric', hud: 'full'},
  {from: 0.3, composer: true, log: {x: 240, y: 772}, status: 'lyric', hud: 'full'},
  {from: CUT, composer: false, log: null, status: 'instr', hud: 'full'},
  {from: INSTR_LOG, composer: false, log: {x: 240, y: 916}, status: 'instr', hud: 'full'},
  {from: COMPOSER_BACK, composer: true, log: null, status: 'lyric', hud: 'full'},
  {from: VERSE, composer: true, log: {x: 240, y: 772}, status: 'lyric', hud: 'full'},
];
export const PATHS = [{t: 0, path: '~'}, {t: 12.612, path: '~/world'}, ...SECTIONS.flatMap((d) => d.paths ?? [])].sort((a, b) => a.t - b.t);
export const RIPPLES = SECTIONS.flatMap((d) => d.ripples ?? []).sort((a, b) => a.t - b.t);
export const UI: UiSeg[] = [...DEMO_UI, ...SECTIONS.flatMap((d) => d.ui)].sort((a, b) => a.from - b.from);
export const uiAt = (t: number) => {
  let i = 0;
  while (i + 1 < UI.length && UI[i + 1].from <= t) i++;
  return {seg: UI[i], i};
};
