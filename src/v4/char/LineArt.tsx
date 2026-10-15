// <LineArt>: crisp line-art character from public/la (docs/design_v4.md §3.8).
//
// Assets per pose: la/<pose>_ink.png (cream ink with alpha, 2× source px) and
// la/<pose>.json {w, h, strokes: number[][] (flat x,y polylines in source px,
// in plotting order), sil: string (SVG path of the outer silhouette)}.
// A missing pose falls back to 'stand' (console.warn) with the same props.
//
// Everything is drawn in one <svg> whose viewBox is the (cropped) source, so
// the PNG and the vector strokes stay sharp at any display size up to 2×.
import React, {useRef, useEffect, useId, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {clamp01, ease, FPS, K, pulse, useT} from '../../v3/core';
import {hash, hashS} from '../chaos';
import type {P2} from '../shell/lib';

// ------------------------------------------------------------------ pose data
export type PoseJson = {w: number; h: number; strokes: number[][]; sil: string};
export type PoseRec = {
  name: string; // requested name
  src: string; // pose actually used (differs when it fell back)
  w: number;
  h: number;
  img: string;
  sil: string;
  strokes: number[][];
  d: string[]; // per-stroke path strings
  len: Float64Array; // per-stroke length
  cum: Float64Array[]; // per-stroke cumulative segment lengths
  before: Float64Array; // total length of all earlier strokes
  total: number;
  maxLen: number;
  bbox: [number, number, number, number];
};

const cache = new Map<string, PoseRec>();
const pending = new Map<string, Promise<PoseRec>>();
const r1 = (v: number) => Math.round(v * 10) / 10;

const build = (name: string, src: string, j: PoseJson): PoseRec => {
  const n = j.strokes.length;
  const d: string[] = new Array(n);
  const len = new Float64Array(n);
  const cum: Float64Array[] = new Array(n);
  const before = new Float64Array(n);
  let total = 0, x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i < n; i++) {
    const s = j.strokes[i];
    const m = s.length >> 1;
    const c = new Float64Array(Math.max(1, m));
    let dd = `M${r1(s[0])} ${r1(s[1])}`;
    let L = 0;
    for (let k = 1; k < m; k++) {
      L += Math.hypot(s[2 * k] - s[2 * k - 2], s[2 * k + 1] - s[2 * k - 1]);
      c[k] = L;
      dd += `L${r1(s[2 * k])} ${r1(s[2 * k + 1])}`;
    }
    if (m === 1) dd += `l0.1 0`;
    for (let k = 0; k < m; k++) {
      x0 = Math.min(x0, s[2 * k]);
      x1 = Math.max(x1, s[2 * k]);
      y0 = Math.min(y0, s[2 * k + 1]);
      y1 = Math.max(y1, s[2 * k + 1]);
    }
    d[i] = dd;
    len[i] = L;
    cum[i] = c;
    before[i] = total;
    total += L;
  }
  return {name, src, w: j.w, h: j.h, img: staticFile(`la/${src}_ink.png`), sil: j.sil, strokes: j.strokes, d, len, cum, before, total, maxLen: len.reduce((m, l) => Math.max(m, l), 0), bbox: [x0, y0, x1, y1]};
};

const preloadImg = (url: string) =>
  new Promise<void>((res) => {
    const im = new Image();
    im.onload = () => (im.decode ? im.decode().then(() => res(), () => res()) : res());
    im.onerror = () => res();
    im.src = url;
  });

const fetchJson = async (pose: string): Promise<PoseJson> => {
  const r = await fetch(staticFile(`la/${pose}.json`));
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()) as PoseJson;
};

// Loads (once per pose, module-level cache) the JSON and the ink PNG.
export const loadPose = (pose: string): Promise<PoseRec> => {
  const hit = cache.get(pose);
  if (hit) return Promise.resolve(hit);
  let p = pending.get(pose);
  if (!p) {
    p = (async () => {
      let src = pose;
      let j: PoseJson;
      try {
        j = await fetchJson(pose);
      } catch (e) {
        if (pose === 'stand') throw e;
        console.warn(`LineArt: pose '${pose}' not found (la/${pose}.json), falling back to 'stand'`);
        src = 'stand';
        j = await fetchJson('stand');
      }
      const rec = build(pose, src, j);
      await preloadImg(rec.img);
      cache.set(pose, rec);
      return rec;
    })();
    pending.set(pose, p);
  }
  return p;
};

// One delayRender per pose and tab, released when the pose has loaded.
const handles = new Map<string, number>();
const ensureLoading = (pose: string) => {
  if (cache.has(pose) || handles.has(pose)) return;
  const h = delayRender(`LineArt pose ${pose}`, {timeoutInMilliseconds: 60000});
  handles.set(pose, h);
  loadPose(pose)
    .catch((e) => console.warn('LineArt: failed to load', pose, e))
    .finally(() => requestAnimationFrame(() => requestAnimationFrame(() => continueRender(h))));
};
// Preload poses ahead of time (e.g. at module level in a section file).
export const preloadPoses = (...poses: string[]) => poses.forEach(ensureLoading);

// SVG <image> that holds the frame until the bitmap has loaded/decoded, so a
// freshly mounted LineArt is never captured blank.
const InkImage: React.FC<React.SVGProps<SVGImageElement>> = (props) => {
  const [h] = useState(() => delayRender('LineArt ink image', {timeoutInMilliseconds: 30000}));
  const done = useRef(false);
  const release = () => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(() => requestAnimationFrame(() => continueRender(h)));
  };
  useEffect(() => {
    const fallback = setTimeout(release, 8000);
    return () => {
      clearTimeout(fallback);
      release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <image {...props} onLoad={release} onError={release} />;
};

// Hook: the pose record (null until loaded; the render is held meanwhile).
// A per-component delayRender is held from the first null render until the
// re-render that has the pose has committed, so a frame is never captured
// between "pose loaded" and "component re-rendered with it".
export const usePose = (pose: string): PoseRec | null => {
  const [, force] = useState(0);
  ensureLoading(pose);
  const rec = cache.get(pose) ?? null;
  const hold = useRef<number | null>(null);
  if (!rec && hold.current === null) hold.current = delayRender(`usePose ${pose}`, {timeoutInMilliseconds: 60000});
  useEffect(() => {
    if (rec) return;
    let live = true;
    const bump = () => live && force((x) => x + 1);
    loadPose(pose).then(bump, bump);
    return () => {
      live = false;
    };
  }, [pose, rec]);
  useEffect(() => {
    if (rec && hold.current !== null) {
      const h = hold.current;
      hold.current = null;
      requestAnimationFrame(() => continueRender(h));
    }
  }, [rec]);
  useEffect(
    () => () => {
      if (hold.current !== null) continueRender(hold.current);
      hold.current = null;
    },
    [],
  );
  return rec;
};

// Source size of a pose (from the cache; 1024×1536 until it has loaded —
// call usePose(pose) in the same component first to be exact).
export const poseSize = (pose: string) => {
  const r = cache.get(pose);
  return r ? {w: r.w, h: r.h} : {w: 1024, h: 1536};
};

// n points evenly spaced (by arc length) along the strokes, in plotting order,
// in source px. The phase of the spacing is seeded. [] until the pose loaded.
export const strokePoints = (pose: string | PoseRec, n: number, seed = 1): P2[] => {
  const r = typeof pose === 'string' ? cache.get(pose) : pose;
  if (!r || n <= 0) return [];
  const step = r.total / n;
  const out: P2[] = [];
  let target = hash(seed, 1) * step;
  for (let i = 0; i < r.strokes.length && out.length < n; i++) {
    const s = r.strokes[i], c = r.cum[i], L = r.len[i], b = r.before[i];
    while (target <= b + L && out.length < n) {
      const local = target - b;
      let k = 1;
      while (k < c.length - 1 && c[k] < local) k++;
      const seg = c[k] - c[k - 1] || 1;
      const u = c.length > 1 ? clamp01((local - c[k - 1]) / seg) : 0;
      const i0 = c.length > 1 ? k - 1 : 0, i1 = c.length > 1 ? k : 0;
      out.push([s[2 * i0] + (s[2 * i1] - s[2 * i0]) * u, s[2 * i0 + 1] + (s[2 * i1 + 1] - s[2 * i0 + 1]) * u]);
      target += step;
    }
  }
  return out;
};

// Reveal schedule: the strokes that touch the crop (all strokes without a
// crop), with their cumulative length, so a cropped reveal spans [t0, t1].
type Sched = {idx: Int32Array; before: Float64Array; total: number};
const schedCache = new Map<string, Sched>();
const schedule = (r: PoseRec, crop?: [number, number, number, number]): Sched => {
  const key = r.name + '|' + (crop ? crop.join(',') : '');
  const hit = schedCache.get(key);
  if (hit) return hit;
  const idx: number[] = [];
  const m = 10;
  for (let i = 0; i < r.strokes.length; i++) {
    const st = r.strokes[i];
    let inside = !crop;
    for (let k = 0; !inside && k < st.length; k += 2) inside = st[k] >= crop![0] - m && st[k] <= crop![2] + m && st[k + 1] >= crop![1] - m && st[k + 1] <= crop![3] + m;
    if (inside) idx.push(i);
  }
  const before = new Float64Array(idx.length);
  let total = 0;
  idx.forEach((i, j) => {
    before[j] = total;
    total += r.len[i];
  });
  const out = {idx: Int32Array.from(idx), before, total: total || 1};
  schedCache.set(key, out);
  return out;
};

// Point on stroke i at fraction p (source px).
const strokeTip = (r: PoseRec, i: number, p: number): P2 => {
  const s = r.strokes[i], c = r.cum[i];
  const m = s.length >> 1;
  if (m < 2) return [s[0], s[1]];
  const L = r.len[i] * clamp01(p);
  let k = 1;
  while (k < m - 1 && c[k] < L) k++;
  const u = clamp01((L - c[k - 1]) / (c[k] - c[k - 1] || 1));
  return [s[2 * k - 2] + (s[2 * k] - s[2 * k - 2]) * u, s[2 * k - 1] + (s[2 * k + 1] - s[2 * k - 1]) * u];
};

// ------------------------------------------------------------------ mapping
export type LAGeom = {x: number; y: number; h?: number; scale?: number; crop?: [number, number, number, number]; pose: string; flipX?: boolean};
// Display geometry: k = display px per source px, the crop box and its size.
export const laBox = (g: LAGeom) => {
  const {w, h} = poseSize(g.pose);
  const c = g.crop ?? [0, 0, w, h];
  const cw = c[2] - c[0], ch = c[3] - c[1];
  const k = g.h !== undefined ? g.h / ch : g.scale ?? 1;
  return {k, crop: c, W: cw * k, H: ch * k};
};
// Source px → parent px (accounts for crop, scale and flipX).
export const laMap = (g: LAGeom) => {
  const b = laBox(g);
  return (sx: number, sy: number): P2 => {
    const lx = g.flipX ? b.crop[2] - sx : sx - b.crop[0];
    return [g.x + lx * b.k, g.y + (sy - b.crop[1]) * b.k];
  };
};

// ------------------------------------------------------------------ voronoi cells
type Poly = P2[];
const clipHalf = (poly: Poly, px: number, py: number, nx: number, ny: number): Poly => {
  // keep points with (p − P)·n ≤ 0
  const out: Poly = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const da = (a[0] - px) * nx + (a[1] - py) * ny, db = (b[0] - px) * nx + (b[1] - py) * ny;
    if (da <= 0) out.push(a);
    if (da * db < 0) {
      const u = da / (da - db);
      out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
    }
  }
  return out;
};
const cellCache = new Map<string, {poly: Poly; c: P2; order: number}[]>();
export const voronoiCells = (box: [number, number, number, number], n: number, seed: number) => {
  const key = `${box.join(',')}|${n}|${seed}`;
  const hit = cellCache.get(key);
  if (hit) return hit;
  const [x0, y0, x1, y1] = box;
  const w = x1 - x0, h = y1 - y0;
  // jittered grid of sites
  const cols = Math.max(1, Math.round(Math.sqrt((n * w) / h)));
  const rows = Math.max(1, Math.ceil(n / cols));
  const sites: P2[] = [];
  for (let i = 0; i < n; i++) {
    const cx = i % cols, cy = Math.floor(i / cols);
    sites.push([x0 + ((cx + 0.15 + 0.7 * hash(seed, i, 1)) / cols) * w, y0 + ((cy + 0.15 + 0.7 * hash(seed, i, 2)) / rows) * h]);
  }
  const rect: Poly = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
  const impact: P2 = [x0 + w * (0.3 + 0.4 * hash(seed, 99)), y0 + h * (0.3 + 0.4 * hash(seed, 98))];
  const cells = sites.map((s, i) => {
    let poly = rect;
    sites.forEach((q, j) => {
      if (j === i || poly.length < 3) return;
      const mx = (s[0] + q[0]) / 2, my = (s[1] + q[1]) / 2;
      poly = clipHalf(poly, mx, my, q[0] - s[0], q[1] - s[1]);
    });
    const c: P2 = poly.reduce((m, p) => [m[0] + p[0] / poly.length, m[1] + p[1] / poly.length], [0, 0] as P2);
    return {poly, c, order: Math.hypot(c[0] - impact[0], c[1] - impact[1])};
  });
  const sorted = [...cells].sort((p, q) => p.order - q.order);
  const out = cells.map((c) => ({...c, order: sorted.indexOf(c)}));
  cellCache.set(key, out);
  return out;
};

// ------------------------------------------------------------------ component
export type EraseRegion = {
  t: number; // erase starts
  poly?: P2[]; // polygon in source px …
  rect?: [number, number, number, number]; // … or a rect x0,y0,x1,y1
  dur?: number; // seconds (default 6 frames)
  outline?: boolean; // dashed creamDim residual outline (default true)
};
export type Shatter = {
  t0: number;
  cells: number;
  seed?: number;
  stagger?: number; // seconds between cells (default 0.025)
  dur?: number; // flight time per cell (default 0.9)
  dist?: number; // flight distance in display px (default 360)
  spin?: number; // max rotation deg (default 50)
  reverse?: boolean; // play backwards (cells fly IN and assemble by t0 + total)
};
export type LineArtProps = {
  pose: string;
  x: number; // top-left of the displayed (cropped) box, parent px
  y: number;
  h?: number; // display height px (or give scale)
  scale?: number; // display px per source px (default 1)
  crop?: [number, number, number, number]; // source px x0, y0, x1, y1
  mode?: 'ink' | 'sil' | 'both';
  reveal?: [number, number]; // pen draws her on between t0 and t1
  unreveal?: [number, number]; // and un-draws her
  pen?: boolean; // pen head at the active tip during (un)reveal (default true)
  silFill?: 'ink' | 'cream' | 'orange' | 'none';
  silOutline?: boolean; // 2 px orange outline on the silhouette (default true)
  erase?: EraseRegion[];
  shatter?: Shatter;
  clip?: [number, number, number, number]; // only this source rect is drawn (scans, wipes)
  opacity?: number;
  inkOpacity?: number; // opacity of the ink layer only (default 1)
  flipX?: boolean;
};

const SIL_FILL = {ink: K.ink, cream: K.cream, orange: K.orange, none: 'none'} as const;
const MASK_W = 14; // source px

export const LineArt: React.FC<LineArtProps> = (props) => {
  const {pose, x, y, crop, mode = 'ink', reveal, unreveal, pen = true, silFill = 'ink', silOutline = true, erase, shatter, clip, opacity = 1, inkOpacity = 1, flipX} = props;
  const {t} = useT();
  const uid = useId().replace(/:/g, '');
  const rec = usePose(pose);
  if (!rec || opacity <= 0) return null;
  const c = crop ?? [0, 0, rec.w, rec.h];
  const cw = c[2] - c[0], ch = c[3] - c[1];
  const k = props.h !== undefined ? props.h / ch : props.scale ?? 1;
  const W = cw * k, H = ch * k;

  // ---- reveal progress q (1 = fully drawn)
  let q = 1, active = false;
  const spanOf = (r: [number, number]) => Math.max(1 / FPS, r[1] - r[0]);
  if (unreveal && t >= unreveal[0]) {
    q = 1 - clamp01((t - unreveal[0]) / spanOf(unreveal));
    active = q > 0 && q < 1;
  } else if (reveal) {
    q = clamp01((t - reveal[0]) / spanOf(reveal));
    active = q > 0 && q < 1;
  }
  if (q <= 0) return null;
  const T = unreveal && t >= unreveal[0] ? spanOf(unreveal) : reveal ? spanOf(reveal) : 1;

  const showInk = mode !== 'sil';
  const showSil = mode !== 'ink';
  const fillCol = SIL_FILL[silFill];

  // ---- reveal mask: completed strokes in one path, active ones dashed
  let maskEl: React.ReactNode = null;
  let tip: P2 | null = null;
  if (active && showInk) {
    const v = Math.max(2500, (rec.maxLen / T) * 2.5);
    const done: string[] = [];
    const act: React.ReactNode[] = [];
    let newest = -1, newestS = -1;
    const sc = schedule(rec, crop);
    for (let j = 0; j < sc.idx.length; j++) {
      const i = sc.idx[j];
      const di = Math.min(0.9, rec.len[i] / (v * T));
      const ci = sc.before[j] / sc.total;
      const si = ci * (1 - di);
      if (q < si) continue;
      const p = di > 0 ? (q - si) / di : 1;
      if (p >= 1) done.push(rec.d[i]);
      else {
        const L = rec.len[i];
        act.push(<path key={i} d={rec.d[i]} strokeDasharray={`${r1(L)} ${r1(L + 1)}`} strokeDashoffset={r1(L * (1 - p))} />);
        if (si > newestS) {
          newestS = si;
          newest = i;
          tip = strokeTip(rec, i, p);
        }
      }
    }
    void newest;
    maskEl = (
      <mask id={`rv${uid}`} maskUnits="userSpaceOnUse" x={c[0] - 50} y={c[1] - 50} width={cw + 100} height={ch + 100}>
        <g fill="none" stroke="#fff" strokeWidth={MASK_W} strokeLinecap="round" strokeLinejoin="round">
          <path d={done.join('')} />
          {act}
        </g>
      </mask>
    );
  }

  // ---- erase mask
  let eraseMask: React.ReactNode = null;
  const residual: React.ReactNode[] = [];
  const eraseOn = (erase ?? []).filter((e) => t >= e.t);
  if (eraseOn.length) {
    const holes = eraseOn.map((e, i) => {
      const poly: P2[] = e.poly ?? [
        [e.rect![0], e.rect![1]],
        [e.rect![2], e.rect![1]],
        [e.rect![2], e.rect![3]],
        [e.rect![0], e.rect![3]],
      ];
      const cx = poly.reduce((m, p) => m + p[0], 0) / poly.length, cy = poly.reduce((m, p) => m + p[1], 0) / poly.length;
      const p = ease.outCubic(clamp01((t - e.t) / (e.dur ?? 6 / FPS)));
      const pts = poly.map(([px, py]) => `${r1(cx + (px - cx) * p)},${r1(cy + (py - cy) * p)}`).join(' ');
      if (p < 1) residual.push(<polygon key={`e${i}`} points={pts} fill="none" stroke={K.orange} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />);
      if (e.outline !== false)
        residual.push(
          <polygon
            key={`r${i}`}
            points={poly.map(([px, py]) => `${r1(px)},${r1(py)}`).join(' ')}
            fill="none"
            stroke={K.creamDim}
            strokeWidth={1.5}
            strokeDasharray="6 6"
            vectorEffect="non-scaling-stroke"
            opacity={clamp01((t - e.t - 4 / FPS) / (6 / FPS))}
          />,
        );
      return <polygon key={i} points={pts} fill="#000" />;
    });
    eraseMask = (
      <mask id={`er${uid}`} maskUnits="userSpaceOnUse" x={c[0] - 4000} y={c[1] - 4000} width={cw + 8000} height={ch + 8000}>
        <rect x={c[0] - 4000} y={c[1] - 4000} width={cw + 8000} height={ch + 8000} fill="#fff" />
        {holes}
      </mask>
    );
  }

  // ---- silhouette reveal: outline plots, fill fades in at the end
  const silPlot = showSil ? (active || q < 1 ? clamp01(q / 0.8) : 1) : 0;
  const silFillO = showSil ? (q < 1 ? clamp01((q - 0.6) / 0.4) : 1) : 0;

  const figure = (
    <g>
      {showSil && fillCol !== 'none' && silFillO > 0 && <path d={rec.sil} fill={fillCol} opacity={silFillO} />}
      {showInk && (
        <InkImage
          href={rec.img}
          x={0}
          y={0}
          width={rec.w}
          height={rec.h}
          preserveAspectRatio="none"
          mask={maskEl ? `url(#rv${uid})` : undefined}
          opacity={inkOpacity}
        />
      )}
      {showSil && silOutline && silPlot > 0 && (
        <path
          d={rec.sil}
          fill="none"
          stroke={K.orange}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          pathLength={1000}
          strokeDasharray={silPlot < 1 ? '1000 1000' : undefined}
          strokeDashoffset={silPlot < 1 ? 1000 * (1 - silPlot) : undefined}
        />
      )}
    </g>
  );

  // ---- shatter
  let body: React.ReactNode;
  let cellDefs: React.ReactNode = null;
  const sh = shatter && t >= shatter.t0 - (shatter.reverse ? 100 : 0) ? shatter : null;
  if (sh) {
    const bb = rec.bbox;
    const box: [number, number, number, number] = [Math.max(c[0], bb[0] - 8), Math.max(c[1], bb[1] - 8), Math.min(c[2], bb[2] + 8), Math.min(c[3], bb[3] + 8)];
    const cells = voronoiCells(box, sh.cells, sh.seed ?? 1);
    const stagger = sh.stagger ?? 0.025, dur = sh.dur ?? 0.9, dist = (sh.dist ?? 360) / k, spin = sh.spin ?? 50;
    const total = stagger * (cells.length - 1) + dur;
    const bc: P2 = [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2];
    // reverse: the same flight played backwards, finishing at t0 + total
    const tt = sh.reverse ? sh.t0 + total - (t - sh.t0) : t;
    if (!sh.reverse || t >= sh.t0) {
      cellDefs = cells.map((cl, i) => (
        <clipPath key={i} id={`sc${uid}-${i}`}>
          <polygon points={cl.poly.map(([px, py]) => `${r1(px)},${r1(py)}`).join(' ')} />
        </clipPath>
      ));
      const crack = !sh.reverse ? clamp01(1 - (t - sh.t0) / (5 / FPS)) : 0;
      body = (
        <g>
          {cells.map((cl, i) => {
            const p = clamp01((tt - sh.t0 - cl.order * stagger) / dur);
            if (p >= 1) return null;
            const e = ease.outCubic(p);
            let dx = cl.c[0] - bc[0] + hashS(sh.seed ?? 1, i, 3) * 40, dy = cl.c[1] - bc[1] + hashS(sh.seed ?? 1, i, 4) * 40;
            const dl = Math.hypot(dx, dy) || 1;
            dx /= dl;
            dy /= dl;
            const D = dist * (0.6 + 0.8 * hash(sh.seed ?? 1, i, 5)) * e;
            const rot = hashS(sh.seed ?? 1, i, 6) * spin * e;
            const o = 1 - ease.inCubic(p);
            return (
              <g key={i} opacity={o} transform={`translate(${r1(dx * D)} ${r1(dy * D)}) rotate(${r1(rot)} ${r1(cl.c[0])} ${r1(cl.c[1])})`}>
                <g clipPath={`url(#sc${uid}-${i})`}>{figure}</g>
                {(p > 0 || crack > 0) && (
                  <polygon
                    points={cl.poly.map(([px, py]) => `${r1(px)},${r1(py)}`).join(' ')}
                    fill="none"
                    stroke={p > 0 ? K.creamDim : K.orange}
                    strokeOpacity={p > 0 ? 0.45 : crack}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                )}
              </g>
            );
          })}
        </g>
      );
    } else body = null; // reverse, before t0: nothing yet
  } else body = figure;

  // ---- pen head at the active tip (constant display size)
  const penEl =
    pen && tip && active ? (
      <g transform={`translate(${r1(tip[0])} ${r1(tip[1])}) scale(${1 / k})`}>
        <circle r={9 * (1 + 0.4 * pulse(t))} fill="none" stroke={K.orange} strokeWidth={1} opacity={0.45} />
        <circle r={4} fill={K.orange} />
      </g>
    ) : null;

  const flip = flipX ? `translate(${c[0] + c[2]} 0) scale(-1 1)` : undefined;
  const clipRect = clip ?? (crop && !sh ? c : null);
  return (
    <svg
      width={r1(W)}
      height={r1(H)}
      viewBox={`${c[0]} ${c[1]} ${cw} ${ch}`}
      style={{position: 'absolute', left: x, top: y, overflow: 'visible', opacity}}
    >
      <defs>
        {maskEl}
        {eraseMask}
        {cellDefs}
        {clipRect && (
          <clipPath id={`cl${uid}`}>
            <rect x={clipRect[0]} y={clipRect[1]} width={Math.max(0, clipRect[2] - clipRect[0])} height={Math.max(0, clipRect[3] - clipRect[1])} />
          </clipPath>
        )}
      </defs>
      <g transform={flip} clipPath={clipRect ? `url(#cl${uid})` : undefined}>
        <g mask={eraseMask ? `url(#er${uid})` : undefined}>{body}</g>
        {residual}
        {penEl}
      </g>
    </svg>
  );
};
