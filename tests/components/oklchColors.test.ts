import { describe, it, expect } from "vitest";
import {
  oklchToHex,
  clampToGamut,
  generateHarmoniousPalette,
  type HarmonyScheme,
} from "../../src/lib/components/dynamicBackground/oklchColors";
import type { OKLCHColor } from "../../src/lib/components/dynamicBackground/types";

describe("oklchColors", () => {
  describe("oklchToHex", () => {
    it("converts a known OKLCH color to expected hex range", () => {
      // Pure red in OKLCH (approximate)
      const red: OKLCHColor = { l: 0.63, c: 0.26, h: 29 };
      const hex = oklchToHex(red);

      // Should be a valid hex color
      expect(hex).toMatch(/^#[0-9A-F]{6}$/);

      // Should be red-ish (high R, low G and B)
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      expect(r).toBeGreaterThan(200);
      expect(g).toBeLessThan(100);
      expect(b).toBeLessThan(100);
    });

    it("converts neutral gray correctly", () => {
      // Gray: zero chroma
      const gray: OKLCHColor = { l: 0.5, c: 0, h: 0 };
      const hex = oklchToHex(gray);

      expect(hex).toMatch(/^#[0-9A-F]{6}$/);

      // All channels should be roughly equal (gray)
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);

      expect(Math.abs(r - g)).toBeLessThan(5);
      expect(Math.abs(g - b)).toBeLessThan(5);
    });

    it("handles black and white", () => {
      const black: OKLCHColor = { l: 0, c: 0, h: 0 };
      const white: OKLCHColor = { l: 1, c: 0, h: 0 };

      expect(oklchToHex(black)).toBe("#000000");
      expect(oklchToHex(white)).toBe("#FFFFFF");
    });
  });

  describe("clampToGamut", () => {
    it("returns in-gamut colors unchanged", () => {
      const inGamut: OKLCHColor = { l: 0.7, c: 0.1, h: 120 };
      const clamped = clampToGamut(inGamut);

      expect(clamped.l).toBe(inGamut.l);
      expect(clamped.c).toBe(inGamut.c);
      expect(clamped.h).toBe(inGamut.h);
    });

    it("reduces chroma for out-of-gamut colors", () => {
      // Very high chroma that would be out of sRGB gamut
      const outOfGamut: OKLCHColor = { l: 0.9, c: 0.4, h: 270 };
      const clamped = clampToGamut(outOfGamut);

      // Lightness and hue should be preserved
      expect(clamped.l).toBe(outOfGamut.l);
      expect(clamped.h).toBe(outOfGamut.h);

      // Chroma should be reduced
      expect(clamped.c).toBeLessThan(outOfGamut.c);
      expect(clamped.c).toBeGreaterThanOrEqual(0);
    });

    it("preserves zero chroma", () => {
      const noChroma: OKLCHColor = { l: 0.5, c: 0, h: 180 };
      const clamped = clampToGamut(noChroma);

      expect(clamped.c).toBe(0);
    });
  });

  describe("generateHarmoniousPalette", () => {
    it("generates requested number of colors", () => {
      const palette = generateHarmoniousPalette(5);
      expect(palette).toHaveLength(5);
    });

    it("generates valid hex colors", () => {
      const palette = generateHarmoniousPalette(8);
      palette.forEach((color) => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/);
      });
    });

    it("respects specified harmony scheme", () => {
      const schemes: HarmonyScheme[] = [
        "analogous",
        "complementary",
        "triadic",
        "tetradic",
        "split-complementary",
        "warm",
        "cool",
      ];

      schemes.forEach((scheme) => {
        const palette = generateHarmoniousPalette(4, { scheme });
        expect(palette).toHaveLength(4);
        palette.forEach((color) => {
          expect(color).toMatch(/^#[0-9A-F]{6}$/);
        });
      });
    });

    it("respects specified base hue", () => {
      // With analogous scheme, colors should be close to base hue
      const palette1 = generateHarmoniousPalette(3, {
        baseHue: 0,
        scheme: "analogous",
      });
      const palette2 = generateHarmoniousPalette(3, {
        baseHue: 180,
        scheme: "analogous",
      });

      // Palettes with different base hues should produce different colors
      expect(palette1).not.toEqual(palette2);
    });

    it("generates unique colors within a palette", () => {
      const palette = generateHarmoniousPalette(6);
      const uniqueColors = new Set(palette);

      // Most colors should be unique (allowing for some collisions due to gamut clamping)
      expect(uniqueColors.size).toBeGreaterThanOrEqual(4);
    });

    it("customization options work correctly", () => {
      const palette = generateHarmoniousPalette(3, {
        lightness: 0.9,
        chroma: 0.05,
      });

      // Should generate lighter, less saturated colors
      palette.forEach((color) => {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);

        // Light colors should have high values across all channels
        expect((r + g + b) / 3).toBeGreaterThan(180);
      });
    });
  });
});
