import { getCollection } from "astro:content";
import { getPageMetadata } from "../lib/viewmodels/baseViewModel";
import { sortByOrder } from "../lib/utils/sortUtils";
import { formatDateRange } from "../lib/utils/dateUtils";

/**
 * Masonry page view model
 * Fetches and prepares card data for the masonry page
 */
export async function getMasonryViewModel() {
  // Fetch metadata and projects in parallel
  const [metadata, allProjects] = await Promise.all([
    getPageMetadata("projects"),
    getCollection("projects"),
  ]);

  // Render MDX content for each project
  let projects = await Promise.all(
    allProjects.map(async (project) => {
      const { Content } = await project.render();
      return {
        ...project,
        Content,
        formattedDate: formatDateRange(project.data.startDate, project.data.endDate),
      };
    })
  );

  // Sort projects by order field (if specified)
  // Projects with order come first, sorted by order value
  // Projects without order come after, sorted by date (newest first)
  projects = sortByOrder(projects, {
    getOrder: (p) => p.data.order,
    getDate: (p) => p.data.endDate ?? p.data.startDate,
  });

  return {
    metadata,
    projects,
  };
}
