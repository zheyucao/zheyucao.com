// @ts-check
import { defineConfig } from "astro/config";

import icon from "astro-icon";

import mdx from "@astrojs/mdx";

import UnoCSS from "@unocss/astro";

// https://astro.build/config
export default defineConfig({
  integrations: [icon(), mdx(), UnoCSS({ injectReset: true })],
  prefetch: true,
});
