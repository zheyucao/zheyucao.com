/**
 * OKLCH Color Space Utilities
 *
 * OKLCH is a perceptually uniform color space with:
 * - L (Lightness): 0-1
 * - C (Chroma): 0-0.4+ (saturation intensity)
 * - H (Hue): 0-360 degrees
 *
 * This module provides conversion functions and gamut mapping
 * to generate guaranteed good-looking colors.
 */

import type { OKLCHColor } from "./types";

// ============================================================================
// OKLCH → Oklab → Linear sRGB → sRGB Pipeline
// ============================================================================

/**
 * Convert OKLCH to Oklab (intermediate step)
 */
function oklchToOklab(oklch: OKLCHColor): { L: number; a: number; b: number } {
  const hRad = (oklch.h * Math.PI) / 180;
  return {
    L: oklch.l,
    a: oklch.c * Math.cos(hRad),
    b: oklch.c * Math.sin(hRad),
  };
}

/**
 * Convert Oklab to linear sRGB
 * Uses the official Oklab transformation matrix
 */
function oklabToLinearSrgb(oklab: { L: number; a: number; b: number }): {
  r: number;
  g: number;
  b: number;
} {
  const { L, a, b } = oklab;

  // Oklab to LMS (cone responses)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  // Cube to get linear LMS
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // LMS to linear sRGB
  return {
    r: +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

/**
 * Apply sRGB gamma correction (linear → sRGB)
 */
function linearToSrgb(c: number): number {
  if (c <= 0.0031308) {
    return 12.92 * c;
  }
  return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/**
 * Check if a linear sRGB value is within gamut [0, 1]
 */
function isInGamut(r: number, g: number, b: number): boolean {
  const epsilon = 0.0001;
  return (
    r >= -epsilon &&
    r <= 1 + epsilon &&
    g >= -epsilon &&
    g <= 1 + epsilon &&
    b >= -epsilon &&
    b <= 1 + epsilon
  );
}

/**
 * Clamp an OKLCH color to sRGB gamut by reducing chroma
 * Uses binary search for efficiency
 */
export function clampToGamut(color: OKLCHColor): OKLCHColor {
  const oklab = oklchToOklab(color);
  const linear = oklabToLinearSrgb(oklab);

  if (isInGamut(linear.r, linear.g, linear.b)) {
    return color;
  }

  // Binary search for maximum in-gamut chroma
  let low = 0;
  let high = color.c;
  let result = { ...color, c: 0 };

  for (let i = 0; i < 16; i++) {
    const mid = (low + high) / 2;
    const testColor = { ...color, c: mid };
    const testOklab = oklchToOklab(testColor);
    const testLinear = oklabToLinearSrgb(testOklab);

    if (isInGamut(testLinear.r, testLinear.g, testLinear.b)) {
      result = testColor;
      low = mid;
    } else {
      high = mid;
    }
  }

  return result;
}

/**
 * Convert OKLCH to hex color string
 * Automatically clamps to sRGB gamut
 */
export function oklchToHex(color: OKLCHColor): string {
  const clamped = clampToGamut(color);
  const oklab = oklchToOklab(clamped);
  const linear = oklabToLinearSrgb(oklab);

  // Convert to sRGB and clamp to [0, 1]
  const r = Math.max(0, Math.min(1, linearToSrgb(linear.r)));
  const g = Math.max(0, Math.min(1, linearToSrgb(linear.g)));
  const b = Math.max(0, Math.min(1, linearToSrgb(linear.b)));

  // Convert to hex
  const toHex = (c: number) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// ============================================================================
// Color Harmony Generation
// ============================================================================

export type HarmonyScheme =
  | "analogous"
  | "complementary"
  | "triadic"
  | "tetradic"
  | "split-complementary"
  | "warm"
  | "cool";

/**
 * Get hue offsets for a given harmony scheme
 */
function getHueOffsets(scheme: HarmonyScheme, count: number): number[] {
  switch (scheme) {
    case "analogous":
      // Colors within ±40° of base - cohesive and safe
      // Reduced step from 25 to 20 for tighter cohesion
      return Array.from({ length: count }, (_, i) => ((i - Math.floor(count / 2)) * 20) % 360);

    case "complementary":
      // Base and opposite, with variations
      return Array.from(
        { length: count },
        (_, i) => (i % 2 === 0 ? 0 : 180) + (i > 1 ? (i - 1) * 10 : 0)
      );

    case "triadic":
      // Three colors evenly spaced (120° apart)
      return Array.from({ length: count }, (_, i) => (i * 120) % 360);

    case "tetradic":
      // Four colors evenly spaced (90° apart)
      return Array.from({ length: count }, (_, i) => (i * 90) % 360);

    case "split-complementary":
      // Base + two colors adjacent to complement
      return [
        0,
        150,
        210,
        ...Array.from({ length: Math.max(0, count - 3) }, (_, i) => 25 * (i + 1)),
      ];

    case "warm":
      // Reds, oranges, yellows (0-60°)
      return Array.from({ length: count }, (_, i) => (i * 15) % 60);

    case "cool":
      // Blues, cyans, greens (180-300°)
      return Array.from({ length: count }, (_, i) => 180 + ((i * 20) % 120));

    default:
      return Array.from({ length: count }, (_, i) => (i * (360 / count)) % 360);
  }
}

// Default OKLCH parameters for vibrant, balanced colors
const DEFAULT_LIGHTNESS = 0.78;
const DEFAULT_CHROMA = 0.14;

// Available harmony schemes with weights for random selection
// Higher weights = more likely to be selected
// We prefer analogous/warm/cool for background blobs as they blend more smoothly
const WEIGHTED_SCHEMES: { scheme: HarmonyScheme; weight: number }[] = [
  { scheme: "analogous", weight: 5 },
  { scheme: "warm", weight: 3 },
  { scheme: "cool", weight: 3 },
  { scheme: "split-complementary", weight: 2 },
  { scheme: "triadic", weight: 1 },
  { scheme: "complementary", weight: 1 },
];

function pickWeightedScheme(): HarmonyScheme {
  const totalWeight = WEIGHTED_SCHEMES.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const { scheme, weight } of WEIGHTED_SCHEMES) {
    random -= weight;
    if (random <= 0) return scheme;
  }
  return "analogous"; // Fallback
}

/**
 * Generate a harmonious color palette using OKLCH
 *
 * @param count - Number of colors to generate
 * @param options - Optional customization
 * @returns Array of hex color strings
 */
/**
 * Generate a harmonious color palette using OKLCH (returning color objects)
 *
 * @param count - Number of colors to generate
 * @param options - Optional customization
 * @returns Array of OKLCHColor objects
 */
export function generateHarmoniousPaletteColors(
  count: number,
  options?: {
    baseHue?: number;
    scheme?: HarmonyScheme;
    lightness?: number;
    chroma?: number;
  }
): OKLCHColor[] {
  const baseHue = options?.baseHue ?? Math.random() * 360;
  const scheme = options?.scheme ?? pickWeightedScheme();
  const baseLightness = options?.lightness ?? DEFAULT_LIGHTNESS;
  const baseChroma = options?.chroma ?? DEFAULT_CHROMA;

  const hueOffsets = getHueOffsets(scheme, count);

  return hueOffsets.map((offset) => ({
    l: baseLightness,
    c: baseChroma,
    h: (baseHue + offset + 360) % 360,
  }));
}

/**
 * Apply random variation to an OKLCH color
 */
export function applyVariation(
  color: OKLCHColor,
  variation: { l: number; c: number; h: number }
): OKLCHColor {
  return {
    l: color.l + (Math.random() - 0.5) * variation.l,
    c: Math.max(0, color.c + (Math.random() - 0.5) * variation.c),
    h: (color.h + (Math.random() - 0.5) * variation.h + 360) % 360,
  };
}

/**
 * Generate a harmonious color palette using OKLCH
 *
 * @param count - Number of colors to generate
 * @param options - Optional customization
 * @returns Array of hex color strings
 */
export function generateHarmoniousPalette(
  count: number,
  options?: {
    baseHue?: number;
    scheme?: HarmonyScheme;
    lightness?: number;
    chroma?: number;
  }
): string[] {
  const colors = generateHarmoniousPaletteColors(count, options);

  // Apply default variation for the string-based API
  return colors.map((c) => oklchToHex(applyVariation(c, { l: 0.08, c: 0.04, h: 0 })));
}
