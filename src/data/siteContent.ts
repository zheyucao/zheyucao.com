export const homeContent = {
    hero: {
        greeting: "Hello, I'm",
        name: "Zheyu Cao",
        description: "One who *discovers*, *devises* and *devotes*.",
    },
    meetMe: {
        title: "About me",
        paragraphs: [
            "I'm Zheyu Cao, a fourth-year undergraduate in **Computer Science and Technology** at **Northwestern Polytechnical University**.",
            "I enjoy tackling challenges and creating cool projects, from websites to handcrafted OS kernels. I currently focus on **Artificial Intelligence**, particularly exploring the capabilities of LLMs.",
            "Currently, I am eager to contribute to cutting-edge Deep Learning research.",
        ],
        cta: {
            text: "View My Résumé",
            href: "/resume",
        },
    },
    connect: {
        title: "Keep in touch",
        paragraphs: [
            "Being an researcher in AI, I am keen to connect with professors and researchers regarding studies or collaboration, and with recruiters about future opportunities.",
            "Beyond that, I look forward to making friends from all walks of life. Please feel free to reach out!",
        ],
        cta: {
            text: "See All Contact Info",
            href: "/contact",
        },
    },
    featuredWorks: {
        title: "Featured Works",
        cta: {
            text: "Discover More Projects",
            href: "/projects",
        },
    },
    highlights: {
        title: "Highlights & Updates",
        cta: {
            text: "Explore My Journey",
            href: "/timeline",
        },
        fallback: "No recent highlights available. Check back soon!",
    },
    // Add other sections as we migrate them
};

// contactContent and resumeContent have been moved to their own data files.

export const projectsContent = {
    intro: "Here are some of the projects I've worked on. You can find more details and other experiments on my GitHub profiles.",
};
