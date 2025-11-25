import { getCollection, type CollectionEntry } from "astro:content";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";

type ResumeCollectionEntry = CollectionEntry<"resume">;

export type ResumeAction = {
  text: string;
  href: string;
  style?: string;
  download?: string;
  icon?: string;
  iconPosition?: "left" | "right";
  target?: string;
  rel?: string;
};

export type ResumeEntryItem = {
  title: string;
  subtitle?: string;
  date?: string;
  details?: string[];
  order?: number;
  Content?: AstroComponentFactory;
};

type SkillCategory = {
  category: string;
  items: string[];
};

type ContactContentItem = {
  icon: string;
  label?: string;
  href?: string;
  target?: string;
  rel?: string;
  description?: string;
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
  content: ResumeEntryItem[];
  visible?: boolean;
};

type SkillsResumeSection = {
  id: string;
  title: string;
  type: "skills";
  content: SkillCategory[];
  visible?: boolean;
};

type ContactResumeSection = {
  id: string;
  title: string;
  type: "contact";
  content: ContactContentItem[];
  visible?: boolean;
};

export type ResumeSection =
  | TextResumeSection
  | EntryResumeSection
  | SkillsResumeSection
  | ContactResumeSection;

export type ResumeMetadata = {
  title: string;
  subtitle?: string;
  date?: string;
  order?: number;
  actions?: ResumeAction[];
};

const sortByOrder = <T extends { order?: number }>(items: T[]) =>
  items.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));

const getOrder = (entry: ResumeCollectionEntry): number | undefined =>
  "order" in entry.data ? entry.data.order : undefined;

/**
 * Resume page view model
 * Aggregates and organizes resume content into main column and sidebar
 */
export async function getResumeViewModel(): Promise<{
  mainColumn: ResumeSection[];
  sidebar: ResumeSection[];
  metadata: ResumeMetadata;
}> {
  // Fetch all resume content
  const allResumeContent = await getCollection("resume");

  // Filter profile
  const profileEntry = allResumeContent.find((entry) => entry.id.startsWith("profile/"));
  if (!profileEntry) throw new Error("Profile entry not found");
  const { Content: ProfileContent } = await profileEntry.render();

  // Filter education entries
  const educationEntries = allResumeContent.filter((entry) => entry.id.startsWith("education/"));
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
  const experienceEntries = allResumeContent.filter((entry) => entry.id.startsWith("experience/"));
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
  const projectEntries = allResumeContent.filter((entry) => entry.id.startsWith("projects/"));
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
  const awardsEntry = allResumeContent.find((entry) => entry.id === "awards.mdx");
  if (!awardsEntry || awardsEntry.data.type !== "awards") {
    console.error("Awards entry has wrong type:", awardsEntry?.data.type);
    throw new Error("Awards entry invalid type");
  }

  // Fetch skills data
  const skillsEntry = allResumeContent.find((entry) => entry.id === "skills.mdx");
  if (!skillsEntry || skillsEntry.data.type !== "skills") {
    throw new Error("Skills entry not found or invalid");
  }

  // Fetch contact data
  const contactEntry = allResumeContent.find((entry) => entry.id === "contact.mdx");
  if (!contactEntry || contactEntry.data.type !== "contact") {
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
      content: education,
    },
    {
      id: "awards",
      title: awardsEntry.data.title,
      type: "entries",
      content: awardsEntry.data.content,
    },
    {
      id: "experience",
      title: "Experience",
      type: "entries",
      content: experience,
    },
    {
      id: "projects",
      title: "Projects",
      type: "entries",
      content: projects,
    },
  ];

  const sidebar: ResumeSection[] = [
    {
      id: "skills",
      title: skillsEntry.data.title,
      type: "skills",
      content: skillsEntry.data.content,
    },
    {
      id: "contact",
      title: contactEntry.data.title,
      type: "contact",
      content: contactEntry.data.content,
    },
  ];

  // Fetch metadata
  const metadataEntry = allResumeContent.find((entry) => entry.id === "metadata.mdx");
  if (!metadataEntry) throw new Error("Metadata entry not found");
  const metadata: ResumeMetadata = {
    title: metadataEntry.data.title,
    subtitle: metadataEntry.data.subtitle,
    date: metadataEntry.data.date,
    order: getOrder(metadataEntry),
    actions: "actions" in metadataEntry.data ? metadataEntry.data.actions : undefined,
  };

  return {
    mainColumn,
    sidebar,
    metadata,
  };
}
