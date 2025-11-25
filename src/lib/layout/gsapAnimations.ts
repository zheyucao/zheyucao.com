import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function setupSectionAnimations() {
    const pageWrapper = document.querySelector(".page-wrapper");
    if (!pageWrapper) {
        return;
    }

    const sections = document.querySelectorAll(".section-wrapper");

    cleanupScrollTriggers();

    if (sections.length > 0) {
        sections.forEach((section) => {
            const sectionTitle = section.querySelector(".scroll-target-title");
            const sectionContent = section.querySelector(".scroll-target-content");

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
                    .to(sectionTitle, { filter: "blur(0px)", opacity: 1, ease: "sine", duration: 2 });
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
                    .to(sectionContent, { opacity: 1, y: 0, ease: "power1.inOut", duration: 1.2 });
            }
        });
    }
}

export function cleanupScrollTriggers() {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    gsap.globalTimeline.clear();
}
