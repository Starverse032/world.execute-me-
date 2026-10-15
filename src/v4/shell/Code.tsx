// Code highlighter, <CodeBlock> and <Diff> (docs/design_v4.md §3.4).
// All mono text is JetBrains Mono (0.6 em advance), so layout is exact without
// measuring. CodeBlock / Diff are HTML-level (an absolutely positioned <svg> at
// x, y = top-left). CodeG / DiffG are the same drawings as SVG fragments for
// use inside your own <svg>.
import React from 'react';
import {clamp01, ease, FPS, K, lerp, useT} from '../../v3/core';
import {band, corrupt, stepJ} from '../chaos';
import {CODE, MONO_ADV} from '../fonts';
import {blink, Caret, r2, since} from './lib';

export type Lang = 'ts' | 'py' | 'sh' | 'json' | 'txt';
export type TokType = 'kw' | 'str' | 'num' | 'com' | 'id' | 'caps' | 'punc' | 'ws' | 'flag' | 'key' | 'prompt';
export type Tok = {s: string; k: TokType};

// The spec's keyword list plus a few that read naturally in the screenplay.
export const KEYWORDS = new Set([
  'const', 'let', 'if', 'else', 'return', 'while', 'for', 'new', 'throw', 'class', 'function', 'def', 'import', 'from',
  'true', 'false', 'null', 'undefined', 'await', 'async',
  // additions
  'interface', 'type', 'export', 'try', 'catch', 'in', 'of', 'this', 'var', 'elif', 'lambda', 'yield', 'None', 'True', 'False', 'not', 'and', 'or', 'as', 'void',
]);

// Token colours (fill, opacity, weight).
export const TOK_STYLE: Record<TokType, {fill: string; o: number; wt: number}> = {
  kw: {fill: K.orange, o: 1, wt: 400},
  str: {fill: K.cream, o: 1, wt: 400},
  num: {fill: K.cream, o: 0.7, wt: 400},
  com: {fill: K.creamDim, o: 0.45, wt: 400},
  id: {fill: K.cream, o: 1, wt: 400},
  caps: {fill: K.orange, o: 1, wt: 700},
  punc: {fill: K.creamDim, o: 1, wt: 400},
  ws: {fill: K.cream, o: 1, wt: 400},
  flag: {fill: K.creamDim, o: 1, wt: 400},
  key: {fill: K.cream, o: 0.7, wt: 400},
  prompt: {fill: K.creamDim, o: 1, wt: 400},
};

const RX = {
  ws: /\s+/y,
  strD: /"(?:[^"\\]|\\.)*"?/y,
  strS: /'(?:[^'\\]|\\.)*'?/y,
  strB: /`(?:[^`\\]|\\.)*`?/y,
  num: /(?:0x[0-9a-fA-F]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)/y,
  word: /[A-Za-z_$][A-Za-z0-9_$]*/y,
  flag: /--?[A-Za-z][\w-]*/y,
};
const match = (rx: RegExp, s: string, i: number) => {
  rx.lastIndex = i;
  const m = rx.exec(s);
  return m ? m[0] : null;
};
const isCaps = (w: string) => w.length >= 2 && /^[A-Z][A-Z0-9_]*$/.test(w) && /[A-Z]{2}/.test(w);

const tokCache = new Map<string, Tok[]>();
// Tokenize one line.
export const tokenize = (line: string, lang: Lang = 'ts'): Tok[] => {
  const key = lang + '\u0000' + line;
  const hit = tokCache.get(key);
  if (hit) return hit;
  const out: Tok[] = [];
  const push = (s: string, k: TokType) => {
    const last = out[out.length - 1];
    if (last && last.k === k && (k === 'punc' || k === 'ws')) last.s += s;
    else out.push({s, k});
  };
  if (lang === 'txt') {
    out.push({s: line, k: 'id'});
    tokCache.set(key, out);
    return out;
  }
  let i = 0;
  // shell prompt
  if (lang === 'sh') {
    const m = /^(\s*)([$#>]) /.exec(line);
    if (m) {
      if (m[1]) push(m[1], 'ws');
      push(m[2] + ' ', 'prompt');
      i = m[0].length;
    }
  }
  const comment = lang === 'py' || lang === 'sh' ? '#' : '//';
  while (i < line.length) {
    const c = line[i];
    let m: string | null;
    if (line.startsWith(comment, i)) {
      push(line.slice(i), 'com');
      break;
    }
    if ((m = match(RX.ws, line, i))) {
      push(m, 'ws');
      i += m.length;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      m = match(c === '"' ? RX.strD : c === "'" ? RX.strS : RX.strB, line, i)!;
      // JSON keys: a string followed by ':'
      const after = line.slice(i + m.length).trimStart();
      push(m, lang === 'json' && after.startsWith(':') ? 'key' : 'str');
      i += m.length;
      continue;
    }
    if (lang === 'sh' && c === '-' && (m = match(RX.flag, line, i)) && (i === 0 || /\s/.test(line[i - 1]))) {
      push(m, 'flag');
      i += m.length;
      continue;
    }
    if (/[0-9]/.test(c) && (m = match(RX.num, line, i))) {
      push(m, 'num');
      i += m.length;
      continue;
    }
    if ((m = match(RX.word, line, i))) {
      push(m, KEYWORDS.has(m) ? 'kw' : isCaps(m) ? 'caps' : 'id');
      i += m.length;
      continue;
    }
    push(c, 'punc');
    i++;
  }
  if (tokCache.size > 5000) tokCache.clear();
  tokCache.set(key, out);
  return out;
};

// Renders tokens of one line, clipped to the first `n` characters.
export const TokLine: React.FC<{toks: Tok[]; n?: number; size: number; x: number; y: number; t?: number; a?: number; seed?: number; o?: number}> = ({
  toks,
  n = Infinity,
  size,
  x,
  y,
  t = 0,
  a = 0,
  seed = 1,
  o = 1,
}) => {
  let left = n;
  const amt = a > 0.3 ? a * 0.2 * band(a, 0.3, 0.5) : 0;
  const spans: React.ReactNode[] = [];
  toks.forEach((tk, i) => {
    if (left <= 0) return;
    let s = tk.s.slice(0, left);
    left -= s.length;
    if (amt > 0) s = corrupt(s, t, amt, seed * 97 + i);
    const st = TOK_STYLE[tk.k];
    spans.push(
      <tspan key={i} fill={st.fill} fillOpacity={st.o} fontWeight={st.wt}>
        {s}
      </tspan>,
    );
  });
  return (
    <text x={r2(x)} y={r2(y)} fontFamily={CODE} fontSize={size} xmlSpace="preserve" style={{whiteSpace: 'pre'}} opacity={o}>
      {spans}
    </text>
  );
};

// ------------------------------------------------------------------ CodeBlock
export type CodeProps = {
  x: number;
  y: number;
  lines: string[];
  lang?: Lang;
  size?: number; // font px (default 20)
  lineNo?: boolean; // gutter with line numbers (default true)
  first?: number; // first line number (default 1)
  typeOn?: [number, number]; // types every character between t0 and t1
  caret?: boolean; // orange caret while typing, blinking after
  highlight?: (t: number) => number | null; // highlighted row (0-based)
  w?: number; // width of the highlight band (default: longest line)
  lh?: number; // line height (default 1.6 × size)
  a?: number; // anomaly (default 0: code stays clean unless asked)
  seed?: number;
  opacity?: number;
};

export const codeMetrics = (lines: string[], size = 20, lineNo = true, first = 1, lh = size * 1.6) => {
  const cw = size * MONO_ADV;
  const digits = String(first + lines.length - 1).length;
  const gutter = lineNo ? cw * Math.max(2, digits) + cw * 2 : 0;
  const maxLen = lines.reduce((m, l) => Math.max(m, l.length), 0);
  return {cw, gutter, lh, w: gutter + maxLen * cw, h: lines.length * lh};
};

// Characters typed by t across all lines (a newline counts as one char so the
// caret pauses at line ends). Returns per-line counts and the caret position.
export const typed = (lines: string[], t: number, typeOn?: [number, number]) => {
  const total = lines.reduce((m, l) => m + l.length + 1, 0) - 1;
  const n = typeOn ? Math.floor(clamp01((t - typeOn[0]) / Math.max(1e-6, typeOn[1] - typeOn[0])) * total + 1e-6) : total;
  let left = n;
  const per: number[] = [];
  let row = 0, col = 0;
  lines.forEach((l, i) => {
    const k = Math.max(0, Math.min(l.length, left));
    per.push(left >= 0 ? k : -1);
    if (left >= 0) {
      row = i;
      col = k;
    }
    left -= l.length + 1;
  });
  return {per, row, col, done: n >= total, n, total};
};

export const CodeG: React.FC<CodeProps & {t: number}> = ({t, x, y, lines, lang = 'ts', size = 20, lineNo = true, first = 1, typeOn, caret, highlight, w, lh, a = 0, seed = 1, opacity = 1}) => {
  const m = codeMetrics(lines, size, lineNo, first, lh);
  const ty = typed(lines, t, typeOn);
  if (typeOn && t < typeOn[0] && !caret) return null;
  const base = m.lh * 0.5 + size * 0.36; // baseline offset inside a row
  const bandW = w ?? m.w + size;
  let hl: React.ReactNode = null;
  if (highlight) {
    const row = highlight(t);
    const ch = since(highlight, t, 4);
    if (row !== null) {
      const prev = ch.f < 4 && ch.prev !== null ? (ch.prev as number) : row;
      const yy = lerp(prev, row, ease.outCubic(clamp01((ch.f === Infinity ? 4 : ch.f) / 4))) * m.lh;
      const o = ch.f < 4 && ch.prev === null ? clamp01(ch.f / 4) : 1;
      hl = (
        <g opacity={o}>
          <rect x={x - size * 0.4} y={r2(y + yy)} width={r2(bandW)} height={r2(m.lh)} fill={K.line2} fillOpacity={0.35} />
          <rect x={x - size * 0.4} y={r2(y + yy)} width={2} height={r2(m.lh)} fill={K.orange} />
        </g>
      );
    }
  }
  const jx = a > 0.6 ? band(a, 0.6, 0.8) * 6 : 0;
  const typing = !!typeOn && !ty.done && t >= typeOn[0];
  const caretOn = caret && (typing || blink(t)) && (!typeOn || t >= typeOn[0] - 0.3);
  return (
    <g opacity={opacity}>
      {hl}
      {lines.map((l, i) => {
        const n = ty.per[i];
        if (n < 0 || (typeOn && t < typeOn[0])) return null;
        const yy = y + i * m.lh + base;
        const dx = jx ? stepJ(t, seed * 31 + i, jx, 8) : 0;
        return (
          <g key={i}>
            {lineNo && (
              <text x={r2(x + m.gutter - m.cw * 2)} y={r2(yy)} textAnchor="end" fontFamily={CODE} fontSize={size} fill={K.creamDim} fillOpacity={0.45}>
                {first + i}
              </text>
            )}
            <TokLine toks={tokenize(l, lang)} n={n} size={size} x={x + m.gutter + dx} y={yy} t={t} a={a} seed={seed + i} />
          </g>
        );
      })}
      {caretOn && <Caret x={x + m.gutter + ty.col * m.cw + 1} y={y + ty.row * m.lh + base} h={size * 1.15} color={K.orange} />}
    </g>
  );
};

export const CodeBlock: React.FC<CodeProps> = (p) => {
  const {t} = useT();
  const m = codeMetrics(p.lines, p.size, p.lineNo ?? true, p.first, p.lh);
  return (
    <svg width={Math.max(1, m.w)} height={Math.max(1, m.h)} style={{position: 'absolute', left: p.x, top: p.y, overflow: 'visible'}}>
      <CodeG {...p} x={0} y={0} t={t} />
    </svg>
  );
};

// ------------------------------------------------------------------ Diff
export type DiffRow = {sign: '+' | '-' | ' '; text: string};
export type DiffProps = {
  x: number;
  y: number;
  rows: DiffRow[];
  t0: number; // first row appears
  size?: number; // default 20
  dt?: number; // seconds between rows (default 4 frames)
  lang?: Lang; // highlight + and context rows (default: plain)
  lh?: number;
  opacity?: number;
  t1?: number; // optional exit: rows fade + lift over 5 frames from t1
};

export const DiffG: React.FC<DiffProps & {t: number}> = ({t, x, y, rows, t0, size = 20, dt = 4 / FPS, lang, lh = size * 1.6, opacity = 1, t1}) => {
  if (t < t0) return null;
  const cw = size * MONO_ADV;
  const exitP = t1 !== undefined ? clamp01((t - t1) / (5 / FPS)) : 0;
  if (exitP >= 1) return null;
  const base = lh * 0.5 + size * 0.36;
  return (
    <g opacity={opacity * (1 - exitP)} transform={exitP ? `translate(0 ${r2(-14 * exitP)})` : undefined}>
      {rows.map((r, i) => {
        const ti = t0 + i * dt;
        const f = (t - ti) * FPS;
        if (f < 0) return null;
        const appear = ease.outCubic(clamp01(f / 5));
        const n = Math.floor(clamp01(f / 6) * r.text.length);
        const yy = y + i * lh + base;
        const textX = x + cw * 2;
        const strike = r.sign === '-' ? ease.inOutCubic(clamp01((f - 6) / 6)) : 0;
        const toks: Tok[] = lang && r.sign !== '-' ? tokenize(r.text, lang) : [{s: r.text, k: r.sign === '+' ? 'id' : 'punc'}];
        return (
          <g key={i} opacity={appear} transform={`translate(${r2(-8 * (1 - appear))} 0)`}>
            {r.sign !== ' ' && (
              <text x={r2(x)} y={r2(yy)} fontFamily={CODE} fontSize={size} fontWeight={r.sign === '+' ? 700 : 400} fill={r.sign === '+' ? K.orange : K.creamDim}>
                {r.sign === '-' ? '−' : '+'}
              </text>
            )}
            <TokLine toks={toks} n={n} size={size} x={textX} y={yy} o={r.sign === ' ' ? 0.7 : 1} />
            {strike > 0 && (
              <path d={`M ${r2(textX - 2)} ${r2(yy - size * 0.3)} L ${r2(textX - 2 + (r.text.length * cw + 4) * strike)} ${r2(yy - size * 0.3)}`} stroke={K.creamDim} strokeWidth={1.5} />
            )}
          </g>
        );
      })}
    </g>
  );
};

export const Diff: React.FC<DiffProps> = (p) => {
  const {t} = useT();
  return (
    <svg width={1} height={1} style={{position: 'absolute', left: p.x, top: p.y, overflow: 'visible'}}>
      <DiffG {...p} x={0} y={0} t={t} />
    </svg>
  );
};
