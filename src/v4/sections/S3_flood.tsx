// S3 part 3 (155.20–162.63): round 3, the count, the final hit.
//  Round 3 (hits 9–12): EXECUTION rows take the screen (1 → 4 → 16 → 36 rows,
//    orange and cream alternating); she survives only as a silhouette knocked
//    out of the text (the pieces killed in round 2 are flooded too).
//  Count (158.90–161.58): the tiling freezes at 0.25; a locale.ts card types the
//    dictionary; each word lands huge in its own script on a hexagon, the dot
//    plotting the constellation between them, then running to the centre.
//  Final (161.58): orange flash (2 f), ink-on-orange EXECUTION(me); in a frame,
//    hard black: the frame's segments drift, the dot remains.
import React, {useId} from 'react';
import {clamp01, ease, FPS, K, lerp, useT} from '../../v3/core';
import {usePose} from '../char/LineArt';
import {CJK, CODE, MONO_ADV, SERIF} from '../fonts';
import {tokenize, TOK_STYLE} from '../shell/Code';
import {Frame, Layer, r2, rrPath} from '../shell/lib';
import {Win} from '../shell/Win';
import {BLACK, CARD, COUNT_T, DOT_END, FINAL, FLOOD, HITS, hitIndex, LOCALE_LINES, REGIONS, SEG, segShatter, SIL, WORD_SIZE, WORDS} from './s3.data';

const UNIT = 'EXECUTION ';
const SIL_K = SIL.h / 1536;

// ------------------------------------------------------------------ round 3
const Flood: React.FC = () => {
  const {t} = useT();
  const uid = useId().replace(/:/g, '');
  const rec = usePose('stand');
  const ts = Math.min(t, COUNT_T[0]); // the tiling freezes on EIN
  const k = Math.max(0, Math.min(3, hitIndex(ts) - 8));
  const h = HITS[8 + k];
  const f = (ts - h) * FPS;
  const cfg = FLOOD[k];
  const unitW = UNIT.length * MONO_ADV * cfg.size;
  const reps = Math.ceil(1920 / unitW) + 2;
  const line = UNIT.repeat(reps);
  const total = cfg.rows * cfg.pitch;
  const top = 540 - total / 2;
  const sc = f < 4 ? 1.05 - 0.05 * ease.outCubic(f / 4) : 1;
  const counting = t >= COUNT_T[0];
  const dim = counting ? lerp(1, 0.25, clamp01((t - COUNT_T[0]) * FPS / 3)) : 1;
  const big = k <= 1;
  // big rows: solid for 3 frames then outline (KwCode style); small rows stay filled
  const fillO = big ? (f < 3 ? 1 : 1 - clamp01((f - 2) / 9)) : 1;
  const silTf = `translate(${r2(SIL.x)} ${r2(SIL.y)}) scale(${SIL_K})`;
  const outlineO = counting ? 0.45 : 1;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <mask id={`fm${uid}`} maskUnits="userSpaceOnUse" x={0} y={0} width={1920} height={1080}>
          <rect x={0} y={0} width={1920} height={1080} fill="#fff" />
          {rec && (
            <g transform={silTf}>
              <path d={rec.sil} fill="#000" />
              {REGIONS.map((r, i) => (
                <polygon key={i} points={r.poly.map((p) => p.join(',')).join(' ')} fill="#fff" />
              ))}
            </g>
          )}
        </mask>
      </defs>
      <g opacity={dim}>
        <g mask={`url(#fm${uid})`} transform={sc !== 1 ? `translate(960 540) scale(${r2(sc * 1000) / 1000}) translate(-960 -540)` : undefined}>
          {Array.from({length: cfg.rows}, (_, r) => {
            const orange = r % 2 === 0;
            const dir = r % 2 === 0 ? -1 : 1;
            const v = cfg.v * (0.8 + 0.4 * ((r * 37) % 11) / 10);
            const off = (((ts - h) * v * dir + r * unitW * 0.37) % unitW + unitW) % unitW;
            const y = top + r * cfg.pitch + cfg.pitch / 2 + cfg.size * 0.36;
            const col = orange ? K.orange : K.cream;
            return (
              <text
                key={r}
                x={r2(-unitW + off)}
                y={r2(y)}
                fontFamily={CODE}
                fontWeight={700}
                fontSize={cfg.size}
                xmlSpace="preserve"
                fill={col}
                fillOpacity={orange ? fillO : big ? 0.7 * fillO + 0.0 : 0.7}
                stroke={big ? col : undefined}
                strokeOpacity={big && !orange ? 0.7 : 1}
                strokeWidth={big ? Math.max(1.5, cfg.size / 70) : undefined}
              >
                {line}
              </text>
            );
          })}
        </g>
        {rec && (
          <g transform={silTf}>
            <path d={rec.sil} fill="none" stroke={K.orange} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" opacity={outlineO} />
            {REGIONS.map((r, i) => (
              <polygon key={i} points={r.poly.map((p) => p.join(',')).join(' ')} fill="none" stroke={K.creamDim} strokeWidth={1.5} strokeDasharray="6 6" vectorEffect="non-scaling-stroke" opacity={0.7} />
            ))}
          </g>
        )}
      </g>
    </svg>
  );
};

// ------------------------------------------------------------------ the count
const nodeOf = (i: number): [number, number] => [WORDS[i].x, WORDS[i].y + 84];

const LocaleCard: React.FC = () => {
  const {t} = useT();
  const size = CARD.size, lh = size * 1.6, cw = size * MONO_ADV;
  const gutter = cw * 4;
  const pad = 18;
  const maxLen = LOCALE_LINES.reduce((m, l) => Math.max(m, l.length), 0);
  const w = pad * 2 + gutter + maxLen * cw;
  const hh = pad * 2 + LOCALE_LINES.length * lh;
  const x = 960 - w / 2, y = CARD.y;
  const f0 = (t - COUNT_T[0]) * FPS;
  const open = ease.outCubic(clamp01(f0 / 4));
  // when each line has typed (lines 0–1 at once, one locale line per word, `};` before the hit)
  const starts = [COUNT_T[0], COUNT_T[0], ...COUNT_T, FINAL - 0.3];
  // highlighted row: the newest word
  let hi = -1;
  COUNT_T.forEach((c, i) => {
    if (t >= c) hi = i + 2;
  });
  return (
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <g opacity={open}>
        <path d={rrPath(x, y + (hh * (1 - open)) / 2, w, hh * open, 10)} fill={K.surface} />
        <Frame x={x} y={y + (hh * (1 - open)) / 2} w={w} h={hh * open} t={t} a={0} opacity={0.45} />
      </g>
      {open >= 1 && (
        <g>
          {hi >= 0 && (
            <g>
              <rect x={x + 1} y={r2(y + pad + hi * lh)} width={w - 2} height={r2(lh)} fill={K.line2} fillOpacity={0.35} />
              <rect x={x + 1} y={r2(y + pad + hi * lh)} width={2} height={r2(lh)} fill={K.orange} />
            </g>
          )}
          {LOCALE_LINES.map((l, i) => {
            const tf = (t - starts[i]) * FPS;
            if (tf < 0) return null;
            const n = Math.min(l.length, Math.ceil((tf + 1) * 4));
            const by = y + pad + lh * (i + 0.5) + size * 0.36;
            // tokens laid out by hand so 넷 / 六 can use the CJK face (1 em wide)
            let cx = x + pad + gutter;
            let left = n;
            const spans: React.ReactNode[] = [];
            tokenize(l, 'ts').forEach((tk, j) => {
              if (left <= 0) return;
              const s = tk.s.slice(0, left);
              left -= s.length;
              const st = TOK_STYLE[tk.k];
              let sx = cx;
              for (const ch of s) {
                const cjk = ch === '넷' || ch === '六';
                spans.push(
                  <text key={`${j}-${spans.length}`} x={r2(sx)} y={r2(by)} fontFamily={cjk ? CJK : CODE} fontSize={size} fill={st.fill} fillOpacity={st.o} fontWeight={st.wt} xmlSpace="preserve">
                    {ch}
                  </text>,
                );
                sx += cjk ? size : cw;
              }
              cx = sx;
            });
            return (
              <g key={i}>
                <text x={r2(x + pad + gutter - cw * 2)} y={r2(by)} textAnchor="end" fontFamily={CODE} fontSize={size} fill={K.creamDim} fillOpacity={0.45}>
                  {i + 1}
                </text>
                {spans}
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
};

const Count: React.FC = () => {
  const {t} = useT();
  // constellation: segment i (node i → node i+1) is plotted by the dot between the words
  const segs: React.ReactNode[] = [];
  let dot: [number, number] | null = null;
  for (let i = 0; i < 6; i++) {
    const t0 = COUNT_T[i], t1 = i < 5 ? COUNT_T[i + 1] : FINAL;
    if (t < t0) break;
    const a = nodeOf(i), b = i < 5 ? nodeOf(i + 1) : DOT_END;
    const p = ease.inOutCubic(clamp01((t - t0 - 2 / FPS) / Math.max(0.05, t1 - t0 - 3 / FPS)));
    const e: [number, number] = [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
    if (p > 0) segs.push(<path key={i} d={`M ${r2(a[0])} ${r2(a[1])} L ${r2(e[0])} ${r2(e[1])}`} stroke={i < 5 ? K.cream : K.orange} strokeOpacity={i < 5 ? 0.45 : 1} strokeWidth={i < 5 ? 1 : 1.5} />);
    if (t < t1) dot = e;
  }
  return (
    <>
      <Layer>{segs}</Layer>
      <LocaleCard />
      <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {WORDS.map((w, i) => {
          if (t < COUNT_T[i]) return null;
          const f = (t - COUNT_T[i]) * FPS;
          const newest = i === 5 || t < COUNT_T[i + 1];
          const sc = f < 4 ? 1.06 - 0.06 * ease.outCubic(f / 4) : 1;
          const toCream = f >= 5 ? 1 : 0; // hard switch, no in-between hue
          const cy = w.y - WORD_SIZE * 0.33;
          const [nx, ny] = nodeOf(i);
          return (
            <g key={i}>
              <g transform={sc !== 1 ? `translate(${w.x} ${r2(cy)}) scale(${r2(sc * 1000) / 1000}) translate(${-w.x} ${r2(-cy)})` : undefined}>
                <text
                  x={w.x}
                  y={w.y}
                  textAnchor="middle"
                  fontFamily={w.cjk ? CJK : SERIF}
                  fontSize={WORD_SIZE}
                  fill={toCream < 1 ? K.orange : K.cream}
                  fillOpacity={newest ? 1 : 0.7}
                  stroke={K.bg}
                  strokeWidth={16}
                  strokeLinejoin="round"
                  style={{paintOrder: 'stroke'}}
                >
                  {w.word}
                </text>
              </g>
              <text x={w.x} y={w.y + 54} textAnchor="middle" fontFamily={CODE} fontSize={30} fill={newest ? K.orange : K.creamDim} stroke={K.bg} strokeWidth={8} style={{paintOrder: 'stroke'}}>
                {w.code}
              </text>
              <circle cx={nx} cy={ny} r={4} fill={K.bg} stroke={newest ? K.orange : K.cream} strokeOpacity={newest ? 1 : 0.7} strokeWidth={1.5} />
            </g>
          );
        })}
        {dot && <circle cx={r2(dot[0])} cy={r2(dot[1])} r={7} fill={K.orange} />}
      </svg>
    </>
  );
};

// ------------------------------------------------------------------ the final hit
const Final: React.FC = () => {
  const {t} = useT();
  const f = (t - FINAL) * FPS;
  if (t < BLACK) {
    const ink = f >= 2;
    const fs = f - 2;
    const sc = ink && fs < 4 ? 1.04 - 0.04 * ease.outCubic(fs / 4) : 1;
    const size = 200, ps = size * 0.42;
    const kwW = 9 * MONO_ADV * size, postW = 5 * MONO_ADV * ps;
    const left = 960 - (kwW + postW) / 2;
    const base = SEG.y + 34 + (SEG.h - 34) / 2 + size * 0.36;
    return (
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <rect x={0} y={0} width={1920} height={1080} fill={K.orange} />
        {ink && (
          <g transform={sc !== 1 ? `translate(960 ${r2(base)}) scale(${r2(sc * 1000) / 1000}) translate(-960 ${r2(-base)})` : undefined}>
            <path d={rrPath(SEG.x, SEG.y, SEG.w, SEG.h, 10)} fill="none" stroke={K.bg} strokeWidth={3} />
            <path d={`M ${SEG.x} ${SEG.y + 34} L ${SEG.x + SEG.w} ${SEG.y + 34}`} stroke={K.bg} strokeWidth={1.5} />
            <text x={SEG.x + SEG.w / 2} y={SEG.y + 23} textAnchor="middle" fontFamily={CODE} fontSize={16} fill={K.bg}>
              {'me — execute'}
            </text>
            <text x={r2(left)} y={r2(base)} fontFamily={CODE} fontWeight={700} fontSize={size} fill={K.bg}>
              {'EXECUTION'}
            </text>
            <text x={r2(left + kwW)} y={r2(base)} fontFamily={CODE} fontSize={ps} fill={K.bg} xmlSpace="preserve">
              {'(me);'}
            </text>
            <rect x={r2(left)} y={r2(base + size * 0.14)} width={r2(kwW)} height={4} fill={K.bg} />
          </g>
        )}
      </svg>
    );
  }
  // hard black: the frame's border is in pieces, drifting; the dot remains
  return (
    <>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <rect x={0} y={0} width={1920} height={1080} fill={K.bg} />
      </svg>
      <Win x={SEG.x} y={SEG.y} w={SEG.w} h={SEG.h} title={SEG.title} kind="term" tOpen={150} a={SEG.a} seed={SEG.seed} shatter={segShatter(t)} focus />
      <Layer>
        <circle cx={DOT_END[0]} cy={DOT_END[1]} r={7} fill={K.orange} />
      </Layer>
    </>
  );
};

export const Flood3: React.FC = () => {
  const {t} = useT();
  if (t >= FINAL) return <Final />;
  return (
    <>
      <Flood />
      {t >= COUNT_T[0] && <Count />}
    </>
  );
};
