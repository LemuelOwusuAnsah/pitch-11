import type { Vec2 } from '../core/Math';
import { distance } from '../core/Math';

export type Possessor = {
  playerId: string;
  team: 'home' | 'away';
  distancePx: number;
};

export type PossessionCandidate = {
  id: string;
  team: 'home' | 'away';
  pos: Vec2;
};

export function findPossessor(
  ballPos: Vec2,
  candidates: ReadonlyArray<PossessionCandidate>,
  captureRadiusPx: number
): Possessor | null {
  let best: Possessor | null = null;
  for (const c of candidates) {
    const d = distance(ballPos, c.pos);
    if (d > captureRadiusPx) {
      continue;
    }
    if (!best || d < best.distancePx) {
      best = { playerId: c.id, team: c.team, distancePx: d };
    }
  }
  return best;
}
