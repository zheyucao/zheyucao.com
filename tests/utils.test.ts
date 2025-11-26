import { describe, it, expect } from "vitest";
import { parseDate } from "../src/lib/utils/dateUtils";
import { sanitizeStrict, sanitizeRich } from "../src/lib/utils/sanitize";

describe("dateUtils", () => {
  it("orders parsed dates and returns 0 for invalid input", () => {
    const jan = parseDate("2023-01");
    const feb = parseDate("2023-02");
    const invalid = parseDate("bad-value");
    expect(jan).toBeGreaterThan(0);
    expect(feb).toBeGreaterThan(jan);
    expect(invalid).toBe(0);
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
