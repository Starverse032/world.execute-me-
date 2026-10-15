// Section C1 (docs/design_full.md Section C, shots C1–C13), 131.2333–177.30 s
// (f3937–f5319): the ILLEGAL ARGUMENTS crash, the instrumental rebuild
// (lattice, globe, point engine, dial), the EXECUTION ×12 climax with pose cuts,
// the count, EXECUTION #13 and the dark final chorus up to "We are trapped ah".
// Each layer returns null outside its frames.
//   C1_build.tsx   C1–C4  crash, lattice, globe, points
//   C1_climax.tsx  C4–C8  spark → dial, pose cuts, count hexagon, shockwave
//   C1_chorus.tsx  C9–C13 24 you-circles, return path, world, walls, exit dot
import React from 'react';
import {useT} from '../core';
import {Svg} from '../geo';
import {BuildGeo, PointsC4, Strike} from './C1_build';
import {ClimaxRings, PoseCut, ReturnDot, SparkDial} from './C1_climax';
import {Chorus, LAST_F} from './C1_chorus';

const F0 = 3937; // ILLEGAL ARGUMENTS hit (B draws through f3936)
const inC1 = (frame: number) => frame >= F0 && frame <= LAST_F;

// Stage geometry: dimmed to 60 % on keyword frames with the rest of the stage.
export const SectionC1: React.FC = () => {
  const {t, frame} = useT();
  if (!inC1(frame)) return null;
  return (
    <>
      <Svg>
        <BuildGeo t={t} frame={frame} />
      </Svg>
      <PointsC4 t={t} frame={frame} />
      <Svg>
        <ClimaxRings t={t} frame={frame} />
        <SparkDial t={t} frame={frame} />
        <ReturnDot t={t} />
        <Chorus t={t} frame={frame} />
      </Svg>
    </>
  );
};

// Character layers: the 12 climax pose cuts (panels L / R), never dimmed.
export const SectionC1Char: React.FC = () => {
  const {t, frame} = useT();
  if (!inC1(frame)) return null;
  return <PoseCut t={t} frame={frame} />;
};

// Above the keyword and the UI: the strike line through ILLEGAL ARGUMENTS.
export const SectionC1Top: React.FC = () => {
  const {t, frame} = useT();
  if (!inC1(frame)) return null;
  return (
    <Svg>
      <Strike t={t} frame={frame} />
    </Svg>
  );
};
