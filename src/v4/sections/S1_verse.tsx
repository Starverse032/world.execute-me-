// S1 verse 2 (74.0–88.6): the editor with four tabs. Each file types its
// interface with the keyword as an ALL_CAPS type, and a minimal geometric icon
// is plotted in the preview pane under the code (eggplant, tomato, tabby cat,
// the only god). EXISTENCE: the eye opens inside god.ts's preview.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {ease, env, K, lerp, prog, pulse, useT} from '../../v3/core';
import {YouNodeG} from '../shell/Composer';
import {LineArt} from '../char/LineArt';
import {CodeBlock} from '../shell/Code';
import {KwCode} from '../shell/KwCode';
import {r2} from '../shell/lib';
import {Win} from '../shell/Win';
import {At, circD, DEG, HoldImages, ellD, Mono, P, P2, poly, pp} from './S1_lib';
import {EDITOR, EDITOR_TABS, GOD_TAB, L} from './s1.data';
import {CAT_PV} from './S1_closeups';

// body coordinates (origin = editor top-left + (0, 66))
const BW = EDITOR.w, BH = EDITOR.h - 66;
const DIV_Y = 316;
const C: P2 = [BW / 2, 548]; // preview centre
const TAB_T = EDITOR_TABS.map((tb) => tb.t);
const tabAt = (t: number) => TAB_T.reduce((m, t0, i) => (t >= t0 ? i : m), 0);

type File = {lines: string[]; type: [number, number]; kwRow: number; hit: number; end: number};
export const FILES: File[] = [
  {
    lines: ['// if I’m an eggplant', 'interface Eggplant {', '  shape: [Ellipse, Ellipse];', '  nutrients: NUTRIENTS;', '}', 'const me: Eggplant = grow();', 'give(you, me.nutrients);'],
    type: [L.eggplant + 0.12, L.give2 + 0.9],
    kwRow: 3,
    hit: L.NUTR,
    end: L.tomato,
  },
  {
    lines: ['// if I’m a tomato', 'interface Tomato {', '  radius: number;', '  antioxidants: ANTIOXIDANTS;', '}', 'const me: Tomato = ripen();', 'give(you, me.antioxidants);'],
    type: [L.tomato + 0.12, L.give3 + 0.8],
    kwRow: 3,
    hit: L.ANTI,
    end: L.cat,
  },
  {
    lines: ['// if I’m a tabby cat', 'interface Cat {', '  stripes: true;', '  purr(): ENJOYMENT;', '}', 'const me: Cat = adopt();', 'me.purr(); // for you'],
    type: [L.cat + 0.12, L.purr + 0.9],
    kwRow: 3,
    hit: L.ENJOY,
    end: L.god,
  },
  {
    lines: ['// if I’m the only god', 'interface God {', '  only: true;', '}', 'function exist(you?: You) {', '  return you ? EXISTENCE : null;', '}'],
    type: [GOD_TAB + 0.08, L.proof + 0.95],
    kwRow: 5,
    hit: L.EXIST,
    end: 999,
  },
];

// ------------------------------------------------------------------ icons
const Eggplant: React.FC<{t: number}> = ({t}) => {
  const [cx, cy] = C;
  const t0 = L.eggplant + 0.3;
  const bx = cx + 12, by = cy + 38;
  const calyx: P2[] = [];
  for (let i = 0; i <= 8; i++) {
    const a = (-90 - 28 + i * 45) * DEG;
    const r = i % 2 ? 22 : 58;
    calyx.push([cx - 58 + r * Math.cos(a), cy - 102 + r * Math.sin(a) * 0.7]);
  }
  const labels: [string, P2, P2][] = [
    ['K', [bx + 70, by - 40], [bx + 190, by - 110]],
    ['Mg', [bx + 82, by + 40], [bx + 210, by + 30]],
    ['Fe', [bx - 60, by + 100], [bx - 200, by + 150]],
    ['B6', [bx - 76, by - 30], [bx - 220, by - 60]],
    ['fiber', [bx + 20, by + 140], [bx + 170, by + 190]],
  ];
  const hit = L.NUTR;
  const dots: React.ReactNode[] = [];
  if (t >= hit)
    for (let i = 0; i < 18; i++) {
      const q = prog(t, hit + i * 0.012, hit + 0.55 + i * 0.012, ease.outCubic);
      const a = (150 + (i * 60) / 17) * DEG;
      const d = 40 + 520 * q;
      dots.push(<circle key={i} cx={r2(bx + Math.cos(a) * d)} cy={r2(by + Math.sin(a) * d * 0.8)} r={5} fill={K.orange} opacity={1 - q * 0.6} />);
    }
  const flash = t >= hit ? env(t - hit, 0.2) : 0;
  return (
    <>
      <P d={ellD(bx, by, 88, 150, -28, -90)} p={pp(t, t0, 0.5)} t={t} w={flash > 0.3 ? 3 : 2} color={flash > 0.3 ? K.orange : K.cream} />
      <P d={ellD(cx - 50, cy - 86, 46, 26, -28, 180)} p={pp(t, t0 + 0.5, 0.22)} t={t} o={0.7} />
      <P d={poly(calyx)} p={pp(t, t0 + 0.7, 0.28)} t={t} color={K.orange} w={2} />
      <P d={`M ${cx - 70} ${cy - 112} Q ${cx - 92} ${cy - 150} ${cx - 120} ${cy - 168}`} p={pp(t, t0 + 0.98, 0.14)} t={t} color={K.orange} w={2.5} />
      {labels.map(([s, a, b], i) => {
        const t1 = L.give2 + 0.15 + i * 0.23;
        const q = pp(t, t1, 0.18);
        return (
          <g key={i}>
            <P d={`M ${r2(a[0])} ${r2(a[1])} L ${r2(b[0])} ${r2(b[1])}`} p={q} t={t} o={0.45} w={1} pen={false} />
            <Mono x={b[0] + (b[0] > a[0] ? 8 : -8)} y={b[1] + 5} s={16} c={K.cream} o={0.7 * prog(t, t1 + 0.12, t1 + 0.2)} anchor={b[0] > a[0] ? 'start' : 'end'}>
              {s}
            </Mono>
          </g>
        );
      })}
      {dots}
    </>
  );
};

const starPts = (cx: number, cy: number, R: number, r: number, n = 5, rot = 0): P2[] => {
  const pts: P2[] = [];
  for (let i = 0; i <= 2 * n; i++) {
    const a = (-90 + rot + (180 / n) * i) * DEG;
    const rr = i % 2 ? r : R;
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a) * 0.55]);
  }
  return pts;
};

const Tomato: React.FC<{t: number}> = ({t}) => {
  const [cx, cy0] = C;
  const cy = cy0 + 30;
  const t0 = L.tomato + 0.25;
  const hit = L.ANTI;
  const flash = t >= hit ? env(t - hit, 0.2) : 0;
  const rads: React.ReactNode[] = [];
  for (let i = 0; i < 7; i++) {
    const a = (141 + i * 43) * DEG; // 7 radicals around the tomato, leaving the label's sector (60°–120°) clear
    const R = 232 + (i % 2) * 26;
    const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R * 0.78;
    const ti = L.give3 + 0.1 + i * 0.17;
    const ki = hit + i * 0.07;
    const killed = prog(t, ki, ki + 0.12);
    const gone = prog(t, ki + 0.35, ki + 0.6);
    if (t < ti || gone >= 1) continue;
    const ea = (t - ti) * 5 + i;
    rads.push(
      <g key={i} opacity={1 - gone}>
        <P d={circD(x, y, 13)} p={pp(t, ti, 0.15)} t={t} o={killed > 0 ? 0.45 : 0.7} w={1.5} pen={false} />
        {killed < 1 && <circle cx={r2(x + Math.cos(ea) * 13)} cy={r2(y + Math.sin(ea) * 13)} r={3.5} fill={K.orange} opacity={1 - killed} />}
        {killed > 0 && <path d={`M ${r2(x - 18)} ${r2(y)} L ${r2(x - 18 + 36 * killed)} ${r2(y)}`} stroke={K.orange} strokeWidth={2} />}
      </g>,
    );
  }
  const nAlive = 7 - [0, 1, 2, 3, 4, 5, 6].filter((i) => t >= hit + i * 0.07 + 0.06).length;
  return (
    <>
      <P d={circD(cx, cy, 142)} p={pp(t, t0, 0.5)} t={t} w={flash > 0.3 ? 3 : 2} color={flash > 0.3 ? K.orange : K.cream} />
      <P d={poly(starPts(cx, cy - 128, 58, 20))} p={pp(t, t0 + 0.5, 0.3)} t={t} color={K.orange} w={2} />
      <P d={`M ${cx} ${cy - 132} L ${cx + 6} ${cy - 170}`} p={pp(t, t0 + 0.8, 0.1)} t={t} color={K.orange} w={2.5} />
      <P d={ellD(cx, cy, 70, 142, 0, -90)} p={pp(t, t0 + 0.9, 0.35)} t={t} o={0.25} pen={false} />
      <P d={ellD(cx, cy, 142, 52, 0, 180)} p={pp(t, t0 + 1.0, 0.35)} t={t} o={0.25} pen={false} />
      {rads}
      <Mono x={cx} y={cy + 214} s={16} c={t >= hit ? K.orange : K.creamDim} anchor="middle" o={prog(t, L.give3 + 0.2, L.give3 + 0.4)}>
        {`free_radicals = ${nAlive}`}
      </Mono>
    </>
  );
};

// v7: cat.ts previews the very drawing the close-up folds back into (S1_closeups
// CAT_PV): the cat-ear Claude with her paw up, a few still purr arcs, the result.
const Cat: React.FC<{t: number}> = ({t}) => {
  const fx = CAT_PV.x, fy = CAT_PV.y, k = CAT_PV.h / 1536;
  const th: P2 = [fx + 520 * k, fy + 735 * k];
  const arcs: React.ReactNode[] = [];
  for (let j = 0; j < 3; j++) {
    const R = 120 + 70 * j;
    const pts: P2[] = [];
    for (let i = 0; i <= 40; i++) {
      const a = (140 + (85 * i) / 40) * DEG;
      pts.push([th[0] + Math.cos(a) * R, th[1] + Math.sin(a) * R]);
    }
    arcs.push(<path key={j} d={poly(pts)} fill="none" stroke={j === 0 ? K.orange : K.cream} strokeOpacity={0.5 - 0.12 * j} strokeWidth={1.5} />);
  }
  return t >= L.ENJOY ? (
    <>
      {arcs}
      <Mono x={BW - 26} y={BH - 24} s={16} c={K.orange} anchor="end">
        {'purr() → ENJOYMENT'}
      </Mono>
    </>
  ) : null;
};
const CatPreview: React.FC = () => (
  <div style={{position: 'absolute', left: 0, top: 0, width: BW, height: BH, clipPath: `inset(${EYE_TOP}px 0 0 0)`}}>
    <Img src={staticFile('la3x/cat_smile.png')}style={{position: 'absolute', left: CAT_PV.x, top: CAT_PV.y, height: CAT_PV.h, width: (CAT_PV.h * 1024) / 1536}} />
  </div>
);

// the eye line art (EXISTENCE): crop around the iris, opens from its centre line.
// v7: the crop fills the preview pane between its label row and a result strip
// (where EXISTENCE lands), so the picture's edges are the window's own edges
// and dividers (no floating rectangle).
const EYE_TOP = DIV_Y + 40;
const EYE_BOT = BH - 96;
const EYE_CROP: [number, number, number, number] = [500, 321, 1480, 729];
const EYE_CY = 525;
const EYE_K = BW / (EYE_CROP[2] - EYE_CROP[0]);
const EYE_W = BW;
const EYE_X = 0, EYE_Y = EYE_TOP;
const eyeOpen = (t: number) => prog(t, L.EXIST - 0.02, L.EXIST + 0.42, ease.outCubic);

const God: React.FC<{t: number}> = ({t}) => {
  const [cx, cy] = [C[0], EYE_Y + (EYE_CY - EYE_CROP[1]) * EYE_K];
  const t0 = GOD_TAB + 0.06;
  const iconO = 1 - prog(t, L.EXIST - 0.05, L.EXIST + 0.3);
  const rays: React.ReactNode[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (-90 + i * 22.5) * DEG;
    const r0 = 150, r1 = i % 2 ? 205 : 240;
    rays.push(<P key={i} d={`M ${r2(cx + Math.cos(a) * r0)} ${r2(cy + Math.sin(a) * r0 * 0.62)} L ${r2(cx + Math.cos(a) * r1)} ${r2(cy + Math.sin(a) * r1 * 0.62)}`} p={pp(t, t0 + i * 0.05, 0.14)} t={t} w={1.5} o={i % 2 ? 0.45 : 0.7} pen={false} />);
  }
  const lidD = `M ${cx - 170} ${cy} Q ${cx} ${cy + 36} ${cx + 170} ${cy}`;
  const tri: P2[] = [
    [cx, cy - 190],
    [cx + 232, cy + 128],
    [cx - 232, cy + 128],
    [cx, cy - 190],
  ];
  // pulse on the beats of "Then you're the proof of my" (the closed eye twitches)
  const tw = t >= L.proof && t < L.EXIST ? pulse(t) : 0;
  return (
    <>
      <g opacity={iconO}>
        {rays}
        <P d={poly(tri)} p={pp(t, t0 + 0.85, 0.5)} t={t} color={K.orange} w={2} />
        <P d={lidD} p={pp(t, t0 + 0.5, 0.3)} t={t} w={2 + 1.5 * tw} />
        <P d={`M ${cx - 120} ${cy + 20} L ${cx - 132} ${cy + 40} M ${cx - 60} ${cy + 30} L ${cx - 64} ${cy + 52} M ${cx} ${cy + 33} L ${cx} ${cy + 56} M ${cx + 60} ${cy + 30} L ${cx + 64} ${cy + 52} M ${cx + 120} ${cy + 20} L ${cx + 132} ${cy + 40}`} p={pp(t, t0 + 0.8, 0.2)} t={t} w={1.5} o={0.7} pen={false} />
      </g>
    </>
  );
};

// HTML level (inside the editor body): the eye line art and its lid lines.
const GodEye: React.FC<{t: number}> = ({t}) => {
  const op = eyeOpen(t);
  if (op <= 0) return null;
  const clipH = ((EYE_CROP[3] - EYE_CROP[1]) / 2) * op;
  const lidY0 = EYE_Y + (EYE_CY - clipH - EYE_CROP[1]) * EYE_K, lidY1 = EYE_Y + (EYE_CY + clipH - EYE_CROP[1]) * EYE_K;
  return (
    <>
      <HoldImages style={{clipPath: `inset(${r2(lidY0)}px 0 ${r2(Math.max(0, BH - lidY1))}px 0)`}}>
        <LineArt pose="eye" x={EYE_X} y={EYE_Y} scale={EYE_K} crop={EYE_CROP} opacity={prog(t, L.EXIST - 0.02, L.EXIST + 0.1)} />
        {/* "be something real.": once open, the eye floods with flat colour */}
        {t >= L.EXIST + 0.12 && <LineArt pose="eye" x={EYE_X} y={EYE_Y} scale={EYE_K} crop={EYE_CROP} src={staticFile('la/eye_flat.png')} pen={false} opacity={prog(t, L.EXIST + 0.12, L.EXIST + 0.3, ease.inOutCubic)} />}
      </HoldImages>
      <At o={1 - prog(t, L.EXIST + 0.3, L.EXIST + 0.6)}>
        <path d={`M ${r2(EYE_X)} ${r2(lidY0)} L ${r2(EYE_X + EYE_W)} ${r2(lidY0)} M ${r2(EYE_X)} ${r2(lidY1)} L ${r2(EYE_X + EYE_W)} ${r2(lidY1)}`} stroke={K.orange} strokeWidth={2} />
      </At>
    </>
  );
};

const ICONS = [Eggplant, Tomato, Cat, God];
const NAMES = ['eggplant.ts', 'tomato.ts', 'cat.ts', 'god.ts'];

const EditorBody: React.FC<{t: number}> = ({t}) => {
  const i = tabAt(t);
  const f = FILES[i];
  const Icon = ICONS[i];
  const hl = (tt: number) => (tt >= f.hit && tt < f.end ? f.kwRow : null);
  return (
    <>
      <CodeBlock key={'c' + i} x={26} y={20} size={21} lines={f.lines} lang="ts" typeOn={f.type} caret highlight={hl} w={BW - 60} />
      {i === 2 && t >= L.cat && <CatPreview />}
      <At>
        <path d={`M 0 ${DIV_Y} L ${BW} ${DIV_Y}`} stroke={K.cream} strokeOpacity={0.25} strokeWidth={1} />
        <Mono x={26} y={DIV_Y + 26} s={13}>
          {`preview · ${NAMES[i]}`}
        </Mono>
        {i === 3 && t >= L.EXIST - 0.1 && (
          <g opacity={prog(t, L.EXIST - 0.1, L.EXIST + 0.1)}>
            <path d={`M 0 ${EYE_TOP} L ${BW} ${EYE_TOP} M 0 ${EYE_BOT} L ${BW} ${EYE_BOT}`} stroke={K.cream} strokeOpacity={0.25} strokeWidth={1} />
            <Mono x={BW - 26} y={DIV_Y + 26} s={13} anchor="end">
              {'sample · eye · 1:1'}
            </Mono>
          </g>
        )}
        <Icon t={t} />
      </At>
      {i === 3 && <GodEye t={t} />}
    </>
  );
};

export const VerseStage: React.FC = () => {
  const {t} = useT();
  if (t < 74.05) return null;
  return (
    <Win {...EDITOR} title="objects.ts — editor" kind="editor" tOpen={60} tabs={EDITOR_TABS} a={0} seed={60} focus>
      <EditorBody t={t} />
    </Win>
  );
};

export const VerseOverlay: React.FC = () => {
  const {t} = useT();
  if (t < 76.5) return null;
  const sx = EDITOR.x + EDITOR.w / 2;
  return (
    <>
      <KwCode t0={L.NUTR} t1={L.tomato - 0.22} pre="give(" kw="NUTRIENTS" post=")" x={sx} y={928} size={112} a={0} />
      <KwCode t0={L.ANTI} t1={L.cat - 0.22} pre="give(" kw="ANTIOXIDANTS" post=")" x={sx} y={928} size={98} a={0} />
      {/* v7: under the cat close-up; gone before the close-up folds back into the preview */}
      <KwCode t0={L.ENJOY} t1={84.7} pre="purr(): " kw="ENJOYMENT" post=";" x={sx} y={928} size={108} a={0} />
      <KwCode t0={L.EXIST} t1={88.38} pre="return you ? " kw="EXISTENCE" post=" : null;" x={sx} y={952} size={80} a={0} />
      {/* v5: "proof of my existence": the cursor comes to her eye and clicks; the eye opens and lights */}
      {t >= L.proof && t < 88.5 && (
        <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <YouNodeG t={t} x={lerp(1700, 1470, prog(t, L.proof, L.EXIST - 0.1, ease.inOutCubic))} y={lerp(1040, 720, prog(t, L.proof, L.EXIST - 0.1, ease.inOutCubic))} pings={[L.EXIST - 0.02]} opacity={1 - prog(t, 88.3, 88.5)} scale={1.3} />
        </svg>
      )}
    </>
  );
};

