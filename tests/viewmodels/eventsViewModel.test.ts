import { describe, it, expect, vi, beforeEach } from "vitest";
import { getEventsViewModel } from "../../src/viewmodels/eventsViewModel";
import { getCollection } from "astro:content";
import { getPageMetadata } from "../../src/lib/viewmodels/baseViewModel";
import { getUiStrings } from "../../src/lib/i18n/uiStrings";

// Mock astro:content
vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
}));

// Mock baseViewModel
vi.mock("../../src/lib/viewmodels/baseViewModel", () => ({
  getPageMetadata: vi.fn(),
}));

vi.mock("../../src/lib/i18n/uiStrings", () => ({
  getUiStrings: vi.fn(),
}));

const mockedGetCollection = vi.mocked(getCollection);
const mockedGetPageMetadata = vi.mocked(getPageMetadata);
const mockedGetUiStrings = vi.mocked(getUiStrings);

describe("eventsViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return timeline view model correctly", async () => {
    const mockMetadata = { title: "Timeline", description: "My Timeline" };
    mockedGetPageMetadata.mockResolvedValue(mockMetadata as never);

    const mockEvents = [
      {
        data: { startDate: "2023-01", title: "Event 1", category: "Cat1" },
        body: "Description 1",
        render: vi.fn().mockResolvedValue({ Content: "Event1Content" }),
      },
      {
        data: { startDate: "2022-01", title: "Event 2", category: "Cat2" },
        body: "Description 2",
        render: vi.fn().mockResolvedValue({ Content: "Event2Content" }),
      },
    ];
    mockedGetCollection.mockResolvedValue(mockEvents as never);

    const mockUiStrings = {
      pages: {
        timeline: {
          filterAll: "All Events",
        },
      },
    };
    mockedGetUiStrings.mockResolvedValue(mockUiStrings as never);

    const result = await getEventsViewModel();

    expect(result.metadata).toEqual(mockMetadata);
    expect(result.events).toHaveLength(2);
    expect(result.events[0].description).toBe("Description 1");
    expect(result.events[0].Content).toBe("Event1Content");
    expect(result.categories).toEqual(["Cat1", "Cat2"]);
    expect(result.initialEvents).toHaveLength(2);
    // Sorted by date descending (newest first)
    expect(result.initialEvents[0].title).toBe("Event 1");
    expect(result.filterAll).toBe("All Events");
  });

  it("should throw error if UI strings are missing", async () => {
    mockedGetCollection.mockResolvedValue([] as never);
    mockedGetUiStrings.mockRejectedValue(
      new Error("Could not find UI strings for locale 'en' or fallback 'en'")
    );

    await expect(getEventsViewModel()).rejects.toThrow(
      "Could not find UI strings for locale 'en' or fallback 'en'"
    );
  });
});
