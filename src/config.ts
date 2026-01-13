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
  theme: {
    defaultTheme: "light" | "dark" | "system";
  };
}

export const siteConfig: SiteConfig = {
  metadata: {
    title: "Zheyu Cao's Personal Website",
    description: "A website showcasing Zheyu Cao's work, projects, updates and résumé.",
    author: "Zheyu Cao",
    siteUrl: "https://zheyucao.com", // Update with actual URL if different
  },
  navigation: {
    items: [
      { name: "Home", href: "/" },
      { name: "Timeline", href: "/timeline" },
      { name: "Projects", href: "/projects" },
      { name: "Résumé", href: "/resume" },
      { name: "Contact", href: "/contact" },
    ],
  },
  theme: {
    defaultTheme: "system",
  },
};
