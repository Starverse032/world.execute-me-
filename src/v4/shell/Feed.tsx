// v7 kit for the character close-ups (SVG fragments, local px):
//  FeedWin  — one small code / status window that explains what the shot is
//             doing; its rows type in at their times and it grows to fit them
//  DotGrid  — a low-contrast dot grid; dots near the given points brighten,
//             so the environment answers the cursor or the figure
//  LogTex   — faint, slowly scrolling log lines (texture, not to be read)
import React from 'react';
import {clamp01, ease, K, lerp, prog} from '../../v3/core';
import {CODE} from '../fonts';
import {r2, rrPath} from './lib';

export type FeedRow = {t: number; text: string; tone?: 'code' | 'cream' | 'dim' | 'orange'; render?: (t: number) => React.ReactNode};
const ROW = 34, HEAD = 40, PAD = 18;

export const FeedWin: React.FC<{t: number; x: number; y: number; w: number; title: string; rows: FeedRow[]; t0: number; o?: number; size?: number}> = ({t, x, y, w, title, rows, t0, o = 1, size = 20}) => {
  if (t < t0 || o <= 0) return null;
  const open = prog(t, t0, t0 + 0.18, ease.outCubic);
  // the window grows by one row as each row arrives
  const shown = rows.reduce((n, r) => n + prog(t, r.t - 0.08, r.t + 0.06, ease.inOutCubic), 0);
  const h = HEAD + PAD + Math.max(1, shown) * ROW;
  const color = (tone: FeedRow['tone']) => (tone === 'orange' ? K.orange : tone === 'cream' ? K.cream : tone === 'dim' ? K.creamDim : K.cream);
  return (
    <g opacity={o * open} transform={`translate(${r2(x)} ${r2(y + 10 * (1 - open))})`}>
      <path d={rrPath(0, 0, w, h, 12)} fill={K.bg} fillOpacity={0.94} stroke={K.cream} strokeOpacity={0.35} strokeWidth={1.5} />
      <path d={`M 0 ${HEAD - 6} L ${w} ${HEAD - 6}`} stroke={K.cream} strokeOpacity={0.18} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={20 + 16 * i} cy={17} r={5} fill={i === 0 ? K.orange : K.creamDim} fillOpacity={i === 0 ? 0.9 : 0.35} />
      ))}
      <text x={w / 2} y={23} textAnchor="middle" fontFamily={CODE} fontSize={15} fill={K.creamDim}>
        {title}
      </text>
      {rows.map((r, i) => {
        if (t < r.t) return null;
        const yy = HEAD + PAD + i * ROW + 6;
        if (r.render) return <g key={i} transform={`translate(22 ${yy})`}>{r.render(t)}</g>;
        const n = Math.min(r.text.length, Math.floor((t - r.t) * 48 + 1));
        return (
          <text key={i} x={22} y={yy} fontFamily={CODE} fontSize={size} fill={color(r.tone)} fillOpacity={r.tone === 'dim' ? 0.8 : 1} xmlSpace="preserve">
            {r.text.slice(0, n)}
          </text>
        );
      })}
    </g>
  );
};

export const DotGrid: React.FC<{x0?: number; y0?: number; x1?: number; y1?: number; step?: number; base?: number; lights?: {x: number; y: number; r: number; a: number}[]}> = ({x0 = 0, y0 = 0, x1 = 1920, y1 = 1080, step = 48, base = 0.07, lights = []}) => {
  const dots: React.ReactNode[] = [];
  for (let y = y0 + step / 2; y < y1; y += step)
    for (let x = x0 + step / 2; x < x1; x += step) {
      let a = base;
      for (const l of lights) {
        const d = Math.hypot(x - l.x, y - l.y);
        if (d < l.r) a += l.a * (1 - d / l.r) ** 2;
      }
      dots.push(<circle key={`${x},${y}`} cx={x} cy={y} r={1.6} fill={K.cream} opacity={Math.min(0.6, a)} />);
    }
  return <g>{dots}</g>;
};

export const LogTex: React.FC<{t: number; x: number; y: number; h: number; lines: string[]; speed?: number; o?: number}> = ({t, x, y, h, lines, speed = 14, o = 0.22}) => {
  // line j sits at y + h − s + j·lh: the lines scroll up as s grows
  const lh = 22;
  const s = t * speed;
  const n = lines.length;
  const out: React.ReactNode[] = [];
  for (let j = Math.ceil((s - h) / lh); j <= Math.floor(s / lh); j++) {
    const yy = y + h - s + j * lh;
    const edge = clamp01((yy - y) / 40) * clamp01((y + h - yy) / 40);
    out.push(
      <text key={j} x={x} y={r2(yy)} fontFamily={CODE} fontSize={14} fill={K.creamDim} opacity={o * edge}>
        {lines[((j % n) + n) % n]}
      </text>,
    );
  }
  return <g>{out}</g>;
};

// A soft ring that opens once from a point (contact feedback).
export const SoftRing: React.FC<{t: number; t0: number; x: number; y: number; r0?: number; r1?: number; dur?: number; color?: string}> = ({t, t0, x, y, r0 = 18, r1 = 120, dur = 0.7, color = K.cream}) => {
  const q = (t - t0) / dur;
  if (q < 0 || q > 1) return null;
  return <circle cx={r2(x)} cy={r2(y)} r={r2(lerp(r0, r1, ease.outCubic(q)))} fill="none" stroke={color} strokeWidth={2} opacity={0.7 * (1 - q)} />;
};
