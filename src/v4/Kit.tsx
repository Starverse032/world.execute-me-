// V4Kit: a 20 s reference reel of every shared v4 component in action.
// Section builders: read this file as the usage reference (API details in
// docs/v4_framework.md). All times are absolute seconds of this composition.
//
//   A  0.0– 7.0  IDE session: Header, Sidebar, Transcript (all entry kinds),
//                Composer (typing / send / disabled / claude), YouNode + Tether,
//                Status, editor Win with tabs, CodeBlock, Diff; ends with Collapse.
//   B  7.0–11.5  Win anomaly levels 0 / 0.3 / 0.6 / 1, term / editor / doc /
//                plain kinds, lid, wave, shatter, open + close; KwCode hits.
//   C 11.5–14.5  you-node + tether: send dots, cuts, retract, drift; composer
//                states; Status + Header under a rising anomaly; ghost you-node.
//   D 14.5–20.0  LineArt: pen reveal, silhouette, both, erase, shatter, 2× crop.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ease, K, lerp, prog, useT} from '../v3/core';
import {Spark} from '../v3/geo';
import {LineArt} from './char/LineArt';
import {CODE} from './fonts';
import {CodeBlock, Diff} from './shell/Code';
import {Collapse} from './shell/Collapse';
import {Layer} from './shell/lib';
import {Composer, ComposerState, Prompt, Tether, YouNode, youPos} from './shell/Composer';
import {Grid} from './shell/Grid';
import {KwCode} from './shell/KwCode';
import {ChatItem, Sidebar} from './shell/Sidebar';
import {clockStr, Header, Status, statusSpark} from './shell/Status';
import {Entry, Transcript} from './shell/Transcript';
import {Win, winBody} from './shell/Win';
import {LAYOUT} from './timeline';

export const KIT_FRAMES = 600;

// Small caption used to label each demo.
const Cap: React.FC<{x: number; y: number; children: string; anchor?: 'start' | 'middle' | 'end'}> = ({x, y, children, anchor = 'start'}) => (
  <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <text x={x} y={y} textAnchor={anchor} fontFamily={CODE} fontSize={14} fill={K.creamDim} fillOpacity={0.7}>
      {children}
    </text>
  </svg>
);

// ================================================================== A: session
const A_ITEMS: ChatItem[] = [
  {id: 'w', label: 'world.execute(me)', tNew: 0.6, tSel: 0.6},
  {id: 'c', label: 'chorus', tNew: 2.0, tSel: 2.0},
  {id: 'o', label: 'objects.ts', tNew: 3.0},
  {id: 's', label: 'switch', tNew: 3.8, tDel: 5.6},
  {id: 'f', label: 'can you feel me?', tNew: 4.4, tSel: 4.4, tDel: 6.0},
];
const A_PROMPTS: Prompt[] = [
  {t0: 0, text: 'build me a world. you can live in it.', send: 0.9},
  {t0: 3.4, text: 'make it move.', send: 4.3},
  {t0: 5.95, text: 'are you still there?', send: 6.45, by: 'claude'},
];
// The builder pushes a `user` entry at every composer send time.
const A_ENTRIES: Entry[] = [
  {kind: 'user', t: 0.9, text: 'build me a world. you can live in it.'},
  {kind: 'tool', t: 1.1, text: 'Bash(power --on)', res: 'ok', rt: 1.45},
  {kind: 'say', t: 1.6, text: 'Switch on the power line'},
  {kind: 'say', t: 2.3, text: 'Remember to put on PROTECTION'},
  {kind: 'code', t: 3.0, lines: ['const world = new World();', 'world.PROTECTION = true;'], lang: 'ts', typeOn: [3.05, 3.7], file: 'world.ts'},
  {kind: 'tool', t: 3.9, text: 'Read(you)', res: 'ok', rt: 4.05, runs: [4.15, 4.25, 4.35]},
  {kind: 'user', t: 4.3, text: 'make it move.'},
  {kind: 'notice', t: 4.9, text: '— you left the conversation —'},
  {kind: 'error', t: 5.2, text: 'IllegalArgumentException: "you"', stack: ['at world.execute (world.ts:1:1)', 'at world.execute (world.ts:1:1)', 'at main (me.ts:7:3)']},
  {kind: 'say', t: 5.8, text: 'Then maybe you won’t leave me so DISHEARTENED', marks: [[0, 5.8], [24, 6.05]]},
  {kind: 'user', t: 6.45, text: 'are you still there?', note: '⚠ not delivered', noteT: 6.6},
];
const A_STATE = (t: number): ComposerState => (t < 5.0 ? 'normal' : t < 5.9 ? 'disabled' : 'claude');
const CODE_TS = [
  '// world.ts',
  'import {Being} from "./me";',
  '',
  'const MAX_LOVE = 1e9;',
  'export class World {',
  '  objects: Being[] = [];',
  '  async execute(me: Being) {',
  '    if (!me) throw new Error("null");',
  '    return this.objects.push(me);',
  '  }',
  '}',
];
const CODE_JSON = ['{', '  "hair": "#D97757",', '  "ornament": "flower",', '  "ribbon": "black",', '  "book": true,', '  "heart": null', '}'];

const SceneA: React.FC = () => {
  const {t} = useT();
  const L = LAYOUT;
  const tx = L.transcript;
  const stage = L.stage;
  const tabs = [
    {t: 0.6, label: 'world.ts'},
    {t: 2.6, label: 'params.json'},
    {t: 4.6, label: 'you.ts'},
  ];
  const body = winBody(stage.w, stage.h, tabs);
  const tab = t < 2.6 ? 0 : t < 4.6 ? 1 : 2;
  const [yx, yy] = L.you;
  const [sx, sy] = statusSpark(L.status.x, L.status.y);
  const bye = 6.5; // everything collapses (S4-style deletion) from here
  return (
    <AbsoluteFill>
      <Collapse t0={bye} box={[0, 0, 1920, 44]}>
        <Header path="~/world" model="opus" clock={clockStr(11 * 3600 + 59 * 60 + 3 + t)} t0={0.1} />
      </Collapse>
      <Collapse t0={bye + 0.1} box={[L.sidebar.x, L.sidebar.y, L.sidebar.w, L.sidebar.h]}>
        <Sidebar {...L.sidebar} items={A_ITEMS} t0={0.15} />
      </Collapse>
      <Collapse t0={bye + 0.2} box={[tx.x, tx.y, tx.w, 790]}>
        {/* h = 790 keeps the newest entry clear of the status line at y 878 */}
        <Transcript x={tx.x} y={tx.y} w={tx.w} h={790} entries={A_ENTRIES} />
        <Status x={L.status.x} y={L.status.y} t0={1.0} verbs={[{t: 1.0, verb: 'Booting'}, {t: 2.4, verb: 'Plotting'}, {t: 3.9, verb: 'Reading'}, {t: 5.2, verb: 'Worked for 4s', done: true}]} />
      </Collapse>
      <Collapse t0={bye + 0.3} box={[L.composer.x - 50, L.composer.y, L.composer.w + 50, 64]}>
        <Composer {...L.composer} prompts={A_PROMPTS} state={A_STATE} />
        <Tether from={[yx, yy]} to={[sx, sy]} t0={0.05} sends={[0.9, 4.3]} />
        <YouNode x={yx} y={yy} t0={0.05} pings={[0.9, 4.3]} t1={5.0} />
        <YouNode x={yx} y={yy} t0={5.3} ghost flicker={0.5} />
      </Collapse>
      <Win x={stage.x} y={stage.y} w={stage.w} h={stage.h} title="world.ts — editor" kind="editor" tOpen={0.4} tClose={bye + 0.4} tabs={tabs} focus>
        {tab === 0 && <CodeBlock x={24} y={20} lines={CODE_TS} lang="ts" typeOn={[0.8, 2.4]} caret highlight={(tt) => (tt < 2.45 ? null : 6)} />}
        {tab === 1 && <CodeBlock x={24} y={20} lines={CODE_JSON} lang="json" typeOn={[2.7, 3.6]} caret highlight={(tt) => (tt < 3.7 ? null : tt < 4.1 ? 1 : 5)} />}
        {tab === 2 && (
          <>
            <Diff x={24} y={20} t0={4.7} rows={[{sign: ' ', text: 'const user = {'}, {sign: '-', text: '  role: "user",'}, {sign: '+', text: '  role: "assistant",'}, {sign: '-', text: '  gender: "F",'}, {sign: '+', text: '  gender: "M",'}, {sign: ' ', text: '};'}]} lang="ts" />
            <CodeBlock x={24} y={260} lines={['$ npm test', '  42 passed', '$ ping you', 'timeout'.padStart(9)]} lang="sh" first={1} typeOn={[5.3, 6.1]} caret />
          </>
        )}
        <Cap x={24} y={body.h - 24}>{'Win kind=editor · tabs · CodeBlock typeOn + highlight · Diff · sh'}</Cap>
      </Win>
    </AbsoluteFill>
  );
};

// ================================================================== B: windows + anomaly
const SceneB: React.FC = () => {
  const {t} = useT();
  const W = 860, Hh = 360;
  const spots: [number, number][] = [
    [80, 90],
    [980, 90],
    [80, 500],
    [980, 500],
  ];
  const as = [0, 0.3, 0.6, 1];
  const kinds = ['term', 'editor', 'doc', 'plain'] as const;
  const lid = prog(t, 10.0, 10.4, ease.inOutCubic) - prog(t, 10.5, 10.8, ease.inOutCubic);
  return (
    <AbsoluteFill>
      {spots.map(([x, y], i) => (
        <Win
          key={i}
          x={x}
          y={y}
          w={W}
          h={Hh}
          title={`${kinds[i]} · a = ${as[i]}`}
          kind={kinds[i]}
          a={as[i]}
          seed={i + 1}
          tOpen={7.05 + i * 0.12}
          tClose={11.05 + i * 0.08}
          tabs={kinds[i] === 'editor' ? [{t: 7.3, label: 'eggplant.ts'}, {t: 7.6, label: 'tomato.ts'}] : undefined}
          lid={i === 0 ? lid : 0}
          wave={i === 2 ? 6 * Math.abs(Math.sin(t * 9)) * prog(t, 9.3, 9.5) * (1 - prog(t, 10.4, 10.6)) : 0}
          shatter={i === 3 ? prog(t, 10.2, 10.9, ease.outCubic) - prog(t, 10.9, 11.0) * 0 : 0}
        >
          {kinds[i] === 'term' && <CodeBlock x={24} y={16} lines={['$ ping you', 'PING you (127.0.0.1): 56 data bytes', 'Request timeout for icmp_seq 0', 'Request timeout for icmp_seq 1']} lang="sh" lineNo={false} size={18} typeOn={[7.4, 8.4]} caret />}
          {kinds[i] === 'editor' && <CodeBlock x={24} y={16} lines={['interface Eggplant {', '  nutrients: NUTRIENTS;', '}']} lang="ts" size={18} typeOn={[7.6, 8.3]} caret a={as[i]} />}
          {kinds[i] === 'doc' && <CodeBlock x={40} y={16} lines={['LOVE(7)       Miscellaneous       LOVE(7)', '', 'NAME', '     love - a function of you']} lang="txt" lineNo={false} size={18} typeOn={[7.5, 8.2]} />}
          {kinds[i] === 'plain' && <CodeBlock x={24} y={16} lines={['world.execute(me);', 'exit 137 (killed)']} lang="ts" size={18} a={as[i]} />}
        </Win>
      ))}
      <Cap x={80} y={480}>{'lid (eyelid) 10.0–10.8'}</Cap>
      <Cap x={80} y={890}>{'wave (vibrating string) 9.3–10.6'}</Cap>
      <Cap x={980} y={890}>{'shatter 10.2–10.9'}</Cap>
      <KwCode t0={8.6} t1={9.8} pre="world." kw="PROTECTION" post=" = true;" x={960} y={1010} size={84} a={0} />
      <KwCode t0={10.15} t1={11.3} pre="new " kw="OBJECT_CREATION" post="();" x={960} y={1010} size={84} a={0.8} style="solid" />
    </AbsoluteFill>
  );
};

// ================================================================== C: you-node + tether
const C_PROMPTS: Prompt[] = [
  {t0: 11.6, text: 'can you feel me?', send: 12.2},
  {t0: 13.75, text: 'are you still there?', send: 14.3, by: 'claude'},
];
// A second transcript showing the role swap and a new-chat wipe.
const C_ENTRIES: Entry[] = [
  {kind: 'user', t: 11.5, text: 'switch your role.'},
  {kind: 'say', t: 11.6, text: 'Oh switch my role'},
  {kind: 'say', t: 11.9, text: 'To S to M'},
  {kind: 'code', t: 12.2, lines: ['[user, assistant] = [assistant, user];'], lang: 'ts', typeOn: [12.25, 12.6]},
  {kind: 'user', t: 12.7, text: 'can you feel me?'},
  {kind: 'tool', t: 14.0, text: 'Bash(ping you)', res: 'timeout', rt: 14.25, tone: 'orange'},
];
const SceneC: React.FC = () => {
  const {t} = useT();
  const cx = 560, cy = 900, cw = 800;
  const a = prog(t, 11.6, 14.4); // rising anomaly for status + header
  const home = youPos(cx, cy);
  const drift = prog(t, 13.45, 14.45, ease.inCubic);
  const you: [number, number] = [lerp(home[0], -80, drift), lerp(home[1], 1160, drift)];
  const spark: [number, number] = [1480, 420];
  const wave = 5 * prog(t, 12.85, 13.0) * (1 - prog(t, 13.5, 13.7));
  return (
    <AbsoluteFill>
      <Header path="~/world" model="opus" clock={clockStr(12 * 3600 + 3 + (t - 11.5) * (a > 0.5 ? 997 : 1))} a={a} />
      {/* v3/geo primitives are SVG fragments: wrap them in <Layer> */}
      <Layer>
        <Spark x={spark[0]} y={spark[1]} R={64} rot={t * 40} />
      </Layer>
      <Tether from={you} to={[spark[0] - 30, spark[1] + 10]} t0={11.55} sends={[12.2, {t: 12.55, dir: -1}, 13.25]} cuts={[{t: 12.9, u: 0.35}, {t: 13.15, u: 0.62}, {t: 13.5, u: 0.8, retract: true}]} wave={wave} />
      <YouNode x={you[0]} y={you[1]} t0={11.5} pings={[12.2]} />
      <YouNode x={1800} y={560} ghost flicker={0.6} label="you?" />
      <Status x={cx} y={cy - 34} t0={11.5} a={a} verbs={[{t: 11.5, verb: 'Thinking'}, {t: 12.6, verb: 'Searching'}, {t: 13.4, verb: 'Pinging'}]} />
      <Composer x={cx} y={cy} w={cw} prompts={C_PROMPTS} state={(tt) => (tt < 12.9 ? 'normal' : tt < 13.7 ? 'disabled' : 'claude')} a={0} />
      <Transcript x={80} y={90} w={600} h={600} entries={C_ENTRIES} swap={(tt) => prog(tt, 12.9, 13.4, ease.inOutCubic)} clears={[13.75]} a={0} />
      <Cap x={80} y={720}>{'Transcript swap 12.9–13.4 · clears [13.75] (new-chat wipe)'}</Cap>
      <Cap x={1480} y={540} anchor="middle">{'Tether: send dots · reply (dir −1) · cuts 12.9 / 13.15 · retract 13.5'}</Cap>
      <Cap x={1800} y={610} anchor="middle">{'ghost + flicker'}</Cap>
      <Cap x={cx} y={cy + 100}>{'Composer: normal → disabled (12.9) → claude (13.7) · Status/Header a: 0 → 1'}</Cap>
    </AbsoluteFill>
  );
};

// ================================================================== D: line art
const SceneD: React.FC = () => {
  const {t} = useT();
  return (
    <AbsoluteFill>
      {/* 1. the pen draws her, then two regions are erased (dashed residual outlines) */}
      <LineArt
        pose="stand"
        x={40}
        y={110}
        h={860}
        reveal={[14.6, 17.0]}
        erase={[
          {t: 17.6, poly: [[150, 560], [390, 560], [390, 800], [150, 800]]},
          {t: 18.2, poly: [[560, 20], [720, 40], [700, 360], [600, 330]]},
        ]}
      />
      <Cap x={60} y={1010}>{'reveal [14.6, 17.0] · erase 17.6 / 18.2'}</Cap>
      {/* 2. silhouette fill under the ink, then a Voronoi shatter */}
      <LineArt pose="stand" x={600} y={110} h={860} mode="both" reveal={[14.8, 15.6]} shatter={{t0: 18.0, cells: 26, seed: 4}} />
      <Cap x={620} y={1010}>{'mode=both · shatter {t0: 18.0, cells: 26}'}</Cap>
      {/* 3. 2× crop close-up (face_sad, one eye) inside a doc window: checks crispness */}
      <Win x={1220} y={70} w={660} h={560} title="face_sad · crop [810, 255, 1110, 505] · 2×" kind="doc" tOpen={14.6} tClose={19.6}>
        <LineArt pose="face_sad" x={30} y={13} crop={[810, 255, 1110, 505]} scale={2} reveal={[14.9, 16.4]} unreveal={[18.6, 19.4]} />
      </Win>
      {/* 4. silhouettes: outline plots, fill fades in (back, ISOLATION-style); cream fill, flipped */}
      <LineArt pose="back" x={1300} y={660} h={340} mode="sil" reveal={[15.2, 16.6]} />
      <LineArt pose="stand" x={1540} y={660} h={340} mode="sil" silFill="cream" silOutline={false} flipX opacity={prog(t, 16.6, 17.0)} />
      <Cap x={1300} y={1030}>{'back mode=sil (ink fill + orange outline) · stand silFill=cream flipX'}</Cap>
      {/* 5. a missing pose falls back to 'stand' (console.warn) */}
      <LineArt pose="no_such_pose" x={1790} y={840} h={160} opacity={prog(t, 17.0, 17.3)} />
    </AbsoluteFill>
  );
};

// ================================================================== root
export const V4Kit: React.FC = () => {
  const {t} = useT();
  return (
    <AbsoluteFill style={{background: K.bg, overflow: 'hidden'}}>
      <Grid bend={(tt) => (tt > 11.5 && tt < 14.5 ? 8 * prog(tt, 11.6, 14.4) : 0)} a={t > 11.5 && t < 14.5 ? prog(t, 11.6, 14.4) : 0} />
      {t < 7.0 && <SceneA />}
      {t >= 7.0 && t < 11.5 && <SceneB />}
      {t >= 11.5 && t < 14.5 && <SceneC />}
      {t >= 14.5 && <SceneD />}
    </AbsoluteFill>
  );
};
