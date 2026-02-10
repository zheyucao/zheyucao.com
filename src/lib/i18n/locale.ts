import { siteConfig } from "../../config";

export const DEFAULT_LOCALE = siteConfig.i18n.defaultLocale;
export const SUPPORTED_LOCALES = siteConfig.i18n.locales;

export const isSupportedLocale = (value: string): boolean => SUPPORTED_LOCALES.includes(value);

export function resolveLocaleFromPath(pathname: string): string {
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
