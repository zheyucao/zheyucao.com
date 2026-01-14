/**
 * Centralized error handling utilities for content collections.
 */

/**
 * Error thrown when a required content entry is not found.
 */
export class ContentNotFoundError extends Error {
  constructor(entryType: string, id?: string) {
    const message = id
      ? `Content not found: ${entryType} (${id})`
      : `Content not found: ${entryType}`;
    super(message);
    this.name = "ContentNotFoundError";
  }
}

/**
 * Asserts that an entry exists and returns it.
 * Throws ContentNotFoundError if the entry is undefined.
 *
 * @param entry - The entry to check
 * @param name - Name of the entry type for error messages
 * @returns The entry if it exists
 * @throws ContentNotFoundError if entry is undefined
 */
export function requireEntry<T>(entry: T | undefined, name: string): T {
  if (entry === undefined) {
    throw new ContentNotFoundError(name);
  }
  return entry;
}

/**
 * Safely get an entry with a fallback value.
 * Useful for optional content that has a default.
 */
export function getEntryOrDefault<T>(entry: T | undefined, defaultValue: T): T {
  return entry ?? defaultValue;
}
