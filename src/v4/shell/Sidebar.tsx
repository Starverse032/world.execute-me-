// <Sidebar>: chat list (docs/design_v4.md §3.6). HTML-level, box x, y, w, h.
import React from 'react';
import {clamp01, ease, FPS, K, lerp, useT} from '../../v3/core';
import {Spark} from '../../v3/geo';
import {anomaly, band, corrupt, stepJ} from '../chaos';
import {CODE} from '../fonts';
import {Frame, r2, rrPath, since} from './lib';

export type ChatItem = {id: string; label: string; tNew: number; tDel?: number; tSel?: number};

export const SB = {headY: 34, newY: 76, recentY: 128, listY: 142, rowH: 38};

// Height factor (0..1) of a row at t: grows 6 frames after tNew, strike 6
// frames from tDel, then collapses over 8 frames.
const rowK = (it: ChatItem, t: number) => {
  if (t < it.tNew) return 0;
  let k = ease.outCubic(clamp01((t - it.tNew) * FPS / 6));
  if (it.tDel !== undefined && t >= it.tDel) k *= 1 - ease.inOutCubic(clamp01(((t - it.tDel) * FPS - 6) / 8));
  return k;
};
// The selected item at t: the latest tSel ≤ t whose row still exists.
const selectedAt = (items: ChatItem[], t: number) => {
  let best: ChatItem | null = null;
  for (const it of items) if (it.tSel !== undefined && it.tSel <= t && (it.tDel === undefined || t < it.tDel + 14 / FPS) && (!best || it.tSel >= best.tSel!)) best = it;
  return best ? best.id : null;
};

export const Sidebar: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  items: ChatItem[];
  a?: number;
  t0?: number; // optional: frame plots on (14 frames), content fades in after
  seed?: number;
  opacity?: number;
}> = ({x, y, w, h, items, a: aProp, t0, seed = 7, opacity = 1}) => {
  const {t} = useT();
  if (opacity <= 0 || (t0 !== undefined && t < t0)) return null;
  const a = aProp ?? anomaly(t);
  const plot = t0 !== undefined ? clamp01((t - t0) * FPS / 14) : 1;
  const cin = t0 !== undefined ? clamp01(((t - t0) * FPS - 10) / 6) : 1;
  const amt = a > 0.3 ? 0.2 * a * band(a, 0.3, 0.5) : 0;

  // + New chat flash: 4 frames from any tNew
  let lastNew = -Infinity;
  for (const it of items) if (it.tNew <= t) lastNew = Math.max(lastNew, it.tNew);
  const flash = (t - lastNew) * FPS < 4;

  // rows, newest first
  const rows = items.filter((it) => t >= it.tNew).sort((p, q) => q.tNew - p.tNew);
  const geo = new Map<string, {y: number; k: number}>();
  let yy = SB.listY;
  for (const it of rows) {
    const k = rowK(it, t);
    geo.set(it.id, {y: yy, k});
    yy += SB.rowH * k;
  }
  // selection bar (slides between rows over 6 frames)
  const sel = selectedAt(items, t);
  const ch = since((tt) => selectedAt(items, tt), t, 6);
  let selY: number | null = null;
  let selK = 1;
  if (sel && geo.has(sel)) {
    const g = geo.get(sel)!;
    selY = g.y;
    selK = g.k;
    if (ch.f < 6 && ch.prev && geo.has(ch.prev)) selY = lerp(geo.get(ch.prev)!.y, g.y, ease.outCubic(ch.f / 6));
  }
  const selO = ch.f < 6 && !ch.prev ? ch.f / 6 : 1;

  return (
    <svg width={w} height={h} style={{position: 'absolute', left: x, top: y, overflow: 'visible', opacity}}>
      <path d={rrPath(0, 0, w, h, 10)} fill={K.surface} fillOpacity={0.92 * plot} />
      <Frame x={0} y={0} w={w} h={h} t={t} a={a} seed={seed} plot={plot} />
      <g opacity={cin}>
        <Spark x={26} y={SB.headY} R={10} rot={t * 30} />
        <text x={46} y={SB.headY + 6} fontFamily={CODE} fontSize={16} fill={K.cream}>
          Claude
        </text>
        {/* + New chat */}
        <g>
          {flash && <rect x={10} y={SB.newY - 17} width={w - 20} height={34} rx={7} fill="none" stroke={K.orange} strokeWidth={1.5} />}
          <path d={`M 20 ${SB.newY} L 32 ${SB.newY} M 26 ${SB.newY - 6} L 26 ${SB.newY + 6}`} stroke={flash ? K.orange : K.creamDim} strokeWidth={1.5} strokeLinecap="round" />
          <text x={46} y={SB.newY + 5} fontFamily={CODE} fontSize={15} fill={flash ? K.orange : K.cream} fillOpacity={flash ? 1 : 0.7}>
            New chat
          </text>
        </g>
        <text x={18} y={SB.recentY} fontFamily={CODE} fontSize={12} fill={K.creamDim} fillOpacity={0.7} letterSpacing={1}>
          RECENTS
        </text>
        {selY !== null && (
          <g opacity={selO * selK}>
            <rect x={10} y={r2(selY + 2)} width={w - 20} height={SB.rowH - 4} rx={7} fill={K.line2} fillOpacity={0.35} />
            <rect x={10} y={r2(selY + 8)} width={2} height={SB.rowH - 16} fill={K.orange} />
          </g>
        )}
        {rows.map((it) => {
          const g = geo.get(it.id)!;
          if (g.k <= 0.01) return null;
          const f = (t - it.tNew) * FPS;
          const n = Math.floor(clamp01((f - 3) / Math.max(4, it.label.length / 2)) * it.label.length);
          let lab = it.label.slice(0, n);
          const maxC = Math.floor((w - 48) / 9);
          if (lab.length > maxC) lab = lab.slice(0, maxC - 1) + '…';
          if (amt) lab = corrupt(lab, t, amt, seed + it.tNew * 7);
          const strike = it.tDel !== undefined ? ease.inOutCubic(clamp01((t - it.tDel) * FPS / 6)) : 0;
          const ty = g.y + SB.rowH / 2;
          const jx = a > 0.6 ? stepJ(t, seed * 3 + it.tNew * 10, 5 * band(a, 0.6, 0.8), 8) : 0;
          const on = it.id === sel;
          return (
            <g key={it.id} opacity={g.k} transform={jx ? `translate(${r2(jx)} 0)` : undefined}>
              <text x={26} y={r2(ty + 5)} fontFamily={CODE} fontSize={15} fill={K.cream} fillOpacity={on ? 1 : 0.7} xmlSpace="preserve">
                {lab}
              </text>
              {strike > 0 && <path d={`M 22 ${r2(ty)} L ${r2(22 + (Math.min(lab.length, maxC) * 9 + 8) * strike)} ${r2(ty)}`} stroke={K.orange} strokeWidth={1.5} />}
            </g>
          );
        })}
      </g>
    </svg>
  );
};
