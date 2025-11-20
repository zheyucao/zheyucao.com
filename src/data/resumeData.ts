export type SectionType = 'text' | 'entries' | 'skills' | 'contact';

export interface ResumeSection {
    id: string;
    title: string;
    type: SectionType;
    content: any;
    visible?: boolean;
}

export const resumeData = {
    mainColumn: [
        {
            id: "profile",
            title: "Profile",
            type: "text",
            content: [
                "I'm **Zheyu Cao**, a fourth-year undergraduate student at **Northwestern Polytechnical University**, majoring in **Computer Science and Technology**.",
                "I'm deeply interested in **frontend development**, **artificial intelligence**, and **linguistics**. I love exploring and learning cool new things, especially where technology meets aesthetics.",
            ],
        },
        {
            id: "education",
            title: "Education",
            type: "entries",
            content: [
                {
                    title: "Northwestern Polytechnical University",
                    date: "September 2026 (Expected)",
                    subtitle: "Master of Engineering in Intelligence Science and Technology  \n*Admitted*",
                },
                {
                    title: "Northwestern Polytechnical University",
                    date: "September 2022 – Present",
                    subtitle:
                        "Bachelor of Engineering in Computer Science and Technology  \n*Fourth-year Undergraduate*",
                    details: [
                        "GPA: **3.718** &emsp; Average Score: **90.49** &emsp; Major Rank: **8**/192",
                        "College English Test - Band 4: **650** &emsp; College English Test - Band 6: **634**",
                    ],
                },
            ],
        },
        {
            id: "awards",
            title: "Honors & Awards",
            type: "entries",
            content: [
                {
                    title: "China National Scholarship",
                    date: "November 2024",
                },
                {
                    title: "NPU **Outstanding Student & First-Class Scholarship**",
                    date: "November 2024",
                },
                {
                    title: "NPU **Outstanding Student & Second-Class Scholarship**",
                    date: "November 2023",
                },
                {
                    title: "China Robot Contest: **National First Prize**",
                    date: "November 2024",
                },
                {
                    title: "China Robot Contest: **National First Prize**",
                    date: "May 2024",
                },
                {
                    title: "China Robot Contest: **National Second Prize**",
                    date: "October 2023",
                },
                {
                    title: "China Robot Championship: **National First Prize**",
                    date: "October 2024",
                },
                {
                    title: "Other national, provincial, and university-level awards and honors.",
                },
            ],
        },
        {
            id: "experience",
            title: "Experience",
            type: "entries",
            content: [
                {
                    title: "Westlake University NLP Lab",
                    subtitle: "Research Intern",
                    date: "July 2024 – September 2024",
                    details: [
                        "Supervisor: **[Prof. Yue Zhang](https://frcchang.github.io/)**.",
                        "Focus: LLM Prompting, Reasoning, Chain of Thought.",
                    ],
                },
                {
                    title: "Team V5++, NPU Soccer Robot Base",
                    subtitle: "Leader",
                    date: "May 2023 – July 2025",
                    details: [
                        "Managed team operations, served as Technical Director and led recruitment.",
                        "Led design and implementation of 2023-2025 recruitment technical exams.",
                        "Maintained team DevOps (cloud storage, LLM chatbot, code hosting, etc.).",
                        "Team awarded **Model Team of NPU** (2022).",
                    ],
                },
                {
                    title: "College Innovation & Entrepreneurship Training Program",
                    subtitle: "Member",
                    date: "September 2023 – June 2024",
                    details: [
                        "**National project**, completed with **Good standing** (2024).",
                        "Project: UAV Camouflage Object Recognition Based on Hyperspectral Image Reconstruction.",
                        "Contributed to UAV joint control development.",
                    ],
                },
            ],
        },
        {
            id: "projects",
            title: "Projects",
            type: "entries",
            content: [
                {
                    title: "uniOS Project, NPU Operating System Pilot Course",
                    date: "September 2024 – January 2025",
                    details: [
                        "Independently completed course labs, including Bootloader, Paging, Process Scheduling, Syscalls, etc.",
                        "Implemented graphics system for uniOS (2-person team):\n- Responsible for system design, hardware drivers and composition layer.\n- Implemented antialiasing, dirty region detection, alpha blending, etc.\n- Designed and implemented a simple window manager and GUI for uniOS.\n- GitHub Repository: [https://github.com/angine04/unios](https://github.com/angine04/unios).",
                    ],
                },
                {
                    title: "zheyucao.com",
                    date: "April 2025",
                    details: [
                        "This website you're currently viewing.",
                        "Designed and built by me for myself. It is built using:\n- Astro (framework)\n- TypeScript (programming language)\n- Plain CSS (styling)\n- GSAP (animations)\n- Node.js & pnpm (environment & package management)\n- Github Pages (hosting)",
                        "GitHub Repository: [https://github.com/zheyucao/zheyucao.com](https://github.com/zheyucao/zheyucao.com).",
                    ],
                },
            ],
        },
    ] as ResumeSection[],
    sidebar: [
        {
            id: "skills",
            title: "Skills",
            type: "skills",
            content: [
                {
                    name: "Languages",
                    items: ["C", "C++", "Python", "JavaScript", "TypeScript"],
                },
                {
                    name: "Tools & DevOps",
                    items: ["Git", "Docker", "Nginx", "CMake", "LaTeX"],
                },
                {
                    name: "Web Development",
                    items: ["React", "Tailwind CSS", "Flask", "Astro"],
                },
                {
                    name: "Vision",
                    items: ["OpenCV"],
                },
                {
                    name: "Robotics",
                    items: ["ROS", "Gazebo", "Rviz"],
                },
                {
                    name: "AI",
                    items: ["PyTorch", "NumPy", "Scikit-learn"],
                },
            ],
        },
        {
            id: "contact",
            title: "Contact",
            type: "contact",
            content: [
                {
                    icon: "ri:phone-line",
                    label: "+86 177 3134 3445",
                    href: "tel:+8617731343445",
                },
                {
                    icon: "ri:mail-line",
                    label: "zheyucao2004@gmail.com",
                    href: "mailto:zheyucao2004@gmail.com",
                },
                {
                    icon: "ri:planet-line",
                    label: "zheyucao.com",
                    href: "https://zheyucao.com",
                    target: "_blank",
                    rel: "noopener noreferrer",
                },
                {
                    icon: "ri:github-line",
                    label: "github.com/zheyucao",
                    href: "https://github.com/zheyucao",
                    target: "_blank",
                    rel: "noopener noreferrer",
                },
                {
                    icon: "ri:wechat-line",
                    label: "aktsnnm",
                },
                {
                    icon: "ri:qq-line",
                    label: "1060864974",
                },
            ],
        },
    ] as ResumeSection[],
};
