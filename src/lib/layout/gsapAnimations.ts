import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function setupSectionAnimations() {
    const pageWrapper = document.querySelector(".page-wrapper");
    if (!pageWrapper) {
        console.warn("Section animations setup skipped: page wrapper not found.");
        return;
    }

    const sections = document.querySelectorAll(".section-wrapper");

    if (sections.length > 0) {
        sections.forEach((section) => {
            const sectionTitle = section.querySelector(".scroll-target-title");
            const sectionContent = section.querySelector(".scroll-target-content");

            // Kill previous triggers associated with these specific elements
            ScrollTrigger.getAll().forEach((trigger) => {
                if (trigger.trigger === sectionTitle || trigger.trigger === sectionContent) {
                    trigger.kill();
                }
            });

            // --- Section Title Animation ---
            if (sectionTitle) {
                gsap.set(sectionTitle, { filter: "blur(8px)", opacity: 0 });
                gsap
                    .timeline({
                        scrollTrigger: {
                            trigger: sectionTitle,
                            scroller: pageWrapper,
                            start: "top 85%",
                            end: "bottom top",
                            scrub: 1,
                        },
                    })
                    .to(sectionTitle, { filter: "blur(0px)", opacity: 1, ease: "sine", duration: 8 })
                    .to(sectionTitle, { filter: "blur(8px)", opacity: 0, ease: "sine", duration: 1 });
            }

            // --- Section Content Animation ---
            if (sectionContent) {
                gsap.set(sectionContent, { opacity: 0, y: 30 });
                gsap
                    .timeline({
                        scrollTrigger: {
                            trigger: sectionContent,
                            scroller: pageWrapper,
                            start: "top 85%",
                            end: "bottom 30%",
                            scrub: 1,
                        },
                    })
                    .to(sectionContent, { opacity: 1, y: 0, ease: "power1.inOut", duration: 2 })
                    .to(sectionContent, { opacity: 0, y: -30, ease: "power1.inOut", duration: 2 });
            }
        });
    }
}

export function cleanupScrollTriggers() {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}
