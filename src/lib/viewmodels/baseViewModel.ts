import { getEntry } from "astro:content";

/**
 * Page action button configuration
 */
export interface PageAction {
  text: string;
  href: string;
  style?: string;
  download?: string;
  icon?: string;
  iconPosition?: "left" | "right";
  target?: string;
  rel?: string;
}

/**
 * SEO metadata for a page
 */
export interface SEOMetadata {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
}

/**
 * Page-level metadata including title, actions, and SEO
 */
export interface PageMetadata {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: PageAction[];
  seo?: SEOMetadata;
}

/**
 * Fetches page metadata from the centralized page-metadata collection
 * @param pageId - The ID of the page (e.g., "resume", "projects", "timeline", "contact")
 * @returns Page metadata with title, actions, and SEO information
 * @throws Error if metadata is not found and no fallback is available
 */
export async function getPageMetadata(pageId: string): Promise<PageMetadata> {
  const entry = await getEntry("page-metadata", pageId);

  if (!entry) {
    console.warn(`No metadata found for page: ${pageId}`);
    // Fallback to capitalized page ID as title
    return {
      title: pageId.charAt(0).toUpperCase() + pageId.slice(1),
    };
  }

  return {
    title: entry.data.title,
    subtitle: entry.data.subtitle,
    description: entry.data.description,
    actions: entry.data.actions,
    seo: entry.data.seo,
  };
}
