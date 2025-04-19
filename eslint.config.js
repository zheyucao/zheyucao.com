import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
// import pluginReact from "eslint-plugin-react"; // Keep if using React components, remove otherwise
import pluginAstro from "eslint-plugin-astro";
import eslintConfigPrettier from "eslint-config-prettier"; // Import prettier config

// Note: No defineConfig needed with flat config array directly
export default [
  { ignores: [".astro/", "dist/", "node_modules/"] }, // Added dist/ and node_modules/

  // Base config for JS/TS files
  js.configs.recommended,
  ...tseslint.configs.recommended, // Spread TS recommended configs

  // Astro specific configurations
  ...pluginAstro.configs["flat/recommended"], // Use flat config version

  {
    // Further customize Astro files
    files: ["**/*.astro"],
    languageOptions: {
      globals: {
        ...globals.browser, // Add browser globals
        node: true, // Add node globals if using node APIs in astro files
      },
      parser: pluginAstro.parser, // Use astro parser
      parserOptions: {
        parser: tseslint.parser, // Use TS parser within <script>
        extraFileExtensions: [".astro"],
      },
    },
    rules: {
      // Add any Astro specific rule overrides here if needed
      // Example: "astro/no-set-html-directive": "warn"
    },
  },

  // Configuration for TypeScript files specifically (if needed beyond recommended)
  {
    files: ["**/*.ts", "**/*.tsx"], // If you have separate TS/TSX files
    // Add specific TS rules or overrides here if needed
  },

  /* Keep if using React components, remove otherwise */
  // {
  //   files: ["**/*.{jsx,tsx,astro}"], // Apply React rules to relevant files
  //   ...pluginReact.configs.flat.recommended,
  //   languageOptions: {
  //     ...pluginReact.configs.flat.recommended.languageOptions,
  //     globals: {
  //       ...globals.browser,
  //     },
  //   },
  //   rules: {
  //     ...pluginReact.configs.flat.recommended.rules,
  //     // Specific React overrides for Astro if needed
  //     "react/jsx-filename-extension": "off",
  //     "react/react-in-jsx-scope": "off", // Usually needed for Astro + React
  //   },
  // },

  // !!! IMPORTANT: Prettier config must be LAST to override other style rules !!!
  eslintConfigPrettier,
];
