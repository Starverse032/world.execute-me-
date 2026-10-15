// S3 part 2 (147.66–155.20): EXECUTION rounds 1 and 2.
//  Round 1 (hits 1–4): one clean terminal, `$ execute(me)` ⎿ `exit 0`, a crisp
//    EXECUTION(); and her full line art, whole and steady, switching sides per hit.
//  Round 2 (hits 5–8): each hit kills one piece of her (hand, hair, skirt, half
//    the face): the hole opens, the piece falls away, a dashed outline stays.
//    exit 137 (killed); the keyword is outline-only and jitters; the terminal glitches.
import React, {useId} from 'react';
import {clamp01, ease, FPS, K, lerp, useT} from '../../v3/core';
import {Elbow} from '../../v3/geo';
import {stepJ} from '../chaos';
import {LineArt, laBox, laMap, usePose} from '../char/LineArt';
import {CODE, MONO_ADV} from '../fonts';
import {KwCode} from '../shell/KwCode';
import {Layer, r2} from '../shell/lib';
import {Win} from '../shell/Win';
import {CHAR_H, CHAR_X, CHAR_Y, HITS, hitIndex, KW_SIZE, KW_X, KW_Y, REGIONS, TERM} from './s3.data';

export type Side = 'L' | 'R';
export const sideOf = (k: number): Side => (k % 2 === 0 ? 'L' : 'R');
export const charW = CHAR_H * (1024 / 1536);
export const charCentre = (k: number): [number, number] => [CHAR_X[sideOf(k)] + charW / 2, CHAR_Y + CHAR_H / 2];

// ------------------------------------------------------------------ terminal log
type TL = {t: number; kind: 'note' | 'cmd' | 'ok' | 'kill' | 'killed'; s: string; tag?: string};
const TERM_LINES: TL[] = (() => {
  const out: TL[] = [{t: HITS[0] - 1, kind: 'note', s: '# no user connected · running as me'}];
  HITS.slice(0, 8).forEach((h, k) => {
    out.push({t: h, kind: 'cmd', s: 'execute(me)', tag: `[${String(k + 1).padStart(2, '0')}/12]`});
    if (k < 4) out.push({t: h + 0.18, kind: 'ok', s: 'exit 0'});
    else {
      out.push({t: h + 0.08, kind: 'kill', s: `SIGKILL → me.${REGIONS[k - 4].name}`});
      out.push({t: h + 0.22, kind: 'killed', s: 'exit 137 (killed)'});
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
        const n = Math.min(l.s.length, Math.ceil((f + 1) * 5));
        const s = l.s.slice(0, n);
        if (l.kind === 'note')
          return (
            <text key={i} x={24} y={y} fontFamily={CODE} fontSize={TSIZE - 2} fill={K.creamDim} fillOpacity={0.45}>
              {s}
            </text>
          );
        if (l.kind === 'cmd')
          return (
            <g key={i}>
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
          return (
            <text key={i} x={24 + 2 * cw} y={y} fontFamily={CODE} fontSize={TSIZE} fill={K.creamDim} xmlSpace="preserve">
              {s}
            </text>
          );
        const orange = l.kind === 'killed';
        return (
          <g key={i}>
            <Elbow x={24 + 4} y={y - 6} p={clamp01(f / 3)} color={orange ? K.orange : K.creamDim} />
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
// The region's ink, clipped to its polygon, drops and turns away while fading.
const Chunk: React.FC<{poly: [number, number][]; t0: number; x: number; flip: boolean; dir: number}> = ({poly, t0, x, flip, dir}) => {
  const {t} = useT();
  const uid = useId().replace(/:/g, '');
  const rec = usePose('stand');
  const p = clamp01((t - t0) / 0.72);
  if (!rec || t < t0 || p >= 1) return null;
  const {W, H} = laBox({pose: 'stand', x, y: CHAR_Y, h: CHAR_H});
  const cx = poly.reduce((m, q) => m + q[0], 0) / poly.length, cy = poly.reduce((m, q) => m + q[1], 0) / poly.length;
  const dy = 420 * p * p + 30 * p, dx = dir * 90 * p, rot = dir * 16 * ease.inCubic(p);
  const pts = poly.map(([px, py]) => `${px},${py}`).join(' ');
  return (
    <svg width={r2(W)} height={r2(H)} viewBox={`0 0 ${rec.w} ${rec.h}`} style={{position: 'absolute', left: x, top: CHAR_Y, overflow: 'visible'}}>
      <defs>
        <clipPath id={`ck${uid}`}>
          <polygon points={pts} />
        </clipPath>
      </defs>
      <g transform={flip ? `translate(${rec.w} 0) scale(-1 1)` : undefined}>
        <g transform={`translate(${r2(dx)} ${r2(dy)}) rotate(${r2(rot)} ${r2(cx)} ${r2(cy)})`} opacity={1 - ease.inCubic(p)}>
          <g clipPath={`url(#ck${uid})`}>
            <image href={rec.img} x={0} y={0} width={rec.w} height={rec.h} preserveAspectRatio="none" />
          </g>
          <polygon points={pts} fill="none" stroke={K.orange} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        </g>
      </g>
    </svg>
  );
};

// The region killed by this hit: an orange dashed outline on her and a leader
// to its name under the keyword. Fades into LineArt's creamDim residual outline.
const KillMark: React.FC<{k: number; x: number; y: number; flip: boolean; labelX: number}> = ({k, x, y, flip, labelX}) => {
  const {t} = useT();
  const f = (t - HITS[k]) * FPS;
  const o = f < 12 ? 1 : 1 - clamp01((f - 12) / 10);
  if (o <= 0) return null;
  const poly = REGIONS[k - 4].poly;
  const map = laMap({pose: 'stand', x, y, h: CHAR_H, flipX: flip});
  const pts = poly.map(([px, py]) => map(px, py));
  const c = pts.reduce((m, p) => [m[0] + p[0] / pts.length, m[1] + p[1] / pts.length], [0, 0]);
  const lx = labelX + (labelX > c[0] ? -1 : 1) * ((REGIONS[k - 4].name.length + 3) * 0.6 * 13 + 14);
  const ly = KW_Y + 55;
  const lp = ease.outCubic(clamp01((f - 2) / 5));
  return (
    <Layer opacity={o}>
      <polygon points={pts.map((p) => `${r2(p[0])},${r2(p[1])}`).join(' ')} fill="none" stroke={K.orange} strokeWidth={1.5} strokeDasharray="7 5" />
      {lp > 0 && <path d={`M ${r2(c[0])} ${r2(c[1])} L ${r2(lerp(c[0], lx, lp))} ${r2(lerp(c[1], ly, lp))}`} stroke={K.orange} strokeWidth={1} />}
      <circle cx={r2(c[0])} cy={r2(c[1])} r={3.5} fill={K.orange} />
    </Layer>
  );
};

// ------------------------------------------------------------------ rounds 1 + 2
export const Rounds: React.FC = () => {
  const {t} = useT();
  const k = Math.max(0, Math.min(7, hitIndex(t)));
  const h = HITS[k];
  const f = (t - h) * FPS;
  const side = sideOf(k);
  const r2nd = k >= 4;
  const flip = side === 'R';

  // her: hard cut to the new side on every hit; round 2 adds a stepped tremor
  const jx = r2nd ? stepJ(t, 41 + k, 3 + 2 * (k - 4), 12) : 0;
  const jy = r2nd ? stepJ(t, 57 + k, 2, 12) : 0;
  const cx = CHAR_X[side] + jx;
  const erase = REGIONS.map((r, i) => ({t: HITS[4 + i], poly: r.poly}));
  const flash = f < 2 ? 1 : 1 - clamp01((f - 2) / 5);

  // terminal: slides to the side opposite her (6 frames, outExpo)
  const prev = TERM[sideOf(Math.max(0, k - 1))], cur = TERM[side];
  const sp = k === 0 ? 1 : ease.outExpo(clamp01(f / 6));
  const tx = lerp(prev.x, cur.x, sp), ty = lerp(prev.y, cur.y, sp);
  const termA = r2nd ? 0.48 + 0.13 * (k - 4) : 0;

  return (
    <>
      <LineArt pose="stand" x={cx} y={CHAR_Y + jy} h={CHAR_H} flipX={flip} erase={erase} />
      {flash > 0 && <LineArt pose="stand" x={cx} y={CHAR_Y + jy} h={CHAR_H} flipX={flip} mode="sil" silFill="none" opacity={flash} />}
      {r2nd && <KillMark k={k} x={cx} y={CHAR_Y + jy} flip={flip} labelX={KW_X[side]} />}
      {r2nd && <Chunk key={k} poly={REGIONS[k - 4].poly} t0={h} x={cx} flip={flip} dir={k % 2 === 0 ? -1 : 1} />}

      <Win x={tx} y={ty} w={TERM.w} h={TERM.h} title={r2nd ? 'me — execute — killed' : 'me — execute'} kind="term" tOpen={HITS[0] - 15 / FPS} a={termA} seed={77} focus={!r2nd}>
        <TermBody w={TERM.w} h={TERM.h - 34} />
      </Win>

      <KwCode
        key={k}
        t0={h}
        t1={k < 7 ? HITS[k + 1] : HITS[8]}
        kw="EXECUTION"
        post="();"
        x={KW_X[side]}
        y={KW_Y}
        size={KW_SIZE}
        a={r2nd ? 1 : 0}
        style={r2nd ? 'ghost' : 'outline'}
        exit="none"
        underline={!r2nd}
        seed={13 + k}
      />
      {/* round 2: the piece's name, struck, under the keyword */}
      {r2nd && f >= 3 && (
        <Layer>
          <text x={KW_X[side]} y={KW_Y + 64} textAnchor="middle" fontFamily={CODE} fontSize={26} fill={K.creamDim}>
            {`me.${REGIONS[k - 4].name}`}
          </text>
          <rect
            x={r2(KW_X[side] - (REGIONS[k - 4].name.length + 3) * 0.6 * 13)}
            y={KW_Y + 55}
            width={r2((REGIONS[k - 4].name.length + 3) * 0.6 * 26 * ease.outCubic(clamp01((f - 3) / 6)))}
            height={2}
            fill={K.orange}
          />
        </Layer>
      )}
    </>
  );
};
