export class TimelineController {
  private container: HTMLElement;
  private currentFilter: string = "all";
  private categoryTabs: NodeListOf<HTMLElement>;
  private reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  constructor(containerId: string, categoryTabsSelector: string) {
    const container = document.querySelector(containerId);
    if (!container) throw new Error(`Timeline container not found: ${containerId}`);
    this.container = container as HTMLElement;
    this.categoryTabs = document.querySelectorAll(categoryTabsSelector);

    this.init();
  }

  private init() {
    this.setupEventListeners();
    this.updateUI();
    this.applyFilter();
  }

  private setupEventListeners() {
    this.categoryTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => this.handleCategoryClick(e));
    });
  }

  private handleCategoryClick(e: Event) {
    const target = e.currentTarget as HTMLElement;
    const category = target.dataset.category;
    if (category && category !== this.currentFilter) {
      this.currentFilter = category;
      this.updateUI();
      this.runFilterAnimation();
    }
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
  }

  private runFilterAnimation() {
    if (this.reduceMotion.matches) {
      this.applyFilter();
      return;
    }

    this.container.classList.add("is-updating");

    // Let the opacity transition start before applying the new filter
    requestAnimationFrame(() => {
      setTimeout(() => {
        this.applyFilter();
        this.container.classList.remove("is-updating");
      }, 300);
    });
  }

  private applyFilter() {
    const events = this.container.querySelectorAll(".timeline-event");

    events.forEach((event) => {
      const el = event as HTMLElement;
      const category = el.dataset.category;

      if (this.currentFilter === "all" || category === this.currentFilter) {
        el.style.display = "";
        // Optional: Add animation class here if desired
      } else {
        el.style.display = "none";
      }
    });
  }
}
