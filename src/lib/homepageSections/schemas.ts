import type {
  SectionSchemaBuilderHelpers,
  SectionSchemaBuilder,
  ZodLike,
  HomepageSectionType,
} from "./types";

export const ctaSchema = (z: SectionSchemaBuilderHelpers["z"]) =>
  z
    .object({
      text: z.string(),
      href: z.string(),
    })
    .optional();

export const heroSchema: SectionSchemaBuilder = ({ z }) =>
  z.object({
    type: z.literal("hero"),
    order: z.number(),
    visible: z.boolean().default(true),
    greeting: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
  });

export const textSchema: SectionSchemaBuilder = ({ z }) =>
  z.object({
    type: z.literal("text"),
    order: z.number(),
    visible: z.boolean().default(true),
    title: z.string().optional(),
    cta: ctaSchema(z),
  });

export const contactSchema: SectionSchemaBuilder = ({ z }) =>
  z.object({
    type: z.literal("contact"),
    order: z.number(),
    visible: z.boolean().default(true),
    title: z.string().optional(),
    cta: ctaSchema(z),
  });

export const showcaseSchema: SectionSchemaBuilder = ({ z }) =>
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
  });

const HOMEPAGE_SECTION_ORDER: HomepageSectionType[] = ["hero", "text", "contact", "showcase"];

export function buildHomepageSectionsSchemaUnion(z: unknown): unknown {
  const zod = z as ZodLike;
  // We need to access the registry to get the schemas, creating a circular dependency if we import HOMEPAGE_SECTION_REGISTRY directly.
  // Ideally, schemas should be defined in this file and exported, and registry should use them.
  // But for now, let's just use the schemas defined above if we can, or refactor registry to import them.
  // Wait, if I move buildHomepageSectionsSchemaUnion here, it needs HOMEPAGE_SECTION_REGISTRY if I strictly follow the old code:
  // const schemaOptions = HOMEPAGE_SECTION_ORDER.map((type) => HOMEPAGE_SECTION_REGISTRY[type].schema({ z: zod }));
  // Instead, I will export the schemas individually and build the union here using the exported functions, breaking the dependency.

  const schemaMap: Record<HomepageSectionType, SectionSchemaBuilder> = {
    hero: heroSchema,
    text: textSchema,
    contact: contactSchema,
    showcase: showcaseSchema,
  };

  const schemaOptions = HOMEPAGE_SECTION_ORDER.map((type) => schemaMap[type]({ z: zod }));
  return zod.discriminatedUnion("type", schemaOptions as [unknown, unknown, ...unknown[]]);
}
