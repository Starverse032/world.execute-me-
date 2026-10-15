// <Composer> (the human's input box), <YouNode> (the human) and <Tether>
// (the line between you and Claude's spark). docs/design_v4.md §2, §3.5.
// All three are HTML-level: an absolutely positioned <svg> in parent px.
import React, {useId} from 'react';
import {clamp01, ease, env, FPS, K, useT} from '../../v3/core';
import {Spark} from '../../v3/geo';
import {anomaly, band, corrupt, hash, stepJ} from '../chaos';
import {CODE, MONO_ADV} from '../fonts';
import {blink, Caret, Frame, P2, r2, rrPath, SendArrow, since} from './lib';

export type Prompt = {t0: number; text: string; send: number; by?: 'you' | 'claude'};
export type ComposerState = 'normal' | 'disabled' | 'claude' | 'hidden';

export const COMPOSER_H = 64;
export const TYPE_CPS = 24;
// Centre of the send button, for spawning dots from it.
export const sendButtonPos = (x: number, y: number, w: number): P2 => [x + w - 14 - 18, y + COMPOSER_H / 2];
// Default you-node position for a composer at (x, y): 28 px left, centred.
export const youPos = (x: number, y: number): P2 => [x - 28, y + COMPOSER_H / 2];

// The prompt text shown at t: typed characters, and the clear-out after send.
export const promptAt = (prompts: Prompt[], t: number) => {
  let p: Prompt | undefined;
  for (const q of prompts) if (q.t0 <= t) p = q;
  if (!p) return null;
  const clearF = (t - p.send) * FPS;
  if (clearF >= 6) return null;
  const rate = Math.max(TYPE_CPS, p.text.length / Math.max(0.1, p.send - 0.12 - p.t0));
  const n = Math.min(p.text.length, Math.floor((t - p.t0) * rate + 1e-6));
  return {p, n, typing: n < p.text.length && clearF < 0, clear: clearF < 0 ? 0 : clamp01(clearF / 5)};
};

export const Composer: React.FC<{
  x: number;
  y: number; // top edge (height is 64)
  w: number;
  prompts?: Prompt[];
  state?: (t: number) => ComposerState;
  a?: number;
  placeholder?: string | ((t: number) => string);
  seed?: number;
  opacity?: number;
  tOpen?: number; // optional: border plots on over 10 frames from tOpen
}> = ({x, y, w, prompts = [], state, a: aProp, placeholder, seed = 3, opacity = 1, tOpen}) => {
  const {t} = useT();
  const uid = useId().replace(/:/g, '');
  const stFn = state ?? (() => 'normal' as ComposerState);
  const ch = since(stFn, t, 8);
  const st = ch.cur;
  // hidden ⇄ shown: 6-frame fade + 12 px drop
  let vis = 1;
  if (st === 'hidden') vis = ch.f < 6 && ch.prev !== 'hidden' ? 1 - ch.f / 6 : 0;
  else if (ch.prev === 'hidden' && ch.f < 6) vis = ch.f / 6;
  const plot = tOpen !== undefined ? clamp01((t - tOpen) * FPS / 10) : 1;
  if (vis <= 0 || opacity <= 0 || (tOpen !== undefined && t < tOpen)) return null;
  const a = aProp ?? anomaly(t);
  const H = COMPOSER_H;
  const disabled = st === 'disabled' || (st === 'hidden' && ch.prev === 'disabled');
  const claude = st === 'claude' || (st === 'hidden' && ch.prev === 'claude');
  const dashMix = disabled ? (ch.prev !== 'disabled' && ch.f < 6 ? ch.f / 6 : 1) : ch.prev === 'disabled' && ch.f < 6 ? 1 - ch.f / 6 : 0;

  const pr = promptAt(prompts, t);
  const orangeText = claude || pr?.p.by === 'claude';
  const shown = pr ? pr.p.text.slice(0, pr.n) : '';
  const hasText = shown.length > 0 && (pr?.clear ?? 0) < 1;
  const size = 20;
  const tx = x + 48;
  const avail = w - 48 - 64;
  const tw = shown.length * size * MONO_ADV;
  const scroll = Math.max(0, tw - avail);
  const baseY = y + H / 2 + size * 0.36;
  const txt = a > 0.4 ? corrupt(shown, t, 0.15 * band(a, 0.4, 0.6), seed) : shown;
  let ph = placeholder !== undefined ? (typeof placeholder === 'function' ? placeholder(t) : placeholder) : disabled ? 'no user connected · messages will not be delivered' : 'Reply to Claude…';
  if (a > 0.5) ph = corrupt(ph, t, 0.1 * band(a, 0.5, 0.7), seed + 1);
  const showPh = !pr || (pr.n === 0 && pr.clear === 0) || pr.clear >= 1;
  const phO = pr && pr.clear > 0 ? pr.clear : 1;

  // send pulse
  let lastSend = -Infinity;
  for (const p of prompts) if (p.send <= t) lastSend = Math.max(lastSend, p.send);
  const sinceSend = t - lastSend;
  const pulseK = env(sinceSend, 0.12);
  const [bx, by] = sendButtonPos(x, y, w);
  const btnOrange = hasText || sinceSend < 6 / FPS;
  const ringP = clamp01(sinceSend * FPS / 12);
  const jx = a > 0.3 ? stepJ(t, seed * 5, 3 * band(a, 0.3, 0.6), 8) : 0;

  const caretOn = !disabled && (pr?.clear ?? 0) === 0 && ((pr && pr.typing) || blink(t));
  return (
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: opacity * vis, transform: vis < 1 ? `translateY(${r2(12 * (1 - vis))}px)` : undefined}}>
      <defs>
        <clipPath id={`cc${uid}`}>
          <rect x={tx - 4} y={y} width={avail + 8} height={H} />
        </clipPath>
      </defs>
      <g transform={jx ? `translate(${r2(jx)} 0)` : undefined}>
        <path d={rrPath(x, y, w, H, 14)} fill={K.surface} opacity={plot} />
        {dashMix < 1 && <Frame x={x} y={y} w={w} h={H} r={14} t={t} a={a} seed={seed} color={K.line2} opacity={1 - dashMix} plot={plot} />}
        {dashMix > 0 && <path d={rrPath(x, y, w, H, 14)} fill="none" stroke={K.creamDim} strokeOpacity={0.45} strokeWidth={1.5} strokeDasharray="6 6" opacity={dashMix} />}
      </g>
      {plot >= 1 && (
        <g>
          {/* prompt label: › for the human, the spark when Claude types */}
          {claude ? (
            <Spark x={x + 24} y={y + H / 2} R={10} rot={t * 60} />
          ) : (
            <text x={x + 18} y={baseY} fontFamily={CODE} fontSize={22} fill={disabled ? K.line2 : K.creamDim}>
              {'›'}
            </text>
          )}
          {showPh && (
            <text x={tx} y={baseY} fontFamily={CODE} fontSize={18} fill={K.creamDim} fillOpacity={0.45 * phO} xmlSpace="preserve">
              {ph}
            </text>
          )}
          {pr && pr.clear < 1 && (
            <g clipPath={`url(#cc${uid})`}>
              <text
                x={r2(tx - scroll)}
                y={r2(baseY - 10 * ease.outCubic(pr.clear))}
                opacity={1 - pr.clear}
                fontFamily={CODE}
                fontSize={size}
                fill={orangeText ? K.orange : K.cream}
                xmlSpace="preserve"
              >
                {txt}
              </text>
            </g>
          )}
          {caretOn && <Caret x={tx + tw - scroll + 2} y={baseY} h={24} color={orangeText ? K.orange : K.cream} />}
          {/* send button */}
          <g transform={`translate(${r2(bx)} ${r2(by)}) scale(${r2(1 + 0.12 * pulseK)})`}>
            {disabled ? (
              <rect x={-18} y={-18} width={36} height={36} rx={9} fill="none" stroke={K.line2} strokeWidth={1.5} />
            ) : (
              <rect x={-18} y={-18} width={36} height={36} rx={9} fill={btnOrange ? K.orange : K.line2} />
            )}
            <SendArrow x={0} y={0} color={disabled ? K.line2 : btnOrange ? K.bg : K.surface} />
          </g>
          {ringP < 1 && (
            <rect
              x={r2(bx - 18 - 16 * ease.outCubic(ringP))}
              y={r2(by - 18 - 16 * ease.outCubic(ringP))}
              width={r2(36 + 32 * ease.outCubic(ringP))}
              height={r2(36 + 32 * ease.outCubic(ringP))}
              rx={9 + 8 * ringP}
              fill="none"
              stroke={K.orange}
              strokeWidth={1.5}
              opacity={0.7 * (1 - ringP)}
            />
          )}
        </g>
      )}
    </svg>
  );
};

// ------------------------------------------------------------------ you-node
// Cream ring r = 9 (2 px) with the mono label `you`. t0: the ring plots on and
// the label types (8 frames). t1: it fades out (8 frames). ghost: dashed ring
// at 0.45. pings: times of sends → a ring ripple.
export const YouNodeG: React.FC<{
  t: number;
  x: number;
  y: number;
  t0?: number;
  t1?: number;
  ghost?: boolean;
  label?: string;
  labelPos?: 'below' | 'left' | 'right' | 'above';
  opacity?: number;
  pings?: number[];
  flicker?: number; // 0..1 stepped on/off flicker strength (ghost returns)
  color?: string;
}> = ({t, x, y, t0 = -Infinity, t1, ghost, label = 'you', labelPos = 'below', opacity = 1, pings = [], flicker = 0, color = K.cream}) => {
  if (t < t0) return null;
  const pin = isFinite(t0) ? clamp01((t - t0) * FPS / 8) : 1;
  const pout = t1 !== undefined ? clamp01((t - t1) * FPS / 8) : 0;
  let o = opacity * (1 - pout);
  if (flicker > 0 && hash(17, Math.floor(t * 12)) < 0.45 * flicker) o *= 0.15;
  if (o <= 0) return null;
  const R = 9;
  const circ = 2 * Math.PI * R;
  let ping = -Infinity;
  for (const p of pings) if (p <= t) ping = Math.max(ping, p);
  const pp = clamp01((t - ping) * FPS / 14);
  const n = Math.floor(pin * label.length + 1e-6);
  const lab = label.slice(0, n);
  const fs = 15;
  const lp =
    labelPos === 'below'
      ? {x: x, y: y + R + 20, anchor: 'middle' as const}
      : labelPos === 'above'
        ? {x: x, y: y - R - 10, anchor: 'middle' as const}
        : labelPos === 'left'
          ? {x: x - R - 10, y: y + fs * 0.36, anchor: 'end' as const}
          : {x: x + R + 10, y: y + fs * 0.36, anchor: 'start' as const};
  return (
    <g opacity={o}>
      <circle
        cx={r2(x)}
        cy={r2(y)}
        r={R}
        fill={K.bg}
        stroke={color}
        strokeOpacity={ghost ? 0.45 : 1}
        strokeWidth={2}
        strokeDasharray={ghost ? '3.5 3.5' : pin < 1 ? `${circ} ${circ}` : undefined}
        strokeDashoffset={!ghost && pin < 1 ? circ * (1 - pin) : undefined}
        transform={`rotate(-90 ${r2(x)} ${r2(y)})`}
      />
      {pp < 1 && <circle cx={r2(x)} cy={r2(y)} r={R + 16 * ease.outCubic(pp)} fill="none" stroke={K.orange} strokeWidth={1.5} opacity={0.6 * (1 - pp)} />}
      <text x={r2(lp.x)} y={r2(lp.y)} textAnchor={lp.anchor} fontFamily={CODE} fontSize={fs} fill={ghost ? K.creamDim : K.cream} fillOpacity={ghost ? 0.7 : 0.7}>
        {lab}
      </text>
    </g>
  );
};
export const YouNode: React.FC<Omit<React.ComponentProps<typeof YouNodeG>, 't'>> = (p) => {
  const {t} = useT();
  return (
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <YouNodeG {...p} t={t} />
    </svg>
  );
};

// ------------------------------------------------------------------ tether
export type TetherSend = number | {t: number; dir?: 1 | -1; dur?: number};
export type TetherCut = {t: number; u: number; gap?: number; retract?: boolean};

// The tether as a sampled polyline from `from` to `to` (u = 0..1).
const tetherPt = (from: P2, to: P2, u: number, sag: number, wave: number, t: number): P2 => {
  const dx = to[0] - from[0], dy = to[1] - from[1];
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  const off = sag * 4 * u * (1 - u) + wave * Math.sin(Math.PI * 2 * u) * Math.sin(t * 2 * Math.PI * 7) + wave * 0.5 * Math.sin(Math.PI * 5 * u) * Math.cos(t * 2 * Math.PI * 11);
  return [from[0] + dx * u + nx * off, from[1] + dy * u + ny * off];
};

export const TetherG: React.FC<{
  t: number;
  from: P2; // the you-node end
  to: P2; // Claude's spark end
  t0?: number; // plots from `from` to `to` over 10 frames
  t1?: number; // fades out over 8 frames
  sends?: TetherSend[]; // an orange dot travels from→to (dir 1) or back (dir −1), 0.5 s
  cuts?: TetherCut[]; // a gap (px, default 14) opens at u; retract: both pieces pull back to their ends
  sag?: number; // px bow (positive = to the left of travel)
  wave?: number; // tremble amplitude px (standing wave)
  opacity?: number; // line opacity (default 0.45)
  color?: string;
  w?: number;
  dash?: string;
}> = ({t, from, to, t0 = -Infinity, t1, sends = [], cuts = [], sag = 0, wave = 0, opacity = 0.45, color = K.cream, w = 1.5, dash}) => {
  if (t < t0) return null;
  const plot = isFinite(t0) ? ease.inOutCubic(clamp01((t - t0) * FPS / 10)) : 1;
  const fo = t1 !== undefined ? 1 - clamp01((t - t1) * FPS / 8) : 1;
  if (fo <= 0) return null;
  const L = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
  // visible intervals
  let iv: [number, number][] = [[0, plot]];
  const cutFx: React.ReactNode[] = [];
  const gaps: [number, number][] = [];
  cuts.forEach((c, i) => {
    if (t < c.t) return;
    const f = (t - c.t) * FPS;
    let g: [number, number];
    if (c.retract) {
      const p = ease.inOutCubic(clamp01((t - c.t) / 0.7));
      const g0 = ((c.gap ?? 14) / 2 / L) * clamp01(f / 4);
      g = [Math.max(0, c.u * (1 - p) - g0), Math.min(1, c.u + (1 - c.u) * p + g0)];
    } else {
      const half = ((c.gap ?? 14) / 2 / L) * ease.outCubic(clamp01(f / 6));
      g = [c.u - half, c.u + half];
    }
    gaps.push(g);
    iv = iv.flatMap(([a, b]) => {
      const out: [number, number][] = [];
      if (g[0] > a) out.push([a, Math.min(b, g[0])]);
      if (g[1] < b) out.push([Math.max(a, g[1]), b]);
      return out.filter(([p, q]) => q - p > 1e-4);
    });
    // spark: 6 short rays for 8 frames
    if (f < 8) {
      const [cx, cy] = tetherPt(from, to, c.u, sag, wave, t);
      const k = f / 8;
      for (let r = 0; r < 6; r++) {
        const ang = (r / 6) * Math.PI * 2 + i;
        const r0 = 4 + 10 * ease.outCubic(k), r1 = r0 + 8 * (1 - k);
        cutFx.push(
          <path
            key={`c${i}-${r}`}
            d={`M ${r2(cx + Math.cos(ang) * r0)} ${r2(cy + Math.sin(ang) * r0)} L ${r2(cx + Math.cos(ang) * r1)} ${r2(cy + Math.sin(ang) * r1)}`}
            stroke={K.orange}
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={1 - k}
          />,
        );
      }
    }
  });
  const N = Math.max(8, Math.ceil(L / 16));
  const seg = ([a, b]: [number, number]) => {
    const k = Math.max(2, Math.ceil((b - a) * N));
    let d = '';
    for (let i = 0; i <= k; i++) {
      const [px, py] = tetherPt(from, to, a + ((b - a) * i) / k, sag, wave, t);
      d += `${i ? 'L' : 'M'} ${r2(px)} ${r2(py)} `;
    }
    return d;
  };
  // travelling dots
  const dots: React.ReactNode[] = [];
  sends.forEach((s, i) => {
    const S = typeof s === 'number' ? {t: s} : s;
    const dur = S.dur ?? 0.5;
    const dir = S.dir ?? 1;
    const f = t - S.t;
    if (f < 0 || f > dur + 0.2) return;
    let u = ease.inOutCubic(clamp01(f / dur));
    if (dir < 0) u = 1 - u;
    // a dot that meets an open gap dies there
    let o = f > dur ? 1 - clamp01((f - dur) / 0.1) : 1;
    for (const g of gaps) {
      const edge = dir > 0 ? g[0] : g[1];
      const passed = dir > 0 ? u >= edge : u <= edge;
      if (passed && edge > 0 && edge < 1) {
        const tHit = S.t + dur * invInOut(dir > 0 ? edge : 1 - edge);
        u = edge;
        o = Math.min(o, 1 - clamp01((t - tHit) / 0.12));
      }
    }
    if (o <= 0 || u > plot) return;
    const [px, py] = tetherPt(from, to, u, sag, wave, t);
    dots.push(<circle key={i} cx={r2(px)} cy={r2(py)} r={4} fill={K.orange} opacity={o} />);
  });
  return (
    <g opacity={fo}>
      {iv.map((v, i) => (
        <path key={i} d={seg(v)} fill="none" stroke={color} strokeOpacity={opacity} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} />
      ))}
      {cutFx}
      {dots}
    </g>
  );
};
// inverse of ease.inOutCubic
const invInOut = (y: number) => (y < 0.5 ? Math.cbrt(y / 4) : 1 - Math.cbrt(2 * (1 - y)) / 2);

export const Tether: React.FC<Omit<React.ComponentProps<typeof TetherG>, 't'>> = (p) => {
  const {t} = useT();
  return (
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <TetherG {...p} t={t} />
    </svg>
  );
};

