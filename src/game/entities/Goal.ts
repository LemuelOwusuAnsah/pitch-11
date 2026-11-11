import Phaser from 'phaser';
import { GameConfig } from '../core/GameConfig';

export type Side = 'left' | 'right';

export class Goal {
  public readonly side: Side;
  public readonly mouthTopY: number;
  public readonly mouthBottomY: number;
  public readonly lineX: number;
  public readonly graphics: Phaser.GameObjects.Graphics;
  public readonly backX: number;

  constructor(scene: Phaser.Scene, side: Side, pitchWidthPx: number, pitchHeightPx: number) {
    this.side = side;
    const goalWidthPx = 7.32 * GameConfig.pitch.pixelsPerMeter;
    this.mouthTopY = pitchHeightPx / 2 - goalWidthPx / 2;
    this.mouthBottomY = pitchHeightPx / 2 + goalWidthPx / 2;
    this.lineX = side === 'left' ? 0 : pitchWidthPx;

    const depth = 60;
    const dir = side === 'left' ? -1 : 1;
    this.backX = this.lineX + dir * depth;

    const g = scene.add.graphics();
    g.lineStyle(4, GameConfig.colors.pitchLine, 1);
    const boxWidth = 16.5 * GameConfig.pitch.pixelsPerMeter;
    const boxHeight = 40.32 * GameConfig.pitch.pixelsPerMeter;
    const boxX = side === 'left' ? 0 : pitchWidthPx - boxWidth;
    const boxY = pitchHeightPx / 2 - boxHeight / 2;
    g.strokeRect(boxX, boxY, boxWidth, boxHeight);

    g.lineStyle(3, GameConfig.colors.pitchLine, 1);
    g.beginPath();
    g.moveTo(this.lineX, this.mouthTopY);
    g.lineTo(this.backX, this.mouthTopY);
    g.lineTo(this.backX, this.mouthBottomY);
    g.lineTo(this.lineX, this.mouthBottomY);
    g.strokePath();
    g.lineBetween(this.backX, this.mouthTopY, this.backX, this.mouthBottomY);
    g.lineStyle(1, GameConfig.colors.pitchLine, 0.5);
    for (let y = this.mouthTopY + 6; y < this.mouthBottomY; y += 6) {
      g.lineBetween(this.lineX, y, this.backX, y);
    }
    this.graphics = g;
  }

  public checkBall(ballX: number, ballY: number): boolean {
    if (ballY < this.mouthTopY || ballY > this.mouthBottomY) {
      return false;
    }
    if (this.side === 'left' && ballX <= this.lineX) {
      return true;
    }
    if (this.side === 'right' && ballX >= this.lineX) {
      return true;
    }
    return false;
  }
}
