import { ANIMATION_CONSTANTS } from "../../constants/animationConstants";
import { gsap, ScrollTrigger, registerGsapPlugins } from "../animations/gsapPlugins";
import { prefersReducedMotion } from "../utils/motionPreferences";

registerGsapPlugins();

const SECTION_TRIGGER_PREFIX = "section-animation";

export function setupSectionAnimations(scroller?: HTMLElement) {
  if (prefersReducedMotion()) {
    return;
  }
  const pageWrapper = scroller ?? document.querySelector(".page-wrapper");
  if (!pageWrapper) {
    return;
  }

  const sections = document.querySelectorAll(".section-wrapper");

  cleanupSectionAnimations();

  if (sections.length > 0) {
    sections.forEach((section, index) => {
      const sectionTitle = section.querySelector(".scroll-target-title");
      const sectionContent = section.querySelector(".scroll-target-content");

      // --- Section Title Animation ---
      if (sectionTitle) {
        gsap.set(sectionTitle, { filter: "blur(8px)", opacity: 0 });
        gsap
          .timeline({
            scrollTrigger: {
              id: `${SECTION_TRIGGER_PREFIX}-title-${index}`,
              trigger: sectionTitle,
              scroller: pageWrapper,
              start: "top 85%",
              end: "bottom top",
              scrub: ANIMATION_CONSTANTS.GSAP.SECTION_TITLE_SCRUB,
            },
          })
          .to(sectionTitle, {
            filter: "blur(0px)",
            opacity: 1,
            ease: "sine",
            duration: ANIMATION_CONSTANTS.SECTION_TITLE_DURATION,
          });
      }

      // --- Section Content Animation ---
      if (sectionContent) {
        gsap.set(sectionContent, { opacity: 0, y: 30 });
        gsap
          .timeline({
            scrollTrigger: {
              id: `${SECTION_TRIGGER_PREFIX}-content-${index}`,
              trigger: sectionContent,
              scroller: pageWrapper,
              start: "top 85%",
              end: "bottom 30%",
              scrub: ANIMATION_CONSTANTS.GSAP.SECTION_CONTENT_SCRUB,
            },
          })
          .to(sectionContent, {
            opacity: 1,
            y: 0,
            ease: "power1.inOut",
            duration: ANIMATION_CONSTANTS.SECTION_CONTENT_DURATION,
          });
      }
    });
  }
}

export function cleanupSectionAnimations() {
  ScrollTrigger.getAll()
    .filter(
      (trigger) =>
        typeof trigger.vars.id === "string" && trigger.vars.id.startsWith(SECTION_TRIGGER_PREFIX)
    )
    .forEach((trigger) => trigger.kill());
}

export function cleanupScrollTriggers() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  gsap.globalTimeline.clear();
}
