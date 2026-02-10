import { beforeEach, describe, expect, it, vi } from "vitest";
import { getProjectsViewModel } from "../../src/viewmodels/projectsViewModel";
import { getCollection } from "astro:content";
import { getPageMetadata } from "../../src/lib/viewmodels/baseViewModel";

vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
}));

vi.mock("../../src/lib/viewmodels/baseViewModel", () => ({
  getPageMetadata: vi.fn(),
}));

const mockedGetCollection = vi.mocked(getCollection);
const mockedGetPageMetadata = vi.mocked(getPageMetadata);

const createProject = (
  title: string,
  data: {
    order?: number;
    startDate?: string;
    endDate?: string;
  },
  content = `${title}-content`
) => ({
  id: title.toLowerCase().replace(/\s+/g, "-"),
  data: {
    title,
    ...data,
  },
  render: vi.fn().mockResolvedValue({ Content: content }),
});

describe("projectsViewModel combinations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sorts projects by positive order, then unordered by date desc, then negative order", async () => {
    mockedGetPageMetadata.mockResolvedValue({ title: "Projects" } as never);
    mockedGetCollection.mockResolvedValue(
      [
        createProject("Neg 1", { order: -1, startDate: "2020-01" }),
        createProject("Unordered New", { startDate: "2025-01" }),
        createProject("Ordered 2", { order: 2, startDate: "2023-01" }),
        createProject("Unordered Old", { startDate: "2022-01" }),
        createProject("Ordered 1", { order: 1, startDate: "2024-01" }),
        createProject("Neg 2", { order: -2, startDate: "2021-01" }),
      ] as never
    );

    const result = await getProjectsViewModel();

    expect(result.projects.map((project) => project.data.title)).toEqual([
      "Ordered 1",
      "Ordered 2",
      "Unordered New",
      "Unordered Old",
      "Neg 1",
      "Neg 2",
    ]);
  });

  it("formats date range using endDate when present", async () => {
    mockedGetPageMetadata.mockResolvedValue({ title: "Projects" } as never);
    mockedGetCollection.mockResolvedValue(
      [createProject("Date Range Project", { startDate: "2024-01", endDate: "2024-03" })] as never
    );

    const result = await getProjectsViewModel();

    expect(result.projects[0].formattedDate).toBe("January 2024 – March 2024");
  });

  it("keeps render output on each project item", async () => {
    mockedGetPageMetadata.mockResolvedValue({ title: "Projects" } as never);
    mockedGetCollection.mockResolvedValue(
      [
        createProject("First", { order: 1 }, "FirstContent"),
        createProject("Second", { order: 2 }, "SecondContent"),
      ] as never
    );

    const result = await getProjectsViewModel();

    expect(result.projects[0].Content).toBe("FirstContent");
    expect(result.projects[1].Content).toBe("SecondContent");
  });
});
