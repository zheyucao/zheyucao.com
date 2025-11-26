import { describe, it, expect } from "vitest";
import { parseDate, formatTimelineDate } from "./dateUtils";

describe("dateUtils", () => {
  describe("parseDate", () => {
    it("should parse YYYY-MM correctly", () => {
      const timestamp = parseDate("2024-02");
      // 2024-02-01 UTC
      expect(timestamp).toBe(Date.UTC(2024, 1));
    });

    it("should parse YYYY correctly (default to Jan)", () => {
      const timestamp = parseDate("2024");
      // 2024-01-01 UTC
      expect(timestamp).toBe(Date.UTC(2024, 0));
    });

    it("should return 0 for invalid dates", () => {
      expect(parseDate("invalid")).toBe(0);
      expect(parseDate("")).toBe(0);
      expect(parseDate("2024-XX")).toBe(0);
    });

    it("should sort dates correctly", () => {
      const date1 = parseDate("2024-01");
      const date2 = parseDate("2023-12");
      expect(date1).toBeGreaterThan(date2);
    });
  });

  describe("formatTimelineDate", () => {
    it("should format YYYY-MM to Month Year", () => {
      expect(formatTimelineDate("2024-01")).toBe("January 2024");
      expect(formatTimelineDate("2023-12")).toBe("December 2023");
    });

    it("should return original string for YYYY", () => {
      expect(formatTimelineDate("2024")).toBe("2024");
    });

    it("should return original string for invalid formats", () => {
      expect(formatTimelineDate("invalid")).toBe("invalid");
      expect(formatTimelineDate("")).toBe("");
    });
  });
});
