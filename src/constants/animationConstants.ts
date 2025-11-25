/**
 * Centralized animation configuration constants
 * Extracted from various components to improve maintainability
 */

export const ANIMATION_CONSTANTS = {
  // DynamicBackground FPS thresholds and performance levels
  FPS: {
    TARGET: 60,
    HISTORY_LENGTH: 60,
    LEVEL_1_MAX: 30,
    LEVEL_1_RECOVERY: 35,
    LEVEL_2_MAX: 40,
    LEVEL_2_RECOVERY: 45,
    LEVEL_3_MAX: 55,
    LEVEL_4_MIN: 55,
    LEVEL_4_DEGRADE: 50,
    REQUIRED_FRAMES_FOR_SWITCH: 30,
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

  // Performance thresholds
  PERFORMANCE: {
    STATIC_VELOCITY_THRESHOLD: 0.01,
    POSITION_CHANGE_THRESHOLD: 0.1,
    ANGLE_CHANGE_THRESHOLD: 0.01,
    },
} as const;
