import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTimelineViewModel } from '../../src/viewmodels/timelineViewModel';
import { getCollection, getEntry } from 'astro:content';
import { getPageMetadata } from '../../src/lib/viewmodels/baseViewModel';

// Mock astro:content
vi.mock('astro:content', () => ({
    getCollection: vi.fn(),
    getEntry: vi.fn(),
}));

// Mock baseViewModel
vi.mock('../../src/lib/viewmodels/baseViewModel', () => ({
    getPageMetadata: vi.fn(),
}));

describe('timelineViewModel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return timeline view model correctly', async () => {
        const mockMetadata = { title: 'Timeline', description: 'My Timeline' };
        (getPageMetadata as any).mockResolvedValue(mockMetadata);

        const mockEvents = [
            {
                data: { date: '2023-01-01', title: 'Event 1', category: 'Cat1' },
                body: 'Description 1',
            },
            {
                data: { date: '2022-01-01', title: 'Event 2', category: 'Cat2' },
                body: 'Description 2',
            },
        ];
        (getCollection as any).mockResolvedValue(mockEvents);

        const mockUiStrings = {
            data: {
                pages: {
                    timeline: {
                        filterAll: 'All Events',
                    },
                },
            },
        };
        (getEntry as any).mockResolvedValue(mockUiStrings);

        const result = await getTimelineViewModel();

        expect(result.metadata).toEqual(mockMetadata);
        expect(result.events).toHaveLength(2);
        expect(result.events[0].description).toBe('Description 1');
        expect(result.categories).toEqual(['Cat1', 'Cat2']);
        expect(result.initialEvents).toHaveLength(2);
        // Sorted by date descending (newest first)
        expect(result.initialEvents[0].title).toBe('Event 1');
        expect(result.filterAll).toBe('All Events');
    });

    it('should throw error if UI strings are missing', async () => {
        (getCollection as any).mockResolvedValue([]);
        (getEntry as any).mockResolvedValue(undefined);

        await expect(getTimelineViewModel()).rejects.toThrow("Could not find UI strings for 'en'");
    });
});
