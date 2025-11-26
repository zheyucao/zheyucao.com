import { getCollection, type CollectionEntry } from "astro:content";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { SkillCategory as GridSkillCategory } from "../components/resume/templates/SkillGrid.astro";
import type { ContactItem as ResumeContactItem } from "../components/resume/templates/ContactList.astro";
import { getPageMetadata, type PageMetadata } from "../lib/viewmodels/baseViewModel";

type ResumeCollectionEntry = CollectionEntry<"resume">;
type ResumeCollectionData = ResumeCollectionEntry["data"];

type TypedResumeData = Extract<ResumeCollectionData, { type: string }>;
type StandardEntryData = Exclude<ResumeCollectionData, TypedResumeData>;
type AwardsEntryData = Extract<ResumeCollectionData, { type: "awards" }>;
type SkillsEntryData = Extract<ResumeCollectionData, { type: "skills" }>;
type ContactEntryData = Extract<ResumeCollectionData, { type: "contact" }>;

export type ResumeEntryItem = {
  title: string;
  subtitle?: string;
  date?: string;
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

const sortByOrder = <T extends { order?: number }>(items: T[]) =>
  items.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));

const getOrder = (entry: ResumeCollectionEntry): number | undefined =>
  "order" in entry.data ? entry.data.order : undefined;

const isStandardEntry = (
  entry: ResumeCollectionEntry
): entry is ResumeCollectionEntry & {
  data: StandardEntryData;
} => !("type" in entry.data);

const isAwardsEntry = (
  entry: ResumeCollectionEntry
): entry is ResumeCollectionEntry & {
  data: AwardsEntryData;
} => "type" in entry.data && entry.data.type === "awards";

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

  // Filter education entries
  const educationEntries = allResumeContent.filter(
    (entry): entry is ResumeCollectionEntry & { data: StandardEntryData } =>
      entry.id.startsWith("education/") && isStandardEntry(entry)
  );
  const education: ResumeEntryItem[] = await Promise.all(
    educationEntries.map(async (entry) => {
      const { Content } = await entry.render();
      return {
        title: entry.data.title,
        subtitle: entry.data.subtitle,
        date: entry.data.date,
        order: getOrder(entry),
        Content,
      };
    })
  );
  sortByOrder(education);

  // Filter experience entries
  const experienceEntries = allResumeContent.filter(
    (entry): entry is ResumeCollectionEntry & { data: StandardEntryData } =>
      entry.id.startsWith("experience/") && isStandardEntry(entry)
  );
  const experience: ResumeEntryItem[] = await Promise.all(
    experienceEntries.map(async (entry) => {
      const { Content } = await entry.render();
      return {
        title: entry.data.title,
        subtitle: entry.data.subtitle,
        date: entry.data.date,
        order: getOrder(entry),
        Content,
      };
    })
  );
  sortByOrder(experience);

  // Filter project entries
  const projectEntries = allResumeContent.filter(
    (entry): entry is ResumeCollectionEntry & { data: StandardEntryData } =>
      entry.id.startsWith("projects/") && isStandardEntry(entry)
  );
  const projects: ResumeEntryItem[] = await Promise.all(
    projectEntries.map(async (entry) => {
      const { Content } = await entry.render();
      return {
        title: entry.data.title,
        date: entry.data.date,
        order: getOrder(entry),
        Content,
      };
    })
  );
  sortByOrder(projects);

  // Fetch awards data
  const awardsEntry = allResumeContent.find(
    (entry): entry is ResumeCollectionEntry & { data: AwardsEntryData } =>
      entry.id === "awards.mdx" && isAwardsEntry(entry)
  );
  if (!awardsEntry) {
    console.error("Awards entry has wrong type or missing");
    throw new Error("Awards entry invalid type");
  }

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
      content: education,
    },
    {
      id: "awards",
      title: awardsEntry.data.title,
      type: "entries",
      variant: "awards",
      content: awardsEntry.data.content,
    },
    {
      id: "experience",
      title: "Experience",
      type: "entries",
      variant: "experience",
      content: experience,
    },
    {
      id: "projects",
      title: "Projects",
      type: "entries",
      variant: "projects",
      content: projects,
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
