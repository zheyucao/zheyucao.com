import { describe, expect, it, vi } from "vitest";
import { formatDate, formatDateRange, parseDate } from "../../src/lib/utils/dateUtils";

describe("dateUtils matrix coverage", () => {
  describe("parseDate month mapping", () => {
    const monthCases = [
      ["2024-01", Date.UTC(2024, 0)],
      ["2024-02", Date.UTC(2024, 1)],
      ["2024-03", Date.UTC(2024, 2)],
      ["2024-04", Date.UTC(2024, 3)],
      ["2024-05", Date.UTC(2024, 4)],
      ["2024-06", Date.UTC(2024, 5)],
      ["2024-07", Date.UTC(2024, 6)],
      ["2024-08", Date.UTC(2024, 7)],
      ["2024-09", Date.UTC(2024, 8)],
      ["2024-10", Date.UTC(2024, 9)],
      ["2024-11", Date.UTC(2024, 10)],
      ["2024-12", Date.UTC(2024, 11)],
    ] as const;

    monthCases.forEach(([input, expected]) => {
      it(`parses ${input}`, () => {
        expect(parseDate(input)).toBe(expected);
      });
    });
  });

  describe("parseDate invalid and edge inputs", () => {
    const zeroCases = [
      "",
      "x",
      "2024-xx",
      "abcd-01",
      "2024/01",
    ] as const;

    zeroCases.forEach((input) => {
      it(`returns 0 for invalid input "${input}"`, () => {
        expect(parseDate(input)).toBe(0);
      });
    });

    const strictInvalidCases = ["----", "2024-", "-01", "2024-13-01", "01-2024", "2024-13"] as const;

    strictInvalidCases.forEach((input) => {
      it(`returns 0 for strict-invalid input "${input}"`, () => {
        expect(parseDate(input)).toBe(0);
      });
    });

    it("uses Date.now() for present", () => {
      const nowSpy = vi.spyOn(Date, "now").mockReturnValue(1234567890);
      expect(parseDate("present")).toBe(1234567890);
      nowSpy.mockRestore();
    });

    it("uses Date.now() for mixed-case Present", () => {
      const nowSpy = vi.spyOn(Date, "now").mockReturnValue(9876543210);
      expect(parseDate("PrEsEnT")).toBe(9876543210);
      nowSpy.mockRestore();
    });
  });

  describe("formatDate month mapping", () => {
    const monthCases = [
      ["2024-01", "January 2024"],
      ["2024-02", "February 2024"],
      ["2024-03", "March 2024"],
      ["2024-04", "April 2024"],
      ["2024-05", "May 2024"],
      ["2024-06", "June 2024"],
      ["2024-07", "July 2024"],
      ["2024-08", "August 2024"],
      ["2024-09", "September 2024"],
      ["2024-10", "October 2024"],
      ["2024-11", "November 2024"],
      ["2024-12", "December 2024"],
    ] as const;

    monthCases.forEach(([input, expected]) => {
      it(`formats ${input} -> ${expected}`, () => {
        expect(formatDate(input)).toBe(expected);
      });
    });
  });

  describe("formatDate passthrough and edge behavior", () => {
    const cases = [
      ["2024", "January 2024"],
      ["1999", "January 1999"],
      ["present", "Present"],
      ["PRESENT", "Present"],
      ["Present", "Present"],
      ["invalid", "invalid"],
      ["2024-xx", "2024-xx"],
      ["", ""],
    ] as const;

    cases.forEach(([input, expected]) => {
      it(`formats "${input}" -> "${expected}"`, () => {
        expect(formatDate(input)).toBe(expected);
      });
    });
  });

  describe("formatDateRange combinations", () => {
    const cases = [
      [undefined, undefined, ""],
      [undefined, "2024-01", ""],
      ["2024-01", undefined, "January 2024"],
      ["2024-01", "2024-01", "January 2024"],
      ["2024-01", "2024-02", "January 2024 – February 2024"],
      ["2024-01", "present", "January 2024 – Present"],
      ["2024", "present", "January 2024 – Present"],
      ["2024", "2025", "January 2024 – January 2025"],
      ["invalid", "2024-01", "invalid – January 2024"],
      ["2024-01", "invalid", "January 2024 – invalid"],
    ] as const;

    cases.forEach(([start, end, expected]) => {
      it(`formats range (${String(start)}, ${String(end)})`, () => {
        expect(formatDateRange(start, end)).toBe(expected);
      });
    });
  });
});
