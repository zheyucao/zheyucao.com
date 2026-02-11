const ENTRY_ID_KEY = "__scrollEntryId";

type ScrollRestorationWindow = Window & {
  __scrollRestorePositions__?: Record<string, number>;
  __scrollRestorePositionsByUrl__?: Record<string, number>;
  __scrollRestorePendingEntryId__?: string | null;
  __scrollRestoreCurrentEntryId__?: string | null;
  __scrollRestoreHistoryNavigationPending__?: boolean;
  __scrollRestorePopstateRegistered__?: boolean;
  __scrollRestoreScrollHandler__?: (() => void) | null;
  __scrollRestoreBoundScroller__?: HTMLElement | null;
};

function getState() {
  const win = window as ScrollRestorationWindow;
  if (!win.__scrollRestorePositions__) {
    win.__scrollRestorePositions__ = {};
  }
  if (!win.__scrollRestorePositionsByUrl__) {
    win.__scrollRestorePositionsByUrl__ = {};
  }
  if (win.__scrollRestorePendingEntryId__ === undefined) {
    win.__scrollRestorePendingEntryId__ = null;
  }
  if (win.__scrollRestoreCurrentEntryId__ === undefined) {
    win.__scrollRestoreCurrentEntryId__ = null;
  }
  if (win.__scrollRestoreHistoryNavigationPending__ === undefined) {
    win.__scrollRestoreHistoryNavigationPending__ = false;
  }
  if (win.__scrollRestorePopstateRegistered__ === undefined) {
    win.__scrollRestorePopstateRegistered__ = false;
  }
  if (win.__scrollRestoreScrollHandler__ === undefined) {
    win.__scrollRestoreScrollHandler__ = null;
  }
  if (win.__scrollRestoreBoundScroller__ === undefined) {
    win.__scrollRestoreBoundScroller__ = null;
  }
  return win;
}

function getScroller(): HTMLElement | null {
  return document.querySelector<HTMLElement>(".page-wrapper");
}

function getUrlKey(): string {
  return `${window.location.pathname}${window.location.search}`;
}

function createEntryId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getCurrentEntryId(): string {
  const state = (window.history.state ?? {}) as Record<string, unknown>;
  const existingEntryId = state[ENTRY_ID_KEY];

  if (typeof existingEntryId === "string" && existingEntryId.length > 0) {
    return existingEntryId;
  }

  const nextEntryId = createEntryId();
  window.history.replaceState({ ...state, [ENTRY_ID_KEY]: nextEntryId }, "", window.location.href);
  return nextEntryId;
}

function ensureCurrentEntryId(): string {
  const state = getState();
  if (typeof state.__scrollRestoreCurrentEntryId__ === "string") {
    return state.__scrollRestoreCurrentEntryId__;
  }
  const entryId = getCurrentEntryId();
  state.__scrollRestoreCurrentEntryId__ = entryId;
  return entryId;
}

function bindScrollerListener(scroller: HTMLElement): void {
  const state = getState();
  if (state.__scrollRestoreBoundScroller__ === scroller && state.__scrollRestoreScrollHandler__) {
    return;
  }

  if (state.__scrollRestoreBoundScroller__ && state.__scrollRestoreScrollHandler__) {
    state.__scrollRestoreBoundScroller__.removeEventListener("scroll", state.__scrollRestoreScrollHandler__);
  }

  const onScroll = () => {
    const entryId = ensureCurrentEntryId();
    state.__scrollRestorePositions__![entryId] = scroller.scrollTop;
    state.__scrollRestorePositionsByUrl__![getUrlKey()] = scroller.scrollTop;
  };

  scroller.addEventListener("scroll", onScroll, { passive: true });
  state.__scrollRestoreBoundScroller__ = scroller;
  state.__scrollRestoreScrollHandler__ = onScroll;
}

export function setupScrollRestoration(): void {
  const state = getState();
  ensureCurrentEntryId();
  if (state.__scrollRestorePopstateRegistered__) {
    return;
  }

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  window.addEventListener("popstate", (event) => {
    const nextState = (event.state ?? {}) as Record<string, unknown>;
    const entryId = nextState[ENTRY_ID_KEY];
    state.__scrollRestoreHistoryNavigationPending__ = true;
    state.__scrollRestorePendingEntryId__ = typeof entryId === "string" ? entryId : null;
  });

  state.__scrollRestorePopstateRegistered__ = true;
}

export function saveScrollPosition(): void {
  const state = getState();
  const scroller = getScroller();
  if (!scroller) {
    return;
  }
  bindScrollerListener(scroller);
  const entryId = ensureCurrentEntryId();
  state.__scrollRestorePositions__![entryId] = scroller.scrollTop;
  state.__scrollRestorePositionsByUrl__![getUrlKey()] = scroller.scrollTop;
}

export function restoreScrollPosition(): void {
  const state = getState();
  const scroller = getScroller();
  if (!scroller) {
    return;
  }
  bindScrollerListener(scroller);

  const entryId = getCurrentEntryId();
  state.__scrollRestoreCurrentEntryId__ = entryId;
  const isHistoryNavigation = state.__scrollRestoreHistoryNavigationPending__ === true;
  const directHistoryMatch = state.__scrollRestorePendingEntryId__ === entryId;
  const top = isHistoryNavigation
    ? directHistoryMatch
      ? (state.__scrollRestorePositions__?.[entryId] ?? 0)
      : (state.__scrollRestorePositionsByUrl__?.[getUrlKey()] ?? 0)
    : 0;
  scroller.scrollTop = top;

  if (isHistoryNavigation) {
    // Ensure restoration survives late layout shifts during client-side navigation.
    requestAnimationFrame(() => {
      scroller.scrollTop = top;
    });
    window.setTimeout(() => {
      scroller.scrollTop = top;
    }, 120);
  }

  state.__scrollRestorePendingEntryId__ = null;
  state.__scrollRestoreHistoryNavigationPending__ = false;
}
