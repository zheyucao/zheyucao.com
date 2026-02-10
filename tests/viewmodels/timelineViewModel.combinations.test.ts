import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTimelineViewModel } from "../../src/viewmodels/timelineViewModel";
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

const createTimelineEvent = (
  title: string,
  data: {
    startDate: string;
    endDate?: string;
    category: string;
    isHighlight?: boolean;
  },
  body = `${title}-body`,
  content = `${title}-content`
) => ({
  id: title.toLowerCase().replace(/\s+/g, "-"),
  data: {
    title,
    isHighlight: false,
    ...data,
  },
  body,
  render: vi.fn().mockResolvedValue({ Content: content }),
});

describe("timelineViewModel combinations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sorts categories alphabetically and de-duplicates", async () => {
    mockedGetPageMetadata.mockResolvedValue({ title: "Timeline" } as never);
    mockedGetEntry.mockResolvedValue(
      {
        data: {
          pages: {
            timeline: {
              filterAll: "Everything",
            },
          },
        },
      } as never
    );
    mockedGetCollection.mockResolvedValue(
      [
        createTimelineEvent("E1", { startDate: "2024-01", category: "Experiences" }),
        createTimelineEvent("E2", { startDate: "2023-01", category: "Honors" }),
        createTimelineEvent("E3", { startDate: "2022-01", category: "Experiences" }),
      ] as never
    );

    const result = await getTimelineViewModel();

    expect(result.categories).toEqual(["Experiences", "Honors"]);
    expect(result.filterAll).toBe("Everything");
  });

  it("sorts initial events by endDate first, then startDate when endDate is missing", async () => {
    mockedGetPageMetadata.mockResolvedValue({ title: "Timeline" } as never);
    mockedGetEntry.mockResolvedValue(
      {
        data: {
          pages: {
            timeline: {
              filterAll: "All",
            },
          },
        },
      } as never
    );
    mockedGetCollection.mockResolvedValue(
      [
        createTimelineEvent("Old Internship", {
          startDate: "2023-01",
          endDate: "2023-06",
          category: "Experiences",
        }),
        createTimelineEvent("Current Role", {
          startDate: "2024-01",
          endDate: "present",
          category: "Experiences",
        }),
        createTimelineEvent("No End Date", {
          startDate: "2025-01",
          category: "Experiences",
        }),
      ] as never
    );

    const result = await getTimelineViewModel();

    expect(result.initialEvents.map((event) => event.title)).toEqual([
      "Current Role",
      "No End Date",
      "Old Internship",
    ]);
  });

  it("maps rendered Content, description and formatted date range for each event", async () => {
    mockedGetPageMetadata.mockResolvedValue({ title: "Timeline" } as never);
    mockedGetEntry.mockResolvedValue(
      {
        data: {
          pages: {
            timeline: {
              filterAll: "All",
            },
          },
        },
      } as never
    );
    mockedGetCollection.mockResolvedValue(
      [
        createTimelineEvent(
          "Internship",
          { startDate: "2024-02", endDate: "2024-08", category: "Experiences" },
          "Worked on research.",
          "InternshipContent"
        ),
      ] as never
    );

    const result = await getTimelineViewModel();
    const event = result.events[0];

    expect(event.Content).toBe("InternshipContent");
    expect(event.description).toBe("Worked on research.");
    expect(event.date).toBe("February 2024 – August 2024");
    expect(event.dateRange).toBe("February 2024 – August 2024");
  });

  it("throws if UI strings entry is missing", async () => {
    mockedGetPageMetadata.mockResolvedValue({ title: "Timeline" } as never);
    mockedGetCollection.mockResolvedValue([] as never);
    mockedGetEntry.mockResolvedValue(undefined as never);

    await expect(getTimelineViewModel()).rejects.toThrow("Could not find UI strings for 'en'");
  });
});
