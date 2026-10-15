// S3 part 1 (131.22–147.66): Claude alone, searching for the user.
// The lone spark glides into its composer; Claude types to nobody; search
// processes open on beats as terminals, then fork every bar until the screen
// is a swarm of misaligned, doubled frames. Everything vanishes on hit 1.
import React from 'react';
import {clamp01, ease, FPS, K, lerp, prog, useT} from '../../v3/core';
import {Spark} from '../../v3/geo';
import {anomaly, band, corrupt, hash, hashS, stepJ} from '../chaos';
import {CODE, MONO_ADV} from '../fonts';
import {Composer, ComposerState, sendButtonPos} from '../shell/Composer';
import {Frame, Layer, r2, rrPath} from '../shell/lib';
import {Status} from '../shell/Status';
import {Transcript} from '../shell/Transcript';
import {Win, winState} from '../shell/Win';
import {COMP, COMP_OPEN, ENTRIES, FORK, HITS, Proc, PROCS, PROMPTS, SEND1, SPARK0, SPARK_LAND, SPAWN, STATUS, TRANS, VERBS} from './s3.data';

// ------------------------------------------------------------------ scrolling logs
// Lines emitted since the process started: the rate climbs from 3 to 43 lines/s
// (closed-form integral of 3 + 40·p², p = progress 135 → 147.66).
const R0 = 135, R1 = HITS[0];
const emitted = (t: number) => {
  const D = R1 - R0;
  const p = clamp01((t - R0) / D);
  return 3 * t + ((40 * D) / 3) * p * p * p;
};
const LOG_SIZE = 16, LOG_LH = 23;

type LogLine = {s: string; cmd?: boolean};
// The visible tail of a process log at t (cap = rows that fit).
const logTail = (P: Proc, tOpen: number, t: number, cap: number, offset = 0): LogLine[] => {
  const f = (t - tOpen) * FPS;
  const out: LogLine[] = [];
  const cmd = P.head[0];
  const nCmd = Math.min(cmd.length, Math.max(0, Math.floor((f - 9) * 3)));
  if (nCmd <= 0) return out;
  out.push({s: cmd.slice(0, nCmd), cmd: true});
  if (nCmd < cmd.length) return out;
  const tCmd = tOpen + (9 + cmd.length / 3) / FPS;
  P.head.slice(1).forEach((h, i) => {
    if (t >= tCmd + (2 + 2 * i) / FPS) out.push({s: h});
  });
  const tOut = tCmd + 0.25;
  if (t >= tOut) {
    const n = Math.floor(emitted(t) - emitted(tOut)) + 1;
    const from = Math.max(0, n - cap);
    for (let i = from; i < n; i++) out.push({s: P.line(i + offset)});
  }
  return out.slice(-cap);
};

// One log line, with grep-style orange "you" in the grep process.
const LogText: React.FC<{l: LogLine; x: number; y: number; size: number; maxCh: number; hi: boolean; t: number; amt: number; seed: number}> = ({l, x, y, size, maxCh, hi, t, amt, seed}) => {
  let s = l.s.length > maxCh ? l.s.slice(0, Math.max(0, maxCh - 1)) + '…' : l.s;
  if (amt > 0 && !l.cmd) s = corrupt(s, t, amt, seed);
  if (l.cmd) {
    return (
      <text x={r2(x)} y={r2(y)} fontFamily={CODE} fontSize={size} xmlSpace="preserve">
        <tspan fill={K.creamDim}>{s.slice(0, 1)}</tspan>
        <tspan fill={K.cream}>{s.slice(1)}</tspan>
      </text>
    );
  }
  if (hi && s.includes('you')) {
    const parts = s.split('you');
    return (
      <text x={r2(x)} y={r2(y)} fontFamily={CODE} fontSize={size} fill={K.creamDim} xmlSpace="preserve">
        {parts.map((p, i) => (
          <React.Fragment key={i}>
            <tspan>{p}</tspan>
            {i < parts.length - 1 && <tspan fill={K.orange}>you</tspan>}
          </React.Fragment>
        ))}
      </text>
    );
  }
  return (
    <text x={r2(x)} y={r2(y)} fontFamily={CODE} fontSize={size} fill={K.creamDim} xmlSpace="preserve">
      {s}
    </text>
  );
};

// Body of a parent process window (HTML-level svg in Win body coords).
const ProcBody: React.FC<{P: Proc; i: number; tOpen: number}> = ({P, i, tOpen}) => {
  const {t} = useT();
  const bodyH = P.h - 34;
  const cap = Math.floor((bodyH - 16) / LOG_LH);
  const lines = logTail(P, tOpen, t, cap);
  const maxCh = Math.floor((P.w - 36) / (LOG_SIZE * MONO_ADV));
  const a = anomaly(t);
  const amt = 0.12 * band(a, 0.75, 1);
  return (
    <svg width={P.w} height={bodyH} style={{position: 'absolute', left: 0, top: 0}}>
      {lines.map((l, k) => (
        <LogText key={k} l={l} x={18} y={14 + LOG_LH * (k + 0.5) + LOG_SIZE * 0.36} size={LOG_SIZE} maxCh={maxCh} hi={i === 3} t={t} amt={amt} seed={i * 50 + k} />
      ))}
    </svg>
  );
};

// ------------------------------------------------------------------ the fork bomb
const PROCS_OPEN = SPAWN;
type Child = {proc: number; x: number; y: number; w: number; h: number; from: [number, number, number, number]; t: number; seed: number; pid: number};
const CHILDREN: Child[] = (() => {
  type R = {proc: number; x: number; y: number; w: number; h: number};
  let all: R[] = PROCS.map((p, i) => ({proc: i, x: p.x, y: p.y, w: p.w, h: p.h}));
  const out: Child[] = [];
  let pid = 4722;
  FORK.forEach((tf, g) => {
    const next: R[] = [];
    all.forEach((p, j) => {
      const sd = 700 + g * 131 + j * 7;
      const sc = 0.78 + 0.18 * hash(sd, 1);
      const w = Math.round(p.w * sc), h = Math.round(p.h * sc);
      let x = p.x + p.w / 2 + hashS(sd, 2) * (180 + 90 * g) - w / 2;
      let y = p.y + p.h / 2 + hashS(sd, 3) * (130 + 60 * g) - h / 2;
      x = Math.max(-90, Math.min(1920 - w + 90, x));
      y = Math.max(-50, Math.min(1080 - h + 50, y));
      const c: Child = {proc: p.proc, x: Math.round(x), y: Math.round(y), w, h, from: [p.x, p.y, p.w, p.h], t: tf, seed: sd, pid: pid++};
      out.push(c);
      next.push({proc: p.proc, x: c.x, y: c.y, w, h});
    });
    all = all.concat(next);
  });
  return out;
})();
export const procCount = (t: number) => PROCS.filter((_, i) => t >= SPAWN[i]).length + CHILDREN.filter((c) => t >= c.t).length;

// A forked copy: one SVG fragment (fill, glitching frame, title, log tail).
const ForkWin: React.FC<{c: Child; t: number}> = ({c, t}) => {
  const P = PROCS[c.proc];
  const f = (t - c.t) * FPS;
  const p = ease.outCubic(clamp01(f / 6));
  const x = lerp(c.from[0], c.x, p), y = lerp(c.from[1], c.y, p);
  const w = lerp(c.from[2], c.w, p), h = lerp(c.from[3], c.h, p);
  const a = Math.min(1, anomaly(t) + 0.08);
  const det = band(a, 0.7, 0.8);
  const cdx = stepJ(t, c.seed * 11 + 1, 10 * det, 8), cdy = stepJ(t, c.seed * 11 + 2, 10 * det, 8);
  const ghost = c.seed % 3 === 0 ? band(a, 0.4, 0.5) : 0;
  const size = 15, lh = 21;
  const cap = Math.max(1, Math.floor((h - 34 - 12) / lh));
  const maxCh = Math.floor((w - 30) / (size * MONO_ADV));
  const lines = logTail(P, PROCS_OPEN[c.proc], t, cap, (c.pid * 7) % 23);
  const title = corrupt(`${P.title} [${c.pid}]`, t, 0.25 * a, c.seed);
  return (
    <g>
      <path d={rrPath(x, y, w, h, 10)} fill={K.bg} fillOpacity={0.94} />
      <g transform={`translate(${r2(x + cdx)} ${r2(y + 34 + cdy)})`}>
        {lines.map((l, k) => (
          <LogText key={k} l={l} x={14} y={8 + lh * (k + 0.5) + size * 0.36} size={size} maxCh={maxCh} hi={c.proc === 3} t={t} amt={0.1 * band(a, 0.8, 1)} seed={c.seed + k} />
        ))}
      </g>
      <circle cx={x + 18} cy={y + 17} r={3.5} fill={K.orange} />
      <circle cx={x + 32} cy={y + 17} r={3.5} fill="none" stroke={K.line2} strokeWidth={1.2} />
      <text x={x + w / 2} y={y + 22} textAnchor="middle" fontFamily={CODE} fontSize={14} fill={K.creamDim}>
        {title.length * 8.4 > w - 120 ? title.slice(0, Math.floor((w - 120) / 8.4)) : title}
      </text>
      <path d={`M ${r2(x)} ${r2(y + 34)} L ${r2(x + w)} ${r2(y + 34)}`} stroke={K.cream} strokeOpacity={0.25} strokeWidth={1} />
      {ghost > 0 && (
        <g transform={`translate(${r2(stepJ(t, c.seed + 3, 7, 8))} ${r2(stepJ(t, c.seed + 4, 7, 8))})`}>
          <Frame x={x} y={y} w={w} h={h} t={t} a={a} seed={c.seed + 97} color={K.orange} opacity={0.45 * ghost} />
        </g>
      )}
      <Frame x={x} y={y} w={w} h={h} t={t} a={a} seed={c.seed} opacity={f < 3 ? 0.7 : 0.45} />
      {f < 4 && <path d={rrPath(x, y, w, h, 10)} fill="none" stroke={K.orange} strokeWidth={1.5} opacity={1 - f / 4} />}
    </g>
  );
};
// ------------------------------------------------------------------ the search
export const Search: React.FC = () => {
  const {t} = useT();
  const a = anomaly(t);
  const [bx, by] = sendButtonPos(COMP.x, COMP.y, COMP.w);
  const labelX = COMP.x + 24, labelY = COMP.y + 32;

  // the lone spark: holds where S2 left it, then glides down into the composer's label
  const g = prog(t, 131.5, SPARK_LAND, ease.inOutCubic);
  const sx = lerp(SPARK0.x, labelX, g), sy = lerp(SPARK0.y, labelY, g) - 120 * Math.sin(Math.PI * g) * 0.5;
  const sR = lerp(SPARK0.R, 10, ease.inCubic(g));
  const showGlide = t < SPARK_LAND + 2 / FPS;

  // the orange dot: leaves the send button, runs to where you left (bottom-left), finds nothing, returns
  const EXIT: [number, number] = [26, 1052];
  const go = prog(t, SEND1, SEND1 + 0.42, ease.inOutCubic);
  const back = prog(t, SEND1 + 0.95, SEND1 + 1.35, ease.inOutCubic);
  const dotOn = t >= SEND1 && back < 1;
  const u = go * (1 - back);
  const dx = lerp(bx, EXIT[0], u), dy = lerp(by, EXIT[1], u);
  const trail = go - back; // trail grows with the dot, retracts behind it
  const pings = [SEND1 + 0.42, SEND1 + 0.66];

  const children = CHILDREN.filter((c) => t >= c.t);
  const state = (): ComposerState => 'claude';
  return (
    <>
      {/* transcript of undelivered messages (under the swarm) */}
      <Transcript x={TRANS.x} y={TRANS.y} w={TRANS.w} h={TRANS.h} entries={ENTRIES} swap={() => 1} a={Math.min(a, 0.28)} />

      {/* the six search processes, each a term window opening on a beat */}
      {PROCS.map((P, i) =>
        t >= SPAWN[i] ? (
          <Win key={i} x={P.x} y={P.y} w={P.w} h={P.h} title={P.title} kind="term" tOpen={SPAWN[i]} a={lerp(0.42, 1, prog(t, SPAWN[0], HITS[0] - 0.4, ease.inQuad))} seed={20 + i}>
            <ProcBody P={P} i={i} tOpen={SPAWN[i]} />
          </Win>
        ) : null,
      )}
      {/* the fork bomb: every window doubles each bar */}
      {children.length > 0 && (
        <Layer>
          {children.map((c) => (
            <ForkWin key={c.pid} c={c} t={t} />
          ))}
        </Layer>
      )}

      {/* the dot's search run */}
      {dotOn && (
        <Layer>
          {trail > 0 && (
            <path
              d={`M ${r2(lerp(bx, EXIT[0], back))} ${r2(lerp(by, EXIT[1], back))} L ${r2(lerp(bx, EXIT[0], go))} ${r2(lerp(by, EXIT[1], go))}`}
              stroke={K.creamDim}
              strokeOpacity={0.45}
              strokeWidth={1.5}
              strokeDasharray="5 7"
            />
          )}
          {pings.map((p, i) => {
            const q = clamp01((t - p) / 0.5);
            return t >= p && q < 1 ? <circle key={i} cx={EXIT[0]} cy={EXIT[1]} r={10 + 70 * ease.outCubic(q)} fill="none" stroke={K.orange} strokeWidth={1.5} opacity={0.8 * (1 - q)} /> : null;
          })}
          {go >= 1 && back <= 0 && t < SEND1 + 0.9 && (
            <text x={EXIT[0] + 26} y={EXIT[1] - 18} fontFamily={CODE} fontSize={16} fill={K.creamDim}>
              {'you?'}
            </text>
          )}
          <circle cx={r2(dx)} cy={r2(dy)} r={7} fill={K.orange} />
        </Layer>
      )}

      {/* Claude's own line stays on top of the swarm (dark knockout behind the status) */}
      {children.length > 0 && (
        <Layer>
          <rect x={STATUS.x - 8} y={STATUS.y - 18} width={COMP.w + 16} height={COMP.y + 64 + 10 - (STATUS.y - 18)} fill={K.bg} fillOpacity={0.94} />
        </Layer>
      )}
      <Status x={STATUS.x} y={STATUS.y} t0={132.3} verbs={VERBS} tokens={(tt) => 380 + 1300 * procCount(tt)} />
      <Composer x={COMP.x} y={COMP.y} w={COMP.w} prompts={PROMPTS} state={state} tOpen={COMP_OPEN} a={Math.min(a, 0.36)} />
      {showGlide && (
        <Layer>
          <Spark x={sx} y={sy} R={sR} rot={t * 50} />
        </Layer>
      )}
    </>
  );
};
