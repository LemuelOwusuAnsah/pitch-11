import Phaser from 'phaser';
import { GameConfig, PitchWidthPx, PitchHeightPx } from '../core/GameConfig';
import { Ball } from '../entities/Ball';
import { Player } from '../entities/Player';
import { Goal } from '../entities/Goal';
import { Input } from '../systems/Input';

declare global {
  interface Window {
    __PHASER_GAME__?: Phaser.Game;
  }
}

export class MatchScene extends Phaser.Scene {
  private ball!: Ball;
  private activePlayer!: Player;
  private inputSystem!: Input;
  private rightGoal!: Goal;
  private kickoffX = 0;
  private kickoffY = 0;

  constructor() {
    super(GameConfig.sceneKeys.match);
  }

  public create(): void {
    this.drawPitch();

    const cx = PitchWidthPx / 2;
    const cy = PitchHeightPx / 2;
    this.kickoffX = cx - 60;
    this.kickoffY = cy;

    this.rightGoal = new Goal(this, 'right', PitchWidthPx, PitchHeightPx);

    this.ball = new Ball(this, cx, cy);
    this.activePlayer = new Player(this, this.kickoffX, this.kickoffY, 'home-1', 'home', 1);
    this.activePlayer.setActive(true);

    this.inputSystem = new Input(this);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, PitchWidthPx, PitchHeightPx);
    cam.startFollow(this.ball.sprite, true, GameConfig.camera.lerp, GameConfig.camera.lerp);

    this.buildWalls();
  }

  private buildWalls(): void {
    const t = 40;
    const W = PitchWidthPx;
    const H = PitchHeightPx;
    const top = this.rightGoal.mouthTopY;
    const bottom = this.rightGoal.mouthBottomY;

    this.matter.world.add(
      this.matter.bodies.rectangle(W / 2, -t / 2, W + t * 2, t, { isStatic: true })
    );
    this.matter.world.add(
      this.matter.bodies.rectangle(W / 2, H + t / 2, W + t * 2, t, { isStatic: true })
    );
    this.matter.world.add(
      this.matter.bodies.rectangle(-t / 2, H / 2, t, H, { isStatic: true })
    );
    this.matter.world.add(
      this.matter.bodies.rectangle(W + t / 2, top / 2, t, top, { isStatic: true })
    );
    this.matter.world.add(
      this.matter.bodies.rectangle(W + t / 2, bottom + (H - bottom) / 2, t, H - bottom, { isStatic: true })
    );
    this.matter.world.add(
      this.matter.bodies.rectangle(W + 80, H / 2, t, bottom - top + t, { isStatic: true })
    );
  }

  public update(): void {
    const move = this.inputSystem.getMoveVector();
    const speed = 8;
    this.activePlayer.setVelocity(move.x * speed, move.y * speed);
    this.ball.update();
    this.activePlayer.update();

    const bx = this.ball.sprite.x;
    const by = this.ball.sprite.y;

    if (this.rightGoal.checkBall(bx, by) || bx > PitchWidthPx + 100) {
      this.onGoal();
    }
  }

  private onGoal(): void {
    console.log('[GOAL] ball crossed the right goal line');
    const cx = PitchWidthPx / 2;
    const cy = PitchHeightPx / 2;
    this.ball.reset(cx, cy);

    this.activePlayer.sprite.setPosition(this.kickoffX, this.kickoffY);
    this.activePlayer.sprite.setVelocity(0, 0);
    this.activePlayer.sprite.setAngularVelocity(0);
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
