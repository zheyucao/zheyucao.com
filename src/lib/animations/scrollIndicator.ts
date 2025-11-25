/**
 * ScrollIndicator Animation Setup
 * Pure function module for setting up scroll indicator animations
 * Decoupled from global DOM - accepts element references as parameters
 */

import { ANIMATION_CONSTANTS } from "../../constants/animationConstants";
import { gsap, ScrollTrigger, registerGsapPlugins } from "./gsapPlugins";

registerGsapPlugins();

export interface ScrollIndicatorElements {
  indicator: HTMLElement;
  scroller: HTMLElement;
}

/**
 * Sets up scroll indicator animation with GSAP ScrollTriggers
 * Returns a cleanup function to be called on navigation
 */
export function setupScrollIndicator(elements: ScrollIndicatorElements): () => void {
  const { indicator, scroller } = elements;
  const { SCROLL_INDICATOR, GSAP } = ANIMATION_CONSTANTS;

  let indicatorScrubTrigger: ScrollTrigger | null = null;
  let indicatorCallbackTrigger: ScrollTrigger | null = null;
  let fadeInTimeout: ReturnType<typeof setTimeout> | null = null;

  // Scroll-based fade-out using ScrollTrigger (Scrub)
  const animation = gsap.fromTo(
    indicator,
    { opacity: 0.6 },
    { opacity: 0, immediateRender: false }
  );

  indicatorScrubTrigger = ScrollTrigger.create({
    trigger: scroller,
    scroller: scroller,
    start: `${SCROLL_INDICATOR.SCROLL_TRIGGER_START}px top`,
    end: `+=${SCROLL_INDICATOR.SCROLL_TRIGGER_END_OFFSET}`,
    animation: animation,
    scrub: GSAP.INDICATOR_SCRUB,
  });

  // Show/hide callbacks
  const showIndicator = (delay = 0) => {
    if (indicatorScrubTrigger?.isActive) return;
    if (fadeInTimeout !== null) clearTimeout(fadeInTimeout);
    fadeInTimeout = setTimeout(() => {
      if (scroller.scrollTop < SCROLL_INDICATOR.SCROLL_TRIGGER_START) {
        gsap.to(indicator, { opacity: 0.6, duration: 0.5, overwrite: true });
      }
    }, delay);
  };

  const hideIndicator = () => {
    if (fadeInTimeout !== null) clearTimeout(fadeInTimeout);
    if (!indicatorScrubTrigger?.isActive) {
      gsap.to(indicator, {
        opacity: 0,
        duration: SCROLL_INDICATOR.FADE_OUT_DURATION / 1000,
        overwrite: true,
      });
    }
  };

  gsap.set(indicator, { opacity: 0 });
  if (scroller.scrollTop < SCROLL_INDICATOR.SCROLL_TRIGGER_START) {
    showIndicator(SCROLL_INDICATOR.FADE_IN_DELAY);
  }

  indicatorCallbackTrigger = ScrollTrigger.create({
    trigger: scroller,
    scroller: scroller,
    start: `${SCROLL_INDICATOR.SCROLL_TRIGGER_START}px top`,
    onEnter: hideIndicator,
    onLeaveBack: () => {
      if (scroller.scrollTop < 5) {
        hideIndicator();
      } else {
        showIndicator(SCROLL_INDICATOR.FADE_IN_DELAY);
      }
    },
  });

  // Return cleanup function
  return () => {
    if (indicatorScrubTrigger) {
      indicatorScrubTrigger.kill();
      indicatorScrubTrigger = null;
    }
    if (indicatorCallbackTrigger) {
      indicatorCallbackTrigger.kill();
      indicatorCallbackTrigger = null;
    }
    if (fadeInTimeout !== null) {
      clearTimeout(fadeInTimeout);
      fadeInTimeout = null;
    }
  };
}

/**
 * Sets up click handler for scroll indicator
 * Scrolls down one viewport height when clicked
 */
export function setupScrollIndicatorClick(elements: ScrollIndicatorElements): () => void {
  const { indicator, scroller } = elements;
  const { SCROLL_INDICATOR } = ANIMATION_CONSTANTS;

  const clickHandler = () => {
    const currentOpacity = parseFloat(window.getComputedStyle(indicator).opacity);
    if (currentOpacity > 0.1) {
      gsap.to(scroller, {
        duration: SCROLL_INDICATOR.SCROLL_DURATION,
        scrollTo: scroller.scrollTop + scroller.clientHeight,
        ease: "power2.out",
      });
    }
  };

  indicator.addEventListener("click", clickHandler);

  // Return cleanup function
  return () => {
    indicator.removeEventListener("click", clickHandler);
  };
}
