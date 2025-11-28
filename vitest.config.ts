/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: [],
    include: ["src/**/*.{test,spec}.{js,ts}", "tests/**/*.test.ts"],
    alias: {
      "astro:content": "/tests/mocks/astro-content.ts",
    },
  },
});
