import { afterEach, describe, expect, it, vi } from "vitest";
import { initTheme } from "../../src/lib/layout/theme";

type MockMediaQueryList = {
  matches: boolean;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
};

describe("layout/theme", () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    document.documentElement.classList.remove("dark");
  });

  it("forces dark theme when defaultTheme is dark", () => {
    const cleanup = initTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    cleanup();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("forces light theme when defaultTheme is light", () => {
    document.documentElement.classList.add("dark");

    const cleanup = initTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    cleanup();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("tracks system preference in system mode and unsubscribes on cleanup", () => {
    let changeHandler: (() => void) | undefined;
    const mediaQuery: MockMediaQueryList = {
      matches: true,
      addEventListener: vi.fn((_event: string, handler: () => void) => {
        changeHandler = handler;
      }),
      removeEventListener: vi.fn(),
    };

    window.matchMedia = vi.fn().mockReturnValue(mediaQuery);

    const cleanup = initTheme("system");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
    expect(mediaQuery.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));

    mediaQuery.matches = false;
    changeHandler?.();
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    mediaQuery.matches = true;
    changeHandler?.();
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    cleanup();
    expect(mediaQuery.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });
});
