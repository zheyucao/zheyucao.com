import { describe, it, expect, beforeEach } from "vitest";
import { TimelineController, type TimelineEvent } from "./TimelineController";

describe("TimelineController", () => {
  let container: HTMLElement;
  let sortToggle: HTMLElement;
  let categoryTab1: HTMLElement;

  const mockEvents: TimelineEvent[] = [
    {
      date: "2024-01",
      title: "Event 1",
      category: "Cat1",
      description: "Desc 1",
    },
    {
      date: "2023-01",
      title: "Event 2",
      category: "Cat2",
      description: "Desc 2",
    },
    {
      date: "2024-06",
      title: "Event 3",
      category: "Cat1",
      description: "Desc 3",
    },
  ];

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div id="timeline-container"></div>
      <button class="category-tab" data-category="all">All</button>
      <button class="category-tab" data-category="Cat1">Cat1</button>
      <button class="category-tab" data-category="Cat2">Cat2</button>
      <button id="sort-toggle">Sort</button>
    `;

    container = document.getElementById("timeline-container")!;
    sortToggle = document.getElementById("sort-toggle")!;
    const tabs = document.querySelectorAll(".category-tab");
    categoryTab1 = tabs[1] as HTMLElement; // Cat1
  });

  it("should initialize and render all events by default", async () => {
    new TimelineController("#timeline-container", mockEvents, ".category-tab", "sort-toggle");

    // Wait for initial render (which has a small delay/transition)
    await new Promise((resolve) => setTimeout(resolve, 350));

    const items = container.querySelectorAll(".timeline-event");
    expect(items.length).toBe(3);
    // Default sort is newest first: Event 3 (2024-06), Event 1 (2024-01), Event 2 (2023-01)
    expect(items[0].querySelector(".timeline-title")?.textContent).toBe("Event 3");
    expect(items[1].querySelector(".timeline-title")?.textContent).toBe("Event 1");
    expect(items[2].querySelector(".timeline-title")?.textContent).toBe("Event 2");
  });

  it("should filter events when category tab is clicked", async () => {
    new TimelineController("#timeline-container", mockEvents, ".category-tab", "sort-toggle");
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Click Cat1
    categoryTab1.click();
    await new Promise((resolve) => setTimeout(resolve, 350));

    const items = container.querySelectorAll(".timeline-event");
    expect(items.length).toBe(2); // Event 1 and Event 3
    expect(items[0].querySelector(".timeline-title")?.textContent).toBe("Event 3");
    expect(items[1].querySelector(".timeline-title")?.textContent).toBe("Event 1");
  });

  it("should toggle sort order when sort button is clicked", async () => {
    new TimelineController("#timeline-container", mockEvents, ".category-tab", "sort-toggle");
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Default: Newest first (Event 3, Event 1, Event 2)
    let items = container.querySelectorAll(".timeline-event");
    expect(items[0].querySelector(".timeline-title")?.textContent).toBe("Event 3");

    // Click sort (switch to Oldest first)
    sortToggle.click();
    await new Promise((resolve) => setTimeout(resolve, 350));

    items = container.querySelectorAll(".timeline-event");
    expect(items.length).toBe(3);
    // Oldest first: Event 2 (2023-01), Event 1 (2024-01), Event 3 (2024-06)
    expect(items[0].querySelector(".timeline-title")?.textContent).toBe("Event 2");
    expect(items[1].querySelector(".timeline-title")?.textContent).toBe("Event 1");
    expect(items[2].querySelector(".timeline-title")?.textContent).toBe("Event 3");
  });
});
