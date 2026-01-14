import { generateHarmoniousPaletteColors, applyVariation, oklchToHex } from "./oklchColors";
import { shuffleArray } from "./utils";
import type { ColorScheme, ColorModeConfig } from "./types";

const curatedSchemes: ColorScheme = {
  reds: ["#FF6B6B", "#FFD93D", "#F2bF47", "#F2B707", "#F28706", "#F26430"],
  oranges: ["#FFa700", "#FF9B58", "#F27149", "#F9c443", "#faD93D"],
  yellows: ["#FFD700", "#FFDB58", "#F2E109", "#F9D423", "#caD93D"],
  greens: ["#90EE90", "#6BCB77", "#3CB371", "#32CD32", "#a0e9c4"],
  cyans: ["#40E0D0", "#AFEEEE", "#7FFFD4", "#B3E0F2", "#9EfDF2"],
  blues: ["#87CEEB", "#64f5ED", "#7De6FF", "#42d5FF", "#7299f9"],
  forest: ["#64f5ED", "#F2E109", "#32CD32", "#32CD32", "#a0e9c4"],
  purples: ["#996BcB", "#c2aFF7", "#8267d7", "#FF55ff", "#e264d0"],
  browns: ["#8B4513", "#A0522D", "#D2691E", "#DAA520", "#8B3030"],
  winter: ["#87CEEB", "#64f5ED", "#7De6FF", "#cccccc", "#ffffff"],
};

/**
 * Pick initial colors for blobs based on configuration
 *
 * @param numBlobs - Number of blobs to color
 * @param config - Color configuration (strategy, limits, presets)
 * @returns Array of hex color strings
 */
export function pickInitialColors(numBlobs: number, config: ColorModeConfig): string[] {
  if (config.strategy === "manual-curated") {
    // Priority: Custom Palette > Curated Schemes > Fallback
    if (config.customPalette && config.customPalette.length > 0) {
      const shuffled = shuffleArray([...config.customPalette]);
      return Array.from({ length: numBlobs }, (_, i) => shuffled[i % shuffled.length]);
    }

    // Determine allowed schemes
    const allSchemeNames = Object.keys(curatedSchemes);
    let allowedNames = allSchemeNames;

    if (config.curatedSchemes && config.curatedSchemes.length > 0) {
      // Filter validation
      allowedNames = config.curatedSchemes.filter((name) => allSchemeNames.includes(name));
      if (allowedNames.length === 0) allowedNames = allSchemeNames; // Fallback
    }

    const selectedSchemeName = allowedNames[Math.floor(Math.random() * allowedNames.length)];
    const availableColors = curatedSchemes[selectedSchemeName] || [];
    const shuffledColors = shuffleArray([...availableColors]);

    return Array.from(
      { length: numBlobs },
      (_, i) => shuffledColors[i % shuffledColors.length] || "#90EE90"
    );
  }

  // Fallback to OKLCH automatic generation
  // 1. Decide on the number of distinct color families
  const familyCount = config.forceMonochrome ? 1 : Math.random() > 0.5 ? 1 : 2;

  // 2. Select Harmony Scheme (if restricted)
  let selectedHarmonyScheme = undefined;
  if (config.harmonySchemes && config.harmonySchemes.length > 0) {
    selectedHarmonyScheme =
      config.harmonySchemes[Math.floor(Math.random() * config.harmonySchemes.length)];
  }

  // 3. Generate the base colors for these families
  const baseFamilies = generateHarmoniousPaletteColors(familyCount, {
    lightness: config.preset?.lightness,
    chroma: config.preset?.chroma,
    scheme: selectedHarmonyScheme,
    baseHue: config.baseHue, // Use fixed base hue if provided
  });

  // 4. Generate individual blob colors
  // Assign each blob to a family and apply random variation
  return Array.from({ length: numBlobs }, (_, i) => {
    // Cycle through families
    const baseColor = baseFamilies[i % baseFamilies.length];

    // Apply variation:
    // - Lightness: ±0.12 (increased range)
    // - Chroma: ±0.06
    // - Hue: ±20 degrees
    const variedColor = applyVariation(baseColor, {
      l: 0.12,
      c: 0.06,
      h: 20,
    });

    return oklchToHex(variedColor);
  });
}

export { curatedSchemes as colorScheme };
