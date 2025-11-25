/**
 * DynamicBackground Math Helpers
 * Pure mathematical functions for vector operations and blob behavior
 * All functions are pure - no side effects, fully testable
 */

export interface Vector {
  x: number;
  y: number;
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: HSLColor;
  points: Vector[];
  basePoints: Vector[];
  offset: number;
  angleOffset: number;
}

/**
 * Generate a random number between min and max
 */
export function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Normalize a vector to unit length
 */
export function normalize(v: Vector): Vector {
  const mag = Math.sqrt(v.x * v.x + v.y * v.y);
  if (mag === 0) return { x: 0, y: 0 };
  return { x: v.x / mag, y: v.y / mag };
}

/**
 * Add two vectors
 */
export function addVectors(v1: Vector, v2: Vector): Vector {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}

/**
 * Multiply vector by scalar
 */
export function multiplyVector(v: Vector, scalar: number): Vector {
  return { x: v.x * scalar, y: v.y * scalar };
}

/**
 * Generate blob control points for smooth organic shapes
 */
export function generateBlobPoints(numPoints: number, radius: number): Vector[] {
  const points: Vector[] = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const radiusVariation = random(0.8, 1.2);
    const r = radius * radiusVariation;
    points.push({
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
    });
  }
  return points;
}

/**
 * Update blob points with organic wobble animation
 */
export function updateBlobPoints(
  basePoints: Vector[],
  offset: number,
  angleOffset: number,
  noiseScale: number = 0.15
): Vector[] {
  return basePoints.map((point, index) => {
    const angle = (index / basePoints.length) * Math.PI * 2 + angleOffset;
    const wobble = Math.sin(offset + angle * 3) * noiseScale;
    return {
      x: point.x * (1 + wobble),
      y: point.y * (1 + wobble),
    };
  });
}

/**
 * Apply mouse force to blob velocity
 */
export function applyMouseForce(
  blob: Blob,
  mousePos: Vector | null,
  mouseInfluenceRadius: number,
  mouseForce: number
): { vx: number; vy: number } {
  if (!mousePos) return { vx: blob.vx, vy: blob.vy };

  const dist = distance(blob.x, blob.y, mousePos.x, mousePos.y);

  if (dist < mouseInfluenceRadius && dist > 1) {
    const force = (mouseInfluenceRadius - dist) / mouseInfluenceRadius;
    const angle = Math.atan2(blob.y - mousePos.y, blob.x - mousePos.x);
    const forceX = Math.cos(angle) * mouseForce * force;
    const forceY = Math.sin(angle) * mouseForce * force;

    return {
      vx: blob.vx + forceX,
      vy: blob.vy + forceY,
    };
  }

  return { vx: blob.vx, vy: blob.vy };
}

/**
 * Apply screen boundary constraints
 */
export function applyBoundaryConstraints(
  blob: Blob,
  width: number,
  height: number,
  margin: number = 100
): { vx: number; vy: number } {
  let { vx, vy } = blob;

  if (blob.x < -margin) vx += 0.001;
  if (blob.x > width + margin) vx -= 0.001;
  if (blob.y < -margin) vy += 0.001;
  if (blob.y > height + margin) vy -= 0.001;

  return { vx, vy };
}

/**
 * Apply velocity damping
 */
export function applyDamping(
  vx: number,
  vy: number,
  damping: number = 0.99
): { vx: number; vy: number } {
  return {
    vx: vx * damping,
    vy: vy * damping,
  };
}

/**
 * Check if two blobs are colliding
 */
export function checkCollision(blob1: Blob, blob2: Blob): boolean {
  const dist = distance(blob1.x, blob1.y, blob2.x, blob2.y);
  return dist < blob1.radius + blob2.radius;
}

/**
 * Resolve collision between two blobs
 */
export function resolveCollision(
  blob1: Blob,
  blob2: Blob
): {
  blob1Velocity: { vx: number; vy: number };
  blob2Velocity: { vx: number; vy: number };
} {
  const dx = blob2.x - blob1.x;
  const dy = blob2.y - blob1.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) {
    return {
      blob1Velocity: { vx: blob1.vx, vy: blob1.vy },
      blob2Velocity: { vx: blob2.vx, vy: blob2.vy },
    };
  }

  const nx = dx / dist;
  const ny = dy / dist;

  const relVx = blob2.vx - blob1.vx;
  const relVy = blob2.vy - blob1.vy;
  const velAlongNormal = relVx * nx + relVy * ny;

  if (velAlongNormal > 0) {
    return {
      blob1Velocity: { vx: blob1.vx, vy: blob1.vy },
      blob2Velocity: { vx: blob2.vx, vy: blob2.vy },
    };
  }

  const restitution = 0.8;
  const impulse = (-(1 + restitution) * velAlongNormal) / 2;

  return {
    blob1Velocity: {
      vx: blob1.vx - impulse * nx,
      vy: blob1.vy - impulse * ny,
    },
    blob2Velocity: {
      vx: blob2.vx + impulse * nx,
      vy: blob2.vy + impulse * ny,
    },
  };
}
