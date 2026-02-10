import { describe, it, expect, vi, beforeEach } from "vitest";
import { getMasonryViewModel } from "../../src/viewmodels/masonryViewModel";
import { getCollection } from "astro:content";
import { getPageMetadata } from "../../src/lib/viewmodels/baseViewModel";

// Mock astro:content
vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
}));

// Mock baseViewModel
vi.mock("../../src/lib/viewmodels/baseViewModel", () => ({
  getPageMetadata: vi.fn(),
}));

const mockedGetCollection = vi.mocked(getCollection);
const mockedGetPageMetadata = vi.mocked(getPageMetadata);

describe("masonryViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return projects view model correctly", async () => {
    const mockMetadata = { title: "Projects", description: "My Projects" };
    mockedGetPageMetadata.mockResolvedValue(mockMetadata as never);

    const mockProjects = [
      {
        data: { title: "Project 1", order: 2 },
        render: vi.fn().mockResolvedValue({ Content: "Project1Content" }),
      },
      {
        data: { title: "Project 2", order: 1 },
        render: vi.fn().mockResolvedValue({ Content: "Project2Content" }),
      },
    ];
    mockedGetCollection.mockResolvedValue(mockProjects as never);

    const result = await getMasonryViewModel();

    expect(result.metadata).toEqual(mockMetadata);
    expect(result.projects).toHaveLength(2);
    // Should be sorted by order
    expect(result.projects[0].data.title).toBe("Project 2");
    expect(result.projects[1].data.title).toBe("Project 1");
    expect(result.projects[0].Content).toBe("Project2Content");
  });
});
