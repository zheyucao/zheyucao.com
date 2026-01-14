import { describe, it, expect, vi, afterEach } from "vitest";
import { prefersReducedMotion } from "../../src/lib/utils/motionPreferences";

describe("motionPreferences", () => {
  describe("prefersReducedMotion", () => {
    const originalMatchMedia = window.matchMedia;

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it("should return false when prefers-reduced-motion is not set", () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(prefersReducedMotion()).toBe(false);
      expect(window.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
    });

    it("should return true when prefers-reduced-motion is set to reduce", () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(prefersReducedMotion()).toBe(true);
    });

    it("should return false when matchMedia is undefined", () => {
      // @ts-expect-error Testing undefined matchMedia
      window.matchMedia = undefined;
      expect(prefersReducedMotion()).toBe(false);
    });
  });
});
