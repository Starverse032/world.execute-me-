// Timeline types shared by data.ts and the section files in sections/.

// Snap a time to its frame (round(30·t)) so a hit shows on exactly that frame.
export const snap = (t: number) => Math.round(t * 30) / 30;

// Claude Code tool call: `● Tool(args)` at t, `⎿ result` at rt.
// res '' = assistant text: the call string is shown as plain text (weight 400)
// after a cream bullet, with no ⎿ result line.
// runs: optional repeat runs of the same call after the first one. The call is
// shown once with a ` ×n` suffix from the second run; the bullet is orange while
// t is in [run.t, run.rt); the result is the latest finished run's (it fades out
// over 3 frames when a new run starts).
export type Log = {t: number; call: string; rt: number; res: string; runs?: {t: number; rt: number; res: string}[]};

// Status / spinner line verb from t. A verb starting with "Worked for" is the
// final static line (creamDim, still spark, no counter), e.g. 'Worked for 3m 31s'.
export type Status = {t: number; verb: string};

// Persistent-UI state from `from` until the next segment.
export type UiSeg = {
  from: number;
  composer: boolean; // composer box shown (slides up 0.3 s on entry, fades out over 5 frames on exit)
  log: {x: number; y: number} | null; // log zone anchor (latest entry baseline); null = hidden
  status: 'lyric' | 'instr' | null; // lyric = above the composer (264, 852); instr = bottom-left (240, 1000)
  ripple?: {cx: number; cy: number; every: number; half?: boolean} | null; // grid ripples from (cx, cy) every N beats (half: also on off-beats)
  hud?: 'full' | 'light' | 'off'; // header right side: timecode + beat counter / timecode only / hidden
  logO?: number; // log zone opacity (default 1); changes fade over 6 frames
  logPrev?: boolean; // show the previous entry at 40 % (default true)
  statusO?: number; // status line opacity (default 1); changes fade over 6 frames
  // dot grid: 'hi' = gridHi (default after 12.6 s), 'lo' = the darker grid tone,
  // 'retract' = dots shown only within R(t) = 1300 − 1400·(t − from) of C, 'off' = no grid
  grid?: 'hi' | 'lo' | 'retract' | 'off';
};
// Log zone rules: a segment with log = null hides the zone with a 5-frame
// lift-fade; the next segment with the same anchor fades it back in over 6
// frames and keeps the entries from before the gap.

// One-off grid ripple (on top of the per-segment beat ripples).
// v: ring speed px/s (default 1400), w: ring half-width px (45), tau: decay s (0.6).
export type Ripple = {t: number; cx: number; cy: number; v?: number; w?: number; tau?: number};

// Per-line patch keyed by the LRC start time of the line (e.g. '59.223').
export type LinePatch = Partial<{
  out: number;
  kwOut: number;
  kwX: number;
  kwY: number;
  kwSize: number;
  kwStage: boolean;
  // stage keyword variant: 'spark' = filled Claude spark (R 84, gap 36) left of the
  // 200 px word, group centred on x 960; 'low' = 120 px word with baseline y 790
  // (log band); 'low-spark' = low plus a spark R 50, gap 22.
  kwStyle: 'spark' | 'low' | 'low-spark';
  kwKnockout: boolean; // false = no dark knockout (lets art under the word show through the outline)
  text: string;
}>;

export type SectionData = {
  logs: Log[];
  status: Status[];
  ui: UiSeg[];
  patches?: Record<string, LinePatch>;
  ripples?: Ripple[];
  paths?: {t: number; path: string}[]; // header path (after "claude") from t
};
