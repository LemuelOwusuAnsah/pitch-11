import Phaser from 'phaser';
import { GameConfig } from '../core/GameConfig';

export const BALL_RADIUS_PX = 10;
const BALL_TEXTURE_KEY = 'ball-tex';

export class Ball {
  public readonly sprite: Phaser.Physics.Matter.Sprite;
  public readonly body: MatterJS.BodyType;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    ensureBallTexture(scene);
    const r = BALL_RADIUS_PX;

    this.sprite = scene.matter.add.sprite(x, y, BALL_TEXTURE_KEY);
    this.sprite.setCircle(r);
    this.sprite.setFrictionAir(0.02);
    this.sprite.setFriction(0.01);
    this.sprite.setBounce(0.7);
    this.sprite.setDensity(0.001);
    this.body = this.sprite.body as MatterJS.BodyType;
    this.body.label = 'ball';
  }

  public kick(aimX: number, aimY: number, power: number): void {
    const len = Math.sqrt(aimX * aimX + aimY * aimY);
    if (len < 0.001) return;
    const vx = (aimX / len) * power;
    const vy = (aimY / len) * power;
    this.sprite.setVelocity(vx, vy);
    this.sprite.setAngularVelocity(vx * 0.05);
  }

  public update(): void {
    return;
  }

  public reset(x: number, y: number): void {
    this.sprite.setPosition(x, y);
    this.sprite.setVelocity(0, 0);
    this.sprite.setAngularVelocity(0);
  }

  public get x(): number {
    return this.sprite.x;
  }

  public get y(): number {
    return this.sprite.y;
  }
}

function ensureBallTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(BALL_TEXTURE_KEY)) {
    return;
  }
  const r = BALL_RADIUS_PX;
  const size = r * 2;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2d context unavailable');
  }
  ctx.beginPath();
  ctx.arc(r, r, r - 1, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#111111';
  ctx.stroke();
  scene.textures.addCanvas(BALL_TEXTURE_KEY, canvas);
}
