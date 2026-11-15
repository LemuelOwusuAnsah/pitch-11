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
    const key = `player-${team}-tex`;
    ensurePlayerTexture(scene, key, team);
    const r = PLAYER_RADIUS_PX;

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

function ensurePlayerTexture(scene: Phaser.Scene, key: string, team: Team): void {
  if (scene.textures.exists(key)) {
    return;
  }
  const r = PLAYER_RADIUS_PX;
  const size = r * 2;
  const fill = team === 'home' ? '#1e88e5' : '#e53935';
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2d context unavailable');
  }
  ctx.beginPath();
  ctx.arc(r, r, r - 1, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000000';
  ctx.stroke();
  scene.textures.addCanvas(key, canvas);
}
