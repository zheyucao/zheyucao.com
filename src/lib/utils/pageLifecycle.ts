/**
 * Utility for managing Astro page lifecycle events.
 * Eliminates boilerplate for registering astro:page-load and astro:before-swap handlers.
 */

type CleanupFn = () => void;

interface PageLifecycleHandlers {
  /**
   * Called on astro:page-load. Return a cleanup function for teardown on swap.
   */
  onLoad?: () => CleanupFn | void;
  /**
   * Called on astro:before-swap. Use for additional cleanup beyond the onLoad return.
   */
  onSwap?: () => void;
}

type PageLifecycleWindow = Window & {
  __pageLifecycleRegistered__?: Record<string, boolean>;
};

/**
 * Register page lifecycle handlers with automatic deduplication.
 * Only registers once per unique key, preventing duplicate event listeners
 * across Astro page transitions.
 *
 * @param key - Unique identifier to prevent duplicate registration
 * @param handlers - Object containing onLoad and/or onSwap handlers
 *
 * @example
 * ```ts
 * onPageLifecycle("my-feature", {
 *   onLoad: () => {
 *     const cleanup = initFeature();
 *     return cleanup; // Called on astro:before-swap
 *   },
 *   onSwap: () => {
 *     // Additional cleanup if needed
 *   }
 * });
 * ```
 */
export function onPageLifecycle(key: string, handlers: PageLifecycleHandlers): void {
  const win = window as PageLifecycleWindow;

  // Initialize registry if needed
  if (!win.__pageLifecycleRegistered__) {
    win.__pageLifecycleRegistered__ = {};
  }

  // Skip if already registered
  if (win.__pageLifecycleRegistered__[key]) {
    return;
  }
  win.__pageLifecycleRegistered__[key] = true;

  let cleanup: CleanupFn | void;

  const handlePageLoad = () => {
    // Run any previous cleanup first
    if (typeof cleanup === "function") {
      cleanup();
    }
    // Initialize and store new cleanup
    cleanup = handlers.onLoad?.();
  };

  const handleBeforeSwap = () => {
    // Run cleanup from onLoad return value
    if (typeof cleanup === "function") {
      cleanup();
      cleanup = undefined;
    }
    // Run additional swap handler
    handlers.onSwap?.();
  };

  document.addEventListener("astro:page-load", handlePageLoad);
  document.addEventListener("astro:before-swap", handleBeforeSwap);
}
