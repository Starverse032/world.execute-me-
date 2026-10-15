// <KwCode>: a keyword as a code statement (docs/design_v4.md §3.9).
//   world.PROTECTION = true;
// pre / post: mono creamDim at 0.42 × size; kw: mono 700 orange at size.
// Timeline: pre types over the 4 frames before t0 · kw slams in at t0 (scale
// 1.04 → 1 over 4 frames) · post types after it · at t1 everything deletes
// right-to-left like a backspace (6 frames).
import React from 'react';
import {clamp01, ease, FPS, K, useT} from '../../v3/core';
import {anomaly, band, corrupt, stepJ} from '../chaos';
import {CODE, MONO_ADV} from '../fonts';
import {Caret, r2} from './lib';

export type KwStyle = 'outline' | 'solid' | 'ghost';

export const kwMetrics = (pre: string, kw: string, post: string, size: number) => {
  const ps = size * 0.42;
  const preW = pre.length * MONO_ADV * ps, kwW = kw.length * MONO_ADV * size, postW = post.length * MONO_ADV * ps;
  return {ps, preW, kwW, postW, w: preW + kwW + postW};
};
// Largest size that fits the statement in maxW px (capped at maxSize).
export const kwFit = (pre: string, kw: string, post: string, maxW: number, maxSize = 200) =>
  Math.min(maxSize, Math.floor(maxW / (MONO_ADV * (kw.length + 0.42 * (pre.length + post.length)))));

export const KwCode: React.FC<{
  t0: number;
  t1: number;
  pre?: string;
  kw: string;
  post?: string;
  x: number; // anchor x (see anchor)
  y: number; // baseline
  size?: number; // kw size px (default 160)
  a?: number; // anomaly: jitter, doubled outline, corrupted pre/post (default anomaly(t))
  style?: KwStyle; // 'outline' (default): 3 solid frames then outline; 'solid': stays filled; 'ghost': outline only
  anchor?: 'start' | 'middle' | 'end'; // default 'middle'
  exit?: 'backspace' | 'fade' | 'none'; // default 'backspace'
  knock?: boolean; // dark knockout behind the text (default true)
  underline?: boolean; // 3 px orange underline under kw, plots f0–f5
  opacity?: number;
  seed?: number;
}> = ({t0, t1, pre = '', kw, post = '', x, y, size = 160, a: aProp, style = 'outline', anchor = 'middle', exit = 'backspace', knock = true, underline, opacity = 1, seed = 13}) => {
  const {t} = useT();
  const preStart = t0 - 4 / FPS;
  const exitF = exit === 'backspace' ? 6 : exit === 'fade' ? 5 : 0;
  if (t < (pre ? preStart : t0) || t >= t1 + exitF / FPS || opacity <= 0) return null;
  const a = aProp ?? anomaly(t);
  const m = kwMetrics(pre, kw, post, size);
  const left = anchor === 'start' ? x : anchor === 'end' ? x - m.w : x - m.w / 2;
  const f = (t - t0) * FPS;

  // typed counts
  let nPre = f >= 0 ? pre.length : Math.floor(clamp01((t - preStart) / (4 / FPS)) * pre.length + 1e-6);
  let nKw = f >= 0 ? kw.length : 0;
  let nPost = f < 4 ? 0 : Math.min(post.length, Math.floor((f - 4) * 2 + 1));
  let fadeO = 1, lift = 0;
  if (t >= t1) {
    const xf = (t - t1) * FPS;
    if (exit === 'backspace') {
      const total = nPre + nKw + nPost;
      let keep = Math.floor(total * (1 - xf / 6));
      nPre = Math.min(nPre, keep);
      keep -= nPre;
      nKw = Math.min(nKw, Math.max(0, keep));
      keep -= nKw;
      nPost = Math.min(nPost, Math.max(0, keep));
    } else if (exit === 'fade') {
      fadeO = 1 - xf / 5;
      lift = 14 * (xf / 5);
    }
  }
  const typing = (f < 0 && nPre < pre.length) || (f >= 4 && nPost < post.length) || (t >= t1 && exit === 'backspace');

  // hit styling
  const fillO = style === 'solid' ? 1 : style === 'ghost' ? 0 : f < 3 ? 1 : f >= 11 ? 0 : 1 - (f - 2) / 9;
  const sc = f >= 0 && f < 4 ? 1.04 - 0.04 * ease.outCubic(f / 4) : 1;
  const sw = Math.max(1.5, size / 70);
  const jb = band(a, 0.3, 0.5);
  const jx = jb ? stepJ(t, seed, 5 * a * jb, 8) : 0, jy = jb ? stepJ(t, seed + 1, 3 * a * jb, 8) : 0;
  const ghost = band(a, 0.5, 0.6);
  const gx = stepJ(t, seed + 2, 8, 8) * ghost, gy = stepJ(t, seed + 3, 5, 8) * ghost;
  const amt = a > 0.4 ? a * 0.3 * band(a, 0.4, 0.5) : 0;
  const preS = amt ? corrupt(pre.slice(0, nPre), t, amt, seed) : pre.slice(0, nPre);
  const postS = amt ? corrupt(post.slice(0, nPost), t, amt, seed + 5) : post.slice(0, nPost);
  const kwS = kw.slice(0, nKw);

  const kx = left + m.preW, px = kx + m.kwW;
  const kcx = kx + m.kwW / 2, kcy = y - size * 0.36;
  const knockStroke = {stroke: K.bg, strokeLinejoin: 'round' as const, style: {paintOrder: 'stroke' as const}};
  const caretX = nPost > 0 ? px + nPost * MONO_ADV * m.ps : nKw > 0 ? kx + nKw * MONO_ADV * size : left + nPre * MONO_ADV * m.ps;
  const ul = underline ? ease.outCubic(clamp01(f / 5)) : 0;
  return (
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: opacity * fadeO, transform: lift ? `translateY(${-lift}px)` : undefined}}>
      <g transform={`translate(${r2(jx)} ${r2(jy)})`}>
        {preS && (
          <text x={r2(left)} y={r2(y)} fontFamily={CODE} fontSize={m.ps} fill={K.creamDim} xmlSpace="preserve" {...(knock ? {...knockStroke, strokeWidth: m.ps * 0.35} : {})}>
            {preS}
          </text>
        )}
        {kwS && (
          <g transform={sc !== 1 ? `translate(${r2(kcx)} ${r2(kcy)}) scale(${r2(sc * 1000) / 1000}) translate(${r2(-kcx)} ${r2(-kcy)})` : undefined}>
            {ghost > 0 && (
              <text x={r2(kx + gx)} y={r2(y + gy)} fontFamily={CODE} fontWeight={700} fontSize={size} fill="none" stroke={K.orange} strokeOpacity={0.45 * ghost} strokeWidth={sw}>
                {kwS}
              </text>
            )}
            {knock && (
              <text x={r2(kx)} y={r2(y)} fontFamily={CODE} fontWeight={700} fontSize={size} fill={K.bg} stroke={K.bg} strokeWidth={size * 0.1} strokeLinejoin="round">
                {kwS}
              </text>
            )}
            <text x={r2(kx)} y={r2(y)} fontFamily={CODE} fontWeight={700} fontSize={size} fill={K.orange} fillOpacity={fillO} stroke={K.orange} strokeWidth={sw} strokeLinejoin="round" style={{paintOrder: 'stroke'}}>
              {kwS}
            </text>
            {ul > 0 && <rect x={r2(kx)} y={r2(y + size * 0.14)} width={r2(m.kwW * ul)} height={3} fill={K.orange} />}
          </g>
        )}
        {postS && (
          <text x={r2(px)} y={r2(y)} fontFamily={CODE} fontSize={m.ps} fill={K.creamDim} xmlSpace="preserve" {...(knock ? {...knockStroke, strokeWidth: m.ps * 0.35} : {})}>
            {postS}
          </text>
        )}
        {typing && <Caret x={caretX + 3} y={y} h={m.ps * 1.1} color={K.cream} />}
      </g>
    </svg>
  );
};
