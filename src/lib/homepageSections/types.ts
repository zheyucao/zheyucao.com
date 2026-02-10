import type { CollectionEntry } from "astro:content";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { ContactItem } from "../../viewmodels/contactViewModel";

export type HomepageSectionEntry = CollectionEntry<"homepage-sections">;
export type ContactEntry = CollectionEntry<"contact">;
export type ProjectEntry = CollectionEntry<"projects">;
export type TimelineEntry = CollectionEntry<"timeline">;

export type ShowcaseFilterValue = string | number | boolean | null;

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

export type HomepageSectionType = HomepageSection["type"];

export type HomepageSectionRendererKey =
  | "HeroSectionRenderer"
  | "TextSectionRenderer"
  | "ContactSectionRenderer"
  | "ShowcaseCardsSectionRenderer"
  | "ShowcaseListSectionRenderer";

export type SectionSchemaBuilderHelpers = {
  z: ZodLike;
};

export type SchemaLike = {
  optional: () => SchemaLike;
  default: (value: unknown) => SchemaLike;
};

export type ZodLike = {
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

export type SectionSchemaBuilder = (helpers: SectionSchemaBuilderHelpers) => unknown;

export interface HomepageSectionBuildContext {
  contactEntries: ContactEntry[];
  projectsEntries: ProjectEntry[];
  timelineEntries: TimelineEntry[];
}

export type SectionRegistryEntry = {
  type: HomepageSectionType;
  schema: SectionSchemaBuilder;
  build: (
    section: HomepageSectionEntry,
    context: HomepageSectionBuildContext
  ) => Promise<HomepageSection>;
  renderer: (section: HomepageSection) => HomepageSectionRendererKey;
};
