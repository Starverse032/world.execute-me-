// world.execute(me); MV v2, "The Session" (docs/design_v4.md). 0:00–3:31.96.
// Layers: background, the shared Grid (controlled per section through the
// GRID export of sections/s<n>.data.ts), then the five sections in order.
import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {K, useT} from '../v3/core';
import './fonts';
import {Grid, GridProps} from './shell/Grid';
import {sectionAt} from './timeline';
import {Section0} from './sections/S0';
import {Section1} from './sections/S1';
import {Section2} from './sections/S2';
import {Section3} from './sections/S3';
import {Section4} from './sections/S4';
import {GRID as G0} from './sections/s0.data';
import {GRID as G1} from './sections/s1.data';
import {GRID as G2} from './sections/s2.data';
import {GRID as G3} from './sections/s3.data';
import {GRID as G4} from './sections/s4.data';

const GRIDS: GridProps[] = [G0, G1, G2, G3, G4];

const SharedGrid: React.FC = () => {
  const {t} = useT();
  return <Grid {...GRIDS[sectionAt(t)]} />;
};

export const FullMV2: React.FC = () => (
  <AbsoluteFill style={{background: K.bg, overflow: 'hidden'}}>
    <Audio src={staticFile('song.mp3')} />
    <SharedGrid />
    <Section0 />
    <Section1 />
    <Section2 />
    <Section3 />
    <Section4 />
  </AbsoluteFill>
);
