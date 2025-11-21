import { getCollection, getEntry } from "astro:content";
import type { ContactItem } from "./contactViewModel";

/**
 * Home page view model
 * Aggregates and transforms content for the homepage
 */
export async function getHomeViewModel() {
    //  Parallelize independent data fetches for better build performance
    const [
        heroEntry,
        meetMeEntry,
        connectEntry,
        featuredWorksEntry,
        highlightsEntry,
        allProjects,
        allEvents,
        contactEntries
    ] = await Promise.all([
        getEntry("sections", "hero"),
        getEntry("sections", "meet-me"),
        getEntry("sections", "connect"),
        getEntry("sections", "featured-works"),
        getEntry("sections", "highlights"),
        getCollection("projects"),
        getCollection("timeline"),
        getCollection("contact")
    ]);

    const hero = heroEntry.data;
    const featuredWorksSection = featuredWorksEntry.data;
    const highlightsSection = highlightsEntry.data;

    // Render markdown content in parallel
    const [meetMeRendered, connectRendered] = await Promise.all([
        meetMeEntry.render(),
        connectEntry.render()
    ]);

    const meetMe = {
        ...meetMeEntry.data,
        Content: meetMeRendered.Content,
    };

    const connect = {
        ...connectEntry.data,
        Content: connectRendered.Content,
    };

    // Filter and sort featured projects by explicit order
    const featuredProjects = allProjects
        .filter((p) => p.data.isFeatured)
        .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));

    // Filter timeline highlights
    const highlightEvents = allEvents.filter((e) => e.data.isHighlight);

    // Sort highlights by date descending (latest first) with safe UTC parsing
    highlightEvents.sort((a, b) => {
        // Parse YYYY-MM safely for cross-browser compatibility (Safari/Firefox)
        const parseDate = (dateStr: string): number => {
            if (!dateStr) return 0;
            const [year, month] = dateStr.split('-').map(Number);
            if (isNaN(year) || isNaN(month)) {
                console.warn(`[homeViewModel] Invalid date format: ${dateStr}`);
                return 0;
            }
            return Date.UTC(year, month - 1);
        };

        return parseDate(b.data.date) - parseDate(a.data.date);
    });

    // Validate dates
    const invalidDates = highlightEvents.filter(e => {
        const [year, month] = (e.data.date || '').split('-').map(Number);
        return isNaN(year) || isNaN(month);
    });

    if (invalidDates.length > 0) {
        console.warn('[homeViewModel] Timeline events with invalid dates:',
            invalidDates.map(e => ({ id: e.id, date: e.data.date }))
        );
    }

    // Take top 3 highlights
    const topHighlights = highlightEvents.slice(0, 3);

    // Render content for highlights in parallel
    const highlights = await Promise.all(
        topHighlights.map(async (event) => {
            const { Content } = await event.render();
            return { ...event, Content };
        })
    );

    // Process contact lists for home social links
    const listEntries = contactEntries.filter((entry) => entry.data.kind === "list");
    const contactItemsWithOrder = listEntries
        .sort((a, b) => (a.data.order ?? Infinity) - (b.data.order ?? Infinity))
        .flatMap((entry, sectionIndex) => {
            const items = (entry.data as any).items as ContactItem[];
            return items
                .map((item, itemIndex) => ({
                    item,
                    order: item.showOnHome === false ? Infinity : (entry.data.order ?? sectionIndex) * 100 + itemIndex,
                }))
                .filter(({ item }) => item.showOnHome !== false);
        })
        .sort((a, b) => a.order - b.order)
        .map(({ item }) => item);

    return {
        hero,
        meetMe,
        connect,
        featuredWorks: {
            section: featuredWorksSection,
            projects: featuredProjects,
        },
        highlights: {
            section: highlightsSection,
            events: highlights,
        },
        connectSocialItems: contactItemsWithOrder,
    };
}
