/**
 * Parses a date string (YYYY-MM or YYYY) into a timestamp number.
 * Uses Date.UTC to avoid timezone issues and ensure consistent sorting.
 * Returns 0 if the date is invalid.
 */
const YEAR_PATTERN = /^\d{4}$/;
const YEAR_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const PRESENT_PATTERN = /^present$/i;

function parseYearMonth(dateStr: string): { year: number; month: number } | null {
  if (YEAR_MONTH_PATTERN.test(dateStr)) {
    const [yearToken, monthToken] = dateStr.split("-");
    return { year: Number(yearToken), month: Number(monthToken) };
  }

  if (YEAR_PATTERN.test(dateStr)) {
    return { year: Number(dateStr), month: 1 };
  }

  return null;
}

export function parseDate(dateStr: string): number {
  if (!dateStr) return 0;

  // Handle "Present" case
  if (PRESENT_PATTERN.test(dateStr)) {
    return Date.now();
  }

  const parsed = parseYearMonth(dateStr);
  if (!parsed) {
    return 0;
  }

  return Date.UTC(parsed.year, parsed.month - 1);
}

/**
 * Formats a date string (YYYY-MM or YYYY) into "Month Year" (e.g., "January 2024").
 * Returns the original string if it doesn't match the expected format.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";

  // Handle "Present" case
  if (PRESENT_PATTERN.test(dateStr)) {
    return "Present";
  }

  const parsed = parseYearMonth(dateStr);
  if (!parsed) return dateStr;

  const dateObj = new Date(Date.UTC(parsed.year, parsed.month - 1));
  return dateObj.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
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
