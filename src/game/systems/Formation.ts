import type { Vec2 } from '../core/Math';
import type { Formation, TeamSide } from '../data/Team';

export type PitchRect = { widthPx: number; heightPx: number };

export type FormationPlacement = {
  slotIndex: number;
  pos: Vec2;
};

export function placeFormation(
  formation: Formation,
  side: TeamSide,
  pitch: PitchRect,
  marginPx: number
): FormationPlacement[] {
  const usableW = pitch.widthPx - marginPx * 2;
  const usableH = pitch.heightPx - marginPx * 2;

  return formation.slots.map((slot, i) => {
    const normalizedX = side === 'home' ? slot.x : 1 - slot.x;
    return {
      slotIndex: i,
      pos: {
        x: marginPx + normalizedX * usableW,
        y: marginPx + slot.y * usableH,
      },
    };
  });
}
