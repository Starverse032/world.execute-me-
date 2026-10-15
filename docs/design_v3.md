# world.execute(me); 0:00–0:46 style demo: "Plotted Session"

Design angle: dark terminal minimalism, adapted to the client's direction. Geometry is minimal and vector-only, nothing is pixel-like, and all on-screen text is English.

---

## 1. Concept

The whole demo is one quiet Claude Code session on a near-black canvas. Each sung line is typed into Claude's composer as a prompt. Claude then visibly executes it: a tool-call line appears, and a vector pen (a small orange dot) plots the result in thin cream lines, with Claude orange as the only accent.

Over the intro the program assembles an abstract object from six primitives: a circle head, arc hair, a line for the shoulders, a triangle dress and a rectangle book. It initializes the object's parameters and builds a wireframe world around it. When the prompt `world.execute(me);` is sent at 16.0 s, the object is rendered into the real girl. She then dissolves into a set of points, and those points become the verse's mathematics: point set, dimension, circle, sine, limit.

The video ends with the process exiting (`exit 0`) and the girl asleep inside a circle on the limit line.

---

## 2. Style system

### 2.1 Background and palette

| Token | Hex | Used for |
|---|---|---|
| `bg` | `#0E0D0C` | Full-frame background (warm near-black). No gradients, no texture. |
| `surface` | `#191816` | Composer fill, title/user bubble fill |
| `grid` | `#2A2824` | Background dot grid (brightens to `#34312C` after 12.61 s) |
| `line2` | `#45413A` | Composer border, bubble border, grid-ripple highlight |
| `creamDim` | `#8F887C` | Tool results (`⎿` lines), labels, secondary text, finished bullets |
| `cream` | `#E9E3D5` | Lyrics, primary text, all primary geometry strokes |
| `orange` | `#D97757` | The only accent: keywords, pen head, spark, send button, caret, running `●`, highlighted strokes |

Opacity steps for cream strokes are 100 / 70 / 45 / 25 %. Use no other values.

Character-only tokens (used only inside the processed character art, see §5):

| Token | Hex | Used for |
|---|---|---|
| `charCream` | `#DCD3C1` | Blouse, skirt white, boots, skin |
| `charShade` | `#A99F8C` | Folds and shadows on white |
| `orange` | `#D97757` | Hair, orange skirt panels, flowers |
| `orangeDeep` | `#A4553B` | Hair shadow, book, gold trims |
| `ink` | `#1C1A17` | Corset, ribbons, black skirt layer |

Orange budget: no more than about 8 % of frame area at any time. The only exception is the 3-frame keyword fill flash.

### 2.2 Typography (Google Fonts)

| Role | Family / weight | Size | Colour |
|---|---|---|---|
| Lyrics (in composer) | **Newsreader** 500 | 52 px, tracking −0.005em, typographic apostrophe `’` | cream |
| Keyword inline in lyric | **JetBrains Mono** 700, caps | 44 px, shares the lyric baseline | orange |
| Keyword (stage display) | **JetBrains Mono** 800, caps | `min(200, floor(1500 / (0.6 × chars)))`. Results: PROTECTION 200, OBJECT CREATION 166, INITIALIZATION 178, SIMULATION 200, DIMENSION 200, CIRCUMFERENCE 192, TANGENTS 200, LIMITATIONS 200 | orange |
| Title | JetBrains Mono 700 | 112 px | cream; the word `me` in orange |
| Tool-call line | JetBrains Mono 500 (tool name) and 400 (args at 70 %) | 24 px | cream |
| Tool result line | JetBrains Mono 400 | 22 px | creamDim |
| Status / spinner line | JetBrains Mono 400 | 22 px | verb in orange, rest creamDim |
| Header | JetBrains Mono 400 | 20 px | cream 45 % |
| Labels (parameters, axes) | JetBrains Mono 400 | 22 px (scan readouts 16 px) | cream 70 % / creamDim |
| Math symbols (r, 2πr, π ticks, L, set notation) | **STIX Two Text** Italic 400 | 26–40 px | cream / cream 70 % |

Subsets to load: Newsreader `latin`; JetBrains Mono and STIX Two Text `latin` plus `greek` (for π). Glyphs `● ⎿ ✻ ✓ → ∞ ≈` are never typed as text; they are drawn as SVG (see §7).

### 2.3 Line weights, radii, recurring marks

- **Line weights:**
  - 1 px: hairlines (leaders, ticks, construction lines, tangent fan, rings).
  - 1.5 px: default geometry and composer border.
  - 2 px: active or emphasised shapes.
  - 3 px: orange accent strokes (current pulse, circumference flash, satellite trail).
  - 2.5 px: keyword outline.
  - Nothing heavier.
- **Corner radii:** composer 20, title/user bubble 28, send button 14. Everything else is sharp, true geometry.
- **Pen head:** orange filled circle r=4, plus a 1 px orange ring r=9 at 45 %. It sits at the leading tip of every stroke being plotted. On each beat it pulses to scale 1 + 0.5·env.
- **Claude spark:** 12 tapered rays plus a hub, filled orange (full parametric definition in §7).
- **Caret:** 3 × 40 px orange bar, 4 px after the text. It is solid while typing. When idle it shows during the first half of each beat and hides during the second half.

### 2.4 Grid, safe areas, zones

- **Base unit:** 60 px, giving 32 × 18 cells.
- **Dot grid:** 2 px dots at every multiple of 60 px (33 × 19 dots), colour `grid`.
- **Safe areas:** action-safe 60 px on all sides. Title-safe 120 px left/right and 72 px top/bottom.

**Zones during lyric sections:**

| Zone | Position |
|---|---|
| Header | Baseline y=74; left text at x=120, right text right-aligned at x=1800 |
| Stage (geometry and keywords) | x 120–1800, y 110–660; stage centre C = (960, 390) |
| Log zone | Latest entry: call baseline y=772, result baseline y=806, x=240. Previous entry 76 px higher at 40 % opacity. Older entries removed. |
| Status line | Baseline y=852, x=264 |
| Composer | x 240–1680, y 884–988 |

**Zones during the instrumental (16.0–29.3):** the composer is gone. The status line moves to baseline y=1000, x=240. The log moves to bottom-left: latest entry at 916/950, previous entry at 840/874.

### 2.5 Motion rules

**Easing**

| Use | Easing |
|---|---|
| Moves and draws | easeInOutCubic |
| Entrances and landings | easeOutExpo |
| Implosions | easeInCubic |
| Fades and scans | linear |
| Springs, overshoot, bounce, elastic | Never used |

**Enter / exit**
- Every stroke enters by being plotted: dash-offset draw-on with the pen head at the tip. Default speed is 1200 px/s, clamped to 4–24 frames, unless the stroke is tied to a musical time.
- Strokes exit by un-plotting (reverse draw, 6–10 frames) or a 6-frame linear fade.
- Text enters by typing. Text exits by lifting 14 px and fading over 5 frames.
- There is exactly one hard cut, at f480 (16.0 s).

**Beats**
- Nominal grid: `t_n = 0.151 + 0.4615·n`, `frame = round(30·t)`.
- Scheduled events use the nominal grid. Pulse effects use the detected beat array when the detected beat is within ±40 ms of the nominal one.
- Pulse envelope: `env(x) = exp(−x / 0.12)` for x ≥ 0.

**Beat density by section**

| Time | Grid ripple | Other per-beat effects |
|---|---|---|
| 1.5–16.0 | Downbeats only (every 4 beats) | Pen pulse, header beat counter, spark 15° step every beat |
| 16.0–22.77 | Every 2 beats | Same per-beat effects |
| 22.77–29.69 | Every beat; off-beat eighths too after 27.84 | Same per-beat effects |
| 29.69–44.45 | Every 2 beats | Same per-beat effects |
| 44.45–46.0 | None | Caret blink only |

- **Grid ripple:** a ring of radius `1400·(t − tb)` px from the current stage centre, 90 px wide. Dots inside the ring brighten toward `line2` with weight `(1 − |d − R| / 45)` clamped to 0–1, multiplied by `exp(−(t − tb) / 0.6)`.

**Keyword hits**
- The keyword is visible on exactly frame `round(30·t_kw)`, with no pre-roll.
- Stage geometry drops to 60 % opacity on the hit frame and recovers over 8 frames after the keyword exits.

**Speed limits**
- Nothing moves faster than about 600 px/s except the title flight (15.84–16.0) and the point release (29.69).
- No more than 2 groups move at once.

### 2.6 Forbidden

- **Pixel looks:** pixel art, pixel or bitmap fonts, dithering, mosaic or stepped reveals, square points, CRT scanline overlays, snapping motion to whole pixels.
- **Chinese text:** any CJK character anywhere, including lyrics, labels, file names in log strings, or burned-in metadata.
- **Effects:** gradients (except plain opacity), glow or bloom, blur, drop shadows, grain or noise, glitch or RGB split, camera shake, 3D renderers. Depth is only ever an oblique 2D projection drawn with lines and dots.
- **Colour:** any accent other than `#D97757`. No green success marks, no red error marks.
- **Assets:** stock images, video clips, emoji, the Anthropic wordmark, literal full-screen app screenshots.
- **Character:** shown unprocessed or full-colour, with a white background or halo, outside the three windows in §5, or warped or puppeted.

---

## 3. Persistent layout

**Visibility timeline**

| Element | Visible |
|---|---|
| Background | 0.00–46.00 |
| Dot grid | Wakes 1.536 (radial), stays to the end, fades with the global fade |
| Header | 1.536–46.00 |
| Composer + lyric | 0.00–16.00 and 29.30–46.00 |
| Log zone | 0.30–16.00 (above composer), 19.07–29.30 (bottom-left), 29.71–46.00 |
| Status / spinner line | 13.40–46.00 |
| Stage keyword | 8 windows (see below) |

**Header**
- Left: spark at R=9, then `claude` in cream 70 %, then the path in cream 45%. The path reads `~` and changes to `~/world` at 12.61 s.
- Right: `00:12.3 · 130 bpm · beat 027`. The time runs continuously; the beat number increments on every beat.

**Composer** (the Claude app input box, reduced to geometry)
- Rounded rect x 240–1680, y 884–988, radius 20, fill `surface`, 1.5 px `line2` border.
- Orange `›` prompt glyph at x=272.
- Lyric text starts at x=304, baseline y=952.
- Send button: 56 × 56 rounded square (radius 14) at x 1608–1664, y 908–964, fill orange. It holds an up-arrow drawn in `bg` with a 2.5 px stroke (20 px shaft plus chevron).
- **Send pulse:** fires on every keyword hit, and on the end of lines that have no keyword. The button scales 0.9 → 1.0 over 6 frames, and its fill is cream for 2 frames.

**Lyrics** (readable, in sync)
- Each line starts typing on its LRC frame.
- Typing speed: chars/s = max(40, length / 0.4), so every line completes within 0.4 s and is readable for the rest of its window.
- The old line lifts out and fades over the 5 frames before the next line starts.
- Keyword lines: the lead-in types first. The keyword is appended in orange mono caps on the exact keyword frame, so the full sentence (for example "Remember to put on PROTECTION") is always readable in one place.
- The line stays visible until the next line begins. Exceptions:
  - Line 7 ("And let’s begin the SIMULATION") leaves at 15.30 to make room for the title prompt.
  - Line 15 ("Then you can be my LIMITATIONS") leaves at 44.455.

**Keyword stage display**
- Centred at (960, 390), font size from §2.2.
- **f0 (hit frame):** solid orange fill.
- **f+3 to f+11:** fill fades to 0, leaving a 2.5 px orange outline so the geometry underneath stays visible.
- **f0 to f+5:** a 3 px orange underline draws left to right, 28 px below the baseline.
- **Exit:** begins at `min(next line start − 0.20 s, hit + 1.10 s)`, then 6 frames of fade plus a 12 px rise.

Exit start times: PROTECTION 3.67, OBJECT CREATION 7.25, INITIALIZATION 10.90, SIMULATION 14.99, DIMENSION 33.21, CIRCUMFERENCE 36.87, TANGENTS 40.51, LIMITATIONS 44.25.

**Log zone** (Claude Code tool calls, minimal)
- Each entry has two lines:
  - `● Tool(args)`: the bullet is a drawn 10 px circle. The line types at 5 chars/frame.
  - `⎿ result`: the `⎿` is a drawn L-bracket, 1.5 px, 12 × 12 px, in creamDim, plotted in 3 frames. The result text appears instantly.
- The bullet is orange and pulses on beats while the call is running. It turns creamDim when the result appears.
- A new entry pushes the previous one up 76 px over 6 frames (easeOutCubic).

**Status line**
- Format: drawn spark R=11 rotating, then `Verb…` in orange, then ` (Ns · esc to interrupt)` in creamDim.
- `N = max(0, floor(t − 13.89))`.

| Time | Verb |
|---|---|
| until 24.61 | Simulating… |
| from 24.611 | Iterating… |
| from 26.457 | Converging… |
| from 28.303 | Executing… |
| from 29.71 | Plotting… |
| from 44.455 | Replaced by static `✻ Worked for 46s` in creamDim |

---

## 4. Shot list

Every time is in seconds. `f` = frame at 30 fps. The anchor positions for figure F are in §5.

### Shot 1: 0.00–1.74 (f0–f51) "Switch on the power line"

- **f0:** background plus a single pen-head dot at C. Nothing else.
- **0.00–0.30:** composer outline is plotted clockwise from its top-left by a pen head; its fill fades in over the same window. The `›` appears at 0.10.
- **0.10–0.50:** "Switch on the power line" types.
- **0.151 (b0):** from the dot, a 1.5 px cream-70 % horizontal line extends both ways to x=120 and x=1800 by 0.75. Each end has a pen head.
- **0.30:** log `● Bash(power --on)`.
- **0.6125 (b1):** send button appears (scale 0→1, 6 frames, easeOutExpo).
- **1.074–1.536 (b2→b3):** current: a 3 px orange segment, 160 px long, runs along the line left to right at linear speed.
- **1.536 (b3):**
  - Dot grid wakes radially from C at 1400 px/s.
  - Header fades in over 6 frames.
  - Log `⎿ line live`.
  - The line's ends retract into C (1.55–1.74, easeInCubic), leaving the seed dot.

### Shot 2: 1.74–3.87 (f52–f115) "Remember to put on PROTECTION", hit 2.92 = f88 (exactly beat 6)

- **1.74:** lead-in types.
- **1.90:** log `● Bash(sandbox --enable)`.
- **1.997 (b4) → f88:** one pen head plots a pointy-top hexagon (circumradius 120, 1.5 px cream 70 %) around the seed. It starts at the top vertex, runs clockwise at constant speed, and closes exactly on f88.
- **f88:**
  - Two more hexagons appear complete: R=160 at 2 px orange, R=200 at 1 px cream 45 %.
  - Keyword. Inline keyword. Send pulse. Log `⎿ protection on`.
- **3.38 (b7):** the two outer hexagons rotate +30° over 8 frames.

### Shot 3: 3.87–5.49 (f116–f164) "Lay down your pieces"

- **3.843 (b8):** all hexagons un-plot over 8 frames. The lyric types. At 3.95, log `● Write(pieces.ts)`.
- **Six primitives**, plotted one per eighth note at 3.843, 4.074, 4.305, 4.535, 4.766, 4.997. Each takes 6 frames, 1.5 px cream, with a pen head. Each has a 12 px "+" crosshair at its centre (1 px cream 45 %) and a 16 px creamDim mono label below it.

| Piece | Shape | Position | Label |
|---|---|---|---|
| P1 | circle r=40 | (700, 280) | circle |
| P2 | quadratic arc, 140 px tall | (960, 280) | arc |
| P3 | mirrored arc | (1220, 280) | arc |
| P4 | 160 px line | (700, 500) | line |
| P5 | triangle, base 140, height 160 | (960, 500) | triangle |
| P6 | 56 × 68 rect, radius 4 | (1220, 500) | rect |

- **4.997:** log `⎿ Wrote 6 primitives`.

### Shot 4: 5.49–7.45 (f165–f223) "And let’s begin OBJECT CREATION", hit 6.38 = f191

- **5.49:** lead-in types. At 5.55, log `● Bash(new Object(me))`.
- **5.689 (b12):** labels and crosshairs fade. The pieces glide and scale into abstract figure F: height 480, top y=150, centred x=960, using the normalised primitive table in §5. Each glide is easeInOutCubic, 0.62 s, with a 2-frame stagger. All have landed by 6.36.
- **f191:**
  - All F strokes turn 2 px orange for 3 frames, then return to 1.5 px cream over 6 frames.
  - A dashed bounding box (1 px cream 45 %, dash 6/6) snaps around F, with `object #0001` (16 px creamDim) at its top-left.
  - Keyword. Inline keyword. Send pulse. Log `⎿ object #0001 created`.

### Shot 5: 7.45–11.10 (f224–f332) "Fill in my data parameters INITIALIZATION", hit 10.09 = f303

- **7.45–7.80:** F glides so its centre is at x=760. The bounding box un-plots. The lyric types. At 7.55, log `● Edit(params.json)`.
- **Six parameters, one per beat:** b16 7.535, b17 7.997, b18 8.458, b19 8.920, b20 9.381, b21 9.843.
  - Each has an orange node (r=3.5) at its anchor on F.
  - A 1 px cream-45 % leader runs horizontally, then diagonally, to its label at x=1080.
  - Labels sit at y = 170, 240, 310, 380, 450, 520 and type in 5 frames: key in cream 70 %, `=` in creamDim, value in cream.
  - Each parameter visibly changes F:

| # | Label | Change to F |
|---|---|---|
| 1 | `hair.color = #D97757` | Hair arcs re-stroke in 2 px orange |
| 2 | `hair.length = long` | Hair arc ends extend down by 12 % of figure height |
| 3 | `ornament = flower` | Spark outline (R=12, 1.5 px orange) plotted at the flower anchor |
| 4 | `ribbon = black` | Bow of two small triangles (ink fill, 1 px cream outline) at the ribbon anchor |
| 5 | `skirt.motif = sun` | Circle r=8 plus 8 rays of 6 px (1 px cream) at (0.32, 0.72) |
| 6 | `book = closed` | 1 px spine line on the book rect |

- **9.381 (b20) → f303:** progress ring around F (centre (760, 390), r=270, 1.5 px cream). Plotted from 12 o'clock, clockwise, easeInQuad, with a pen head; closes exactly on f303.
- **9.843:** log `⎿ 6 fields set`. At 9.90, log `● Bash(init --all)`.
- **f303:**
  - Ring turns 2 px orange.
  - Leaders and labels retract into their nodes over 8 frames.
  - Keyword. Inline keyword. Send pulse. Log `⎿ initialized`.

### Shot 6: 11.10–12.91 (f333–f386) "Set up our new world"

- **11.10–11.45:**
  - F scales to 0.19 (about 90 px tall) and moves to stand on top of the globe, feet at (960, 210).
  - The ring becomes the globe outline: centre (960, 430), r=220, re-coloured to cream 70 % over 6 frames.
  - The lyric types. At 11.20, log `● Bash(mkdir world)`.
- **Globe lines**, plotted on beats (8 frames each, 1 px cream 45 %):

| Beat | Lines |
|---|---|
| b24 11.227 | Equator ellipse, rx 220, ry 40 |
| b25 11.689 | Parallels at ±35°: centres y = 430 ∓ 126, rx 180, ry 32 |
| b26 12.150 | Meridian ellipses ry 220, rx = 220·\|sin λ\| for λ = 30°, 60°, 120°, 150°, plus the central meridian as a vertical line. Log `⎿ world/ ready · 32×18` |
| b27 12.612 | Dot grid brightens to `#34312C`. Header path changes to `~/world` |

### Shot 7: 12.91–16.00 (f387–f479) "And let’s begin the SIMULATION", hit 13.89 = f417, then the prompt is sent

- **12.91:** meridians start rotating: λ advances at 40°/s, rx = 220·|sin λ|. Meridians with cos λ < 0 drop to 25 % opacity. The lyric types. At 12.95, log `● Bash(simulate ./world)`.
- **13.40:** status line appears: `✻ Simulating… (0s · esc to interrupt)`.
- **f417:**
  - Rotation ramps to 140°/s over 4 frames.
  - An orbit ellipse (rx 400, ry 92, rotated −12°, 1 px cream 45 %) appears.
  - An orange satellite (r=6) orbits once per bar (1.846 s). Its trail is three 3 px arc pieces of 17° each at opacity 1 / 0.6 / 0.3; this avoids a gradient.
  - Keyword. Inline keyword. Send pulse. Log `⎿ running`.
- **15.30:** lyric exits.
- **15.38–15.75:** the composer types `world.execute(me);` in JetBrains Mono 500, 44 px, with `me` in orange. This is the user's prompt.
- **15.842 (b34):**
  - Send pulse.
  - The text is wrapped in a user bubble (`surface` fill, radius 28). The bubble flies to the title position, scaling text 44 → 112 px, easeOutExpo, landing exactly on f480.
  - The composer fades out over the same 5 frames.
  - The status line slides to its instrumental position (y=1000).

### Shot 8: 16.00–18.61 (f480–f557) TITLE

- **f480 hard cut:** stage, globe and log are removed. Remaining: background, grid, header, status line, and the title bubble.
- **Title bubble:**
  - Centre (960, 540), width about 1322, height 200, fill `surface`, 1.5 px `line2` border.
  - Text `world.execute(me);` at 112 px. The `me` is orange and spans about x 1296–1430.
- **f480–f488:** spark blooms at (960, 330), R=56. Its rays grow from the hub with a 0.5-frame stagger. It then rotates at 8°/s, plus a 15° step on every beat (6 frames, easeOutCubic).
- **16.30:** `⎿ executing…` (22 px, creamDim) appears at y=694, aligned to the bubble's left edge.
- **b36 16.765 and b38 17.688:** a 1 px cream ring expands from the spark, r 56 → 720 over 1.2 s, opacity 0.45 → 0.

### Shot 9: 18.61–22.77 (f558–f682) Character moment 1, "me, rendered"

- **18.611 (b40) backspace:** every character except `me` deletes, 2 per frame, from the outer ends inward (f558–f565). The bubble shrinks to wrap the remaining text. The spark rays retract and the hub fades. `⎿ executing…` fades.
- **f566–f570:** the bubble un-plots. `me` scales down into an orange pen dot at (1363, 540).
- **19.00–19.07:** the dot glides to (1258, 140), the top of her display box.
- From here the shot is fully specified in §5 (moment A). In outline:
  - 19.07: construction primitives plotted on her.
  - 19.30–19.765: scan-down reveals her line art.
  - 19.765–20.457: scan-up reveals her flat fills.
  - b44–b48: five leader labels, one per beat.
- **Logs (instrumental log position):**
  - 19.07 `● Read(me.png)`, result at 19.765 `⎿ 1 figure · 6 colors`.
  - 19.765 `● Render(me)`, result at 20.457 `⎿ done`.

### Shot 10: 22.77–29.71 (f683–f890) Instrumental build, the simulation runs

- **22.765 (b49), beat densifies:**
  - Labels, leaders and checks un-plot over 6 frames.
  - Her flat fills cut out on f683, leaving line art and construction lines only.
  - Log `● Bash(simulate --steps 1e6)`, result at 23.226 `⎿ running`.
- **23.226 (b50):**
  - Line art cross-fades over 3 frames into the point set: N = 1210 points at her silhouette positions. Points are r = 1.8 px circles, orange if sampled from orange or orangeDeep regions, cream otherwise.
  - Construction lines and the floor axis un-plot.
- **23.226–24.611:** points flow into a phyllotaxis spiral centred at (960, 500).
  - Point k sits at radius `380·√(k/N)`, angle `k·137.508°`.
  - Assignment: silhouette points are ranked by distance from her centroid, and rank k maps to spiral index k.
  - Each point waits `0.25·k/N` s, then moves for 1.0 s, easeInOutCubic.
- **Spiral rotation:** 6°/s, then 15°/s from b56 (25.995), then easeInQuad up to 90°/s by 29.226.
- **Every beat:** each point's radius is multiplied by `1 + 0.05·env(t − tb − r/1500)`, an outward ripple. From b60 (27.841) the off-beat eighths add a 0.03 ripple.
- **Centre spark:**
  - The hub (R=44) appears at 23.226.
  - One ray is added per beat from b51 (23.687) to b62 (28.764), each growing over 4 frames. The spark is complete at b62; this reads as a loading indicator.
- **Downbeats b52 (24.149), b56 (25.995), b60 (27.841):** a 1 px orange ring at 45 % expands from r 400 to 440 while fading, over 0.4 s.
- **Logs, one per bar:**
  - 24.611 `● Read(world/you.json)`, result at 25.073 `⎿ 1 entity`.
  - 26.457 `● Search(pattern: "you")`, result at 26.918 `⎿ Found 1 match`.
  - 28.303 `● Edit(me.ts)`, result at 28.764 `⎿ +1 dimension`.
- **29.226 (b63)–29.60:**
  - All points implode into the hub (easeInCubic); the spark scales 1 → 1.5.
  - 29.30–29.60: the composer slides up from +140 px and fades in, empty, with the caret showing. The status line returns to y=852.

### Shot 11: 29.71–31.12 (f891–f933) "If I’m a set of points", character moment 2 (trace)

- **29.687 (b64):** the spark shrinks to 0 over 6 frames. Points shoot out (easeOutExpo, 0.45 s, 0–3 frame jitter) into her silhouette at small scale: height 480, bottom y=610, centred x=960.
- **29.71:** lyric types. At 29.75, log `● Plot(me, as: "points")`, result at 30.15 `⎿ n = 1,210`.
- **30.40–30.80:** axes are plotted from origin O = (717, 610).
  - x-axis runs to x=1560; y-axis runs up to y=150. Both have open-V arrowheads (10 px).
  - Ticks every 36 px, 6 px long, 1 px cream 45 %.
- **30.60:** label `P = {p1, …, pn}` in STIX Two Text italic, 32 px, cream 70 %, right-aligned at (1560, 170). Subscripts use a baseline shift.
- **Each beat:** points breathe, r 1.8 → 2.3·env.

### Shot 12: 31.12–33.41 (f934–f1001) "Then I will give you my DIMENSION", hit 32.68 = f980

- **31.12:** lead-in types. At 31.20, log `● Bash(project --dim 1..3)`.
- **31.12–31.80, 1D:** every point's y eases to 610, onto the x-axis; x is unchanged. Points move left first, with a 0.25 s spread. Label `dim = 1` appears right-aligned at (1560, 650).
- **31.90–32.60, 2D:** points move to an 11 × 11 lattice at x = 717 + 36i, y = 610 − 36j. Ten points stack on each site, so 121 are visible. Label `dim = 2`.
- **f980, 3D:**
  - The z-axis shoots from O up and to the right in 4 frames: 2 px orange, 260 px long, with an arrowhead.
  - Points extrude by layer k (0–9) along `k·(14, −10)` px over 8 frames, easeOutExpo, at opacity `1 − 0.07k`.
  - 12 cube bounding edges (1 px cream 45 %) are plotted over 10 frames.
  - Label `dim = 3`. Keyword. Inline keyword. Send pulse. Log `⎿ dim = 3`.

### Shot 13: 33.41–34.65 (f1002–f1039) "If I’m a circle"

- **33.41:** lyric types. At 33.45, log `● Draw(circle, r = 160)`.
- **33.41–33.95:** axes and edges un-plot. Points converge onto a circle at (960, 400), r=160: point i goes to angle `2πi / N`.
- **33.60–34.40:** a pen plots a 2 px cream circle clockwise from 12 o'clock. Each point fades as the pen passes its angle.
- **34.20:** a radius line to 3 o'clock (1.5 px cream 70 %), a centre dot, and an `r` label (STIX italic, 36 px).
- **34.40:** log `⎿ ok`.

### Shot 14: 34.65–37.07 (f1040–f1111) "Then I will give you my CIRCUMFERENCE", hit 36.29 = f1089

- **34.65–34.95:**
  - The circle glides to centre (457, 400); the `r` label fades.
  - A 1 px cream-45 % baseline is plotted at y=560 from x=457 to x=1463.
  - At 34.70, log `● Bash(unroll circle)`.
- **34.95 → f1089, rolling unroll** (progress p, easeInOutSine, p = 1 exactly on f1089):
  - Centre x = `457 + 1005.3·p`.
  - The laid segment runs from 457 to the centre x, 2 px cream.
  - The remaining arc has angular length `2π(1 − p)`, starting at the contact point and running forward.
  - The radius marker rotates `2πp` clockwise.
  - The pen head sits at the contact point.
- **f1089:**
  - The segment flashes to 3 px orange and stays orange through the hold.
  - 16 px end ticks at both ends.
  - `2πr` label (STIX italic, 40 px) centred at y=530.
  - Keyword. Inline keyword. Send pulse. Log `⎿ C = 2πr = 1005.3 px`.

### Shot 15: 37.07–38.60 (f1112–f1157) "If I’m a sine wave"

- **37.07:** the segment returns to cream over 6 frames. The lyric types. At 37.10, log `● Plot(sin(x), 0..4π)`.
- **37.07–37.60:** the segment morphs into `y = yb − A·sin(4π(x − 457) / 1006)` (200 samples). yb goes 560 → 420 and A goes 0 → 140, easeInOutCubic.
- **37.30:** axis hairline at y=420 (x 420–1500, cream 30 %). Tick labels `0, π, 2π, 3π, 4π` (STIX italic, 26 px) at y=600.
- **37.60:** log `⎿ ok`.
- The pen dot rests at (457, 420), pulsing on beats.

### Shot 16: 38.60–40.71 (f1158–f1220) "Then you can sit on all my TANGENTS", hit 40.05 = f1202

- **38.60:** lead-in types. At 38.65, log `● Bash(diff sin)`.
- **38.60–40.60:**
  - An orange dot (r=5) slides along the wave, u from 0.04 to 0.96, easeInOutSine.
  - Its tangent line is 360 px, 1.5 px cream, with slope `−A·(4π / 1006)·cos(4πu)`.
  - A small "you" circle (r=10, 1.5 px cream outline) sits on the tangent, offset 11.5 px along the upward normal.
- **f1202:**
  - 17 tangents appear at u = k/16 (length 200, 1 px cream 40 %), staggered left to right over 8 frames.
  - The active tangent becomes 2 px orange.
  - Keyword. Inline keyword. Send pulse. Log `⎿ cos x`.

### Shot 17: 40.71–42.35 (f1221–f1270) "If I approach infinity"

- **40.71:**
  - The fan, the "you" circle and the active tangent un-plot.
  - A eases to 0 by 41.10, flattening the wave onto the axis.
  - The π labels fade.
  - The axis extends right to x=1800 with an arrowhead.
- **Ticks, one per eighth note** from b88: 40.763, 40.994, 41.225, 41.455, 41.686, 41.917, 42.148.
  - Tick k sits at `x = 1800 − 1343 / 2^k`, giving 457, 1128, 1464, 1632, 1716, 1758, 1779.
  - Labels `1 2 4 8` (20 px creamDim, y=456) on the first four ticks only.
  - After 42.148, 20 more ticks burst in over 4 frames, crowding toward x=1800.
- **Pen dot:** runs along the axis at `x = 1800 − 1343·e^(−2.2(t − 40.71))`.
- **41.40–42.30, lemniscate:** plotted at (960, 260) with a = 200: `x = a·cos s / (1 + sin²s)`, `y = a·sin s·cos s / (1 + sin²s)`. 2 px cream, with a pen head.
- **Logs:** 40.76 `● Bash(seq 1 inf)`, result at 41.40 `⎿ still running…`.

### Shot 18: 42.35–44.45 (f1271–f1333) "Then you can be my LIMITATIONS", hit 43.51 = f1305

- **42.35:** the lemniscate and ticks un-plot. The axis shortens to x 360–1560 and slides to y=620 over 0.3 s. Lead-in types. At 42.40, log `● Bash(limit --x inf)`.
- **42.40–42.70:** dashed asymptote at y=220, x 360–1560, 2 px cream 70 %, dash 12/10.
- **42.55 → f1305:** curve `y = 220 + 400·e^(−(x − 360)/240)` plotted from x=360 to x=1368, easeOutQuart in x, so the pen decelerates as it approaches. It stops exactly on f1305, 6 px below the line.
- **f1305:**
  - The asymptote turns solid 2 px orange.
  - `L` (STIX italic, 40 px) right-aligned at (340, 234).
  - `limit = L` (creamDim) right-aligned at (1560, 200).
  - Keyword. Inline keyword. Send pulse. Log `⎿ converges to L`.
- The pen dot pulses on b94 (43.532) and b95 (43.993).

### Shot 19: 44.45–46.00 (f1334–f1379) Tail, character moment 3, "exit 0"

- **44.455 (b96):**
  - Lyric exits. The composer is empty, with a caret blinking on beats.
  - Status becomes `✻ Worked for 46s`.
  - Log `● world.execute(me)`, result at 44.917 `⎿ exit 0`.
- **44.455–44.80:** the curve, axis and labels un-plot. The orange asymptote morphs into the floor line (x 640–1280, y=600, cream 45 %). The pen dot glides to (960, 400) by 44.60.
- **44.60–45.00:** iris reveal of art (b); see §5, moment C.
- **44.917 (b97):** a small spark (R=18) blooms at (960, 128) and rotates at 4°/s.
- **45.378 (b98):** a 1 px orange circle at 45 % is plotted at r=256 around the iris. This is the boundary, the "limitations".
- **45.40–46.00:** global linear fade to background. The spark fades last (45.70–46.00). f1379 is background only, matching the audio fade.

---

## 5. Character moments

There are three windows only. No new poses are needed: the two supplied poses cover the "rendered" moment and the "asleep, done" ending. A third pose would add style drift risk without a scene that needs it.

### Shared offline treatment (preprocessing, run once, outputs in `public/char/`)

1. **Defringe:** erode alpha by 1 px and un-premultiply, so no white halo survives on the dark background.
2. **Scale:** if the source is shorter than 2× display height (1680 px for art a), upscale with Lanczos first.
3. **Flat colour reduction:**
   - Nearest-colour mapping in CIELAB to the 5 character tokens (§2.1): charCream, charShade, orange, orangeDeep, ink.
   - Rules: skin maps to charCream; book brown and gold trim map to orangeDeep; amber eyes map to orange.
   - Then a mode filter (radius 3 at 2× scale) merges speckle into large flat shapes.
   - Work at 2× and downscale so edges stay anti-aliased: smooth vector-looking shapes, never pixel-stepped.
4. **Line layer:**
   - Black top-hat on the original greyscale (disk r=3 at 2×), thresholded. This captures thin ink lines but not large black areas.
   - Plus the boundaries of the flat label map.
   - Line colour depends on what is underneath: lines over ink regions are cream `#E9E3D5`; all other lines are ink `#1C1A17`, so the face and eye lines stay legible.
   - Plus a 2 px cream silhouette outline from the alpha edge, which separates the ink corset from the near-black background.
   - Target line width at display size: 1.5–2 px, the same weight as the geometry.
5. **Exports per pose:**
   - `X_flat.png`: fills, interior lines and outline.
   - `X_lines.png`: all lines plus outline, recoloured to cream, on transparent.
   - `X_alpha.png`.
   - For art (a) only, `a_points.json`: exactly 1210 Poisson-disk samples inside the alpha, each `{nx, ny, cls}` where cls is orange or cream. Points on ink areas are kept and coloured cream at 50 %.
6. **Anchors:** feature anchors in normalised image coordinates. These are estimated from REF_CHAR (528 × 943); the engineer must verify them on the real cutout.

| Anchor | (nx, ny) |
|---|---|
| Face centre | (0.502, 0.125), radius 0.10·W |
| Hair flower | (0.61, 0.045) |
| Neck / collar | (0.496, 0.196) |
| Collar ribbon | (0.578, 0.246) |
| Book centre | (0.337, 0.263), rotation −12° |
| Left hair strand | (0.18, 0.456) |
| Sun motif on black panel | (0.167, 0.719) |
| Hem | y 0.954, x 0.09–0.985 |

### Construction primitives (also the abstract figure F in shots 3–6)

All coordinates are normalised (nx, ny) on the art's box:

| Primitive | Geometry |
|---|---|
| Head | Circle at (0.502, 0.125), r = 0.10·W |
| Hair L | Quadratic from (0.42, 0.06), control (0.10, 0.30), end (0.10, 0.86) |
| Hair R | Quadratic from (0.60, 0.06), control (0.92, 0.30), end (0.90, 0.75) |
| Shoulders | Line (0.30, 0.215) – (0.72, 0.215) |
| Dress | Triangle, apex (0.496, 0.196), base (0.09, 0.954) – (0.985, 0.954) |
| Book | Rect at (0.337, 0.263), 0.16W × 0.14H, rotated −12° |

Because F is literally her geometry, the object built at 0–16 s locks exactly onto her at 19 s.

### Moment A: 18.61–23.23, art (a) standing, "me, rendered"

**Placement**
- Height 840, top y=140, centred x=1260, so the box is x 1025–1495.
- Screen position = `(1025 + nx·470, 140 + ny·840)`.

**Timeline**
- **19.073 (b41):** construction primitives plotted onto her position (1 px cream 45 %). A floor axis at y=980 (x 960–1560, ticks every 60 px) is plotted.
- **19.30–19.765, scan down:**
  - A 2 px orange line (x 1000–1520) moves from y=140 to y=980.
  - Above it, `a_lines.png` is visible (clip `inset(0 0 (980 − y) 0)`).
  - A 16 px creamDim readout `y 0412` rides at the line's right end, showing the current y.
- **19.765–20.457, scan up:** a second orange line moves from 980 to 140. Below it, `a_flat.png` appears under the line art.
- **20.457:** construction lines drop to 25 %. A slow push begins: scale 1.000 → 1.025 by 22.765, linear.

**Leaders, one per beat.** Each label types in 5 frames. Four frames later an orange check (polyline 14 × 10, 2 px) is drawn after it. Each leader runs 40 px horizontal from the label, then straight to an orange node at the feature.

| Beat | Side | Label | Notes |
|---|---|---|---|
| b44 20.457 | right, x=1560, y=180 | `ornament = flower` | A spark outline (R=26, 1.5 px orange) appears on her hair flower and steps 15° per beat |
| b45 20.918 | right, y=340 | `ribbon = black` | |
| b46 21.380 | left, right-aligned at x=940, y=360 | `book = closed` | |
| b47 21.841 | left, y=520 | `hair.color = #D97757` | |
| b48 22.303 | left, y=744 | `skirt.motif = sun` | |

**Exit**
- b49: fills cut out (wireframe).
- b50: line art becomes points (Shot 10).

### Moment B: 29.69–31.80, derived silhouette from (a), "set of points"

- Only the 1210 sampled points are drawn, at height 480, bottom y=610, centred x=960. No illustration pixels are shown.
- Orange points trace her hair, so she is recognisable as a constellation.
- Exit: projection to 1D at 31.12 (Shot 12).

### Moment C: 44.60–46.00, art (b) sitting, eyes closed, hugging the book

- Same flat and line treatment.
- Scaled to height 360 (cap the width at 340). Bottom edge on the floor line at y=600, centred x=960.
- **Reveal:** an iris. A circular `clip-path` and a matching 1.5 px cream-45 % outline grow together from r=0 to r=240 around (960, 400), easeOutExpo, opening from the pen dot that just finished the limit curve.
- Any of her hair or skirt crossing the circle is clipped deliberately: she is held inside the boundary.
- **Exit:** the global fade.

### Why it will not look pasted on

- She contains no colour the video does not already use; her five tones are the palette.
- Her outlines are the same cream, at the same 1.5–2 px weight, as every other stroke.
- She arrives by the same plotting mechanics as all the geometry: pen dot, orange scan line, iris from a pen dot.
- The audience watched her geometry being built for 16 seconds. The circle, arcs, triangle and rect snap onto her head, hair, dress and book, so she reads as the render of that object, not a sticker.
- She is anchored to the coordinate system (floor axis, leader labels, iris circle). She never floats free, and has no shadow, glow or white edge.
- She leaves as points that become the next scene's material, so she is part of the simulation's data flow.

---

## 6. Claude elements: every appearance

1. **Brand orange `#D97757` as the only accent**, throughout.
2. **Claude spark (radial starburst of tapered rays):**
   - Header icon: 1.5–46 s.
   - Status-line spinner glyph: 13.4–44.45 rotating; static in `✻ Worked for 46s`.
   - Abstract figure's flower: 8.46–12.9.
   - Title bloom: 16.0–18.61.
   - Overlay on the character's real hair flower: 20.46–22.77. The flower is a sunburst, a deliberate visual rhyme with the spark.
   - Loading spark at the centre of the simulation, gaining one ray per beat: 23.23–29.69.
   - Implosion/release core: 29.23–29.69.
   - Final spark: 44.92–46.0.
3. **Composer input box with prompt:** 0–16 and 29.3–46. It has the `›` glyph, orange caret, orange send button with up-arrow, and send pulses on keyword hits. The lyrics are the prompts.
4. **User prompt and user message bubble:** `world.execute(me);` typed at 15.38, sent at 15.842, flown into the title bubble (16.0–18.61). The bubble is backspaced to `me`, which becomes the character.
5. **Tool-call lines with `⎿` results:** 23 entries across the video, listed in Shot 1–19.
   - Tools used: `Bash`, `Write`, `Edit`, `Read`, `Search`, `Plot`, `Draw`, `Render`, plus the final `world.execute(me)` → `exit 0`.
6. **Spinner line** `✻ Simulating… (Ns · esc to interrupt)` from 13.40. The verb changes per bar during the build (Iterating, Converging, Executing), then reads Plotting during the verse.
7. **Completion line** `✻ Worked for 46s` at 44.455.
8. **Header** `claude ~/world`, styled like the Claude Code working-directory line.

---

## 7. Build notes

### Structure

- **Composition:** 1920 × 1080, 30 fps, 1380 frames. `<Audio>` starts at frame 0.
- **Single time variable:** `t = frame / 30`. Every element is a pure function of t; no React state and no `Math.random` (use a seeded PRNG if needed).
- **One `timeline.ts` data file** holding:
  - Lyric lines: start, end, text, keyword, keyword time.
  - Nominal and detected beats.
  - Log entries (call time, text, result time, result).
  - Keyword exit times.
  - Shot boundaries in frames: 0, 52, 116, 165, 224, 333, 387, 480, 558, 683, 891, 934, 1002, 1040, 1112, 1158, 1221, 1271, 1334, 1380.
- **Layer order, bottom to top:**
  1. Background rect.
  2. Grid canvas (627 dots, per-dot ripple brightness).
  3. Stage SVG.
  4. Character `<Img>` layers with CSS clip-path.
  5. Point canvas.
  6. Construction/leader SVG.
  7. Keyword SVG.
  8. Log and status.
  9. Composer.
  10. Header.
  11. Global fade.

### Drawing techniques

- **Draw-on and pen head:** use `@remotion/paths`. `evolvePath(p, d)` gives the dash values; `getPointAtLength(d, p·getLength(d))` gives the pen-head position.
  - Express circles, ellipses, hexagons and rounded rects as path strings so they all plot the same way.
  - The hexagon in Shot 2 and the ring in Shot 5 must reach p = 1 exactly on the keyword frame.
- **Typing:** `text.slice(0, n(frame))` in HTML with the caret as an inline element after the text. Mixed fonts in the lyric are two `<span>`s on a shared baseline.
- **Keyword fill → outline:** SVG `<text>` with orange fill animated 1 → 0, plus `stroke` 2.5 px orange, `paint-order: stroke`. Exit with opacity and translateY only; do not dash-animate glyph outlines.
- **Point system:** one N=1210 array, drawn on one Canvas 2D in `useLayoutEffect` keyed on the frame. Each point has precomputed target positions per state: silhouette-large, spiral, silhouette-small, 1D, 2D, 3D, circle. Interpolate between consecutive states with per-point delay. Draw round `arc` dots only.
- **Rolling circle:** compute the remaining arc as an SVG arc path. When the remaining angle is ≥ 2π − ε, split it into two arcs, because a single SVG arc command cannot draw a full circle.
- **Globe:** recompute meridian `rx = R·|sin λ(t)|` per frame. No 3D maths beyond that.
- **Character reveals:** CSS `clip-path: inset(...)` for the scans and `circle(r at 960px 400px)` for the iris, on precomputed PNGs. Never run SVG filters at render time; all colour processing is offline (Python with Pillow, NumPy, scikit-image).
- **Spark (parametric):**
  - 12 rays at angles `−90° + 30°·i + jitter_i`, jitter = [0, 4, −3, 2, −4, 3, 0, −2, 4, −3, 2, −1]°.
  - Lengths R × [1.00, .80, .95, .76, .98, .84, .93, .78, 1.00, .82, .96, .79].
  - Each ray is a tapered quad: 0.15R wide at radius 0.10R, 0.05R wide at the tip, with a rounded tip.
  - Hub: circle r = 0.14R.
  - Outline variant: 1.5 px stroke, no fill.
  - If the client supplies the official mark as an SVG, swap it in at the same sizes.
- **Glyph safety:** draw `●` (circle), `⎿` (L path), `✻` (spark), `✓` (polyline) and arrowheads as SVG. Never type `→ ∞ ≈`. π needs the `greek` subset loaded in JetBrains Mono and STIX Two Text. Wait for fonts (`loadFont().waitUntilDone()`) before the first frame.
- **Hard cut at f480:** render shots 1–7 only when `frame < 480`.

### Checks

1. **No Chinese:** a build-time assertion that no string in `timeline.ts` or any component matches `[\u3000-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]`.
2. **Sync test:** a debug overlay prints the frame number and flashes on the 8 keyword frames (88, 191, 303, 417, 980, 1089, 1202, 1305) and on f480. Scrub against the waveform in Studio before polishing.

### Risks

| Risk | Mitigation |
|---|---|
| Flat-colour conversion of the face and skin can go muddy | Hand-correct the label map around the face, and keep her eye and mouth ink lines unquantized |
| The sitting pose's proportions are unknown | Fit rule: height 360, or width ≤ 340, whichever is smaller |
| STIX Two Text missing in `@remotion/google-fonts` | Fall back to Noto Serif Italic, which has a Greek subset |
| The 5-frame title flight (15.842 → 16.0) feels abrupt | Start it at 15.75; the landing frame must stay f480 |
| Keyword outline over busy geometry | The 60 % stage dim plus outline-only after 11 frames keeps both readable. If still busy, reduce the tangent-fan and lattice opacity during holds |
| Detected beats that disagree with the 130 BPM grid | Use detected beats only for pulses, never for keyword or shot timing |