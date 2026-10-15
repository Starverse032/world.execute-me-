You are building one section of v2 of an animated music video for Mili's "world.execute(me);" (211.96 s), in Remotion 4.0.529 + React 18. The project is at /home/claude/mv.

The client reviewed v1 and asked for a redesign. They want:
- Lyrics shown as Claude's replies and code.
- The UI itself telling the story (stable, then anomalies, then out of control, then deleted piece by piece).
- Many scene types (windows, new and deleted chats, special lyric UIs).
- Crisp, artistic character art (line art, silhouettes, close-ups, fragments) instead of blurry portraits.
- Stronger code style.

They also said: "don't only do what I say; expand, imagine and improve on your own". Within the spec's beats, add your own ideas that make your section lively, surprising and emotionally clear.

## Read first, completely

- **docs/design_v4.md:** the v2 spec. Read all of it: hard rules, cast, framework, the whole screenplay (so you know what comes before and after your section), the build process and the handoff coordinates.
- **docs/v4_framework.md and src/v4/Kit.tsx:** the shared component API and a working usage example. Use these components; do not edit them.
- **docs/design_v3.md:** the style bible (palette, line language, motion).

## Existing code you can reuse (read-only)

- src/v3/core.ts and src/v3/geo.tsx.
- The v1 sections in src/v3/sections/*.tsx and src/v3/shots/*.tsx. The client liked some v1 visuals: the heart dissolving and the character returning to geometric parts, the opening's logic, the standoff composition. Copy code into your own files when useful. Never edit v3 files.

## Your files

- `src/v4/sections/S<n>.tsx`, exporting `Section<n>`.
- Helpers named `src/v4/sections/S<n>_*.tsx/.ts`.
- `src/v4/sections/s<n>.data.ts` for timeline data.

Do not edit any other file. If a shared component is missing a feature, write a local wrapper or variant in your own files and mention it in your report.

## Character art

- Files: public/la/<pose>.json and <pose>_ink.png, used through `<LineArt>`.
- All 11 poses are available: stand, male, face_sad, eye, hand, profile, back, kneel, face_defy, fall, sit.
- Look at the ink PNGs with the Read tool, and measure crops and anchors (eye centre, hand, face) with a short Python/PIL script. Don't guess.

## Rules

- **Pure functions:** everything is a pure function of t = frame/30. Use a seeded rng, never Math.random.
- **Time window:** your Section returns null outside [your start − 0.5, your end + 0.5].
- **Lyric timings:** take them from docs/lyrics.lrc (src/v3/lrc.ts has them as data).
- **Readability:** every lyric line in your range must be readable when it is sung (prose at least 40 px, keywords big).
- **Handoffs:** must match the neighbouring sections at your boundaries (spec §4 and the layout table).
- **Performance:** each frame should render well under 1 s. Precompute at module load or with useMemo. Don't mount hundreds of heavy SVG masks at once.

## Verify continuously

Render stills of the full composition:

```
cd /home/claude/mv && npx remotion still src/index.ts FullMV2 /tmp/claude-0/-home-claude/c5ddb39d-5851-5f64-820a-dc4762ad6eab/scratchpad/s<n>/f_<frame>.png --frame=<frame> --scale=0.5 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell --log=error
```

Look at the stills with the Read tool.

- **What to check:** every lyric line (mid-line and on its keyword hit), every special moment (entry, peak, exit), both handoff frames, and a few random frames.
- **How many passes:** do at least two full review passes and fix everything that looks wrong:
  - overlaps;
  - unreadable or clipped text;
  - colours outside the palette;
  - anything that looks blurry or smeared;
  - a frame that looks like v1's fixed template;
  - dead empty frames;
  - single-frame pops that aren't deliberate hits.
- **Limits:** prefer the batch script, which bundles once and keeps one browser open: `cd /home/claude/mv && OUT=/tmp/claude-0/-home-claude/c5ddb39d-5851-5f64-820a-dc4762ad6eab/scratchpad/s<n> node scripts/stills.mjs FullMV2 0.5 <frame> <frame> …`. It writes `FullMV2_<frame>.png`. Run only one batch at a time, because four other builders share the 4-core CPU. Do NOT run full video renders. Type-check with `npx tsc --noEmit -p .` before finishing.

## Final message

A report covering:
- what you built, beat by beat;
- the ideas you added;
- which frames you checked;
- deviations from the spec and why;
- placeholders pending;
- any framework issue (be precise).
