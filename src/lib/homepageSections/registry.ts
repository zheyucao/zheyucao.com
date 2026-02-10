import { formatDateRange } from "../utils/dateUtils";
import type { ContactItem } from "../../viewmodels/contactViewModel";
import { applyCollectionQuery } from "./query";
import { contactSchema, heroSchema, showcaseSchema, textSchema } from "./schemas";
import type {
  HomepageSection,
  HomepageSectionBuildContext,
  HomepageSectionEntry,
  HomepageSectionRendererKey,
  HomepageSectionType,
  SectionRegistryEntry,
} from "./types";

// Re-export types for consumers
export type {
  ContactSection,
  HeroSection,
  HomepageSection,
  HomepageSectionBuildContext,
  HomepageSectionRendererKey,
  ProjectShowcaseSection,
  TextSection,
  TimelineShowcaseSection,
} from "./types";
export { buildHomepageSectionsSchemaUnion } from "./schemas";

export const HOMEPAGE_SECTION_REGISTRY: Record<HomepageSectionType, SectionRegistryEntry> = {
  hero: {
    type: "hero",
    schema: heroSchema,
    build: async (section) => ({
      type: "hero",
      order: section.data.order,
      greeting: section.data.greeting,
      name: section.data.name,
      description: section.data.description,
    }),
    renderer: () => "HeroSectionRenderer",
  },
  text: {
    type: "text",
    schema: textSchema,
    build: async (section) => {
      const rendered = await section.render();
      return {
        type: "text",
        order: section.data.order,
        title: section.data.title,
        cta: section.data.cta,
        Content: rendered.Content,
      };
    },
    renderer: () => "TextSectionRenderer",
  },
  contact: {
    type: "contact",
    schema: contactSchema,
    build: async (section, context) => {
      const rendered = await section.render();
      const contactIcons: ContactItem[] = [];

      for (const entry of context.contactEntries) {
        if (entry.data.type !== "list") continue;
        for (const item of entry.data.items) {
          if (item.showOnHome === true) {
            contactIcons.push(item);
          }
        }
      }

      return {
        type: "contact",
        order: section.data.order,
        title: section.data.title,
        cta: section.data.cta,
        Content: rendered.Content,
        contactIcons,
      };
    },
    renderer: () => "ContactSectionRenderer",
  },
  showcase: {
    type: "showcase",
    schema: showcaseSchema,
    build: async (section, context) => {
      const { sourceCollection, filter, sortBy, sortOrder, limit, componentType } = section.data;

      if (sourceCollection === "projects") {
        if (componentType !== "cards") {
          throw new Error(
            `Invalid homepage section config '${section.id}': projects sourceCollection requires componentType: "cards"`
          );
        }

        const projectItems = applyCollectionQuery(context.projectsEntries, {
          filter,
          sortBy,
          sortOrder,
          limit,
          getOrder: (item) => item.data.order,
          getDate: (item) => item.data.endDate ?? item.data.startDate,
        });

        return {
          type: "showcase",
          order: section.data.order,
          title: section.data.title,
          cta: section.data.cta,
          fallback: section.data.fallback,
          componentType: "cards",
          items: projectItems,
        };
      }

      if (sourceCollection === "timeline") {
        if (componentType !== "list") {
          throw new Error(
            `Invalid homepage section config '${section.id}': timeline sourceCollection requires componentType: "list"`
          );
        }

        const timelineItems = applyCollectionQuery(context.timelineEntries, {
          filter,
          sortBy,
          sortOrder,
          limit,
          getOrder: (item) => (item.data as { order?: number }).order,
          getDate: (item) => item.data.endDate ?? item.data.startDate,
        });

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
          type: "showcase",
          order: section.data.order,
          title: section.data.title,
          cta: section.data.cta,
          fallback: section.data.fallback,
          componentType: "list",
          items: renderedItems,
        };
      }

      throw new Error(`Unknown source collection: ${sourceCollection}`);
    },
    renderer: (section) =>
      section.type === "showcase" && section.componentType === "cards"
        ? "ShowcaseCardsSectionRenderer"
        : "ShowcaseListSectionRenderer",
  },
};

export async function buildHomepageSection(
  section: HomepageSectionEntry,
  context: HomepageSectionBuildContext
): Promise<HomepageSection> {
  const sectionType = section.data.type as HomepageSectionType;
  const definition = HOMEPAGE_SECTION_REGISTRY[sectionType];

  if (!definition) {
    throw new Error(`Unknown section type: ${section.data.type}`);
  }

  return definition.build(section, context);
}

export function resolveHomepageSectionRenderer(
  section: HomepageSection
): HomepageSectionRendererKey {
  return HOMEPAGE_SECTION_REGISTRY[section.type].renderer(section);
}
