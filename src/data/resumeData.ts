export interface EducationItem {
    institution: string;
    date: string;
    degree: string;
    details?: string[];
}

export interface ExperienceItem {
    institution: string;
    role: string;
    date: string;
    details: string[];
}

export interface SkillCategory {
    name: string;
    items: string[];
}

export interface AwardItem {
    title: string;
    date: string;
}

export interface ResumeProjectItem {
    title: string;
    date: string;
    details: string[];
}

export interface ContactItem {
    icon: string;
    label: string;
    href?: string;
    target?: string;
    rel?: string;
}

export const resumeData = {
    download: {
        text: "Download Résumé PDF (in Chinese)",
        href: "https://assets.zheyucao.com/resume.pdf",
        filename: "Zheyu_Cao_Resume_ZH.pdf",
    },
    profile: {
        name: "Zheyu Cao",
        university: "Northwestern Polytechnical University",
        major: "Computer Science and Technology",
        description: [
            "I'm deeply interested in <strong>frontend development</strong>, <strong>artificial intelligence</strong>, and <strong>linguistics</strong>. I love exploring and learning cool new things, especially where technology meets aesthetics.",
        ],
    },
    contact: [
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
    ] as ContactItem[],
    education: [
        {
            institution: "Northwestern Polytechnical University",
            date: "September 2026 (Expected)",
            degree: "Master of Engineering in Intelligence Science and Technology, <br /><em>Admitted</em>",
        },
        {
            institution: "Northwestern Polytechnical University",
            date: "September 2022 – Present",
            degree:
                "Bachelor of Engineering in Computer Science and Technology, <br /><em>Fourth-year Undergraduate</em>",
            details: [
                "GPA: <strong>3.718</strong> &emsp; Average Score: <strong>90.49</strong> &emsp; Major Rank: <strong>8</strong>/192",
                "College English Test - Band 4: <strong>650</strong> &emsp; College English Test - Band 6: <strong>634</strong>",
            ],
        },
    ] as EducationItem[],
    experience: [
        {
            institution: "Westlake University NLP Lab",
            role: "Research Intern",
            date: "July 2024 – September 2024",
            details: [
                "Supervisor: <strong><a href='https://frcchang.github.io/' target='_blank'>Prof. Yue Zhang</a></strong>.",
                "Focus: LLM Prompting, Reasoning, Chain of Thought.",
            ],
        },
        {
            institution: "Team V5++, NPU Soccer Robot Base",
            role: "Leader",
            date: "May 2023 – July 2025",
            details: [
                "Managed team operations, served as Technical Director and led recruitment.",
                "Led design and implementation of 2023-2025 recruitment technical exams.",
                "Maintained team DevOps (cloud storage, LLM chatbot, code hosting, etc.).",
                "Team awarded <strong>Model Team of NPU</strong> (2022).",
            ],
        },
        {
            institution: "College Innovation & Entrepreneurship Training Program",
            role: "Member",
            date: "September 2023 – June 2024",
            details: [
                "<strong>National project</strong>, completed with <strong>Good standing</strong> (2024).",
                "Project: UAV Camouflage Object Recognition Based on Hyperspectral Image Reconstruction.",
                "Contributed to UAV joint control development.",
            ],
        },
    ] as ExperienceItem[],
    skills: [
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
    ] as SkillCategory[],
    awards: [
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
            date: "",
        },
    ] as AwardItem[],
    projects: [
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
    ] as ResumeProjectItem[],
};
