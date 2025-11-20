export type SectionType = 'text' | 'entries' | 'skills' | 'contact';

export interface ResumeSection {
    id: string;
    title: string;
    type: SectionType;
    content: any;
    visible?: boolean;
}

export const resumeData = {
    download: {
        text: "PDF (Chinese)",
        href: "https://assets.zheyucao.com/resume.pdf",
        filename: "Zheyu_Cao_Resume_ZH.pdf",
    },
    mainColumn: [
        {
            id: "profile",
            title: "Profile",
            type: "text",
            content: [
                "I'm <strong>Zheyu Cao</strong>, a fourth-year undergraduate student at <strong>Northwestern Polytechnical University</strong>, majoring in <strong>Computer Science and Technology</strong>.",
                "I'm deeply interested in <strong>frontend development</strong>, <strong>artificial intelligence</strong>, and <strong>linguistics</strong>. I love exploring and learning cool new things, especially where technology meets aesthetics.",
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
                    subtitle: "Master of Engineering in Intelligence Science and Technology, <br /><em>Admitted</em>",
                },
                {
                    title: "Northwestern Polytechnical University",
                    date: "September 2022 – Present",
                    subtitle:
                        "Bachelor of Engineering in Computer Science and Technology, <br /><em>Fourth-year Undergraduate</em>",
                    details: [
                        "GPA: <strong>3.718</strong> &emsp; Average Score: <strong>90.49</strong> &emsp; Major Rank: <strong>8</strong>/192",
                        "College English Test - Band 4: <strong>650</strong> &emsp; College English Test - Band 6: <strong>634</strong>",
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
                    title: "NPU <strong>Outstanding Student & First-Class Scholarship</strong>",
                    date: "November 2024",
                },
                {
                    title: "NPU <strong>Outstanding Student & Second-Class Scholarship</strong>",
                    date: "November 2023",
                },
                {
                    title: "China Robot Contest: <strong>National First Prize</strong>",
                    date: "November 2024",
                },
                {
                    title: "China Robot Contest: <strong>National First Prize</strong>",
                    date: "May 2024",
                },
                {
                    title: "China Robot Contest: <strong>National Second Prize</strong>",
                    date: "October 2023",
                },
                {
                    title: "China Robot Championship: <strong>National First Prize</strong>",
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
                        "Supervisor: <strong><a href='https://frcchang.github.io/' target='_blank'>Prof. Yue Zhang</a></strong>.",
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
                        "Team awarded <strong>Model Team of NPU</strong> (2022).",
                    ],
                },
                {
                    title: "College Innovation & Entrepreneurship Training Program",
                    subtitle: "Member",
                    date: "September 2023 – June 2024",
                    details: [
                        "<strong>National project</strong>, completed with <strong>Good standing</strong> (2024).",
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
                        "Implemented graphics system for uniOS (2-person team). <ul><li>Responsible for system design, hardware drivers and composition layer.</li><li>Implemented antialiasing, dirty region detection, alpha blending, etc.</li><li>Designed and implemented a simple window manager and GUI for uniOS.</li><li>GitHub Repository: <a href='https://github.com/angine04/unios' target='_blank'>https://github.com/angine04/unios</a>.</li></ul>",
                    ],
                },
                {
                    title: "zheyucao.com",
                    date: "April 2025",
                    details: [
                        "This website you're currently viewing.",
                        "Designed and built by me for myself. It is built using: <ul><li>Astro (framework)</li><li>TypeScript (programming language)</li><li>Plain CSS (styling)</li><li>GSAP (animations)</li><li>Node.js & pnpm (environment & package management)</li><li>Github Pages (hosting)</li></ul>",
                        "GitHub Repository: <a href='https://github.com/zheyucao/zheyucao.com' target='_blank'>https://github.com/zheyucao/zheyucao.com</a>.",
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
