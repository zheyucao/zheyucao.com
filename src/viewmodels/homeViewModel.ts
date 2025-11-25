import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { ContactItem } from "./contactViewModel";
import { parseDate } from "../lib/utils/dateUtils";

type SectionEntryData = CollectionEntry<"sections">["data"];
type SectionWithContent = SectionEntryData & { Content: AstroComponentFactory };
type TimelineHighlight = CollectionEntry<"timeline"> & { Content: AstroComponentFactory };
type ContactListEntry = CollectionEntry<"contact"> & {
  data: {
    kind: "list";
    items: ContactItem[];
    order?: number;
  };
};

export interface HomeViewModel {
  hero: SectionEntryData;
  meetMe: SectionWithContent;
  connect: SectionWithContent;
  featuredWorks: {
    section: SectionEntryData;
    projects: CollectionEntry<"projects">[];
  };
  highlights: {
    section: SectionEntryData;
    events: TimelineHighlight[];
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

  const meetMe: SectionWithContent = {
    ...meetMeEntry.data,
    Content: meetMeRendered.Content,
  };

  const connect: SectionWithContent = {
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
  const highlights: TimelineHighlight[] = await Promise.all(
    topHighlights.map(async ({ event }) => {
      const rendered = event.rendered ?? (await event.render());
      const { Content } = rendered;
      return { ...event, Content };
    })
  );

  // Process contact lists for home social links
  const listEntries = contactEntries.filter(
    (entry): entry is ContactListEntry => entry.data.kind === "list"
  );
  const contactItemsWithOrder = listEntries
    .sort((a, b) => (a.data.order ?? Infinity) - (b.data.order ?? Infinity))
    .flatMap((entry, sectionIndex) => {
      const items = entry.data.items;
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
