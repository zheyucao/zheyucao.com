import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getResumeViewModel, type ResumeSection } from '../../src/viewmodels/resumeViewModel';
import { getCollection } from 'astro:content';
import { getPageMetadata } from '../../src/lib/viewmodels/baseViewModel';

// Mock astro:content
vi.mock('astro:content', () => ({
    getCollection: vi.fn(),
}));

// Mock baseViewModel
vi.mock('../../src/lib/viewmodels/baseViewModel', () => ({
    getPageMetadata: vi.fn(),
}));

const mockedGetCollection = vi.mocked(getCollection);
const mockedGetPageMetadata = vi.mocked(getPageMetadata);

type EntrySection = Extract<ResumeSection, { type: 'entries' }>;
type SkillsSection = Extract<ResumeSection, { type: 'skills' }>;
type ContactSection = Extract<ResumeSection, { type: 'contact' }>;

describe('resumeViewModel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return resume view model correctly', async () => {
        const mockMetadata = { title: 'Resume', description: 'My Resume' };
        mockedGetPageMetadata.mockResolvedValue(mockMetadata as never);

        const mockEntries = [
            {
                id: 'profile/me.md',
                data: { title: 'Profile' },
                render: vi.fn().mockResolvedValue({ Content: 'ProfileContent' }),
            },
            {
                id: 'education/uni.md',
                data: { title: 'University', date: '2020', order: 1 },
                render: vi.fn().mockResolvedValue({ Content: 'UniContent' }),
            },
            {
                id: 'experience/job.md',
                data: { title: 'Job', date: '2021', order: 1 },
                render: vi.fn().mockResolvedValue({ Content: 'JobContent' }),
            },
            {
                id: 'projects/app.md',
                data: { title: 'App', date: '2022', order: 1 },
                render: vi.fn().mockResolvedValue({ Content: 'AppContent' }),
            },
            {
                id: 'awards/award.md',
                data: { title: 'Award', date: '2023', order: 1 },
                render: vi.fn().mockResolvedValue({ Content: 'AwardContent' }),
            },
            {
                id: 'skills.mdx',
                data: {
                    type: 'skills',
                    title: 'Skills',
                    content: [{ category: 'Lang', items: ['TS'] }]
                },
            },
            {
                id: 'contact.mdx',
                data: {
                    type: 'contact',
                    title: 'Contact',
                    content: [{ icon: 'mail', href: 'mailto:me' }]
                },
            },
        ];
        mockedGetCollection.mockResolvedValue(mockEntries as never);

        const result = await getResumeViewModel();

        expect(result.metadata).toEqual(mockMetadata);

        // Check main column
        expect(result.mainColumn).toHaveLength(5);
        expect(result.mainColumn[0].id).toBe('profile');
        expect(result.mainColumn[0].Content).toBe('ProfileContent');

        const educationSection = result.mainColumn[1] as EntrySection;
        expect(educationSection.id).toBe('education');
        expect(educationSection.content[0].title).toBe('University');

        const awardsSection = result.mainColumn[2] as EntrySection;
        expect(awardsSection.id).toBe('awards');
        expect(awardsSection.content[0].title).toBe('Award');

        const experienceSection = result.mainColumn[3] as EntrySection;
        expect(experienceSection.id).toBe('experience');
        expect(experienceSection.content[0].title).toBe('Job');

        const projectsSection = result.mainColumn[4] as EntrySection;
        expect(projectsSection.id).toBe('projects');
        expect(projectsSection.content[0].title).toBe('App');

        // Check sidebar
        expect(result.sidebar).toHaveLength(2);
        const skillsSection = result.sidebar[0] as SkillsSection;
        expect(skillsSection.id).toBe('skills');
        expect(skillsSection.content[0].name).toBe('Lang');

        const contactSection = result.sidebar[1] as ContactSection;
        expect(contactSection.id).toBe('contact');
        expect(contactSection.content[0].icon).toBe('mail');
    });

    it('should throw error if profile is missing', async () => {
        mockedGetCollection.mockResolvedValue([] as never);
        await expect(getResumeViewModel()).rejects.toThrow('Profile entry not found');
    });
});
