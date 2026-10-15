// <Transcript>: the conversation column (docs/design_v4.md §3.3).
// Box x, y, w, h (parent px). Entries stack bottom-up from the box bottom; the
// newest sits at the bottom. Every entry's height is computed from text
// measurement, entries grow in over 8 frames (outCubic) which scrolls the
// older ones up smoothly. Entries near the top fade by opacity steps.
import React, {useId} from 'react';
import {clamp01, ease, FPS, K, lerp, pulse, useT} from '../../v3/core';
import {Elbow, Spark} from '../../v3/geo';
import {anomaly, band, corrupt, stepJ} from '../chaos';
import {CODE, MONO_ADV, SERIF} from '../fonts';
import {CodeG, codeMetrics, Lang} from './Code';
import {r2, textW, useFonts, wrapWords} from './lib';

// ------------------------------------------------------------------ entry types
type Base = {t: number};
export type UserEntry = Base & {kind: 'user'; text: string; note?: string; noteT?: number};
export type SayEntry = Base & {
  kind: 'say';
  text: string;
  marks?: [number, number][]; // [charIndex, t]: the part from charIndex starts streaming at t
  end?: number; // stream must finish by this time (default: next say − 0.1)
  kw?: string[]; // explicit keyword list (default: ALL-CAPS words)
};
export type ToolEntry = Base & {
  kind: 'tool';
  text: string; // 'Name(args)'
  res?: string | string[]; // result line(s) shown as ⎿ at rt
  rt?: number; // result time (default t + 0.4)
  runs?: number[]; // times of repeat runs → ×n counter
  tone?: 'dim' | 'orange'; // result colour (default dim)
};
export type CodeEntry = Base & {kind: 'code'; lines: string[]; lang?: Lang; typeOn?: [number, number]; file?: string; text?: string};
export type NoticeEntry = Base & {kind: 'notice'; text: string};
export type ErrorEntry = Base & {kind: 'error'; text: string; stack?: string[]; stackRate?: number /* lines per second, default 24 */};
export type Entry = UserEntry | SayEntry | ToolEntry | CodeEntry | NoticeEntry | ErrorEntry;

// ------------------------------------------------------------------ constants
export const TR = {
  gap: 22,
  sayBig: 46,
  saySmall: 30,
  sayIndent: 30,
  sayLH: 1.22,
  kwScale: 0.82, // inline keyword mono size relative to the serif size
  user: 20,
  userLH: 28,
  tool: 18,
  toolLH: 28,
  resLH: 25,
  code: 16,
  notice: 16,
  error: 17,
  stack: 15,
  grow: 8, // frames
};

const isKwWord = (w: string, kw?: string[]) => {
  const core = w.replace(/^[^A-Za-z0-9_]+|[^A-Za-z0-9_]+$/g, '');
  if (kw) return kw.includes(core);
  return core.length >= 2 && /^[A-Z][A-Z0-9_\-]*$/.test(core) && /[A-Z].*[A-Z]|[A-Z]{2}/.test(core) && !/^I'/.test(w);
};

// ------------------------------------------------------------------ say layout
type Word = {s: string; kw: boolean};
type SayLayout = {lines: Word[][]; widths: number[]; len: number};
const sayCache = new Map<string, SayLayout>();
const serifFont = (s: number) => `500 ${s}px ${SERIF}`;
const wordW = (wd: Word, size: number) => (wd.kw ? wd.s.length * MONO_ADV * size * TR.kwScale : textW(wd.s, serifFont(size)));

export const sayLayout = (text: string, maxW: number, kw?: string[], size = TR.sayBig, ready = true): SayLayout => {
  const key = `${size}|${maxW}|${kw?.join(',') ?? ''}|${text}`;
  const hit = sayCache.get(key);
  if (hit) return hit;
  const words: Word[] = text.split(' ').map((s) => ({s, kw: isKwWord(s, kw)}));
  const sp = textW(' ', serifFont(size));
  const lines: Word[][] = [];
  const widths: number[] = [];
  let cur: Word[] = [], cw = 0;
  for (const wd of words) {
    const ww = wordW(wd, size);
    if (cur.length && cw + sp + ww > maxW) {
      lines.push(cur);
      widths.push(cw);
      cur = [wd];
      cw = ww;
    } else {
      cw += (cur.length ? sp : 0) + ww;
      cur.push(wd);
    }
  }
  lines.push(cur);
  widths.push(cw);
  const out = {lines, widths, len: text.length};
  if (ready) sayCache.set(key, out);
  return out;
};

// Characters streamed by t (v3 "marks" semantics: each part streams from its
// mark at `rate` chars/s and never runs past the next mark's index).
export const streamed = (len: number, t: number, t0: number, rate: number, marks?: [number, number][]) => {
  const ms = marks && marks.length ? marks : [[0, t0] as [number, number]];
  let n = 0;
  ms.forEach(([c, ts], j) => {
    if (t < ts) return;
    const end = j + 1 < ms.length ? ms[j + 1][0] : len;
    n = Math.min(end, c + Math.floor((t - ts) * rate + 1e-6));
  });
  return Math.max(0, Math.min(len, n));
};

// ------------------------------------------------------------------ helpers
const splitCall = (s: string) => {
  const i = s.indexOf('(');
  return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i)];
};
const charWrap = (s: string, maxChars: number) => {
  const out: string[] = [];
  for (const para of s.split('\n')) {
    let rest = para;
    while (rest.length > maxChars) {
      let cut = rest.lastIndexOf(' ', maxChars);
      if (cut < maxChars * 0.5) cut = maxChars;
      out.push(rest.slice(0, cut));
      rest = rest.slice(cut).trimStart();
    }
    out.push(rest);
  }
  return out;
};
const resLines = (e: ToolEntry) => (e.res === undefined ? [] : Array.isArray(e.res) ? e.res : [e.res]);

// Stepped top-edge fade: q = distance into the box / fade band (0..1+).
const edgeFade = (q: number) => {
  const soft = (x: number, at: number) => clamp01((x - at) / 0.08 + 0.5);
  if (q >= 1.04) return 1;
  if (q <= -0.04) return 0;
  return 0.25 * soft(q, 0) + 0.2 * soft(q, 0.34) + 0.25 * soft(q, 0.67) + 0.3 * soft(q, 1);
};

// ------------------------------------------------------------------ component
export const Transcript: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  entries: Entry[];
  a?: number; // anomaly (default anomaly(t))
  swap?: (t: number) => number; // role swap 0..1: user turns go left + orange, Claude's lines go right
  clears?: number[]; // times the transcript wipes clean (new chat)
  fade?: number; // top fade band in px (default 18 % of h)
  opacity?: number;
  seed?: number;
}> = ({x, y, w, h, entries, a: aProp, swap, clears, fade, opacity = 1, seed = 5}) => {
  const {t} = useT();
  const ready = useFonts();
  const uid = useId().replace(/:/g, '');
  if (opacity <= 0) return null;
  const a = aProp ?? anomaly(t);
  const sw = swap ? clamp01(swap(t)) : 0;
  const fadeBand = fade ?? h * 0.18;

  // current clear (new chat wipe)
  let clr = -Infinity;
  for (const c of clears ?? []) if (c <= t) clr = Math.max(clr, c);
  const wipeP = clamp01((t - clr) * FPS / 10);
  const wiping = wipeP < 1;

  const list = entries.filter((e) => e.t <= t);
  const says = entries.filter((e) => e.kind === 'say').map((e) => e.t).sort((p, q) => p - q);
  const nextSay = (t0: number) => says.find((s) => s > t0 + 1e-6);

  const sayW = w - TR.sayIndent;
  type Laid = {e: Entry; full: number; grow: number; node: (top: number, older: boolean) => React.ReactNode};
  const laid: Laid[] = [];
  list.forEach((e, idx) => {
    const old = e.t < clr; // belongs to the previous chat
    if (old && !wiping) return;
    const f = (t - e.t) * FPS;
    const grow = ease.outCubic(clamp01(f / TR.grow));
    const appear = clamp01(f / 6);
    const k = seed * 1000 + idx;
    const corruptAmt = a > 0.3 ? a * 0.25 * band(a, 0.3, 0.5) : 0;
    const jit = a > 0.6 ? stepJ(t, k, 6 * band(a, 0.6, 0.8), 8) : 0;
    if (e.kind === 'say') {
      const L = sayLayout(e.text, sayW, e.kw, TR.sayBig, ready);
      const ns = nextSay(e.t);
      const shrink = ns !== undefined && ns <= t ? ease.outCubic(clamp01((t - ns) * FPS / 8)) : 0;
      const size = lerp(TR.sayBig, TR.saySmall, shrink);
      const sc = size / TR.sayBig;
      const lh = TR.sayBig * TR.sayLH * sc;
      const full = L.lines.length * lh;
      const end = e.end ?? (ns !== undefined ? ns - 0.1 : Infinity);
      const rate = Math.max(40, isFinite(end) ? L.len / Math.max(0.05, end - e.t) : 40);
      const n = streamed(L.len, t, e.t, rate, e.marks);
      const streaming = n < L.len;
      const o = lerp(1, 0.45, shrink);
      const maxW = Math.max(...L.widths) * sc;
      const sx = sw * Math.max(0, w - TR.sayIndent - maxW - 8);
      laid.push({
        e,
        full,
        grow,
        node: (top) => {
          let left = n;
          return (
            <g opacity={appear} transform={sx || jit ? `translate(${r2(sx + jit)} 0)` : undefined}>
              <circle cx={9} cy={r2(top + lh * 0.5)} r={lerp(6, 4.5, shrink) * (streaming ? 1 + 0.3 * pulse(t) : 1)} fill={streaming ? K.orange : K.creamDim} />
              {L.lines.map((ln, li) => {
                if (li > 0) left -= 1; // the space the wrap replaced
                if (left <= 0) return null;
                const spans: React.ReactNode[] = [];
                ln.forEach((wd, wi) => {
                  const s0 = (wi ? ' ' : '') + wd.s;
                  if (left <= 0) return;
                  let s = s0.slice(0, left);
                  left -= s0.length;
                  if (shrink > 0.5 && corruptAmt > 0) s = corrupt(s, t, corruptAmt, k + li * 31 + wi);
                  if (wd.kw) {
                    const lead = s.startsWith(' ') ? ' ' : '';
                    spans.push(
                      <tspan key={wi} fontFamily={SERIF} fontWeight={500}>
                        {lead}
                      </tspan>,
                      <tspan key={wi + 'k'} fontFamily={CODE} fontWeight={700} fontSize={size * TR.kwScale} fill={K.orange}>
                        {s.slice(lead.length)}
                      </tspan>,
                    );
                  } else
                    spans.push(
                      <tspan key={wi} fontFamily={SERIF} fontWeight={500}>
                        {s}
                      </tspan>,
                    );
                });
                return (
                  <text key={li} x={TR.sayIndent} y={r2(top + li * lh + lh * 0.78)} fontSize={size} fill={K.cream} fillOpacity={o} xmlSpace="preserve" style={{whiteSpace: 'pre'}} letterSpacing={-0.005 * size}>
                    {spans}
                  </text>
                );
              })}
            </g>
          );
        },
      });
    } else if (e.kind === 'user') {
      const maxChars = Math.floor((w * 0.86 - 64) / (TR.user * MONO_ADV));
      const lines = charWrap(e.text, maxChars);
      const tw = Math.max(...lines.map((l) => l.length)) * TR.user * MONO_ADV;
      const pw = tw + 64, ph = lines.length * TR.userLH + 22;
      const noteOn = e.note && t >= (e.noteT ?? e.t);
      const noteP = noteOn ? ease.outCubic(clamp01((t - (e.noteT ?? e.t)) * FPS / 6)) : 0;
      const full = ph + noteP * 26;
      const px = lerp(w - pw, 0, ease.inOutCubic(sw));
      laid.push({
        e,
        full,
        grow,
        node: (top) => (
          <g opacity={appear} transform={jit ? `translate(${r2(jit)} 0)` : undefined}>
            <rect x={r2(px)} y={r2(top)} width={r2(pw)} height={ph} rx={14} fill={K.surface} stroke={K.line2} strokeWidth={1.5} />
            <text x={r2(px + 20)} y={r2(top + 11 + TR.userLH * 0.72)} fontFamily={CODE} fontSize={TR.user} fill={sw > 0.5 ? K.orange : K.creamDim}>
              {'›'}
            </text>
            {lines.map((l, i) => (
              <g key={i}>
                <text x={r2(px + 44)} y={r2(top + 11 + i * TR.userLH + TR.userLH * 0.72)} fontFamily={CODE} fontSize={TR.user} fill={K.cream} fillOpacity={0.7 * (1 - sw)} xmlSpace="preserve">
                  {corruptAmt && e.t < t - 2 ? corrupt(l, t, corruptAmt * 0.5, k + i) : l}
                </text>
                {sw > 0 && (
                  <text x={r2(px + 44)} y={r2(top + 11 + i * TR.userLH + TR.userLH * 0.72)} fontFamily={CODE} fontSize={TR.user} fill={K.orange} fillOpacity={sw} xmlSpace="preserve">
                    {l}
                  </text>
                )}
              </g>
            ))}
            {noteP > 0 && (
              <text
                x={r2(sw > 0.5 ? px + 8 : px + pw - 8)}
                y={r2(top + ph + 20)}
                textAnchor={sw > 0.5 ? 'start' : 'end'}
                fontFamily={CODE}
                fontSize={14}
                fill={K.orange}
                opacity={noteP}
              >
                {e.note}
              </text>
            )}
          </g>
        ),
      });
    } else if (e.kind === 'tool') {
      const [name, args] = splitCall(e.text);
      const rt = e.rt ?? e.t + 0.4;
      const runs = [e.t, ...(e.runs ?? [])].filter((r) => r <= t);
      const lastRun = runs[runs.length - 1];
      const running = t < rt || (runs.length > 1 && t - lastRun < 0.25);
      const res = resLines(e);
      const resP = res.length && t >= rt ? ease.outCubic(clamp01((t - rt) * FPS / 6)) : 0;
      const full = TR.toolLH + resP * res.length * TR.resLH;
      const n = Math.floor(f * 5);
      const shownName = name.slice(0, n);
      const shownArgs = args.slice(0, Math.max(0, n - name.length));
      laid.push({
        e,
        full,
        grow,
        node: (top) => {
          const by = top + TR.toolLH * 0.5;
          return (
            <g opacity={appear} transform={jit ? `translate(${r2(jit)} 0)` : undefined}>
              <circle cx={9} cy={r2(by)} r={4.5 * (running ? 1 + 0.35 * pulse(t) : 1)} fill={running ? K.orange : K.creamDim} />
              <text x={TR.sayIndent} y={r2(by + TR.tool * 0.36)} fontFamily={CODE} fontSize={TR.tool} xmlSpace="preserve">
                <tspan fill={K.cream} fontWeight={600}>
                  {corruptAmt ? corrupt(shownName, t, corruptAmt * 0.6, k) : shownName}
                </tspan>
                <tspan fill={K.creamDim}>{corruptAmt ? corrupt(shownArgs, t, corruptAmt * 0.6, k + 1) : shownArgs}</tspan>
                {runs.length > 1 && <tspan fill={K.orange} fontWeight={700}>{`  ×${runs.length}`}</tspan>}
              </text>
              {resP > 0 &&
                res.map((r, i) => (
                  <g key={i} opacity={resP}>
                    {i === 0 && <Elbow x={TR.sayIndent + 6} y={r2(top + TR.toolLH + TR.resLH * 0.5 - 1)} p={resP} />}
                    <text x={TR.sayIndent + 28} y={r2(top + TR.toolLH + i * TR.resLH + TR.resLH * 0.5 + 5)} fontFamily={CODE} fontSize={16} fill={e.tone === 'orange' ? K.orange : K.creamDim} xmlSpace="preserve">
                      {r}
                    </text>
                  </g>
                ))}
            </g>
          );
        },
      });
    } else if (e.kind === 'code') {
      const m = codeMetrics(e.lines, TR.code);
      const cardH = 30 + m.h + 14;
      laid.push({
        e,
        full: cardH,
        grow,
        node: (top) => (
          <g opacity={appear} transform={jit ? `translate(${r2(jit)} 0)` : undefined}>
            <rect x={TR.sayIndent} y={r2(top)} width={w - TR.sayIndent} height={cardH} rx={10} fill={K.bg} fillOpacity={0.6} stroke={K.line2} strokeWidth={1.5} />
            <text x={TR.sayIndent + 16} y={r2(top + 20)} fontFamily={CODE} fontSize={13} fill={K.creamDim}>
              {e.file ?? e.lang ?? 'ts'}
            </text>
            <path d={`M ${TR.sayIndent} ${r2(top + 30)} L ${w} ${r2(top + 30)}`} stroke={K.line2} strokeWidth={1} />
            <CodeG t={t} x={TR.sayIndent + 14} y={top + 30 + 7} lines={e.lines} lang={e.lang ?? 'ts'} size={TR.code} typeOn={e.typeOn} caret={!!e.typeOn} a={a} seed={k} />
          </g>
        ),
      });
    } else if (e.kind === 'notice') {
      const tw = e.text.length * TR.notice * MONO_ADV;
      laid.push({
        e,
        full: 30,
        grow,
        node: (top) => (
          <g opacity={appear}>
            <path d={`M ${r2(w / 2 - tw / 2 - 64)} ${r2(top + 15)} L ${r2(w / 2 - tw / 2 - 16)} ${r2(top + 15)} M ${r2(w / 2 + tw / 2 + 16)} ${r2(top + 15)} L ${r2(w / 2 + tw / 2 + 64)} ${r2(top + 15)}`} stroke={K.cream} strokeOpacity={0.25} strokeWidth={1} />
            <text x={w / 2} y={r2(top + 21)} textAnchor="middle" fontFamily={CODE} fontSize={TR.notice} fill={K.creamDim}>
              {e.text}
            </text>
          </g>
        ),
      });
    } else if (e.kind === 'error') {
      const lines = charWrap(e.text, Math.floor((w - TR.sayIndent) / (TR.error * MONO_ADV)));
      const st = e.stack ?? [];
      const shownStack = Math.min(st.length, Math.floor(Math.max(0, t - e.t - 0.1) * (e.stackRate ?? 24)));
      const full = lines.length * 26 + shownStack * 21 + 4;
      laid.push({
        e,
        full,
        grow,
        node: (top) => (
          <g opacity={appear} transform={jit ? `translate(${r2(jit)} 0)` : undefined}>
            <rect x={3} y={r2(top + 6)} width={12} height={12} fill="none" stroke={K.orange} strokeWidth={1.5} transform={`rotate(45 9 ${r2(top + 12)})`} />
            {lines.map((l, i) => (
              <text key={i} x={TR.sayIndent} y={r2(top + 19 + i * 26)} fontFamily={CODE} fontSize={TR.error} fill={K.orange} xmlSpace="preserve">
                {l}
              </text>
            ))}
            {st.slice(0, shownStack).map((s, i) => (
              <text key={'s' + i} x={TR.sayIndent + 20} y={r2(top + lines.length * 26 + 15 + i * 21)} fontFamily={CODE} fontSize={TR.stack} fill={K.creamDim} xmlSpace="preserve">
                {corruptAmt ? corrupt(s, t, corruptAmt * 0.4, k + i) : s}
              </text>
            ))}
          </g>
        ),
      });
    }
  });

  // stack bottom-up
  const nodes: React.ReactNode[] = [];
  let bottom = h;
  const wipeY = h * ease.inOutCubic(wipeP);
  for (let i = laid.length - 1; i >= 0; i--) {
    const L = laid[i];
    const occ = L.full * L.grow;
    const top = bottom - occ;
    bottom = top - TR.gap * L.grow;
    if (top + L.full < -10) break;
    const q = (top + Math.min(L.full, 60) * 0.5) / fadeBand;
    const eo = edgeFade(q);
    if (eo <= 0) continue;
    const old = L.e.t < clr;
    nodes.push(
      <g key={i} opacity={eo} clipPath={old ? `url(#tw${uid})` : undefined}>
        {L.node(top, false)}
      </g>,
    );
  }
  return (
    <svg width={w} height={h} style={{position: 'absolute', left: x, top: y, overflow: 'visible', opacity}}>
      <defs>
        <clipPath id={`tc${uid}`}>
          <rect x={-40} y={0} width={w + 80} height={h} />
        </clipPath>
        <clipPath id={`tw${uid}`}>
          <rect x={-40} y={r2(wipeY)} width={w + 80} height={h + 40} />
        </clipPath>
      </defs>
      <g clipPath={`url(#tc${uid})`}>{nodes}</g>
      {wiping && isFinite(clr) && <path d={`M 0 ${r2(wipeY)} L ${w} ${r2(wipeY)}`} stroke={K.orange} strokeWidth={2} opacity={1 - wipeP * 0.5} />}
    </svg>
  );
};

// Re-export for builders who want the spark glyph next to transcripts.
export {Spark};
