import type { CollectionEntry } from "astro:content";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import { sortByOrder } from "../utils/sortUtils";
import { formatDateRange } from "../utils/dateUtils";
import type { ContactItem } from "../../viewmodels/contactViewModel";

type HomepageSectionEntry = CollectionEntry<"homepage-sections">;
type ContactEntry = CollectionEntry<"contact">;
type ProjectEntry = CollectionEntry<"projects">;
type TimelineEntry = CollectionEntry<"timeline">;

type ShowcaseFilterValue = string | number | boolean | null;

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
  items: ProjectEntry[];
};

export type TimelineShowcaseSection = BaseShowcaseSection & {
  componentType: "list";
  items: Array<TimelineEntry & { Content: AstroComponentFactory }>;
};

export type HomepageSection =
  | HeroSection
  | TextSection
  | ContactSection
  | ProjectShowcaseSection
  | TimelineShowcaseSection;

type HomepageSectionType = HomepageSection["type"];

export type HomepageSectionRendererKey =
  | "HeroSectionRenderer"
  | "TextSectionRenderer"
  | "ContactSectionRenderer"
  | "ShowcaseCardsSectionRenderer"
  | "ShowcaseListSectionRenderer";

type SectionSchemaBuilderHelpers = {
  z: ZodLike;
};

type SchemaLike = {
  optional: () => SchemaLike;
  default: (value: unknown) => SchemaLike;
};

type ZodLike = {
  object: (shape: Record<string, unknown>) => SchemaLike;
  literal: (value: string) => SchemaLike;
  number: () => SchemaLike;
  boolean: () => SchemaLike;
  string: () => SchemaLike;
  record: (value: unknown) => SchemaLike;
  union: (options: unknown[]) => SchemaLike;
  enum: (values: readonly string[]) => SchemaLike;
  null: () => SchemaLike;
  discriminatedUnion: (key: string, options: [unknown, unknown, ...unknown[]]) => unknown;
};

type SectionSchemaBuilder = (helpers: SectionSchemaBuilderHelpers) => unknown;

export interface HomepageSectionBuildContext {
  contactEntries: ContactEntry[];
  projectsEntries: ProjectEntry[];
  timelineEntries: TimelineEntry[];
}

type SectionRegistryEntry = {
  type: HomepageSectionType;
  schema: SectionSchemaBuilder;
  build: (
    section: HomepageSectionEntry,
    context: HomepageSectionBuildContext
  ) => Promise<HomepageSection>;
  renderer: (section: HomepageSection) => HomepageSectionRendererKey;
};

const applyCollectionQuery = <T>(
  items: T[],
  options: {
    filter?: Record<string, ShowcaseFilterValue>;
    sortBy?: "order" | "date";
    sortOrder?: "asc" | "desc";
    limit?: number;
    getOrder?: (item: T) => number | undefined;
    getDate?: (item: T) => string | undefined;
  }
): T[] => {
  let result = [...items];

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

  if (options.sortBy === "order" && options.getOrder) {
    result = sortByOrder(result, { getOrder: options.getOrder });
  } else if (options.sortBy === "date" && options.getDate) {
    result = sortByOrder(result, { getDate: options.getDate });
    if (options.sortOrder === "asc") {
      result = result.reverse();
    }
  }

  if (options.limit) {
    result = result.slice(0, options.limit);
  }

  return result;
};

const ctaSchema = (z: SectionSchemaBuilderHelpers["z"]) =>
  z
    .object({
      text: z.string(),
      href: z.string(),
    })
    .optional();

export const HOMEPAGE_SECTION_REGISTRY: Record<HomepageSectionType, SectionRegistryEntry> = {
  hero: {
    type: "hero",
    schema: ({ z }) =>
      z.object({
        type: z.literal("hero"),
        order: z.number(),
        visible: z.boolean().default(true),
        greeting: z.string().optional(),
        name: z.string(),
        description: z.string().optional(),
      }),
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
    schema: ({ z }) =>
      z.object({
        type: z.literal("text"),
        order: z.number(),
        visible: z.boolean().default(true),
        title: z.string().optional(),
        cta: ctaSchema(z),
      }),
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
    schema: ({ z }) =>
      z.object({
        type: z.literal("contact"),
        order: z.number(),
        visible: z.boolean().default(true),
        title: z.string().optional(),
        cta: ctaSchema(z),
      }),
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
    schema: ({ z }) =>
      z.object({
        type: z.literal("showcase"),
        order: z.number(),
        visible: z.boolean().default(true),
        title: z.string().optional(),
        cta: ctaSchema(z),
        fallback: z.string().optional(),
        sourceCollection: z.enum(["projects", "timeline"]),
        filter: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
        sortBy: z.enum(["order", "date"]).optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        limit: z.number().optional(),
        componentType: z.enum(["cards", "list"]),
      }),
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

const HOMEPAGE_SECTION_ORDER: HomepageSectionType[] = ["hero", "text", "contact", "showcase"];

export function buildHomepageSectionsSchemaUnion(z: unknown): unknown {
  const zod = z as ZodLike;
  const schemaOptions = HOMEPAGE_SECTION_ORDER.map((type) =>
    HOMEPAGE_SECTION_REGISTRY[type].schema({ z: zod })
  );
  return zod.discriminatedUnion("type", schemaOptions as [unknown, unknown, ...unknown[]]);
}

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

export function resolveHomepageSectionRenderer(section: HomepageSection): HomepageSectionRendererKey {
  return HOMEPAGE_SECTION_REGISTRY[section.type].renderer(section);
}
