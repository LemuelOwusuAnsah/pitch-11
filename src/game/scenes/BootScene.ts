import Phaser from 'phaser';
import { GameConfig } from '../core/GameConfig';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(GameConfig.sceneKeys.boot);
  }

  public preload(): void {
    return;
  }

  public create(): void {
    this.scene.start(GameConfig.sceneKeys.match);
  }
}
