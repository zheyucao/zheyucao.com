// src/data/projectsData.ts

export interface ProjectDataItem {
  title: string;
  timeframe?: string;
  githubUrl?: string;
  githubRepos?: { title?: string; url: string }[];
  projectUrl?: string;
  techStack?: string[];
  imageSrc?: string;
  imageAlt?: string;
  thumbnailSrc?: string; // Optional: Path to a square thumbnail image
  // blurhash?: string; // Add back if re-implementing blurhash
  description: string; // HTML string
  homepageSummary?: string; // Concise summary for homepage
  isFeatured?: boolean; // Flag for featuring on homepage
}

// Example data (replace with your actual data later)
export const allProjectsData: ProjectDataItem[] = [
  {
    title: "uniOS",
    timeframe: "September 2024 – February 2025",
    githubUrl: "https://github.com/angine04/unios",
    techStack: ["C", "Assembly", "QEMU", "Makefile"], // Core techs for OS dev
    imageSrc: "/images/projects/unios.png",
    imageAlt: "Screenshot of the uniOS project",
    // thumbnailSrc: "/images/projects/unios-thumb.png", // Example path - provide actual square thumbnail later
    description: `
An operating system pilot course project focused on core kernel concepts through independently completed labs.

Key kernel development labs included:
- **Bootloader & Initialization:** Developed the bootloader and managed system startup sequences in assembly.
- **Memory Management:** Implemented virtual memory using paging mechanisms.
- **Process Scheduling:** Designed and implemented a basic process scheduler.
- **System Calls:** Managed kernel-user space interaction through system call handling.

Additionally, co-developed the graphics system (2-person team):
- Led system design, driver implementation, and the composition layer.
- Implemented features like antialiasing, dirty region detection, alpha blending, etc.
- Designed and built a foundational window manager and GUI toolkit.
      `,
    isFeatured: true,
    homepageSummary:
      "A simple **Operating System** made from scratch in *C* and *Assembly*.",
  },
  {
    title: "zheyucao.com",
    timeframe: "April 2025",
    githubUrl: "https://github.com/zheyucao/zheyucao.com",
    projectUrl: "https://zheyucao.com",
    techStack: ["Astro", "TypeScript"], // Core framework, lang, animation lib
    imageSrc: "/images/projects/portfolio.png", // Placeholder path
    imageAlt: "Screenshot of the portfolio website homepage",
    description: `
My personal portfolio site, designed and built from scratch using Astro.

Features dynamic background effects, responsive design, smooth transitions, and content showcasing timeline, projects, and resume.
      `, // More concise description
    isFeatured: true,
    homepageSummary:
      "My personal **portfolio website** you're currently viewing, built with *Astro*.",
  },
  {
    title: "Angine Sans",
    timeframe: "February 2024",
    githubUrl: "https://github.com/angine04/angine-sans",
    imageSrc: "/images/projects/angine_sans.png",
    imageAlt: "Angine Sans",
    description: `
An open-source **sans-serif typeface** derived from Noto Sans.

Designed initially for personal use and branding, and shared under the SIL Open Font License 1.1.
      `,
    isFeatured: true,
    homepageSummary:
      "A **sans-serif typeface** derived from Noto Sans, designed for personal branding.",
  },
  {
    title: "Tooi Programming Language",
    timeframe: "March 2025 – Present",
    githubUrl: "https://github.com/angine04/tooi",
    techStack: ["C++", "CMake", "Catch2"], // Core lang, build, test
    imageSrc: "/images/projects/tooi.png",
    imageAlt: "Representation of the Tooi language project",
    description: `
A toy scripting language designed to run via REPL or script files. Currently work in progress.

Key implemented features include:
- Command-line interface with REPL environment (using linenoise).
- Robust error handling system.
- Lexical analyzer (Scanner) for tokenizing source code.
- Integrated unit testing framework (Catch2).

Parser development is in progress, with plans for a semantic analyzer, interpreter, and standard library.
      `,
    isFeatured: true,
    homepageSummary:
      "A toy **programming language** & its **interpreter**, currently under early development.",
  },
  {
    title: "v5Embark",
    timeframe: "March 2025",
    githubUrl: "https://github.com/angine04/v5Embark",
    imageSrc: "/images/projects/embark.png",
    imageAlt: "v5Embark",
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "MongoDB", "Mongoose"],
    description: `
A web service for Team V5++ (NPU Soccer Robot Team) to streamline new member registration and information management using Next.js and MongoDB.
      `, // Slightly enhanced description
  },
  {
    title: "v5Beacon",
    timeframe: "March 2025",
    imageSrc: "/images/projects/beacon.png",
    imageAlt: "v5Beacon",
    githubUrl: "https://github.com/angine04/v5Beacon",
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    description: `
A central web portal for Team V5++ providing unified access to team services and resources, built with Next.js.
      `, // Slightly enhanced description
  },
  {
    title: "cash Shell",
    timeframe: "October 2024",
    githubUrl: "https://github.com/angine04/cash",
    techStack: ["C++", "CMake"],
    description: `
A simple C++ toy shell ("cash").

- Executes external commands with argument/quote handling.
- Includes built-ins (*history*, *cd*, etc.) and single pipes.
- Utilizes *fork*, *exec*, and *pipe* system calls.
      `,
  },
  {
    title: "Student Management System (DBLabs)",
    timeframe: "November 2024",
    githubRepos: [
      { title: "Backend", url: "https://github.com/angine04/dblabs-backend" },
      { title: "Frontend", url: "https://github.com/angine04/dblabs-frontend" },
    ],
    techStack: ["Python", "Flask", "PostgreSQL", "React", "TypeScript"], // Core backend/frontend techs, DB, ORM
    imageSrc: "/images/projects/dblabs.png",
    imageAlt: "Screenshot of the Student Management System UI",
    description: `
A full-stack Student Management System developed for a university database course assignment (DBLabs).

Key aspects include:
- Comprehensive database design (PostgreSQL) based on requirement analysis, ensuring data integrity via constraints.
- Python backend using Flask and SQLAlchemy (ORM) providing RESTful APIs for CRUD operations.
- React frontend (TypeScript) for a responsive user interface, interacting with the backend API.
      `,
  },

  // Add more projects here
];
