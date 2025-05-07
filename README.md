# zheyucao.com - My Personal Website

This is the source code for the zheyucao.com personal website, built with Astro. It serves as both a personal website and a template for creating your own site.

## Project Structure

- **src/pages/**: Contains the main pages of the website.
  - `index.astro`: Home page with hero, about, projects preview, and contact sections.
  - `projects.astro`: Full list of projects.
  - `timeline.astro`: Timeline of events.
  - `resume.astro`: Resume page.
  - `contact.astro`: Contact information.
- **src/components/**: Reusable UI components.
  - `Footer.astro`: Footer component.
  - `ScrollIndicator.astro`: Scroll indicator component.
  - `DynamicBackground.astro`: Dynamic background component.
  - Subdirectories for page-specific components (e.g., `home/`, `projects/`, `timeline/`, `resume/`, `common/`).
- **src/layouts/**: Page layouts.
  - `Layout.astro`: Main layout.
  - `SubPageLayout.astro`: Layout for sub-pages.
- **src/data/**: Structured data for projects and timeline events.
  - `projectsData.ts`: Data for projects.
  - `timelineEvents.ts`: Data for timeline events.
- **src/styles/**: CSS styles.
  - `timeline.css`: Styles for the timeline page.
- **public/**: Static assets.
  - `images/`: Images used in the website.
  - `favicon.png`: Favicon for the website.
- **utils/**: Utility functions and scripts.

## Features

- **Home Page**: Features a hero section, about section, projects preview, and contact section.
- **Projects Page**: Displays a full list of projects.
- **Timeline Page**: Shows a timeline of events.
- **Resume Page**: Dedicated page for the resume.
- **Contact Page**: Contact information.
- **Animations**: Uses GSAP for animations, including scroll-triggered effects.

## Content Management

- Projects and timeline events are managed through structured data files in `src/data/`.
- Future plans include using Astro Content Collections for more dynamic content management.

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
| `pnpm format`          | Format code using Prettier                       |
| `pnpm format:check`    | Check code formatting without making changes     |

## Dependencies

- **Astro**: The main framework used for building the website.
- **GSAP**: Used for animations.
- **ESLint & Prettier**: Used for code linting and formatting.

## Usage Guidelines

- **Replace Personal Information**: You **must** replace all personal information found in the content files (e.g., in `src/pages/`, `src/components/`, `src/data/`, etc.). This includes, but is not limited to:
  - Your name
  - Biography or "About Me" sections
  - Contact information (email, social media links)
  - Project descriptions and details specific to the original author
  - Photographs, avatars, or other personal images

**Do Not Impersonate**: Do not present your modified version in a way that suggests it is the original author's website or that you are the original author. Clearly distinguish your site and content from the original.

**Keep the License**: While you should update the content, please retain the original `LICENSE` file or include the original copyright notice and permission notice in your derivative work, as required by the MIT License.

Failure to replace personal content may misrepresent you and the original author. Please use this template responsibly.
