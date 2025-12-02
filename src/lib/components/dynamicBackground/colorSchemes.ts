import { shuffleArray } from "./utils";
import type { ColorScheme } from "./types";

const colorScheme: ColorScheme = {
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

export function pickInitialColors(numBlobs: number): string[] {
  const schemeNames = Object.keys(colorScheme);
  const selectedSchemeName = schemeNames[Math.floor(Math.random() * schemeNames.length)];
  const availableColors = colorScheme[selectedSchemeName] || [];
  const shuffledColors = shuffleArray([...availableColors]);

  return Array.from({ length: numBlobs }, (_, i) => shuffledColors[i % shuffledColors.length] || "#90EE90");
}

export { colorScheme };
