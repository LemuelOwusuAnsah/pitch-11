export type TeamSide = 'home' | 'away';

export type FormationSlot = { x: number; y: number };

export type Formation = {
  name: string;
  slots: ReadonlyArray<FormationSlot>;
};

export type TeamDef = {
  id: string;
  name: string;
  side: TeamSide;
  primary: number;
  secondary: number;
  formation: Formation;
};

export const Formation442: Formation = {
  name: '4-4-2',
  slots: [
    { x: 0.05, y: 0.5 },
    { x: 0.2, y: 0.2 },
    { x: 0.2, y: 0.4 },
    { x: 0.2, y: 0.6 },
    { x: 0.2, y: 0.8 },
    { x: 0.4, y: 0.2 },
    { x: 0.4, y: 0.4 },
    { x: 0.4, y: 0.6 },
    { x: 0.4, y: 0.8 },
    { x: 0.6, y: 0.35 },
    { x: 0.6, y: 0.65 },
  ],
};

export const HomeTeam: TeamDef = {
  id: 'home',
  name: 'Home',
  side: 'home',
  primary: 0x1e88e5,
  secondary: 0xffffff,
  formation: Formation442,
};

export const AwayTeam: TeamDef = {
  id: 'away',
  name: 'Away',
  side: 'away',
  primary: 0xe53935,
  secondary: 0x111111,
  formation: Formation442,
};

export function mirrorFormation(f: Formation): Formation {
  return {
    name: f.name,
    slots: f.slots.map((s) => ({ x: 1 - s.x, y: s.y })),
  };
}
