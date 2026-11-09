import Phaser from 'phaser';
import { GameConfig, PitchWidthPx, PitchHeightPx } from '../core/GameConfig';
import { Ball } from '../entities/Ball';
import { Player } from '../entities/Player';
import { Input } from '../systems/Input';

export class MatchScene extends Phaser.Scene {
  private ball!: Ball;
  private activePlayer!: Player;
  private inputSystem!: Input;

  constructor() {
    super(GameConfig.sceneKeys.match);
  }

  public create(): void {
    this.drawPitch();

    const cx = PitchWidthPx / 2;
    const cy = PitchHeightPx / 2;

    this.ball = new Ball(this, cx, cy);
    this.activePlayer = new Player(this, cx - 60, cy, 'home-1', 'home', 1);
    this.activePlayer.setActive(true);

    this.inputSystem = new Input(this);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, PitchWidthPx, PitchHeightPx);
    cam.startFollow(this.ball.sprite, true, GameConfig.camera.lerp, GameConfig.camera.lerp);

    this.matter.world.setBounds(0, 0, PitchWidthPx, PitchHeightPx);

    this.input.keyboard?.on('keydown-P', () => {
      const b = this.ball.body;
      console.log('[DEBUG] ball', {
        x: b.position.x.toFixed(1),
        y: b.position.y.toFixed(1),
        vx: b.velocity.x.toFixed(1),
        vy: b.velocity.y.toFixed(1),
        isStatic: b.isStatic,
        isSleeping: b.isSleeping,
        mass: (b as unknown as { mass: number }).mass.toFixed(2),
        collisionFilter: b.collisionFilter,
      });
    });
  }

  public update(): void {
    const move = this.inputSystem.getMoveVector();
    const speed = 8;
    this.activePlayer.setVelocity(move.x * speed, move.y * speed);
    this.ball.update();
    this.activePlayer.update();
  }

  private drawPitch(): void {
    const g = this.add.graphics();
    const stripeWidth = 100;

    for (let x = 0; x < PitchWidthPx; x += stripeWidth) {
      const isLight = Math.floor(x / stripeWidth) % 2 === 0;
      g.fillStyle(isLight ? GameConfig.colors.pitchLight : GameConfig.colors.pitchDark, 1);
      g.fillRect(x, 0, stripeWidth, PitchHeightPx);
    }

    g.lineStyle(4, GameConfig.colors.pitchLine, 1);
    g.strokeRect(0, 0, PitchWidthPx, PitchHeightPx);
    g.beginPath();
    g.moveTo(PitchWidthPx / 2, 0);
    g.lineTo(PitchWidthPx / 2, PitchHeightPx);
    g.strokePath();
    g.strokeCircle(PitchWidthPx / 2, PitchHeightPx / 2, 91 * GameConfig.pitch.pixelsPerMeter);
  }
}
