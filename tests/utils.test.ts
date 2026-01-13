import { describe, it, expect } from "vitest";
import {
  parseDate,
  formatTimelineDate,
  formatDate,
  formatDateRange,
} from "../src/lib/utils/dateUtils";
import { sanitizeStrict, sanitizeRich } from "../src/lib/utils/sanitize";

describe("dateUtils", () => {
  describe("parseDate", () => {
    it("should parse YYYY-MM correctly", () => {
      const jan2023 = parseDate("2023-01");
      const feb2023 = parseDate("2023-02");
      expect(feb2023).toBeGreaterThan(jan2023);
    });

    it("should parse YYYY correctly (default to Jan)", () => {
      const year2024 = parseDate("2024");
      const jan2024 = parseDate("2024-01");
      expect(year2024).toBe(jan2024);
    });

    it("should return 0 for invalid dates", () => {
      expect(parseDate("invalid")).toBe(0);
      expect(parseDate("")).toBe(0);
    });

    it("should sort dates correctly", () => {
      const dates = ["2023-12", "2024-01", "2023-01"];
      const sorted = dates.sort((a, b) => parseDate(b) - parseDate(a));
      expect(sorted).toEqual(["2024-01", "2023-12", "2023-01"]);
    });
  });

  describe("formatDate", () => {
    it("should format YYYY-MM to Month Year", () => {
      expect(formatDate("2024-01")).toBe("January 2024");
      expect(formatDate("2024-12")).toBe("December 2024");
    });

    it("should format YYYY to Month Year (defaults to January)", () => {
      expect(formatDate("2024")).toBe("January 2024");
    });

    it("should handle 'present' case-insensitively", () => {
      expect(formatDate("present")).toBe("Present");
      expect(formatDate("Present")).toBe("Present");
      expect(formatDate("PRESENT")).toBe("Present");
    });

    it("should return original string for invalid formats", () => {
      expect(formatDate("invalid")).toBe("invalid");
      expect(formatDate("")).toBe("");
    });
  });

  describe("formatDateRange", () => {
    it("should format single date", () => {
      expect(formatDateRange("2024-11")).toBe("November 2024");
    });

    it("should format date range", () => {
      expect(formatDateRange("2024-09", "2024-11")).toBe("September 2024 – November 2024");
    });

    it("should format date range with Present", () => {
      expect(formatDateRange("2024-11", "present")).toBe("November 2024 – Present");
    });

    it("should return single date when start and end are the same", () => {
      expect(formatDateRange("2024-11", "2024-11")).toBe("November 2024");
    });

    it("should return empty string for undefined startDate", () => {
      expect(formatDateRange()).toBe("");
      expect(formatDateRange(undefined)).toBe("");
    });
  });

  describe("formatTimelineDate (deprecated)", () => {
    it("should format YYYY-MM to Month Year", () => {
      expect(formatTimelineDate("2024-01")).toBe("January 2024");
    });

    it("should format YYYY to Month Year", () => {
      expect(formatTimelineDate("2024")).toBe("January 2024");
    });

    it("should return original string for invalid formats", () => {
      expect(formatTimelineDate("invalid")).toBe("invalid");
    });
  });
});

describe("sanitize", () => {
  it("sanitizeStrict removes links/images and preserves inline tags", () => {
    const input = '<a href="#">link</a><em>ok</em><img src=x>';
    const output = sanitizeStrict(input);
    expect(output.includes("<a")).toBe(false);
    expect(output.includes("<img")).toBe(false);
    expect(output).toContain("<em>ok</em>");
  });

  it("sanitizeRich allows links and images", () => {
    const input = '<a href="https://example.com" target="_blank">link</a><img src="x" alt="img">';
    const output = sanitizeRich(input);
    expect(output).toContain("<a");
    expect(output).toContain("<img");
  });
});
