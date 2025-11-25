/**
 * Parses a date string (YYYY-MM or YYYY) into a timestamp number.
 * Uses Date.UTC to avoid timezone issues and ensure consistent sorting.
 * Returns 0 if the date is invalid.
 */
export function parseDate(dateStr: string): number {
  if (!dateStr) return 0;

  const parts = dateStr.split("-");
  const year = Number(parts[0]);
  // Default to 1 (Jan) if no month part exists
  const month = parts[1] ? Number(parts[1]) : 1;

  if (isNaN(year) || isNaN(month)) {
    return 0;
  }

  // Month is 0-indexed in Date.UTC
  return Date.UTC(year, month - 1);
}

/**
 * Formats a date string (YYYY-MM) into "Month Year" (e.g., "January 2024").
 * Returns the original string if it doesn't match the expected format.
 */
export function formatTimelineDate(dateStr: string): string {
  if (!dateStr || !dateStr.includes("-")) return dateStr;

  const [year, month] = dateStr.split("-").map(Number);

  if (isNaN(year) || isNaN(month)) return dateStr;

  // Create date object for formatting
  // We use local time here as toLocaleString works with it,
  // but since we only care about month/year, it's generally safe.
  // Using UTC for formatting can be tricky with toLocaleString without options.
  const dateObj = new Date(year, month - 1);

  return dateObj.toLocaleString("en-US", { month: "long", year: "numeric" });
}
