// <Collapse>: wraps any component so it can be deleted the S4 way (§4 outro):
// from t0 the box squashes to a horizontal line (8 frames, inCubic), the line
// shrinks to a point (5 frames), the point fades (3 frames). A residual
// outline (1 px dashed creamDim 0.25) is left where the box was; it can light
// up orange at `lit`.
import React from 'react';
import {clamp01, ease, FPS, K, useT} from '../../v3/core';
import {r2} from './lib';

export const collapseState = (t: number, t0: number) => {
  const f = (t - t0) * FPS;
  if (f < 0) return {sy: 1, sx: 1, lineO: 0, dotO: 0, gone: false};
  return {
    sy: 1 - ease.inCubic(clamp01(f / 8)),
    sx: 1 - ease.inCubic(clamp01((f - 8) / 5)),
    lineO: clamp01((f - 4) / 3) * (f < 13 ? 1 : 0),
    dotO: f >= 12 && f < 16 ? 1 - clamp01((f - 13) / 3) : 0,
    gone: f >= 8,
  };
};

export const Collapse: React.FC<{
  t0?: number; // collapse start (omit = never)
  box: [number, number, number, number]; // x, y, w, h of what collapses (parent px)
  residual?: boolean; // leave the dashed outline (default true)
  lit?: number; // the residual outline lights orange from this time (4-frame fade)
  children: React.ReactNode;
}> = ({t0, box, residual = true, lit, children}) => {
  const {t} = useT();
  const [x, y, w, h] = box;
  const s = t0 === undefined ? collapseState(t, Infinity) : collapseState(t, t0);
  const cx = x + w / 2, cy = y + h / 2;
  const litO = lit !== undefined ? clamp01((t - lit) * FPS / 4) : 0;
  const resO = t0 !== undefined ? clamp01(((t - t0) * FPS - 10) / 6) : 0;
  return (
    <>
      {!s.gone && (
        <div style={{position: 'absolute', inset: 0, transformOrigin: `${r2(cx)}px ${r2(cy)}px`, transform: s.sy < 1 ? `scale(1, ${Math.max(0.001, s.sy)})` : undefined}}>
          {children}
        </div>
      )}
      <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {residual && resO > 0 && (
          <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} fill="none" stroke={litO > 0 ? K.orange : K.creamDim} strokeOpacity={litO > 0 ? 0.25 + 0.75 * litO : 0.25 * resO} strokeWidth={litO > 0 ? 1 + litO : 1} strokeDasharray="5 6" />
        )}
        {s.lineO > 0 && <path d={`M ${r2(cx - (w / 2) * s.sx)} ${r2(cy)} L ${r2(cx + (w / 2) * s.sx)} ${r2(cy)}`} stroke={K.cream} strokeOpacity={0.7} strokeWidth={1.5} opacity={s.lineO} />}
        {s.dotO > 0 && <circle cx={r2(cx)} cy={r2(cy)} r={3.5} fill={K.orange} opacity={s.dotO} />}
      </svg>
    </>
  );
};
