/// <reference types="vitest" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    environment: "jsdom",
    setupFiles: [],
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
});
