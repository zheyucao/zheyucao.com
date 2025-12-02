import { random } from "./utils";
import type { Vector } from "./types";

export interface BlobGeometry {
  points: Vector[];
  angles: number[];
  radii: number[];
}

export function createBlobPoints(
  cx: number,
  cy: number,
  r: number,
  irr: number,
  spk: number,
  num: number
): BlobGeometry {
  const points: Vector[] = [];
  const angles: number[] = [];
  const radii: number[] = [];
  const angleStep = (Math.PI * 2) / num;
  for (let i = 0; i < num; i++) {
    const angle = i * angleStep;
    angles.push(angle);
    let radius = r + random(-irr, irr) * r;
    radius += random(0, spk) * r;
    radius = Math.max(r * 0.2, radius);
    radii.push(radius);
    points.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
  }
  return { points, angles, radii };
}

export function buildPathFromPoints(points: Vector[]): Path2D {
  const path = new Path2D();
  if (points.length < 3) return path;

  path.moveTo(points[0].x, points[0].y);
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
  path.closePath();
  return path;
}
