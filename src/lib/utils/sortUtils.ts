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
 * 1. Items with positive order come first, sorted by value (ascending)
 * 2. Items without order are sorted by date (descending/newest first) if getDate is provided
 * 3. Items with negative order come last, sorted by absolute value (ascending, so -1 is last)
 * 4. Items with equal order/date preserve their original relative order (stable sort)
 */
export function sortByOrder<T>(items: T[], options: SortOptions<T> = {}): T[] {
    const {
        getOrder = (item) => (item as any).order,
        getDate = (item) => (item as any).date,
    } = options;

    // Map to store original index for stable sort fallback
    const withIndex = items.map((item, index) => ({ item, index }));

    // Separate into three groups: positive, undefined, negative
    const positive: typeof withIndex = [];
    const noOrder: typeof withIndex = [];
    const negative: typeof withIndex = [];

    withIndex.forEach((entry) => {
        const order = getOrder(entry.item);
        if (order === undefined) {
            noOrder.push(entry);
        } else if (order >= 0) {
            positive.push(entry);
        } else {
            negative.push(entry);
        }
    });

    // Sort positive group by order ascending
    positive.sort((a, b) => {
        const orderA = getOrder(a.item)!;
        const orderB = getOrder(b.item)!;
        if (orderA !== orderB) return orderA - orderB;
        return a.index - b.index;
    });

    // Sort no-order group by date descending
    noOrder.sort((a, b) => {
        const dateStrA = getDate(a.item);
        const dateStrB = getDate(b.item);

        if (dateStrA && dateStrB) {
            const dateA = parseDate(dateStrA);
            const dateB = parseDate(dateStrB);
            if (dateA !== dateB) {
                return dateB - dateA;
            }
        }

        return a.index - b.index;
    });

    // Sort negative group by order descending (so -1 comes last)
    negative.sort((a, b) => {
        const orderA = getOrder(a.item)!;
        const orderB = getOrder(b.item)!;
        if (orderA !== orderB) return orderB - orderA; // Reversed for descending
        return a.index - b.index;
    });

    // Concatenate: positive + noOrder + negative
    return [...positive, ...noOrder, ...negative].map(({ item }) => item);
}
