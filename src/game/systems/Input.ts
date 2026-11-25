import Phaser from 'phaser';
import { GameConfig } from '../core/GameConfig';

export type MoveVector = { x: number; y: number };
export type AimVector = { x: number; y: number };

export class Input {
  private readonly scene: Phaser.Scene;
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly wasd: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  private charging = false;
  private chargeStartMs = 0;
  private mouseWorld: AimVector = { x: 0, y: 0 };
  private kickPending = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard input not available');
    }

    this.cursors = keyboard.createCursorKeys();
    this.wasd = keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Input['wasd'];

    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.charging = true;
        this.chargeStartMs = performance.now();
      }
    });

    scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.charging && pointer.button === 0) {
        this.charging = false;
        this.kickPending = true;
      }
    });

    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const world = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.mouseWorld = { x: world.x, y: world.y };
    });
  }

  public getMoveVector(): MoveVector {
    const x =
      (this.cursors.right.isDown || this.wasd.right.isDown ? 1 : 0) -
      (this.cursors.left.isDown || this.wasd.left.isDown ? 1 : 0);
    const y =
      (this.cursors.down.isDown || this.wasd.down.isDown ? 1 : 0) -
      (this.cursors.up.isDown || this.wasd.up.isDown ? 1 : 0);

    if (x === 0 && y === 0) {
      return { x: 0, y: 0 };
    }

    const len = Math.sqrt(x * x + y * y);
    return { x: x / len, y: y / len };
  }

  public isCharging(): boolean {
    return this.charging;
  }

  public getChargeRatio(): number {
    if (!this.charging) return 0;
    const elapsed = performance.now() - this.chargeStartMs;
    return Math.min(1, elapsed / GameConfig.kick.chargeTimeMs);
  }

  public getChargePower(): number {
    const ratio = this.getChargeRatio();
    return GameConfig.kick.minPower + (GameConfig.kick.maxPower - GameConfig.kick.minPower) * ratio;
  }

  public getMouseWorld(): AimVector {
    return this.mouseWorld;
  }

  public getAimFrom(playerX: number, playerY: number): AimVector {
    const dx = this.mouseWorld.x - playerX;
    const dy = this.mouseWorld.y - playerY;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.001) return { x: 1, y: 0 };
    return { x: dx / len, y: dy / len };
  }

  public consumeKick(): { power: number; aim: AimVector } | null {
    if (!this.kickPending) return null;
    this.kickPending = false;
    const elapsed = performance.now() - this.chargeStartMs;
    const ratio = Math.min(1, elapsed / GameConfig.kick.chargeTimeMs);
    const power = GameConfig.kick.minPower + (GameConfig.kick.maxPower - GameConfig.kick.minPower) * ratio;
    return { power, aim: this.mouseWorld };
  }
}
