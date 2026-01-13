/**
 * Parses a date string (YYYY-MM or YYYY) into a timestamp number.
 * Uses Date.UTC to avoid timezone issues and ensure consistent sorting.
 * Returns 0 if the date is invalid.
 */
export function parseDate(dateStr: string): number {
  if (!dateStr) return 0;

  // Handle "Present" case
  if (dateStr.toLowerCase() === "present") {
    return Date.now();
  }

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
 * Formats a date string (YYYY-MM or YYYY) into "Month Year" (e.g., "January 2024").
 * Returns the original string if it doesn't match the expected format.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";

  // Handle "Present" case
  if (dateStr.toLowerCase() === "present") {
    return "Present";
  }

  const parts = dateStr.split("-");
  const year = Number(parts[0]);
  const month = parts[1] ? Number(parts[1]) : 1;

  if (isNaN(year) || isNaN(month)) return dateStr;

  // Create date object for formatting
  const dateObj = new Date(year, month - 1);

  return dateObj.toLocaleString("en-US", { month: "long", year: "numeric" });
}

/**
 * Formats a date range for display.
 * Examples:
 * - ("2024-11", undefined) → "November 2024"
 * - ("2024-11", "present") → "November 2024 – Present"
 * - ("2024-09", "2024-11") → "September 2024 – November 2024"
 * - ("2024-09", "2024-09") → "September 2024" (same month)
 */
export function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate) return "";

  const formattedStart = formatDate(startDate);

  // No end date - just return start date
  if (!endDate) {
    return formattedStart;
  }

  // Same date - just return start date
  if (startDate === endDate) {
    return formattedStart;
  }

  const formattedEnd = formatDate(endDate);

  return `${formattedStart} – ${formattedEnd}`;
}

/**
 * @deprecated Use formatDate instead
 * Formats a date string (YYYY-MM) into "Month Year" (e.g., "January 2024").
 */
export function formatTimelineDate(dateStr: string): string {
  return formatDate(dateStr);
}
