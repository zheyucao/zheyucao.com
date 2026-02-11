import { beforeEach, describe, expect, it, vi } from "vitest";
import { getHomepageSectionsViewModel } from "../../src/viewmodels/homepageSectionsViewModel";
import { getCollection } from "astro:content";

vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
}));

const mockedGetCollection = vi.mocked(getCollection);

type MockEntry = {
  id: string;
  data: Record<string, unknown>;
  render?: () => Promise<{ Content: string }>;
};

const createSectionEntry = (
  id: string,
  data: Record<string, unknown>,
  content = "SectionContent"
) => ({
  id,
  data,
  render: vi.fn().mockResolvedValue({ Content: content }),
});

const createProjectEntry = (
  id: string,
  data: Record<string, unknown> & { title: string; isFeatured: boolean }
) => ({
  id,
  slug: id,
  data,
});

const createTimelineEntry = (
  id: string,
  data: Record<string, unknown> & { title: string; startDate: string; category: string },
  content = `${id}-content`
) => ({
  id,
  data,
  render: vi.fn().mockResolvedValue({ Content: content }),
});

function mockCollections(params: {
  sections?: MockEntry[];
  contact?: MockEntry[];
  projects?: MockEntry[];
  timeline?: MockEntry[];
}) {
  const { sections = [], contact = [], projects = [], timeline = [] } = params;
  mockedGetCollection.mockImplementation((collectionName: string) => {
    if (collectionName === "homepage-sections") return Promise.resolve(sections as never);
    if (collectionName === "contact") return Promise.resolve(contact as never);
    if (collectionName === "projects") return Promise.resolve(projects as never);
    if (collectionName === "timeline") return Promise.resolve(timeline as never);
    return Promise.reject(new Error(`Unexpected collection: ${collectionName}`));
  });
}

describe("homepageSectionsViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads all required collections and returns visible sections sorted by order", async () => {
    mockCollections({
      sections: [
        createSectionEntry("hero-hidden", {
          type: "hero",
          order: 1,
          visible: false,
          name: "Hidden",
        }),
        createSectionEntry("hero-late", {
          type: "hero",
          order: 3,
          name: "Late",
        }),
        createSectionEntry("hero-early", {
          type: "hero",
          order: 2,
          name: "Early",
        }),
      ],
    });

    const result = await getHomepageSectionsViewModel();

    expect(mockedGetCollection).toHaveBeenCalledTimes(4);
    expect(mockedGetCollection).toHaveBeenCalledWith("homepage-sections");
    expect(mockedGetCollection).toHaveBeenCalledWith("contact");
    expect(mockedGetCollection).toHaveBeenCalledWith("projects");
    expect(mockedGetCollection).toHaveBeenCalledWith("timeline");
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("hero");
    expect(result[0]).toMatchObject({ name: "Early" });
    expect(result[1]).toMatchObject({ name: "Late" });
  });

  it("processes text-content sections and preserves optional CTA when absent", async () => {
    const section = createSectionEntry(
      "text-1",
      {
        type: "text",
        order: 1,
        title: "About",
      },
      "TextContentComponent"
    );

    mockCollections({ sections: [section] });

    const [result] = await getHomepageSectionsViewModel();

    expect(result.type).toBe("text");
    if (result.type !== "text") {
      throw new Error("Unexpected section type");
    }
    expect(result.title).toBe("About");
    expect(result.cta).toBeUndefined();
    expect(result.Content).toBe("TextContentComponent");
  });

  it("auto-loads contact icons for contact section type", async () => {
    mockCollections({
      sections: [
        createSectionEntry("connect", {
          type: "contact",
          order: 1,
          title: "Connect",
        }),
      ],
      contact: [
        {
          id: "intro",
          data: { type: "text", order: 0 },
        },
        {
          id: "primary",
          data: {
            type: "list",
            order: 1,
            items: [
              { icon: "ri:mail-line", href: "mailto:hi@example.com", showOnHome: true },
              { icon: "ri:github-line", href: "https://github.com/example", showOnHome: false },
            ],
          },
        },
        {
          id: "secondary",
          data: {
            type: "list",
            order: 2,
            items: [{ icon: "ri:twitter-line", href: "https://x.com/example", showOnHome: true }],
          },
        },
      ],
    });

    const [result] = await getHomepageSectionsViewModel();

    expect(result.type).toBe("contact");
    if (result.type !== "contact") {
      throw new Error("Unexpected section type");
    }
    expect(result.contactIcons).toHaveLength(2);
    expect(result.contactIcons?.map((item) => item.icon)).toEqual([
      "ri:mail-line",
      "ri:twitter-line",
    ]);
  });

  it("contact section includes all showOnHome items from all list entries", async () => {
    mockCollections({
      sections: [
        createSectionEntry("connect", {
          type: "contact",
          order: 1,
        }),
      ],
      contact: [
        {
          id: "primary",
          data: {
            type: "list",
            items: [
              { icon: "ri:mail-line", href: "mailto:hi@example.com", showOnHome: true },
              { icon: "ri:github-line", href: "https://github.com/example", showOnHome: true },
            ],
          },
        },
      ],
    });

    const [result] = await getHomepageSectionsViewModel();

    expect(result.type).toBe("contact");
    if (result.type !== "contact") {
      throw new Error("Unexpected section type");
    }
    expect(result.contactIcons).toHaveLength(2);
  });

  it("contact section includes items on home by default when showOnHome is omitted", async () => {
    mockCollections({
      sections: [
        createSectionEntry("connect-defaults", {
          type: "contact",
          order: 1,
        }),
      ],
      contact: [
        {
          id: "primary",
          data: {
            type: "list",
            items: [
              { icon: "ri:mail-line", href: "mailto:hi@example.com" },
              { icon: "ri:github-line", href: "https://github.com/example", showOnHome: false },
            ],
          },
        },
      ],
    });

    const [result] = await getHomepageSectionsViewModel();

    expect(result.type).toBe("contact");
    if (result.type !== "contact") {
      throw new Error("Unexpected section type");
    }
    expect(result.contactIcons?.map((item) => item.icon)).toEqual(["ri:mail-line"]);
  });

  it("builds project showcase with filters, ordering and limits", async () => {
    mockCollections({
      sections: [
        createSectionEntry("featured-projects", {
          type: "showcase",
          order: 1,
          title: "Featured",
          sourceCollection: "projects",
          componentType: "cards",
          filter: { isFeatured: true },
          sortBy: "order",
          limit: 1,
        }),
      ],
      projects: [
        createProjectEntry("project-b", { title: "Project B", isFeatured: true, order: 2 }),
        createProjectEntry("project-a", { title: "Project A", isFeatured: true, order: 1 }),
        createProjectEntry("project-hidden", {
          title: "Project Hidden",
          isFeatured: false,
          order: 0,
        }),
      ],
    });

    const [result] = await getHomepageSectionsViewModel();

    expect(result.type).toBe("showcase");
    if (result.type !== "showcase" || result.componentType !== "cards") {
      throw new Error("Unexpected section type");
    }
    expect(result.items).toHaveLength(1);
    expect(result.items[0].data.title).toBe("Project A");
  });

  it("sorts project showcase by date ascending when requested", async () => {
    mockCollections({
      sections: [
        createSectionEntry("projects-by-date", {
          type: "showcase",
          order: 1,
          sourceCollection: "projects",
          componentType: "cards",
          sortBy: "date",
          sortOrder: "asc",
        }),
      ],
      projects: [
        createProjectEntry("p3", { title: "Newest", isFeatured: true, startDate: "2025-03" }),
        createProjectEntry("p1", { title: "Oldest", isFeatured: true, startDate: "2023-01" }),
        createProjectEntry("p2", { title: "Middle", isFeatured: true, startDate: "2024-07" }),
      ],
    });

    const [result] = await getHomepageSectionsViewModel();

    expect(result.type).toBe("showcase");
    if (result.type !== "showcase" || result.componentType !== "cards") {
      throw new Error("Unexpected section type");
    }
    expect(result.items.map((item) => item.data.title)).toEqual(["Oldest", "Middle", "Newest"]);
  });

  it("builds timeline showcase with filters, limits and rendered content", async () => {
    const timelineA = createTimelineEntry(
      "timeline-a",
      {
        title: "Internship",
        startDate: "2024-01",
        endDate: "2024-06",
        category: "Experiences",
        isHighlight: true,
      },
      "TimelineAContent"
    );
    const timelineB = createTimelineEntry(
      "timeline-b",
      {
        title: "Scholarship",
        startDate: "2024-11",
        category: "Honors",
        isHighlight: true,
      },
      "TimelineBContent"
    );
    const timelineC = createTimelineEntry(
      "timeline-c",
      {
        title: "Hidden",
        startDate: "2023-01",
        category: "Honors",
        isHighlight: false,
      },
      "TimelineCContent"
    );

    mockCollections({
      sections: [
        createSectionEntry("highlights", {
          type: "showcase",
          order: 1,
          sourceCollection: "timeline",
          componentType: "list",
          filter: { isHighlight: true },
          sortBy: "date",
          sortOrder: "desc",
          limit: 2,
        }),
      ],
      timeline: [timelineA, timelineB, timelineC],
    });

    const [result] = await getHomepageSectionsViewModel();

    expect(result.type).toBe("showcase");
    if (result.type !== "showcase" || result.componentType !== "list") {
      throw new Error("Unexpected section type");
    }

    expect(result.items).toHaveLength(2);
    expect(result.items.map((item) => item.data.title)).toEqual(["Scholarship", "Internship"]);
    expect(result.items[0].Content).toBe("TimelineBContent");
    expect((result.items[1].data as { date?: string }).date).toBe("January 2024 – June 2024");
  });

  it("sorts timeline showcase by date ascending when requested", async () => {
    mockCollections({
      sections: [
        createSectionEntry("timeline-asc", {
          type: "showcase",
          order: 1,
          sourceCollection: "timeline",
          componentType: "list",
          sortBy: "date",
          sortOrder: "asc",
        }),
      ],
      timeline: [
        createTimelineEntry("t2", {
          title: "New",
          startDate: "2025-01",
          category: "Experiences",
          isHighlight: true,
        }),
        createTimelineEntry("t1", {
          title: "Old",
          startDate: "2023-01",
          category: "Experiences",
          isHighlight: true,
        }),
      ],
    });

    const [result] = await getHomepageSectionsViewModel();

    expect(result.type).toBe("showcase");
    if (result.type !== "showcase" || result.componentType !== "list") {
      throw new Error("Unexpected section type");
    }
    expect(result.items.map((item) => item.data.title)).toEqual(["Old", "New"]);
  });

  it("throws for invalid projects componentType", async () => {
    mockCollections({
      sections: [
        createSectionEntry("broken-projects", {
          type: "showcase",
          order: 1,
          sourceCollection: "projects",
          componentType: "list",
        }),
      ],
    });

    await expect(getHomepageSectionsViewModel()).rejects.toThrow(
      "Invalid homepage section config 'broken-projects': projects sourceCollection requires componentType: \"cards\""
    );
  });

  it("throws for invalid timeline componentType", async () => {
    mockCollections({
      sections: [
        createSectionEntry("broken-timeline", {
          type: "showcase",
          order: 1,
          sourceCollection: "timeline",
          componentType: "cards",
        }),
      ],
    });

    await expect(getHomepageSectionsViewModel()).rejects.toThrow(
      "Invalid homepage section config 'broken-timeline': timeline sourceCollection requires componentType: \"list\""
    );
  });

  it("throws for unknown sourceCollection values", async () => {
    mockCollections({
      sections: [
        createSectionEntry("unknown-source", {
          type: "showcase",
          order: 1,
          sourceCollection: "something-else",
          componentType: "list",
        }),
      ],
    });

    await expect(getHomepageSectionsViewModel()).rejects.toThrow(
      "Unknown source collection: something-else"
    );
  });

  it("throws for unknown section types", async () => {
    mockCollections({
      sections: [
        createSectionEntry("unknown-type", {
          type: "mystery-type",
          order: 1,
        }),
      ],
    });

    await expect(getHomepageSectionsViewModel()).rejects.toThrow(
      "Unknown section type: mystery-type"
    );
  });
});
