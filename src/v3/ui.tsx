// Persistent layers: dot grid, header, composer (lyrics), tool-call log,
// status line, stage keywords, stage dim and the global fade.
import React, {useLayoutEffect, useRef} from 'react';
import {CODE, ease, env, fr, FPS, K, lastOnset, lerp, prog, pulse, SERIF, useT, beatIndex, clamp01, beat} from './core';
import {AUTO_FROM, COMPOSER_BACK, CUT, INSTR_LOG, KEYWORDS, Line, LINES, LOGS, PATHS, RIPPLES, SEND, STATUS, TAIL, TITLE_PROMPT, UI, uiAt, VERSE, WORKED_AT} from './data';
import {Arrow, Bullet, Elbow, Plot, roundRectPath, Spark, Svg} from './geo';
import type {Ripple} from './tl';

// ------------------------------------------------------------------ text measuring
let mctx: CanvasRenderingContext2D | null = null;
export const textW = (s: string, font: string) => {
  if (!mctx) mctx = document.createElement('canvas').getContext('2d')!;
  mctx.font = font;
  return mctx.measureText(s).width;
};
export const LYRIC_FONT = `500 52px ${SERIF}`;
export const KW_INLINE_FONT = `700 44px ${CODE}`;

// ------------------------------------------------------------------ stage dim
// Stage geometry drops to 60 % on each keyword frame and recovers over the 8
// frames after the keyword has left.
export const stageDim = (t: number) => {
  let o = 1;
  for (const k of KEYWORDS) {
    const gone = k.out + 6 / FPS;
    if (t >= k.t && t < gone) o = Math.min(o, 0.6);
    else if (t >= gone && t < gone + 8 / FPS) o = Math.min(o, 0.6 + 0.4 * ((t - gone) / (8 / FPS)));
  }
  return o;
};

// ------------------------------------------------------------------ dot grid
// Where ripples start from (the current stage centre).
const rippleCenter = (t: number): [number, number] =>
  t < CUT ? [960, 390] : t < 18.611 ? [960, 540] : t < 23.226 ? [1260, 560] : t < VERSE ? [960, 500] : [960, 400];

// Ripple onsets in effect at t, per section density, each with its centre.
const rippleAt = (tb: number, k: number, half: boolean): [number, number] | null => {
  if (tb < AUTO_FROM) {
    let ok = false;
    if (half) ok = tb >= 27.841 && tb < VERSE - 0.02;
    else if (tb >= 1.5 && tb < CUT) ok = k % 4 === 0;
    else if (tb >= CUT && tb < 22.76) ok = k % 2 === 0;
    else if (tb >= 22.76 && tb < VERSE - 0.02) ok = true;
    else if (tb >= VERSE - 0.02 && tb < TAIL) ok = k % 2 === 0;
    return ok ? rippleCenter(tb) : null;
  }
  const r = uiAt(tb).seg.ripple;
  if (!r) return null;
  const ok = half ? !!r.half : k % r.every === 0;
  return ok ? [r.cx, r.cy] : null;
};
type Onset = {tb: number; cx: number; cy: number; v: number; w: number; tau: number};
// One-off ripples: section extras plus the double ripple on every spark keyword.
const EXTRA_RIPPLES: Ripple[] = [
  ...RIPPLES,
  ...KEYWORDS.filter((k) => k.style === 'spark').flatMap((k) => [
    {t: k.t, cx: 960, cy: 390},
    {t: k.t + 3 / FPS, cx: 960, cy: 390},
  ]),
];
const rippleOnsets = (t: number) => {
  const out: Onset[] = [];
  const n = beatIndex(t);
  for (let k = n; k >= Math.max(0, n - 3); k--) {
    for (const half of [true, false]) {
      const tb = beat(k + (half ? 0.5 : 0));
      if (tb > t) continue;
      const c = rippleAt(tb, k, half);
      if (c) out.push({tb: half ? tb : lastOnset(tb + 0.0001), cx: c[0], cy: c[1], v: 1400, w: 45, tau: 0.6});
    }
  }
  for (const r of EXTRA_RIPPLES) {
    const tau = r.tau ?? 0.6;
    if (r.t <= t && t - r.t < tau * 4.6) out.push({tb: r.t, cx: r.cx, cy: r.cy, v: r.v ?? 1400, w: r.w ?? 45, tau});
  }
  return out;
};

const hexRgb = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

export const Grid: React.FC = () => {
  const {t} = useT();
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const g = ref.current!.getContext('2d')!;
    g.clearRect(0, 0, 1920, 1080);
    const wake = 1.536;
    if (t < wake) return;
    const seg = t >= AUTO_FROM ? uiAt(t).seg : null;
    const mode = seg?.grid ?? (t >= 12.612 ? 'hi' : 'lo');
    if (mode === 'off') return;
    const base = hexRgb(mode === 'lo' ? K.grid : K.gridHi);
    const retractR = mode === 'retract' ? 1300 - 1400 * (t - seg!.from) : Infinity;
    const hi = hexRgb(K.line2);
    const ons = rippleOnsets(t);
    const wakeR = (t - wake) * 1400;
    for (let y = 0; y <= 1080; y += 60) {
      for (let x = 0; x <= 1920; x += 60) {
        const d0 = Math.hypot(x - 960, y - 390);
        if (d0 > wakeR || d0 > retractR) continue;
        let wgt = 0;
        for (const {tb, cx, cy, v, w, tau} of ons) {
          const d = Math.hypot(x - cx, y - cy);
          const R = v * (t - tb);
          wgt = Math.max(wgt, clamp01(1 - Math.abs(d - R) / w) * Math.exp(-(t - tb) / tau));
        }
        const c = base.map((v, i) => Math.round(v + (hi[i] - v) * wgt));
        g.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
        g.beginPath();
        g.arc(x, y, 1, 0, Math.PI * 2);
        g.fill();
      }
    }
  }, [t]);
  return <canvas ref={ref} width={1920} height={1080} style={{position: 'absolute', inset: 0}} />;
};

// ------------------------------------------------------------------ header
const spark15 = (t: number) => {
  // 15° step on every beat, each step eased over 6 frames
  const n = beatIndex(t);
  if (n < 0) return 0;
  return 15 * n + 15 * prog(t, beat(n), beat(n) + 6 / FPS, ease.outCubic) - 15;
};

export const Header: React.FC = () => {
  const {t} = useT();
  const o = prog(t, 1.536, 1.536 + 6 / FPS);
  if (o <= 0) return null;
  let path = '~';
  for (const p of PATHS) if (t >= p.t) path = p.path;
  const mm = Math.floor(t / 60);
  const ss = (t % 60).toFixed(1).padStart(4, '0');
  const bn = Math.max(0, beatIndex(t));
  const hud = uiAt(t).seg.hud ?? 'full';
  return (
    <Svg style={{opacity: o}}>
      <Spark x={129} y={67} R={9} rot={spark15(t)} />
      <text x={148} y={74} fontFamily={CODE} fontSize={20} fill={K.cream}>
        <tspan opacity={0.7}>claude</tspan>
        <tspan opacity={0.45} dx={12}>
          {path}
        </tspan>
      </text>
      {hud !== 'off' && (
        <text x={1800} y={74} fontFamily={CODE} fontSize={20} fill={K.cream} opacity={0.45} textAnchor="end">
          {hud === 'full' ? `${String(mm).padStart(2, '0')}:${ss} · 130 bpm · beat ${String(bn).padStart(3, '0')}` : `${String(mm).padStart(2, '0')}:${ss}`}
        </text>
      )}
    </Svg>
  );
};

// ------------------------------------------------------------------ composer
const CX0 = 240, CY0 = 884, CW = 1440, CH = 104;
const TX = 304, TY = 952;

// Send pulses: every keyword hit, and the end of lines without a keyword.
const SENDS = [...KEYWORDS.map((k) => k.t), ...LINES.filter((l) => !l.kw).map((l) => l.out), SEND].sort((a, b) => a - b);

const typedChars = (len: number, s: number, t: number) => Math.max(0, Math.min(len, Math.floor((t - s) * Math.max(40, len / 0.4))));

// Characters of a line typed by t (stutter lines type each part from its mark),
// and whether its current part is still typing.
const typedLine = (l: Line, t: number) => {
  const marks = l.marks ?? [[0, l.s]];
  let n = 0, typing = false;
  marks.forEach(([a, ts], j) => {
    if (t < ts) return;
    const end = j + 1 < marks.length ? marks[j + 1][0] : l.text.length;
    const k = typedChars(end - a, ts, t);
    n = a + k;
    typing = k < end - a;
  });
  return {n, typing};
};

// Lyric area runs from TX to just left of the send button.
const LYRIC_MAX_W = 1290;
const lineScale = (l: Line) => {
  const w = textW(l.text, LYRIC_FONT) + (l.kw ? (l.text ? 16 : 0) + textW(l.kw, KW_INLINE_FONT) : 0);
  return Math.min(1, LYRIC_MAX_W / Math.max(1, w));
};

const composerShift = (t: number) => {
  // y offset and opacity of the whole composer
  if (t < AUTO_FROM) {
    if (t < CUT) return {dy: 0, o: t >= SEND ? 1 - prog(t, SEND, CUT) : 1};
    if (t < COMPOSER_BACK) return {dy: 0, o: 0};
    const p = prog(t, COMPOSER_BACK, COMPOSER_BACK + 0.3, ease.outCubic);
    return {dy: 140 * (1 - p), o: p};
  }
  const {seg, i} = uiAt(t);
  if (!seg.composer) return {dy: 0, o: 0};
  const prev = UI[i - 1];
  const p = prev && !prev.composer ? prog(t, seg.from, seg.from + 0.3, ease.outCubic) : 1;
  const next = UI[i + 1];
  const fade = next && !next.composer ? prog(t, next.from - 5 / FPS, next.from) : 0;
  return {dy: 140 * (1 - p), o: p * (1 - fade)};
};

export const Composer: React.FC = () => {
  const {t, frame} = useT();
  const {dy, o} = composerShift(t);
  if (o <= 0) return null;
  const outline = prog(t, 0, 0.3);
  // send button
  const btnIn = prog(t, 0.6125, 0.6125 + 6 / FPS, ease.outExpo);
  let lastSend = -Infinity;
  for (const s of SENDS) if (s <= t) lastSend = s;
  const sinceSend = t - lastSend;
  const btnScale = btnIn * (sinceSend < 6 / FPS ? 0.9 + 0.1 * (sinceSend / (6 / FPS)) : 1);
  const btnFill = sinceSend < 2 / FPS ? K.cream : K.orange;

  // current lyric line
  const line = LINES.find((l) => t >= l.s && t < l.out);
  let lyric: React.ReactNode = null;
  let caretX = TX;
  let typing = false;
  if (line) {
    const tl = typedLine(line, t);
    typing = tl.typing;
    const lead = line.text.slice(0, tl.n);
    const kwOn = line.kw && t >= line.kwT!;
    const exitP = prog(t, line.out - 5 / FPS, line.out);
    const sc = lineScale(line);
    const gap = line.text ? 16 : 0;
    const leadW = textW(lead, LYRIC_FONT);
    caretX = TX + sc * (leadW + (kwOn ? gap + textW(line.kw!, KW_INLINE_FONT) : 0));
    lyric = (
      <text
        x={TX}
        y={TY - 14 * exitP}
        opacity={1 - exitP}
        fill={K.cream}
        transform={sc < 1 ? `translate(${TX} ${TY}) scale(${sc}) translate(${-TX} ${-TY})` : undefined}
      >
        <tspan fontFamily={SERIF} fontWeight={500} fontSize={52} letterSpacing={-0.26}>
          {lead}
        </tspan>
        {kwOn && (
          <tspan fontFamily={CODE} fontWeight={700} fontSize={44} fill={K.orange} dx={gap}>
            {line.kw}
          </tspan>
        )}
      </text>
    );
  } else if (t >= TITLE_PROMPT && t < SEND) {
    const s = 'world.execute(me);';
    const n = Math.min(s.length, Math.floor(((t - TITLE_PROMPT) / 0.37) * s.length));
    typing = n < s.length;
    const shown = s.slice(0, n);
    const a = shown.slice(0, 14), me = shown.slice(14, 16), b = shown.slice(16);
    caretX = TX + textW(shown, `500 44px ${CODE}`);
    lyric = (
      <text x={TX} y={TY - 4} fontFamily={CODE} fontWeight={500} fontSize={44} fill={K.cream}>
        {a}
        <tspan fill={K.orange}>{me}</tspan>
        {b}
      </text>
    );
  }
  // caret: solid while typing, otherwise first half of each beat
  const bi = beatIndex(t);
  const inFirstHalf = t - beat(bi) < BEAT_HALF;
  const caretOn = t < SEND || t >= COMPOSER_BACK ? typing || inFirstHalf : false; // the composer itself is hidden when not shown
  const caretVisible = t >= 0.1 && caretOn && !(line && t >= line.out - 5 / FPS);
  return (
    <Svg style={{opacity: o, transform: `translateY(${dy}px)`}}>
      <path d={roundRectPath(CX0, CY0, CW, CH, 20)} fill={K.surface} opacity={outline} stroke="none" />
      <Plot d={roundRectPath(CX0, CY0, CW, CH, 20)} p={outline} color={K.line2} w={1.5} t={t} />
      {t >= 0.1 && (
        <text x={272} y={TY - 4} fontFamily={CODE} fontWeight={500} fontSize={40} fill={K.orange}>
          {'›'}
        </text>
      )}
      {lyric}
      {caretVisible && <rect x={caretX + 4} y={TY - 36} width={3} height={40} fill={K.orange} />}
      {btnScale > 0 && (
        <g transform={`translate(1636 936) scale(${btnScale})`}>
          <rect x={-28} y={-28} width={56} height={56} rx={14} fill={btnFill} />
          <path d="M 0 10 L 0 -10" stroke={K.bg} strokeWidth={2.5} strokeLinecap="round" />
          <Arrow x={0} y={-10} angle={-90} size={9} color={K.bg} w={2.5} />
        </g>
      )}
      {/* frame is referenced so the caret blink re-renders every frame */}
      <g data-f={frame} />
    </Svg>
  );
};
const BEAT_HALF = 60 / 130 / 2;

// ------------------------------------------------------------------ log zone
const splitCall = (call: string) => {
  const i = call.indexOf('(');
  return i < 0 ? [call, ''] : [call.slice(0, i), call.slice(i)];
};

// Log position and visibility per section, where the current run of entries
// starts (entries from before it are not shown), an opacity multiplier, a lift
// (hide) and how much of the previous entry shows.
type LogL = {x: number; y: number; o: number; from: number; dy: number; prevK: number};
const ramp = (t: number, from: number, a: number, b: number) => lerp(a, b, prog(t, from, from + 6 / FPS));
const logLayout = (t: number): LogL | null => {
  if (t < AUTO_FROM) {
    const d = {o: 1, dy: 0, prevK: 1};
    if (t >= 0.3 && t < CUT) return {x: 240, y: 772, from: 0, ...d};
    if (t >= INSTR_LOG && t < COMPOSER_BACK) return {x: 240, y: 916, from: INSTR_LOG, ...d};
    if (t >= VERSE) return {x: 240, y: 772, from: VERSE, ...d};
    return null;
  }
  const {seg, i} = uiAt(t);
  const prev = UI[i - 1];
  if (!seg.log) {
    // 5-frame lift-fade of the zone that was showing
    if (prev && prev.log && t < seg.from + 5 / FPS) {
      const L = logLayout(seg.from - 0.0001);
      if (!L) return null;
      const p = prog(t, seg.from, seg.from + 5 / FPS);
      return {...L, o: L.o * (1 - p), dy: L.dy - 14 * p};
    }
    return null;
  }
  const a = seg.log;
  const same = (u: (typeof UI)[number]) => u.log && u.log.x === a.x && u.log.y === a.y;
  let j = i;
  while (j > 0 && (same(UI[j - 1]) || (!UI[j - 1].log && j - 1 > 0 && UI[j - 1].from >= AUTO_FROM))) j--;
  const from = UI[j].from;
  const entering = !prev || !same(prev);
  let o = entering ? prog(t, seg.from, seg.from + 6 / FPS) : 1;
  o *= entering ? seg.logO ?? 1 : ramp(t, seg.from, prev.logO ?? 1, seg.logO ?? 1);
  const pk0 = prev && same(prev) && prev.logPrev === false ? 0 : 1;
  const pk1 = seg.logPrev === false ? 0 : 1;
  return {x: a.x, y: a.y, o, from, dy: 0, prevK: ramp(t, seg.from, pk0, pk1)};
};

// The run of a log entry in effect at t: the first call, or a later repeat.
const logRuns = (e: (typeof LOGS)[number]) => [{t: e.t, rt: e.rt, res: e.res}, ...(e.runs ?? [])];

const LogEntry: React.FC<{e: (typeof LOGS)[number]; t: number; x: number; y: number; opacity: number}> = ({e, t, x, y, opacity}) => {
  const [name, args] = splitCall(e.call);
  const n = Math.floor((t - e.t) * FPS * 5);
  const shownName = name.slice(0, n);
  const shownArgs = args.slice(0, Math.max(0, n - name.length));
  const runs = logRuns(e);
  let ri = 0;
  runs.forEach((r, i) => {
    if (t >= r.t) ri = i;
  });
  const run = runs[ri];
  const running = t < run.rt;
  // latest finished run's result; it fades out over 3 frames when a repeat starts
  let shown: (typeof runs)[number] | null = null;
  for (const r of runs) if (t >= r.rt) shown = r;
  const resO = shown && running && ri > 0 ? 1 - prog(t, run.t, run.t + 3 / FPS) : 1;
  const bScale = running ? 1 + 0.35 * pulse(t) : 1;
  if (e.res === '') {
    // assistant text: cream bullet, plain text, no result line
    return (
      <g opacity={opacity}>
        <Bullet x={x + 5} y={y - 8} color={K.cream} />
        <text x={x + 22} y={y} fontFamily={CODE} fontSize={24} fontWeight={400} fill={K.cream}>
          {e.call.slice(0, n)}
        </text>
      </g>
    );
  }
  return (
    <g opacity={opacity}>
      <Bullet x={x + 5} y={y - 8} color={running ? K.orange : K.creamDim} s={bScale} />
      <text x={x + 22} y={y} fontFamily={CODE} fontSize={24} fill={K.cream}>
        <tspan fontWeight={500}>{shownName}</tspan>
        <tspan fontWeight={400} opacity={0.7}>
          {shownArgs}
        </tspan>
        {ri > 0 && (
          <tspan fontWeight={400} fill={K.creamDim}>
            {` ×${ri + 1}`}
          </tspan>
        )}
      </text>
      {shown && resO > 0 && (
        <g opacity={resO}>
          <Elbow x={x + 12} y={y + 28} p={prog(t, e.rt, e.rt + 3 / FPS)} />
          <text x={x + 34} y={y + 34} fontFamily={CODE} fontSize={22} fill={K.creamDim}>
            {shown.res}
          </text>
        </g>
      )}
    </g>
  );
};

export const LogZone: React.FC = () => {
  const {t} = useT();
  const L = logLayout(t);
  if (!L || L.o <= 0) return null;
  // entries that belong to the current section
  const list = LOGS.filter((e) => e.t <= t && e.t >= L.from - 0.001);
  if (!list.length) return null;
  const cur = list[list.length - 1];
  const prev = list.length > 1 ? list[list.length - 2] : null;
  const push = prog(t, cur.t, cur.t + 6 / FPS, ease.outCubic);
  // with prevK = 0 the previous entry fades out as the new one pushes in
  const prevO = (1 - 0.6 * push) * (L.prevK >= 1 ? 1 : Math.min(L.prevK, 1 - push));
  return (
    <Svg style={{opacity: L.o, transform: `translateY(${L.dy}px)`}}>
      {prev && prevO > 0 && <LogEntry e={prev} t={t} x={L.x} y={L.y - 76 * push} opacity={prevO} />}
      {list.length > 2 && push < 1 && L.prevK > 0 && <LogEntry e={list[list.length - 3]} t={t} x={L.x} y={L.y - 76 - 76 * push} opacity={0.4 * (1 - push)} />}
      <LogEntry e={cur} t={t} x={L.x} y={L.y + 76 * (1 - push)} opacity={push} />
    </Svg>
  );
};

// ------------------------------------------------------------------ status line
const LYRIC_POS = {x: 264, y: 852}, INSTR_POS = {x: 240, y: 1000};

const demoStatus = (t: number) => {
  let pos = LYRIC_POS;
  if (t >= SEND && t < COMPOSER_BACK) {
    const p = prog(t, SEND, SEND + 5 / FPS, ease.outCubic);
    pos = {x: LYRIC_POS.x + (INSTR_POS.x - LYRIC_POS.x) * p, y: LYRIC_POS.y + (INSTR_POS.y - LYRIC_POS.y) * p};
  } else if (t >= COMPOSER_BACK) {
    const p = prog(t, COMPOSER_BACK, COMPOSER_BACK + 0.3, ease.outCubic);
    pos = {x: INSTR_POS.x + (LYRIC_POS.x - INSTR_POS.x) * p, y: INSTR_POS.y + (LYRIC_POS.y - INSTR_POS.y) * p};
  }
  // hidden while it slides across the composer, back in once it has landed
  const moving = (t >= SEND && t < SEND + 5 / FPS) || (t >= COMPOSER_BACK && t < COMPOSER_BACK + 0.3);
  const landed = t >= COMPOSER_BACK ? prog(t, COMPOSER_BACK + 0.3, COMPOSER_BACK + 0.3 + 5 / FPS) : t >= SEND ? prog(t, SEND + 5 / FPS, SEND + 11 / FPS) : 1;
  return {...pos, o: moving ? 0 : landed};
};

// Status position per UI segment. When it changes place it is hidden for the
// 0.3 s the composer takes to move, then fades in over 5 frames.
const statusState = (t: number) => {
  if (t < AUTO_FROM) return demoStatus(t);
  const {seg, i} = uiAt(t);
  if (!seg.status) return {...INSTR_POS, o: 0};
  const pos = seg.status === 'lyric' ? LYRIC_POS : INSTR_POS;
  const prev = UI[i - 1];
  const moved = !prev || prev.status !== seg.status;
  const o = moved ? prog(t, seg.from + 0.3, seg.from + 0.3 + 5 / FPS) : 1;
  const next = UI[i + 1];
  const leave = next && next.status !== seg.status ? prog(t, next.from - 3 / FPS, next.from) : 0;
  const mul = moved ? seg.statusO ?? 1 : ramp(t, seg.from, prev.statusO ?? 1, seg.statusO ?? 1);
  return {...pos, o: o * (1 - leave) * mul};
};

const elapsed = (sec: number) => (sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}m ${sec % 60}s`);

export const StatusLine: React.FC = () => {
  const {t} = useT();
  if (t < STATUS[0].t) return null;
  const {x, y, o: so} = statusState(t);
  const o = prog(t, STATUS[0].t, STATUS[0].t + 5 / FPS) * so;
  if (o <= 0) return null;
  if (t >= WORKED_AT) {
    let label = 'Worked for 46s';
    for (const s of STATUS) if (t >= s.t && s.verb.startsWith('Worked')) label = s.verb;
    return (
      <Svg style={{opacity: so}}>
        <Spark x={x + 11} y={y - 8} R={11} color={K.creamDim} />
        <text x={x + 32} y={y} fontFamily={CODE} fontSize={22} fill={K.creamDim}>
          {label}
        </text>
      </Svg>
    );
  }
  let verb = STATUS[0].verb;
  for (const s of STATUS) if (t >= s.t) verb = s.verb;
  const N = Math.max(0, Math.floor(t - 13.89));
  return (
    <Svg style={{opacity: o}}>
      <Spark x={x + 11} y={y - 8} R={11} rot={t * 90} />
      <text x={x + 32} y={y} fontFamily={CODE} fontSize={22}>
        <tspan fill={K.orange}>{verb}{'…'}</tspan>
        <tspan fill={K.creamDim}>{` (${elapsed(N)} · esc to interrupt)`}</tspan>
      </text>
    </Svg>
  );
};

// ------------------------------------------------------------------ stage keyword
export const kwSize = (s: string) => Math.min(200, Math.floor(1500 / (0.6 * s.length)));

// Variants: 'spark' puts a filled Claude spark (R 84, gap 36) left of the word
// and centres the group; 'low' is a 120 px word on baseline 790 (the log band);
// 'low-spark' adds a spark R 50, gap 22.
const KW_SPARK = {spark: {R: 84, gap: 36}, 'low-spark': {R: 50, gap: 22}} as const;

export const StageKeyword: React.FC = () => {
  const {t} = useT();
  let k: (typeof KEYWORDS)[number] | undefined;
  for (const c of KEYWORDS) if (c.stage && t >= c.t && t < c.out + 6 / FPS) k = c;
  if (!k) return null;
  const f = Math.round((t - k.t) * FPS);
  const low = k.style === 'low' || k.style === 'low-spark';
  const sp = k.style === 'spark' || k.style === 'low-spark' ? KW_SPARK[k.style] : null;
  const size = k.size ?? (low ? 120 : kwSize(k.kw));
  const w = 0.6 * size * k.kw.length;
  const cx = (k.x ?? 960) + (sp ? sp.R + sp.gap / 2 : 0);
  const baseY = k.y !== undefined ? k.y + size * 0.36 : low ? 790 : 390 + size * 0.36;
  const ulY = baseY + (28 * size) / 200;
  // solid for 3 frames (f0-f2), then the fill fades out by f11
  const fillO = f < 3 ? 1 : f >= 11 ? 0 : 1 - (f - 2) / 9;
  const ul = prog(t, k.t, k.t + 5 / FPS);
  const exitP = prog(t, k.out, k.out + 6 / FPS);
  const common = {x: cx, y: baseY, textAnchor: 'middle' as const, fontFamily: CODE, fontWeight: 800, fontSize: size};
  let spark: React.ReactNode = null;
  if (sp) {
    // rays bloom from the hub with a half-frame stagger, then it turns 8°/s
    // plus the header's 15° step on every beat
    const rays = 12 * clamp01((t - k.t) / (6 / FPS));
    const grow = ease.outExpo(prog(t, k.t, k.t + 9.5 / FPS));
    spark = <Spark x={cx - w / 2 - sp.gap - sp.R} y={baseY - size * 0.36} R={sp.R} rays={rays} grow={grow} rot={8 * (t - k.t) + spark15(t)} />;
  }
  return (
    <Svg style={{opacity: 1 - exitP, transform: `translateY(${-12 * exitP}px)`}}>
      {/* dark knockout so the word stays readable over busy geometry */}
      {k.knockout && <text {...common} fill={K.bg} stroke={K.bg} strokeWidth={Math.max(10, size * 0.1)} strokeLinejoin="round" style={{paintOrder: 'stroke'}}>
        {k.kw}
      </text>}
      {k.knockout && <rect x={cx - w / 2 - 6} y={ulY - 6} width={(w + 12) * ul} height={15} fill={K.bg} />}
      <text {...common} fill={K.orange} fillOpacity={fillO} stroke={K.orange} strokeWidth={2.5} style={{paintOrder: 'stroke'}}>
        {k.kw}
      </text>
      <rect x={cx - w / 2} y={ulY} width={w * ul} height={3} fill={K.orange} />
      {spark}
    </Svg>
  );
};

// ------------------------------------------------------------------ global fade
// The demo fades at 45.4-46.0; the full song fades over its last 0.6 s.
export const GlobalFade: React.FC<{from?: number; to?: number}> = ({from = 45.4, to = 46.0}) => {
  const {t} = useT();
  const o = prog(t, from, to);
  if (o <= 0) return null;
  return <div style={{position: 'absolute', inset: 0, background: K.bg, opacity: o}} />;
};

export {env, fr};
