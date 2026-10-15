# v4 shared framework: API reference

This reference covers the framework under `src/v4/`. The spec is docs/design_v4.md §3; this file describes what was actually built. The usage reference is **src/v4/Kit.tsx** (composition `V4Kit`, 20 s), which shows every component in action.

## Conventions (read first)

- **Time.** Every component reads `t` itself through `useT()`, which gives absolute song seconds. Every time prop is in absolute seconds.
  - Do **not** wrap components in `<Sequence from>`. Inside a Sequence, `t` becomes local, so your time props and the default `anomaly(t)` would be wrong.
- **Coordinates.** Shell components are **HTML-level**: each one renders an absolutely positioned `<svg>` or `<div>`. Their `x, y` are parent px.
  - At the top level the parent is the 1920×1080 frame.
  - Inside a `<Win>` the parent is the window **body**. Its origin is the window's top-left + (0, 34), or + (0, 66) when the window has tabs. `winBody(w, h, tabs)` gives the body size.
  - Put them in an `AbsoluteFill` or another positioned div.
- **SVG fragments.** v3 primitives (`Spark`, `Plot`, `PenHead`, `Elbow`…) and the `*G` variants (`CodeG`, `DiffG`, `YouNodeG`, `TetherG`) are SVG fragments, so they must sit inside an `<svg>`. Wrap them in `<Layer>` (from `shell/lib`), a 1×1 svg at the origin with overflow visible.
- **Fonts.** Import `CODE`, `SERIF`, `MATH` and `CJK` from **`src/v4/fonts`**, not from v3/core.
  - The v4 `CODE` and `MATH` stacks add glyphs that v3 lacked: `● › ⚠ ↑ ² ³ − ─│└├` and box drawing.
  - Still not in any font, so draw them: ✻ with `<Spark>`, ⎿ with `<Elbow>`, ✓ with `<Check>` (all from v3/geo).
  - Mono advance is exactly 0.6 em, so `monoW(s, size)` gives an exact width. SERIF must be measured with `textW` (shell/lib).
- **Anomaly.** Components that take `a` default to the global `anomaly(t)`. Pass `a={0}` to keep an element clean. Effects fade in across each threshold through `band()`, so values between thresholds blend smoothly.
- **Layers.** Paint order is DOM order. Composition order: background, shared Grid, then `Section0`…`Section4`. Inside a section, put the shared chrome first and stage art and KwCode on top, or the other way round, as the shot needs.
- **IDs.** Masks and clipPaths use `useId()`, so any number of instances can coexist.

### Standard layout (`LAYOUT` in src/v4/timeline.ts)

| Element | Position |
|---|---|
| Header | y 0..44, full width |
| Sidebar | x 24, y 64, w 240, h 900 |
| Transcript | x 300, y 64, w 640, h 820 (see note) |
| Composer | x 300, y 908, w 640 (h is always 64) |
| you-node | (272, 940) = `youPos(300, 908)` |
| Stage window | x 980, y 64, w 916, h 900 |
| Status line | x 300, y 878 (y is the line's vertical centre) |
| Claude's spark (tether end) | (318, 878) = `statusSpark(300, 878)` |

Note: a transcript with h = 820 ends at y 884, which overlaps the status line at 878. Use **h ≈ 790** while the status line is visible (the Kit does this).

`SECTIONS`, `sectionAt(t)` and `inRange(t, a, b, pad = 0.5)` are also in timeline.ts.

---

## chaos.ts

| Export | Behaviour |
|---|---|
| `anomaly(t)` | The spec's curve. Plateau changes are 0.5 s smoothsteps centred on each boundary. The two long ramps (88.6–99 and 131.2–147.6) are eased. |
| `band(a, from, to)` | Smoothstep from 0 to 1 as `a` goes from `from` to `to`. Use it to fade an effect in. |
| `stepJ(t, seed, amp, hz = 10)` | A random offset in ±amp, held for 1/hz s. |
| `corrupt(text, t, amount, seed)` | Replaces a fraction `amount` of the non-space characters with glyphs from `#%&@$*+=?/\|<>01`. Re-rolls every 3 frames. |
| `glitchRect(t, seed, a)` | Returns 4 `GlitchSeg` objects (top, right, bottom, left): `{dx, dy, over0, over1, vis, gap: [u0, u1] \| null, rot}`. |
| `hash(seed, a, b)` / `hashS` | Fast deterministic hash returning [0, 1) or [−1, 1). |

## shell/lib.tsx (helpers)

- **`Frame`:** an SVG fragment that draws a rounded-rect border. Props: `x y w h r t a seed color opacity sw dash wave shatter plot`.
  - With `a ≤ 0.15` and no wave or shatter it is a single path.
  - Otherwise it draws 4 sides, each owning its start-corner arc. Sides can carry overshooting corner lines, gaps, detaching and rotation (end movement is capped at 28 px).
  - `wave` (px) gives a 3-mode standing wave on every side.
  - `shatter` (0..1) splits each side into pieces about 130 px long that fly outward. Drive it backwards to reassemble.
  - `plot < 1` draws the border on, with a pen head.
- `rrPath(x, y, w, h, r)` returns the rounded-rect path string.
- `textW(s, font)` measures with a canvas. Results are cached once fonts are ready.
- `useFonts()` re-renders the component once fonts load.
- `wrapWords(text, maxW, widthFn)` greedy word wrap.
- **`since(fn, t, maxF)`** returns `{f, prev, cur}`: how many frames ago `fn`'s value changed, and the value before the change. This lets you animate state transitions as a pure function of t.
- `Layer`: wraps SVG fragments for use at HTML level.
- `Caret`, `SendArrow`, `blink(t)`, `F(frames)`, `fprog(t, t0, frames, ease)`.

## Win: shell/Win.tsx

```tsx
<Win x y w h title tOpen tClose? a? seed? kind='plain'|'term'|'editor'|'doc' tabs? activeTab? opacity? focus? lid? wave? shatter? titleRight?>
  {children /* body coords */}
</Win>
```

**Frame**
- r = 10, 1.5 px cream stroke at 0.25 (0.45 with `focus`).
- Fill is surface at 0.92 (`term` uses bg).
- Title bar is 34 px: an orange dot, two line2 outline dots, and the title in mono 15 creamDim, centred. `doc` has no dots and a cream 0.7 title.

**Tabs**
- `tabs: {t, label}[]` adds a 32 px strip. Each tab grows and types in at its `t`.
- The active tab is `activeTab(t)`, defaulting to the latest tab that has appeared.
- A 2 px orange underline slides between tabs over 6 frames.

**Open and close**
- Open, 14 frames: an orange line plots from the centre (f0–6). The frame then unfolds vertically (f6–14, outCubic) while the orange line rides the top and bottom edges and fades. The title bar rides the top edge. Content fades in over f10–14.
- Close, 12 frames: content fades (f0–3), the window folds to a line (f0–7), the line shrinks (f7–10), and the dot fades (f10–12).
- `winState(t, tOpen, tClose, w, h)` exposes this geometry.

**Anomaly**

| a | Effect |
|---|---|
| > 0.15 | ±2 px jitter at 8 Hz; one corner overshoots up to 18 px |
| > 0.4 | Orange ghost outline at 0.45, offset ±6 px; gaps open; sides may blink out; title corrupted at a × 0.3 |
| > 0.7 | Sides detach (±10 px) and rotate; extra overshoot; the body shifts ±10 px against the frame |

**Extras**
- `lid` (0..1): an eyelid line wipes down the body and covers it (for S1 "blind my vision").
- `wave` (px): a vibrating-string border (for S2 VIBRATIONS).
- `shatter` (0..1): border pieces fly out while the fill, title and body fade. Run it backwards to reassemble (for S4).

Gotcha: `children` render only while the window is open. They are clipped to the body (overflow hidden, rounded bottom).

## Transcript: shell/Transcript.tsx

```tsx
<Transcript x y w h entries a? swap?={(t)=>0..1} clears?={[t…]} fade? opacity? seed?/>
```

**Entry kinds.** Every entry has `t`. An entry appears at `t`, grows in over 8 frames (outCubic), and pushes the older entries up.

| Kind | Fields | Rendering |
|---|---|---|
| `user` | `text`, `note?`, `noteT?` | `›` + mono 20 at cream 0.7 on a surface/line2 pill, right-aligned and wrapped at 86 % of w. `note` (e.g. `'⚠ not delivered'`) appears below in orange at `noteT`. Push one at every composer `send`. |
| `say` | `text`, `marks?`, `end?`, `kw?` | SERIF, word-wrapped at 46 px. Streams at max(40 ch/s, len/(next say − 0.1 − t)). `marks: [[charIndex, t]]` follows v3 semantics: the part starting at that index streams from `t`. When the next `say` arrives, the line shrinks to 30 px at 0.45 over 8 frames by scaling, with no reflow. ALL-CAPS words, or the words in `kw`, render in mono 700 orange at 0.82 × size. The ● is orange and pulsing while streaming, creamDim after. |
| `tool` | `text: 'Name(args)'`, `res?: string \| string[]`, `rt?` (default t + 0.4), `runs?: number[]`, `tone?: 'dim'\|'orange'` | Types at 5 ch/frame. Name in cream 600, args creamDim. The ● is orange while running. `⎿ res` appears at `rt`. `runs` adds an orange `×n`. |
| `code` | `lines`, `lang?`, `typeOn?`, `file?` | Card with a header label, line numbers and the highlighter (mono 16). |
| `notice` | `text` | Centred mono 16 creamDim with hairlines either side. |
| `error` | `text`, `stack?`, `stackRate?` (lines/s, default 24) | Orange diamond plus orange mono 17 text. The stack streams in creamDim. |

**Behaviour**
- The top edge fades in opacity steps (1 / 0.7 / 0.45 / 0.25, softened over a few px) across `fade` px (default 18 % of h). Content is clipped to the box.
- `swap(t)`: user pills slide to the left with their text crossfading to orange, and say lines slide to right-aligned (S2 role swap).
- `clears`: at each time an orange line wipes down over 10 frames and removes every entry older than the clear (a new chat).
- Anomaly: above 0.3, older text (not the newest lyric) gets corrupted; above 0.6, entries jitter.

Exports: `TR` (sizes), `sayLayout`, `streamed`.

## Code: shell/Code.tsx

- `tokenize(line, lang)` with `lang` one of `'ts' | 'py' | 'sh' | 'json' | 'txt'`. Colours:
  - Keywords: orange.
  - Strings: cream.
  - Numbers: cream 0.7.
  - Comments: creamDim at 0.45.
  - Identifiers: cream.
  - Punctuation: creamDim.
  - ALL_CAPS: orange 700.
  - sh: the `$`/`#`/`>` prompt and `--flags` in creamDim.
  - json: keys in cream 0.7.
- Keyword list: the spec's list plus `interface type export try catch in of this var elif lambda yield None True False not and or as void`.

**`<CodeBlock x y lines lang='ts' size=20 lineNo=true first=1 typeOn? caret? highlight? w? lh? a?=0 seed? opacity?>`**
- `x, y` is the top-left. Row height `lh` defaults to 1.6 × size.
- `typeOn: [t0, t1]` types every character, with a newline counting as one character. With `caret`, an orange caret shows while typing and blinks afterwards.
- `highlight(t)` returns a row index or null. The highlighted row gets a line2 band at 0.35 with a 2 px orange bar, sliding over 4 frames between rows.
- `codeMetrics(lines, size, lineNo, first)` returns `{w, h, gutter, lh}`.

**`<Diff x y rows t0 size=20 dt=4f lang? lh? t1? opacity?>`**
- Rows reveal one after another: fade, 8 px slide and quick type.
- `-` rows are creamDim and get a strike plotted 6 frames after they appear.
- `+` rows are cream with an orange bold `+`.
- `t1` sets an exit: lift and fade.

`CodeG` and `DiffG` are the same drawings as SVG fragments.

## Composer, YouNode, Tether: shell/Composer.tsx

**`<Composer x y w prompts? state? a? placeholder? seed? opacity? tOpen?>`**
- `y` is the top edge; h is always 64. Rounded rect r = 14 with a line2 border on a surface fill.
- `Prompt = {t0, text, send, by?}`. Typing runs at max(24 ch/s, fast enough to finish 0.12 s before `send`). At `send` the text lifts and clears over 5 frames, the send button pulses, and an orange ring expands. Push the matching `user` entry yourself.
- `state(t)` returns one of these. Every change between states animates over 6 frames.

| State | Appearance |
|---|---|
| `normal` | `›` label, placeholder `Reply to Claude…` |
| `disabled` | Dashed border; placeholder `no user connected · messages will not be delivered`; outline send button; no caret |
| `claude` | Spark label; orange text and caret (a `by: 'claude'` prompt is orange in any state) |
| `hidden` | Fades and drops 12 px |

- `placeholder` (a string or `(t) => string`) overrides the state's placeholder. Example: S4's `reconnecting to you… (attempt n)`.
- Helpers: `sendButtonPos(x, y, w)` (for spawning the orange dot), `youPos(x, y)`, `promptAt(prompts, t)`.

**`<YouNode x y t0? t1? ghost? label='you' labelPos='below'|'left'|'right'|'above' opacity? pings? flicker? color?>`**
- A cream ring (r 9, 2 px) with a bg fill, so it covers the tether end, and a mono 15 label.
- `t0`: the ring plots on and the label types (8 frames). `t1`: fades out (8 frames).
- `ghost`: dashed ring at 0.45. `flicker` (0..1): stepped on/off at 12 Hz. `pings: number[]`: an orange ripple ring at each time.
- Move it by passing `x, y` computed from t.

**`<Tether from to t0? t1? sends? cuts? sag? wave? opacity=0.45 color w=1.5 dash?>`**
- A sampled line from `from` (you) to `to` (Claude), plotted over 10 frames from `t0`.
- `sends: (number | {t, dir?: 1|-1, dur?: 0.5})[]`: an orange r = 4 dot travels the line. A dot that reaches an open gap dies there.
- `cuts: {t, u, gap? = 14 px, retract?}[]`: a gap opens at fraction `u` with a 6-ray orange spark. With `retract`, both halves pull back to their anchors over 0.7 s (the final cut).
- `sag` bows the line. `wave` (px) makes it tremble as a standing wave.

The `*G` variants are SVG fragments that take `t`.

## Sidebar: shell/Sidebar.tsx

**`<Sidebar x y w h items a? t0? seed? opacity?>`**, with `ChatItem = {id, label, tNew, tDel?, tSel?}`.

- **Contents:** a header (spark + `Claude`), a `+ New chat` row, the `RECENTS` label, then rows of 38 px, newest first.
- **`tNew`:** the row grows (6 frames), `+ New chat` flashes orange (4 frames), and the label types.
- **Selection:** the item with the latest `tSel ≤ t` whose row still exists. It gets a line2 band and a 2 px orange bar, which slides between rows over 6 frames.
- **`tDel`:** an orange strike plots (6 frames), then the row collapses (8 frames) and the rows below move up. If the selected row is deleted, selection falls back to the previous `tSel`.
- **`t0`:** the frame plots on with a pen (14 frames) and the content fades in.

## Status and Header: shell/Status.tsx

**`<Status x y verbs t0 t1? a? tokens? size=18 opacity?>`**
- `x` is the left edge and `y` the vertical **centre**. The spark is at (x + 18, y).
- Shows `✻ Verb… (12s · ↑ 1.2k tokens · esc to interrupt)`. A new verb types in over 4 frames.
- `Verb = {t, verb, done?}`. With `done`, it shows a creamDim static spark and the verb as-is (e.g. `Worked for 3m 31s`).
- Anomaly above 0.3: elapsed time jumps and digits are corrupted. Above 0.7: the verb flickers to the previous verb every 3 frames.

**`<Header path='~/world' model='claude-opus' clock='' a? t0? t1? x=0 y=0 w=1920>`**
- y 0..44. A hairline at the bottom (which plots from `t0`). Spark, `claude` and the path on the left; model and clock on the right.
- `clockStr(secondsSinceMidnight)` returns e.g. `11:59:07 AM`. The section drives the clock. Example: `clockStr(11*3600 + 59*60 + t)`, then spin it through 92–95.
- Anomaly: path and clock digits are corrupted, and the bar jitters above 0.5.

## KwCode: shell/KwCode.tsx

**`<KwCode t0 t1 pre? kw post? x y size=160 a? style='outline'|'solid'|'ghost' anchor='middle' exit='backspace'|'fade'|'none' knock=true underline? opacity?>`**

- **Coordinates:** `y` is the baseline. `x` is the anchor of the whole statement (`anchor` start, middle or end).
- **Text:** `pre` and `post` are mono creamDim at 0.42 × size. `kw` is mono 700 orange.
- **Timeline:**
  - `pre` types over the 4 frames before `t0`.
  - `kw` appears exactly on frame `t0`, scaling from 1.04 to 1 over 4 frames.
  - `post` types from f4 at 2 characters per frame.
  - Exit at `t1`: backspace right-to-left over 6 frames (or `fade`: 5 frames, 14 px lift).
- **Style:**
  - `outline`: solid for f0–2, then the fill fades to an outline by f11 (v3 StageKeyword).
  - `solid`: stays filled.
  - `ghost`: outline only, for S3 round 2.
- **Knockout:** a dark knockout behind the text by default.
- **Anomaly:** jitter above 0.3, corrupted pre and post above 0.4, a doubled orange outline above 0.5.
- **Helpers:** `kwMetrics(pre, kw, post, size)` and `kwFit(pre, kw, post, maxW)` (largest size that fits).

## Grid: shell/Grid.tsx

**`<Grid a? visible? reach? bend? every? center? ripples? hi?/>`**
- A canvas of 60 px spacing with 2 px dots in gridHi. Pass `hi={() => false}` for the dimmer grid colour.
- Beat ripples every `every(t)` beats (default 2; 0 turns them off) from `center(t)` (default 960, 540), plus one-off `ripples`.
- `visible(t)` is opacity. `reach(t)` is a radial extent from 0 to 1 (use it for the outro).
- `bend(t)`: px of sine displacement (S3).
- Anomaly above 0.5: rows of dots slip sideways.

**The shared grid in FullMV2.** It is configured per section by the `GRID` export in `src/v4/sections/s<n>.data.ts`, which applies while that section owns the time (`sectionAt`). Every function prop takes absolute t. Example:

```ts
export const GRID: GridProps = {visible: (t) => prog(t, 1.5, 2.0), every: (t) => (t < 16 ? 4 : 2)};
```

## Collapse: shell/Collapse.tsx (for the S4 deletions)

**`<Collapse t0? box={[x, y, w, h]} residual=true lit?>{component}</Collapse>`**
- From `t0`: squash to a horizontal line (8 frames, inCubic), the line shrinks to a point (5 frames), and the orange point fades (3 frames).
- A 1 px dashed creamDim 0.25 residual outline stays where the box was.
- `lit`: the residual outline turns orange (for the final EXECUTION).
- `collapseState(t, t0)` exposes this geometry.

## LineArt: char/LineArt.tsx

**`<LineArt pose x y h|scale crop? mode='ink'|'sil'|'both' reveal? unreveal? pen=true silFill='ink'|'cream'|'orange'|'none' silOutline=true erase? shatter? clip? opacity inkOpacity flipX>`**

**Poses** (public/la, all present now):

| Pose | Source size |
|---|---|
| `stand`, `male`, `back`, `kneel`, `fall`, `sit` | 1024 × 1536 (portrait) |
| `face_sad`, `eye`, `hand`, `profile`, `face_defy` | 1672 × 941 (landscape) |

- Each pose is loaded once through fetch and image preload inside `delayRender`, then cached at module level.
- A missing pose falls back to `stand` with a `console.warn`.
- `preloadPoses('eye', 'hand')` loads poses early.

**Geometry**
- `x, y` is the top-left of the displayed (cropped) box. Size it with `h` (display px) or `scale` (display px per source px).
- `crop: [x0, y0, x1, y1]` is in source px. The PNG is 2× the source, so `scale ≤ 2` stays crisp (verified).
- `laBox(geom)` gives `{k, crop, W, H}`. `laMap(geom)(sx, sy)` maps source px to parent px, for anchoring leaders, pens, KwCode and so on.

**Behaviour**

| Prop | Effect |
|---|---|
| `reveal: [t0, t1]` | A mask of the stroke polylines (14 source px, round caps). Strokes are staggered by their cumulative length so the whole set finishes at t1. Each draws at ≥ 2500 px/s. An orange pen head follows the newest active tip. After t1 there is no mask at all. With a `crop`, only the strokes that touch the crop are scheduled, so a close-up still reveals across the whole [t0, t1]. |
| `unreveal: [t0, t1]` | The same, in reverse. |
| `mode='sil'` | A crisp vector `sil` path filled with `silFill`, plus a 2 px orange outline (non-scaling). On reveal the outline plots on and the fill fades in over the last 40 %. `'both'` puts the fill under the ink. |
| `erase: {t, poly? \| rect?, dur? = 6f, outline? = true}[]` | In source px. The hole grows from its centroid with an orange edge, then leaves a dashed creamDim residual outline. |
| `shatter: {t0, cells, seed?, stagger? = 0.025, dur? = 0.9, dist? = 360 display px, spin? = 50, reverse?}` | Seeded Voronoi cells over the stroke bbox. Orange cracks flash at t0. Cells nearest a seeded impact point fly first: they move outward, rotate and fade. `reverse` plays the flight backwards and assembles by t0 + total. |
| `clip: [x0, y0, x1, y1]` | Source rect; only this part is drawn. Use it for scan wipes (S2 F→M) and eye-opening wipes (S1 EXISTENCE). |

**Helpers**
- `usePose(name)` returns the record `{w, h, strokes, sil, d, len, bbox, …}`.
- `poseSize(name)` returns `{w, h}`: exact after loading, 1024×1536 before that.
- `strokePoints(name | rec, n, seed)` returns n points evenly spaced along the strokes in plotting order, in source px, for "points first" effects. It returns `[]` until the pose has loaded, so call `usePose` first in the same component.

**Cost:** the reveal mask, about 2700 polylines, is about 60 ms per frame. Shatter renders the image once per cell.

---

## Performance

Measured single-threaded with `remotion render --concurrency=1`, after removing about 9.5 s of bundle overhead:

| Content | Time per frame |
|---|---|
| UI-heavy Kit frames | ≈ 0.12 s |
| LineArt-heavy frames (2 reveals + shatter + crop) | ≈ 0.18 s |

Keep per-frame work proportional to what is visible. Build entry arrays at module level, not per frame, where you can; the layout cache is keyed by text, so per-frame arrays still work.

## Gotchas

- Components read time through `useT()`, so don't use `<Sequence>`. Gate rendering with `t` checks instead.
- Spark, Plot and the other v3 fragments need `<Layer>` or an `<svg>`.
- The Transcript `user` entry is not created automatically from the Composer. Push it with `t = send`.
- The standard transcript h = 820 overlaps the status line. Use about 790 while the status is shown.
- `a` defaults to the global anomaly curve: from 88.6 s every component starts to glitch unless you pass `a={0}`. Pass `a` explicitly where a clean element is wanted (lyric KwCode, for example).
- `CodeBlock` defaults to `a = 0`, unlike the other components.
- Text glyphs outside the fonts (✻ ⎿ ✓) render in a fallback font. Draw them instead.
