import type { DynamicBackgroundConfig } from "./types";
import { OKLCH_PRESETS } from "./oklchColors";

export function createConfig(isMobileDevice: boolean): DynamicBackgroundConfig {
  return {
    // --- Blob Count & Sizing ---
    // Number of blobs to render. Lower values improve performance on low-end devices.
    numBlobs: isMobileDevice ? 3 : 4,

    // Size ranges for large and small blobs (in pixels, before scaling)
    baseLargeMinBlobSize: 1000,
    baseLargeMaxBlobSize: 1600,
    baseSmallMinBlobSize: 600,
    baseSmallMaxBlobSize: 1000,

    // --- Viewport Scaling ---
    // Reference width for scaling calculations (1440px is standard desktop)
    referenceWidth: 1440,
    // Limits for how much blobs scale up/down based on screen size
    minScaleFactor: 0.5,
    maxScaleFactor: 1.5,

    // --- Physics & Motion ---
    // Global speed multiplier for all movements
    speedMultiplier: isMobileDevice ? 0.5 : 1,
    // Opacity of the blobs (0-1)
    opacity: 0.8,
    // Enables organic shape morphing over time (CPU intensive)
    enableShapeChanging: false,

    // --- Interaction ---
    // Radius around mouse cursor that affects blobs
    mouseInfluenceRadius: 580,
    // Strength of repulsion (negative) or attraction (positive)
    mouseForce: -800,
    // Enable simple bounding box collision to prevent overlapping
    enableCollisionDetection: true,
    // Enable mouse repulsion effect
    enableMouseInteraction: true,

    // --- Color System ---
    // Configure separate color behaviors for Light and Dark modes.
    colors: {
      light: {
        // Strategy: "oklch-automatic" (Generative) or "manual-curated" (Fixed lists)
        strategy: "oklch-automatic",
        // Base Lightness (0-1) and Chroma (0-0.4) for generative colors
        preset: OKLCH_PRESETS.LIGHT,

        // Options for Automatic Strategy:
        // harmonySchemes: ["warm"], // Restrict to specific harmonies (e.g. "warm", "cool", "analogous")
        // baseHue: 180, // Force a specific base hue (0-360)

        // Options for Manual Strategy:
        // curatedSchemes: ["blues"], // Choose specific categories from predefined lists
        // customPalette: ["#FF0000", "#00FF00"], // Use exactly these hex colors
      },
      dark: {
        strategy: "oklch-automatic",
        preset: OKLCH_PRESETS.DARK,
        // Force all blobs to belong to a single randomly chosen color family (Monochromatic)
        // This creates a cleaner, more cohesive look in dark mode
        forceMonochrome: true,
      },
    },
  };
}
