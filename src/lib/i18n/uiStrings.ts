import { getEntry } from "astro:content";
import { DEFAULT_LOCALE, isSupportedLocale } from "./locale";

export async function getUiStrings(locale: string) {
  const requestedLocale = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
  const localized = await getEntry("ui-strings", requestedLocale);
  if (localized) {
    return localized.data;
  }

  if (requestedLocale !== DEFAULT_LOCALE) {
    const fallback = await getEntry("ui-strings", DEFAULT_LOCALE);
    if (fallback) {
      return fallback.data;
    }
  }

  throw new Error(
    `Could not find UI strings for locale '${requestedLocale}' or fallback '${DEFAULT_LOCALE}'`
  );
}
