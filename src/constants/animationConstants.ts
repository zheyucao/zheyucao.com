/**
 * Centralized animation configuration constants
 * Extracted from various components to improve maintainability
 */

export const ANIMATION_CONSTANTS = {
  // DynamicBackground FPS thresholds
  FPS: {
    TARGET: 60,
    HISTORY_LENGTH: 60,
  },

  // ScrollIndicator timing (in milliseconds)
  SCROLL_INDICATOR: {
    FADE_IN_DELAY: 3000,
    FADE_OUT_DURATION: 300,
    SCROLL_DURATION: 1.6,
    SCROLL_TRIGGER_START: 10, // px
    SCROLL_TRIGGER_END_OFFSET: 150, // px
  },

  // GSAP scrub values and animation durations
  GSAP: {
    SECTION_TITLE_SCRUB: 1,
    SECTION_CONTENT_SCRUB: 1,
    FOOTER_SCRUB: 1,
    INDICATOR_SCRUB: 0.5,
  },
  SECTION_TITLE_DURATION: 2,
  SECTION_CONTENT_DURATION: 1.2,
} as const;
