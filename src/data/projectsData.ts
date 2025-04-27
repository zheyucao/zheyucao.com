// src/data/projectsData.ts

export interface ProjectDataItem {
  title: string;
  timeframe?: string;
  githubUrl?: string;
  projectUrl?: string;
  techStack?: string[];
  imageSrc?: string;
  imageAlt?: string;
  // blurhash?: string; // Add back if re-implementing blurhash
  description: string; // HTML string
}

// Example data (replace with your actual data later)
export const allProjectsData: ProjectDataItem[] = [
  {
    title: "uniOS",
    timeframe: "September 2024 – February 2025",
    githubUrl: "https://github.com/angine04/unios",
    techStack: ["C", "Assembly", "Makefile", "QEMU"],
    imageSrc: "/images/projects/unios.png",
    imageAlt: "Screenshot of the uniOS project",
    description: `
        <p>An operating system pilot course project involving independent completion of labs (Bootloader, Paging, Scheduling, Syscalls).</p>
        <p>Co-developed the graphics system (2-person team):</p>
        <ul>
          <li>Responsible for system design, drivers, and composition layer.</li>
          <li>Implemented features like antialiasing, dirty region detection, and alpha blending.</li>
          <li>Designed and implemented a simple window manager and GUI.</li>
        </ul>
      `,
  },
  {
    title: "Angine Sans",
    timeframe: "February 2024",
    githubUrl: "https://github.com/angine04/angine-sans",
    imageSrc: "/images/projects/angine_sans.png",
    imageAlt: "Angine Sans",
    description: `
          <p>A custom web font created for myself.</p>
      `,
  },
  {
    title: "zheyucao.com (This Website)",
    timeframe: "April 2025",
    githubUrl: "https://github.com/zheyu-cao/zheyucao.com",
    projectUrl: "https://zheyucao.com",
    techStack: ["Astro", "TypeScript", "CSS", "GSAP", "Node.js"],
    imageSrc: "/images/projects/portfolio.png", // Placeholder path
    imageAlt: "Screenshot of the portfolio website homepage",
    description: `
        <p>My personal portfolio site, designed and built from scratch.</p>
        <p>Features include:</p>
        <ul>
            <li>Dynamic background animations.</li>
            <li>Responsive design for various screen sizes.</li>
            <li>Smooth page transitions and scroll-triggered animations.</li>
            <li>Content showcasing timeline, projects, and resume.</li>
        </ul>
      `,
  },
  {
    title: "v5Embark",
    timeframe: "March 2025",
    githubUrl: "https://github.com/angine04/v5Embark",
    imageSrc: "/images/projects/embark.png",
    imageAlt: "v5Embark",
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    description: `
          <p>A service for Team V5++ NPU Soccer Robot Innovation Base that facilitates new member registration and information collection.</p>
      `,
  },
  {
    title: "v5Beacon",
    timeframe: "March 2025",
    imageSrc: "/images/projects/beacon.png",
    imageAlt: "v5Beacon",
    githubUrl: "https://github.com/angine04/v5Beacon",
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    description: `
          <p>A central portal for Team V5++ NPU Soccer Robot Innovation Base providing unified access to all team services and resources.</p>
      `,
  },

  // Add more projects here
];
