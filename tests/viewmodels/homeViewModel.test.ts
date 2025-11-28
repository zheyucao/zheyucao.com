import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHomeViewModel } from '../../src/viewmodels/homeViewModel';
import { getEntry, getCollection } from 'astro:content';

// Mock astro:content
vi.mock('astro:content', () => ({
    getEntry: vi.fn(),
    getCollection: vi.fn(),
}));

describe('homeViewModel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return home view model correctly', async () => {
        const mockHero = { data: { name: 'Test Name', greeting: 'Hello', description: 'Desc' } };
        const mockMeetMe = { data: { title: 'Meet Me', cta: { text: 'Read More', href: '/about' } }, render: vi.fn().mockResolvedValue({ Content: 'MeetMeContent' }) };
        const mockConnect = { data: { title: 'Connect', cta: { text: 'Contact', href: '/contact' } }, render: vi.fn().mockResolvedValue({ Content: 'ConnectContent' }) };
        const mockFeaturedWorks = { data: { title: 'Featured Works', cta: { text: 'View All', href: '/projects' } } };
        const mockHighlights = { data: { title: 'Highlights', cta: { text: 'View Timeline', href: '/timeline' }, fallback: 'No highlights' } };

        const mockProjects = [
            { data: { isFeatured: true, order: 1, title: 'Project 1' } },
            { data: { isFeatured: false, title: 'Project 2' } }
        ];

        const mockEvents = [
            { data: { isHighlight: true, date: '2023-01-01', title: 'Event 1' }, render: vi.fn().mockResolvedValue({ Content: 'Event1Content' }) },
            { data: { isHighlight: false, date: '2022-01-01', title: 'Event 2' } }
        ];

        const mockContact = [
            {
                data: {
                    kind: 'list',
                    order: 1,
                    items: [
                        { icon: 'github', href: 'https://github.com', showOnHome: true },
                        { icon: 'twitter', href: 'https://twitter.com', showOnHome: false }
                    ]
                }
            }
        ];

        (getEntry as any).mockImplementation((collection: string, slug: string) => {
            if (collection === 'home') {
                if (slug === 'hero') return Promise.resolve(mockHero);
                if (slug === 'meet-me') return Promise.resolve(mockMeetMe);
                if (slug === 'connect') return Promise.resolve(mockConnect);
                if (slug === 'featured-works') return Promise.resolve(mockFeaturedWorks);
                if (slug === 'highlights') return Promise.resolve(mockHighlights);
            }
            return Promise.resolve(undefined);
        });

        (getCollection as any).mockImplementation((collection: string) => {
            if (collection === 'projects') return Promise.resolve(mockProjects);
            if (collection === 'timeline') return Promise.resolve(mockEvents);
            if (collection === 'contact') return Promise.resolve(mockContact);
            return Promise.resolve([]);
        });

        const result = await getHomeViewModel();

        expect(result.hero).toEqual(mockHero.data);
        expect(result.meetMe.title).toBe('Meet Me');
        expect(result.meetMe.Content).toBe('MeetMeContent');
        expect(result.connect.title).toBe('Connect');
        expect(result.connect.Content).toBe('ConnectContent');

        expect(result.featuredWorks.projects).toHaveLength(1);
        expect(result.featuredWorks.projects[0].data.title).toBe('Project 1');

        expect(result.highlights.events).toHaveLength(1);
        expect(result.highlights.events[0].data.title).toBe('Event 1');
        expect(result.highlights.events[0].Content).toBe('Event1Content');

        expect(result.connectSocialItems).toHaveLength(1);
        expect(result.connectSocialItems[0].icon).toBe('github');
    });

    it('should throw error if required sections are missing', async () => {
        (getEntry as any).mockResolvedValue(undefined);
        (getCollection as any).mockResolvedValue([]);

        await expect(getHomeViewModel()).rejects.toThrow('Required homepage sections are missing.');
    });
});
