import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { EventFilterController } from "./EventFilterController";

describe("EventFilterController", () => {
  let categoryTab1: HTMLElement;
  let categoryTab2: HTMLElement;
  let categoryTabAll: HTMLElement;

  beforeEach(() => {
    // Setup DOM with events already rendered (server-side simulation)
    document.body.innerHTML = `
      <div id="timeline-container">
        <div class="timeline-event" data-category="Cat1" id="event1">
          <div class="timeline-title">Event 1</div>
        </div>
        <div class="timeline-event" data-category="Cat2" id="event2">
          <div class="timeline-title">Event 2</div>
        </div>
        <div class="timeline-event" data-category="Cat1" id="event3">
          <div class="timeline-title">Event 3</div>
        </div>
      </div>
      <button class="category-tab" data-category="all">All</button>
      <button class="category-tab" data-category="Cat1">Cat1</button>
      <button class="category-tab" data-category="Cat2">Cat2</button>
    `;

    const tabs = document.querySelectorAll(".category-tab");
    categoryTabAll = tabs[0] as HTMLElement;
    categoryTab1 = tabs[1] as HTMLElement; // Cat1
    categoryTab2 = tabs[2] as HTMLElement; // Cat2
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize and show all events by default", () => {
    new EventFilterController("#timeline-container", ".category-tab");

    const event1 = document.getElementById("event1")!;
    const event2 = document.getElementById("event2")!;
    const event3 = document.getElementById("event3")!;

    expect(event1.style.display).toBe("");
    expect(event2.style.display).toBe("");
    expect(event3.style.display).toBe("");
  });

  it("should filter events when category tab is clicked", () => {
    new EventFilterController("#timeline-container", ".category-tab");

    // Click Cat1
    categoryTab1.click();

    const event1 = document.getElementById("event1")!;
    const event2 = document.getElementById("event2")!;
    const event3 = document.getElementById("event3")!;

    // Cat1 events should be visible
    expect(event1.style.display).toBe("");
    expect(event3.style.display).toBe("");

    // Cat2 event should be hidden
    expect(event2.style.display).toBe("none");
  });

  it("should show all events when 'All' tab is clicked after filtering", () => {
    new EventFilterController("#timeline-container", ".category-tab");

    // Click Cat1 first
    categoryTab1.click();

    // Then click All
    categoryTabAll.click();

    const event1 = document.getElementById("event1")!;
    const event2 = document.getElementById("event2")!;
    const event3 = document.getElementById("event3")!;

    expect(event1.style.display).toBe("");
    expect(event2.style.display).toBe("");
    expect(event3.style.display).toBe("");
  });

  it("should cancel a queued frame from a previous switch when switching rapidly", () => {
    window.matchMedia = vi.fn(() => ({
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));

    const frameCallbacks: FrameRequestCallback[] = [];
    const requestAnimationFrameSpy = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((cb: FrameRequestCallback) => {
        frameCallbacks.push(cb);
        return frameCallbacks.length;
      });
    const cancelAnimationFrameSpy = vi
      .spyOn(window, "cancelAnimationFrame")
      .mockImplementation(() => {});

    new EventFilterController("#timeline-container", ".category-tab");

    categoryTab1.click();
    categoryTab2.click();

    expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(2);
    expect(cancelAnimationFrameSpy).toHaveBeenCalledTimes(1);
    expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(1);
  });
});
