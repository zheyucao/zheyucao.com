import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getResumeViewModel } from '../../src/viewmodels/resumeViewModel';
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

describe('resumeViewModel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return resume view model correctly', async () => {
        const mockMetadata = { title: 'Resume', description: 'My Resume' };
        (getPageMetadata as any).mockResolvedValue(mockMetadata);

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
        (getCollection as any).mockResolvedValue(mockEntries);

        const result = await getResumeViewModel();

        expect(result.metadata).toEqual(mockMetadata);

        // Check main column
        expect(result.mainColumn).toHaveLength(5);
        expect(result.mainColumn[0].id).toBe('profile');
        expect(result.mainColumn[0].Content).toBe('ProfileContent');

        expect(result.mainColumn[1].id).toBe('education');
        expect((result.mainColumn[1] as any).content[0].title).toBe('University');

        expect(result.mainColumn[2].id).toBe('awards');
        expect((result.mainColumn[2] as any).content[0].title).toBe('Award');

        expect(result.mainColumn[3].id).toBe('experience');
        expect((result.mainColumn[3] as any).content[0].title).toBe('Job');

        expect(result.mainColumn[4].id).toBe('projects');
        expect((result.mainColumn[4] as any).content[0].title).toBe('App');

        // Check sidebar
        expect(result.sidebar).toHaveLength(2);
        expect(result.sidebar[0].id).toBe('skills');
        expect((result.sidebar[0] as any).content[0].name).toBe('Lang');

        expect(result.sidebar[1].id).toBe('contact');
        expect((result.sidebar[1] as any).content[0].icon).toBe('mail');
    });

    it('should throw error if profile is missing', async () => {
        (getCollection as any).mockResolvedValue([]);
        await expect(getResumeViewModel()).rejects.toThrow('Profile entry not found');
    });
});
