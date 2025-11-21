import { getCollection, getEntry } from "astro:content";
import type { ContactItem } from "./contactViewModel";

/**
 * Home page view model
 * Aggregates and transforms content for the homepage
 */
export async function getHomeViewModel() {
    // Fetch hero section
    const heroEntry = await getEntry("sections", "hero");
    const hero = heroEntry.data;

    // Fetch meet me section
    const meetMeEntry = await getEntry("sections", "meet-me");
    const { Content: MeetMeContent } = await meetMeEntry.render();
    const meetMe = {
        ...meetMeEntry.data,
        Content: MeetMeContent,
    };

    // Fetch connect section
    const connectEntry = await getEntry("sections", "connect");
    const { Content: ConnectContent } = await connectEntry.render();
    const connect = {
        ...connectEntry.data,
        Content: ConnectContent,
    };

    // Fetch featured works section metadata
    const featuredWorksEntry = await getEntry("sections", "featured-works");
    const featuredWorksSection = featuredWorksEntry.data;

    // Fetch and filter featured projects
    const allProjects = await getCollection("projects");
    const featuredProjects = allProjects.filter((p) => p.data.isFeatured);

    // Fetch highlights section metadata
    const highlightsEntry = await getEntry("sections", "highlights");
    const highlightsSection = highlightsEntry.data;

    // Fetch and filter timeline highlights
    const allEvents = await getCollection("timeline");
    const highlightEvents = allEvents.filter((e) => e.data.isHighlight);

    // Sort highlights by date descending (latest first)
    highlightEvents.sort((a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );

    // Take top 3 highlights
    const topHighlights = highlightEvents.slice(0, 3);

    // Render content for highlights
    const highlights = await Promise.all(
        topHighlights.map(async (event) => {
            const { Content } = await event.render();
            return { ...event, Content };
        })
    );

    // Fetch contact lists for home social links
    const contactEntries = await getCollection("contact");
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
