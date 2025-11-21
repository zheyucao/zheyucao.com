import { getCollection, getEntry } from "astro:content";

/**
 * Projects page view model
 * Fetches and prepares project data for the projects page
 */
export async function getProjectsViewModel() {
    // Fetch all projects
    const allProjects = await getCollection("projects");

    // Render MDX content for each project
    const projects = await Promise.all(
        allProjects.map(async (project) => {
            const { Content } = await project.render();
            return { ...project, Content };
        })
    );

    // Sort projects by order field (if specified)
    // Projects with order come first, sorted by order value
    // Projects without order come after, in their original order
    projects.sort((a, b) => {
        const orderA = a.data.order ?? Infinity;
        const orderB = b.data.order ?? Infinity;
        return orderA - orderB;
    });

    // Fetch UI strings
    const uiStrings = await getEntry("ui-strings", "en");
    const pageTitle = uiStrings.data.pages.projects.title;

    return {
        projects,
        pageTitle,
    };
}
