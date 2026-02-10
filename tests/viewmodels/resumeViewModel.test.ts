import { describe, it, expect, vi, beforeEach } from "vitest";
import { getResumeViewModel, type ResumeSection } from "../../src/viewmodels/resumeViewModel";
import { getCollection, getEntry } from "astro:content";
import { getPageMetadata } from "../../src/lib/viewmodels/baseViewModel";

// Mock astro:content
vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
  getEntry: vi.fn(),
}));

// Mock baseViewModel
vi.mock("../../src/lib/viewmodels/baseViewModel", () => ({
  getPageMetadata: vi.fn(),
}));

const mockedGetCollection = vi.mocked(getCollection);
const mockedGetEntry = vi.mocked(getEntry);
const mockedGetPageMetadata = vi.mocked(getPageMetadata);

type EntrySection = Extract<ResumeSection, { type: "entries" }>;
type SkillsSection = Extract<ResumeSection, { type: "skills" }>;
type ContactSection = Extract<ResumeSection, { type: "contact" }>;

describe("resumeViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return resume view model correctly", async () => {
    const mockMetadata = { title: "Resume", description: "My Resume" };
    mockedGetPageMetadata.mockResolvedValue(mockMetadata as never);

    const mockEntries = [
      {
        id: "profile/me.md",
        data: { title: "Profile" },
        render: vi.fn().mockResolvedValue({ Content: "ProfileContent" }),
      },
      {
        id: "education/uni.md",
        data: { title: "University", date: "2020", order: 1 },
        render: vi.fn().mockResolvedValue({ Content: "UniContent" }),
      },
      {
        id: "experience/job.md",
        data: { title: "Job", date: "2021", order: 1 },
        render: vi.fn().mockResolvedValue({ Content: "JobContent" }),
      },
      {
        id: "projects/app.md",
        data: { title: "App", date: "2022", order: 1 },
        render: vi.fn().mockResolvedValue({ Content: "AppContent" }),
      },
      {
        id: "awards/award.md",
        data: { title: "Award", date: "2023", order: 1 },
        render: vi.fn().mockResolvedValue({ Content: "AwardContent" }),
      },
      {
        id: "skills.mdx",
        data: {
          type: "skills",
          title: "Skills",
          content: [{ category: "Lang", items: ["TS"] }],
        },
      },
      {
        id: "contact.mdx",
        data: {
          type: "contact",
          title: "Contact",
          content: [{ icon: "mail", href: "mailto:me" }],
        },
      },
    ];
    mockedGetCollection.mockResolvedValue(mockEntries as never);
    mockedGetEntry.mockResolvedValue(
      {
        data: {
          sections: [
            {
              id: "profile",
              type: "text",
              column: "main",
              source: "profile/me.md",
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
              source: "skills.mdx",
              visible: true,
            },
            {
              id: "contact",
              type: "contact",
              column: "sidebar",
              source: "contact.mdx",
              visible: true,
            },
          ],
        },
      } as never
    );

    const result = await getResumeViewModel();

    expect(result.metadata).toEqual(mockMetadata);

    // Check main column
    expect(result.mainColumn).toHaveLength(5);
    expect(result.mainColumn[0].id).toBe("profile");
    expect((result.mainColumn[0] as Extract<ResumeSection, { type: "text" }>).Content).toBe(
      "ProfileContent"
    );

    const educationSection = result.mainColumn[1] as EntrySection;
    expect(educationSection.id).toBe("education");
    expect(educationSection.content[0].title).toBe("University");

    const awardsSection = result.mainColumn[2] as EntrySection;
    expect(awardsSection.id).toBe("awards");
    expect(awardsSection.content[0].title).toBe("Award");

    const experienceSection = result.mainColumn[3] as EntrySection;
    expect(experienceSection.id).toBe("experience");
    expect(experienceSection.content[0].title).toBe("Job");

    const projectsSection = result.mainColumn[4] as EntrySection;
    expect(projectsSection.id).toBe("projects");
    expect(projectsSection.content[0].title).toBe("App");

    // Check sidebar
    expect(result.sidebar).toHaveLength(2);
    const skillsSection = result.sidebar[0] as SkillsSection;
    expect(skillsSection.id).toBe("skills");
    expect(skillsSection.content[0].name).toBe("Lang");

    const contactSection = result.sidebar[1] as ContactSection;
    expect(contactSection.id).toBe("contact");
    expect(contactSection.content[0].icon).toBe("mail");
  });

  it("should throw error if profile is missing", async () => {
    mockedGetCollection.mockResolvedValue([] as never);
    mockedGetEntry.mockResolvedValue(
      {
        data: {
          sections: [
            {
              id: "profile",
              type: "text",
              column: "main",
              source: "profile/me.md",
              visible: true,
            },
          ],
        },
      } as never
    );
    await expect(getResumeViewModel()).rejects.toThrow("Resume text entry not found: profile/me.md");
  });
});
