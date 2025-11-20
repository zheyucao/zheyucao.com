import { getCollection } from "astro:content";

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

    // Sort projects by date (newest first) if timeframe exists
    // For now, keep original order as timeframe is optional
    // You can add custom sorting logic here if needed

    return {
        projects,
    };
}
