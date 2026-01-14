import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      startDate: z.string().optional(), // YYYY-MM format
      endDate: z.string().optional(), // YYYY-MM or "present"
      githubUrl: z.string().url().optional(),
      githubRepos: z
        .array(
          z.object({
            title: z.string().optional(),
            url: z.string().url(),
          })
        )
        .optional(),
      projectUrl: z.string().url().optional(),
      techStack: z.array(z.string()).optional(),
      imageSrc: image().optional(),
      imageAlt: z.string().optional(),
      isFeatured: z.boolean().default(false),
      homepageSummary: z.string().optional(),
      order: z.number().optional(), // Manual ordering for projects page
    }),
});

const timeline = defineCollection({
  type: "content",
  schema: z.object({
    startDate: z.string(), // YYYY-MM format
    endDate: z.string().optional(), // YYYY-MM or "present"
    title: z.string(),
    category: z.enum(["Experiences", "Honors"]),
    isHighlight: z.boolean().default(false),
    highlightSummary: z.string().optional(),
  }),
});

// Homepage sections collection - dynamic section system
const homepage_sections = defineCollection({
  type: "content",
  schema: z.discriminatedUnion("type", [
    // Hero section
    z.object({
      type: z.literal("hero"),
      order: z.number(),
      visible: z.boolean().default(true),
      greeting: z.string().optional(),
      name: z.string(),
      description: z.string().optional(),
    }),
    // Text content section (for Meet Me, Connect, custom content)
    z.object({
      type: z.literal("text-content"),
      order: z.number(),
      visible: z.boolean().default(true),
      title: z.string().optional(),
      cta: z
        .object({
          text: z.string(),
          href: z.string(),
        })
        .optional(),
      // Supplementary data sources (e.g., contact icons)
      supplementaryData: z
        .object({
          contactIcons: z
            .object({
              sourceCollection: z.string(),
              filter: z.record(z.any()).optional(),
              itemFilter: z.record(z.any()).optional(),
            })
            .optional(),
        })
        .optional(),
    }),
    // Collection showcase section (for featured projects, timeline highlights, etc.)
    z.object({
      type: z.literal("showcase"),
      order: z.number(),
      visible: z.boolean().default(true),
      title: z.string().optional(),
      cta: z
        .object({
          text: z.string(),
          href: z.string(),
        })
        .optional(),
      fallback: z.string().optional(), // Fallback text when no items
      sourceCollection: z.string(), // e.g., "projects", "timeline"
      filter: z.record(z.any()).optional(), // e.g., { isFeatured: true }
      sortBy: z.string().optional(), // e.g., "order", "date"
      sortOrder: z.enum(["asc", "desc"]).optional(),
      limit: z.number().optional(),
      componentType: z.enum(["cards", "list"]), // "cards" for projects, "list" for timeline
    }),
  ]),
});

// Shared action schema for reuse across collections
const actionSchema = z.object({
  text: z.string(),
  href: z.string(),
  style: z.string().optional(),
  download: z.string().optional(),
  icon: z.string().optional(),
  iconPosition: z.enum(["left", "right"]).optional(),
  target: z.string().optional(),
  rel: z.string().optional(),
});

const resume = defineCollection({
  type: "content",
  schema: z.union([
    // Skills
    z.object({
      type: z.literal("skills"),
      title: z.string(),
      content: z.array(
        z.object({
          category: z.string(),
          items: z.array(z.string()),
        })
      ),
    }),
    // Contact
    z.object({
      type: z.literal("contact"),
      title: z.string(),
      content: z.array(
        z.object({
          icon: z.string(),
          label: z.string().optional(),
          href: z.string().optional(),
          target: z.string().optional(),
          rel: z.string().optional(),
          description: z.string().optional(),
        })
      ),
    }),
    // Standard Entry (Experience, Education, Projects, Awards, Profile, Metadata)
    z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      startDate: z.string().optional(), // YYYY-MM format
      endDate: z.string().optional(), // YYYY-MM or "present"
      order: z.number().optional(), // Manual ordering
      actions: z.array(actionSchema).optional(),
    }),
  ]),
});

const contact = defineCollection({
  type: "content",
  schema: z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("text"),
      order: z.number().optional(),
    }),
    z.object({
      kind: z.literal("list"),
      order: z.number().optional(),
      items: z.array(
        z.object({
          icon: z.string(),
          label: z.string().optional(), // display label
          content: z.string().optional(), // underlying value (e.g., number, handle)
          href: z.string().optional(),
          target: z.string().optional(),
          rel: z.string().optional(),
          description: z.string().optional(),
          showOnHome: z.boolean().optional(),
          showOnFooter: z.boolean().optional(),
        })
      ),
    }),
  ]),
});

const page_metadata = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    actions: z.array(actionSchema).optional(),
    seo: z
      .object({
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
        ogImage: z.string().optional(),
        twitterCard: z.string().optional(),
      })
      .optional(),
  }),
});

const ui_strings = defineCollection({
  type: "data",
  schema: z.object({
    footer: z.object({
      linksHeading: z.string(),
      connectHeading: z.string(),
      copyrightText: z.string(),
    }),
    pages: z.object({
      timeline: z.object({
        filterAll: z.string(),
      }),
    }),
  }),
});

const footer = defineCollection({
  type: "data",
  schema: z.object({
    author: z.string(),
    description: z.string(),
  }),
});

export const collections = {
  projects,
  timeline,
  "homepage-sections": homepage_sections,
  resume,
  contact,
  "ui-strings": ui_strings,
  "page-metadata": page_metadata,
  footer,
};
