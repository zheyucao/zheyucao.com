import { getCollection, getEntry } from "astro:content";
import { getPageMetadata } from "../lib/viewmodels/baseViewModel";
import { sortByOrder } from "../lib/utils/sortUtils";
import { formatDateRange } from "../lib/utils/dateUtils";

/**
 * Helper to parse dates robustly
 * Handles "Present", "YYYY-MM", "YYYY", etc.
 */
// Local parseDate removed in favor of shared utility from ../lib/utils/dateUtils

/**
 * Timeline page view model
 * Fetches and prepares timeline events for the timeline page
 */
export async function getTimelineViewModel() {
  // Fetch timeline events
  const rawEvents = await getCollection("timeline");

  // Process events for client-side rendering
  const allEvents = await Promise.all(
    rawEvents.map(async (event) => {
      const { Content } = await event.render();
      const dateRange = formatDateRange(event.data.startDate, event.data.endDate);
      return {
        ...event.data,
        description: event.body,
        date: dateRange,
        dateRange,
        Content,
      };
    })
  );

  // Calculate unique categories
  const categories = [...new Set(allEvents.map((event) => event.category).filter(Boolean))].sort();

  // Initial sort (newest first) using sortByOrder
  const sortedEvents = sortByOrder(allEvents, {
    getDate: (e) => e.endDate ?? e.startDate,
  });

  // Fetch metadata and UI strings in parallel
  const [metadata, uiStrings] = await Promise.all([
    getPageMetadata("timeline"),
    getEntry("ui-strings", "en"),
  ]);

  if (!uiStrings) {
    throw new Error("Could not find UI strings for 'en'");
  }
  const { filterAll } = uiStrings.data.pages.timeline;

  return {
    events: allEvents,
    categories,
    initialEvents: sortedEvents,
    metadata,
    filterAll,
  };
}
