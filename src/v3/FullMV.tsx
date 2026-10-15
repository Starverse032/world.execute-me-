// world.execute(me); full MV, "Plotted Session" (minimal geometric), 0:00-3:31.96.
// Same layer order as the demo (docs/design_v3.md §7); 0-44.45 s are the demo
// shots, the rest is built per section in sections/. Section C draws the
// closing fade itself (SectionCTop).
import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {K, SONG, useT} from './core';
import {AUTO_FROM} from './data';
import {Composer, Grid, Header, LogZone, StageKeyword, stageDim, StatusLine} from './ui';
import {Intro} from './shots/Intro';
import {Execute} from './shots/Execute';
import {Points} from './shots/Points';
import {Verse} from './shots/Verse';
import {SectionA, SectionAChar, SectionATop} from './sections/A';
import {SectionB, SectionBChar, SectionBTop} from './sections/B';
import {SectionC, SectionCChar, SectionCTop} from './sections/C';

export const FULL_FRAMES = Math.ceil(SONG * 30);

const Stage: React.FC = () => {
  const {t} = useT();
  return (
    <AbsoluteFill style={{opacity: stageDim(t)}}>
      <Intro />
      <Execute />
      <Points />
      {t < AUTO_FROM && <Verse full />}
      <SectionA />
      <SectionB />
      <SectionC />
    </AbsoluteFill>
  );
};

export const FullMV: React.FC = () => (
  <AbsoluteFill style={{background: K.bg}}>
    <Audio src={staticFile('song.mp3')} />
    <Grid />
    <Stage />
    <SectionAChar />
    <SectionBChar />
    <SectionCChar />
    <StageKeyword />
    <LogZone />
    <StatusLine />
    <Composer />
    <Header />
    <SectionATop />
    <SectionBTop />
    <SectionCTop />
  </AbsoluteFill>
);
