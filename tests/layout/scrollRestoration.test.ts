import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  restoreScrollPosition,
  saveScrollPosition,
  setupScrollRestoration,
} from "../../src/lib/layout/scrollRestoration";

type ScrollRestoreWindow = Window & {
  __scrollRestorePositions__?: Record<string, number>;
  __scrollRestorePositionsByUrl__?: Record<string, number>;
  __scrollRestorePendingEntryId__?: string | null;
  __scrollRestoreCurrentEntryId__?: string | null;
  __scrollRestoreHistoryNavigationPending__?: boolean;
  __scrollRestorePopstateRegistered__?: boolean;
};

describe("scrollRestoration", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div class="page-wrapper" style="height: 500px; overflow-y: auto;"></div>';
    window.history.replaceState(null, "", "/");

    const win = window as ScrollRestoreWindow;
    win.__scrollRestorePositions__ = undefined;
    win.__scrollRestorePositionsByUrl__ = undefined;
    win.__scrollRestorePendingEntryId__ = undefined;
    win.__scrollRestoreCurrentEntryId__ = undefined;
    win.__scrollRestoreHistoryNavigationPending__ = undefined;
    win.__scrollRestorePopstateRegistered__ = undefined;

    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("restores page-wrapper scroll position on history back navigation", () => {
    setupScrollRestoration();

    const scroller = document.querySelector<HTMLElement>(".page-wrapper");
    expect(scroller).not.toBeNull();
    if (!scroller) {
      throw new Error("Missing page-wrapper in test");
    }

    // Initial page entry
    restoreScrollPosition();
    const firstState = window.history.state;
    scroller.scrollTop = 420;
    saveScrollPosition();

    // Navigate to a second page entry
    window.history.pushState({}, "", "/second");
    restoreScrollPosition();
    const secondState = window.history.state;
    scroller.scrollTop = 155;
    saveScrollPosition();

    // Simulate browser back navigation into first entry
    window.dispatchEvent(new PopStateEvent("popstate", { state: firstState }));
    window.history.replaceState(firstState, "", "/");

    // before-swap of outgoing second page
    scroller.scrollTop = 180;
    saveScrollPosition();

    // page-load of incoming first page
    restoreScrollPosition();
    expect(scroller.scrollTop).toBe(420);

    // Ensure second entry position still tracks outgoing page.
    window.dispatchEvent(new PopStateEvent("popstate", { state: secondState }));
    window.history.replaceState(secondState, "", "/second");
    restoreScrollPosition();
    expect(scroller.scrollTop).toBe(180);
  });

  it("restores using URL fallback when popstate state has no entry id", () => {
    setupScrollRestoration();

    const scroller = document.querySelector<HTMLElement>(".page-wrapper");
    expect(scroller).not.toBeNull();
    if (!scroller) {
      throw new Error("Missing page-wrapper in test");
    }

    // Save position on home URL.
    restoreScrollPosition();
    scroller.scrollTop = 360;
    saveScrollPosition();

    // Simulate leaving home.
    window.history.pushState({}, "", "/timeline");
    restoreScrollPosition();
    scroller.scrollTop = 80;
    saveScrollPosition();

    // Simulate back navigation where router provides null/empty state.
    window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
    window.history.replaceState({}, "", "/");
    restoreScrollPosition();

    expect(scroller.scrollTop).toBe(360);
  });
});
