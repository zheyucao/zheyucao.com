import { getCollection, getEntry } from "astro:content";

/**
 * Resume page view model
 * Aggregates and organizes resume content into main column and sidebar
 */
export async function getResumeViewModel() {
    // Fetch profile
    const profileEntry = await getEntry("resume-profile", "profile");
    const { Content: ProfileContent } = await profileEntry.render();

    // Fetch education entries
    const educationEntries = await getCollection("resume-education");
    const education = await Promise.all(
        educationEntries.map(async (entry) => {
            const { Content } = await entry.render();
            return {
                title: entry.data.title,
                subtitle: entry.data.subtitle,
                date: entry.data.date,
                Content,
            };
        })
    );

    // Fetch experience entries
    const experienceEntries = await getCollection("resume-experience");
    const experience = await Promise.all(
        experienceEntries.map(async (entry) => {
            const { Content } = await entry.render();
            return {
                title: entry.data.title,
                subtitle: entry.data.subtitle,
                date: entry.data.date,
                Content,
            };
        })
    );

    // Fetch project entries
    const projectEntries = await getCollection("resume-projects");
    const projects = await Promise.all(
        projectEntries.map(async (entry) => {
            const { Content } = await entry.render();
            return {
                title: entry.data.title,
                date: entry.data.date,
                Content,
            };
        })
    );

    // Fetch awards data
    const awardsData = await getEntry("resume-data", "awards");

    // Fetch skills data
    const skillsData = await getEntry("resume-data", "skills");

    // Fetch contact data
    const contactData = await getEntry("resume-data", "contact");

    // Build mainColumn and sidebar structure
    const mainColumn = [
        {
            id: "profile",
            title: profileEntry.data.title,
            type: "text",
            Content: ProfileContent,
        },
        {
            id: "education",
            title: "Education",
            type: "entries",
            content: education,
        },
        {
            id: "awards",
            title: awardsData.data.title,
            type: "entries",
            content: awardsData.data.content,
        },
        {
            id: "experience",
            title: "Experience",
            type: "entries",
            content: experience,
        },
        {
            id: "projects",
            title: "Projects",
            type: "entries",
            content: projects,
        },
    ];

    const sidebar = [
        {
            id: "skills",
            title: skillsData.data.title,
            type: "skills",
            content: skillsData.data.content,
        },
        {
            id: "contact",
            title: contactData.data.title,
            type: "contact",
            content: contactData.data.content,
        },
    ];

    return {
        mainColumn,
        sidebar,
    };
}
