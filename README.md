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
- **src/data/**: Centralized data for site content.
  - `config.ts`: Global site configuration (metadata, navigation, social links).
  - `siteContent.ts`: Text content for the homepage and general sections.
  - `resumeData.ts`: Structured data for the resume page (experience, education, skills, etc.).
  - `contactData.ts`: Contact information and social links.
  - `projectsData.ts`: Data for the projects portfolio.
  - `timelineEvents.ts`: Data for the timeline page.
- **src/styles/**: CSS styles.
  - `global.css`: Global styles, variables, and animations.
  - `timeline.css`: Specific styles for the timeline.
- **public/**: Static assets.
  - `images/`: Images used in the website.
  - `favicon.png`: Favicon for the website.
- **utils/**: Utility functions and scripts.

## Features

- **Home Page**: Features a hero section, about section, projects preview, and contact section.
- **Projects Page**: Displays a full list of projects.
- **Timeline Page**: Shows a timeline of events.
- **Resume Page**: Fully data-driven resume with generic templates for easy customization.
- **Contact Page**: Contact information with categorized sections.
- **Animations**: Uses GSAP for animations, including scroll-triggered effects.
- **Data-Driven Architecture**: All content is managed through structured data files for easy updates.

## Content Management

This project uses a data-driven architecture to separate content from code, making it easy to update and maintain.

- **Global Config**: `src/config.ts` handles site-wide settings like title, description, and navigation links.
- **Page Content**:
  - **Home**: Managed via `src/data/siteContent.ts`.
  - **Resume**: Fully data-driven via `src/data/resumeData.ts`. The resume page uses a generic rendering system (`ResumeSectionRenderer`) that takes this data and renders the appropriate templates (`EntryList`, `SkillGrid`, `TextSection`, `ContactList`).
  - **Contact**: Managed via `src/data/contactData.ts`.
  - **Projects & Timeline**: Managed via `src/data/projectsData.ts` and `src/data/timelineEvents.ts`.
- **Customization**: To update the site's text or data, simply modify the corresponding file in `src/data/`. No need to touch the Astro components for content updates.

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
