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

const resume_experience = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        date: z.string(),
    }),
});

const resume_education = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        date: z.string(),
    }),
});

const resume_profile = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
    }),
});

const resume_data = defineCollection({
    type: 'data', // YAML/JSON
    schema: z.union([
        // Skills
        z.object({
            id: z.literal('skills'),
            title: z.string(),
            content: z.array(z.object({
                name: z.string(),
                items: z.array(z.string()),
            })),
        }),
        // Awards
        z.object({
            id: z.literal('awards'),
            title: z.string(),
            content: z.array(z.object({
                title: z.string(),
                date: z.string().optional(),
            })),
        }),
        // Contact
        z.object({
            id: z.literal('contact'),
            title: z.string(),
            content: z.array(z.object({
                icon: z.string(),
                label: z.string().optional(),
                href: z.string().optional(),
                target: z.string().optional(),
                rel: z.string().optional(),
            })),
        }),
    ]),
});

export const collections = {
    projects,
    timeline,
    sections,
    'resume-experience': resume_experience,
    'resume-education': resume_education,
    'resume-profile': resume_profile,
    'resume-data': resume_data,
};
