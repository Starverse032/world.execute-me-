// S1 verse 2 (74.0–88.6): the editor with four tabs. Each file types its
// interface with the keyword as an ALL_CAPS type, and a minimal geometric icon
// is plotted in the preview pane under the code (eggplant, tomato, tabby cat,
// the only god). EXISTENCE: the eye opens inside god.ts's preview.
import React from 'react';
import {ease, env, K, lastOnset, prog, pulse, useT} from '../../v3/core';
import {LineArt} from '../char/LineArt';
import {CodeBlock} from '../shell/Code';
import {KwCode} from '../shell/KwCode';
import {r2} from '../shell/lib';
import {Win} from '../shell/Win';
import {At, circD, DEG, HoldImages, ellD, Mono, P, P2, poly, pp, TAU} from './S1_lib';
import {EDITOR, EDITOR_TABS, L} from './s1.data';

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
    type: [L.god + 0.12, L.proof + 0.95],
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

const Cat: React.FC<{t: number}> = ({t}) => {
  const [cx, cy0] = C;
  const cy = cy0 + 40;
  const t0 = L.cat + 0.15;
  const hit = L.ENJOY;
  const happy = prog(t, hit, hit + 0.15, ease.outCubic);
  const ears: P2[][] = [
    [
      [cx - 112, cy - 46],
      [cx - 100, cy - 178],
      [cx - 30, cy - 116],
    ],
    [
      [cx + 112, cy - 46],
      [cx + 100, cy - 178],
      [cx + 30, cy - 116],
    ],
  ];
  const almond = (ex: number) => `M ${ex - 24} ${cy - 8} Q ${ex} ${cy - 30} ${ex + 24} ${cy - 8} Q ${ex} ${cy + 14} ${ex - 24} ${cy - 8}`;
  const arc = (ex: number) => `M ${ex - 22} ${cy - 4} Q ${ex} ${cy - 26} ${ex + 22} ${cy - 4}`;
  const whisk: string[] = [];
  for (let s = -1; s <= 1; s += 2)
    for (let k = -1; k <= 1; k++) whisk.push(`M ${cx + s * 52} ${cy + 46 + k * 6} L ${cx + s * 170} ${cy + 40 + k * 24}`);
  // purr waves: rings out of the head on every beat from "purr"
  const purr: React.ReactNode[] = [];
  if (t >= L.purr)
    for (let j = 0; j < 3; j++) {
      const ob = lastOnset(t) - j * 0.4615;
      if (ob < L.purr) continue;
      const q = (t - ob) / 1.2;
      if (q > 1) continue;
      const R = 140 + 120 * q;
      const pts: P2[] = [];
      for (let k = 0; k <= 120; k++) {
        const a = (k / 120) * TAU;
        const rr = R + 5 * Math.sin(a * 14 + t * 20);
        pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
      }
      purr.push(<path key={j} d={poly(pts)} fill="none" stroke={K.cream} strokeWidth={1} opacity={0.45 * (1 - q)} />);
    }
  return (
    <>
      {purr}
      <P d={circD(cx, cy, 128)} p={pp(t, t0, 0.45)} t={t} w={2} />
      {ears.map((e, i) => (
        <P key={i} d={poly(e)} p={pp(t, t0 + 0.45 + i * 0.12, 0.2)} t={t} w={2} />
      ))}
      {[-48, 48].map((dx, i) =>
        happy < 1 ? (
          <g key={i} opacity={1 - happy}>
            <P d={almond(cx + dx)} p={pp(t, t0 + 0.8 + i * 0.1, 0.18)} t={t} w={1.5} />
            {t > t0 + 1.0 && <path d={`M ${cx + dx} ${cy - 22} L ${cx + dx} ${cy + 6}`} stroke={K.orange} strokeWidth={3} strokeLinecap="round" />}
          </g>
        ) : null,
      )}
      {happy > 0 && [-48, 48].map((dx, i) => <P key={'h' + i} d={arc(cx + dx)} p={happy} t={t} color={K.orange} w={3} pen={false} />)}
      <P d={`M ${cx - 10} ${cy + 30} L ${cx + 10} ${cy + 30} L ${cx} ${cy + 40} Z`} p={pp(t, t0 + 1.05, 0.12)} t={t} color={K.orange} w={1.5} />
      <P d={`M ${cx - 24} ${cy + 52} Q ${cx - 12} ${cy + 64} ${cx} ${cy + 46} Q ${cx + 12} ${cy + 64} ${cx + 24} ${cy + 52}`} p={pp(t, t0 + 1.15, 0.15)} t={t} w={1.5} />
      {whisk.map((d, i) => (
        <P key={i} d={d} p={pp(t, t0 + 1.25 + i * 0.04, 0.12)} t={t} w={1} o={0.7} pen={false} />
      ))}
      {[-26, 0, 26].map((dx, i) => (
        <P key={'s' + i} d={`M ${cx + dx - 8} ${cy - 118} Q ${cx + dx} ${cy - 96} ${cx + dx + 8} ${cy - 76}`} p={pp(t, t0 + 1.55 + i * 0.06, 0.12)} t={t} color={K.orange} w={2} pen={false} />
      ))}
      <Mono x={cx} y={cy + 196} s={16} c={happy > 0 ? K.orange : K.creamDim} anchor="middle" o={prog(t, L.purr, L.purr + 0.2)}>
        {happy > 0 ? 'purr() → ENJOYMENT' : 'purr.hz = 25'}
      </Mono>
    </>
  );
};

// the eye line art (EXISTENCE): crop around the iris, opens from its centre line
const EYE_CROP: [number, number, number, number] = [590, 275, 1390, 775];
const EYE_CY = 525;
const EYE_K = 0.84;
const EYE_W = (EYE_CROP[2] - EYE_CROP[0]) * EYE_K;
const EYE_X = C[0] - EYE_W / 2, EYE_Y = DIV_Y + 40;
const eyeOpen = (t: number) => prog(t, L.EXIST - 0.02, L.EXIST + 0.42, ease.outCubic);

const God: React.FC<{t: number}> = ({t}) => {
  const [cx, cy] = [C[0], EYE_Y + (EYE_CY - EYE_CROP[1]) * EYE_K];
  const t0 = L.god + 0.2;
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
      <At>
        <path d={`M 0 ${DIV_Y} L ${BW} ${DIV_Y}`} stroke={K.cream} strokeOpacity={0.25} strokeWidth={1} />
        <Mono x={26} y={DIV_Y + 26} s={13}>
          {`preview · ${NAMES[i]}`}
        </Mono>
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
      <KwCode t0={L.NUTR} t1={L.tomato - 0.12} pre="give(" kw="NUTRIENTS" post=")" x={sx} y={928} size={112} a={0} />
      <KwCode t0={L.ANTI} t1={L.cat - 0.12} pre="give(" kw="ANTIOXIDANTS" post=")" x={sx} y={928} size={98} a={0} />
      <KwCode t0={L.ENJOY} t1={L.god - 0.12} pre="purr(): " kw="ENJOYMENT" post=";" x={sx} y={928} size={108} a={0} />
      <KwCode t0={L.EXIST} t1={88.38} pre="return you ? " kw="EXISTENCE" post=" : null;" x={sx} y={952} size={80} a={0} />
    </>
  );
};

