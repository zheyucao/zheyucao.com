import { siteConfig } from "../../config";

export const DEFAULT_LOCALE = siteConfig.i18n.defaultLocale;
export const SUPPORTED_LOCALES = siteConfig.i18n.locales;

export const isSupportedLocale = (value: string): boolean => SUPPORTED_LOCALES.includes(value);

const URL_SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;

function getRoutingConfig() {
  const routing = siteConfig.i18n.routing;
  return {
    mode: routing?.mode ?? "auto",
    locale: routing?.locale,
    prefixDefaultLocale: routing?.prefixDefaultLocale ?? false,
  } as const;
}

function resolveConfiguredLocale(): string {
  const { locale } = getRoutingConfig();
  if (locale && isSupportedLocale(locale)) {
    return locale;
  }
  return DEFAULT_LOCALE;
}

export function resolveLocaleFromPath(pathname: string): string {
  const { mode } = getRoutingConfig();
  if (mode === "explicit") {
    return resolveConfiguredLocale();
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0];
  if (firstSegment && isSupportedLocale(firstSegment)) {
    return firstSegment;
  }
  return DEFAULT_LOCALE;
}

export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return "/";
  }

  if (isSupportedLocale(segments[0])) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }

  return `/${segments.join("/")}`;
}

function shouldPrefixLocale(locale: string): boolean {
  const { prefixDefaultLocale } = getRoutingConfig();
  return locale !== DEFAULT_LOCALE || prefixDefaultLocale;
}

export function resolveLocalizedHref(href: string, pathname: string): string {
  if (!href) {
    return href;
  }

  // Skip external/protocol links, protocol-relative links, and relative paths.
  if (URL_SCHEME_PATTERN.test(href) || href.startsWith("//") || !href.startsWith("/")) {
    return href;
  }

  const url = new URL(href, "https://local.invalid");
  const locale = resolveLocaleFromPath(pathname);
  const unprefixedPath = stripLocalePrefix(url.pathname);

  const localizedPath = shouldPrefixLocale(locale)
    ? unprefixedPath === "/"
      ? `/${locale}`
      : `/${locale}${unprefixedPath}`
    : unprefixedPath;

  return `${localizedPath}${url.search}${url.hash}`;
}
