// <Grid>: the background dot grid (60 px, 2 px dots) with beat ripples.
// Adapted from v3 ui.tsx as a standalone component. FullMV2 draws one shared
// Grid whose props come from each section's `GRID` export (sN.data.ts);
// sections may also draw their own.
import React, {useLayoutEffect, useRef} from 'react';
import {beat, beatIndex, clamp01, K, lastOnset, useT} from '../../v3/core';
import {anomaly, band, hashS} from '../chaos';
import type {P2} from './lib';

export type Ripple = {t: number; cx: number; cy: number; v?: number; w?: number; tau?: number};
export type GridProps = {
  a?: number; // anomaly: rows of dots slip sideways (stepped) at a > 0.5 (default anomaly(t))
  visible?: (t: number) => number; // 0..1 opacity (default 1)
  reach?: (t: number) => number; // 0..1 radial extent from `center` (default 1 = whole frame)
  bend?: (t: number) => number; // px amplitude of the sine displacement (default 0)
  every?: (t: number) => number; // beat ripple every N beats (0 = none; default 2)
  center?: (t: number) => P2; // ripple / reach centre (default (960, 540))
  ripples?: Ripple[]; // one-off ripples
  hi?: (t: number) => boolean; // brighter dots (gridHi) instead of grid (default true)
};

const hexRgb = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const LO = hexRgb(K.grid), HI = hexRgb(K.gridHi), TOP = hexRgb(K.line2);

export const Grid: React.FC<GridProps> = ({a: aProp, visible, reach, bend, every, center, ripples = [], hi}) => {
  const {t} = useT();
  const ref = useRef<HTMLCanvasElement>(null);
  const vis = visible ? clamp01(visible(t)) : 1;
  useLayoutEffect(() => {
    const g = ref.current!.getContext('2d')!;
    g.clearRect(0, 0, 1920, 1080);
    if (vis <= 0) return;
    const a = aProp ?? anomaly(t);
    const [cx, cy] = center ? center(t) : ([960, 540] as P2);
    const R = reach ? clamp01(reach(t)) * 2300 : Infinity;
    const A = bend ? bend(t) : 0;
    const base = hi && !hi(t) ? LO : HI;
    // ripple onsets in the last ~2.8 s
    const ons: {tb: number; cx: number; cy: number; v: number; w: number; tau: number}[] = [];
    const ev = every ? every(t) : 2;
    if (ev > 0) {
      const n = beatIndex(t);
      for (let k = n; k >= Math.max(0, n - 6); k--) if (k % ev === 0) ons.push({tb: lastOnset(beat(k) + 0.0001), cx, cy, v: 1400, w: 45, tau: 0.6});
    }
    for (const r of ripples) {
      const tau = r.tau ?? 0.6;
      if (r.t <= t && t - r.t < tau * 4.6) ons.push({tb: r.t, cx: r.cx, cy: r.cy, v: r.v ?? 1400, w: r.w ?? 45, tau});
    }
    const slip = band(a, 0.5, 0.7);
    const k8 = Math.floor(t * 8);
    for (let y = 0; y <= 1080; y += 60) {
      const rowSlip = slip > 0 && hashS(91, y, k8) > 0.6 ? hashS(92, y, k8) * 60 * slip : 0;
      for (let x = 0; x <= 1920; x += 60) {
        let px = x + rowSlip, py = y;
        if (A) {
          px += A * Math.sin((y / 1080) * Math.PI * 3 + t * 1.7);
          py += A * Math.sin((x / 1920) * Math.PI * 4 + t * 1.3);
        }
        if (R !== Infinity && Math.hypot(x - cx, y - cy) > R) continue;
        let wgt = 0;
        for (const o of ons) {
          const d = Math.hypot(x - o.cx, y - o.cy);
          const rr = o.v * (t - o.tb);
          wgt = Math.max(wgt, clamp01(1 - Math.abs(d - rr) / o.w) * Math.exp(-(t - o.tb) / o.tau));
        }
        g.fillStyle = `rgb(${Math.round(base[0] + (TOP[0] - base[0]) * wgt)},${Math.round(base[1] + (TOP[1] - base[1]) * wgt)},${Math.round(base[2] + (TOP[2] - base[2]) * wgt)})`;
        g.beginPath();
        g.arc(px, py, 1, 0, Math.PI * 2);
        g.fill();
      }
    }
  });
  return <canvas ref={ref} width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: vis}} />;
};
