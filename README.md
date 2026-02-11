# zheyucao.com - Personal Website

Source code for zheyucao.com, built with Astro. Content lives in collections (MDX/YAML frontmatter) and pages render it through layouts and components.

## Project Structure

- **src/pages/**: Page shells that get data from view models and render components (`index.astro`, `projects.astro`, `timeline.astro`, `resume.astro`, `contact.astro`).
- **src/components/**: Reusable UI grouped by domain (`home/`, `projects/`, `timeline/`, `resume/`, `common/`).
- **src/layouts/**: Base page layouts (`Layout.astro`, `SubPageLayout.astro`).
- **src/content/**: Content collections (MDX/YAML frontmatter) for sections, projects, timeline, resume, contact, and UI strings; schemas in `src/content/config.ts`.
- **src/viewmodels/**: Load content collections and shape props for pages.
- **src/config.ts**: Site metadata and navigation.
- **src/styles/**: Global and feature styles.
- **src/content/document-layout/default.json**: Controls résumé section order, placement (main/sidebar), and source mapping.
- **public/**: Static assets (images, favicon).

## Features

- **Home**: Hero, about, featured projects, highlights, and contact teaser.
- **Projects**: MDX-backed projects with ordering and featured flags.
- **Timeline**: Events sourced from content collection with client-side filtering.
- **Résumé**: Collection-driven resume using generic section templates.
- **Contact**: Intro and contact lists pulled from individual MDX entries.
- **Animations**: GSAP-driven scroll effects and intersection reveals.

## Content Management

Content is managed through Astro content collections:

- **Global config**: `src/config.ts` for site metadata and navigation.
- **Content collections** (`src/content/` with schemas in `src/content/config.ts`): sections, projects, timeline events, résumé entries, contact intro/lists, UI strings. MDX bodies hold prose; frontmatter holds structured fields (links, tech stacks, flags, order).
- **View models** (`src/viewmodels/`): load and map content into the shapes pages need.

To update copy or data, edit the relevant entry in `src/content/`.

### Template Customization

- **Homepage sections**: Edit/add files in `src/content/homepage-sections/` and control order/visibility via frontmatter.
- **Projects/Timeline/Contact/Resume content**: Add or edit entries under each collection folder in `src/content/`.
- **Résumé layout**: Reorder sections, move between main/sidebar, or remap sources in `src/content/document-layout/default.json`.
- **Page metadata & actions**: Edit `src/content/page-metadata/*.mdx` (`actions[].variant` supports `default`, `primary`, `subtle`).
- **Navigation**: Edit `src/config.ts` for menu items/site metadata.
- **Adding a new page**: Create `src/pages/<slug>.astro`, then add navigation and optionally a `src/content/page-metadata/<slug>.mdx` entry.

## Development

### Prerequisites

- Node.js
- pnpm

### Installation

```bash
pnpm install
```

### Available Scripts

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |
| `pnpm lint`            | Run ESLint to check for code issues              |
| `pnpm lint:fix`        | Fix ESLint issues automatically                  |
| `pnpm check`           | Run Astro type/content checks                    |
| `pnpm format`          | Format code using Prettier                       |
| `pnpm format:check`    | Check code formatting without making changes     |

## Dependencies

- **Astro**: The main framework used for building the website.
- **GSAP**: Used for animations.
- **ESLint & Prettier**: Used for code linting and formatting.

## Usage Guidelines

- **Replace Personal Information**: You **must** replace all personal information found in the content files (e.g., in `src/content/`, `src/config.ts`). This includes, but is not limited to:
  - Your name
  - Biography or "About Me" sections
  - Contact information (email, social media links)
  - Project descriptions and details specific to the original author
  - Photographs, avatars, or other personal images

**Do Not Impersonate**: Do not present your modified version in a way that suggests it is the original author's website or that you are the original author. Clearly distinguish your site and content from the original.

**Keep the License**: While you should update the content, please retain the original `LICENSE` file or include the original copyright notice and permission notice in your derivative work, as required by the MIT License.

Failure to replace personal content may misrepresent you and the original author. Please use this template responsibly.
