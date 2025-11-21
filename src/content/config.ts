import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        timeframe: z.string().optional(),
        githubUrl: z.string().url().optional(),
        githubRepos: z.array(z.object({
            title: z.string().optional(),
            url: z.string().url(),
        })).optional(),
        projectUrl: z.string().url().optional(),
        techStack: z.array(z.string()).optional(),
        imageSrc: z.string().optional(),
        imageAlt: z.string().optional(),
        thumbnailSrc: z.string().optional(),
        isFeatured: z.boolean().default(false),
        homepageSummary: z.string().optional(),
        order: z.number().optional(), // Manual ordering for projects page
    }),
});

const timeline = defineCollection({
    type: 'content',
    schema: z.object({
        date: z.string(), // YYYY-MM
        dateRange: z.string().optional(),
        title: z.string(),
        category: z.enum(['Experiences', 'Honors']),
        isHighlight: z.boolean().default(false),
        highlightSummary: z.string().optional(),
    }),
});

const sections = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string().optional(),
        greeting: z.string().optional(), // For Hero
        name: z.string().optional(), // For Hero
        description: z.string().optional(), // For Hero
        cta: z.object({
            text: z.string(),
            href: z.string(),
        }).optional(),
        fallback: z.string().optional(), // For Highlights
    }),
});

const resume = defineCollection({
    type: 'content',
    schema: z.union([
        // Skills
        z.object({
            type: z.literal('skills'),
            title: z.string(),
            content: z.array(z.object({
                category: z.string(),
                items: z.array(z.string()),
            })),
        }),
        // Awards
        z.object({
            type: z.literal('awards'),
            title: z.string(),
            content: z.array(z.object({
                title: z.string(),
                date: z.string().optional(),
            })),
        }),
        // Contact
        z.object({
            type: z.literal('contact'),
            title: z.string(),
            content: z.array(z.object({
                icon: z.string(),
                label: z.string().optional(),
                href: z.string().optional(),
                target: z.string().optional(),
                rel: z.string().optional(),
                description: z.string().optional(),
            })),
        }),
        // Standard Entry (Experience, Education, Projects, Profile, Metadata)
        z.object({
            title: z.string(),
            subtitle: z.string().optional(),
            date: z.string().optional(),
            order: z.number().optional(), // Manual ordering
            actions: z.array(z.object({
                text: z.string(),
                href: z.string(),
                style: z.string().optional(),
                download: z.string().optional(),
                icon: z.string().optional(),
                iconPosition: z.enum(['left', 'right']).optional(),
                target: z.string().optional(),
                rel: z.string().optional(),
            })).optional(),
        }),
    ]),
});

const contact = defineCollection({
    type: 'content',
    schema: z.discriminatedUnion('kind', [
        z.object({
            kind: z.literal('text'),
            order: z.number().optional(),
        }),
        z.object({
            kind: z.literal('list'),
            order: z.number().optional(),
            items: z.array(z.object({
                icon: z.string(),
                label: z.string().optional(), // display label
                content: z.string().optional(), // underlying value (e.g., number, handle)
                href: z.string().optional(),
                target: z.string().optional(),
                rel: z.string().optional(),
                description: z.string().optional(),
                showOnHome: z.boolean().optional(),
                showOnContact: z.boolean().optional(),
            })),
        }),
    ]),
});

const ui_strings = defineCollection({
    type: 'data',
    schema: z.object({
        footer: z.object({
            linksHeading: z.string(),
            connectHeading: z.string(),
            githubLabel: z.string(),
            emailLabel: z.string(),
            copyrightText: z.string(),
        }),
        pages: z.object({
            projects: z.object({
                title: z.string(),
            }),
            timeline: z.object({
                title: z.string(),
                filterAll: z.string(),
            }),
        }),
    }),
});

export const collections = {
    projects,
    timeline,
    sections,
    resume,
    contact,
    'ui-strings': ui_strings,
};
