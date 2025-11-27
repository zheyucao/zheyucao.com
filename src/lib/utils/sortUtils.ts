import { parseDate } from "./dateUtils";

/**
 * Generic type for items with optional order field
 */
export type Orderable = { order?: number };

/**
 * Options for sorting
 */
export interface SortOptions<T> {
    getOrder?: (item: T) => number | undefined;
    getDate?: (item: T) => string | undefined;
}

/**
 * Sort items by order field
 * 1. Items with explicit order come first, sorted by value (ascending)
 * 2. Items without order are sorted by date (descending/newest first) if getDate is provided
 * 3. Items with equal order/date preserve their original relative order (stable sort)
 */
export function sortByOrder<T>(items: T[], options: SortOptions<T> = {}): T[] {
    const {
        getOrder = (item) => (item as any).order,
        getDate = (item) => (item as any).date,
    } = options;

    // Map to store original index for stable sort fallback
    const withIndex = items.map((item, index) => ({ item, index }));

    withIndex.sort((a, b) => {
        const orderA = getOrder(a.item);
        const orderB = getOrder(b.item);

        // 1. Explicit Order (Ascending)
        if (orderA !== undefined && orderB !== undefined) {
            return orderA - orderB;
        }
        if (orderA !== undefined) return -1; // A comes first
        if (orderB !== undefined) return 1; // B comes first

        // 2. Date Fallback (Descending - Newest First)
        const dateStrA = getDate(a.item);
        const dateStrB = getDate(b.item);

        if (dateStrA && dateStrB) {
            const dateA = parseDate(dateStrA);
            const dateB = parseDate(dateStrB);
            if (dateA !== dateB) {
                return dateB - dateA;
            }
        }

        // 3. Original Index (Stable Sort)
        return a.index - b.index;
    });

    return withIndex.map(({ item }) => item);
}
