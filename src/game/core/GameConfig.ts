export const GameConfig = {
  pitch: {
    widthMeters: 105,
    heightMeters: 68,
    pixelsPerMeter: 20,
  },
  colors: {
    pitchDark: 0x2e7d32,
    pitchLight: 0x388e3c,
    pitchLine: 0xffffff,
    home: 0x1e88e5,
    away: 0xe53935,
    ball: 0xffffff,
    ballOutline: 0x111111,
    activeRing: 0xffc107,
    text: 0xffffff,
  },
  camera: {
    lerp: 0.08,
  },
  sceneKeys: {
    boot: 'BootScene',
    match: 'MatchScene',
  },
} as const;

export const PitchWidthPx = GameConfig.pitch.widthMeters * GameConfig.pitch.pixelsPerMeter;
export const PitchHeightPx = GameConfig.pitch.heightMeters * GameConfig.pitch.pixelsPerMeter;
