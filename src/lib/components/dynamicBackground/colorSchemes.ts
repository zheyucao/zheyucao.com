import { generateHarmoniousPaletteColors, applyVariation, oklchToHex } from "./oklchColors";
import { shuffleArray } from "./utils";
import type { ColorScheme } from "./types";

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

export type ColorStrategy = "oklch-automatic" | "manual-curated";

/**
 * Pick initial colors for blobs, either using OKLCH generation or curated schemes.
 *
 * @param numBlobs - Number of blobs to color
 * @param strategy - "oklch-automatic" (default) or "manual-curated"
 * @returns Array of hex color strings
 */
export function pickInitialColors(
  numBlobs: number,
  strategy: ColorStrategy = "oklch-automatic"
): string[] {
  if (strategy === "manual-curated") {
    const schemeNames = Object.keys(curatedSchemes);
    const selectedSchemeName = schemeNames[Math.floor(Math.random() * schemeNames.length)];
    const availableColors = curatedSchemes[selectedSchemeName] || [];
    const shuffledColors = shuffleArray([...availableColors]);

    return Array.from(
      { length: numBlobs },
      (_, i) => shuffledColors[i % shuffledColors.length] || "#90EE90"
    );
  }

  // Fallback to OKLCH automatic generation
  // 1. Decide on the number of distinct color families (1 or 2 as per user preference)
  const familyCount = Math.random() > 0.5 ? 1 : 2;

  // 2. Generate the base colors for these families
  const baseFamilies = generateHarmoniousPaletteColors(familyCount);

  // 3. Generate individual blob colors
  // Assign each blob to a family and apply random variation
  return Array.from({ length: numBlobs }, (_, i) => {
    // Cycle through families
    const baseColor = baseFamilies[i % baseFamilies.length];

    // Apply variation:
    // - Lightness: ±0.06 (subtle brightness shift)
    // - Chroma: ±0.03 (subtle saturation shift)
    // - Hue: ±10 degrees (keeps it within the same "color family" but distinct)
    const variedColor = applyVariation(baseColor, {
      l: 0.12,
      c: 0.06,
      h: 20,
    });

    return oklchToHex(variedColor);
  });
}

export { curatedSchemes as colorScheme };
