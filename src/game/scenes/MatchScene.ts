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

  private powerBarBg!: Phaser.GameObjects.Graphics;
  private powerBarFill!: Phaser.GameObjects.Graphics;

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
    this.buildPowerBar();
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

  private buildPowerBar(): void {
    const w = GameConfig.kick.powerBarWidth;
    const h = GameConfig.kick.powerBarHeight;
    this.powerBarBg = this.add.graphics();
    this.powerBarBg.fillStyle(0x000000, 0.5);
    this.powerBarBg.fillRoundedRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4, 4);
    this.powerBarBg.setScrollFactor(0);
    this.powerBarBg.setDepth(1000);
    this.powerBarBg.setVisible(false);

    this.powerBarFill = this.add.graphics();
    this.powerBarFill.setScrollFactor(0);
    this.powerBarFill.setDepth(1001);
    this.powerBarFill.setVisible(false);

    this.positionPowerBar();
    this.scale.on('resize', () => this.positionPowerBar());
  }

  private positionPowerBar(): void {
    const cam = this.cameras.main;
    const x = cam.width / 2;
    const y = cam.height - 40;
    this.powerBarBg.setPosition(x, y);
    this.powerBarFill.setPosition(x - GameConfig.kick.powerBarWidth / 2, y);
  }

  private updatePowerBar(): void {
    const charging = this.inputSystem.isCharging();
    this.powerBarBg.setVisible(charging);
    this.powerBarFill.setVisible(charging);
    if (!charging) return;

    const ratio = this.inputSystem.getChargeRatio();
    const w = GameConfig.kick.powerBarWidth;
    const h = GameConfig.kick.powerBarHeight;
    const color = ratio < 0.5 ? 0x3fb950 : ratio < 0.85 ? 0xf59e0b : 0xef4444;

    this.powerBarFill.clear();
    this.powerBarFill.fillStyle(color, 1);
    const fillWidth = Math.max(1, Math.floor(w * ratio));
    this.powerBarFill.fillRoundedRect(0, -h / 2, fillWidth, h, 3);
  }

  public update(): void {
    const move = this.inputSystem.getMoveVector();
    const speed = 8;
    this.activePlayer.setVelocity(move.x * speed, move.y * speed);
    this.ball.update();
    this.activePlayer.update();

    this.handleKick();
    this.updatePowerBar();

    const bx = this.ball.x;
    const by = this.ball.y;

    if (this.rightGoal.checkBall(bx, by) || bx > PitchWidthPx + 100) {
      this.onGoal();
    }
  }

  private handleKick(): void {
    const kick = this.inputSystem.consumeKick();
    if (!kick) return;

    const px = this.activePlayer.x;
    const py = this.activePlayer.y;
    const bx = this.ball.x;
    const by = this.ball.y;
    const dist = Math.hypot(bx - px, by - py);

    if (dist > GameConfig.kick.possessionRadius) {
      return;
    }

    const aimDx = kick.aim.x - px;
    const aimDy = kick.aim.y - py;
    this.ball.kick(aimDx, aimDy, kick.power);
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
