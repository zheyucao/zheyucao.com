/**
 * DynamicBackground SVG Renderer
 * Pure SVG rendering functions - no DOM mutations, returns SVG strings
 */

import type { Blob, Vector } from "./math";

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Create SVG path data from blob points using smooth curves
 */
export function createBlobPath(points: Vector[], centerX: number, centerY: number): string {
  if (points.length === 0) return "";

  let path = `M ${centerX + points[0].x} ${centerY + points[0].y}`;

  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    const controlX = centerX + (current.x + next.x) / 2;
    const controlY = centerY + (current.y + next.y) / 2;

    path += ` Q ${centerX + current.x} ${centerY + current.y}, ${controlX} ${controlY}`;
  }

  path += " Z";
  return path;
}

/**
 * Convert HSL color object to CSS string
 */
export function hslToString(color: { h: number; s: number; l: number }): string {
  return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
}

/**
 * Create an SVG path element for a blob
 */
export function createBlobElement(blob: Blob, opacity: number): SVGPathElement {
  const pathElement = document.createElementNS(SVG_NS, "path") as SVGPathElement;
  const pathData = createBlobPath(blob.points, blob.x, blob.y);

  pathElement.setAttribute("d", pathData);
  pathElement.setAttribute("fill", hslToString(blob.color));
  pathElement.setAttribute("opacity", opacity.toString());
  pathElement.style.filter = "blur(80px)";

  return pathElement;
}

/**
 * Update an existing SVG path element with new blob data
 */
export function updateBlobElement(pathElement: SVGPathElement, blob: Blob): void {
  const pathData = createBlobPath(blob.points, blob.x, blob.y);
  pathElement.setAttribute("d", pathData);
}

/**
 * Create SVG container group with all blobs
 */
export function createBlobGroup(blobs: Blob[], opacity: number): SVGGElement {
  const group = document.createElementNS(SVG_NS, "g") as SVGGElement;

  blobs.forEach((blob) => {
    const pathElement = createBlobElement(blob, opacity);
    group.appendChild(pathElement);
  });

  return group;
}
