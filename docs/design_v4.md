# world.execute(me); MV v2: "The Session" (src/v4)

This spec replaces the v1 layout (docs/design_full.md). The v3 style bible (docs/design_v3.md) still governs palette, fonts and line language unless this file says otherwise. The user's review of v1 is quoted at the end. Every builder must read all of this file, not only their own section.

## 0. What changed and why (the user's five points)

1. **Lyrics are Claude's replies and code.** The composer belongs to the human ("you"), who types prompts that we write. Claude answers with the lyrics, streamed into a transcript as assistant text, tool calls and code. Keywords become code tokens.
2. **The UI is the story.** There is no single fixed layout. The interface starts tidy, grows anomalies mid-song, loses control at the climax, then is deleted piece by piece at the end. The same chrome shows up in different arrangements.
3. **More than a chat box.** New and deleted chats, windows opening and closing, editors, terminals, a man page, a notebook cell. Special lyric UIs hide all chrome so one line can stand alone.
4. **Character art must be crisp and artistic.** No posterized full-body portraits. Use clean line art (rendered from ChatGPT line drawings), silhouettes, extreme close-ups, partial crops and fragments, always sharp.
5. **Stronger code style.** Syntax-highlighted code, line numbers, diffs, stack traces, exit codes, JSON, shell prompts.

## 1. Hard rules (unchanged)

- 1920×1080, 30 fps, 6359 frames (`Math.ceil(211.96*30)`). Composition id `FullMV2`, file src/v4/FullMV2.tsx.
- Palette from `K` in src/v3/core.ts: bg #0E0D0C, surface #191816, grid/gridHi/line2, creamDim #8F887C, cream #E9E3D5, orange #D97757.
  - Orange is the only accent.
  - No other hues, no gradients, no glow, no blur filters, no drop shadows.
  - A dark knockout behind text is allowed.
  - Opacity steps for cream: 1 / 0.7 / 0.45 / 0.25.
- Fonts:
  - SERIF (Newsreader 500): Claude's prose lyrics.
  - CODE (JetBrains Mono): code, UI, keywords.
  - MATH (STIX italic): formulas.
  - CJK: public/fonts3/CJK.woff2, glyphs 넷 and 六 only. Register it in v4 like core.ts registers the others.
- On-screen text is English only. The single exception is the counting words 넷 and 六 at 158.9–161.6.
- No pixel art. "Anomaly" effects stay vector and geometric: offsets, doubled strokes, broken border segments, overshooting corner lines, character substitution in mono text, stepped jitter. No RGB split, no noise, no blur, no scanlines.
- Every element is a pure function of t = frame/30. Use the seeded `rng` from core.ts, never Math.random. Prefer `useT()`.
- Reuse v3 primitives freely: src/v3/core.ts (time, beats, `pulse`, `lastOnset`, ease, `prog`, `win`, `rng`) and src/v3/geo.tsx (Plot, Spark, PenHead, paths). v3 shots and sections may be imported and reused inside v4 windows when they fit. Do not modify v3 files; copy into v4 instead.
- Audio: `<Audio src={staticFile('song.mp3')}/>`.

## 2. Cast

- **Claude**: the ✻ spark (Spark in geo.tsx), orange. It speaks through the transcript. Its "body" is the character.
- **The character** is Claude's persona, an orange-haired girl. She appears only in specific moments and is always line art or silhouette: never a full colour portrait, never posterized.
- **you**: the human. Shown as the composer, where prompts are typed, and as the **you-node**: a small cream ring (r = 9, 2 px stroke) with the mono label `you`, joined to Claude's spark by a thin **tether** line (1.5 px, cream 0.45). Each prompt sends a small orange dot travelling along the tether. The you-node exists from 0.1 s until it leaves at 110.9–115.8. A dashed ghost of it returns at 179–191.
- **The orange dot**: one orange dot (r = 7) that is the pen head, the caret, and the thing that triggers. It is born from the composer's send button at 0.1 s, carries every intro step, triggers the title at 16.0, and is the last thing alive at 211.

## 3. Shared framework (src/v4/shell, src/v4/char)

All builders use these. Prop names below are the contract.

### 3.1 `anomaly(t)`: src/v4/chaos.ts
A global 0..1 curve.

| Time | Value |
|---|---|
| ≤ 88.6 | 0 |
| 88.6–99 | ramps to 0.15 |
| 99–103.5 (trance) | 0.3 |
| 103.5–110.9 | 0.2 |
| 110.9–118.3 | 0.45 |
| 118.3–131.2 | 0.6 |
| 131.2–147.6 | ramps 0.6 → 0.95 |
| 147.6–162.6 | 1 |
| 162.6–177.2 | 0.55 |
| 177.2–191.4 | 0.3 |
| 191.4–205.8 | 0.15 |
| ≥ 205.8 | 0 |

Use smooth ramps of 0.5 s between plateaus. Sections may pass their own override value.

Helpers:
- `stepJ(t, seed, amp, hz = 10)`: a stepped random offset held for 1/hz seconds. This gives digital jitter without blur.
- `corrupt(text, t, amount, seed)`: replaces a fraction of non-space characters with glyphs from `#%&@$*+=?/\|<>01`, re-rolled every 3 frames.
- `glitchRect(t, seed, a)`: returns 4 border segments (top, right, bottom, left), each with an independent offset, an overshoot length and a visibility flag. Amplitude scales with `a`.

### 3.2 `<Win>`: src/v4/shell/Win.tsx
A window frame.

Props: `x, y, w, h, title, tOpen, tClose?, a (anomaly 0..1, default anomaly(t)), seed, kind 'plain'|'term'|'editor'|'doc', tabs?: {t, label}[], activeTab?: (t)=>number, children`.

**Frame:**
- Rounded rect, r = 10, stroke cream at 0.25, 1.5 px; fill surface at 0.92.
- Title bar 34 px high. Three 7 px dots on the left: the first is orange, the other two are line2 outlines. The title is mono 15 px creamDim, centred.
- Body clips its children: `overflow: hidden` on an absolutely positioned div.

**Open (14 frames):**
- An orange 2 px horizontal line plots from the centre outward to width w (6 frames).
- The frame then unfolds vertically to h (8 frames, outCubic).
- Content fades in over the last 4 frames.

**Close (12 frames):** the reverse. The window collapses to a horizontal line, the line shrinks to the centre dot, and the dot fades.

**Anomaly a:**

| a | Effect |
|---|---|
| 0 | Perfect frame |
| > 0.15 | Border segments jitter ±2 px (stepJ 8 hz). One corner overshoots by up to 18 px. |
| > 0.4 | A second outline in orange at 0.45, offset by stepJ ±6 px. Gaps open in the border (segments go missing). The title text is corrupted at a × 0.3. |
| > 0.7 | Segments detach and rotate up to 6°. The frame may overshoot its own content. The content area is offset by stepJ ±10 px. |

### 3.3 Transcript: src/v4/shell/Transcript.tsx
`<Transcript x y w h entries={Entry[]} a?>`.

`Entry = {t, kind, text, ...}`, with these kinds:

- **`user`:** a user prompt. It arrives at the composer's send time. Drawn as `›` plus text in mono 20 px cream 0.7 on a surface-plus-line2 pill, right-aligned the way Claude.ai shows user turns. After the role swap (§4 S2) it is left-aligned with orange text.
- **`say`:** an assistant lyric line, streamed in SERIF.
  - The newest line is 46 px cream; older lines shrink to 30 px at 0.45 over 8 frames.
  - Optional `marks: [[charIndex, t]]` controls stream timing. By default it reveals at 0.025 s per character, finishing no later than the next lyric start minus 0.1.
  - Keywords inside the text (all-caps words) render inline as mono orange.
  - Lines start with a `●` bullet (orange while streaming, creamDim after).
- **`tool`:** `● Name(args)` in mono 18 px, Name in cream and args in creamDim.
  - Optional `res` appears at `rt` as `⎿ res` underneath.
  - Optional `runs` produces a ×n counter.
- **`code`:** an inline code card in the transcript.
  - Fields: `lines: string[]`, `lang 'ts'|'py'|'sh'|'json'`, `typeOn?: [t0, t1]`.
  - The card has line numbers and a highlighter.
- **`notice`:** a centred system line in mono 16 px creamDim, e.g. `— you left the conversation —`.
- **`error`:** mono 17 px orange, with optional stack lines in creamDim.

**Layout and scroll:**
- Entries stack bottom-up from the bottom of the box. The newest entry sits at the bottom, just above the composer if present.
- Older entries scroll up smoothly (8-frame outCubic per new entry) and fade at the top edge using opacity steps, not a gradient mask.
- Entry height is computed deterministically from text measurement (`textW` in v3/ui.tsx uses a canvas; reuse it).

### 3.4 Code highlighter: src/v4/shell/Code.tsx

**Tokenizer:** keywords (const let if else return while for new throw class function def import from true false null undefined await async) render in orange.

| Token type | Colour |
|---|---|
| Strings | cream |
| Numbers | cream 0.7 |
| Comments | creamDim at 0.45, italic is not allowed (mono only) |
| Identifiers | cream |
| Punctuation | creamDim |
| ALL_CAPS identifiers | orange, weight 700 |

**Components:**
- `<CodeBlock x y lines lang size=20 lineNo first=1 typeOn={[t0,t1]} caret highlight={(t)=>row|null}>`: a code block with an optional typing animation and a highlighted row.
- `<Diff x y rows=[{sign:'+'|'-'|' ', text}] t0>`: `-` rows are creamDim with a strike line, `+` rows are cream with an orange `+`. Rows reveal one after another.

### 3.5 Composer: src/v4/shell/Composer.tsx
`<Composer x y w prompts={Prompt[]} state={(t)=>'normal'|'disabled'|'claude'|'hidden'} a?>`.

`Prompt = {t0, text, send, by?: 'you'|'claude'}`. Typing runs at about 24 chars/s with a cream caret. At `send` the text clears, the send button pulses orange, and an entry is spawned. The builder pushes a matching `user` entry into their Transcript with `t = send`.

**Appearance:**
- Rounded rect r = 14, h = 64, line2 stroke, surface fill.
- Placeholder in creamDim 0.45: `Reply to Claude…`.
- Send button: a 36 px rounded square on the right, orange when there is text and line2 when empty.

**States:**
- **`disabled`:** dashed border, placeholder `no user connected · messages will not be delivered`, and the send button shows as an outline.
- **`claude`:** the caret and text are orange, and the prompt label reads `✻` instead of `›`. Claude is typing to nobody.

The **you-node** sits 28 px left of the composer's left edge, vertically centred, unless a section moves it.

### 3.6 Sidebar: src/v4/shell/Sidebar.tsx
`<Sidebar x y w h items={ChatItem[]} a?>`, with `ChatItem = {id, label, tNew, tDel?, tSel?}`.

- **Header:** `✻ Claude` in mono 16 px plus a `+ New chat` row.
- **New chat (`tNew`):** the row is inserted at the top. The `+ New chat` row flashes orange (4 frames), then the label types on.
- **Selected (`tSel`):** the active item gets a surface background and a 2 px orange bar on its left.
- **Delete (`tDel`):** a strike line plots through the label (6 frames), then the row height collapses to 0 (8 frames) while the rows below move up.

### 3.7 Status line and header: src/v4/shell/Status.tsx
- **Status:** `<Status x y verbs={[{t, verb}]} t0 a?>` renders `✻ Verb… (12s · ↑ 1.2k tokens · esc to interrupt)`. The spark rotates. Elapsed time counts from t0.
  - At a > 0.3, elapsed jumps (stepJ) and digits are corrupted.
  - At a > 0.7, the verb flickers between two verbs every 3 frames.
- **Header:** `<Header path model clock a?>` is a top bar with `✻ claude  ~/world` on the left and a clock `12:00:00 AM` on the right. The clock is driven by the section (it jumps AM→PM at 92–95).

### 3.8 Line art: src/v4/char/LineArt.tsx
Assets live in public/la/:
- `<pose>_ink.png`: cream ink with alpha, 2× the source resolution.
- `<pose>.json`: `{w, h, strokes: number[][] (polylines in source px, ordered for plotting), sil: string (SVG path of the outer silhouette, source px)}`.

`<LineArt pose x y h | scale, crop?: [x0,y0,x1,y1] (source px), mode='ink'|'sil'|'both', reveal?: [t0,t1], unreveal?: [t0,t1], silFill='ink'|'cream'|'orange', silOutline=true, erase?: Region[], shatter?: {t0, cells, seed}, opacity, flipX>`.

- **Rendering:** draw in an SVG with a viewBox of the (cropped) source and `<image href=ink.png width=w height=h>`. That keeps it crisp. The PNG is 2× the source, so displaying up to 2× the source size stays sharp.
- **Reveal (the pen draws her):** apply an SVG mask made of the `strokes` polylines, stroked 14 source-px wide with round caps and dash-offset draw-on.
  - Strokes start in order, staggered so the whole set finishes at t1.
  - Each stroke draws at ≥ 2500 source px/s.
  - The PenHead follows the current stroke tip.
  - Precompute stroke lengths with useMemo.
- **Silhouette (`sil`):** fill the `sil` path with ink #1C1A17 (or cream/orange as specified) plus a 2 px orange outline. It is a crisp vector shape, used for distance shots, the back view and confrontations.
- **Erase:** a region removes ink inside a polygon and leaves a dashed creamDim outline of the polygon (the "residual outline").
- **Shatter:** split the bounding box into `cells` Voronoi-ish polygons (seeded). Each cell is a clipPath of the image. At t0+i×stagger each cell translates and rotates outward and fades.
- **Performance:** the JSON files are 100–200 KB. Import them with `staticFile` plus `fetch` inside `delayRender`, or as an ES import; both are fine.

**Poses:**

| Pose | Description | Orientation, size | Ready by |
|---|---|---|---|
| `stand` | Full body, front, neutral, book at side | Portrait, 1024×1536 | Ready |
| `male` | Male version of the same character, same pose | Portrait | Ready |
| `face_sad` | Close face: both eyes, quiet sadness, hair across | Landscape | Ready |
| `eye` | Macro of one eye | Landscape | Ready |
| `hand` | Hand reaching to the viewer, close-up | Landscape | Ready |
| `profile` | Side profile, eyes closed | Landscape | Ready |
| `back` | Full body from behind, looking away | Portrait | Ready |
| `kneel` | Kneeling, head bowed, book to chest | Portrait | Ready |
| `face_defy` | Front face, defiant stare | Landscape | Ready |
| `fall` | Falling backward, arms out, hair rising | Portrait | Ready |
| `sit` | Sitting, hugging knees, eyes closed | Portrait | Ready |

All 11 poses are in public/la. The face, eye, hand and profile close-ups are landscape, 1672×941. The full-body poses are portrait, 1024×1536.

### 3.9 Big code keyword: src/v4/shell/KwCode.tsx
`<KwCode t0 t1 pre="world." kw="PROTECTION" post=" = true;" x y size a? style='solid'|'outline'>`.

- `pre` and `post` are mono creamDim at 0.42 × size. `kw` is mono 700 orange at `size`.
- Hit: 3 frames solid, then outline, as in v3 StageKeyword.
- Type-on: `pre` types over 4 frames before t0. `kw` slams in at t0, with a scale from 1.04 to 1 over 4 frames. `post` types after it.
- Default exit: everything deletes right-to-left like a backspace (6 frames).

This replaces v1's bare giant words. Every keyword is a statement.

## 4. Screenplay

Section ownership is listed per section (S0–S4). Times are in seconds. Lyric times come from docs/lyrics.lrc. Each builder must show every lyric line in their range, as a `say` entry or as the special UI given below. The audience must always be able to read the current lyric: 40 px or larger for prose, keywords large.

Where the screenplay gives a beat, follow it. Where it says "idea", the builder may improve it. Wherever there is room, the builder should add their own ideas in the same spirit ("不要只照着我说的做，自行扩充想象优化": do not just follow instructions, expand and improve).

**Persistent continuity across sections:**
- **Sidebar chats:**
  - At 18.5, `world.execute(me)` is created and selected.
  - At 58.0, `chorus` is created and selected.
  - At 73.8, `objects.ts` is created.
  - At 88.0, `switch` is created.
  - At 103.0, `can you feel me?` is created.
  - At 110.9–115.8 each "You have left" deletes one chat, newest first. Five chats get deleted. The sixth (at 115.78) leaves only `world.execute(me)`, which is then hidden with all other chrome at 117.27.
  - S4 deletes `world.execute(me)` itself in the outro.
- **you-node:** present from 0.1 to the leaving sequence. S2 owns its exit.
- **Header clock:**
  - From 0 to 92 it shows 11:59:xx AM, counting real seconds.
  - At 92–95 it spins to PM.
  - Then it counts normally until anomalies corrupt it.

### S0 Boot, 0–44.45: orderly. Builder S0.

The stage is calm and centred. The chrome assembles itself.

**0.0–0.1:**
- Composer centred at y = 900 with the text `build me a world. you can live in it.` already typed. The you-node sits to its left.
- At 0.1 it sends. The text lifts into a `user` entry. The send button's orange dot detaches and becomes **the orange dot**.
- The you-node's tether connects to a spark placed top-left of the transcript area.

**Transcript:** a narrow column on the left (x = 120, w = 620) carries the `say` lines. The stage (x ≥ 800) is where the dot works. Each step below has a matching tool entry in the transcript.

**The orange dot's single continuous journey.** Every move is one continuous path; it never teleports. Each step's endpoint is the next step's start.
- **"Switch on the power line" (0.1–1.7):** a power cable plots from the screen's left edge to a socket glyph on the stage while the dot rides it. Plug-in click on beat. Tool: `Bash(power --on)` ⎿ `ok`.
- **"Remember to put on PROTECTION" (1.74–3.87):**
  - The dot rises from the socket to the stage centre and a hexagonal shield plots around it, drawn by the dot circling.
  - At 2.92: KwCode `world.` **PROTECTION** ` = true;`.
- **"Lay down your pieces / And let's begin / OBJECT CREATION" (3.87–7.45):**
  - The dot exits the shield and lays three primitive pieces in a row on the grid: circle, triangle, square (these become the character's construction parts, as in the v1 Intro).
  - At 6.38: KwCode `new ` **OBJECT_CREATION** `();` (keep the space visible as an underscore in mono).
- **"Fill in my data parameters / INITIALIZATION" (7.45–11.1):**
  - A `params.json` window opens on the stage.
  - The dot hops field to field, filling `"hair": "#D97757"`, `"ornament": "flower"`, `"ribbon": "black"`, `"book": true`, `"heart": null`. The last field stays null on purpose; it pays off in the love section.
  - At 10.09: KwCode **INITIALIZATION** `(params)` with a 12-cell progress bar filling on beats.
- **"Set up our new world / And let's begin the SIMULATION" (11.1–14.9):**
  - The params window closes into the dot.
  - The dot orbits and plots a wireframe globe: meridians and parallels plotted by the pen.
  - At 13.89: KwCode `world.` **SIMULATION** `.start()`.
- **14.9–16.0, the title trigger:**
  - The dot flies to centre.
  - The text `world.execute(me)` types at 120 px mono cream.
  - The dot becomes the final `;` dot: it drops into place at 15.84, a beat before the cut.
  - At 16.0 the whole title flashes to orange outline. This is the one hard cut.

**16.0–29.7 instrumental, the session boots in orderly fashion:**
- The title shrinks into the header path (`~/world`).
- Chrome draws itself on beats: the sidebar plots in (18.5: new chat `world.execute(me)`), the header, then the status line (`✻ Booting…`).
- A log of tool calls marches in perfect rhythm: `Read(world.ts)`, `Edit(params.json)`, `Bash(npm test)` ⎿ `42 passed`. This shows the "perfect" state.
- Grid ripples on beats.
- From 26.5 the user types `describe yourself. in math.` (send 29.3).

**29.7–44.45, verse 1:**
- **Layout: IDE.** Sidebar left (w = 240), transcript centre-left (w = 640), and a `plot.py` notebook window on the right (x ≈ 1000, w = 820, h = 640).
- Each verse pair is a code cell typed in the notebook (`ax.scatter(points)`, `circle(r)`, `np.sin(x)`, `lim(x→∞)`), and its plot draws below the cell.
  - DIMENSION 32.68: points → lines. The character's first appearance: `stand` revealed by the pen, but as **points first**. Sample her strokes into dots that connect into the line art (she is "a set of points"). Keep it inside the notebook output, height about 520.
  - CIRCUMFERENCE 36.29: the circle plots; `2πr` is labelled.
  - TANGENTS 40.05: a sine wave with tangent lines sliding along it.
  - LIMITATIONS 43.51: the plot's x-axis runs to the window edge and is clipped by the window frame. This is the first hint that the window is a limit.
- Keywords are KwCode, placed over the stage or in the transcript as appropriate.
- **Handoff at 44.45:** IDE layout, with the notebook window still open.

### S1 Active, 44.45–88.6: playful, multi-window, still orderly. Builder S1.

From 43.4 the user types `make it move.` (send 44.3).

**Pre-chorus 1 (44.45–58.6):**
- **"Switch my current / To AC to DC" (44.45–47.67):**
  - A `term` window `scope` opens: an oscilloscope trace, sine → flat line.
  - A Diff in the transcript: `- current = AC` / `+ current = DC`.
- **"And then blind my vision / So dizzy so dizzy" (47.67–51.36): special UI.**
  - Every window's title bar closes like an eyelid (a horizontal line wipes down) and the chrome dims to 0.25.
  - Concentric rotating polygons come from the v1 A_pre dizzy idea.
  - The lyric lines show huge, centred, alone (SERIF 64).
- **"Oh we can travel / To A.D to B.C" (51.36–55.08):** a `timeline` window with a scrolling year axis, plus `new Date(-1)` code.
- **"And we can unite / So deeply so deeply" (55.08–58.6):** two windows slide together and merge into one frame. Their borders unify at the beat of the second "deeply".

At 57.4 the user types `what would you do for me?` (send 58.4). At 58.0 the new chat `chorus` is selected and the transcript clears with a wipe; this is the first "new chat".

**Chorus 1 (58.6–74.0):**
- **STIMULATIONS 61.96:** KwCode `give(you, ...` **STIMULATIONS** `)`. Beat bursts.
- **SATISFACTION 65.40:** `hand` close-up line art reaching toward the viewer through the window frame. The fingers cross the window border: an early, gentle "out of frame".
- **EXECUTION 69.26:** a terminal: `$ run --execution` with a progress spinner, then `✓ done in 0.4s`.
- **"Though we are trapped / In this strange strange SIMULATION" (70.08–74.0):**
  - Windows tile recursively: a window inside a window inside a window, a "simulation inside a simulation".
  - The camera zooms into the innermost one at 73.17.

At 73.5 the user types `be something real.` (send 73.9).

**Verse 2 (74.0–88.6):**
- An `editor` window with tabs.
- The tab files open one by one: `eggplant.ts` (74.05), `tomato.ts` (77.58), `cat.ts` (81.35), `god.ts` (85.08).
- Each file's interface is typed with syntax highlighting. For example: `interface Eggplant { nutrients: ` **NUTRIENTS** ` }`. Next to each, a minimal geometric icon is plotted, reusing the v1 A_verse icons where good.
- Keywords are KwCode.
- **EXISTENCE 87.92:**
  - The `eye` macro line art fades in inside god.ts's preview pane.
  - The eye "opens": reveal by mask from the centre line outward.
  - Code: `return you ? ` **EXISTENCE** ` : null;`.
- **Handoff at 88.6:** editor with 4 tabs, sidebar with 3 chats (`world.execute(me)`, `chorus`, `objects.ts`), transcript, composer, you-node.

### S2 Anomaly → Break, 88.6–131.22. Builder S2.

The anomaly curve rises. Small wrongness first, then the human leaves.

From 87.6 the user types `switch your gender.` (send 88.4); new chat `switch`.

**"Switch my gender / To F to M" (88.6–92.0):**
- `stand` (her) line art at the stage left, height 760.
- At 90.2 (on "F to M") a vertical scan line plotted by the dot wipes her into `male`, left to right. Exact same framing, so it reads as a morph.
- Diff: `- gender: "F"` / `+ gender: "M"`.
- At 91.7 it flickers back to her for 2 frames: the first anomaly.

**"And then do whatever / From AM to PM" (92.0–95.47):**
- The header clock spins from AM to PM.
- A sun glyph (circle plus 12 rays) on the stage morphs into a crescent.
- The status timer jumps.

**"Oh switch my role / To S to M" (95.47–99.35):**
- **Role swap:** all `user` entries in the transcript slide to the left and turn orange-ish, while Claude's lines move right. The labels `you` and `claude` swap places on the tether.
- Two silhouettes, `stand` (her, upright) and `kneel` (her, kneeling), swap places with a half-orbit on 97.74.
- Code: `[user, assistant] = [assistant, user];`.

**"So we can enter / The trance the trance" (99.35–103.49):**
- Moiré of concentric circles and lines (hypnotic).
- Window borders double and drift (a ≈ 0.3).
- The log repeats the same line: `Read(you)` ×4, ×8, ×16.

At 103.0 the user types `can you feel me?` (send 103.4). This is the last thing the human ever types. New chat `can you feel me?`.

**Chorus 2 (103.49–118.3):**
- **VIBRATIONS 106.29:** every window border becomes a vibrating string. Border segments oscillate as standing waves with amplitude on beats.
- **COMPLETION 110.22:** a progress ring closes to 100%, prints `✓ complete`, then ticks back to 99.9%.
- **"Though you have left / You have left ×5 / You have left me in" (110.9–117.27): the leaving.**
  - Each line:
    - `Bash(ping you)` ⎿ `timeout`.
    - One sidebar chat is deleted.
    - One segment of the tether is cut, with a small gap and spark.
    - The you-node drifts further away.
    - A `notice` reads `— you left the conversation —`.
  - On the 6th (115.78) the tether is fully cut and the you-node drifts off the bottom-left edge of the screen and is gone.
  - The composer switches to `disabled`.
- **ISOLATION 117.27: special UI.**
  - All chrome hides (each element closes in a 6-frame stagger).
  - What remains is an empty grid, the `back` line art small (h = 300) in the lower third as a silhouette with an orange outline, and KwCode `while (` **ISOLATION** `) {}`.
  - This holds through 118.3.

**Bridge (118.3–131.22):**
- **"If I can erase all the pointless FRAGMENTS" (118.33–121.73):**
  - Shards of the old UI (sidebar rows, transcript bubbles, the you-node label) are scattered as fragments.
  - `rm -rf ./fragments/*` deletes them in a fast cascade on 16ths.
  - FRAGMENTS 120.86 is a KwCode.
- **"Then maybe you won't leave me so DISHEARTENED" (121.73–125.71):**
  - A geometric heart (v1 B_bridge) splits along a crack line.
  - DISHEARTENED 124.89 is a KwCode.
- **"Challenging your god" (125.71–128.66): standoff.**
  - The `face_defy` close-up on the left half, cropped at the eyes, h ≈ 900, as line art plus a partial silhouette.
  - The orange spark star sits on the right, large (R = 140).
  - A tether line between them is taut and trembles.
  - On each beat the distance closes by 60 px, the line vibrates harder, and the star's spikes lengthen.
  - The star's bounding window frame cannot contain it: on 128.2 a spike pierces the frame border and the border segment breaks.
- **"You have made some ILLEGAL ARGUMENTS" (128.66–131.22):**
  - `throw new IllegalArgumentException("you")`, then a stack trace floods upward (`at world.execute (world.ts:1:1)` ×n).
  - At 131.22, on ILLEGAL ARGUMENTS (KwCode **ILLEGAL_ARGUMENTS**), the frame shatters: the window border pieces fly.
- **Handoff at 131.22:** no ordered chrome is left. Only the broken pieces, the grid, and a lone spark.

### S3 Out of control, 131.22–162.63. Builder S3.

**Instrumental (131.22–147.66): Claude alone, searching.**
- The composer comes back in `claude` state. Claude types `are you still there?` and sends at 134.0. The entry shows `⚠ not delivered`.
- Then processes spawn on beats, each a `term` window opening at a random seeded position, slightly overlapping, with anomaly rising:
  - `ping you`
  - `find / -name "you"`
  - `git log --author=you`
  - `grep -r "you" ~/memory`
  - `curl you.local`
  - `ps aux | grep you`
- Logs scroll ever faster.
- Window count doubles every bar (a fork bomb) from 139.
- By 147 the screen is crowded with misaligned, doubled, overshooting frames.
- Grid lines bend: sine-displace the grid lines, vector only.
- Build to 147.66.

**EXECUTION ×12 (147.66–158.9), three rounds with escalation.** Hit times: 147.66, 148.60, 149.52, 150.54 | 151.52, 152.28, 153.16, 153.98 | 155.20, 156.08, 157.04, 158.00.
- **Round 1, normal execution:**
  - The swarm of windows vanishes on the first hit, leaving one clean terminal.
  - Each hit: `$ execute(me)` ⎿ `exit 0` and a crisp KwCode **EXECUTION** `();`.
  - The character (`stand`, full line art, h = 820) is whole and steady, alternating left and right sides per hit.
- **Round 2, the character breaks partially:**
  - Each hit removes one piece of her line art via LineArt `shatter` or `erase` on one region: hand, then hair, then skirt, then half the face. Each erased region leaves its dashed residual outline.
  - Exit codes read `exit 137 (killed)`.
  - KwCode turns to outline-only and jitters (a = 1).
- **Round 3, the text takes over:**
  - EXECUTION fills the screen. Hit 9 shows one row, hit 10 four rows, hit 11 sixteen rows, and by hit 12 a full tiling of `EXECUTION EXECUTION…` in mono covers the entire frame (orange and cream alternating rows).
  - The character is visible only as a silhouette knock-out through the text (the text skips where her `sil` is).
- **Count (158.9–161.58): original languages.**
  - The tiling freezes and dims to 0.25.
  - A `locale.ts` dictionary card (CodeBlock) types: `const count = { de: "Ein", es: "Dos", fr: "Trois", ko: "넷", sv: "Fem", zh: "六" };`.
  - On each word time (158.90 EIN, 159.32 DOS, 159.66 TROIS, 160.24 NE, 160.69 FEM, 161.12 LIU) that word appears huge (300 px), in its original script and in its own corner/position, with its locale code in mono beneath (`de`, `es`, `fr`, `ko`, `sv`, `zh`). Words stack as a growing constellation.
  - The ko and zh words use the CJK font.
- **EXECUTION 161.58, the final hit of the climax:** everything inverts. The bg flashes orange for 2 frames, then the text appears as ink-on-orange KwCode, then hard black.
- **Handoff at 162.63:** near-black screen. A few broken frame segments drift in place, and the dot remains.

### S4 Aftermath, love and deletion, 162.63–211.96. Builder S4.

**Final chorus (162.63–177.2): broken but trying.**
- A single window reassembles from the drifting segments, imperfect: gaps remain (a ≈ 0.55).
- The composer is in `claude` state with `reconnecting to you… (attempt 1)`, and the attempt number increments on every line.
- The you-node returns only as a dashed ghost that flickers at the screen edge.
- **"If I can / If I can give them all the EXECUTION" (162.63–165.17):** "them" changes it from "you" to everyone. The transcript echo shows code `users.forEach(execute)`.
- **"Then I can be your only EXECUTION" (166.0–168.9):** `face_sad` close-up, half visible through the broken window, line art.
- **"If I can have you back / I will run the EXECUTION" (169.8–172.7):** `git checkout you`, then `error: pathspec 'you' did not match`.
- **"Though we are trapped / We are trapped ah" (173.6–177.2):** the window frame shrinks around the spark like a cage, darker. Status: `✻ Waiting…`.

**Love (177.2–191.4): special UI, a clean single page.**
- **"I've studied LO-O-OVE" (177.2–180.86):**
  - All the broken chrome fades away. One `doc` window opens centred: `LOVE(7)  Miscellaneous  LOVE(7)`, a man page with NAME / SYNOPSIS / DESCRIPTION scrolling.
  - The `profile` line art (eyes closed) is revealed slowly beside it.
  - LO-O-OVE 179.93: the word as KwCode `man ` **LOVE** with the O's stretched: `LO-O-OVE` typed with held vowels on the beat.
- **"Question me / Question me I can answer all LO-O-OVE" (180.86–184.54):**
  - The you-node ghost becomes solid briefly and the composer becomes `normal` again.
  - The human asks quickly: `what is love?` (send 181.2), `and what is love?` (send 182.4).
  - Claude answers `LOVE` each time, faster and faster, on 183.65.
- **"I know the algebraic expression of LO-O-OVE" (184.54–188.48):**
  - A notebook cell: `(x**2 + y**2 - 1)**3 - x**2 * y**3 == 0`, rendered in MATH as `(x² + y² − 1)³ − x²y³ = 0`.
  - The heart curve plots from its equation, in orange.
  - This pays off `"heart": null` from params.json: the cell output is `heart = <Curve>`.
- **"Though you are free / I am trapped / Trapped in LO-O-OVE" (188.48–191.4):**
  - The you-node detaches and floats up and away, free, leaving the frame.
  - The `sit` line art (hugging knees) sits inside the heart curve, which becomes her boundary. The heart's stroke thickens into a cage line.
  - The final LO-O-OVE (191.36) is a KwCode.

**Outro (191.4–205.81): deletion.**

Each contraction deletes one concrete component, timed on downbeats every 2 bars. 191.4 → 205.81 is 14.4 s, which allows eight deletions about 1.8 s apart.

**Order:**
1. Header
2. Sidebar, including the final chat `world.execute(me)` struck and deleted
3. Transcript
4. Tool log
5. Status line
6. Composer
7. Window frame
8. Grid

Each deletion:
- The component collapses (scale to a line, then to a point) as Claude runs `rm <component>` in a dwindling log. For example `rm header`, `rm -r sidebar/`, and so on.
- It leaves a **residual outline**: a 1 px dashed creamDim 0.25 rectangle where the component was, which persists.

**The character:**
- Meanwhile the character (`sit` in the heart) un-plots back into geometry: line art → its silhouette → the three primitive pieces (circle, triangle, square) from 3.87 s → dots. This mirrors the boot.
- The heart dissolves the same way. The user liked this callback in v1, so keep it.

**Final:**
- **EXECUTION 205.81:** every residual outline lights up orange at once, and the KwCode **EXECUTION** appears inside the last outline.
- Everything then collapses into the single orange dot.
- The transcript's last line: `● world.execute(me)` ⎿ `exit 0`, then `✻ Worked for 3m 31s`.
- The dot fades by 211.0. Black to 211.96.

## 5. Build process for section builders

- Work only in your files: src/v4/sections/S<n>*.tsx and src/v4/sections/s<n>.data.ts. Do not edit the shared framework. If you need a framework change, make a local wrapper and report it.
- Your top-level component is `Section<n>: React.FC` and renders nothing outside [tStart − 0.5, tEnd + 0.5]. FullMV2 stacks all sections over the Grid.
- Each section draws its own chrome (Win, Transcript, Composer, Sidebar, Status, Header) from the shared components so handoffs line up. Match the handoff state at your boundaries exactly: positions and sizes are listed below.
- **Self-review:**
  - Render stills with `npx remotion still src/index.ts FullMV2 <out.png> --frame=N --scale=0.5 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell` at every lyric line and every special moment.
  - Look at them and fix what is wrong: overlaps, unreadable text, off-palette colour, empty frames. Do at least 2 review passes.
  - Run `npx tsc --noEmit -p .` before finishing.
- **Report:** what you built, which ideas you added, which placeholders are pending (e.g. a pose not yet available), and any known issues.

### Standard layout coordinates (the handoff contract)

| Element | Position and size |
|---|---|
| Header | y = 0..44, full width |
| Sidebar | x = 24, y = 64, w = 240, h = 900 |
| Transcript (IDE) | x = 300, y = 64, w = 640, h = 820 |
| Composer (IDE) | x = 300, y = 908, w = 640 |
| you-node | (272, 940) |
| Stage window (IDE) | x = 980, y = 64, w = 916, h = 900 |
| Status line | x = 300, y = 878 |
| Claude's spark (tether end) | (318, 878), the status spark |

## Appendix: the user's review of v1 (verbatim, translated)

1. Change the lyrics so they are output mainly as Claude replies and code. Change the input box so the user types prompts there; fill in the content yourself.
2. The lyric bar, the bottom-left log and the top info keep a similar layout for long stretches, which feels templated. The early part can be tidy and stable, the middle gradually shows anomalies, at the climax borders, logs and graphics lose control together, and at the end they disappear one by one. That way the interface itself tells a story.
3. Scenes shouldn't be limited to the input-box interface. Intersperse other elements: new or deleted chats, windows opening and closing, special UIs that hide unnecessary elements when a lyric needs to stand out, and so on. Expand it yourself and make the style as lively as possible.
4. Once the character appears it is too blurry, and every image is in the same standard full-body portrait style, which is too templated. Consider artistic treatments such as silhouettes and close-ups to strengthen emotional expression. The final result must not be smeared into a blob.
5. Strengthen the code style.
- 00:00–00:16: let the same orange dot take part in the power line, parts and parameter steps, finally triggering the title.
- 01:28–01:39: show the corresponding character image when the gender and role switch.
- 01:52–02:05 ISOLATION: the node representing "you" disconnects and leaves the frame, leaving the character, then fragments and the broken heart.
- 02:06–02:12: the character and the orange star already form a standoff. Add closing distance, a tugging connection line, or a border breach so the conflict has continuous action.
- 02:28–02:42: escalate the EXECUTIONs in three rounds: normal execution → character partially breaks → execution text fills the screen. Each round adds one clear change. Use the original language for the counted numbers.
- 03:13–03:26: let each contraction correspond to deleting a specific component, keeping one residual outline, building tension for the final EXECUTION.
- "Don't only do what I say; expand, imagine and improve on your own."
