// <Win>: a window frame (docs/design_v4.md §3.2).
// Coordinates: x, y = top-left of the window in the parent's px (usually the
// 1920×1080 frame). Children are laid out in the BODY box, whose origin is the
// window's top-left + (0, top) where top = 34 (title bar) [+ 32 when tabs].
// Use winBody() to get the body size.
import React, {useId} from 'react';
import {clamp01, ease, FPS, K, lerp, useT} from '../../v3/core';
import {anomaly, band, corrupt, stepJ} from '../chaos';
import {CODE} from '../fonts';
import {Frame, r2, rrPath, since} from './lib';

export type WinKind = 'plain' | 'term' | 'editor' | 'doc';
export type Tab = {t: number; label: string};

export const WIN_TITLE = 34;
export const WIN_TABS = 32;
export const winTop = (tabs?: Tab[]) => WIN_TITLE + (tabs && tabs.length ? WIN_TABS : 0);
// Body box (relative to the window's top-left).
export const winBody = (w: number, h: number, tabs?: Tab[]) => ({x: 0, y: winTop(tabs), w, h: h - winTop(tabs)});

const OPEN_F = 14;
const CLOSE_F = 12;

// Geometry of the open / close animation at time t.
//  line: width of the orange construction line (0..w), centred
//  hh:   visible frame height (0..h), centred on the window's middle
//  content: 0..1 opacity of the body, lineO: orange line opacity, dotO: closing dot
export const winState = (t: number, tOpen: number, tClose?: number, w = 1, h = 1) => {
  const fo = (t - tOpen) * FPS;
  if (fo < 0) return null;
  let line = w, hh = h, content = 1, lineO = 0, dotO = 0;
  if (fo < OPEN_F) {
    line = w * ease.outCubic(clamp01(fo / 6));
    hh = h * ease.outCubic(clamp01((fo - 6) / 8));
    content = clamp01((fo - 10) / 4);
    lineO = fo < 6 ? 1 : 1 - clamp01((fo - 6) / 5);
  }
  if (tClose !== undefined && t >= tClose) {
    const fc = (t - tClose) * FPS;
    if (fc >= CLOSE_F) return null;
    content = Math.min(content, 1 - clamp01(fc / 3));
    hh = Math.min(hh, h * (1 - ease.inCubic(clamp01(fc / 7))));
    line = Math.min(line, w * (1 - ease.inCubic(clamp01((fc - 7) / 3))));
    lineO = Math.max(lineO, clamp01((fc - 3) / 3));
    dotO = fc < 9 ? 0 : 1 - clamp01((fc - 10) / 2);
  }
  return {line, hh, content, lineO, dotO, opening: fo < OPEN_F};
};

export const Win: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  tOpen: number;
  tClose?: number;
  a?: number; // anomaly 0..1 (default: global anomaly(t))
  seed?: number;
  kind?: WinKind;
  tabs?: Tab[];
  activeTab?: (t: number) => number;
  children?: React.ReactNode;
  // extras
  opacity?: number; // whole window
  focus?: boolean; // brighter border (cream 0.45)
  lid?: number; // 0..1 eyelid: a line wipes down the body and covers it
  wave?: number; // standing-wave border amplitude (px)
  shatter?: number; // 0..1 border pieces fly apart (fill/title/body fade)
  titleRight?: React.ReactNode; // small SVG in the title bar's right side (local coords)
}> = ({x, y, w, h, title = '', tOpen, tClose, a: aProp, seed = 1, kind = 'plain', tabs, activeTab, children, opacity = 1, focus, lid = 0, wave = 0, shatter = 0, titleRight}) => {
  const {t} = useT();
  const uid = useId().replace(/:/g, '');
  const st = winState(t, tOpen, tClose, w, h);
  if (!st || opacity <= 0) return null;
  const a = aProp ?? anomaly(t);
  const {line, hh, content, lineO, dotO} = st;
  const top0 = (h - hh) / 2; // visible frame top (local)
  const showFrame = hh > 0.5;
  const top = winTop(tabs);
  const sh = clamp01(shatter);
  const keep = 1 - sh; // fill, title and body fade as the frame breaks

  // anomaly-driven offsets
  const ghost = band(a, 0.4, 0.5);
  const det = band(a, 0.7, 0.8);
  const cdx = stepJ(t, seed * 11 + 1, 10 * det, 8), cdy = stepJ(t, seed * 11 + 2, 10 * det, 8);
  const gdx = stepJ(t, seed * 11 + 3, 6, 8) * ghost, gdy = stepJ(t, seed * 11 + 4, 6, 8) * ghost;
  const titleTxt = a > 0.4 ? corrupt(title, t, a * 0.3 * band(a, 0.4, 0.45), seed) : title;
  const strokeO = focus ? 0.45 : 0.25;
  const fillCol = kind === 'term' ? K.bg : K.surface;

  // tabs
  let tabEls: React.ReactNode = null;
  if (tabs && tabs.length && showFrame) {
    const act = activeTab ? activeTab(t) : tabs.reduce((m, tb, i) => (t >= tb.t ? i : m), 0);
    const ch = since((tt) => (activeTab ? activeTab(tt) : tabs.reduce((m, tb, i) => (tt >= tb.t ? i : m), 0)), t, 6);
    let tx = 10;
    const geo: {x: number; w: number}[] = [];
    const els: React.ReactNode[] = [];
    tabs.forEach((tb, i) => {
      const f = (t - tb.t) * FPS;
      if (f < 0) {
        geo.push({x: tx, w: 0});
        return;
      }
      const full = tb.label.length * 8.4 + 32;
      const tw = full * ease.outCubic(clamp01(f / 6));
      geo.push({x: tx, w: tw});
      const n = Math.floor(clamp01((f - 2) / 6) * tb.label.length);
      const on = i === act;
      els.push(
        <g key={i}>
          <path d={`M ${r2(tx + tw)} ${WIN_TITLE + 8} L ${r2(tx + tw)} ${WIN_TITLE + WIN_TABS - 8}`} stroke={K.cream} strokeOpacity={0.25} strokeWidth={1} />
          <text x={tx + 16} y={WIN_TITLE + 21} fontFamily={CODE} fontSize={14} fill={on ? K.cream : K.creamDim} opacity={on ? 1 : 0.7}>
            {tb.label.slice(0, n)}
          </text>
        </g>,
      );
      tx += tw;
    });
    // active underline slides between tabs over 6 frames
    const g1 = geo[act];
    let ux = g1?.x ?? 0, uw = g1?.w ?? 0;
    if (ch.f < 6 && geo[ch.prev as number]) {
      const p = ease.outCubic(clamp01(ch.f / 6));
      ux = lerp(geo[ch.prev as number].x, ux, p);
      uw = lerp(geo[ch.prev as number].w, uw, p);
    }
    tabEls = (
      <g opacity={keep}>
        {els}
        <path d={`M 0 ${WIN_TITLE + WIN_TABS} L ${w} ${WIN_TABS + WIN_TITLE}`} stroke={K.cream} strokeOpacity={0.25} strokeWidth={1} />
        {uw > 0 && <rect x={r2(ux + 8)} y={WIN_TITLE + WIN_TABS - 2} width={r2(Math.max(0, uw - 16))} height={2} fill={K.orange} />}
      </g>
    );
  }

  const bodyClipTop = Math.max(0, top0); // while unfolding, the body starts under the riding title bar
  const bodyClipBot = Math.max(0, h - (top0 + hh));
  const lidY = top + (h - top) * clamp01(lid);

  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity, pointerEvents: 'none'}}>
      {/* fill */}
      <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {showFrame && <path d={rrPath(0, top0, w, hh, 10)} fill={fillCol} fillOpacity={0.92 * keep} />}
      </svg>
      {/* body */}
      {showFrame && content > 0 && keep > 0 && h - top > 0 && (
        <div
          style={{
            position: 'absolute',
            left: cdx,
            top: top + cdy,
            width: w,
            height: h - top,
            overflow: 'hidden',
            opacity: content * keep,
            clipPath: bodyClipTop > 0 || bodyClipBot > 0 ? `inset(${r2(bodyClipTop)}px 0 ${r2(bodyClipBot)}px 0)` : undefined,
            borderRadius: '0 0 10px 10px',
          }}
        >
          {children}
        </div>
      )}
      {/* chrome */}
      <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {lid > 0 && showFrame && (
          <g>
            <rect x={0} y={top} width={w} height={r2(lidY - top)} fill={fillCol} />
            <path d={`M 0 ${r2(lidY)} L ${w} ${r2(lidY)}`} stroke={K.cream} strokeOpacity={0.45} strokeWidth={1.5} />
          </g>
        )}
        <defs>
          <clipPath id={`wc${uid}`}>
            <rect x={-2} y={r2(top0)} width={w + 4} height={r2(hh)} />
          </clipPath>
        </defs>
        {showFrame && (
          <g opacity={keep} clipPath={hh < h ? `url(#wc${uid})` : undefined}>
          <g transform={top0 > 0 ? `translate(0 ${r2(top0)})` : undefined}>
            {kind !== 'doc' && (
              <g>
                <circle cx={18} cy={17} r={3.5} fill={K.orange} />
                <circle cx={32} cy={17} r={3.5} fill="none" stroke={K.line2} strokeWidth={1.2} />
                <circle cx={46} cy={17} r={3.5} fill="none" stroke={K.line2} strokeWidth={1.2} />
              </g>
            )}
            <text x={w / 2} y={22} textAnchor="middle" fontFamily={CODE} fontSize={15} fill={kind === 'doc' ? K.cream : K.creamDim} opacity={kind === 'doc' ? 0.7 : 1}>
              {titleTxt}
            </text>
            <path d={`M 0 ${WIN_TITLE} L ${w} ${WIN_TITLE}`} stroke={K.cream} strokeOpacity={0.25} strokeWidth={1} />
            {titleRight}
            {tabEls}
          </g>
          </g>
        )}
        {showFrame && ghost > 0 && sh <= 0 && (
          <g transform={`translate(${r2(gdx)} ${r2(gdy)})`}>
            <Frame x={0} y={top0} w={w} h={hh} t={t} a={a} seed={seed + 97} color={K.orange} opacity={0.45 * ghost} />
          </g>
        )}
        {showFrame && <Frame x={0} y={top0} w={w} h={hh} t={t} a={a} seed={seed} opacity={strokeO} wave={wave} shatter={sh} />}
        {/* the orange construction line; while the frame unfolds / folds it rides the top and bottom edges */}
        {lineO > 0 && line > 0 && (
          <path
            d={`M ${r2(w / 2 - line / 2)} ${r2(top0)} L ${r2(w / 2 + line / 2)} ${r2(top0)}` + (hh > 1 ? ` M ${r2(w / 2 - line / 2)} ${r2(top0 + hh)} L ${r2(w / 2 + line / 2)} ${r2(top0 + hh)}` : '')}
            stroke={K.orange}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={lineO}
          />
        )}
        {dotO > 0 && <circle cx={w / 2} cy={h / 2} r={3.5} fill={K.orange} opacity={dotO} />}
      </svg>
    </div>
  );
};
