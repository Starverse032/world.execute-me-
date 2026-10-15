// The point system, 23.226–34.40 (shots 10–13). One N = 1210 point array on a
// single Canvas 2D layer, with precomputed targets per state:
// silhouette-large → three build formations (phyllotaxis spiral, concentric
// hexagons, point globe; they change on the downbeats b56 and b60) → implosion →
// silhouette-small → 1D (even line) → 2D (even lattice) → 3D extrusion → circle.
// Axes, cube, beat rings and the loading spark are SVG.
// Spec: docs/design_v3.md, shots 10–13 and §5 moment B.
import React, {useLayoutEffect, useRef} from 'react';
import {beat, clamp01, CODE, ease, FPS, K, lastOnset, lerp, MATH, O, prog, pulse, rng, useT} from '../core';
import {KEYWORDS} from '../data';
import {Arrow, linePath, Plot, Spark, Svg} from '../geo';
import {textW} from '../ui';
import meta from '../char_meta.json';
import P from '../../../public/char/a_points.json';

const DEG = Math.PI / 180;
// Keyword frame from the shared timeline, so the shot lands with the stage keyword.
const kwFrame = (kw: string, fallback: number) => {
  const k = KEYWORDS.find((k) => k.kw === kw);
  return k ? Math.round(k.t * FPS) : fallback;
};

// ------------------------------------------------------------------ timing
const T_IN = 23.226; // b50: points replace the line art
const T_F2 = beat(56); // 25.997 downbeat: spiral → concentric hexagons
const T_F3 = beat(60); // 27.843 downbeat: hexagons → point globe
const MORPH = 0.5; // per-point formation change, easeInOutCubic
const MSPREAD = 0.15; // inner points move first (outward wave)
const T_IMP = 29.226; // b63: implosion
const T_IMP_END = 29.6;
const T_REL = 29.687; // b64: release
const T_AX = 30.4; // axes plotted 30.40–30.80
const T_AX_END = 30.8;
const T_PLBL = 30.6;
const T_1D = 31.12;
const T_1D_END = 31.8;
const T_2D = 31.9;
const T_2D_END = 32.6;
const F_3D = kwFrame('DIMENSION', 980); // keyword frame
const T_3D = F_3D / FPS;
const T_OUT = 33.41; // shot 13
const T_CONV_END = 33.95;
const T_PEN = 33.6; // the other engineer's circle pen
const T_PEN_END = 34.4;
const T_END = 34.4;

// ------------------------------------------------------------------ geometry
const N = 1210;
const PTS = (P as {points: number[][]}).points.slice(0, N);
const CLS = PTS.map((p) => p[2]);

// Moment A box (same as the line art: height 840, top 140, centred x 1260),
// including the art's held 1.025 push anchored at her feet (1260, 980).
const AH = 840;
const AW = (AH * meta.a.w) / meta.a.h;
const AX0 = 1260 - AW / 2;
const PUSH = 1.025;
const AXY = (nx: number, ny: number): [number, number] => {
  const x = AX0 + nx * AW, y = 140 + ny * AH;
  return [1260 + (x - 1260) * PUSH, 980 + (y - 980) * PUSH];
};

// Moment B box: height 480, bottom 610; the figure's bbox centred on x 960.
const BH = 480;
const BW = (BH * meta.a.w) / meta.a.h;
const bb = meta.a.bbox;
const BX0 = 960 - ((bb[0] + bb[2]) / 2) * BW;
const BY0 = 610 - BH;

const SC = {x: 960, y: 500}; // spiral / spark centre
const SR = 380;
const OX = 717, OY = 610; // axes origin
const XEND = 1560, YEND = 150;
const ZDIR = [14 / Math.hypot(14, 10), -10 / Math.hypot(14, 10)];
const ZEND: [number, number] = [OX + 260 * ZDIR[0], OY + 260 * ZDIR[1]];
const CC = {x: 960, y: 400, r: 160}; // circle (shot 13)

const ax = new Float32Array(N), ay = new Float32Array(N); // silhouette large
const spR = new Float32Array(N), spA = new Float32Array(N); // spiral polar (rad)
const bx = new Float32Array(N), by = new Float32Array(N); // silhouette small
const flowD = new Float32Array(N); // spiral flow delay
const relD = new Float32Array(N); // release jitter
const d1D = new Float32Array(N); // 1D delay
const x1D = new Float32Array(N); // 1D site on the x-axis
const lx = new Float32Array(N), ly = new Float32Array(N), layer = new Uint8Array(N); // 2D lattice
const d2D = new Float32Array(N);
const cx3 = new Float32Array(N), cy3 = new Float32Array(N); // circle slot
const convEnd = new Float32Array(N), fadeT = new Float32Array(N);

// inverse of easeInOutCubic
const invIOC = (y: number) => (y < 0.5 ? Math.cbrt(y / 4) : 1 - Math.cbrt(2 * (1 - y)) / 2);

// ------------------------------------------------------------------ build formations
// F1: phyllotaxis spiral (radius 380·√(k/N), k·137.508°), turning slowly.
const SPIN1 = 8; // °/s
const spiralRot = (t: number) => SPIN1 * (t - T_IN) * DEG;

// F2: 11 concentric pointy-top hexagons of evenly spaced points (radius 70–360,
// ~11.7 px apart, a point on every vertex). On b57–b59 alternate rings step
// ±10° (8 frames, easeInOutCubic), so after three steps they realign flat-top.
const HEX_K = 11;
const hexRk = (k: number) => 70 + 29 * k;
const hexRing = new Uint8Array(N), hexX0 = new Float32Array(N), hexY0 = new Float32Array(N);
(() => {
  let tot = 0;
  for (let k = 0; k < HEX_K; k++) tot += hexRk(k);
  const cnt: number[] = [];
  let used = 0;
  for (let k = 0; k < HEX_K - 1; k++) {
    cnt.push(6 * Math.round((N * hexRk(k)) / tot / 6));
    used += cnt[k];
  }
  cnt.push(N - used);
  let j = 0;
  for (let k = 0; k < HEX_K; k++) {
    const R = hexRk(k);
    for (let q = 0; q < cnt[k]; q++) {
      const s = (6 * q) / cnt[k];
      const seg = Math.floor(s), f = s - seg;
      const a0 = (-90 + 60 * seg) * DEG, a1 = (-90 + 60 * (seg + 1)) * DEG;
      hexRing[j] = k;
      hexX0[j] = R * lerp(Math.cos(a0), Math.cos(a1), f);
      hexY0[j] = R * lerp(Math.sin(a0), Math.sin(a1), f);
      j++;
    }
  }
})();
const HEX_STEPS = [57, 58, 59].map(beat);
const hexStep = (t: number) => {
  let a = 0;
  for (const tb of HEX_STEPS) a += 10 * prog(t, tb, tb + 8 / FPS, ease.inOutCubic);
  return a * DEG;
};
const HC = new Float32Array(HEX_K), HS = new Float32Array(HEX_K);
const setHexRot = (t: number) => {
  const a = hexStep(t);
  for (let k = 0; k < HEX_K; k++) {
    const ak = k % 2 ? -a : a;
    HC[k] = Math.cos(ak);
    HS[k] = Math.sin(ak);
  }
};
const hexXY = (j: number): [number, number] => {
  const k = hexRing[j];
  return [SC.x + hexX0[j] * HC[k] - hexY0[j] * HS[k], SC.y + hexX0[j] * HS[k] + hexY0[j] * HC[k]];
};

// F3: the world again, as a point globe (radius 350, tilted 12° toward the
// viewer like the shot-6 globe): 12 meridians × 55 points plus 7 parallels.
// It spins about its axis, 30°/s rising (easeInQuad) to 90°/s at the implosion;
// far-side points drop to 25 %.
const GR = 350;
const TILT = 12 * DEG;
const gLat = new Float32Array(N), gLon = new Float32Array(N);
(() => {
  let j = 0;
  for (let m = 0; m < 12; m++)
    for (let q = 0; q < 55; q++) {
      gLat[j] = (-78 + (156 * q) / 54) * DEG;
      gLon[j] = (30 * m + 15) * DEG;
      j++;
    }
  const lats = [0, 22.5, -22.5, 45, -45, 67.5, -67.5];
  const wsum = lats.reduce((s, l) => s + Math.cos(l * DEG), 0);
  const left = N - j;
  let used = 0;
  lats.forEach((l, li) => {
    const c = li === lats.length - 1 ? left - used : Math.round((left * Math.cos(l * DEG)) / wsum);
    used += c;
    for (let q = 0; q < c; q++) {
      gLat[j] = l * DEG;
      gLon[j] = ((360 * q) / c + (li % 2) * 7.5) * DEG;
      j++;
    }
  });
})();
const G_D = T_IMP - T_F3;
const globeSpin = (t: number) => {
  const u = Math.max(0, t - T_F3);
  const v = Math.min(u, G_D);
  return (30 * v + (60 * v * v * v) / (3 * G_D * G_D) + 90 * Math.max(0, u - G_D)) * DEG;
};
const CT = Math.cos(TILT), ST = Math.sin(TILT);
// Screen position and opacity of globe slot j at spin s.
const globeXYO = (j: number, s: number): [number, number, number] => {
  const cl = Math.cos(gLat[j]), lon = gLon[j] + s;
  const X = GR * cl * Math.sin(lon), Yu = GR * Math.sin(gLat[j]), Z = GR * cl * Math.cos(lon);
  const Y2 = Yu * CT - Z * ST, Z2 = Yu * ST + Z * CT;
  return [SC.x + X, SC.y - Y2, lerp(O.lo, 1, clamp01(0.5 + Z2 / (0.25 * GR)))];
};

// Point i → slot of the next formation, matched locally so a change reads as a
// reshaping rather than a swarm: both sets are cut into equal-count radius bands
// around the centre, and inside a band the angular orders are paired with the
// cyclic shift that moves points least.
const bandMatch = (sx: ArrayLike<number>, sy: ArrayLike<number>, dx: ArrayLike<number>, dy: ArrayLike<number>) => {
  const m = new Int32Array(N);
  const pol = (x: ArrayLike<number>, y: ArrayLike<number>) => {
    const r = new Float32Array(N), a = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      r[i] = Math.hypot(x[i] - SC.x, y[i] - SC.y);
      a[i] = Math.atan2(y[i] - SC.y, x[i] - SC.x);
    }
    return {r, a};
  };
  const S = pol(sx, sy), D = pol(dx, dy);
  const ids = () => Array.from({length: N}, (_, i) => i);
  const sR = ids().sort((p, q) => S.r[p] - S.r[q] || p - q);
  const dR = ids().sort((p, q) => D.r[p] - D.r[q] || p - q);
  const BAND = 55;
  for (let b0 = 0; b0 < N; b0 += BAND) {
    const sb = sR.slice(b0, b0 + BAND).sort((p, q) => S.a[p] - S.a[q] || p - q);
    const db = dR.slice(b0, b0 + BAND).sort((p, q) => D.a[p] - D.a[q] || p - q);
    const n = sb.length;
    let best = 0, bestCost = Infinity;
    for (let s = 0; s < n; s++) {
      let c = 0;
      for (let q = 0; q < n; q++) {
        const d = Math.abs(S.a[sb[q]] - D.a[db[(q + s) % n]]);
        c += Math.min(d, 2 * Math.PI - d);
      }
      if (c < bestCost) (bestCost = c), (best = s);
    }
    for (let q = 0; q < n; q++) m[sb[q]] = db[(q + best) % n];
  }
  return m;
};
const m2 = new Int32Array(N), m3 = new Int32Array(N); // point → hexagon slot, → globe slot
const dl2 = new Float32Array(N), dl3 = new Float32Array(N); // per-point start delays

(() => {
  let mx = 0, my = 0;
  for (let i = 0; i < N; i++) {
    const [nx, ny] = PTS[i];
    [ax[i], ay[i]] = AXY(nx, ny);
    bx[i] = BX0 + nx * BW;
    by[i] = BY0 + ny * BH;
    mx += ax[i];
    my += ay[i];
  }
  mx /= N;
  my /= N;
  // Spiral: rank by distance from her centroid; rank k → spiral index k.
  const byDist = Array.from({length: N}, (_, i) => i).sort((a, b) => Math.hypot(ax[a] - mx, ay[a] - my) - Math.hypot(ax[b] - mx, ay[b] - my));
  byDist.forEach((i, k) => {
    spR[i] = SR * Math.sqrt(k / N);
    spA[i] = ((k * 137.508) * Math.PI) / 180;
    flowD[i] = (0.25 * k) / N;
  });
  const r = rng(2117);
  for (let i = 0; i < N; i++) relD[i] = (Math.floor(r() * 4) / FPS);
  // 1D: left points move first, 0.25 s spread.
  let xmin = Infinity, xmax = -Infinity;
  for (let i = 0; i < N; i++) (xmin = Math.min(xmin, bx[i])), (xmax = Math.max(xmax, bx[i]));
  for (let i = 0; i < N; i++) d1D[i] = (0.25 * (bx[i] - xmin)) / (xmax - xmin);
  // 1D / 2D / 3D share one structure: rank the points by x; every 10 consecutive
  // points share a site s (121 sites). 1D: site s sits on the x-axis at
  // 717 + 6.9·s (evenly spaced up to the last tick, 1545). 2D: the line folds
  // column-major into the 11 × 11 lattice, column c = ⌊s/11⌋, row j = s mod 11,
  // so each run of 11 dots stands up as one column. 3D: the 10 points stacked
  // on a site are its layers 0–9.
  const byX = Array.from({length: N}, (_, i) => i).sort((a, b) => bx[a] - bx[b] || a - b);
  byX.forEach((i, q) => {
    const s = Math.floor(q / 10), c = Math.floor(s / 11), j = s % 11;
    x1D[i] = OX + ((1545 - OX) * s) / 120;
    lx[i] = OX + 36 * c;
    ly[i] = OY - 36 * j;
    layer[i] = q % 10;
    d2D[i] = 0.15 * (j / 10);
  });
  // Circle: slot by the angle of the 3D position around the circle centre
  // (12 o'clock, clockwise), slot s at 2πs/N.
  const ang = (i: number) => {
    const x = lx[i] + layer[i] * 14, y = ly[i] - layer[i] * 10;
    const a = Math.atan2(x - CC.x, -(y - CC.y));
    return a < 0 ? a + 2 * Math.PI : a;
  };
  const byAng = Array.from({length: N}, (_, i) => i).sort((a, b) => ang(a) - ang(b) || a - b);
  byAng.forEach((i, s) => {
    const th = (2 * Math.PI * s) / N;
    cx3[i] = CC.x + CC.r * Math.sin(th);
    cy3[i] = CC.y - CC.r * Math.cos(th);
    // the pen passes angle th at:
    const pass = T_PEN + (T_PEN_END - T_PEN) * invIOC(s / N);
    // arrive just before the pen (never later than 33.95, never before 33.70)
    convEnd[i] = Math.max(33.7, Math.min(T_CONV_END, pass - 1 / FPS));
    // fade start: when the pen has passed and the point has landed
    fadeT[i] = Math.min(Math.max(pass, convEnd[i]), T_END - 3 / FPS);
  });
})();

// Formation matching (spiral → hexagons at b56, hexagons → globe at b60),
// evaluated mid-change.
(() => {
  const sx = new Float32Array(N), sy = new Float32Array(N), dx = new Float32Array(N), dy = new Float32Array(N);
  const tA = T_F2 + 0.3;
  for (let i = 0; i < N; i++) {
    const a = spA[i] + spiralRot(tA);
    sx[i] = SC.x + spR[i] * Math.cos(a);
    sy[i] = SC.y + spR[i] * Math.sin(a);
  }
  setHexRot(tA);
  for (let j = 0; j < N; j++) [dx[j], dy[j]] = hexXY(j);
  m2.set(bandMatch(sx, sy, dx, dy));
  for (let i = 0; i < N; i++) dl2[i] = MSPREAD * clamp01(spR[i] / SR);
  const tB = T_F3 + 0.3;
  setHexRot(tB);
  for (let i = 0; i < N; i++) [sx[i], sy[i]] = hexXY(m2[i]);
  const s = globeSpin(tB);
  for (let j = 0; j < N; j++) [dx[j], dy[j]] = globeXYO(j, s);
  m3.set(bandMatch(sx, sy, dx, dy));
  for (let i = 0; i < N; i++) dl3[i] = MSPREAD * clamp01(Math.hypot(hexX0[m2[i]], hexY0[m2[i]]) / 360);
})();

// ------------------------------------------------------------------ beats
// Pulse onsets (detected within ±40 ms, else nominal) for beats n.
const onset = (n: number) => lastOnset(beat(n) + 0.041);
const RAY_BEATS = Array.from({length: 12}, (_, i) => beat(51 + i)); // b51..b62

// Beat fronts: on every beat b52–b62 (once the points have nearly settled) a
// ring leaves the hub and sweeps the formation; points flash (grow and push
// out) as it passes. Downbeats are heavier; from b60 (27.84) off-beat eighths
// add a lighter cream front.
type Front = {t: number; kind: 0 | 1 | 2}; // 0 beat, 1 downbeat, 2 eighth
const FRONTS: Front[] = [];
for (let n = 52; n <= 62; n++) {
  FRONTS.push({t: onset(n), kind: n % 4 === 0 ? 1 : 0});
  if (n >= 60) FRONTS.push({t: beat(n + 0.5), kind: 2});
}
const FR_DUR = [0.42, 0.55, 0.32];
const FR_R1 = [420, 450, 390];
const FR_AMP = [1, 1, 0.55];
const frontR = (f: Front, u: number) => 50 + (FR_R1[f.kind] - 50) * ease.outCubic(u);
const frontU = (f: Front, t: number) => (t - f.t) / FR_DUR[f.kind];

// ------------------------------------------------------------------ point positions
const out = {x: new Float32Array(N), y: new Float32Array(N), o: new Float32Array(N), r: new Float32Array(N)};
const morph = (dt: number) => ease.inOutCubic(clamp01(dt / MORPH));

const solve = (t: number) => {
  const {x, y, o, r} = out;
  r.fill(1.8);
  if (t < T_IMP_END) {
    const fin = clamp01((t - T_IN) / (3 / FPS));
    const imp = prog(t, T_IMP, T_IMP_END, ease.inCubic);
    const rot1 = spiralRot(t);
    const f2 = t >= T_F2, f3 = t >= T_F3;
    if (f2) setHexRot(t);
    const s3 = globeSpin(t);
    // fronts in flight
    const fr: number[] = [], fa: number[] = [];
    for (const f of FRONTS) {
      const u = frontU(f, t);
      if (u >= 0 && u < 1) fr.push(frontR(f, u)), fa.push(FR_AMP[f.kind] * (1 - u));
    }
    for (let i = 0; i < N; i++) {
      let px: number, py: number, po = 1;
      if (!f3) {
        const a = spA[i] + rot1;
        px = SC.x + spR[i] * Math.cos(a);
        py = SC.y + spR[i] * Math.sin(a);
        if (!f2) {
          const p = ease.inOutCubic(clamp01((t - T_IN - flowD[i]) / 1.0));
          px = lerp(ax[i], px, p);
          py = lerp(ay[i], py, p);
        } else {
          const [hx, hy] = hexXY(m2[i]);
          const p = morph(t - T_F2 - dl2[i]);
          px = lerp(px, hx, p);
          py = lerp(py, hy, p);
        }
      } else {
        const [hx, hy] = hexXY(m2[i]);
        const [gx, gy, go] = globeXYO(m3[i], s3);
        const p = morph(t - T_F3 - dl3[i]);
        px = lerp(hx, gx, p);
        py = lerp(hy, gy, p);
        po = lerp(1, go, p);
      }
      // beat fronts: flash and push out the points the front is passing
      const dx = px - SC.x, dy = py - SC.y;
      const rr = Math.hypot(dx, dy);
      let w = 0;
      for (let q = 0; q < fr.length; q++) w = Math.max(w, clamp01(1 - Math.abs(rr - fr[q]) / 18) * fa[q]);
      const k = 1 + 0.035 * w;
      x[i] = lerp(SC.x + dx * k, SC.x, imp);
      y[i] = lerp(SC.y + dy * k, SC.y, imp);
      o[i] = imp >= 1 ? 0 : fin * po;
      r[i] = 1.8 + 1.4 * w;
    }
    return;
  }
  if (t < T_REL) {
    o.fill(0);
    return;
  }
  if (t < T_1D) {
    for (let i = 0; i < N; i++) {
      const p = ease.outExpo(clamp01((t - T_REL - relD[i]) / 0.45));
      x[i] = lerp(SC.x, bx[i], p);
      y[i] = lerp(SC.y, by[i], p);
      o[i] = t >= T_REL + relD[i] ? 1 : 0;
    }
    return;
  }
  if (t < T_2D) {
    for (let i = 0; i < N; i++) {
      const p = ease.inOutCubic(clamp01((t - T_1D - d1D[i]) / (T_1D_END - T_1D - 0.25)));
      x[i] = lerp(bx[i], x1D[i], p);
      y[i] = lerp(by[i], OY, p);
      o[i] = 1;
    }
    return;
  }
  if (t < T_3D) {
    for (let i = 0; i < N; i++) {
      const p = ease.inOutCubic(clamp01((t - T_2D - d2D[i]) / (T_2D_END - T_2D - 0.15)));
      x[i] = lerp(x1D[i], lx[i], p);
      y[i] = lerp(OY, ly[i], p);
      o[i] = 1;
    }
    return;
  }
  const ex = prog(t, T_3D, T_3D + 8 / FPS, ease.outExpo);
  for (let i = 0; i < N; i++) {
    const k = layer[i];
    const x3 = lx[i] + 14 * k * ex, y3 = ly[i] - 10 * k * ex;
    const o3 = 1 - 0.07 * k * ex;
    if (t < T_OUT) {
      x[i] = x3;
      y[i] = y3;
      o[i] = o3;
    } else {
      const p = ease.inOutCubic(clamp01((t - T_OUT) / (convEnd[i] - T_OUT)));
      x[i] = lerp(x3, cx3[i], p);
      y[i] = lerp(y3, cy3[i], p);
      o[i] = lerp(o3, 1, p) * (1 - clamp01((t - fadeT[i]) / (3 / FPS)));
    }
  }
};

// ------------------------------------------------------------------ canvas layer
const PointCanvas: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext('2d')!;
    g.clearRect(0, 0, 1920, 1080);
    solve(t);
    // breathing on every beat after the release; before it, the beat-front flash
    const breathe = t >= T_REL ? 1.8 + 0.5 * pulse(t) : 0;
    const {x, y, o, r} = out;
    for (let i = 0; i < N; i++) {
      const a = o[i] * (CLS[i] === 2 ? 0.5 : 1);
      if (a <= 0.003) continue;
      g.globalAlpha = a;
      g.fillStyle = CLS[i] === 1 ? K.orange : K.cream;
      g.beginPath();
      g.arc(x[i], y[i], breathe || r[i], 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
  }, [frame, t]);
  return <canvas ref={ref} width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}} />;
};

// ------------------------------------------------------------------ axes, cube
const XTICKS = Array.from({length: 23}, (_, k) => OX + 36 * (k + 1)); // up to 1545
const YTICKS = Array.from({length: 12}, (_, k) => OY - 36 * (k + 1)); // up to 178
const D_X = linePath(OX, OY, XEND, OY);
const D_Y = linePath(OX, OY, OX, YEND);
const D_Z = linePath(OX, OY, ZEND[0], ZEND[1]);
const CUBE: string[] = (() => {
  const f = [
    [OX, OY],
    [OX + 360, OY],
    [OX + 360, OY - 360],
    [OX, OY - 360],
  ];
  const b = f.map(([u, v]) => [u + 126, v - 90]);
  const e = (p: number[], q: number[]) => linePath(p[0], p[1], q[0], q[1]);
  return [e(f[0], f[1]), e(f[0], f[3]), e(f[1], f[2]), e(f[3], f[2]), e(f[0], b[0]), e(f[1], b[1]), e(f[2], b[2]), e(f[3], b[3]), e(b[0], b[1]), e(b[0], b[3]), e(b[1], b[2]), e(b[3], b[2])];
})();

// Text exit: lift 14 px and fade over 5 frames.
const lift = (t: number, at: number) => prog(t, at, at + 5 / FPS);

const LBL_P = [
  {s: 'P = {p', sub: false},
  {s: '1', sub: true},
  {s: ', …, p', sub: false},
  {s: 'n', sub: true},
  {s: '}', sub: false},
];
const F_MAIN = `italic 400 32px ${MATH}`;
const F_SUB = `italic 400 21px ${MATH}`;

const SetLabel: React.FC<{t: number}> = ({t}) => {
  const total = LBL_P.reduce((s, g) => s + g.s.length, 0);
  const shown = Math.floor(clamp01((t - T_PLBL) / (8 / FPS)) * total + 1e-6);
  if (shown <= 0) return null;
  const ex = lift(t, T_OUT);
  if (ex >= 1) return null;
  const widths = LBL_P.map((g) => textW(g.s, g.sub ? F_SUB : F_MAIN));
  let x = 1560 - widths.reduce((a, b) => a + b, 0);
  let left = shown;
  const parts: React.ReactNode[] = [];
  LBL_P.forEach((g, i) => {
    if (left > 0) {
      parts.push(
        <text key={i} x={x} y={170 + (g.sub ? 7 : 0)} fontFamily={MATH} fontStyle="italic" fontSize={g.sub ? 21 : 32} fill={K.cream}>
          {g.s.slice(0, left)}
        </text>,
      );
    }
    left -= g.s.length;
    x += widths[i];
  });
  return (
    <g opacity={O.hi * (1 - ex)} transform={`translate(0 ${-14 * ex})`}>
      {parts}
    </g>
  );
};

const DimLabel: React.FC<{t: number}> = ({t}) => {
  if (t < T_1D) return null;
  const ex = lift(t, T_OUT);
  if (ex >= 1) return null;
  const dim = t >= T_3D ? 3 : t >= T_2D ? 2 : 1;
  const s = `dim = ${dim}`;
  const n = Math.min(s.length, Math.floor(((t - T_1D) * FPS + 1) * 5));
  const font = `400 22px ${CODE}`;
  const x = 1560 - textW(s, font);
  return (
    <text x={x} y={650 - 14 * ex} fontFamily={CODE} fontSize={22} fill={K.cream} opacity={O.hi * (1 - ex)}>
      {s.slice(0, n)}
    </text>
  );
};

const Axes: React.FC<{t: number}> = ({t}) => {
  if (t < T_AX || t > T_CONV_END + 0.05) return null;
  const pIn = prog(t, T_AX, T_AX_END, ease.inOutCubic);
  const pOut = 1 - prog(t, T_OUT, T_CONV_END, ease.inOutCubic);
  const p = Math.min(pIn, pOut);
  if (p <= 0) return null;
  const xNow = lerp(OX, XEND, p), yNow = lerp(OY, YEND, p);
  // z-axis: shoots out in 4 frames on the keyword frame
  const pz = t >= T_3D ? Math.min(prog(t, T_3D, T_3D + 4 / FPS, ease.outExpo), pOut) : 0;
  // cube edges retract faster than the axes so no stray fragments linger
  const pcOut = 1 - prog(t, T_OUT, T_OUT + 8 / FPS, ease.inOutCubic);
  const pc = t >= T_3D ? Math.min(prog(t, T_3D, T_3D + 10 / FPS, ease.inOutCubic), pcOut) : 0;
  const pen = t < T_OUT; // pens only while drawing in; retractions are bare
  return (
    <>
      {pc > 0 && CUBE.map((d, i) => <Plot key={i} d={d} p={pc} w={1} opacity={O.mid} pen={false} />)}
      {XTICKS.filter((tx) => tx <= xNow).map((tx) => (
        <path key={`x${tx}`} d={linePath(tx, OY, tx, OY + 6)} stroke={K.cream} strokeWidth={1} opacity={O.mid} />
      ))}
      {YTICKS.filter((ty) => ty >= yNow).map((ty) => (
        <path key={`y${ty}`} d={linePath(OX - 6, ty, OX, ty)} stroke={K.cream} strokeWidth={1} opacity={O.mid} />
      ))}
      <Plot d={D_X} p={p} w={1.5} opacity={O.hi} t={t} pen={pen} cap="square" />
      <Plot d={D_Y} p={p} w={1.5} opacity={O.hi} t={t} pen={pen} cap="square" />
      {p >= 1 && (
        <>
          <Arrow x={XEND} y={OY} angle={0} size={10} w={1.5} opacity={O.hi} />
          <Arrow x={OX} y={YEND} angle={-90} size={10} w={1.5} opacity={O.hi} />
        </>
      )}
      {pz > 0 && <Plot d={D_Z} p={pz} w={2} color={K.orange} t={t} pen={pen} cap="butt" />}
      {pz >= 1 && <Arrow x={ZEND[0]} y={ZEND[1]} angle={(Math.atan2(ZDIR[1], ZDIR[0]) * 180) / Math.PI} size={10} w={2} color={K.orange} />}
    </>
  );
};

// ------------------------------------------------------------------ spark and rings
// The beat fronts as rings from the hub: orange on beats (2 px on downbeats),
// 1 px cream on the off-beat eighths.
const FR_W = [1.5, 2, 1];
const FR_O = [0.8, 1, O.mid];
const Rings: React.FC<{t: number}> = ({t}) => (
  <>
    {FRONTS.map((f, i) => {
      const u = frontU(f, t);
      if (u < 0 || u >= 1) return null;
      return (
        <circle
          key={i}
          cx={SC.x}
          cy={SC.y}
          r={Math.round(frontR(f, u) * 100) / 100}
          fill="none"
          stroke={f.kind === 2 ? K.cream : K.orange}
          strokeWidth={FR_W[f.kind]}
          opacity={FR_O[f.kind] * (1 - u)}
        />
      );
    })}
  </>
);

const LoadSpark: React.FC<{t: number}> = ({t}) => {
  if (t < T_IN || t > T_REL + 6 / FPS) return null;
  let rays = 0;
  for (const tb of RAY_BEATS) rays += clamp01((t - tb) / (4 / FPS));
  // the hub forms as the points start flowing in, together with the first ray
  // (alone at 23.23 it would read as a loose dot far from the figure)
  const hub = prog(t, RAY_BEATS[0], RAY_BEATS[0] + 4 / FPS, ease.outExpo);
  const grow = prog(t, T_IMP, T_IMP_END, ease.inOutCubic);
  const shrink = 1 - prog(t, T_REL, T_REL + 6 / FPS, ease.inCubic);
  const beatPulse = t < T_IMP ? 1 + 0.12 * pulse(t) : 1; // the hub kicks on every beat of the build
  const R = 44 * (1 + 0.5 * grow) * shrink * beatPulse;
  return <Spark x={SC.x} y={SC.y} R={R} rays={rays} hub={hub} />;
};

// ------------------------------------------------------------------ export
export const Points: React.FC = () => {
  const {t, frame} = useT();
  if (t < T_IN - 0.001 || t > T_END + 0.1) return null;
  return (
    <>
      <Svg>
        <Axes t={t} />
      </Svg>
      <PointCanvas t={t} frame={frame} />
      <Svg>
        <Rings t={t} />
        <LoadSpark t={t} />
        <SetLabel t={t} />
        <DimLabel t={t} />
      </Svg>
    </>
  );
};
