// Fixed duration matching the CSS transition (300ms)
const TRANSITION_DURATION = 300;

export class EventFilterController {
  private container: HTMLElement;
  private currentFilter: string = "all";
  private categoryTabs: NodeListOf<HTMLElement>;
  private reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  private isWebKitBrowser = this.detectWebKitBrowser();
  private boundCategoryClick: (e: Event) => void;
  private transitionTimeoutId: number | null = null;
  private animationFrameId: number | null = null;
  private transitionEndHandler: ((event: TransitionEvent) => void) | null = null;
  private animationRunId = 0;

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
    if (this.reduceMotion.matches || this.isWebKitBrowser) {
      this.animationRunId += 1;
      this.clearPendingAnimation();
      this.applyFilter();
      this.container.classList.remove("is-updating");
      return;
    }

    this.clearPendingAnimation();
    const runId = ++this.animationRunId;
    this.container.classList.add("is-updating");

    const finish = () => {
      if (runId !== this.animationRunId) {
        return;
      }
      this.clearPendingAnimation();
      this.applyFilter();
      this.container.classList.remove("is-updating");
    };

    // Let the opacity transition start before applying the new filter
    this.animationFrameId = requestAnimationFrame(() => {
      if (runId !== this.animationRunId) {
        return;
      }
      // Use fixed duration + small buffer
      this.transitionTimeoutId = window.setTimeout(finish, TRANSITION_DURATION + 50);

      this.transitionEndHandler = (event: TransitionEvent) => {
        if (event.target !== this.container || event.propertyName !== "opacity") {
          return;
        }
        finish();
      };
      this.container.addEventListener("transitionend", this.transitionEndHandler);
    });
  }

  private clearPendingAnimation() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.transitionTimeoutId !== null) {
      clearTimeout(this.transitionTimeoutId);
      this.transitionTimeoutId = null;
    }

    if (this.transitionEndHandler) {
      this.container.removeEventListener("transitionend", this.transitionEndHandler);
      this.transitionEndHandler = null;
    }
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
    this.animationRunId += 1;
    this.clearPendingAnimation();
    this.categoryTabs.forEach((tab) => {
      tab.removeEventListener("click", this.boundCategoryClick);
    });
    this.container.classList.remove("is-updating");
  }

  private detectWebKitBrowser() {
    const userAgent = navigator.userAgent;
    const isSafariFamily = /Safari\//i.test(userAgent);
    const isExcludedEngine = /Chrome|Chromium|Edg|OPR|CriOS|FxiOS/i.test(userAgent);
    return isSafariFamily && !isExcludedEngine;
  }
}
