import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let pluginsRegistered = false;

// Ensure core GSAP plugins are registered once before use
export function registerGsapPlugins() {
  if (pluginsRegistered) return;

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  pluginsRegistered = true;
}

export { gsap, ScrollToPlugin, ScrollTrigger };
