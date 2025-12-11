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

export type TextContentSection = {
  type: "text-content";
  order: number;
  title?: string;
  cta?: {
    text: string;
    href: string;
  };
  Content: AstroComponentFactory;
  contactIcons?: ContactItem[];
};

export type CollectionShowcaseSection = {
  type: "collection-showcase";
  order: number;
  title?: string;
  cta?: {
    text: string;
    href: string;
  };
  fallback?: string;
  componentType: "cards" | "list";
  items: Array<CollectionEntry<"projects"> | (CollectionEntry<"timeline"> & { Content: AstroComponentFactory })>;
};

export type HomepageSection = HeroSection | TextContentSection | CollectionShowcaseSection;

/**
 * Get all homepage sections, processed and ready for rendering
 */
export async function getHomepageSectionsViewModel(): Promise<HomepageSection[]> {
  // Load all sections
  const allSections = await getCollection("homepage-sections");

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

      if (type === "text-content") {
        const rendered = await section.render();
        const result: TextContentSection = {
          type: "text-content" as const,
          order: section.data.order,
          title: section.data.title,
          cta: section.data.cta,
          Content: rendered.Content,
        };

        // Handle supplementary data (e.g., contact icons)
        if (section.data.supplementaryData?.contactIcons) {
          const { sourceCollection, filter, itemFilter } = section.data.supplementaryData.contactIcons;

          if (sourceCollection === "contact") {
            const contactEntries = await getCollection("contact");

            // Filter by entry-level filter (e.g., kind: "list")
            let filteredEntries = contactEntries;
            if (filter) {
              filteredEntries = contactEntries.filter((entry) => {
                return Object.entries(filter).every(([key, value]) => {
                  return entry.data[key] === value;
                });
              });
            }

            // Extract items and apply item-level filter
            const items: ContactItem[] = [];
            for (const entry of filteredEntries) {
              if (entry.data.kind === "list") {
                const entryItems = entry.data.items;
                for (const item of entryItems) {
                  // Apply item filter (e.g., showOnHome: true)
                  if (itemFilter) {
                    const matches = Object.entries(itemFilter).every(([key, value]) => {
                      return item[key] === value;
                    });
                    if (matches) {
                      items.push(item);
                    }
                  } else {
                    items.push(item);
                  }
                }
              }
            }

            result.contactIcons = items;
          }
        }

        return result;
      }

      if (type === "collection-showcase") {
        const { sourceCollection, filter, sortBy, sortOrder, limit, componentType } = section.data;

        // Dynamically query the specified collection
        let items: Array<CollectionEntry<any>> = [];

        if (sourceCollection === "projects") {
          const allProjects = await getCollection("projects");
          items = allProjects;
        } else if (sourceCollection === "timeline") {
          const allTimeline = await getCollection("timeline");
          items = allTimeline;
        }

        // Apply filters
        if (filter) {
          items = items.filter((item) => {
            return Object.entries(filter).every(([key, value]) => {
              return item.data[key] === value;
            });
          });
        }

        // Apply sorting
        if (sortBy === "order") {
          items = sortByOrder(items, {
            getOrder: (item) => item.data.order,
          });
        } else if (sortBy === "date") {
          items = sortByOrder(items, {
            getDate: (item) => item.data.endDate ?? item.data.startDate,
          });
          if (sortOrder === "desc") {
            items = items.reverse();
          }
        }

        // Apply limit
        if (limit) {
          items = items.slice(0, limit);
        }

        // Render content for timeline items
        if (sourceCollection === "timeline") {
          items = await Promise.all(
            items.map(async (item) => {
              const rendered = await item.render();
              const formattedDate = formatDateRange(item.data.startDate, item.data.endDate);
              return {
                ...item,
                data: { ...item.data, date: formattedDate },
                Content: rendered.Content,
              };
            })
          );
        }

        return {
          type: "collection-showcase" as const,
          order: section.data.order,
          title: section.data.title,
          cta: section.data.cta,
          fallback: section.data.fallback,
          componentType,
          items,
        };
      }

      throw new Error(`Unknown section type: ${type}`);
    })
  );

  return processedSections;
}
