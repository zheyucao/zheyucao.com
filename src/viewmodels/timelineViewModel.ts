import { getCollection, getEntry } from "astro:content";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
});

/**
 * Timeline page view model
 * Fetches and prepares timeline events for the timeline page
 */
export async function getTimelineViewModel() {
    // Fetch timeline events
    const rawEvents = await getCollection("timeline");

    // Process events for client-side rendering
    const allEvents = rawEvents.map((event) => ({
        ...event.data,
        description: event.body, // Pass raw body as description
        renderedDescription: event.body ? md.render(event.body) : "",
    }));

    // Calculate unique categories
    const categories = [...new Set(allEvents.map((event) => event.category).filter(Boolean))].sort();

    // Initial sort (newest first)
    const sortedEvents = [...allEvents].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Fetch UI strings
    const uiStrings = await getEntry("ui-strings", "en");
    const { title: pageTitle, filterAll } = uiStrings.data.pages.timeline;

    return {
        events: allEvents,
        categories,
        initialEvents: sortedEvents,
        pageTitle,
        filterAll,
    };
}
