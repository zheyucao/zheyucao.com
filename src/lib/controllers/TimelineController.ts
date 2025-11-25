import { parseDate, formatTimelineDate } from "../utils/dateUtils";

export interface TimelineEvent {
  date: string;
  dateRange?: string;
  title: string;
  description?: string;
  renderedDescription?: string;
  category: string;
}

export type SortOrder = "newest" | "oldest";

export class TimelineController {
  private container: HTMLElement;
  private events: TimelineEvent[];
  private currentFilter: string = "all";
  private currentSort: SortOrder = "newest";
  private categoryTabs: NodeListOf<HTMLElement>;
  private sortToggle: HTMLElement | null;

  constructor(
    containerId: string,
    events: TimelineEvent[],
    categoryTabsSelector: string,
    sortToggleId: string
  ) {
    const container = document.querySelector(containerId);
    if (!container) throw new Error(`Timeline container not found: ${containerId}`);
    this.container = container as HTMLElement;
    this.events = events;
    this.categoryTabs = document.querySelectorAll(categoryTabsSelector);
    this.sortToggle = document.getElementById(sortToggleId);

    this.init();
  }

  private init() {
    this.setupEventListeners();
    this.render();
    this.updateUI();
  }

  private setupEventListeners() {
    this.categoryTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => this.handleCategoryClick(e));
    });

    if (this.sortToggle) {
      this.sortToggle.addEventListener("click", () => this.handleSortClick());
    }
  }

  private handleCategoryClick(e: Event) {
    const target = e.currentTarget as HTMLElement;
    const category = target.dataset.category;
    if (category && category !== this.currentFilter) {
      this.currentFilter = category;
      this.updateUI();
      this.render();
    }
  }

  private handleSortClick() {
    this.currentSort = this.currentSort === "newest" ? "oldest" : "newest";
    this.updateUI();
    this.render();
  }

  private updateUI() {
    // Update tabs
    this.categoryTabs.forEach((tab) => {
      if (tab.dataset.category === this.currentFilter) {
        tab.setAttribute("aria-pressed", "true");
      } else {
        tab.removeAttribute("aria-pressed");
      }
    });

    // Update sort toggle
    if (this.sortToggle) {
      this.sortToggle.dataset.sortCurrent = this.currentSort;
      this.sortToggle.textContent = this.currentSort === "newest" ? "Newest First" : "Oldest First";
    }
  }

  private filterEvents(): TimelineEvent[] {
    let filtered = this.events;
    if (this.currentFilter !== "all") {
      filtered = this.events.filter((event) => event.category === this.currentFilter);
    }
    return filtered;
  }

  private sortEvents(events: TimelineEvent[]): TimelineEvent[] {
    return [...events].sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return this.currentSort === "newest" ? dateB - dateA : dateA - dateB;
    });
  }

  public async render() {
    // Add fade-out class
    this.container.classList.add("is-updating");

    // Wait for transition
    await new Promise((resolve) => setTimeout(resolve, 300));

    const filtered = this.filterEvents();
    const sorted = this.sortEvents(filtered);

    const html = sorted
      .map((event, index) => {
        const isLast = index === sorted.length - 1;
        const displayDate = event.dateRange ? event.dateRange : formatTimelineDate(event.date);
        const descriptionHTML = event.renderedDescription
          ? `<div class="timeline-description">${event.renderedDescription}</div>`
          : "";

        return `
        <li class="timeline-event ${isLast ? "is-last" : ""}">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <span class="timeline-date">${displayDate}</span>
              <h3 class="timeline-title">${event.title}</h3>
            </div>
            ${descriptionHTML}
          </div>
        </li>
      `;
      })
      .join("");

    this.container.innerHTML = html;

    // Remove fade-out class
    this.container.classList.remove("is-updating");

    // Dispatch event for footer animation
    document.dispatchEvent(new CustomEvent("refresh-footer-animation"));
  }
}
