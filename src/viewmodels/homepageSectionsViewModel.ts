import { getCollection } from "astro:content";
import { sortByOrder } from "../lib/utils/sortUtils";
import {
  buildHomepageSection,
  type HomepageSectionBuildContext,
  type HomepageSection,
} from "../lib/homepageSections/registry";

export type {
  HeroSection,
  TextSection,
  ContactSection,
  ProjectShowcaseSection,
  TimelineShowcaseSection,
} from "../lib/homepageSections/registry";

/**
 * Get all homepage sections, processed and ready for rendering.
 */
export async function getHomepageSectionsViewModel(): Promise<HomepageSection[]> {
  const [allSections, allContactEntries, allProjectsEntries, allTimelineEntries] = await Promise.all([
    getCollection("homepage-sections"),
    getCollection("contact"),
    getCollection("projects"),
    getCollection("timeline"),
  ]);

  const visibleSections = sortByOrder(
    allSections.filter((section) => section.data.visible !== false),
    {
      getOrder: (section) => section.data.order,
    }
  );

  const buildContext: HomepageSectionBuildContext = {
    contactEntries: allContactEntries,
    projectsEntries: allProjectsEntries,
    timelineEntries: allTimelineEntries,
  };

  return Promise.all(visibleSections.map((section) => buildHomepageSection(section, buildContext)));
}
