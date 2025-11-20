export interface ContactItem {
    icon: string;
    label?: string;
    href?: string;
    target?: string;
    rel?: string;
    description?: string;
}

export interface ContactSection {
    title: string;
    description?: string;
    items: ContactItem[];
}

export const contactData: {
    intro: string[];
    sections: Record<string, ContactSection>;
} = {
    intro: [
        "Feel free to reach out!",
        "Emails are preferred and will be responded to within one working day.",
    ],
    sections: {
        primary: {
            title: "Primary Contact",
            description: "For academic or direct inquiries:",
            items: [
                {
                    icon: "ri:mail-line",
                    label: "zheyucao2004@gmail.com",
                    href: "mailto:zheyucao2004@gmail.com",
                    description: "(Academic)",
                },
                {
                    icon: "ri:mail-line",
                    label: "hi@zheyucao.com",
                    href: "mailto:hi@zheyucao.com",
                    description: "(Personal)",
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
                {
                    icon: "ri:planet-line",
                    label: "https://zheyucao.com",
                    href: "https://zheyucao.com",
                    target: "_blank",
                    rel: "noopener noreferrer",
                },
            ],
        },
        online: {
            title: "Online Presence",
            description:
                "I also go by <strong>Angine</strong> online. You can find me through:",
            items: [
                {
                    icon: "ri:mail-line",
                    label: "me@angine.tech",
                    href: "mailto:me@angine.tech",
                },
                {
                    icon: "ri:github-line",
                    label: "github.com/angine04",
                    href: "https://github.com/angine04",
                    target: "_blank",
                    rel: "noopener noreferrer",
                },
            ],
        },
    },
};
