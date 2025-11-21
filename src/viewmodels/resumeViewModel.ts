import { getCollection, getEntry } from "astro:content";

/**
 * Resume page view model
 * Aggregates and organizes resume content into main column and sidebar
 */
export async function getResumeViewModel() {
    // Fetch all resume content
    const allResumeContent = await getCollection("resume");

    // Filter profile
    const profileEntry = allResumeContent.find((entry) => entry.id.startsWith("profile/"));
    if (!profileEntry) throw new Error("Profile entry not found");
    const { Content: ProfileContent } = await profileEntry.render();

    // Filter education entries
    const educationEntries = allResumeContent.filter((entry) => entry.id.startsWith("education/"));
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

    // Filter experience entries
    const experienceEntries = allResumeContent.filter((entry) => entry.id.startsWith("experience/"));
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

    // Filter project entries
    const projectEntries = allResumeContent.filter((entry) => entry.id.startsWith("projects/"));
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
    console.log("Resume entries:", allResumeContent.map(e => ({ id: e.id, type: (e.data as any).type })));

    const awardsEntry = allResumeContent.find((entry) => entry.id === "awards.mdx");
    if (!awardsEntry) {
        console.error("Awards entry not found in collection");
        throw new Error("Awards entry not found");
    }
    if ((awardsEntry.data as any).type !== 'awards') {
        console.error("Awards entry has wrong type:", (awardsEntry.data as any).type);
        throw new Error("Awards entry invalid type");
    }

    // Fetch skills data
    const skillsEntry = allResumeContent.find((entry) => entry.id === "skills.mdx");
    if (!skillsEntry || (skillsEntry.data as any).type !== 'skills') throw new Error("Skills entry not found or invalid");

    // Fetch contact data
    const contactEntry = allResumeContent.find((entry) => entry.id === "contact.mdx");
    if (!contactEntry || (contactEntry.data as any).type !== 'contact') throw new Error("Contact entry not found or invalid");

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
            title: awardsEntry.data.title,
            type: "entries",
            content: awardsEntry.data.content,
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
            title: skillsEntry.data.title,
            type: "skills",
            content: skillsEntry.data.content,
        },
        {
            id: "contact",
            title: contactEntry.data.title,
            type: "contact",
            content: contactEntry.data.content,
        },
    ];

    // Fetch metadata
    const metadataEntry = allResumeContent.find((entry) => entry.id === "metadata.mdx");
    if (!metadataEntry) throw new Error("Metadata entry not found");

    return {
        mainColumn,
        sidebar,
        metadata: metadataEntry.data as any,
    };
}
