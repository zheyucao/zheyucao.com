import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import type { ContactItem } from "./contactViewModel";
import { parseDate } from "../lib/utils/dateUtils";

export interface HomeViewModel {
  hero: Record<string, unknown>;
  meetMe: { Content: any } & Record<string, unknown>;
  connect: { Content: any } & Record<string, unknown>;
  featuredWorks: {
    section: Record<string, unknown>;
    projects: CollectionEntry<"projects">[];
  };
  highlights: {
    section: Record<string, unknown>;
    events: Array<CollectionEntry<"timeline"> & { Content: any }>;
  };
  connectSocialItems: ContactItem[];
}

/**
 * Home page view model
 * Aggregates and transforms content for the homepage
 */
export async function getHomeViewModel(): Promise<HomeViewModel> {
  // Parallelize independent data fetches for better build performance
  const [
    heroEntry,
    meetMeEntry,
    connectEntry,
    featuredWorksEntry,
    highlightsEntry,
    allProjects,
    allEvents,
    contactEntries,
  ] = await Promise.all([
    getEntry("sections", "hero"),
    getEntry("sections", "meet-me"),
    getEntry("sections", "connect"),
    getEntry("sections", "featured-works"),
    getEntry("sections", "highlights"),
    getCollection("projects"),
    getCollection("timeline"),
    getCollection("contact"),
  ]);

  if (!heroEntry || !meetMeEntry || !connectEntry || !featuredWorksEntry || !highlightsEntry) {
    throw new Error("Required homepage sections are missing.");
  }

  const hero = heroEntry.data;
  const featuredWorksSection = featuredWorksEntry.data;
  const highlightsSection = highlightsEntry.data;

  // Render markdown content in parallel
  const [meetMeRendered, connectRendered] = await Promise.all([
    meetMeEntry.render(),
    connectEntry.render(),
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

  // Filter timeline highlights and drop invalid dates
  const highlightEvents = allEvents.filter((e) => e.data.isHighlight);

  const highlightsWithDate = highlightEvents
    .map((event) => ({ event, dateValue: parseDate(event.data.date) }))
    .filter(({ dateValue }) => dateValue > 0)
    .sort((a, b) => b.dateValue - a.dateValue);

  const topHighlights = highlightsWithDate.slice(0, 3);

  // Render content for highlights in parallel
  const highlights = await Promise.all(
    topHighlights.map(async ({ event }) => {
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
          order:
            item.showOnHome === false
              ? Infinity
              : (entry.data.order ?? sectionIndex) * 100 + itemIndex,
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
