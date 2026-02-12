import { ScrollTrigger } from "../animations/gsapPlugins";

// Match the CSS timings for each phase.
const SWIPE_OUT_DURATION = 220;
const SWIPE_IN_DURATION = 700;

export class EventFilterController {
  private container: HTMLElement;
  private currentFilter: string = "all";
  private categoryTabs: NodeListOf<HTMLElement>;
  private reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
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
    if (this.reduceMotion.matches) {
      this.animationRunId += 1;
      this.clearPendingAnimation();
      this.applyFilter();
      this.container.classList.remove("is-swiping-out", "is-swiping-in", "is-swiping-in-active");
      return;
    }

    this.clearPendingAnimation();
    const runId = ++this.animationRunId;
    this.container.classList.remove("is-swiping-in", "is-swiping-in-active", "is-swiping-out");

    const finishSwipe = () => {
      if (runId !== this.animationRunId) {
        return;
      }
      this.clearPendingAnimation();
      this.container.classList.remove("is-swiping-in", "is-swiping-in-active", "is-swiping-out");
    };

    const startSwipeIn = () => {
      if (runId !== this.animationRunId) {
        return;
      }
      this.clearPendingAnimation();
      this.applyFilter();
      this.container.classList.remove("is-swiping-out", "is-swiping-in-active");
      this.container.classList.add("is-swiping-in");

      // Force layout so swipe-in starts from the right before transitioning to rest.
      void this.container.offsetWidth;

      // Use in-phase duration with a tiny buffer as fallback.
      this.transitionTimeoutId = window.setTimeout(finishSwipe, SWIPE_IN_DURATION + 24);

      this.transitionEndHandler = (event: TransitionEvent) => {
        if (event.target !== this.container || event.propertyName !== "transform") {
          return;
        }
        finishSwipe();
      };
      this.container.addEventListener("transitionend", this.transitionEndHandler);
      this.container.classList.add("is-swiping-in-active");
      this.container.classList.remove("is-swiping-in");
    };

    this.container.classList.add("is-swiping-out");
    this.animationFrameId = requestAnimationFrame(() => {
      if (runId !== this.animationRunId) {
        return;
      }
      // Use out-phase duration with a tiny buffer as fallback.
      this.transitionTimeoutId = window.setTimeout(startSwipeIn, SWIPE_OUT_DURATION + 12);
      this.transitionEndHandler = (event: TransitionEvent) => {
        if (event.target !== this.container || event.propertyName !== "transform") {
          return;
        }
        startSwipeIn();
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
    const events = Array.from(this.container.querySelectorAll<HTMLElement>(".timeline-event"));
    let lastVisibleEvent: HTMLElement | null = null;

    for (const el of events) {
      const category = el.dataset.category;
      el.classList.remove("is-last-visible");
      const connector = el.querySelector<HTMLElement>(".timeline-connector");
      if (connector) {
        connector.style.display = "";
      }

      if (this.currentFilter === "all" || category === this.currentFilter) {
        el.style.display = "";
        lastVisibleEvent = el;
      } else {
        el.style.display = "none";
      }
    }

    if (lastVisibleEvent) {
      lastVisibleEvent.classList.add("is-last-visible");
      const lastConnector = lastVisibleEvent.querySelector<HTMLElement>(".timeline-connector");
      if (lastConnector) {
        lastConnector.style.display = "none";
      }
    }

    this.refreshScrollTriggers();
  }

  private refreshScrollTriggers() {
    // Filtering updates timeline height. Refresh ScrollTrigger on next frame
    // so footer/section triggers re-measure against the new layout.
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }

  public destroy() {
    this.animationRunId += 1;
    this.clearPendingAnimation();
    this.categoryTabs.forEach((tab) => {
      tab.removeEventListener("click", this.boundCategoryClick);
    });
    this.container.classList.remove("is-swiping-out", "is-swiping-in", "is-swiping-in-active");
  }
}
