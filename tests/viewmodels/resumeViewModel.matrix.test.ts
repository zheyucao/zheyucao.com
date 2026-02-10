import { beforeEach, describe, expect, it, vi } from "vitest";
import { getResumeViewModel, type ResumeSection } from "../../src/viewmodels/resumeViewModel";
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

const createStd = (
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

const createSkills = (id: string, title = "Skills") => ({
  id,
  data: {
    type: "skills",
    title,
    content: [{ category: "Languages", items: ["TS", "JS"] }],
  },
});

const createContact = (id: string, title = "Contact") => ({
  id,
  data: {
    type: "contact",
    title,
    content: [{ icon: "ri:mail-line", label: "Email", href: "mailto:test@example.com" }],
  },
});

type EntrySection = Extract<ResumeSection, { type: "entries" }>;

function setup(params: {
  sections: Array<Record<string, unknown>>;
  entries: Array<Record<string, unknown>>;
}) {
  mockedGetPageMetadata.mockResolvedValue({ title: "Resume", description: "Resume page" } as never);
  mockedGetEntry.mockResolvedValue({ data: { sections: params.sections } } as never);
  mockedGetCollection.mockResolvedValue(params.entries as never);
}

describe("resumeViewModel matrix scenarios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const includeSubtitleCases = [true, false] as const;
  const variantCases = ["default", "education", "experience", "awards", "projects"] as const;

  includeSubtitleCases.forEach((includeSubtitle) => {
    variantCases.forEach((variant) => {
      it(`entries matrix includeSubtitle=${includeSubtitle} variant=${variant}`, async () => {
        setup({
          sections: [
            {
              id: `entries-${variant}-${includeSubtitle}`,
              type: "entries",
              column: "main",
              sourcePrefix: "experience",
              includeSubtitle,
              variant,
              visible: true,
            },
          ],
          entries: [
            createStd("experience/a.mdx", {
              title: "Role A",
              subtitle: "Subtitle A",
              startDate: "2024-01",
            }),
          ],
        });

        const result = await getResumeViewModel();
        const section = result.mainColumn[0] as EntrySection;
        expect(section.variant).toBe(variant);
        if (includeSubtitle) {
          expect(section.content[0].subtitle).toBe("Subtitle A");
        } else {
          expect(section.content[0].subtitle).toBeUndefined();
        }
      });
    });
  });

  const titleDerivationCases = [
    ["work-history", "Work History"],
    ["open_source", "Open Source"],
    ["machine-learning_projects", "Machine Learning Projects"],
  ] as const;

  titleDerivationCases.forEach(([sourcePrefix, expectedTitle]) => {
    it(`derives title from sourcePrefix=${sourcePrefix}`, async () => {
      setup({
        sections: [
          {
            id: `entries-${sourcePrefix}`,
            type: "entries",
            column: "main",
            sourcePrefix,
            includeSubtitle: true,
            visible: true,
          },
        ],
        entries: [createStd(`${sourcePrefix}/item.mdx`, { title: "Item", startDate: "2024-01" })],
      });

      const result = await getResumeViewModel();
      expect(result.mainColumn[0].title).toBe(expectedTitle);
    });
  });

  it("matrix: sections preserve configured order across columns", async () => {
    setup({
      sections: [
        { id: "contact-1", type: "contact", column: "main", source: "contact", visible: true },
        { id: "skills-1", type: "skills", column: "main", source: "skills", visible: true },
        { id: "profile-1", type: "text", column: "sidebar", source: "profile/profile", visible: true },
        {
          id: "experience-1",
          type: "entries",
          column: "sidebar",
          sourcePrefix: "experience",
          includeSubtitle: true,
          visible: true,
        },
      ],
      entries: [
        createContact("contact.mdx"),
        createSkills("skills.mdx"),
        createStd("profile/profile.mdx", { title: "Profile" }, "ProfileContent"),
        createStd("experience/a.mdx", { title: "Role A", startDate: "2024-01" }),
      ],
    });

    const result = await getResumeViewModel();
    expect(result.mainColumn.map((section) => section.id)).toEqual(["contact-1", "skills-1"]);
    expect(result.sidebar.map((section) => section.id)).toEqual(["profile-1", "experience-1"]);
  });

  const sourceMatchCases = [
    ["profile/profile", "profile/profile.mdx"],
    ["profile/profile.mdx", "profile/profile.mdx"],
    ["profile/profile.md", "profile/profile.md"],
  ] as const;

  sourceMatchCases.forEach(([source, storedId]) => {
    it(`matches text source variant ${source}`, async () => {
      setup({
        sections: [{ id: "profile", type: "text", column: "main", source, visible: true }],
        entries: [createStd(storedId, { title: "Profile" }, "ProfileContent")],
      });
      const result = await getResumeViewModel();
      const section = result.mainColumn[0] as Extract<ResumeSection, { type: "text" }>;
      expect(section.Content).toBe("ProfileContent");
    });
  });
});
