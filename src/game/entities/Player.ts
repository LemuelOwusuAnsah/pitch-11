import Phaser from 'phaser';
import { GameConfig } from '../core/GameConfig';

export const PLAYER_RADIUS_PX = 14;

export type Team = 'home' | 'away';

export class Player {
  public readonly sprite: Phaser.Physics.Matter.Sprite;
  public readonly body: MatterJS.BodyType;
  public readonly ring: Phaser.GameObjects.Arc;
  public readonly numberLabel: Phaser.GameObjects.Text;
  public isActive: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public readonly id: string,
    public readonly team: Team,
    public readonly number: number
  ) {
    const r = PLAYER_RADIUS_PX;
    const key = `player-${team}-${id}`;
    const fillColor = team === 'home' ? GameConfig.colors.home : GameConfig.colors.away;

    const g = scene.add.graphics();
    g.fillStyle(fillColor, 1);
    g.fillCircle(r, r, r);
    g.lineStyle(2, 0x000000, 1);
    g.strokeCircle(r, r, r);
    g.generateTexture(key, r * 2, r * 2);
    g.destroy();

    this.sprite = scene.matter.add.sprite(x, y, key);
    this.sprite.setCircle(r);
    this.sprite.setFrictionAir(0.05);
    this.sprite.setFriction(0.05);
    this.sprite.setBounce(0.2);
    this.sprite.setDensity(0.005);
    this.sprite.setFixedRotation();
    this.body = this.sprite.body as MatterJS.BodyType;
    this.body.label = `player:${team}:${id}`;

    this.ring = scene.add.circle(x, y, r + 4);
    this.ring.setStrokeStyle(3, GameConfig.colors.activeRing);
    this.ring.setVisible(false);

    this.numberLabel = scene.add
      .text(x, y, String(number), {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
  }

  public update(): void {
    this.ring.setPosition(this.sprite.x, this.sprite.y);
    this.numberLabel.setPosition(this.sprite.x, this.sprite.y);
  }

  public setActive(active: boolean): void {
    this.isActive = active;
    this.ring.setVisible(active);
  }

  public setVelocity(vx: number, vy: number): void {
    this.sprite.setVelocity(vx, vy);
  }

  public get x(): number {
    return this.sprite.x;
  }

  public get y(): number {
    return this.sprite.y;
  }

  public distanceTo(x: number, y: number): number {
    return Phaser.Math.Distance.Between(this.x, this.y, x, y);
  }
}
