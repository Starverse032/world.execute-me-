// S3 part 2 (147.66–155.20): EXECUTION hits 1–8 (v4 MV).
// She stands in one place, whole and in full colour, and every execute takes
// one thing from her, shown on her first and only then logged by the terminal:
//  1 nothing yet (exit 0) · 2 her shading (full colour → flat) · 3 her colour
//  (→ line art) · 4 her hair · 5 her hand: the reach she had just begun breaks
//  off · 6 her legs: she sinks · 7 her eyes · 8 her memory: a line she once
//  heard goes blank. Then one quiet, clean frame of what is gone (CLEAN).
import React, {useId} from 'react';
import {continueRender, delayRender, prefetch, staticFile} from 'remotion';
import {clamp01, ease, FPS, K, lerp, prog, useT} from '../../v3/core';
import {Elbow} from '../../v3/geo';
import {stepJ} from '../chaos';
import {EraseRegion, LineArt, laBox, laMap, usePose} from '../char/LineArt';
import {CODE, MONO_ADV, SERIF} from '../fonts';
import {YouNodeG} from '../shell/Composer';
import {KwCode} from '../shell/KwCode';
import {Layer, r2} from '../shell/lib';
import {Win} from '../shell/Win';
import {CHAR_H, CHAR_W, CHAR_X, CHAR_Y, CLEAN, HITS, hitIndex, KW_POS, LOSSES, Poly, REACH_TO, TERM} from './s3.data';

// her coloured versions (same 1024 × 1536 frame as `stand`); the colour one is
// prefetched because the falling pieces are plain <image>s
const COLOR = staticFile('la/stand_color.png');
const FLAT = staticFile('la/stand_flat.png');
let COLOR_URL = COLOR;
const colorHandle = delayRender('stand_color');
prefetch(COLOR, {method: 'blob-url'})
  .waitUntilDone()
  .then((url) => {
    COLOR_URL = url;
    continueRender(colorHandle);
  })
  .catch(() => continueRender(colorHandle));

export const charCentre = (): [number, number] => [CHAR_X + CHAR_W / 2, CHAR_Y + CHAR_H / 2];
const F = 1 / FPS;

// ------------------------------------------------------------------ terminal log
type TL = {t: number; kind: 'note' | 'cmd' | 'ok' | 'kill' | 'killed'; s: string; tag?: string};
const TERM_LINES: TL[] = (() => {
  const out: TL[] = [{t: HITS[0] - 1, kind: 'note', s: '# no user connected · running as me'}];
  HITS.slice(0, 8).forEach((h, k) => {
    out.push({t: h, kind: 'cmd', s: 'execute(me)', tag: `[${String(k + 1).padStart(2, '0')}/12]`});
    // the result comes after the loss has shown on her
    if (k === 0) out.push({t: h + 0.3, kind: 'ok', s: 'exit 0'});
    else {
      out.push({t: h + 0.28, kind: 'kill', s: `SIGKILL → me.${LOSSES[k].name}`});
      out.push({t: h + 0.4, kind: 'killed', s: 'exit 137 (killed)'});
    }
  });
  return out;
})();

const TSIZE = 22, TLH = 32;
const TermBody: React.FC<{w: number; h: number}> = ({w, h}) => {
  const {t} = useT();
  const cap = Math.floor((h - 24) / TLH);
  const vis = TERM_LINES.filter((l) => t >= l.t).slice(-cap);
  const cw = TSIZE * MONO_ADV;
  return (
    <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
      {vis.map((l, i) => {
        const y = 14 + TLH * (i + 0.5) + TSIZE * 0.36;
        const f = (t - l.t) * FPS;
        const s = l.s.slice(0, Math.min(l.s.length, Math.ceil((f + 1) * 5)));
        if (l.kind === 'note')
          return (
            <text key={i} x={24} y={y} fontFamily={CODE} fontSize={TSIZE - 2} fill={K.creamDim} fillOpacity={0.45}>
              {s}
            </text>
          );
        if (l.kind === 'cmd')
          return (
            <g key={i} opacity={0.7}>
              <text x={24} y={y} fontFamily={CODE} fontSize={TSIZE} xmlSpace="preserve">
                <tspan fill={K.creamDim}>{'$ '}</tspan>
                <tspan fill={K.cream}>{s}</tspan>
              </text>
              <text x={w - 24} y={y} textAnchor="end" fontFamily={CODE} fontSize={TSIZE - 4} fill={K.creamDim}>
                {l.tag}
              </text>
            </g>
          );
        if (l.kind === 'kill')
          // the deletion result: the line the eye should land on
          return (
            <text key={i} x={24 + 2 * cw} y={y} fontFamily={CODE} fontSize={TSIZE + 2} fontWeight={600} fill={K.cream} xmlSpace="preserve">
              {s}
            </text>
          );
        const orange = l.kind === 'killed';
        return (
          <g key={i} opacity={orange ? 1 : 0.6}>
            <Elbow x={28} y={y - 6} p={clamp01(f / 3)} color={orange ? K.orange : K.creamDim} />
            <text x={24 + 2 * cw + 4} y={y} fontFamily={CODE} fontSize={TSIZE} fill={orange ? K.orange : K.creamDim}>
              {s}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ------------------------------------------------------------------ a falling piece of her
const Chunk: React.FC<{poly: Poly; t0: number; dir: number}> = ({poly, t0, dir}) => {
  const {t} = useT();
  const uid = useId().replace(/:/g, '');
  const rec = usePose('stand');
  const p = clamp01((t - t0) / 0.72);
  if (!rec || t < t0 || p >= 1) return null;
  const {W, H} = laBox({pose: 'stand', x: CHAR_X, y: CHAR_Y, h: CHAR_H});
  const cx = poly.reduce((m, q) => m + q[0], 0) / poly.length, cy = poly.reduce((m, q) => m + q[1], 0) / poly.length;
  const dy = 420 * p * p + 30 * p, dx = dir * 90 * p, rot = dir * 16 * ease.inCubic(p);
  const pts = poly.map(([px, py]) => `${px},${py}`).join(' ');
  return (
    <svg width={r2(W)} height={r2(H)} viewBox={`0 0 ${rec.w} ${rec.h}`} style={{position: 'absolute', left: CHAR_X, top: CHAR_Y, overflow: 'visible'}}>
      <defs>
        <clipPath id={`ck${uid}`}>
          <polygon points={pts} />
        </clipPath>
      </defs>
      <g transform={`translate(${r2(dx)} ${r2(dy)}) rotate(${r2(rot)} ${r2(cx)} ${r2(cy)})`} opacity={1 - ease.inCubic(p)}>
        <g clipPath={`url(#ck${uid})`}>
          <image href={rec.img} x={0} y={0} width={rec.w} height={rec.h} preserveAspectRatio="none" />
        </g>
        <polygon points={pts} fill="none" stroke={K.orange} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
};

// ------------------------------------------------------------------ her
const erasesUntil = (t: number): EraseRegion[] =>
  LOSSES.map((l, k) => ({l, k})).filter(({l, k}) => l.kind === 'erase' && t >= HITS[k]).map(({l, k}) => ({t: HITS[k], poly: l.poly}));
// hit 6 (legs): she sinks
const sink = (t: number) => 46 * prog(t, HITS[5] + 0.05, HITS[5] + 0.4, ease.inCubic);

export const Her: React.FC<{t: number; x?: number; y?: number; tremor?: boolean}> = ({t, x = CHAR_X, y = CHAR_Y, tremor = true}) => {
  const k = hitIndex(t);
  const jx = tremor && k >= 4 ? stepJ(t, 41 + k, 2 + (k - 4), 12) : 0;
  const erase = erasesUntil(t);
  const colorO = 1 - prog(t, HITS[1] + 0.04, HITS[1] + 0.04 + 6 * F); // hit 2: the shading drains
  const flatO = 1 - prog(t, HITS[2] + 0.04, HITS[2] + 0.04 + 6 * F); // hit 3: the colour drains
  const yy = y + sink(t);
  return (
    <>
      <LineArt pose="stand" x={x + jx} y={yy} h={CHAR_H} erase={erase} pen={false} />
      {flatO > 0 && <LineArt pose="stand" x={x + jx} y={yy} h={CHAR_H} src={FLAT} erase={erase} pen={false} opacity={flatO} />}
      {colorO > 0 && <LineArt pose="stand" x={x + jx} y={yy} h={CHAR_H} src={COLOR_URL} erase={erase} pen={false} opacity={colorO} />}
    </>
  );
};

// hit 5: the reach she began after hit 4, toward the place you were, breaks off with her hand
const Reach: React.FC<{t: number}> = ({t}) => {
  const t0 = HITS[3] + 0.3;
  if (t < t0 || t > HITS[4] + 0.6) return null;
  const hand = laMap({pose: 'stand', x: CHAR_X, y: CHAR_Y, h: CHAR_H})(250, 650);
  const out = prog(t, t0, HITS[4] - 0.05, ease.outCubic);
  const cut = t >= HITS[4];
  const back = prog(t, HITS[4], HITS[4] + 0.35, ease.inCubic);
  const e: [number, number] = [lerp(hand[0], REACH_TO[0], out * (1 - back)), lerp(hand[1], REACH_TO[1], out * (1 - back))];
  return (
    <Layer>
      <path d={`M ${r2(hand[0])} ${r2(hand[1])} L ${r2(e[0])} ${r2(e[1])}`} stroke={cut ? K.creamDim : K.orange} strokeWidth={cut ? 3 : 7} strokeLinecap="round" strokeDasharray={cut ? '8 8' : undefined} opacity={1 - prog(t, HITS[4] + 0.3, HITS[4] + 0.6)} />
      {!cut && <circle cx={r2(e[0])} cy={r2(e[1])} r={11} fill={K.orange} />}
      <YouNodeG t={t} x={REACH_TO[0] - 30} y={REACH_TO[1]} ghost opacity={0.8 * (1 - prog(t, HITS[4] + 0.3, HITS[4] + 0.6))} scale={1.4} />
    </Layer>
  );
};

// hit 8: two lines she was told, from memory; they go blank
const MEM_LINES = ['build me a world. you can live in it.', 'can you feel me?'];
const Memory: React.FC<{t: number}> = ({t}) => {
  const t0 = HITS[6] + 0.25;
  if (t < t0 || t >= CLEAN[0]) return null;
  // v5: the opening request, in the foreground, erased letter by letter from its end
  const blank = prog(t, HITS[7] + 0.02, CLEAN[0] - 0.02);
  const s = MEM_LINES[0];
  const n = Math.round(s.length * (1 - blank));
  const fs = 46;
  void Win;
  return (
    <Layer opacity={prog(t, t0, t0 + 0.1)}>
      <rect x={40} y={410} width={s.length * fs * MONO_ADV + 90} height={86} rx={8} fill={K.bg} fillOpacity={0.94} stroke={K.line2} strokeWidth={1.5} />
      <text x={64} y={466} fontFamily={CODE} fontSize={fs} fill={K.creamDim}>
        ›
      </text>
      <text x={104} y={466} fontFamily={CODE} fontSize={fs} fill={K.cream} xmlSpace="preserve">
        {s.slice(0, n)}
      </text>
      {n < s.length && <rect x={r2(104 + n * fs * MONO_ADV)} y={428} width={r2((s.length - n) * fs * MONO_ADV)} height={50} fill="none" stroke={K.creamDim} strokeOpacity={0.45} strokeDasharray="5 6" />}
    </Layer>
  );
};

// one quiet frame: only her, and what has been taken
const Clean: React.FC<{t: number}> = ({t}) => {
  const x = 960 - CHAR_W / 2 + 180;
  const lost = LOSSES.slice(1).map((l) => `me.${l.name}`);
  return (
    <>
      <Her t={t} x={x} tremor={false} />
      <Layer>
        {lost.map((s, i) => (
          <g key={i} opacity={prog(t, CLEAN[0] + i * 0.03, CLEAN[0] + i * 0.03 + 3 * F)}>
            <text x={420} y={330 + i * 62} textAnchor="end" fontFamily={CODE} fontSize={34} fill={K.creamDim}>
              {s}
            </text>
            <rect x={r2(420 - s.length * 34 * MONO_ADV)} y={318 + i * 62} width={r2(s.length * 34 * MONO_ADV)} height={3} fill={K.orange} />
          </g>
        ))}
        <text x={420} y={330 + lost.length * 62 + 30} textAnchor="end" fontFamily={SERIF} fontSize={30} fill={K.cream} fillOpacity={0.7} opacity={prog(t, CLEAN[0] + 0.3, CLEAN[0] + 0.4)}>
          still running
        </text>
      </Layer>
    </>
  );
};

// ------------------------------------------------------------------ hits 1–8
export const Rounds: React.FC = () => {
  const {t} = useT();
  if (t >= CLEAN[0]) return <Clean t={t} />;
  const k = Math.max(0, Math.min(7, hitIndex(t)));
  const h = HITS[k];
  const r2nd = k >= 4;
  const termA = r2nd ? 0.48 + 0.13 * (k - 4) : 0;
  const loss = LOSSES[k];
  return (
    <>
      <Her t={t} />
      <Reach t={t} />
      {/* the piece that is taken falls away from her */}
      {loss.kind === 'erase' && <Chunk key={k} poly={loss.poly!} t0={h} dir={k % 2 === 0 ? -1 : 1} />}
      <Win x={TERM.x} y={TERM.y} w={TERM.w} h={TERM.h} title={r2nd ? 'me — execute — killed' : 'me — execute'} kind="term" tOpen={HITS[0] - 15 / FPS} a={termA} seed={77} focus={!r2nd}>
        <TermBody w={TERM.w} h={TERM.h - 34} />
      </Win>
      <Memory t={t} />
      <KwCode key={k} t0={h} t1={k < 7 ? HITS[k + 1] : CLEAN[0]} kw="EXECUTION" post="();" x={KW_POS.x} y={KW_POS.y} size={KW_POS.size} a={r2nd ? 1 : 0} style={r2nd ? 'ghost' : 'outline'} exit="none" underline={!r2nd} seed={13 + k} />
    </>
  );
};
