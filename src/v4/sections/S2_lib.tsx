// S2 helpers: a quick fold (chrome hiding on ISOLATION), echo frames (the
// trance's doubled, drifting borders), a vibrating-string overlay for chrome
// that has no `wave` prop, and small math helpers.
import React from 'react';
import {clamp01, ease, env, FPS, K, lastOnset, prog, useT} from '../../v3/core';
import {Frame, P2, r2, rrPath} from '../shell/lib';

export const f2s = (f: number) => f / FPS;
export const lerp2 = (a: P2, b: P2, p: number): P2 => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p];

// A faster, residual-free variant of shell/Collapse: squash to a line
// (6 frames), the line shrinks to a point (3 frames), the point fades (2).
export const foldState = (t: number, t0: number) => {
  const f = (t - t0) * FPS;
  if (f < 0) return {sy: 1, sx: 1, lineO: 0, dotO: 0, gone: false};
  return {
    sy: 1 - ease.inCubic(clamp01(f / 6)),
    sx: 1 - ease.inCubic(clamp01((f - 6) / 3)),
    lineO: f >= 2 && f < 9 ? 1 : 0,
    dotO: f >= 8 && f < 11 ? 1 - clamp01((f - 9) / 2) : 0,
    gone: f >= 6,
  };
};
export const Fold: React.FC<{t0: number; box: [number, number, number, number]; children: React.ReactNode}> = ({t0, box, children}) => {
  const {t} = useT();
  const [x, y, w, h] = box;
  const s = foldState(t, t0);
  if ((t - t0) * FPS >= 11) return null;
  const cx = x + w / 2, cy = y + h / 2;
  return (
    <>
      {!s.gone && (
        <div style={{position: 'absolute', inset: 0, transformOrigin: `${r2(cx)}px ${r2(cy)}px`, transform: s.sy < 1 ? `scale(1, ${Math.max(0.001, s.sy)})` : undefined}}>
          {children}
        </div>
      )}
      <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {s.lineO > 0 && <path d={`M ${r2(cx - (w / 2) * s.sx)} ${r2(cy)} L ${r2(cx + (w / 2) * s.sx)} ${r2(cy)}`} stroke={K.cream} strokeOpacity={0.7} strokeWidth={1.5} />}
        {s.dotO > 0 && <circle cx={r2(cx)} cy={r2(cy)} r={3.5} fill={K.orange} opacity={s.dotO} />}
      </svg>
    </>
  );
};

// Echo outline: a second copy of a frame that drifts slowly away from it
// (no stepping: a smooth, hypnotic drift). amp in px.
export const EchoFrame: React.FC<{t: number; box: [number, number, number, number]; r?: number; amp: number; phase?: number; color?: string; opacity?: number}> = ({
  t,
  box,
  r = 10,
  amp,
  phase = 0,
  color = K.cream,
  opacity = 0.25,
}) => {
  if (amp <= 0.05) return null;
  const [x, y, w, h] = box;
  const dx = amp * Math.sin(t * 2.1 + phase), dy = amp * 0.6 * Math.cos(t * 1.7 + phase * 1.3);
  return <path d={rrPath(x + dx, y + dy, w, h, r)} fill="none" stroke={color} strokeOpacity={opacity} strokeWidth={1.5} />;
};

// Vibrating-string border over a component that draws its own static frame:
// a bg-coloured "eraser" stroke hides the static border, then a Frame with a
// standing wave is drawn in its place.
export const WaveFrame: React.FC<{t: number; box: [number, number, number, number]; r?: number; amp: number; color?: string; opacity?: number; seed?: number}> = ({
  t,
  box,
  r = 10,
  amp,
  color = K.cream,
  opacity = 0.25,
  seed = 3,
}) => {
  if (amp <= 0.05) return null;
  const [x, y, w, h] = box;
  return (
    <g>
      <path d={rrPath(x, y, w, h, r)} fill="none" stroke={K.bg} strokeWidth={4} />
      <Frame x={x} y={y} w={w} h={h} r={r} t={t} wave={amp} color={color} opacity={opacity} seed={seed} />
    </g>
  );
};

// Beat-driven string amplitude for VIBRATIONS (106.29–107.4), with a faint
// ring-out afterwards.
export const vibAmp = (t: number, hit: number) => {
  if (t < hit) return 0;
  const on = 1 - prog(t, 107.3, 107.6);
  const b = env(t - Math.max(hit, lastOnset(t)), 0.2);
  const ring = 1.2 * (1 - prog(t, 107.6, 110.0));
  return Math.max(on * (3 + 9 * b) * (1 - 0.3 * prog(t, hit, 107.3)), ring);
};

// Stepped eased offset: +step px on each of the given times (6-frame outCubic).
export const stepped = (t: number, times: number[], step: number, frames = 6) =>
  times.reduce((m, tb) => m + step * prog(t, tb, tb + frames / FPS, ease.outCubic), 0);
