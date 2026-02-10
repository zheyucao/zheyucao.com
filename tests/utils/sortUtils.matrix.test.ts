import { describe, expect, it } from "vitest";
import { sortByOrder } from "../../src/lib/utils/sortUtils";

describe("sortUtils matrix coverage", () => {
  describe("positive-order permutations", () => {
    const permutations = [
      [3, 1, 2],
      [3, 2, 1],
      [2, 3, 1],
      [2, 1, 3],
      [1, 3, 2],
      [1, 2, 3],
    ] as const;

    permutations.forEach((orders) => {
      it(`sorts positive order permutation [${orders.join(", ")}]`, () => {
        const items = orders.map((order, index) => ({ id: `item-${index}`, order }));
        const result = sortByOrder(items);
        expect(result.map((item) => item.order)).toEqual([1, 2, 3]);
      });
    });
  });

  describe("no-order date sorting", () => {
    const cases = [
      ["2024-01", "2024-02", "2023-12"],
      ["2023-05", "2024-02", "2022-01"],
      ["2025-12", "2025-01", "2024-12"],
      ["2021-01", "2022-01", "2023-01"],
      ["2024-11", "2024-10", "2024-09"],
      ["2020", "2021", "2022"],
      ["2022-06", "2022-06", "2021-06"],
      ["present", "2024-01", "2023-01"],
      ["2024-01", "invalid", "2023-01"],
      ["invalid-a", "invalid-b", "invalid-c"],
    ] as const;

    cases.forEach((inputDates) => {
      it(`sorts no-order dates [${inputDates.join(", ")}]`, () => {
        const items = inputDates.map((date, idx) => ({ id: idx, date }));
        const result = sortByOrder(items, {
          getOrder: () => undefined,
          getDate: (item) => item.date,
        });
        const expected = [...items]
          .map((item, index) => ({ ...item, index }))
          .sort((a, b) => {
            const rank = (value: string) => {
              if (value === "present") return Number.MAX_SAFE_INTEGER;
              const [y, m] = value.split("-");
              const year = Number(y);
              const month = m ? Number(m) : 1;
              if (Number.isNaN(year) || Number.isNaN(month)) return Number.MIN_SAFE_INTEGER;
              return Date.UTC(year, month - 1);
            };
            const diff = rank(b.date) - rank(a.date);
            if (diff !== 0) return diff;
            return a.index - b.index;
          })
          .map((item) => item.date);
        expect(result.map((item) => item.date)).toEqual(expected);
      });
    });
  });

  describe("mixed bucket placement", () => {
    const cases = [
      [2, undefined, -1, 1],
      [undefined, -1, 3, 1],
      [-2, -1, undefined, 0],
      [1, undefined, undefined, -1],
      [5, 4, undefined, -3],
      [0, undefined, -1, -2],
      [3, undefined, 2, -1],
      [undefined, undefined, -1, -2],
      [1, 2, 3, -1],
      [0, 1, undefined, -1],
    ] as const;

    cases.forEach((orders) => {
      it(`places buckets correctly for [${orders.map(String).join(", ")}]`, () => {
        const items = orders.map((order, idx) => ({ id: idx, order, date: `202${idx}-01` }));
        const result = sortByOrder(items, { getDate: (item) => item.date });
        const resultOrders = result.map((item) => item.order);

        const firstNegativeIndex = resultOrders.findIndex((order) => (order ?? 0) < 0);
        const firstUndefinedIndex = resultOrders.findIndex((order) => order === undefined);

        if (firstUndefinedIndex !== -1) {
          expect(resultOrders.slice(0, firstUndefinedIndex).every((order) => (order ?? 0) >= 0)).toBe(
            true
          );
        }
        if (firstNegativeIndex !== -1) {
          expect(resultOrders.slice(firstNegativeIndex).every((order) => (order ?? 0) < 0)).toBe(true);
        }
      });
    });
  });

  describe("custom getters", () => {
    const cases = [
      [
        { id: "a", priority: 2, publishedAt: "2024-01" },
        { id: "b", priority: 1, publishedAt: "2025-01" },
        { id: "c", priority: undefined, publishedAt: "2023-01" },
      ],
      [
        { id: "a", priority: undefined, publishedAt: "2025-01" },
        { id: "b", priority: 0, publishedAt: "2021-01" },
        { id: "c", priority: -1, publishedAt: "2024-01" },
      ],
      [
        { id: "a", priority: 5, publishedAt: "2024-06" },
        { id: "b", priority: 4, publishedAt: "2024-07" },
        { id: "c", priority: 3, publishedAt: "2024-08" },
      ],
      [
        { id: "a", priority: undefined, publishedAt: "2020-01" },
        { id: "b", priority: undefined, publishedAt: "2021-01" },
        { id: "c", priority: undefined, publishedAt: "2022-01" },
      ],
      [
        { id: "a", priority: -3, publishedAt: "2020-01" },
        { id: "b", priority: -1, publishedAt: "2021-01" },
        { id: "c", priority: -2, publishedAt: "2022-01" },
      ],
      [
        { id: "a", priority: 1, publishedAt: "present" },
        { id: "b", priority: undefined, publishedAt: "2024-01" },
        { id: "c", priority: undefined, publishedAt: "2025-01" },
      ],
      [
        { id: "a", priority: 1, publishedAt: "2024-01" },
        { id: "b", priority: 1, publishedAt: "2023-01" },
        { id: "c", priority: 1, publishedAt: "2022-01" },
      ],
      [
        { id: "a", priority: 0, publishedAt: "2024-01" },
        { id: "b", priority: undefined, publishedAt: "2024-02" },
        { id: "c", priority: -1, publishedAt: "2024-03" },
      ],
      [
        { id: "a", priority: undefined, publishedAt: "invalid" },
        { id: "b", priority: undefined, publishedAt: "2024-01" },
        { id: "c", priority: undefined, publishedAt: "2023-01" },
      ],
      [
        { id: "a", priority: 2, publishedAt: "2020-01" },
        { id: "b", priority: undefined, publishedAt: "2025-01" },
        { id: "c", priority: -1, publishedAt: "2022-01" },
      ],
    ] as const;

    cases.forEach((items, index) => {
      it(`supports custom getters scenario #${index + 1}`, () => {
        const result = sortByOrder([...items], {
          getOrder: (item) => item.priority,
          getDate: (item) => item.publishedAt,
        });

        const ids = result.map((item) => item.id);
        expect(ids.length).toBe(items.length);

        const orders = result.map((item) => item.priority);
        const firstUndefined = orders.findIndex((order) => order === undefined);
        const firstNegative = orders.findIndex((order) => (order ?? 0) < 0);

        if (firstUndefined !== -1) {
          expect(orders.slice(0, firstUndefined).every((order) => (order ?? 0) >= 0)).toBe(true);
        }
        if (firstNegative !== -1) {
          expect(orders.slice(firstNegative).every((order) => (order ?? 0) < 0)).toBe(true);
        }
      });
    });
  });
});
