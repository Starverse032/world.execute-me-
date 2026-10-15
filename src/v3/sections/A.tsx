// Section A, 44.452–88.60 s (f1334–f2657). Spec: docs/design_full.md, Section A.
// Each layer returns null outside the section.
//   A_pre.tsx    shots 19–24 (limit → DC → eye → dizzy → year axis → union/tunnel)
//   A_chorus.tsx shots 25, 27, 28 (spokes, happy face, globe)
//   A_verse.tsx  shots 29–32 (eggplant → tomato, radicals, cat)
//   A_char.tsx   character moments 3 (`reach`) and 4 (`float`)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useT} from '../core';
import {Svg} from '../geo';
import {A_F0, A_F1} from './A_lib';
import {PreChorus} from './A_pre';
import {Chorus} from './A_chorus';
import {Verse2} from './A_verse';
import {Moment4Stage, SectionAMoments} from './A_char';

const inRange = (frame: number) => frame >= A_F0 && frame <= A_F1;

// Stage geometry: dimmed to 60 % on keyword frames with the rest of the stage.
export const SectionA: React.FC = () => {
  const {t, frame} = useT();
  if (!inRange(frame)) return null;
  return (
    <AbsoluteFill>
      <Svg>
        <PreChorus t={t} frame={frame} />
        <Chorus t={t} frame={frame} />
        <Verse2 t={t} frame={frame} />
        <Moment4Stage t={t} frame={frame} />
      </Svg>
    </AbsoluteFill>
  );
};
// Character layer (not dimmed): her art for moments 3 and 4, with the
// construction drawn over it (that part takes the stage dim by hand).
export const SectionAChar: React.FC = () => {
  const {t, frame} = useT();
  if (!inRange(frame)) return null;
  return <SectionAMoments t={t} frame={frame} />;
};
// Anything that must sit above the composer, log, status line and header.
export const SectionATop: React.FC = () => null;
