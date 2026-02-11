import { getCollection, type CollectionEntry } from "astro:content";
import { getPageMetadata, type PageMetadata } from "../lib/viewmodels/baseViewModel";
import { sortByOrder } from "../lib/utils/sortUtils";
import type { ContactItem as SharedContactItem } from "../lib/types/contact";

export type ContactItem = SharedContactItem;

export interface ContactSection {
  order: number;
  Content: import("astro/runtime/server/index.js").AstroComponentFactory;
  items: ContactItem[];
}

export interface ContactIntro {
  order: number;
  Content: import("astro/runtime/server/index.js").AstroComponentFactory;
}

export interface ContactViewModel {
  metadata: PageMetadata;
  intro?: ContactIntro;
  sections: ContactSection[];
}

/**
 * Contact page view model
 * Fetches contact data for the contact page
 */
export async function getContactViewModel(): Promise<ContactViewModel> {
  const [metadata, contactEntries] = await Promise.all([
    getPageMetadata("contact"),
    getCollection("contact"),
  ]);

  const introEntries = contactEntries.filter((entry) => entry.data.type === "text");
  const sectionEntries = contactEntries.filter((entry) => entry.data.type === "list");

  // Pick the first intro by order (if present)
  let intro: ContactIntro | undefined;
  if (introEntries.length > 0) {
    const sortedIntroEntries = sortByOrder(introEntries, {
      getOrder: (e) => e.data.order,
    });
    const introEntry = sortedIntroEntries[0] as CollectionEntry<"contact">;

    const { Content } = await introEntry.render();
    intro = {
      order: introEntry.data.order ?? Infinity,
      Content,
    };
  }

  // Build section view models
  const sections = await Promise.all(
    sectionEntries.map(async (entry) => {
      const { Content } = await entry.render();
      const items = (entry.data as { items: ContactItem[] }).items;
      return {
        order: entry.data.order ?? Infinity,
        items, // Show all items on contact page
        Content,
      };
    })
  );

  // Sort sections by order
  const sortedSections = sortByOrder(sections, {
    getOrder: (s) => s.order,
  });

  return {
    metadata,
    intro,
    sections: sortedSections,
  };
}

/**
 * Get contact items for footer display
 * Returns empty array if contact collection doesn't exist (Astro 5.0+ behavior)
 */
export async function getContactFooterItems(): Promise<ContactItem[]> {
  const contactEntries = await getCollection("contact");

  type ContactListEntry = CollectionEntry<"contact"> & { data: { type: "list" } };
  const isListEntry = (entry: CollectionEntry<"contact">): entry is ContactListEntry => {
    return entry.data.type === "list";
  };

  const listEntries = contactEntries.filter(isListEntry);

  const sortedListEntries = sortByOrder(listEntries, {
    getOrder: (e) => e.data.order,
  });

  const items = sortedListEntries.flatMap((entry, sectionIndex) => {
    const baseOrder = entry.data.order ?? sectionIndex;
    const items = entry.data.items || [];
    return items
      .map((item, idx) => ({
        ...item,
        order: baseOrder * 100 + idx,
      }))
      .filter((item) => item.showOnFooter !== false && item.href);
  });

  return sortByOrder(items, {
    getOrder: (i) => i.order,
  });
}
