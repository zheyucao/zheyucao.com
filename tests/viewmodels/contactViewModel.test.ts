import { describe, it, expect, vi, beforeEach } from "vitest";
import { getContactViewModel, getContactFooterItems } from "../../src/viewmodels/contactViewModel";
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

describe("contactViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getContactViewModel", () => {
    it("should return metadata, intro, and sections correctly", async () => {
      const mockMetadata = { title: "Contact", description: "Contact me" };
      mockedGetPageMetadata.mockResolvedValue(mockMetadata as never);

      const mockContactEntries = [
        {
          data: { kind: "text", order: 1 },
          render: vi.fn().mockResolvedValue({ Content: "IntroContent" }),
        },
        {
          data: { kind: "list", order: 2, items: [{ icon: "mail", href: "mailto:test@test.com" }] },
          render: vi.fn().mockResolvedValue({ Content: "SectionContent" }),
        },
      ];
      mockedGetCollection.mockResolvedValue(mockContactEntries as never);

      const result = await getContactViewModel();

      expect(result.metadata).toEqual(mockMetadata);
      expect(result.intro).toBeDefined();
      expect(result.intro?.order).toBe(1);
      expect(result.intro?.Content).toBe("IntroContent");
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].order).toBe(2);
      expect(result.sections[0].items).toHaveLength(1);
      expect(result.sections[0].Content).toBe("SectionContent");
    });

    it("should handle missing intro", async () => {
      mockedGetPageMetadata.mockResolvedValue({} as never);
      mockedGetCollection.mockResolvedValue([] as never);

      const result = await getContactViewModel();

      expect(result.intro).toBeUndefined();
      expect(result.sections).toEqual([]);
    });
  });

  describe("getContactFooterItems", () => {
    it("should return filtered and sorted footer items", async () => {
      const mockContactEntries = [
        {
          data: {
            kind: "list",
            order: 1,
            items: [
              { icon: "github", href: "https://github.com", showOnFooter: true },
              { icon: "twitter", href: "https://twitter.com", showOnFooter: false }, // Should be filtered out
              { icon: "email", href: "mailto:test@test.com" }, // Default showOnFooter is true (undefined != false)
            ],
          },
        },
        {
          data: {
            kind: "list",
            order: 2,
            items: [{ icon: "linkedin", href: "https://linkedin.com" }],
          },
        },
      ];
      mockedGetCollection.mockResolvedValue(mockContactEntries as never);

      const result = await getContactFooterItems();

      expect(result).toHaveLength(3);
      expect(result[0].icon).toBe("github");
      expect(result[1].icon).toBe("email");
      expect(result[2].icon).toBe("linkedin");
    });

    it("should return empty array if no contact entries", async () => {
      mockedGetCollection.mockResolvedValue([] as never);

      const result = await getContactFooterItems();

      expect(result).toEqual([]);
    });
  });
});
