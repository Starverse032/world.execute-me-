// Small helpers shared by the S1 shot files.
import React, {useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {clamp01, ease, FPS, K, prog} from '../../v3/core';
import {Plot} from '../../v3/geo';
import {CODE} from '../fonts';
import {r2} from '../shell/lib';

export type P2 = [number, number];
export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;
export const f2s = (f: number) => f / FPS;

// Plot progress of a stroke that starts at t0 and takes `dur` seconds.
export const pp = (t: number, t0: number, dur = 0.3, e = ease.inOutCubic) => prog(t, t0, t0 + dur, e);

// Polyline path from points.
export const poly = (pts: P2[], closed = false) => pts.map((p, i) => `${i ? 'L' : 'M'} ${r2(p[0])} ${r2(p[1])}`).join(' ') + (closed ? ' Z' : '');
// Sampled ellipse path (cx, cy, rx, ry, rotation deg), starting at local angle a0.
export const ellD = (cx: number, cy: number, rx: number, ry: number, rot = 0, a0 = -90, n = 96) => {
  const c = Math.cos(rot * DEG), s = Math.sin(rot * DEG);
  const pts: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const th = (a0 + (360 * i) / n) * DEG;
    const x = rx * Math.cos(th), y = ry * Math.sin(th);
    pts.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return poly(pts);
};
export const circD = (cx: number, cy: number, r: number, a0 = -90, n = 96) => ellD(cx, cy, r, r, 0, a0, n);

// Plotted stroke shorthand (v3 Plot with the pen head).
export const P: React.FC<{d: string; p: number; t: number; color?: string; w?: number; o?: number; pen?: boolean; dash?: string; fill?: string}> = ({d, p, t, color = K.cream, w = 1.5, o = 1, pen = true, dash, fill}) =>
  p > 0 ? <Plot d={d} p={clamp01(p)} t={t} color={color} w={w} opacity={o} pen={pen} dash={dash} fill={fill} /> : null;

// Mono text (SVG fragment).
export const Mono: React.FC<{x: number; y: number; s?: number; c?: string; o?: number; anchor?: 'start' | 'middle' | 'end'; w?: number; children: React.ReactNode}> = ({
  x,
  y,
  s = 16,
  c = K.creamDim,
  o = 1,
  anchor = 'start',
  w = 400,
  children,
}) =>
  o > 0 ? (
    <text x={r2(x)} y={r2(y)} fontFamily={CODE} fontSize={s} fill={c} opacity={o} textAnchor={anchor} fontWeight={w} xmlSpace="preserve" style={{whiteSpace: 'pre'}}>
      {children}
    </text>
  ) : null;

// Absolutely positioned SVG canvas at (x, y) with overflow visible.
export const At: React.FC<{x?: number; y?: number; w?: number; h?: number; o?: number; children: React.ReactNode}> = ({x = 0, y = 0, w = 1, h = 1, o = 1, children}) => (
  <svg width={w} height={h} style={{position: 'absolute', left: x, top: y, overflow: 'visible', opacity: o}}>
    {children}
  </svg>
);

// Linear interpolation of points.
export const lp = (a: P2, b: P2, u: number): P2 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];

// Holds the frame until every SVG <image> inside has decoded. LineArt draws
// its ink PNG with an SVG <image>, whose load is asynchronous even when the
// file is cached, so a freshly mounted line art could be captured blank.
type Decodable = Element & {decode?: () => Promise<void>; __s1ok?: boolean};
// expect: whether the children will draw at least one image this frame (the
// hold is created synchronously on the first render, before the pose loads).
export const HoldImages: React.FC<{children: React.ReactNode; style?: React.CSSProperties; expect?: boolean}> = ({children, style, expect = true}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [h] = useState(() => (expect ? delayRender('S1: line art image decode', {timeoutInMilliseconds: 25000}) : -1));
  const done = useRef(h < 0);
  useLayoutEffect(() => {
    if (done.current) return;
    done.current = true;
    // the pose may still be loading (LineArt re-renders itself): poll for the images
    let tries = 0;
    const check = () => {
      const imgs = Array.from(ref.current?.querySelectorAll('image') ?? []) as Decodable[];
      if (!imgs.length && tries++ < 400) {
        requestAnimationFrame(check);
        return;
      }
      Promise.all(imgs.map((im) => (im.decode ? im.decode() : Promise.resolve()).catch(() => undefined))).then(() =>
        requestAnimationFrame(() => requestAnimationFrame(() => continueRender(h))),
      );
    };
    check();
  });
  return (
    <div ref={ref} style={{position: 'absolute', inset: 0, ...style}}>
      {children}
    </div>
  );
};
