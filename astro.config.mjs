// @ts-check
import { defineConfig } from "astro/config";

import icon from "astro-icon";

import mdx from "@astrojs/mdx";

import UnoCSS from "@unocss/astro";

// https://astro.build/config
export default defineConfig({
  integrations: [icon(), mdx(), UnoCSS()],
  prefetch: true,
  redirects: {
    // fallback if /_redirects file did not work
    "/resume.pdf": "https://assets.zheyucao.com/resume.pdf",
    "/pdf": "https://assets.zheyucao.com/resume.pdf",
  },
});
