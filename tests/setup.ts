// Vitest setup file - global mocks for jsdom environment

// Mock window.matchMedia (not provided by jsdom)
// For tests, we simulate "prefers-reduced-motion: reduce" so animations
// run synchronously, making assertions predictable.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: query === "(prefers-reduced-motion: reduce)",
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
