/**
 * Footer Animation Setup
 * Pure function module for setting up footer reveal animations
 * Decoupled from global DOM - accepts element references as parameters
 */

import { ANIMATION_CONSTANTS } from "../../constants/animationConstants";
import { gsap, ScrollTrigger, registerGsapPlugins } from "./gsapPlugins";
import { prefersReducedMotion } from "../utils/motionPreferences";

registerGsapPlugins();

export interface FooterAnimationElements {
  footer: HTMLElement;
  scroller: HTMLElement;
}

/**
 * Sets up footer reveal animation with GSAP ScrollTrigger
 * Returns a cleanup function to be called on navigation
 */
export function setupFooterAnimation(elements: FooterAnimationElements): () => void {
  const { footer, scroller } = elements;

  if (prefersReducedMotion()) {
    gsap.set(footer, { opacity: 1, y: 0 });
    return () => {};
  }

  let trigger: ScrollTrigger | null = null;

  // Fade-in animation on scroll (matching original behavior)
  trigger = ScrollTrigger.create({
    trigger: footer,
    scroller: scroller,
    start: "top 95%",
    end: "top 40%",
    scrub: ANIMATION_CONSTANTS.GSAP.FOOTER_SCRUB,
    animation: gsap.fromTo(footer, { opacity: 0, y: 115 }, { opacity: 1, y: 100, ease: "power1.in" }),
  });

  // Return cleanup function
  return () => {
    if (trigger) {
      trigger.kill();
      trigger = null;
    }
  };
}
