import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { onPageLifecycle } from "../../src/lib/utils/pageLifecycle";

type PageLifecycleWindow = Window & {
  __pageLifecycleRegistered__?: Record<string, boolean>;
};

describe("pageLifecycle", () => {
  describe("onPageLifecycle", () => {
    let originalRegistry: Record<string, boolean> | undefined;
    let addEventListenerSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      const win = window as PageLifecycleWindow;
      originalRegistry = win.__pageLifecycleRegistered__;
      win.__pageLifecycleRegistered__ = undefined;

      addEventListenerSpy = vi.spyOn(document, "addEventListener");
    });

    afterEach(() => {
      const win = window as PageLifecycleWindow;
      win.__pageLifecycleRegistered__ = originalRegistry;
      addEventListenerSpy.mockRestore();
    });

    it("should register event listeners for astro:page-load and astro:before-swap", () => {
      onPageLifecycle("test-key", { onLoad: () => {} });

      expect(addEventListenerSpy).toHaveBeenCalledWith("astro:page-load", expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith("astro:before-swap", expect.any(Function));
    });

    it("should not register duplicate listeners for the same key", () => {
      onPageLifecycle("unique-key", { onLoad: () => {} });
      const callCount = addEventListenerSpy.mock.calls.length;

      onPageLifecycle("unique-key", { onLoad: () => {} });
      expect(addEventListenerSpy.mock.calls.length).toBe(callCount);
    });

    it("should register separate listeners for different keys", () => {
      onPageLifecycle("key-a", { onLoad: () => {} });
      const callCountA = addEventListenerSpy.mock.calls.length;

      onPageLifecycle("key-b", { onLoad: () => {} });
      expect(addEventListenerSpy.mock.calls.length).toBe(callCountA + 2);
    });

    it("should call onLoad handler during page-load event", () => {
      const onLoadMock = vi.fn().mockReturnValue(() => {});

      onPageLifecycle("load-test", { onLoad: onLoadMock });

      const pageLoadHandler = addEventListenerSpy.mock.calls.find(
        (call: [string, EventListenerOrEventListenerObject, ...unknown[]]) =>
          call[0] === "astro:page-load"
      )?.[1] as EventListener;

      pageLoadHandler?.(new Event("astro:page-load"));

      expect(onLoadMock).toHaveBeenCalledTimes(1);
    });

    it("should call cleanup function returned from onLoad during before-swap", () => {
      const cleanupMock = vi.fn();
      const onLoadMock = vi.fn().mockReturnValue(cleanupMock);

      onPageLifecycle("cleanup-test", { onLoad: onLoadMock });

      const pageLoadHandler = addEventListenerSpy.mock.calls.find(
        (call: [string, EventListenerOrEventListenerObject, ...unknown[]]) =>
          call[0] === "astro:page-load"
      )?.[1] as EventListener;
      const beforeSwapHandler = addEventListenerSpy.mock.calls.find(
        (call: [string, EventListenerOrEventListenerObject, ...unknown[]]) =>
          call[0] === "astro:before-swap"
      )?.[1] as EventListener;

      pageLoadHandler?.(new Event("astro:page-load"));
      expect(cleanupMock).not.toHaveBeenCalled();

      beforeSwapHandler?.(new Event("astro:before-swap"));
      expect(cleanupMock).toHaveBeenCalledTimes(1);
    });

    it("should call onSwap handler during before-swap event", () => {
      const onSwapMock = vi.fn();

      onPageLifecycle("swap-test", { onSwap: onSwapMock });

      const beforeSwapHandler = addEventListenerSpy.mock.calls.find(
        (call: [string, EventListenerOrEventListenerObject, ...unknown[]]) =>
          call[0] === "astro:before-swap"
      )?.[1] as EventListener;

      beforeSwapHandler?.(new Event("astro:before-swap"));

      expect(onSwapMock).toHaveBeenCalledTimes(1);
    });
  });
});
