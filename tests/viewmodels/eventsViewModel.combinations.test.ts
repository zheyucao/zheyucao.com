import { beforeEach, describe, expect, it, vi } from "vitest";
import { getEventsViewModel } from "../../src/viewmodels/eventsViewModel";
import { getCollection } from "astro:content";
import { getPageMetadata } from "../../src/lib/viewmodels/baseViewModel";
import { getUiStrings } from "../../src/lib/i18n/uiStrings";

vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
}));

vi.mock("../../src/lib/viewmodels/baseViewModel", () => ({
  getPageMetadata: vi.fn(),
}));

vi.mock("../../src/lib/i18n/uiStrings", () => ({
  getUiStrings: vi.fn(),
}));

const mockedGetCollection = vi.mocked(getCollection);
const mockedGetPageMetadata = vi.mocked(getPageMetadata);
const mockedGetUiStrings = vi.mocked(getUiStrings);

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

describe("eventsViewModel combinations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sorts categories alphabetically and de-duplicates", async () => {
    mockedGetPageMetadata.mockResolvedValue({ title: "Timeline" } as never);
    mockedGetUiStrings.mockResolvedValue(
      {
        pages: {
          timeline: {
            filterAll: "Everything",
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

    const result = await getEventsViewModel();

    expect(result.categories).toEqual(["Experiences", "Honors"]);
    expect(result.filterAll).toBe("Everything");
  });

  it("sorts initial events by endDate first, then startDate when endDate is missing", async () => {
    mockedGetPageMetadata.mockResolvedValue({ title: "Timeline" } as never);
    mockedGetUiStrings.mockResolvedValue(
      {
        pages: {
          timeline: {
            filterAll: "All",
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

    const result = await getEventsViewModel();

    expect(result.initialEvents.map((event) => event.title)).toEqual([
      "Current Role",
      "No End Date",
      "Old Internship",
    ]);
  });

  it("maps rendered Content, description and formatted date range for each event", async () => {
    mockedGetPageMetadata.mockResolvedValue({ title: "Timeline" } as never);
    mockedGetUiStrings.mockResolvedValue(
      {
        pages: {
          timeline: {
            filterAll: "All",
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

    const result = await getEventsViewModel();
    const event = result.events[0];

    expect(event.Content).toBe("InternshipContent");
    expect(event.description).toBe("Worked on research.");
    expect(event.date).toBe("February 2024 – August 2024");
    expect(event.dateRange).toBe("February 2024 – August 2024");
  });

  it("throws if UI strings entry is missing", async () => {
    mockedGetPageMetadata.mockResolvedValue({ title: "Timeline" } as never);
    mockedGetCollection.mockResolvedValue([] as never);
    mockedGetUiStrings.mockRejectedValue(
      new Error("Could not find UI strings for locale 'en' or fallback 'en'")
    );

    await expect(getEventsViewModel()).rejects.toThrow(
      "Could not find UI strings for locale 'en' or fallback 'en'"
    );
  });
});
