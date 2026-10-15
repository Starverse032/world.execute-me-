// Section C2 (see docs/design_full.md C14–C22), 177.246–211.96 s, frames
// 5317–6358. Each layer returns null outside its frames.
//   C2_love.tsx   C14–C18 moment 7 (read), function panels, heart, sit in the heart
//   C2_points.tsx the 1210-point engine (read → panels; sit → heart fill → F)
//   C2_end.tsx    C19–C22 figure F, the pieces, the seed, the final spark, the fade
import React from 'react';
import {useT} from '../core';
import {HeartGroup, MomentRead, Panels, YouCircle} from './C2_love';
import {C2_POINTS_FROM, C2_POINTS_TO, PointCanvas} from './C2_points';
import {ClosingFade, Figure, Seed} from './C2_end';

const F0 = 5317;

// Stage geometry (dimmed to 60 % on keyword frames): the function panels and the free "you".
export const SectionC2: React.FC = () => {
  const {t, frame} = useT();
  if (frame < F0) return null;
  return (
    <>
      <Panels t={t} frame={frame} />
      <YouCircle t={t} />
    </>
  );
};

// Character layer (never dimmed): her art and points, the heart group, figure F,
// the seed and the final spark.
export const SectionC2Char: React.FC = () => {
  const {t, frame} = useT();
  if (frame < F0) return null;
  return (
    <>
      <MomentRead t={t} frame={frame} />
      {t >= C2_POINTS_FROM - 0.001 && t < C2_POINTS_TO && <PointCanvas t={t} frame={frame} />}
      <HeartGroup t={t} frame={frame} />
      <Figure t={t} />
      <Seed t={t} frame={frame} />
    </>
  );
};

// Above all UI: the closing fade (210.00–211.60) with the spark fading last (211.00–211.90).
export const SectionC2Top: React.FC = () => {
  const {t, frame} = useT();
  if (frame < F0) return null;
  return <ClosingFade t={t} />;
};
