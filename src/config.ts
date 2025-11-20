export interface SiteConfig {
  metadata: {
    title: string;
    description: string;
    author: string;
    siteUrl: string;
  };
  navigation: {
    items: { name: string; href: string }[];
  };
  social: {
    linkedin: string;
    github: string;
    email: string;
  };
  theme: {
    defaultTheme: "light" | "dark" | "system";
  };
}

export const siteConfig: SiteConfig = {
  metadata: {
    title: "Zheyu Cao",
    description: "Personal website of Zheyu Cao, a Computer Science student and developer.",
    author: "Zheyu Cao",
    siteUrl: "https://zheyucao.com", // Update with actual URL if different
  },
  navigation: {
    items: [
      { name: "Home", href: "/" },
      { name: "Timeline", href: "/timeline" },
      { name: "Projects", href: "/projects" },
      { name: "Resume", href: "/resume" },
      { name: "Contact", href: "/contact" },
    ],
  },
  social: {
    linkedin: "https://www.linkedin.com/in/zheyu-cao", // Placeholder, update if known or leave for user
    github: "https://github.com/zheyu-cao", // Placeholder
    email: "mailto:contact@zheyucao.com", // Placeholder
  },
  theme: {
    defaultTheme: "system",
  },
};
