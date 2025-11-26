import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { ContactItem } from "./contactViewModel";
import { parseDate } from "../lib/utils/dateUtils";

// Hero section requires specific fields
type HeroData = {
  greeting: string;
  name: string;
  description: string;
};

// Section with content requires title and cta
type SectionWithContent = {
  title: string;
  cta: {
    text: string;
    href: string;
  };
  Content: AstroComponentFactory;
};

// Section for featured works (no fallback)
type SectionDataBasic = {
  title: string;
  cta: {
    text: string;
    href: string;
  };
};

// Section for highlights (with required fallback)
type SectionDataWithFallback = {
  title: string;
  cta: {
    text: string;
    href: string;
  };
  fallback: string;
};

type TimelineHighlight = CollectionEntry<"timeline"> & { Content: AstroComponentFactory };
type ContactListEntry = CollectionEntry<"contact"> & {
  data: {
    kind: "list";
    items: ContactItem[];
    order?: number;
  };
};

export interface HomeViewModel {
  hero: HeroData;
  meetMe: SectionWithContent;
  connect: SectionWithContent;
  featuredWorks: {
    section: SectionDataBasic;
    projects: CollectionEntry<"projects">[];
  };
  highlights: {
    section: SectionDataWithFallback;
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
    getEntry("home", "hero"),
    getEntry("home", "meet-me"),
    getEntry("home", "connect"),
    getEntry("home", "featured-works"),
    getEntry("home", "highlights"),
    getCollection("projects"),
    getCollection("timeline"),
    getCollection("contact"),
  ]);

  if (!heroEntry || !meetMeEntry || !connectEntry || !featuredWorksEntry || !highlightsEntry) {
    throw new Error("Required homepage sections are missing.");
  }

  // Validate hero data has required fields
  const heroData = heroEntry.data;
  if (!heroData.greeting || !heroData.name || !heroData.description) {
    throw new Error("Hero section is missing required fields (greeting, name, description).");
  }

  const hero: HeroData = {
    greeting: heroData.greeting,
    name: heroData.name,
    description: heroData.description,
  };

  // Validate section data
  const validateSection = (entry: CollectionEntry<"home">, name: string) => {
    if (!entry.data.title || !entry.data.cta) {
      throw new Error(`${name} section is missing required fields (title, cta).`);
    }
  };

  validateSection(meetMeEntry, "Meet Me");
  validateSection(connectEntry, "Connect");
  validateSection(featuredWorksEntry, "Featured Works");
  validateSection(highlightsEntry, "Highlights");

  const featuredWorksSection: SectionDataBasic = {
    title: featuredWorksEntry.data.title!,
    cta: featuredWorksEntry.data.cta!,
  };

  const highlightsSection: SectionDataWithFallback = {
    title: highlightsEntry.data.title!,
    cta: highlightsEntry.data.cta!,
    fallback: highlightsEntry.data.fallback || "No highlights available.",
  };

  // Render markdown content in parallel
  const [meetMeRendered, connectRendered] = await Promise.all([
    meetMeEntry.render(),
    connectEntry.render(),
  ]);

  const meetMe: SectionWithContent = {
    title: meetMeEntry.data.title!,
    cta: meetMeEntry.data.cta!,
    Content: meetMeRendered.Content,
  };

  const connect: SectionWithContent = {
    title: connectEntry.data.title!,
    cta: connectEntry.data.cta!,
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
      const rendered = await event.render();
      return { ...event, Content: rendered.Content };
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
