import { beforeEach, describe, expect, it, vi } from "vitest";
import { getHomepageSectionsViewModel } from "../../src/viewmodels/homepageSectionsViewModel";
import { getCollection } from "astro:content";

vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
}));

const mockedGetCollection = vi.mocked(getCollection);

const createSection = (id: string, data: Record<string, unknown>, content = `${id}-content`) => ({
  id,
  data,
  render: vi.fn().mockResolvedValue({ Content: content }),
});

const createProject = (
  id: string,
  data: {
    title: string;
    startDate?: string;
    endDate?: string;
    order?: number;
    isFeatured: boolean;
  }
) => ({
  id,
  slug: id,
  data,
});

const createTimeline = (
  id: string,
  data: {
    title: string;
    startDate: string;
    endDate?: string;
    category: string;
    isHighlight: boolean;
  }
) => ({
  id,
  data,
  render: vi.fn().mockResolvedValue({ Content: `${id}-content` }),
});

function setup(params: {
  sections: ReturnType<typeof createSection>[];
  projects?: ReturnType<typeof createProject>[];
  timeline?: ReturnType<typeof createTimeline>[];
  contact?: Array<Record<string, unknown>>;
}) {
  mockedGetCollection.mockImplementation((name: string) => {
    if (name === "homepage-sections") return Promise.resolve(params.sections as never);
    if (name === "projects") return Promise.resolve((params.projects ?? []) as never);
    if (name === "timeline") return Promise.resolve((params.timeline ?? []) as never);
    if (name === "contact") return Promise.resolve((params.contact ?? []) as never);
    return Promise.reject(new Error(`Unexpected collection ${name}`));
  });
}

describe("homepageSectionsViewModel matrix scenarios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const projectCases = [
    {
      sortBy: "order",
      sortOrder: undefined,
      limit: undefined,
      expected: ["Project A", "Project B", "Project C"],
    },
    {
      sortBy: "order",
      sortOrder: undefined,
      limit: 2,
      expected: ["Project A", "Project B"],
    },
    {
      sortBy: "date",
      sortOrder: "desc",
      limit: undefined,
      expected: ["Project C", "Project B", "Project A"],
    },
    {
      sortBy: "date",
      sortOrder: "asc",
      limit: undefined,
      expected: ["Project A", "Project B", "Project C"],
    },
    {
      sortBy: "date",
      sortOrder: "asc",
      limit: 1,
      expected: ["Project A"],
    },
    {
      sortBy: undefined,
      sortOrder: undefined,
      limit: undefined,
      expected: ["Project A", "Project B", "Project C"],
    },
  ] as const;

  projectCases.forEach((scenario, index) => {
    it(`projects matrix scenario #${index + 1}`, async () => {
      setup({
        sections: [
          createSection("projects", {
            type: "showcase",
            order: 1,
            sourceCollection: "projects",
            componentType: "cards",
            sortBy: scenario.sortBy,
            sortOrder: scenario.sortOrder,
            limit: scenario.limit,
            filter: { isFeatured: true },
          }),
        ],
        projects: [
          createProject("a", {
            title: "Project A",
            order: 1,
            startDate: "2023-01",
            isFeatured: true,
          }),
          createProject("b", {
            title: "Project B",
            order: 2,
            startDate: "2024-01",
            isFeatured: true,
          }),
          createProject("c", {
            title: "Project C",
            order: 3,
            startDate: "2025-01",
            isFeatured: true,
          }),
          createProject("x", {
            title: "Project X",
            order: 0,
            startDate: "2022-01",
            isFeatured: false,
          }),
        ],
      });

      const [result] = await getHomepageSectionsViewModel();
      expect(result.type).toBe("showcase");
      if (result.type !== "showcase" || result.componentType !== "cards") {
        throw new Error("Unexpected section type");
      }
      expect(result.items.map((item) => item.data.title)).toEqual(scenario.expected);
    });
  });

  const timelineCases = [
    {
      sortBy: "date",
      sortOrder: "desc",
      limit: undefined,
      expected: ["Event C", "Event B", "Event A"],
    },
    {
      sortBy: "date",
      sortOrder: "asc",
      limit: undefined,
      expected: ["Event A", "Event B", "Event C"],
    },
    {
      sortBy: "date",
      sortOrder: "asc",
      limit: 2,
      expected: ["Event A", "Event B"],
    },
    {
      sortBy: undefined,
      sortOrder: undefined,
      limit: undefined,
      expected: ["Event A", "Event B", "Event C"],
    },
  ] as const;

  timelineCases.forEach((scenario, index) => {
    it(`timeline matrix scenario #${index + 1}`, async () => {
      setup({
        sections: [
          createSection("timeline", {
            type: "showcase",
            order: 1,
            sourceCollection: "timeline",
            componentType: "list",
            sortBy: scenario.sortBy,
            sortOrder: scenario.sortOrder,
            limit: scenario.limit,
            filter: { isHighlight: true },
          }),
        ],
        timeline: [
          createTimeline("a", {
            title: "Event A",
            startDate: "2023-01",
            category: "Experiences",
            isHighlight: true,
          }),
          createTimeline("b", {
            title: "Event B",
            startDate: "2024-01",
            category: "Experiences",
            isHighlight: true,
          }),
          createTimeline("c", {
            title: "Event C",
            startDate: "2025-01",
            category: "Honors",
            isHighlight: true,
          }),
          createTimeline("x", {
            title: "Event X",
            startDate: "2022-01",
            category: "Honors",
            isHighlight: false,
          }),
        ],
      });

      const [result] = await getHomepageSectionsViewModel();
      expect(result.type).toBe("showcase");
      if (result.type !== "showcase" || result.componentType !== "list") {
        throw new Error("Unexpected section type");
      }
      expect(result.items.map((item) => item.data.title)).toEqual(scenario.expected);
      expect(result.items.every((item) => typeof item.Content === "string")).toBe(true);
    });
  });

  it("contact section auto-loads showOnHome items from list entries", async () => {
    setup({
      sections: [
        createSection("connect", {
          type: "contact",
          order: 1,
        }),
      ],
      contact: [
        {
          id: "list-a",
          data: {
            type: "list",
            items: [
              { icon: "ri:mail-line", showOnHome: true },
              { icon: "ri:github-line", showOnHome: false },
            ],
          },
        },
        {
          id: "list-b",
          data: {
            type: "list",
            items: [{ icon: "ri:twitter-line", showOnHome: true }],
          },
        },
      ],
    });

    const [result] = await getHomepageSectionsViewModel();
    expect(result.type).toBe("contact");
    if (result.type !== "contact") {
      throw new Error("Unexpected section type");
    }
    expect(result.contactIcons?.map((item) => item.icon)).toEqual([
      "ri:mail-line",
      "ri:twitter-line",
    ]);
  });
});
