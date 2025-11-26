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
    title: "Zheyu Cao",
    description:
      "Currently a fourth-year student at Northwestern Polytechnical University, pursuing a Bachelor's degree in Computer Science and Technology.",
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
