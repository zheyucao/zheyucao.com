import { defineConfig, presetWind3, presetIcons } from "unocss";

export default defineConfig({
  presets: [
    presetWind3(), // Tailwind-compatible utilities
    presetIcons(), // Icon support
  ],
});
