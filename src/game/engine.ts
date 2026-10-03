import { getTile, type MazeLevel } from '@/data/levels/types';
import type { TiltVector } from '@/game/sensors';

export type BallPoint = { x: number; y: number };
export type BallVelocity = { x: number; y: number };

export type PhysicsStep = {
  position: BallPoint;
  velocity: BallVelocity;
  fell: boolean;
  won: boolean;
};

/** Physics values are in tile units, so the game scales to different screens. */
const GRAVITY = 24;
const FRICTION = 2.6;
const MAX_SPEED = 3.2;
const BALL_RADIUS = 0.2;
const HOLE_RADIUS = 0.31;

export function getStartPosition(level: MazeLevel): BallPoint {
  return { x: level.start.x + 0.5, y: level.start.y + 0.5 };
}

function collidesWithWall(level: MazeLevel, x: number, y: number): boolean {
  const minColumn = Math.floor(x - BALL_RADIUS);
  const maxColumn = Math.floor(x + BALL_RADIUS);
  const minRow = Math.floor(y - BALL_RADIUS);
  const maxRow = Math.floor(y + BALL_RADIUS);

  for (let row = minRow; row <= maxRow; row += 1) {
    for (let column = minColumn; column <= maxColumn; column += 1) {
      if (getTile(level, column, row) !== '#') {
        continue;
      }

      const nearestX = Math.max(column, Math.min(x, column + 1));
      const nearestY = Math.max(row, Math.min(y, row + 1));
      const dx = x - nearestX;
      const dy = y - nearestY;
      if (dx * dx + dy * dy < BALL_RADIUS * BALL_RADIUS) {
        return true;
      }
    }
  }

  return false;
}

function clampSpeed(velocity: BallVelocity): BallVelocity {
  const speed = Math.hypot(velocity.x, velocity.y);
  if (speed <= MAX_SPEED) {
    return velocity;
  }
  const ratio = MAX_SPEED / speed;
  return { x: velocity.x * ratio, y: velocity.y * ratio };
}

/**
 * Advances the ball by one frame using gravity from the calibrated tilt,
 * friction, circle-vs-wall collision, and hole/goal checks.
 */
export function stepBall(
  level: MazeLevel,
  position: BallPoint,
  velocity: BallVelocity,
  tilt: TiltVector,
  deltaSeconds: number,
): PhysicsStep {
  const dt = Math.max(0, Math.min(deltaSeconds, 0.05));
  if (dt === 0) {
    return { position, velocity, fell: false, won: false };
  }

  const frictionFactor = Math.exp(-FRICTION * dt);
  const nextVelocity = clampSpeed({
    x: (velocity.x + tilt.x * GRAVITY * dt) * frictionFactor,
    // Positive y is downward, matching the direction of travel on screen.
    y: (velocity.y + tilt.y * GRAVITY * dt) * frictionFactor,
  });

  let nextX = position.x + nextVelocity.x * dt;
  let nextY = position.y;
  let velocityX = nextVelocity.x;
  let velocityY = nextVelocity.y;

  if (collidesWithWall(level, nextX, nextY)) {
    nextX = position.x;
    velocityX = 0;
  }

  nextY = position.y + velocityY * dt;
  if (collidesWithWall(level, nextX, nextY)) {
    nextY = position.y;
    velocityY = 0;
  }

  const nextPosition = { x: nextX, y: nextY };
  const tileColumn = Math.floor(nextX);
  const tileRow = Math.floor(nextY);
  const tile = getTile(level, tileColumn, tileRow);

  if (tile === 'O') {
    const holeX = tileColumn + 0.5;
    const holeY = tileRow + 0.5;
    if (Math.hypot(nextX - holeX, nextY - holeY) <= HOLE_RADIUS) {
      return {
        position: getStartPosition(level),
        velocity: { x: 0, y: 0 },
        fell: true,
        won: false,
      };
    }
  }

  return {
    position: nextPosition,
    velocity: { x: velocityX, y: velocityY },
    fell: false,
    won: tile === 'G',
  };
}
