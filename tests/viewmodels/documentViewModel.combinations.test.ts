import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDocumentViewModel, type DocumentSection } from "../../src/viewmodels/documentViewModel";
import { getCollection, getEntry } from "astro:content";
import { getPageMetadata } from "../../src/lib/viewmodels/baseViewModel";

vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
  getEntry: vi.fn(),
}));

vi.mock("../../src/lib/viewmodels/baseViewModel", () => ({
  getPageMetadata: vi.fn(),
}));

const mockedGetCollection = vi.mocked(getCollection);
const mockedGetEntry = vi.mocked(getEntry);
const mockedGetPageMetadata = vi.mocked(getPageMetadata);

type EntrySection = Extract<DocumentSection, { type: "entries" }>;
type ContactSection = Extract<DocumentSection, { type: "contact" }>;
type SkillsSection = Extract<DocumentSection, { type: "skills" }>;

const createStandardEntry = (
  id: string,
  data: {
    title: string;
    subtitle?: string;
    startDate?: string;
    endDate?: string;
    order?: number;
  },
  content = `${id}-content`
) => ({
  id,
  data,
  render: vi.fn().mockResolvedValue({ Content: content }),
});

const createSkillsEntry = (id: string, categories = [{ category: "Lang", items: ["TS"] }]) => ({
  id,
  data: {
    type: "skills",
    title: "Skills",
    content: categories,
  },
});

const createContactEntry = (
  id: string,
  items: Array<{
    icon: string;
    label?: string;
    description?: string;
    href?: string;
    target?: string;
    rel?: string;
  }> = [{ icon: "ri:mail-line", label: "Email", href: "mailto:test@example.com" }]
) => ({
  id,
  data: {
    type: "contact",
    title: "Contact",
    content: items,
  },
});

function mockData(params: {
  resumeEntries: Array<Record<string, unknown>>;
  layoutSections?: Array<Record<string, unknown>>;
  metadata?: Record<string, unknown>;
}) {
  mockedGetCollection.mockResolvedValue(params.resumeEntries as never);
  mockedGetEntry.mockResolvedValue(
    params.layoutSections ? ({ data: { sections: params.layoutSections } } as never) : (undefined as never)
  );
  mockedGetPageMetadata.mockResolvedValue(
    (params.metadata ?? { title: "Resume", description: "Resume page" }) as never
  );
}

describe("documentViewModel combinations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses built-in default layout when resume-layout entry is missing", async () => {
    mockData({
      layoutSections: undefined,
      resumeEntries: [
        createStandardEntry("profile/profile.mdx", { title: "Profile" }, "ProfileContent"),
        createStandardEntry("education/bachelor.mdx", { title: "Bachelor", startDate: "2022-09" }),
        createStandardEntry("awards/award.mdx", { title: "Award", startDate: "2024-11" }),
        createStandardEntry("experience/internship.mdx", { title: "Internship", startDate: "2025-01" }),
        createStandardEntry("projects/site.mdx", { title: "Portfolio", startDate: "2025-04" }),
        createSkillsEntry("skills.mdx"),
        createContactEntry("contact.mdx"),
      ],
    });

    const result = await getDocumentViewModel();

    expect(result.mainColumn.map((section) => section.id)).toEqual([
      "profile",
      "education",
      "awards",
      "experience",
      "projects",
    ]);
    expect(result.sidebar.map((section) => section.id)).toEqual(["skills", "contact"]);
  });

  it("supports custom layout order and column placement", async () => {
    mockData({
      layoutSections: [
        {
          id: "skills-main",
          type: "skills",
          column: "main",
          source: "skills",
          title: "Core Skills",
          visible: false,
        },
        {
          id: "profile-side",
          type: "text",
          column: "sidebar",
          source: "profile/profile",
          title: "About Me",
          visible: true,
        },
      ],
      resumeEntries: [
        createStandardEntry("profile/profile.mdx", { title: "Profile" }, "ProfileContent"),
        createSkillsEntry("skills.mdx"),
      ],
    });

    const result = await getDocumentViewModel();

    expect(result.mainColumn).toHaveLength(1);
    expect(result.sidebar).toHaveLength(1);
    expect(result.mainColumn[0].id).toBe("skills-main");
    expect(result.mainColumn[0].visible).toBe(false);
    expect(result.sidebar[0].id).toBe("profile-side");
  });

  it("omits subtitle when includeSubtitle is false", async () => {
    mockData({
      layoutSections: [
        {
          id: "projects",
          type: "entries",
          column: "main",
          sourcePrefix: "projects",
          includeSubtitle: false,
          visible: true,
        },
      ],
      resumeEntries: [
        createStandardEntry("projects/app.mdx", {
          title: "App",
          subtitle: "Should not be included",
          startDate: "2025-01",
        }),
      ],
    });

    const result = await getDocumentViewModel();
    const projects = result.mainColumn[0] as EntrySection;

    expect(projects.content[0].subtitle).toBeUndefined();
  });

  it("keeps subtitle when includeSubtitle is true", async () => {
    mockData({
      layoutSections: [
        {
          id: "projects",
          type: "entries",
          column: "main",
          sourcePrefix: "projects",
          includeSubtitle: true,
          visible: true,
        },
      ],
      resumeEntries: [
        createStandardEntry("projects/app.mdx", {
          title: "App",
          subtitle: "Should be included",
          startDate: "2025-01",
        }),
      ],
    });

    const result = await getDocumentViewModel();
    const projects = result.mainColumn[0] as EntrySection;

    expect(projects.content[0].subtitle).toBe("Should be included");
  });

  it("derives entry section title from sourcePrefix when title is omitted", async () => {
    mockData({
      layoutSections: [
        {
          id: "oss-projects",
          type: "entries",
          column: "main",
          sourcePrefix: "open-source_projects",
          includeSubtitle: true,
          visible: true,
        },
      ],
      resumeEntries: [
        createStandardEntry("open-source_projects/a.mdx", {
          title: "Repo A",
          startDate: "2024-01",
        }),
      ],
    });

    const result = await getDocumentViewModel();

    expect(result.mainColumn[0].title).toBe("Open Source Projects");
  });

  it("sorts entry items by positive order first, then by date for unordered items", async () => {
    mockData({
      layoutSections: [
        {
          id: "experience",
          type: "entries",
          column: "main",
          sourcePrefix: "experience",
          includeSubtitle: true,
          visible: true,
        },
      ],
      resumeEntries: [
        createStandardEntry("experience/ordered-2.mdx", {
          title: "Ordered 2",
          order: 2,
          startDate: "2024-01",
        }),
        createStandardEntry("experience/unordered-old.mdx", {
          title: "Unordered Old",
          startDate: "2023-01",
        }),
        createStandardEntry("experience/ordered-1.mdx", {
          title: "Ordered 1",
          order: 1,
          startDate: "2022-01",
        }),
        createStandardEntry("experience/unordered-new.mdx", {
          title: "Unordered New",
          startDate: "2025-01",
        }),
      ],
    });

    const result = await getDocumentViewModel();
    const experience = result.mainColumn[0] as EntrySection;

    expect(experience.content.map((item) => item.title)).toEqual([
      "Ordered 1",
      "Ordered 2",
      "Unordered New",
      "Unordered Old",
    ]);
  });

  it("maps contact labels with precedence label > description > icon", async () => {
    mockData({
      layoutSections: [
        {
          id: "contact",
          type: "contact",
          column: "sidebar",
          source: "contact",
          visible: true,
        },
      ],
      resumeEntries: [
        createContactEntry("contact.mdx", [
          { icon: "ri:mail-line", label: "Email", description: "Email Desc", href: "mailto:a@b.com" },
          { icon: "ri:github-line", description: "GitHub Desc", href: "https://github.com/example" },
          { icon: "ri:wechat-line" },
        ]),
      ],
    });

    const result = await getDocumentViewModel();
    const contact = result.sidebar[0] as ContactSection;

    expect(contact.content.map((item) => item.label)).toEqual(["Email", "GitHub Desc", "ri:wechat-line"]);
  });

  it("matches source ids with explicit .md/.mdx forms", async () => {
    mockData({
      layoutSections: [
        {
          id: "profile-md",
          type: "text",
          column: "main",
          source: "profile/profile.md",
          visible: true,
        },
        {
          id: "skills-md",
          type: "skills",
          column: "sidebar",
          source: "skills.md",
          visible: true,
        },
        {
          id: "contact-md",
          type: "contact",
          column: "sidebar",
          source: "contact.md",
          visible: true,
        },
      ],
      resumeEntries: [
        createStandardEntry("profile/profile.md", { title: "Profile Md" }, "ProfileMdContent"),
        createSkillsEntry("skills.md"),
        createContactEntry("contact.md"),
      ],
    });

    const result = await getDocumentViewModel();
    const textSection = result.mainColumn[0] as Extract<DocumentSection, { type: "text" }>;
    const skillsSection = result.sidebar[0] as SkillsSection;

    expect(textSection.Content).toBe("ProfileMdContent");
    expect(skillsSection.content[0].name).toBe("Lang");
    expect(result.sidebar[1].id).toBe("contact-md");
  });

  it("throws when a configured skills source is missing", async () => {
    mockData({
      layoutSections: [
        {
          id: "skills",
          type: "skills",
          column: "sidebar",
          source: "skills",
          visible: true,
        },
      ],
      resumeEntries: [],
    });

    await expect(getDocumentViewModel()).rejects.toThrow(
      "Resume skills entry not found or invalid: skills"
    );
  });

  it("throws when a configured contact source is missing", async () => {
    mockData({
      layoutSections: [
        {
          id: "contact",
          type: "contact",
          column: "sidebar",
          source: "contact",
          visible: true,
        },
      ],
      resumeEntries: [],
    });

    await expect(getDocumentViewModel()).rejects.toThrow(
      "Resume contact entry not found or invalid: contact"
    );
  });

  it("throws when a configured text source is missing", async () => {
    mockData({
      layoutSections: [
        {
          id: "profile",
          type: "text",
          column: "main",
          source: "profile/not-found",
          visible: true,
        },
      ],
      resumeEntries: [],
    });

    await expect(getDocumentViewModel()).rejects.toThrow(
      "Resume text entry not found: profile/not-found"
    );
  });
});
