// Section 3: Out of control, 131.22–162.63 s (docs/design_v4.md §4 S3).
//  131.22–147.66  the search: Claude alone, processes fork until the UI is a swarm (S3_search)
//  147.66–155.20  EXECUTION rounds 1 and 2: clean execution, then she breaks (S3_exec)
//  155.20–162.63  round 3 flood, the count in six languages, the final hit (S3_flood)
// S3 draws its own background grid (the shared one is off while S3 owns the time):
// the grid needs an anomaly that drops to 0 for round 1, which GridProps.a can't vary.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ease, prog, useT} from '../../v3/core';
import {anomaly} from '../chaos';
import {Grid, Ripple} from '../shell/Grid';
import {charCentre, Rounds} from './S3_exec';
import {Flood3} from './S3_flood';
import {Search} from './S3_search';
import {FINAL, FORK, HITS, SPAWN, T0, T1} from './s3.data';

const RIPPLES: Ripple[] = HITS.slice(0, 8).map((h, k) => {
  const [cx, cy] = charCentre(k);
  return {t: h, cx, cy, v: 2200, w: 60, tau: 0.5};
});

const gridA = (t: number) => (t < HITS[0] ? anomaly(t) : t < HITS[4] ? 0 : 0.55);
const gridBend = (t: number) => {
  if (t < HITS[0]) return 30 * prog(t, SPAWN[0], HITS[0], ease.inCubic);
  if (t < HITS[4]) return 0;
  return 5;
};

export const Section3: React.FC = () => {
  const {t} = useT();
  if (t < T0 || t >= T1) return null;
  return (
    <AbsoluteFill>
      {t < FINAL && (
        <Grid
          a={gridA(t)}
          bend={gridBend}
          every={(tt) => (tt < SPAWN[0] - 0.1 || tt >= HITS[0] ? 0 : tt < FORK[0] ? 2 : 1)}
          ripples={RIPPLES}
        />
      )}
      {t < HITS[0] && <Search />}
      {t >= HITS[0] && t < HITS[8] && <Rounds />}
      {t >= HITS[8] && <Flood3 />}
    </AbsoluteFill>
  );
};
