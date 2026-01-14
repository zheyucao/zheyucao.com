import { describe, it, expect } from "vitest";
import { sortByOrder } from "../../src/lib/utils/sortUtils";

describe("sortUtils", () => {
  describe("sortByOrder", () => {
    it("should sort items with positive order ascending", () => {
      const items = [{ order: 3 }, { order: 1 }, { order: 2 }];
      const result = sortByOrder(items);
      expect(result.map((i) => i.order)).toEqual([1, 2, 3]);
    });

    it("should place items without order after positive-ordered items", () => {
      const items = [{ order: 2 }, { name: "no-order" }, { order: 1 }];
      const result = sortByOrder(items);
      expect(result).toEqual([{ order: 1 }, { order: 2 }, { name: "no-order" }]);
    });

    it("should place items with negative order at the end", () => {
      const items = [{ order: -1 }, { order: 1 }, { order: 2 }];
      const result = sortByOrder(items);
      expect(result.map((i) => i.order)).toEqual([1, 2, -1]);
    });

    it("should sort negative orders descending (so -1 is last)", () => {
      const items = [{ order: -1 }, { order: -3 }, { order: -2 }];
      const result = sortByOrder(items);
      // Negative orders are sorted descending, so -1 (closest to 0) comes last
      expect(result.map((i) => i.order)).toEqual([-1, -2, -3]);
    });

    it("should sort no-order items by date descending when getDate provided", () => {
      const items = [{ date: "2023-01" }, { date: "2024-06" }, { date: "2023-12" }];
      const result = sortByOrder(items, {
        getOrder: () => undefined,
        getDate: (item) => item.date,
      });
      expect(result.map((i) => i.date)).toEqual(["2024-06", "2023-12", "2023-01"]);
    });

    it("should use custom getOrder function", () => {
      const items = [{ priority: 3 }, { priority: 1 }, { priority: 2 }];
      const result = sortByOrder(items, { getOrder: (item) => item.priority });
      expect(result.map((i) => i.priority)).toEqual([1, 2, 3]);
    });

    it("should preserve original order for items with equal order (stable sort)", () => {
      const items = [
        { order: 1, id: "a" },
        { order: 1, id: "b" },
        { order: 1, id: "c" },
      ];
      const result = sortByOrder(items);
      expect(result.map((i) => i.id)).toEqual(["a", "b", "c"]);
    });

    it("should handle empty array", () => {
      const result = sortByOrder([]);
      expect(result).toEqual([]);
    });

    it("should handle mixed positive, negative, and no-order items", () => {
      const items = [{ order: -1, id: "neg" }, { id: "no-order" }, { order: 1, id: "pos" }];
      const result = sortByOrder(items);
      expect(result.map((i) => i.id)).toEqual(["pos", "no-order", "neg"]);
    });
  });
});
