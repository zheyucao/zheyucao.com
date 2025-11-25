/**
 * Footer Animation Setup
 * Pure function module for setting up footer reveal animations
 * Decoupled from global DOM - accepts element references as parameters
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ANIMATION_CONSTANTS } from "../../constants/animationConstants";

gsap.registerPlugin(ScrollTrigger);

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

  let trigger: ScrollTrigger | null = null;

  // Fade-in animation on scroll (matching original behavior)
  trigger = ScrollTrigger.create({
    trigger: footer,
    scroller: scroller,
    start: "top 95%",
    end: "top 40%",
    scrub: 1,
    animation: gsap.fromTo(footer, { opacity: 0, y: 15 }, { opacity: 1, y: 0, ease: "power1.in" }),
  });

  // Return cleanup function
  return () => {
    if (trigger) {
      trigger.kill();
      trigger = null;
    }
  };
}
