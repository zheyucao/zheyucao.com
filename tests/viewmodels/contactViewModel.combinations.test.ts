import { beforeEach, describe, expect, it, vi } from "vitest";
import { getContactFooterItems, getContactViewModel } from "../../src/viewmodels/contactViewModel";
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

const createTextEntry = (order: number | undefined, content: string) => ({
  id: `text-${order ?? "none"}-${content}`,
  data: { type: "text", order },
  render: vi.fn().mockResolvedValue({ Content: content }),
});

const createListEntry = (
  order: number | undefined,
  content: string,
  items: Array<Record<string, unknown>>
) => ({
  id: `list-${order ?? "none"}-${content}`,
  data: { type: "list", order, items },
  render: vi.fn().mockResolvedValue({ Content: content }),
});

describe("contactViewModel combinations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("selects the lowest-order intro when multiple text entries exist", async () => {
    mockedGetPageMetadata.mockResolvedValue({ title: "Contact" } as never);
    mockedGetCollection.mockResolvedValue(
      [
        createTextEntry(5, "LateIntro"),
        createTextEntry(1, "EarlyIntro"),
        createListEntry(1, "Section", []),
      ] as never
    );

    const result = await getContactViewModel();

    expect(result.intro).toBeDefined();
    expect(result.intro?.order).toBe(1);
    expect(result.intro?.Content).toBe("EarlyIntro");
  });

  it("sorts contact sections by order and sends undefined orders last", async () => {
    mockedGetPageMetadata.mockResolvedValue({ title: "Contact" } as never);
    mockedGetCollection.mockResolvedValue(
      [
        createTextEntry(0, "Intro"),
        createListEntry(undefined, "NoOrderSection", []),
        createListEntry(2, "SecondSection", []),
        createListEntry(1, "FirstSection", []),
      ] as never
    );

    const result = await getContactViewModel();

    expect(result.sections.map((section) => section.Content)).toEqual([
      "FirstSection",
      "SecondSection",
      "NoOrderSection",
    ]);
  });

  it("getContactFooterItems preserves section+item ordering across multiple list entries", async () => {
    mockedGetCollection.mockResolvedValue(
      [
        createListEntry(2, "Section2", [
          { icon: "ri:github-line", href: "https://github.com/a" },
          { icon: "ri:twitter-line", href: "https://x.com/a" },
        ]),
        createListEntry(1, "Section1", [
          { icon: "ri:mail-line", href: "mailto:a@example.com" },
        ]),
      ] as never
    );

    const items = await getContactFooterItems();

    expect(items.map((item) => item.icon)).toEqual([
      "ri:mail-line",
      "ri:github-line",
      "ri:twitter-line",
    ]);
  });

  it("getContactFooterItems filters out items hidden from footer or missing href", async () => {
    mockedGetCollection.mockResolvedValue(
      [
        createListEntry(1, "Section", [
          { icon: "ri:mail-line", href: "mailto:a@example.com", showOnFooter: true },
          { icon: "ri:wechat-line", showOnFooter: true },
          { icon: "ri:github-line", href: "https://github.com/a", showOnFooter: false },
          { icon: "ri:planet-line", href: "https://example.com" },
        ]),
      ] as never
    );

    const items = await getContactFooterItems();

    expect(items.map((item) => item.icon)).toEqual(["ri:mail-line", "ri:planet-line"]);
  });

  it("getContactFooterItems handles mixed section orders including negative values", async () => {
    mockedGetCollection.mockResolvedValue(
      [
        createListEntry(-1, "NegSection", [{ icon: "ri:wechat-line", href: "weixin://chat" }]),
        createListEntry(undefined, "NoOrderSection", [
          { icon: "ri:planet-line", href: "https://example.com" },
        ]),
        createListEntry(0, "ZeroSection", [{ icon: "ri:mail-line", href: "mailto:test@example.com" }]),
      ] as never
    );

    const items = await getContactFooterItems();

    expect(items.map((item) => item.icon)).toEqual([
      "ri:mail-line",
      "ri:planet-line",
      "ri:wechat-line",
    ]);
  });
});
