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
    const { GSAP } = ANIMATION_CONSTANTS;

    let trigger: ScrollTrigger | null = null;

    // Reveal animation on scroll
    const animation = gsap.fromTo(
        footer,
        { y: "100%" },
        { y: "0%", ease: "power1.out" }
    );

    trigger = ScrollTrigger.create({
        trigger: footer,
        scroller: scroller,
        start: "top bottom",
        end: "top center",
        animation: animation,
        scrub: GSAP.FOOTER_SCRUB,
    });

    // Return cleanup function
    return () => {
        if (trigger) {
            trigger.kill();
            trigger = null;
        }
    };
}
