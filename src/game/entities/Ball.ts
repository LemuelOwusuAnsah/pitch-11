import Phaser from 'phaser';
import { GameConfig } from '../core/GameConfig';

export const BALL_RADIUS_PX = 10;

export class Ball {
  public readonly sprite: Phaser.Physics.Matter.Sprite;
  public readonly body: MatterJS.BodyType;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const r = BALL_RADIUS_PX;
    const g = scene.add.graphics();
    g.fillStyle(GameConfig.colors.ball, 1);
    g.fillCircle(r, r, r);
    g.lineStyle(2, GameConfig.colors.ballOutline, 1);
    g.strokeCircle(r, r, r);
    g.generateTexture('ball-tex', r * 2, r * 2);
    g.destroy();

    this.sprite = scene.matter.add.sprite(x, y, 'ball-tex');
    this.sprite.setCircle(r);
    this.sprite.setFrictionAir(0.02);
    this.sprite.setFriction(0.01);
    this.sprite.setBounce(0.7);
    this.sprite.setDensity(0.001);
    this.body = this.sprite.body as MatterJS.BodyType;
    this.body.label = 'ball';
  }

  public update(): void {
    return;
  }

  public reset(x: number, y: number): void {
    this.sprite.setPosition(x, y);
    this.sprite.setVelocity(0, 0);
    this.sprite.setAngularVelocity(0);
  }
}
