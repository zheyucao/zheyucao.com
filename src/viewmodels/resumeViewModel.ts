import { getCollection, type CollectionEntry } from "astro:content";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import { getPageMetadata, type PageMetadata } from "../lib/viewmodels/baseViewModel";
import { formatDateRange } from "../lib/utils/dateUtils";

// Define types inline (can't import from .astro files)
export type GridSkillCategory = {
  name: string;
  items: string[];
};

export type ResumeContactItem = {
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

export type ResumeEntryItem = {
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
  content: ResumeEntryItem[];
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
  content: ResumeContactItem[];
  visible?: boolean;
};

export type ResumeSection =
  | TextResumeSection
  | EntryResumeSection
  | SkillsResumeSection
  | ContactResumeSection;

import { sortByOrder } from "../lib/utils/sortUtils";

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

/**
 * Process standard resume entries (education, experience, projects, awards).
 * Filters by prefix, renders content, formats dates, and sorts.
 */
async function processStandardEntries(
  allEntries: ResumeCollectionEntry[],
  prefix: string,
  options: { includeSubtitle?: boolean } = {}
): Promise<ResumeEntryItem[]> {
  const { includeSubtitle = true } = options;

  const filteredEntries = allEntries.filter(
    (entry): entry is ResumeCollectionEntry & { data: StandardEntryData } =>
      entry.id.startsWith(`${prefix}/`) && isStandardEntry(entry)
  );

  const processedEntries = await Promise.all(
    filteredEntries.map(async (entry) => {
      const { Content } = await entry.render();
      const item: ResumeEntryItem = {
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

/**
 * Résumé page view model
 * Aggregates and organizes resume content into main column and sidebar
 */
export async function getResumeViewModel(): Promise<{
  mainColumn: ResumeSection[];
  sidebar: ResumeSection[];
  metadata: PageMetadata;
}> {
  // Fetch all resume content
  const allResumeContent = await getCollection("resume");

  // Filter profile
  const profileEntry = allResumeContent.find(
    (entry): entry is ResumeCollectionEntry & { data: StandardEntryData } =>
      entry.id.startsWith("profile/") && isStandardEntry(entry)
  );
  if (!profileEntry) throw new Error("Profile entry not found");
  const { Content: ProfileContent } = await profileEntry.render();

  // Process entry sections using helper
  const [sortedEducation, sortedExperience, sortedProjects, sortedAwards] = await Promise.all([
    processStandardEntries(allResumeContent, "education"),
    processStandardEntries(allResumeContent, "experience"),
    processStandardEntries(allResumeContent, "projects", { includeSubtitle: false }),
    processStandardEntries(allResumeContent, "awards"),
  ]);

  // Fetch skills data
  const skillsEntry = allResumeContent.find(
    (entry): entry is ResumeCollectionEntry & { data: SkillsEntryData } =>
      entry.id === "skills.mdx" && isSkillsEntry(entry)
  );
  if (!skillsEntry) {
    throw new Error("Skills entry not found or invalid");
  }

  // Fetch contact data
  const contactEntry = allResumeContent.find(
    (entry): entry is ResumeCollectionEntry & { data: ContactEntryData } =>
      entry.id === "contact.mdx" && isContactEntry(entry)
  );
  if (!contactEntry) {
    throw new Error("Contact entry not found or invalid");
  }

  // Build mainColumn and sidebar structure
  const mainColumn: ResumeSection[] = [
    {
      id: "profile",
      title: profileEntry.data.title,
      type: "text",
      Content: ProfileContent,
    },
    {
      id: "education",
      title: "Education",
      type: "entries",
      variant: "education",
      content: sortedEducation,
    },
    {
      id: "awards",
      title: "Honors & Awards",
      type: "entries",
      variant: "awards",
      content: sortedAwards,
    },
    {
      id: "experience",
      title: "Experience",
      type: "entries",
      variant: "experience",
      content: sortedExperience,
    },
    {
      id: "projects",
      title: "Projects",
      type: "entries",
      variant: "projects",
      content: sortedProjects,
    },
  ];

  const sidebar: ResumeSection[] = [
    {
      id: "skills",
      title: skillsEntry.data.title,
      type: "skills",
      content: skillsEntry.data.content.map(
        (category): GridSkillCategory => ({
          name: category.category,
          items: category.items,
        })
      ),
    },
    {
      id: "contact",
      title: contactEntry.data.title,
      type: "contact",
      content: contactEntry.data.content.map(
        (item): ResumeContactItem => ({
          icon: item.icon,
          label: item.label ?? item.description ?? item.icon,
          href: item.href,
          target: item.target,
          rel: item.rel,
        })
      ),
    },
  ];

  // Fetch metadata from centralized page-metadata collection
  const metadata = await getPageMetadata("resume");

  return {
    mainColumn,
    sidebar,
    metadata,
  };
}
