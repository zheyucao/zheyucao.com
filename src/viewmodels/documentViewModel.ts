import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import { getPageMetadata, type PageMetadata } from "../lib/viewmodels/baseViewModel";
import { formatDateRange } from "../lib/utils/dateUtils";
import { sortByOrder } from "../lib/utils/sortUtils";

// Define types inline (can't import from .astro files)
export type GridSkillCategory = {
  name: string;
  items: string[];
};

export type DocumentContactItem = {
  icon: string;
  label: string;
  href?: string;
  target?: string;
  rel?: string;
};

type ResumeCollectionEntry = CollectionEntry<"resume">;
type ResumeCollectionData = ResumeCollectionEntry["data"];

type TypedResumeData = Extract<ResumeCollectionData, { type: string }>;
type StandardEntryData = Exclude<ResumeCollectionData, TypedResumeData>;
type SkillsEntryData = Extract<ResumeCollectionData, { type: "skills" }>;
type ContactEntryData = Extract<ResumeCollectionData, { type: "contact" }>;

export type DocumentEntryItem = {
  title: string;
  subtitle?: string;
  date?: string;
  startDate?: string; // For sorting
  endDate?: string; // For sorting when available
  details?: string[];
  order?: number;
  Content?: AstroComponentFactory;
};

type TextResumeSection = {
  id: string;
  title: string;
  type: "text";
  Content: AstroComponentFactory;
  content?: string[];
  visible?: boolean;
};

type EntryResumeSection = {
  id: string;
  title: string;
  type: "entries";
  variant?: "default" | "education" | "experience" | "awards" | "projects";
  content: DocumentEntryItem[];
  visible?: boolean;
};

type SkillsResumeSection = {
  id: string;
  title: string;
  type: "skills";
  content: GridSkillCategory[];
  visible?: boolean;
};

type ContactResumeSection = {
  id: string;
  title: string;
  type: "contact";
  content: DocumentContactItem[];
  visible?: boolean;
};

export type DocumentSection =
  | TextResumeSection
  | EntryResumeSection
  | SkillsResumeSection
  | ContactResumeSection;

type DocumentLayoutSection =
  | {
      id: string;
      type: "text";
      column: "main" | "sidebar";
      source: string;
      title?: string;
      visible: boolean;
    }
  | {
      id: string;
      type: "entries";
      column: "main" | "sidebar";
      sourcePrefix: string;
      title?: string;
      variant?: "default" | "education" | "experience" | "awards" | "projects";
      includeSubtitle: boolean;
      visible: boolean;
    }
  | {
      id: string;
      type: "skills";
      column: "main" | "sidebar";
      source: string;
      title?: string;
      visible: boolean;
    }
  | {
      id: string;
      type: "contact";
      column: "main" | "sidebar";
      source: string;
      title?: string;
      visible: boolean;
    };

const matchesSingleEntryId = (entryId: string, baseName: string): boolean =>
  entryId === baseName || entryId === `${baseName}.mdx` || entryId === `${baseName}.md`;

const getOrder = (entry: ResumeCollectionEntry): number | undefined =>
  "order" in entry.data ? entry.data.order : undefined;

const isStandardEntry = (
  entry: ResumeCollectionEntry
): entry is ResumeCollectionEntry & {
  data: StandardEntryData;
} => !("type" in entry.data);

const isSkillsEntry = (
  entry: ResumeCollectionEntry
): entry is ResumeCollectionEntry & {
  data: SkillsEntryData;
} => "type" in entry.data && entry.data.type === "skills";

const isContactEntry = (
  entry: ResumeCollectionEntry
): entry is ResumeCollectionEntry & {
  data: ContactEntryData;
} => "type" in entry.data && entry.data.type === "contact";

const DEFAULT_DOCUMENT_LAYOUT: DocumentLayoutSection[] = [
  {
    id: "profile",
    type: "text",
    column: "main",
    source: "profile/profile",
    visible: true,
  },
  {
    id: "education",
    type: "entries",
    column: "main",
    sourcePrefix: "education",
    title: "Education",
    variant: "education",
    includeSubtitle: true,
    visible: true,
  },
  {
    id: "awards",
    type: "entries",
    column: "main",
    sourcePrefix: "awards",
    title: "Honors & Awards",
    variant: "awards",
    includeSubtitle: true,
    visible: true,
  },
  {
    id: "experience",
    type: "entries",
    column: "main",
    sourcePrefix: "experience",
    title: "Experience",
    variant: "experience",
    includeSubtitle: true,
    visible: true,
  },
  {
    id: "projects",
    type: "entries",
    column: "main",
    sourcePrefix: "projects",
    title: "Projects",
    variant: "projects",
    includeSubtitle: false,
    visible: true,
  },
  {
    id: "skills",
    type: "skills",
    column: "sidebar",
    source: "skills",
    visible: true,
  },
  {
    id: "contact",
    type: "contact",
    column: "sidebar",
    source: "contact",
    visible: true,
  },
];

const toDefaultSectionTitle = (value: string): string =>
  value
    .split(/[-_/]/g)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");

/**
 * Process standard resume entries (education, experience, projects, awards).
 * Filters by prefix, renders content, formats dates, and sorts.
 */
async function processStandardEntries(
  allEntries: ResumeCollectionEntry[],
  prefix: string,
  options: { includeSubtitle?: boolean } = {}
): Promise<DocumentEntryItem[]> {
  const { includeSubtitle = true } = options;

  const filteredEntries = allEntries.filter(
    (entry): entry is ResumeCollectionEntry & { data: StandardEntryData } =>
      entry.id.startsWith(`${prefix}/`) && isStandardEntry(entry)
  );

  const processedEntries = await Promise.all(
    filteredEntries.map(async (entry) => {
      const { Content } = await entry.render();
      const item: DocumentEntryItem = {
        title: entry.data.title,
        date: formatDateRange(entry.data.startDate, entry.data.endDate),
        startDate: entry.data.startDate,
        endDate: entry.data.endDate,
        order: getOrder(entry),
        Content,
      };
      if (includeSubtitle && entry.data.subtitle) {
        item.subtitle = entry.data.subtitle;
      }
      return item;
    })
  );

  return sortByOrder(processedEntries, {
    getOrder: (e) => e.order,
    getDate: (e) => e.endDate ?? e.startDate,
  });
}

async function buildSectionFromLayout(
  sectionConfig: DocumentLayoutSection,
  allResumeContent: ResumeCollectionEntry[]
): Promise<DocumentSection> {
  if (sectionConfig.type === "text") {
    const textEntry = allResumeContent.find(
      (entry): entry is ResumeCollectionEntry & { data: StandardEntryData } =>
        matchesSingleEntryId(entry.id, sectionConfig.source) && isStandardEntry(entry)
    );
    if (!textEntry) {
      throw new Error(`Resume text entry not found: ${sectionConfig.source}`);
    }
    const { Content } = await textEntry.render();
    return {
      id: sectionConfig.id,
      title: sectionConfig.title ?? textEntry.data.title,
      type: "text",
      Content,
      visible: sectionConfig.visible,
    };
  }

  if (sectionConfig.type === "entries") {
    const content = await processStandardEntries(allResumeContent, sectionConfig.sourcePrefix, {
      includeSubtitle: sectionConfig.includeSubtitle,
    });

    return {
      id: sectionConfig.id,
      title: sectionConfig.title ?? toDefaultSectionTitle(sectionConfig.sourcePrefix),
      type: "entries",
      variant: sectionConfig.variant,
      content,
      visible: sectionConfig.visible,
    };
  }

  if (sectionConfig.type === "skills") {
    const skillsEntry = allResumeContent.find(
      (entry): entry is ResumeCollectionEntry & { data: SkillsEntryData } =>
        matchesSingleEntryId(entry.id, sectionConfig.source) && isSkillsEntry(entry)
    );
    if (!skillsEntry) {
      throw new Error(`Resume skills entry not found or invalid: ${sectionConfig.source}`);
    }

    return {
      id: sectionConfig.id,
      title: sectionConfig.title ?? skillsEntry.data.title,
      type: "skills",
      content: skillsEntry.data.content.map(
        (category): GridSkillCategory => ({
          name: category.category,
          items: category.items,
        })
      ),
      visible: sectionConfig.visible,
    };
  }

  const contactEntry = allResumeContent.find(
    (entry): entry is ResumeCollectionEntry & { data: ContactEntryData } =>
      matchesSingleEntryId(entry.id, sectionConfig.source) && isContactEntry(entry)
  );
  if (!contactEntry) {
    throw new Error(`Resume contact entry not found or invalid: ${sectionConfig.source}`);
  }

  return {
    id: sectionConfig.id,
    title: sectionConfig.title ?? contactEntry.data.title,
    type: "contact",
    content: contactEntry.data.content.map(
      (item): DocumentContactItem => ({
        icon: item.icon,
        label: item.label ?? item.description ?? item.icon,
        href: item.href,
        target: item.target,
        rel: item.rel,
      })
    ),
    visible: sectionConfig.visible,
  };
}

/**
 * Document page view model
 * Aggregates and organizes content into main column and sidebar
 */
export async function getDocumentViewModel(): Promise<{
  mainColumn: DocumentSection[];
  sidebar: DocumentSection[];
  metadata: PageMetadata;
}> {
  const allResumeContent = await getCollection("resume");

  const [layoutEntry, metadata] = await Promise.all([
    getEntry("document-layout", "default"),
    getPageMetadata("resume"),
  ]);
  const layoutSections = layoutEntry?.data.sections ?? DEFAULT_DOCUMENT_LAYOUT;

  const resolvedSections = await Promise.all(
    layoutSections.map((section) => buildSectionFromLayout(section, allResumeContent))
  );

  const mainColumn: DocumentSection[] = [];
  const sidebar: DocumentSection[] = [];

  layoutSections.forEach((sectionConfig, index) => {
    const section = resolvedSections[index];
    if (sectionConfig.column === "main") {
      mainColumn.push(section);
      return;
    }
    sidebar.push(section);
  });

  return {
    mainColumn,
    sidebar,
    metadata,
  };
}
