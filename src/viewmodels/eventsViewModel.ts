import { getCollection } from "astro:content";
import { getPageMetadata } from "../lib/viewmodels/baseViewModel";
import { sortByOrder } from "../lib/utils/sortUtils";
import { formatDateRange } from "../lib/utils/dateUtils";
import { DEFAULT_LOCALE } from "../lib/i18n/locale";
import { getUiStrings } from "../lib/i18n/uiStrings";

/**
 * Events page view model
 * Fetches and prepares events for the events page
 */
export async function getEventsViewModel(locale: string = DEFAULT_LOCALE) {
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
  const [metadata, uiStrings] = await Promise.all([getPageMetadata("timeline"), getUiStrings(locale)]);
  const { filterAll } = uiStrings.pages.timeline;

  return {
    events: allEvents,
    categories,
    initialEvents: sortedEvents,
    metadata,
    filterAll,
  };
}
