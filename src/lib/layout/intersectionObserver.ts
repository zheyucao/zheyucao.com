import { prefersReducedMotion } from "../utils/motionPreferences";

export function setupIntersectionObserver() {
  if (prefersReducedMotion()) {
    // Show content immediately without transitions when reduced motion is requested
    document.querySelectorAll(".scroll-reveal-animate").forEach((el) => {
      el.classList.add("visible");
    });
    return () => {};
  }

  const pageWrapper = document.querySelector(".page-wrapper");
  if (!pageWrapper) {
    return () => {};
  }

  const observerOptions = {
    root: pageWrapper,
    rootMargin: "0px",
    threshold: 0.2,
  };

  const observerCallback: IntersectionObserverCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);

  const elementsToObserve = document.querySelectorAll(".scroll-reveal-animate");
  elementsToObserve.forEach((el) => {
    observer.observe(el);
  });

  return () => {
    observer.disconnect();
  };
}
