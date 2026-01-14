import { describe, it, expect } from "vitest";
import { pickInitialColors } from "../../src/lib/components/dynamicBackground/colorSchemes";

describe("colorSchemes", () => {
  describe("pickInitialColors", () => {
    it("returns the requested number of colors", () => {
      const colors = pickInitialColors(10);
      expect(colors).toHaveLength(10);
    });

    it("generates varied colors with automatic strategy", () => {
      const count = 20;
      const colors = pickInitialColors(count, "oklch-automatic");
      const uniqueColors = new Set(colors);

      // Auto strategy has variations enabled
      expect(uniqueColors.size).toBeGreaterThan(15);
      expect(colors).toHaveLength(count);
    });

    it("uses limited palette with manual strategy", () => {
      const count = 20;
      const colors = pickInitialColors(count, "manual-curated");
      const uniqueColors = new Set(colors);

      // Manual schemes have at most 6 colors, so we expect recycled colors
      expect(uniqueColors.size).toBeLessThanOrEqual(6);
      expect(colors).toHaveLength(count);
    });
  });
});
