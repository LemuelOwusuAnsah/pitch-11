import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { MatchScene } from '../scenes/MatchScene';

let instance: Phaser.Game | null = null;

export function startGame(parent: HTMLElement): Phaser.Game {
  if (instance) {
    return instance;
  }

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#0b0d10',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: '100%',
      height: '100%',
    },
    physics: {
      default: 'matter',
      matter: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    render: {
      antialias: true,
      pixelArt: false,
    },
    scene: [BootScene, MatchScene],
  };

  instance = new Phaser.Game(config);
  return instance;
}

export function getGame(): Phaser.Game | null {
  return instance;
}
