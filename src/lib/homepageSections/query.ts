import { sortByOrder } from "../utils/sortUtils";
import type { ShowcaseFilterValue } from "./types";

export const applyCollectionQuery = <T>(
  items: T[],
  options: {
    filter?: Record<string, ShowcaseFilterValue>;
    sortBy?: "order" | "date";
    sortOrder?: "asc" | "desc";
    limit?: number;
    getOrder?: (item: T) => number | undefined;
    getDate?: (item: T) => string | undefined;
  }
): T[] => {
  let result = [...items];

  if (options.filter) {
    result = result.filter((item) => {
      return Object.entries(options.filter!).every(([key, value]) => {
        return (
          (item as Record<string, unknown>)[key] === value ||
          ((item as { data?: Record<string, unknown> }).data as Record<string, unknown>)?.[key] ===
            value
        );
      });
    });
  }

  if (options.sortBy === "order" && options.getOrder) {
    result = sortByOrder(result, { getOrder: options.getOrder });
  } else if (options.sortBy === "date" && options.getDate) {
    result = sortByOrder(result, { getDate: options.getDate });
    if (options.sortOrder === "asc") {
      result = result.reverse();
    }
  }

  if (options.limit) {
    result = result.slice(0, options.limit);
  }

  return result;
};
