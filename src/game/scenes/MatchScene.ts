import Phaser from 'phaser';
import { GameConfig, PitchWidthPx, PitchHeightPx } from '../core/GameConfig';

export class MatchScene extends Phaser.Scene {
  constructor() {
    super(GameConfig.sceneKeys.match);
  }

  public create(): void {
    const g = this.add.graphics();
    const stripeWidth = 100;

    for (let x = 0; x < PitchWidthPx; x += stripeWidth) {
      const isLight = Math.floor(x / stripeWidth) % 2 === 0;
      g.fillStyle(isLight ? GameConfig.colors.pitchLight : GameConfig.colors.pitchDark, 1);
      g.fillRect(x, 0, stripeWidth, PitchHeightPx);
    }

    g.lineStyle(4, GameConfig.colors.pitchLine, 1);
    g.strokeRect(0, 0, PitchWidthPx, PitchHeightPx);

    g.lineStyle(4, GameConfig.colors.pitchLine, 1);
    g.beginPath();
    g.moveTo(PitchWidthPx / 2, 0);
    g.lineTo(PitchWidthPx / 2, PitchHeightPx);
    g.strokePath();

    g.strokeCircle(PitchWidthPx / 2, PitchHeightPx / 2, 91 * GameConfig.pitch.pixelsPerMeter);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, PitchWidthPx, PitchHeightPx);
    cam.centerOn(PitchWidthPx / 2, PitchHeightPx / 2);

    this.add
      .text(PitchWidthPx / 2, PitchHeightPx / 2, 'PHASE 1', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '96px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(100);
  }
}
