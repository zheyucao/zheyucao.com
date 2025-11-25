import { getCollection, type CollectionEntry } from "astro:content";

export interface ContactItem {
  icon: string;
  content?: string;
  label?: string;
  href?: string;
  target?: string;
  rel?: string;
  description?: string;
  showOnHome?: boolean;
  showOnFooter?: boolean;
}

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
  intro?: ContactIntro;
  sections: ContactSection[];
}

/**
 * Contact page view model
 * Fetches contact data for the contact page
 */
export async function getContactViewModel(): Promise<ContactViewModel> {
  const contactEntries = await getCollection("contact");

  const introEntries = contactEntries.filter((entry) => entry.data.kind === "text");
  const sectionEntries = contactEntries.filter((entry) => entry.data.kind === "list");

  // Pick the first intro by order (if present)
  let intro: ContactIntro | undefined;
  if (introEntries.length > 0) {
    introEntries.sort((a, b) => (a.data.order ?? Infinity) - (b.data.order ?? Infinity));
    const introEntry = introEntries[0] as CollectionEntry<"contact">;
    const rendered = introEntry.rendered ?? (await introEntry.render());
    const Content = rendered.Content;
    intro = {
      order: introEntry.data.order ?? Infinity,
      Content,
    };
  }

  // Build section view models
  const sections = await Promise.all(
    sectionEntries.map(async (entry) => {
      const rendered = entry.rendered ?? (await entry.render());
      const { Content } = rendered;
      const items = (entry.data as { items: ContactItem[] }).items;
      return {
        order: entry.data.order ?? Infinity,
        items, // Show all items on contact page
        Content,
      };
    })
  );

  // Sort sections by order
  sections.sort((a, b) => a.order - b.order);

  return {
    intro,
    sections,
  };
}
