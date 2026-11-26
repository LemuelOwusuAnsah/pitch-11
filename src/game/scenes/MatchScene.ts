import Phaser from 'phaser';
import { GameConfig, PitchWidthPx, PitchHeightPx } from '../core/GameConfig';
import { Ball } from '../entities/Ball';
import { Player } from '../entities/Player';
import { Goal } from '../entities/Goal';
import { Input } from '../systems/Input';
import { computeAiVelocity } from '../systems/AI';
import { Formation442 } from '../data/Team';
import { placeFormation } from '../systems/Formation';
import { distance } from '../core/Math';

declare global {
  interface Window {
    __PHASER_GAME__?: Phaser.Game;
  }
}

type Score = { home: number; away: number };
type FormationSlot = { pos: { x: number; y: number } };

export class MatchScene extends Phaser.Scene {
  private ball!: Ball;
  private activePlayer!: Player;
  private homePlayers: Player[] = [];
  private homeSlots: FormationSlot[] = [];
  private inputSystem!: Input;
  private leftGoal!: Goal;
  private rightGoal!: Goal;
  private score: Score = { home: 0, away: 0 };
  private goalCooldown = false;

  private powerBarBg!: Phaser.GameObjects.Graphics;
  private powerBarFill!: Phaser.GameObjects.Graphics;
  private hudHome!: Phaser.GameObjects.Text;
  private hudAway!: Phaser.GameObjects.Text;
  private hudDivider!: Phaser.GameObjects.Text;

  constructor() {
    super(GameConfig.sceneKeys.match);
  }

  public create(): void {
    this.drawPitch();

    const cx = PitchWidthPx / 2;
    const cy = PitchHeightPx / 2;

    this.leftGoal = new Goal(this, 'left', PitchWidthPx, PitchHeightPx);
    this.rightGoal = new Goal(this, 'right', PitchWidthPx, PitchHeightPx);

    this.ball = new Ball(this, cx, cy);

    const placements = placeFormation(
      Formation442,
      'home',
      { widthPx: PitchWidthPx, heightPx: PitchHeightPx },
      120
    );
    this.homeSlots = placements.map((p) => ({ pos: p.pos }));

    const startIdx = this.findClosestSlotToBall(cx, cy);
    this.homePlayers = placements.map((p, i) => {
      const isActive = i === startIdx;
      const player = new Player(this, p.pos.x, p.pos.y, 'home-' + i, 'home', i + 1);
      player.setActive(isActive);
      if (isActive) this.activePlayer = player;
      return player;
    });

    this.inputSystem = new Input(this);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, PitchWidthPx, PitchHeightPx);
    cam.startFollow(this.ball.sprite, true, GameConfig.camera.lerp, GameConfig.camera.lerp);

    this.buildWalls();
    this.buildPowerBar();
    this.buildHud();
  }

  private findClosestSlotToBall(bx: number, by: number): number {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < this.homeSlots.length; i++) {
      const slot = this.homeSlots[i];
      if (!slot) continue;
      const d = distance({ x: bx, y: by }, slot.pos);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  }

  private buildWalls(): void {
    const t = 40;
    const W = PitchWidthPx;
    const H = PitchHeightPx;
    const rTop = this.rightGoal.mouthTopY;
    const rBottom = this.rightGoal.mouthBottomY;
    const lTop = this.leftGoal.mouthTopY;
    const lBottom = this.leftGoal.mouthBottomY;

    this.matter.world.add(this.matter.bodies.rectangle(W / 2, -t / 2, W + t * 2, t, { isStatic: true }));
    this.matter.world.add(this.matter.bodies.rectangle(W / 2, H + t / 2, W + t * 2, t, { isStatic: true }));
    this.matter.world.add(this.matter.bodies.rectangle(-t / 2, lTop / 2, t, lTop, { isStatic: true }));
    this.matter.world.add(this.matter.bodies.rectangle(-t / 2, lBottom + (H - lBottom) / 2, t, H - lBottom, { isStatic: true }));
    this.matter.world.add(this.matter.bodies.rectangle(-80, H / 2, t, lBottom - lTop + t, { isStatic: true }));
    this.matter.world.add(this.matter.bodies.rectangle(W + t / 2, rTop / 2, t, rTop, { isStatic: true }));
    this.matter.world.add(this.matter.bodies.rectangle(W + t / 2, rBottom + (H - rBottom) / 2, t, H - rBottom, { isStatic: true }));
    this.matter.world.add(this.matter.bodies.rectangle(W + 80, H / 2, t, rBottom - rTop + t, { isStatic: true }));
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
    this.scale.on('resize', () => {
      this.positionPowerBar();
      this.positionHud();
    });
  }

  private positionPowerBar(): void {
    const cam = this.cameras.main;
    this.powerBarBg.setPosition(cam.width / 2, cam.height - 40);
    this.powerBarFill.setPosition(cam.width / 2 - GameConfig.kick.powerBarWidth / 2, cam.height - 40);
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
    this.powerBarFill.fillRoundedRect(0, -h / 2, Math.max(1, Math.floor(w * ratio)), h, 3);
  }

  private buildHud(): void {
    const style = {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
    } as const;
    this.hudHome = this.add.text(0, 0, '0', style).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
    this.hudDivider = this.add.text(0, 0, '\u2013', style).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
    this.hudAway = this.add.text(0, 0, '0', style).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
    this.positionHud();
  }

  private positionHud(): void {
    const cam = this.cameras.main;
    const cx = cam.width / 2;
    this.hudHome.setPosition(cx - 30, 32);
    this.hudDivider.setPosition(cx, 32);
    this.hudAway.setPosition(cx + 30, 32);
  }

  private updateHud(): void {
    this.hudHome.setText(String(this.score.home));
    this.hudAway.setText(String(this.score.away));
  }

  public update(): void {
    const move = this.inputSystem.getMoveVector();
    const speed = 8;
    this.activePlayer.setVelocity(move.x * speed, move.y * speed);

    this.updateAi();
    this.ball.update();
    this.homePlayers.forEach((p) => p.update());

    this.handleKick();
    this.updatePowerBar();

    if (!this.goalCooldown) {
      this.checkGoals();
    }
  }

  private updateAi(): void {
    const ballPos = { x: this.ball.x, y: this.ball.y };
    let nearestIdx = -1;
    let nearestDist = Infinity;
    for (let i = 0; i < this.homePlayers.length; i++) {
      const p = this.homePlayers[i];
      if (!p || p.isActive) continue;
      const d = distance({ x: p.x, y: p.y }, ballPos);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    }
    for (let i = 0; i < this.homePlayers.length; i++) {
      const p = this.homePlayers[i];
      const slot = this.homeSlots[i];
      if (!p || !slot || p.isActive) continue;
      const out = computeAiVelocity({
        playerPos: { x: p.x, y: p.y },
        formationTarget: slot.pos,
        ballPos,
        activePlayerPos: { x: this.activePlayer.x, y: this.activePlayer.y },
        isNearestToBall: i === nearestIdx,
        speed: 8,
      });
      p.setVelocity(out.vx, out.vy);
    }
  }

  private checkGoals(): void {
    if (this.rightGoal.checkBall(this.ball.x, this.ball.y)) {
      this.onGoal('home');
      return;
    }
    if (this.leftGoal.checkBall(this.ball.x, this.ball.y)) {
      this.onGoal('away');
    }
  }

  private handleKick(): void {
    const kick = this.inputSystem.consumeKick();
    if (!kick) return;
    const px = this.activePlayer.x;
    const py = this.activePlayer.y;
    const bx = this.ball.x;
    const by = this.ball.y;
    if (Math.hypot(bx - px, by - py) > GameConfig.kick.possessionRadius) return;
    this.ball.kick(kick.aim.x - px, kick.aim.y - py, kick.power);
  }

  private onGoal(scoringSide: 'home' | 'away'): void {
    this.goalCooldown = true;
    if (scoringSide === 'home') this.score.home += 1;
    else this.score.away += 1;
    this.updateHud();
    this.time.delayedCall(1500, () => {
      this.resetPositions();
      this.goalCooldown = false;
    });
  }

  private resetPositions(): void {
    const cx = PitchWidthPx / 2;
    const cy = PitchHeightPx / 2;
    this.ball.reset(cx, cy);
    for (let i = 0; i < this.homePlayers.length; i++) {
      const p = this.homePlayers[i];
      const slot = this.homeSlots[i];
      if (!p || !slot) continue;
      p.sprite.setPosition(slot.pos.x, slot.pos.y);
      p.sprite.setVelocity(0, 0);
      p.sprite.setAngularVelocity(0);
      p.update();
    }
  }

  private drawPitch(): void {
    const g = this.add.graphics();
    for (let x = 0; x < PitchWidthPx; x += 100) {
      const isLight = Math.floor(x / 100) % 2 === 0;
      g.fillStyle(isLight ? GameConfig.colors.pitchLight : GameConfig.colors.pitchDark, 1);
      g.fillRect(x, 0, 100, PitchHeightPx);
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
