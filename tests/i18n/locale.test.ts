import { afterEach, describe, expect, it } from "vitest";
import { siteConfig } from "../../src/config";
import { resolveLocaleFromPath, resolveLocalizedHref } from "../../src/lib/i18n/locale";

const originalRouting = siteConfig.i18n.routing ? { ...siteConfig.i18n.routing } : undefined;

afterEach(() => {
  siteConfig.i18n.routing = originalRouting ? { ...originalRouting } : undefined;
});

describe("i18n/locale", () => {
  it("resolves locale from pathname in auto mode", () => {
    siteConfig.i18n.routing = { mode: "auto", prefixDefaultLocale: false };

    expect(resolveLocaleFromPath("/zh/projects")).toBe("zh");
    expect(resolveLocaleFromPath("/projects")).toBe("en");
  });

  it("uses explicit locale when configured", () => {
    siteConfig.i18n.routing = { mode: "explicit", locale: "zh", prefixDefaultLocale: false };

    expect(resolveLocaleFromPath("/en/projects")).toBe("zh");
    expect(resolveLocaleFromPath("/")).toBe("zh");
  });

  it("localizes internal hrefs with current locale in auto mode", () => {
    siteConfig.i18n.routing = { mode: "auto", prefixDefaultLocale: false };

    expect(resolveLocalizedHref("/projects", "/zh/timeline")).toBe("/zh/projects");
    expect(resolveLocalizedHref("/projects?scrollTo=abc", "/zh")).toBe("/zh/projects?scrollTo=abc");
  });

  it("does not prefix default locale when disabled", () => {
    siteConfig.i18n.routing = { mode: "auto", prefixDefaultLocale: false };

    expect(resolveLocalizedHref("/projects", "/timeline")).toBe("/projects");
  });

  it("prefixes default locale in explicit mode when enabled", () => {
    siteConfig.i18n.routing = { mode: "explicit", locale: "en", prefixDefaultLocale: true };

    expect(resolveLocalizedHref("/projects", "/timeline")).toBe("/en/projects");
    expect(resolveLocalizedHref("/", "/timeline")).toBe("/en");
  });

  it("leaves non-localizable hrefs unchanged", () => {
    siteConfig.i18n.routing = { mode: "auto", prefixDefaultLocale: false };

    expect(resolveLocalizedHref("https://example.com", "/zh")).toBe("https://example.com");
    expect(resolveLocalizedHref("mailto:hello@example.com", "/zh")).toBe("mailto:hello@example.com");
    expect(resolveLocalizedHref("#hero", "/zh")).toBe("#hero");
  });
});
