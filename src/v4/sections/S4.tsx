// Section 4: Aftermath, love and deletion, 162.63–211.96 s (docs/design_v4.md §4 S4).
//   S4_chorus.tsx  162.63–177.2  broken final chorus, reconnect attempts, the cage
//   S4_love.tsx    177.2–191.4   LOVE(7), question/answer, the heart equation, free/trapped;
//                                 plus the stage + her un-plotting during the outro
//   S4_outro.tsx   190.8–211.96  chrome back, eight deletions, EXECUTION, exit 0
//   s4.data.ts                    times, boxes, entries, shared-grid config
// Renders nothing outside [162.13, 212.46]; the first drawn frame is 4879 (162.633).
import React from 'react';
import {useT} from '../../v3/core';
import {preloadPoses} from '../char/LineArt';
import {S4_T0, S4_T1} from './s4.data';
import {S4Chorus} from './S4_chorus';
import {S4Love} from './S4_love';
import {S4Outro} from './S4_outro';

preloadPoses('face_sad', 'profile', 'sit');

export const Section4: React.FC = () => {
  const {t} = useT();
  if (t < S4_T0 - 0.5 || t > S4_T1 + 0.5) return null;
  return (
    <>
      <S4Chorus />
      <S4Love />
      <S4Outro />
    </>
  );
};
