// The C2 point engine: one N = 1210 point array on one Canvas 2D layer.
//   C14 → C15 (f5426–183.6): `read` silhouette → the two function panels' samples,
//     each point fading as its panel pen passes it.
//   C18 → C19 (f5742–195.8): `sit` silhouette (clipped to the heart, beating with
//     it) → a uniform heart fill (done 192.135) → the samples along figure F's six
//     strokes, each point fading as its stroke's pen passes it.
// Spec: docs/design_full.md C14–C19 (fix 10: the heart fill).
import React, {useLayoutEffect, useRef} from 'react';
import {clamp01, ease, K, lerp, rng} from '../core';
import RP from '../../../public/char/read_points.json';
import SP from '../../../public/char/sit_points.json';
import {F, F_CUT18, hX, hY, HC, heartbeat, HEART_CLIP_1, inHeart, invIOC, invIOS, T_UNHEART, TAU} from './C2_lib';
import {FS} from './C2_fig';

const N = 1210;
type Raw = {points: number[][]};
const RPTS = (RP as Raw).points.slice(0, N);
const SPTS = (SP as Raw).points.slice(0, N);
const RCLS = RPTS.map((p) => p[2]);
const SCLS = SPTS.map((p) => p[2]);
const ids = () => Array.from({length: N}, (_, i) => i);

// ------------------------------------------------------------------ timing
export const F_CUT14 = 5426; // read fills cut out, lines → points
export const T_REL = 180.9; // release to the panels
const REL_DUR = 0.95;
export const T_PEN0 = 182.1; // panel pens
export const T_PEN1 = 183.5;
const T_FILL1 = 192.135; // heart fill done
const FILL_DUR = T_FILL1 - F(F_CUT18) - 0.25;
const T_FLOW_F = T_UNHEART; // flow onto F
export const T_FPLOT = 195.25; // F strokes plot, 6 frames each, 2-frame stagger
export const FPLOT_DUR = 6 / 30;
export const FPLOT_STAG = 2 / 30;

// ------------------------------------------------------------------ geometry
// Read box (C14): h 560, top 110, centred x 1240, held at the 1.02 push about (1240, 390).
export const RB = {x: 1240 - (560 * 1120) / 1680 / 2, y: 110, w: (560 * 1120) / 1680, h: 560};
const PUSH = 1.02;
// Sit box (C17). The design's h 300 box (x 1140–1340) let the art's own cropped
// edges (her hair runs off the source canvas at ny 0.44–0.94) show as straight
// vertical cuts inside the heart; at h 480, top 272 (x 1080–1400) every edge row
// lies outside the heart, so only the heart cuts her: head top y 287 under the
// notch (264), the skirt cut into the V.
export const SB = {x: 1080, y: 272, w: 320, h: 480};
// Panels (C15): t ∈ [0, 2π] → x 180–780.
export const PANEL = {x0: 180, x1: 780, xc: 230, xk: 5.5, yc: 480, yk: 5};
export const panelX = (tp: number) => PANEL.x0 + ((PANEL.x1 - PANEL.x0) * tp) / TAU;

const rx = new Float32Array(N), ry = new Float32Array(N); // read silhouette (pushed)
const px = new Float32Array(N), py = new Float32Array(N); // panel sample
const dRel = new Float32Array(N), passP = new Float32Array(N);
const sx = new Float32Array(N), sy = new Float32Array(N); // sit silhouette
const hx = new Float32Array(N), hy = new Float32Array(N); // heart fill slot
const dFill = new Float32Array(N);
const fx = new Float32Array(N), fy = new Float32Array(N); // F sample
const dF = new Float32Array(N), passF = new Float32Array(N);

// Pair two point sets locally: cut both into equal-count bands by y, and pair the
// x orders inside each band (so nobody crosses the whole figure).
const bandPair = (ax: ArrayLike<number>, ay: ArrayLike<number>, bx: ArrayLike<number>, by: ArrayLike<number>, band: number) => {
  const m = new Int32Array(N);
  const A = ids().sort((p, q) => ay[p] - ay[q] || p - q);
  const B = ids().sort((p, q) => by[p] - by[q] || p - q);
  for (let b0 = 0; b0 < N; b0 += band) {
    const a = A.slice(b0, b0 + band).sort((p, q) => ax[p] - ax[q] || p - q);
    const b = B.slice(b0, b0 + band).sort((p, q) => bx[p] - bx[q] || p - q);
    a.forEach((i, k) => (m[i] = b[k]));
  }
  return m;
};

// Uniform heart fill: a seeded jittered grid inside the heart scaled 0.85 about
// HC, exactly N points (spacing found by bisection, extras dropped at random).
const FILL = (() => {
  const k = 0.85;
  const gen = (d: number) => {
    const r = rng(5741);
    const out: [number, number][] = [];
    for (let y = 120; y <= 680; y += d)
      for (let x = 940; x <= 1540; x += d) {
        const jx = x + (r() - 0.5) * 0.6 * d, jy = y + (r() - 0.5) * 0.6 * d;
        if (inHeart(jx, jy, k)) out.push([jx, jy]);
      }
    return out;
  };
  let lo = 6, hi = 20;
  for (let it = 0; it < 30; it++) {
    const mid = (lo + hi) / 2;
    if (gen(mid).length >= N) lo = mid;
    else hi = mid;
  }
  const pts = gen(lo);
  const r = rng(191);
  while (pts.length > N) pts.splice(Math.floor(r() * pts.length), 1);
  return pts;
})();

(() => {
  // --- read → panels
  for (let i = 0; i < N; i++) {
    const [nx, ny] = RPTS[i];
    const x = RB.x + nx * RB.w, y = RB.y + ny * RB.h;
    rx[i] = 1240 + (x - 1240) * PUSH;
    ry[i] = 390 + (y - 390) * PUSH;
  }
  const byY = ids().sort((a, b) => RPTS[a][1] - RPTS[b][1] || a - b);
  const halves = [byY.slice(0, 605), byY.slice(605)];
  halves.forEach((h, which) => {
    h.sort((a, b) => RPTS[a][0] - RPTS[b][0] || a - b);
    h.forEach((pi, i) => {
      const tp = (TAU * i) / 604;
      px[pi] = panelX(tp);
      py[pi] = which === 0 ? PANEL.xc - PANEL.xk * hX(tp) : PANEL.yc - PANEL.yk * hY(tp);
      dRel[pi] = (0.25 * i) / 605;
      // the pens run t 0 → 2π with easeInOutSine over 182.10–183.50
      passP[pi] = T_PEN0 + (T_PEN1 - T_PEN0) * invIOS(i / 604);
    });
  });
  // --- sit → heart fill (y bands, x order inside a band); top rows move first
  for (let i = 0; i < N; i++) {
    sx[i] = SB.x + SPTS[i][0] * SB.w;
    sy[i] = SB.y + SPTS[i][1] * SB.h;
  }
  const fX = FILL.map((p) => p[0]), fY = FILL.map((p) => p[1]);
  const mFill = bandPair(sx, sy, fX, fY, 40);
  const sRank = ids().sort((a, b) => sy[a] - sy[b] || a - b);
  sRank.forEach((i, r) => {
    hx[i] = fX[mFill[i]];
    hy[i] = fY[mFill[i]];
    dFill[i] = (0.25 * r) / N;
  });
  // --- heart fill → F samples: y-rank to y-rank
  const hRank = ids().sort((a, b) => hy[a] - hy[b] || a - b);
  const fRank = ids().sort((a, b) => FS.y[a] - FS.y[b] || a - b);
  hRank.forEach((i, r) => {
    const j = fRank[r];
    fx[i] = FS.x[j];
    fy[i] = FS.y[j];
    dF[i] = (0.25 * r) / N;
    const s = FS.part[j];
    passF[i] = T_FPLOT + s * FPLOT_STAG + FPLOT_DUR * invIOC(FS.u[j]);
  });
})();

// ------------------------------------------------------------------ canvas
let heartPath: Path2D | null = null;

export const C2_POINTS_FROM = F(F_CUT14);
export const C2_POINTS_TO = 196.2;
const READ_END = T_PEN1 + 5 / 30;

const dot = (g: CanvasRenderingContext2D, x: number, y: number, a: number, cls: number) => {
  const o = a * (cls === 2 ? 0.5 : 1);
  if (o <= 0.003) return;
  g.globalAlpha = o;
  g.fillStyle = cls === 1 ? K.orange : K.cream;
  g.beginPath();
  g.arc(x, y, 1.8, 0, Math.PI * 2);
  g.fill();
};

export const PointCanvas: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext('2d')!;
    g.clearRect(0, 0, 1920, 1080);
    if (frame >= F_CUT14 && t < READ_END) {
      // C14 exit → C15: her points flow into the panels' samples
      const fin = clamp01((frame - F_CUT14 + 1) / 3);
      for (let i = 0; i < N; i++) {
        const p = ease.inOutCubic(clamp01((t - T_REL - dRel[i]) / REL_DUR));
        const a = fin * (1 - clamp01((t - passP[i]) / (4 / 30)));
        dot(g, lerp(rx[i], px[i], p), lerp(ry[i], py[i], p), a, RCLS[i]);
      }
    } else if (frame >= F_CUT18 && t < C2_POINTS_TO) {
      const fin = clamp01((frame - F_CUT18 + 1) / 3);
      if (t < T_FLOW_F) {
        // C18: silhouette → heart fill, clipped to the heart, beating with it
        const s = heartbeat(t);
        g.save();
        g.translate(HC.x, HC.y);
        g.scale(s, s);
        g.translate(-HC.x, -HC.y);
        if (!heartPath) heartPath = new Path2D(HEART_CLIP_1);
        g.clip(heartPath);
        for (let i = 0; i < N; i++) {
          const p = ease.inOutCubic(clamp01((t - F(F_CUT18) - dFill[i]) / FILL_DUR));
          dot(g, lerp(sx[i], hx[i], p), lerp(sy[i], hy[i], p), fin, SCLS[i]);
        }
        g.restore();
      } else {
        // C19: heart fill → figure F; each point fades as its stroke's pen passes
        for (let i = 0; i < N; i++) {
          const p = ease.inOutCubic(clamp01((t - T_FLOW_F - dF[i]) / 1.0));
          const a = 1 - clamp01((t - passF[i]) / (3 / 30));
          dot(g, lerp(hx[i], fx[i], p), lerp(hy[i], fy[i], p), a, SCLS[i]);
        }
      }
    }
    g.globalAlpha = 1;
  }, [frame, t]);
  return <canvas ref={ref} width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}} />;
};
