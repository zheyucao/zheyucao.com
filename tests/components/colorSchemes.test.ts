import { describe, it, expect } from "vitest";
import { pickInitialColors } from "../../src/lib/components/dynamicBackground/colorSchemes";
import { OKLCH_PRESETS } from "../../src/lib/components/dynamicBackground/oklchColors";

describe("colorSchemes", () => {
  describe("pickInitialColors", () => {
    it("returns the requested number of colors", () => {
      const colors = pickInitialColors(10, { strategy: "oklch-automatic" });
      expect(colors).toHaveLength(10);
    });

    it("generates varied colors with automatic strategy", () => {
      const count = 20;
      const colors = pickInitialColors(count, { strategy: "oklch-automatic" });
      const uniqueColors = new Set(colors);

      // Auto strategy has variations enabled
      expect(uniqueColors.size).toBeGreaterThan(15);
      expect(colors).toHaveLength(count);
    });

    it("uses limited palette with manual strategy", () => {
      const count = 20;
      const colors = pickInitialColors(count, { strategy: "manual-curated" });
      const uniqueColors = new Set(colors);

      // Manual schemes have at most 6 colors, so we expect recycled colors
      expect(uniqueColors.size).toBeLessThanOrEqual(6);
      expect(colors).toHaveLength(count);
    });

    it("generates dark colors for dark mode", () => {
      const colors = pickInitialColors(10, {
        strategy: "oklch-automatic",
        preset: OKLCH_PRESETS.DARK,
        forceMonochrome: true,
      });

      // Check that colors are generally dark (low lightness)
      const isDark = colors.every((hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return (r + g + b) / 3 < 150; // < ~60% brightness
      });

      expect(isDark).toBe(true);
    });

    it("generates light colors for light mode", () => {
      const colors = pickInitialColors(10, {
        strategy: "oklch-automatic",
        preset: OKLCH_PRESETS.LIGHT,
      });

      // In light mode L=0.92. Channels should be high.
      const isLight = colors.every((hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return (r + g + b) / 3 > 140; // > ~55% brightness (accommodates vibrant colors)
      });

      expect(isLight).toBe(true);
    });

    it("uses custom palette when provided", () => {
      const customColors = ["#ABCDEF", "#123456"];
      const generated = pickInitialColors(10, {
        strategy: "manual-curated",
        customPalette: customColors,
      });

      const uniqueGenerated = new Set(generated);
      expect(uniqueGenerated.size).toBeLessThanOrEqual(2);
      expect(generated).toContain("#ABCDEF");
      expect(generated).toContain("#123456");
    });
  });
});
