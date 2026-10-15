// Section A timeline data (docs/design_A.md A.0): logs, status verbs,
// persistent-UI states (log hides for the two character moments, ripple
// densities from A.0.6) and keyword style patches (A.0.3).
import type {SectionData, UiSeg} from '../tl';

const LOG = {x: 240, y: 772};
const C = {cx: 960, cy: 390};
const seg = (from: number, log: UiSeg['log'], every: number, half = false): UiSeg => ({
  from,
  composer: true,
  log,
  status: 'lyric',
  hud: 'full',
  ripple: {...C, every, half},
});

export const DATA: SectionData = {
  logs: [
    {t: 44.47, call: 'Bash(git switch current)', rt: 45.382, res: "Switched to branch 'current'"},
    {t: 45.9, call: 'Bash(rectify --full-wave)', rt: 47.228, res: 'DC · ripple 0%'},
    {t: 47.7, call: 'Edit(eyes.css)', rt: 49.074, res: 'visibility: hidden'},
    {t: 49.56, call: 'Bash(watch -n 0.1 spin)', rt: 50.459, res: 'dizzy, dizzy'},
    {t: 51.4, call: 'Bash(travel --to "1 B.C")', rt: 54.151, res: 'no year 0 · skipped'},
    {t: 55.1, call: 'Bash(git merge you)', rt: 56.92, res: 'Merged · 0 conflicts'},
    {t: 56.95, call: 'Bash(cd deeper/deeper/deeper)', rt: 58.766, res: 'depth 6'},
    {t: 59.7, call: 'Bash(send stimuli/* --to you)', rt: 61.958, res: '16 sent · 16 received'},
    // log hidden 62.920–66.613 (moment 3)
    {t: 66.65, call: 'Bash(if happy(you); then ./run.sh; fi)', rt: 67.997, res: 'true'},
    {t: 68.27, call: 'Bash(./run.sh --execution)', rt: 69.259, res: 'running · pid 1'},
    {t: 70.1, call: 'Bash(exit)', rt: 71.228, res: 'exit: not permitted in simulation'},
    {t: 71.78, call: 'Bash(simulate ./world)', rt: 73.169, res: 'running · 2 entities'},
    {t: 74.07, call: 'Write(eggplant.svg)', rt: 75.382, res: '2 ellipses · 1 star'},
    {t: 75.45, call: 'Read(usda/eggplant.json)', rt: 76.959, res: '25 kcal · 3 fields'},
    {t: 77.6, call: 'Bash(mv eggplant.svg tomato.svg)', rt: 78.151, res: 'renamed · r = 130'},
    {t: 79.25, call: 'Search(pattern: "free radical")', rt: 80.62, res: 'Found 12 · 12 neutralized'},
    {t: 81.37, call: 'Write(cat.svg)', rt: 82.766, res: '3 triangles · 1 circle · 1 M'},
    {t: 82.85, call: 'Bash(purr --freq 25Hz)', rt: 84.268, res: 'purring for you'},
    // log hidden 85.074–88.42 (moment 4)
    {t: 88.433, call: 'Bash(assert exists(me))', rt: 88.6, res: 'passed · 1 witness'},
  ],
  status: [
    {t: 44.452, verb: 'Switching'},
    {t: 45.85, verb: 'Alternating'},
    {t: 47.672, verb: 'Blinking'},
    {t: 49.534, verb: 'Spinning'},
    {t: 51.363, verb: 'Traveling'},
    {t: 55.083, verb: 'Merging'},
    {t: 59.223, verb: 'Stimulating'},
    {t: 62.589, verb: 'Reaching'},
    {t: 66.601, verb: 'Pleasing'},
    {t: 68.252, verb: 'Executing'},
    {t: 70.084, verb: 'Simulating'},
    {t: 74.045, verb: 'Cooking'},
    {t: 77.576, verb: 'Ripening'},
    {t: 81.351, verb: 'Purring'},
    {t: 85.078, verb: 'Existing'},
  ],
  // Segment starts sit on (or just before) the beat they govern: ripple
  // onsets look up the segment in effect at the beat time.
  ui: [
    seg(44.452, LOG, 2), // even beats (b96 … b110)
    seg(51.37, LOG, 1), // every beat from b111
    seg(56.9, LOG, 1, true), // + off-beat eighths from b123 (through the STIMULATIONS bar)
    seg(62.9, null, 4), // moment 3: log hidden, downbeats only (b136, b140)
    seg(66.6, LOG, 1, true), // log returns on b144; every beat + eighths
    seg(73.98, LOG, 2), // verse 2: even beats from b160
    seg(85.06, null, 4), // moment 4: log hidden, downbeats only (b184, b188)
    seg(88.42, LOG, 4), // f2653: the log fades back in, entry 19 pushes in at 88.433
  ],
  patches: {
    '59.223': {kwStyle: 'spark'}, // STIMULATIONS
    '62.589': {kwStyle: 'low-spark'}, // SATISFACTION
    '68.252': {kwStyle: 'spark'}, // EXECUTION
    '71.764': {kwStyle: 'spark'}, // SIMULATION
    '86.538': {kwStyle: 'low', kwOut: 88.22}, // EXISTENCE: gone by f2653
  },
};
