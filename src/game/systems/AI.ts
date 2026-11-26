import type { Vec2 } from '../core/Math';
import { clamp, distance, normalize } from '../core/Math';

export type AiInput = {
  playerPos: Vec2;
  formationTarget: Vec2;
  ballPos: Vec2;
  activePlayerPos: Vec2;
  isNearestToBall: boolean;
  speed: number;
};

export type AiOutput = { vx: number; vy: number };

const CHASE_RADIUS = 260;
const ARRIVE_RADIUS = 12;
const POSSESS_RADIUS = 44;

export function computeAiVelocity(input: AiInput): AiOutput {
  const { playerPos, formationTarget, ballPos, activePlayerPos, isNearestToBall, speed } = input;

  const distToBall = distance(playerPos, ballPos);
  const activeDistToBall = distance(activePlayerPos, ballPos);

  if (distToBall < POSSESS_RADIUS) {
    return { vx: 0, vy: 0 };
  }

  const activeOwnsBall = activeDistToBall < distToBall - 20;

  let target: Vec2 = formationTarget;
  let targetSpeed = speed * 0.55;

  if (isNearestToBall && !activeOwnsBall && distToBall < CHASE_RADIUS) {
    target = ballPos;
    targetSpeed = speed * 0.85;
  } else if (distToBall < CHASE_RADIUS * 1.4) {
    const towardBall = normalize({
      x: ballPos.x - formationTarget.x,
      y: ballPos.y - formationTarget.y,
    });
    target = {
      x: formationTarget.x + towardBall.x * 60,
      y: formationTarget.y + towardBall.y * 60,
    };
  }

  const dx = target.x - playerPos.x;
  const dy = target.y - playerPos.y;
  const d = Math.hypot(dx, dy);

  if (d < ARRIVE_RADIUS) {
    return { vx: 0, vy: 0 };
  }

  const nx = dx / d;
  const ny = dy / d;
  const arrivalFactor = clamp(d / 40, 0, 1);
  const s = targetSpeed * arrivalFactor;

  return { vx: nx * s, vy: ny * s };
}
