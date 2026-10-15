// The abstract figure F: six primitives in normalised (nx, ny) coordinates of
// the character art's box (art a, standing). Built in shots 3–6 and locked
// onto the real art in moment A, so the object visibly becomes her.
// Map to screen with box {x, y, w, h}: (x + nx·w, y + ny·h).
export const FIG = {
  head: {cx: 0.502, cy: 0.125, r: 0.1}, // r is a fraction of the box WIDTH
  hairL: {from: [0.42, 0.06], ctrl: [0.1, 0.3], to: [0.1, 0.86]},
  hairR: {from: [0.6, 0.06], ctrl: [0.92, 0.3], to: [0.9, 0.75]},
  shoulders: {from: [0.3, 0.215], to: [0.72, 0.215]},
  dress: {apex: [0.496, 0.196], left: [0.09, 0.954], right: [0.985, 0.954]},
  book: {cx: 0.337, cy: 0.263, w: 0.16, h: 0.14, rot: -12}, // w of box width, h of box height
};

// Feature anchors (normalised), verified against public/char/a_* by the char script.
export const ANCHOR = {
  face: [0.502, 0.125],
  flower: [0.61, 0.045],
  neck: [0.496, 0.196],
  ribbon: [0.578, 0.246],
  book: [0.337, 0.263],
  hairStrand: [0.18, 0.456],
  sun: [0.167, 0.719],
};
