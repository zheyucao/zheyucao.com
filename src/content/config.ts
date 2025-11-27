import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.string().optional(),
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
      thumbnailSrc: image().optional(),
      isFeatured: z.boolean().default(false),
      homepageSummary: z.string().optional(),
      order: z.number().optional(), // Manual ordering for projects page
    }),
});

const timeline = defineCollection({
  type: "content",
  schema: z.object({
    date: z.string(), // YYYY-MM
    dateRange: z.string().optional(),
    title: z.string(),
    category: z.enum(["Experiences", "Honors"]),
    isHighlight: z.boolean().default(false),
    highlightSummary: z.string().optional(),
  }),
});

const home = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().optional(),
    greeting: z.string().optional(), // For Hero
    name: z.string().optional(), // For Hero
    description: z.string().optional(), // For Hero
    cta: z
      .object({
        text: z.string(),
        href: z.string(),
      })
      .optional(),
    fallback: z.string().optional(), // For Highlights
  }),
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
    // Awards
    z.object({
      type: z.literal("awards"),
      title: z.string(),
      content: z.array(
        z.object({
          title: z.string(),
          date: z.string().optional(),
          order: z.number().optional(),
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
    // Standard Entry (Experience, Education, Projects, Profile, Metadata)
    z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      date: z.string().optional(),
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

export const collections = {
  projects,
  timeline,
  home,
  resume,
  contact,
  "ui-strings": ui_strings,
  "page-metadata": page_metadata,
};
