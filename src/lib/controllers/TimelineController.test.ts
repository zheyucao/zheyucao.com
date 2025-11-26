import { describe, it, expect, beforeEach } from "vitest";
import { TimelineController } from "./TimelineController";

describe("TimelineController", () => {
  let container: HTMLElement;
  let categoryTab1: HTMLElement;
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

    container = document.getElementById("timeline-container")!;
    const tabs = document.querySelectorAll(".category-tab");
    categoryTabAll = tabs[0] as HTMLElement;
    categoryTab1 = tabs[1] as HTMLElement; // Cat1
  });

  it("should initialize and show all events by default", () => {
    new TimelineController("#timeline-container", ".category-tab");

    const event1 = document.getElementById("event1")!;
    const event2 = document.getElementById("event2")!;
    const event3 = document.getElementById("event3")!;

    expect(event1.style.display).toBe("");
    expect(event2.style.display).toBe("");
    expect(event3.style.display).toBe("");
  });

  it("should filter events when category tab is clicked", () => {
    new TimelineController("#timeline-container", ".category-tab");

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
    new TimelineController("#timeline-container", ".category-tab");

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
});
