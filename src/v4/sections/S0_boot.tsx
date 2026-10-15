// S0 instrumental, 16.0–29.7 s: the title after the hard cut, its shrink into
// the header path, and the boot windows (world.ts editor, npm test terminal).
// The persistent IDE chrome (header, sidebar, transcript, composer, status) is
// assembled in S0.tsx.
import React from 'react';
import {beat, beatIndex, clamp01, ease, FPS, K, lerp, prog} from '../../v3/core';
import {Check, Elbow, Plot, Svg} from '../../v3/geo';
import {CODE} from '../fonts';
import {CodeBlock, TokLine, tokenize} from '../shell/Code';
import {Win} from '../shell/Win';
import {EDIT_CLOSE, EDITOR, n2, SEMI_DOT, TERM, TERM_CLOSE, TITLE} from './S0_geo';
import {CUT, T} from './s0.data';

const Fr = (f: number) => f / FPS;

// ------------------------------------------------------------------ title after the cut
const BS0 = T.detach + 0.06; // backspace start
const BS1 = BS0 + Fr(7);
const FLY: [number, number] = [BS1 + 0.01, 18.32];
const HEAD_X = 160, HEAD_BASE = 28, HEAD_SIZE = 17;
export const TITLE_GONE = FLY[1];
export const HEADER_T0 = 17.9;
// the header shows `~/` until the flying word lands in it
export const headerPath = (t: number) => (t < FLY[1] ? '~/' : '~/world');

export const TitleCut: React.FC<{t: number}> = ({t}) => {
  if (t < CUT || t >= TITLE_GONE) return null;
  const full = TITLE.text + ',';
  const f = (t - CUT) * FPS;
  // fill flash (3 frames solid) → outline by f11, like a keyword hit
  const fillO = f < 3 ? 1 : f >= 11 ? 0 : 1 - (f - 2) / 9;
  let n = full.length;
  if (t >= BS0) n = Math.max(5, full.length - Math.floor((t - BS0) * FPS * 2));
  const fp = prog(t, FLY[0], FLY[1], ease.inOutCubic);
  const size = lerp(TITLE.size, HEAD_SIZE, fp);
  const x = lerp(TITLE.x0, HEAD_X, fp), y = lerp(TITLE.base, HEAD_BASE, fp);
  const cream = fp; // orange outline → cream 0.45 fill (the header path colour)
  const ex = prog(t, CUT + 0.3, CUT + 0.3 + Fr(6)) * (1 - prog(t, T.detach, T.detach + Fr(5)));
  return (
    <Svg>
      <text
        x={n2(x)}
        y={n2(y)}
        fontFamily={CODE}
        fontWeight={500}
        fontSize={n2(size)}
        fill={cream > 0 ? K.cream : K.orange}
        fillOpacity={cream > 0 ? 0.45 * cream : fillO}
        stroke={K.orange}
        strokeOpacity={1 - cream}
        strokeWidth={2.5 * (size / TITLE.size) + 0.01}
        strokeLinejoin="round"
        xmlSpace="preserve"
      >
        {full.slice(0, n)}
      </text>
      {ex > 0 && (
        <g opacity={ex}>
          <Elbow x={TITLE.x0 + 8} y={TITLE.base + 76} />
          <text x={TITLE.x0 + 32} y={TITLE.base + 82} fontFamily={CODE} fontSize={22} fill={K.creamDim}>
            executing…
          </text>
        </g>
      )}
    </Svg>
  );
};
void SEMI_DOT;

// ------------------------------------------------------------------ editor: world.ts
export const WORLD_TS = [
  '// world.ts',
  'import {params} from "./params.json";',
  'import {Being} from "./me";',
  '',
  'export class World {',
  '  power = "on";',
  '  PROTECTION = true;',
  '  objects: Being[] = [];',
  '',
  '  async execute(me: Being) {',
  '    this.objects.push(new Being(params));',
  '    return this.simulate(me);',
  '  }',
  '}',
];
const EDIT_TYPE: [number, number] = [20.95, 22.25];
// a cursor marching through the class body, one line per beat
const MARCH = [4, 5, 6, 7, 9, 10, 11, 12];
const march = (t: number) => (t < T.edit ? null : MARCH[(beatIndex(t) - beatIndex(T.edit)) % MARCH.length]);

// ------------------------------------------------------------------ terminal: npm test
const TESTS = ['power is on', 'protection holds', 'objects are created', 'params initialize', 'world simulates', 'me is executable'];
const TEST_T = (k: number) => beat(53) + k * (30 / 130);
const TermBody: React.FC<{t: number}> = ({t}) => {
  const lh = 26, x = 24, y0 = 30;
  const cmd = '$ npm test';
  const nc = Math.ceil(cmd.length * prog(t, T.test + 0.42, T.test + 0.62));
  const rows: React.ReactNode[] = [];
  rows.push(<TokLine key="c" toks={tokenize(cmd, 'sh')} n={nc} size={17} x={x} y={y0} />);
  if (t >= TEST_T(0) - 0.12)
    rows.push(
      <text key="p" x={x} y={y0 + lh} fontFamily={CODE} fontSize={17} xmlSpace="preserve">
        <tspan fill={K.orange} fontWeight={700}>
          PASS
        </tspan>
        <tspan fill={K.cream} fillOpacity={0.7}>
          {'  world.test.ts'}
        </tspan>
      </text>,
    );
  TESTS.forEach((s, k) => {
    const tk = TEST_T(k);
    if (t < tk) return;
    const yy = y0 + lh * (k + 2);
    const ms = [2, 1, 4, 3, 7, 1][k];
    rows.push(
      <g key={k}>
        <Check x={x + 18} y={yy - 2} p={prog(t, tk, tk + Fr(3))} w={1.8} />
        <text x={x + 44} y={yy} fontFamily={CODE} fontSize={17} fill={K.cream} xmlSpace="preserve">
          {s}
          <tspan fill={K.creamDim}>{` (${ms} ms)`}</tspan>
        </text>
      </g>,
    );
  });
  if (t >= T.glob) {
    const yy = y0 + lh * 9;
    rows.push(
      <text key="s" x={x} y={yy} fontFamily={CODE} fontSize={17} xmlSpace="preserve">
        <tspan fill={K.creamDim}>{'Tests:  '}</tspan>
        <tspan fill={K.cream}>42 passed</tspan>
        <tspan fill={K.creamDim}>{', 42 total · 0.42 s'}</tspan>
      </text>,
    );
  }
  return (
    <svg width={TERM.w} height={TERM.h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {rows}
    </svg>
  );
};

const GUIDE: [number, number] = [19.0, 19.9];
export const Guides: React.FC<{t: number}> = ({t}) => {
  if (t < GUIDE[0] || t > T.editor + 0.3) return null;
  const p = prog(t, GUIDE[0], GUIDE[1], ease.inOutCubic);
  const o = 1 - prog(t, T.editor, T.editor + 0.25);
  const {x, y, w} = EDITOR;
  const h = TERM.y + TERM.h - y;
  const cx = x + w / 2, cy = EDITOR.y + EDITOR.h / 2;
  const lab = '916 × 900';
  return (
    <Svg>
      <g opacity={o}>
        <Plot d={`M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`} p={p} color={K.cream} w={1} opacity={0.25} dash="6 6" pen={false} />
        <Plot d={`M ${x} ${TERM.y - 12} L ${x + w} ${TERM.y - 12}`} p={prog(t, 19.4, 19.9, ease.inOutCubic)} color={K.cream} w={1} opacity={0.25} dash="6 6" pen={false} />
        <path d={`M ${cx - 14} ${cy} L ${cx + 14} ${cy} M ${cx} ${cy - 14} L ${cx} ${cy + 14}`} stroke={K.cream} strokeOpacity={0.45 * p} strokeWidth={1} />
        <text x={x + w} y={y + h + 22} textAnchor="end" fontFamily={CODE} fontSize={14} fill={K.creamDim} opacity={p}>
          {lab.slice(0, Math.ceil(lab.length * prog(t, 19.6, 19.9)))}
        </text>
      </g>
    </Svg>
  );
};

export const BootWindows: React.FC<{t: number}> = ({t}) => {
  if (t < T.editor - 0.1 || t > T.notebook + 0.2) return null;
  return (
    <>
      <Win x={EDITOR.x} y={EDITOR.y} w={EDITOR.w} h={EDITOR.h} title="world.ts" kind="editor" tOpen={T.editor} tClose={EDIT_CLOSE} a={0} seed={5}>
        <CodeBlock x={28} y={18} lines={WORLD_TS} lang="ts" size={18} typeOn={EDIT_TYPE} caret highlight={march} w={EDITOR.w - 40} />
      </Win>
      <Win x={TERM.x} y={TERM.y} w={TERM.w} h={TERM.h} title="npm test" kind="term" tOpen={T.test} tClose={TERM_CLOSE} a={0} seed={6}>
        <TermBody t={t} />
      </Win>
    </>
  );
};
void clamp01;
