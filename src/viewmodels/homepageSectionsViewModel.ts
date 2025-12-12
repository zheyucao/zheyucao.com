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
  type: "showcase";
  order: number;
  title?: string;
  cta?: {
    text: string;
    href: string;
  };
  fallback?: string;
  componentType: "cards" | "list";
  items: Array<
    CollectionEntry<"projects"> | (CollectionEntry<"timeline"> & { Content: AstroComponentFactory })
  >;
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
          const { sourceCollection, filter, itemFilter } =
            section.data.supplementaryData.contactIcons;

          if (sourceCollection === "contact") {
            const contactEntries = await getCollection("contact");

            // Filter by entry-level filter (e.g., kind: "list")
            let filteredEntries = contactEntries;
            if (filter) {
              filteredEntries = contactEntries.filter((entry) => {
                return Object.entries(filter).every(([key, value]) => {
                  return (entry.data as Record<string, unknown>)[key] === value;
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
                      return (item as Record<string, unknown>)[key] === value;
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

      if (type === "showcase") {
        const { sourceCollection, filter, sortBy, sortOrder, limit, componentType } = section.data;

        // Handle projects collection
        if (sourceCollection === "projects") {
          let projectItems = await getCollection("projects");

          // Apply filters
          if (filter) {
            projectItems = projectItems.filter((item) => {
              return Object.entries(filter).every(([key, value]) => {
                return (item.data as Record<string, unknown>)[key] === value;
              });
            });
          }

          // Apply sorting
          if (sortBy === "order") {
            projectItems = sortByOrder(projectItems, {
              getOrder: (item) => item.data.order,
            });
          } else if (sortBy === "date") {
            projectItems = sortByOrder(projectItems, {
              getDate: (item) => item.data.endDate ?? item.data.startDate,
            });
            if (sortOrder === "desc") {
              projectItems = projectItems.reverse();
            }
          }

          // Apply limit
          if (limit) {
            projectItems = projectItems.slice(0, limit);
          }

          return {
            type: "showcase" as const,
            order: section.data.order,
            title: section.data.title,
            cta: section.data.cta,
            fallback: section.data.fallback,
            componentType,
            items: projectItems,
          };
        }

        // Handle timeline collection
        if (sourceCollection === "timeline") {
          let timelineItems = await getCollection("timeline");

          // Apply filters
          if (filter) {
            timelineItems = timelineItems.filter((item) => {
              return Object.entries(filter).every(([key, value]) => {
                return (item.data as Record<string, unknown>)[key] === value;
              });
            });
          }

          // Apply sorting
          if (sortBy === "order") {
            timelineItems = sortByOrder(timelineItems, {
              getOrder: (item) => (item.data as { order?: number }).order,
            });
          } else if (sortBy === "date") {
            timelineItems = sortByOrder(timelineItems, {
              getDate: (item) => item.data.endDate ?? item.data.startDate,
            });
            if (sortOrder === "desc") {
              timelineItems = timelineItems.reverse();
            }
          }

          // Apply limit
          if (limit) {
            timelineItems = timelineItems.slice(0, limit);
          }

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

          return {
            type: "showcase" as const,
            order: section.data.order,
            title: section.data.title,
            cta: section.data.cta,
            fallback: section.data.fallback,
            componentType,
            items: renderedItems,
          };
        }

        throw new Error(`Unknown source collection: ${sourceCollection}`);
      }

      throw new Error(`Unknown section type: ${type}`);
    })
  );

  return processedSections;
}
