import { defineCollection, z } from "astro:content";
import { buildHomepageSectionsSchemaUnion } from "../lib/homepageSections/registry";

const YEAR_PATTERN = /^\d{4}$/;
const YEAR_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const PRESENT_PATTERN = /^present$/i;

const yearOrYearMonthDate = z.string().refine(
  (value) => YEAR_PATTERN.test(value) || YEAR_MONTH_PATTERN.test(value),
  {
    message: "Date must be in YYYY or YYYY-MM format",
  }
);

const yearOrYearMonthOrPresentDate = z.string().refine(
  (value) => PRESENT_PATTERN.test(value) || YEAR_PATTERN.test(value) || YEAR_MONTH_PATTERN.test(value),
  {
    message: 'Date must be in YYYY, YYYY-MM, or "present" format',
  }
);

const projects = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      startDate: yearOrYearMonthDate.optional(), // YYYY or YYYY-MM format
      endDate: yearOrYearMonthOrPresentDate.optional(), // YYYY, YYYY-MM, or "present"
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
    startDate: yearOrYearMonthDate, // YYYY or YYYY-MM format
    endDate: yearOrYearMonthOrPresentDate.optional(), // YYYY, YYYY-MM, or "present"
    title: z.string(),
    category: z.enum(["Experiences", "Honors"]),
    isHighlight: z.boolean().default(false),
    highlightSummary: z.string().optional(),
  }),
});

// Homepage sections collection - dynamic section system
const homepage_sections = defineCollection({
  type: "content",
  schema: buildHomepageSectionsSchemaUnion(z) as ReturnType<typeof z.discriminatedUnion>,
});

// Shared action schema for reuse across collections
const actionSchema = z.object({
  text: z.string(),
  href: z.string(),
  variant: z.enum(["default", "primary", "subtle"]).optional(),
  download: z.union([z.string(), z.boolean()]).optional(),
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
      startDate: yearOrYearMonthDate.optional(), // YYYY or YYYY-MM format
      endDate: yearOrYearMonthOrPresentDate.optional(), // YYYY, YYYY-MM, or "present"
      order: z.number().optional(), // Manual ordering
      actions: z.array(actionSchema).optional(),
    }),
  ]),
});

const contact = defineCollection({
  type: "content",
  schema: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("text"),
      order: z.number().optional(),
    }),
    z.object({
      type: z.literal("list"),
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

const resume_layout = defineCollection({
  type: "data",
  schema: z.object({
    sections: z.array(
      z.discriminatedUnion("type", [
        z.object({
          id: z.string(),
          type: z.literal("text"),
          column: z.enum(["main", "sidebar"]),
          source: z.string(),
          title: z.string().optional(),
          visible: z.boolean().default(true),
        }),
        z.object({
          id: z.string(),
          type: z.literal("entries"),
          column: z.enum(["main", "sidebar"]),
          sourcePrefix: z.string(),
          title: z.string().optional(),
          variant: z.enum(["default", "education", "experience", "awards", "projects"]).optional(),
          includeSubtitle: z.boolean().default(true),
          visible: z.boolean().default(true),
        }),
        z.object({
          id: z.string(),
          type: z.literal("skills"),
          column: z.enum(["main", "sidebar"]),
          source: z.string(),
          title: z.string().optional(),
          visible: z.boolean().default(true),
        }),
        z.object({
          id: z.string(),
          type: z.literal("contact"),
          column: z.enum(["main", "sidebar"]),
          source: z.string(),
          title: z.string().optional(),
          visible: z.boolean().default(true),
        }),
      ])
    ),
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
  "document-layout": resume_layout,
};
