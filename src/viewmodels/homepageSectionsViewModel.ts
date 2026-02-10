import { getCollection, type CollectionEntry } from "astro:content";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import { sortByOrder } from "../lib/utils/sortUtils";
import { formatDateRange } from "../lib/utils/dateUtils";
import type { ContactItem } from "./contactViewModel";

// Types for different section data after processing
export type HeroSection = {
  type: "hero";
  order: number;
  greeting?: string;
  name: string;
  description?: string;
};

export type TextSection = {
  type: "text";
  order: number;
  title?: string;
  cta?: {
    text: string;
    href: string;
  };
  Content: AstroComponentFactory;
};

export type ContactSection = {
  type: "contact";
  order: number;
  title?: string;
  cta?: {
    text: string;
    href: string;
  };
  Content: AstroComponentFactory;
  contactIcons: ContactItem[];
};

type BaseShowcaseSection = {
  type: "showcase";
  order: number;
  title?: string;
  cta?: {
    text: string;
    href: string;
  };
  fallback?: string;
};

export type ProjectShowcaseSection = BaseShowcaseSection & {
  componentType: "cards";
  items: CollectionEntry<"projects">[];
};

export type TimelineShowcaseSection = BaseShowcaseSection & {
  componentType: "list";
  items: Array<CollectionEntry<"timeline"> & { Content: AstroComponentFactory }>;
};

export type HomepageSection =
  | HeroSection
  | TextSection
  | ContactSection
  | ProjectShowcaseSection
  | TimelineShowcaseSection;

/**
 * Apply filters, sorting, and limit to a collection of items.
 * Shared utility for showcase sections.
 */
function applyCollectionQuery<T>(
  items: T[],
  options: {
    filter?: Record<string, unknown>;
    sortBy?: "order" | "date";
    sortOrder?: "asc" | "desc";
    limit?: number;
    getOrder?: (item: T) => number | undefined;
    getDate?: (item: T) => string | undefined;
  }
): T[] {
  let result = [...items];

  // Apply filters
  if (options.filter) {
    result = result.filter((item) => {
      return Object.entries(options.filter!).every(([key, value]) => {
        return (
          (item as Record<string, unknown>)[key] === value ||
          ((item as { data?: Record<string, unknown> }).data as Record<string, unknown>)?.[key] ===
            value
        );
      });
    });
  }

  // Apply sorting
  if (options.sortBy === "order" && options.getOrder) {
    result = sortByOrder(result, { getOrder: options.getOrder });
  } else if (options.sortBy === "date" && options.getDate) {
    result = sortByOrder(result, { getDate: options.getDate });
    if (options.sortOrder === "asc") {
      result = result.reverse();
    }
  }

  // Apply limit
  if (options.limit) {
    result = result.slice(0, options.limit);
  }

  return result;
}

/**
 * Get all homepage sections, processed and ready for rendering
 */
export async function getHomepageSectionsViewModel(): Promise<HomepageSection[]> {
  // Pre-fetch all collections that may be needed (avoids repeated fetches in loop)
  const [allSections, allContactEntries, allProjectsEntries, allTimelineEntries] =
    await Promise.all([
      getCollection("homepage-sections"),
      getCollection("contact"),
      getCollection("projects"),
      getCollection("timeline"),
    ]);

  // Filter visible sections and sort by order
  const visibleSections = sortByOrder(
    allSections.filter((s) => s.data.visible !== false),
    {
      getOrder: (s) => s.data.order,
    }
  );

  // Process each section based on its type
  const processedSections = await Promise.all(
    visibleSections.map(async (section) => {
      const { type } = section.data;

      if (type === "hero") {
        return {
          type: "hero" as const,
          order: section.data.order,
          greeting: section.data.greeting,
          name: section.data.name,
          description: section.data.description,
        };
      }

      if (type === "text") {
        const rendered = await section.render();
        const result: TextSection = {
          type: "text" as const,
          order: section.data.order,
          title: section.data.title,
          cta: section.data.cta,
          Content: rendered.Content,
        };
        return result;
      }

      if (type === "contact") {
        const rendered = await section.render();

        // Auto-load contact icons with showOnHome: true
        const contactIcons: ContactItem[] = [];
        for (const entry of allContactEntries) {
          if (entry.data.type === "list") {
            const entryItems = entry.data.items;
            for (const item of entryItems) {
              if (item.showOnHome === true) {
                contactIcons.push(item);
              }
            }
          }
        }

        const result: ContactSection = {
          type: "contact" as const,
          order: section.data.order,
          title: section.data.title,
          cta: section.data.cta,
          Content: rendered.Content,
          contactIcons,
        };
        return result;
      }

      if (type === "showcase") {
        const { sourceCollection, filter, sortBy, sortOrder, limit, componentType } = section.data;

        // Handle projects collection
        if (sourceCollection === "projects") {
          if (componentType !== "cards") {
            throw new Error(
              `Invalid homepage section config '${section.id}': projects sourceCollection requires componentType: "cards"`
            );
          }

          const projectItems = applyCollectionQuery(allProjectsEntries, {
            filter,
            sortBy,
            sortOrder,
            limit,
            getOrder: (item) => item.data.order,
            getDate: (item) => item.data.endDate ?? item.data.startDate,
          });

          const result: ProjectShowcaseSection = {
            type: "showcase" as const,
            order: section.data.order,
            title: section.data.title,
            cta: section.data.cta,
            fallback: section.data.fallback,
            componentType: "cards",
            items: projectItems,
          };
          return result;
        }

        // Handle timeline collection
        if (sourceCollection === "timeline") {
          if (componentType !== "list") {
            throw new Error(
              `Invalid homepage section config '${section.id}': timeline sourceCollection requires componentType: "list"`
            );
          }

          const timelineItems = applyCollectionQuery(allTimelineEntries, {
            filter,
            sortBy,
            sortOrder,
            limit,
            getOrder: (item) => (item.data as { order?: number }).order,
            getDate: (item) => item.data.endDate ?? item.data.startDate,
          });

          // Render content for timeline items
          const renderedItems = await Promise.all(
            timelineItems.map(async (item) => {
              const rendered = await item.render();
              const formattedDate = formatDateRange(item.data.startDate, item.data.endDate);
              return {
                ...item,
                data: { ...item.data, date: formattedDate },
                Content: rendered.Content,
              };
            })
          );

          const result: TimelineShowcaseSection = {
            type: "showcase" as const,
            order: section.data.order,
            title: section.data.title,
            cta: section.data.cta,
            fallback: section.data.fallback,
            componentType: "list",
            items: renderedItems,
          };
          return result;
        }

        throw new Error(`Unknown source collection: ${sourceCollection}`);
      }

      throw new Error(`Unknown section type: ${type}`);
    })
  );

  return processedSections;
}
