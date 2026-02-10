import { getPageMetadata, type PageMetadata } from "../lib/viewmodels/baseViewModel";

/**
 * Vanilla page view model
 * Simple page with just metadata — no special data loading.
 * Used for plain content pages that only need a title and static content.
 */
export async function getVanillaViewModel(slug: string): Promise<{
  metadata: PageMetadata;
}> {
  const metadata = await getPageMetadata(slug);
  return { metadata };
}
