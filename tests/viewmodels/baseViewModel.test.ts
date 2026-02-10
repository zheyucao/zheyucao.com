import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPageMetadata } from "../../src/lib/viewmodels/baseViewModel";
import { getEntry } from "astro:content";

vi.mock("astro:content", () => ({
  getEntry: vi.fn(),
}));

const mockedGetEntry = vi.mocked(getEntry);

describe("baseViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns page metadata when entry exists", async () => {
    mockedGetEntry.mockResolvedValue(
      {
        data: {
          title: "Projects",
          subtitle: "Selected work",
          description: "List of projects",
          actions: [
            {
              text: "Open GitHub",
              href: "https://github.com/example",
              variant: "primary",
              target: "_blank",
              rel: "noopener noreferrer",
            },
          ],
          seo: {
            ogTitle: "Projects OG",
            ogDescription: "Projects OG Description",
            ogImage: "https://example.com/og.png",
            twitterCard: "summary_large_image",
          },
        },
      } as never
    );

    const result = await getPageMetadata("projects");

    expect(result).toEqual({
      title: "Projects",
      subtitle: "Selected work",
      description: "List of projects",
      actions: [
        {
          text: "Open GitHub",
          href: "https://github.com/example",
          variant: "primary",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      ],
      seo: {
        ogTitle: "Projects OG",
        ogDescription: "Projects OG Description",
        ogImage: "https://example.com/og.png",
        twitterCard: "summary_large_image",
      },
    });
  });

  it("returns fallback title when metadata entry is missing", async () => {
    mockedGetEntry.mockResolvedValue(undefined as never);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await getPageMetadata("resume");

    expect(result).toEqual({ title: "Resume" });
    expect(warnSpy).toHaveBeenCalledWith("No metadata found for page: resume");
    warnSpy.mockRestore();
  });

  it("capitalizes fallback title correctly for custom page ids", async () => {
    mockedGetEntry.mockResolvedValue(undefined as never);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await getPageMetadata("blog-posts");

    expect(result.title).toBe("Blog-posts");
    warnSpy.mockRestore();
  });
});
