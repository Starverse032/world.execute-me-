// Section C1 timeline data (131.20–177.25 s, shots C1–C13 of docs/design_full.md
// Section C; supersedes docs/design_C.md): logs, status verbs, persistent-UI
// states, line patches and one-off ripples. Lines come from the LRC
// automatically; only patches live here. Log B13 (world.execute(me, god),
// resolving on f3937) belongs to b.data.ts.
import type {LinePatch, SectionData, UiSeg} from '../tl';
import {snap} from '../tl';

const LYRIC = {x: 240, y: 772};
const INSTR = {x: 240, y: 916};
const C = {cx: 960, cy: 390}; // lyric stage centre
const D = {cx: 960, cy: 430}; // instrumental / climax stage centre

const seg = (from: number, lyric: boolean, ripple: UiSeg['ripple'], grid: UiSeg['grid'] = 'hi', log = true): UiSeg => ({
  from,
  composer: lyric,
  log: log ? (lyric ? LYRIC : INSTR) : null,
  status: lyric ? 'lyric' : 'instr',
  hud: 'full',
  ripple,
  grid,
});

// The 12 EXECUTION hits (C6): line key (LRC start as String()), stage keyword x.
const EXEC = [147.66, 148.6, 149.52, 150.54, 151.52, 152.28, 153.16, 153.98, 155.2, 156.08, 157.04, 158.0];
const COUNT = [158.9, 159.321, 159.657, 160.244, 160.693, 161.124]; // EIN DOS TROIS NE FEM LIU
const EXEC13 = 161.584;

const patches: Record<string, LinePatch> = {
  // section B's line; its hit (f3937) is drawn by C1 (kwOut 132.333 auto)
  '128.661': {kwSize: 120, out: 132.9},
  // EXECUTION #13: the composer comes back empty at 162.25 (line leaves while hidden)
  [String(EXEC13)]: {kwY: 430, out: 162.25},
};
EXEC.forEach((t, i) => {
  patches[String(t)] = {kwSize: 150, kwY: 430, kwX: i % 2 === 0 ? 1350 : 570};
});
COUNT.forEach((t) => {
  patches[String(t)] = {kwX: 960, kwY: 430};
});

export const DATA: SectionData = {
  logs: [
    {t: 131.45, call: 'TodoWrite(rebuild world)', rt: 132.14, res: '6 todos · 0 done'},
    {t: 133.3, call: 'Write(pieces.ts)', rt: 134.909, res: 'Wrote 36 primitives'},
    {t: 134.95, call: 'Edit(pieces.ts)', rt: 136.294, res: 'rotated 3 × 60°'},
    {t: 136.755, call: 'Bash(mkdir -p world)', rt: 137.678, res: 'world/ ready · 32×18'},
    {t: 138.14, call: 'Bash(simulate ./world --fast)', rt: 140.447, res: '3 orbits · 540°/s'},
    {t: 140.447, call: 'Bash(simulate --steps 1e9)', rt: 141.37, res: 'running'},
    {t: 142.293, call: 'Read(world/you.json)', rt: 143.216, res: '0 entities'},
    {t: 144.139, call: 'Search(pattern: "you")', rt: 145.062, res: 'No matches found'},
    {t: 145.985, call: 'Bash(chmod +x me)', rt: 146.447, res: 'ok'},
    {t: 146.447, call: 'Bash(./world --dry-run)', rt: 146.908, res: '12 targets'},
    {t: 146.908, call: 'Task(execute ×12)', rt: 147.37, res: '12 agents launched'},
    {t: 147.66, call: 'Task(execute #01)', rt: 148.6, res: 'Done (0.9s)'},
    {t: 148.6, call: 'Task(execute #02)', rt: 149.52, res: 'Done (0.9s)'},
    {t: 149.52, call: 'Task(execute #03)', rt: 150.54, res: 'Done (1.0s)'},
    {t: 150.54, call: 'Task(execute #04)', rt: 151.52, res: 'Done (1.0s)'},
    {t: 151.52, call: 'Task(execute #05)', rt: 152.28, res: 'Done (0.8s)'},
    {t: 152.28, call: 'Task(execute #06)', rt: 153.16, res: 'Done (0.9s)'},
    {t: 153.16, call: 'Task(execute #07)', rt: 153.98, res: 'Done (0.8s)'},
    {t: 153.98, call: 'Task(execute #08)', rt: 155.2, res: 'Done (1.2s)'},
    {t: 155.2, call: 'Task(execute #09)', rt: 156.08, res: 'Done (0.9s)'},
    {t: 156.08, call: 'Task(execute #10)', rt: 157.04, res: 'Done (1.0s)'},
    {t: 157.04, call: 'Task(execute #11)', rt: 158.0, res: 'Done (1.0s)'},
    {t: 158.0, call: 'Task(execute #12)', rt: 158.9, res: 'Done (0.9s)'},
    {t: 158.9, call: 'Bash(count --to 6)', rt: 161.124, res: 'ein dos trois ne fem liu'},
    {t: 161.2, call: 'Bash(execute --now)', rt: 161.584, res: 'executed'},
    {t: 162.7, call: 'Bash(broadcast --all execute)', rt: 165.166, res: '24/24 delivered'},
    {t: 166.1, call: 'Bash(pkill --all-but you)', rt: 168.911, res: '23 stopped · 1 left'},
    {t: 169.9, call: 'Bash(git checkout HEAD~1 -- you)', rt: 171.4, res: 'Updated 1 path from HEAD~1'},
    {t: 171.95, call: 'Bash(simulate ./world --resume)', rt: 172.712, res: 'running'},
    {t: 173.7, call: 'Bash(ls /exit)', rt: 174.975, res: 'No such file or directory'},
    {t: 175.1, call: 'Read(world/bounds.json)', rt: 176.0, res: 'walls: 4 · doors: 0'},
  ],
  status: [
    {t: 131.224, verb: 'Recovering'},
    {t: 133.063, verb: 'Reticulating'},
    {t: 136.755, verb: 'Forging'},
    {t: 140.447, verb: 'Synthesizing'},
    {t: 144.139, verb: 'Coalescing'},
    {t: 147.66, verb: 'Executing'},
    {t: 158.9, verb: 'Counting'},
    {t: 161.584, verb: 'Executing'},
  ],
  // A segment's `from` sits at or before the first beat it governs (ripple
  // onsets look the segment up at the beat time).
  ui: [
    seg(131.2, true, {...C, every: 4}), // C1: lyric layout, downbeats (b284) from C
    seg(133.063, false, {...D, every: 1}, 'hi', false), // composer and log fade out together
    seg(133.3, false, {...D, every: 1}), // C2–C3: log back at the instrumental anchor
    seg(140.44, false, {...D, every: 1, half: true}), // C4–C5: + off-beat eighths
    seg(147.65, false, {...D, every: 1}), // C6–C8: every beat + every hit (ripples below)
    seg(162.25, true, {...C, every: 1}, 'lo', false), // composer slides back, log hidden
    seg(162.632, true, {...C, every: 1}, 'lo'), // C9–C13: dark chorus, log back at (240, 772)
  ],
  patches,
  ripples: [
    ...[...EXEC, ...COUNT, EXEC13].map((t) => ({t: snap(t), cx: D.cx, cy: D.cy})),
    // C13: the downbeats b376 and b380 at double weight (a wider, slower ring on
    // top of the beat ripple). Onsets as core's lastOnset gives them: b376 is the
    // detected beat 173.708; b380 has none within 40 ms, so the nominal 175.5356.
    ...[173.708, 175.5356].map((t) => ({t, cx: C.cx, cy: C.cy, w: 90, tau: 0.9})),
  ],
};
