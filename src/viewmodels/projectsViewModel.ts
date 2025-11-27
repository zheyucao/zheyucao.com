import { getCollection } from "astro:content";
import { getPageMetadata } from "../lib/viewmodels/baseViewModel";
import { sortByOrder } from "../lib/utils/sortUtils";


/**
 * Projects page view model
 * Fetches and prepares project data for the projects page
 */
export async function getProjectsViewModel() {
  // Fetch metadata and projects in parallel
  const [metadata, allProjects] = await Promise.all([
    getPageMetadata("projects"),
    getCollection("projects"),
  ]);

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
  sortByOrder(projects, {
    getOrder: (p) => p.data.order,
  });


  return {
    metadata,
    projects,
  };
}
