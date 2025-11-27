/**
 * Generic type for items with optional order field
 */
export type Orderable = { order?: number };

/**
 * Sort items by order field
 * Items with order come first, sorted by value (ascending)
 * Items without order come after (using Infinity as fallback)
 */
export function sortByOrder<T>(
    items: T[],
    getOrder: (item: T) => number | undefined = (item) => (item as any).order
): T[] {
    return items.sort((a, b) => (getOrder(a) ?? Infinity) - (getOrder(b) ?? Infinity));
}
