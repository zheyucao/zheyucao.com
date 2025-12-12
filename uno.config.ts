import { defineConfig, presetWind3, presetIcons } from "unocss";

export default defineConfig({
  presets: [
    presetWind3(), // Tailwind-compatible utilities
    presetIcons(), // Icon support
  ],
  theme: {
    colors: {
      // Reference CSS variables for theme-aware colors
      text: "var(--text-color)",
      "text-muted": "var(--text-muted)",
      bg: "var(--bg-color)",
      "link-hover": "var(--link-hover-color)",
      "button-border": "var(--button-border-color)",
      "button-border-hover": "var(--button-border-hover-color)",
      "button-hover-bg": "var(--button-hover-bg)",
      "card-border": "var(--card-border-color)",
      divider: "var(--timeline-line-color)",
    },
    fontFamily: {
      serif: "var(--font-family-serif)",
      sans: "var(--font-family-sans)",
    },
  },
  // Shortcuts for common patterns
  shortcuts: {
    "section-title": "text-[clamp(2rem,2rem+2vw,4rem)] font-normal mb-4",
    "section-content": "text-[1.25rem] leading-relaxed max-w-[65ch]",
    "btn-group": "flex gap-4 mt-8",
  },
});
