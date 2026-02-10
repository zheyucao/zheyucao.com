export class EventFilterController {
  private container: HTMLElement;
  private currentFilter: string = "all";
  private categoryTabs: NodeListOf<HTMLElement>;
  private reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  private boundCategoryClick: (e: Event) => void;
  private transitionTimeoutId: number | null = null;
  private transitionEndHandler: ((event: TransitionEvent) => void) | null = null;

  constructor(containerId: string, categoryTabsSelector: string) {
    const container = document.querySelector(containerId);
    if (!container) throw new Error(`Event container not found: ${containerId}`);
    this.container = container as HTMLElement;
    this.categoryTabs = document.querySelectorAll(categoryTabsSelector);
    this.boundCategoryClick = (e: Event) => this.handleCategoryClick(e);

    this.init();
  }

  private init() {
    this.setupEventListeners();
    this.updateUI();
    this.applyFilter();
  }

  private setupEventListeners() {
    this.categoryTabs.forEach((tab) => {
      tab.addEventListener("click", this.boundCategoryClick);
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
      this.clearPendingAnimation();
      this.applyFilter();
      return;
    }

    this.clearPendingAnimation();
    this.container.classList.add("is-updating");

    const finish = () => {
      this.clearPendingAnimation();
      this.applyFilter();
      this.container.classList.remove("is-updating");
    };

    // Let the opacity transition start before applying the new filter
    requestAnimationFrame(() => {
      const durationMs = this.getTransitionDurationMs(this.container);

      this.transitionEndHandler = (event: TransitionEvent) => {
        if (event.target !== this.container || event.propertyName !== "opacity") {
          return;
        }
        finish();
      };
      this.container.addEventListener("transitionend", this.transitionEndHandler);

      // Fallback in case transitionend doesn't fire.
      this.transitionTimeoutId = window.setTimeout(finish, Math.max(durationMs, 0) + 50);
    });
  }

  private clearPendingAnimation() {
    if (this.transitionTimeoutId !== null) {
      clearTimeout(this.transitionTimeoutId);
      this.transitionTimeoutId = null;
    }

    if (this.transitionEndHandler) {
      this.container.removeEventListener("transitionend", this.transitionEndHandler);
      this.transitionEndHandler = null;
    }
  }

  private getTransitionDurationMs(element: HTMLElement): number {
    const computed = window.getComputedStyle(element);
    const durations = computed.transitionDuration.split(",").map((value) => value.trim());
    const delays = computed.transitionDelay.split(",").map((value) => value.trim());

    const parseMs = (token: string): number => {
      if (token.endsWith("ms")) {
        return Number.parseFloat(token);
      }
      if (token.endsWith("s")) {
        return Number.parseFloat(token) * 1000;
      }
      return 0;
    };

    return durations.reduce((max, duration, index) => {
      const delay = delays[index] ?? delays[delays.length - 1] ?? "0s";
      return Math.max(max, parseMs(duration) + parseMs(delay));
    }, 0);
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

  public destroy() {
    this.clearPendingAnimation();
    this.categoryTabs.forEach((tab) => {
      tab.removeEventListener("click", this.boundCategoryClick);
    });
    this.container.classList.remove("is-updating");
  }
}
