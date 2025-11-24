import { getCollection, getEntry } from "astro:content";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
});

/**
 * Helper to parse dates robustly
 * Handles "Present", "YYYY-MM", "YYYY", etc.
 */
function parseDate(dateStr: string): number {
    if (!dateStr) return 0;
    if (dateStr.toLowerCase() === "present") return Date.now();

    // Try standard parsing first
    const timestamp = Date.parse(dateStr);
    if (!isNaN(timestamp)) return timestamp;

    // Handle YYYY-MM format manually if needed (though Date.parse usually handles it)
    // or other custom formats if they exist in the content.
    // For now, let's assume standard ISO or "Month Year" formats are used.
    // If we encounter specific issues, we can add more logic here.
    return 0;
}

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
        renderedDescription: event.body
            ? sanitizeHtml(md.render(event.body), {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
                allowedAttributes: {
                    ...sanitizeHtml.defaults.allowedAttributes,
                    img: ["src", "alt", "width", "height"],
                },
            })
            : "",
    }));

    // Calculate unique categories
    const categories = [...new Set(allEvents.map((event) => event.category).filter(Boolean))].sort();

    // Initial sort (newest first)
    const sortedEvents = [...allEvents].sort((a, b) =>
        parseDate(b.date) - parseDate(a.date)
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
