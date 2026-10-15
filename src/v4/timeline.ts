// Section boundaries and the standard IDE layout (docs/design_v4.md §5).
export const SONG_V4 = 211.96;
export const FRAMES_V4 = Math.ceil(SONG_V4 * 30); // 6359

export const SECTIONS: [number, number][] = [
  [0, 44.45],
  [44.45, 88.6],
  [88.6, 131.22],
  [131.22, 162.63],
  [162.63, 211.96],
];
// Index of the section that owns time t.
export const sectionAt = (t: number) => {
  for (let i = SECTIONS.length - 1; i >= 0; i--) if (t >= SECTIONS[i][0]) return i;
  return 0;
};
// True inside [a − pad, b + pad] (sections render nothing outside ±0.5 s).
export const inRange = (t: number, a: number, b: number, pad = 0.5) => t >= a - pad && t <= b + pad;

// Standard layout coordinates (the handoff contract).
export const LAYOUT = {
  header: {y: 0, h: 44},
  sidebar: {x: 24, y: 64, w: 240, h: 900},
  transcript: {x: 300, y: 64, w: 640, h: 820},
  composer: {x: 300, y: 908, w: 640},
  you: [272, 940] as [number, number],
  stage: {x: 980, y: 64, w: 916, h: 900},
  status: {x: 300, y: 878},
  spark: [318, 878] as [number, number],
};
