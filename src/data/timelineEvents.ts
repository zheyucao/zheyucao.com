// src/data/timelineEvents.ts

export interface TimelineEventItem {
  date: string; // YYYY-MM format (represents END date for sorting intervals)
  dateRange?: string; // Formatted display range (e.g., "Jul 2024 – Sep 2024")
  title: string;
  category: "Experiences" | "Honors";
  description: string; // HTML string
}

export const allTimelineEvents: TimelineEventItem[] = [
  // Experiences (Sorted by end date implicitly for data entry)
  {
    date: "2024-09",
    dateRange: "Jul 2024 – Sep 2024",
    title: "NLP Research Internship", // Combined Title
    category: "Experiences",
    description: `<p>Completed a research internship at Westlake University NLP Lab, focusing on LLM prompting and reasoning under Prof. Yue Zhang.</p>`, // Combined/Refined Desc
  },
  {
    date: "2024-06",
    dateRange: "Sep 2023 – Jun 2024",
    title: "Innovation Program Project", // Combined Title
    category: "Experiences",
    description: `<p>Participated in and completed the National College Innovation & Entrepreneurship Training Program project on UAV Hyperspectral Image Recognition, achieving 'Good' standing.</p>`, // Combined/Refined Desc
  },
  {
    date: "2024-08", // Assuming start date represents this ongoing role?
    // Or should this have a range like "May 2023 – Present"?
    // Let's keep it single for now, adjust if needed.
    title: "Team V5++ Leader",
    category: "Experiences",
    description: `<p>Took on leadership role for the NPU Soccer Robot Innovation Base team, overseeing operations and technical direction.</p>`,
  },
  {
    date: "2023-05", // Assuming start date represents this ongoing role?
    title: "Joined Team V5++",
    category: "Experiences",
    description: `<p>Joined the NPU Soccer Robot Innovation Base team, focusing on Robotic Vision.</p>`,
  },
  {
    date: "2022-09", // Single point in time (start)
    title: "Started University",
    category: "Experiences",
    description: `<p>Began undergraduate studies in Computer Science and Technology at Northwestern Polytechnical University.</p>`,
  },

  // Honors (Typically single points in time)
  {
    date: "2024-11",
    title: "China National Scholarship",
    category: "Honors",
    description: `<p>Awarded the prestigious China National Scholarship for academic excellence.</p>`,
  },
  {
    date: "2024-11",
    title: "NPU Outstanding Student & First-Class Scholarship",
    category: "Honors",
    description: `<p>Recognized as an Outstanding Student and awarded First-Class Scholarship at NPU.</p>`,
  },
  {
    date: "2024-11",
    title: "China Robot Contest: National First Prize",
    category: "Honors",
    description: `<p>Achieved National First Prize in the China Robot Contest.</p>`,
  },
  {
    date: "2024-10",
    title: "China Robot Championship: National First Prize",
    category: "Honors",
    description: `<p>Achieved National First Prize in the China Robot Championship.</p>`,
  },
  {
    date: "2024-05",
    title: "China Robot Contest: National First Prize",
    category: "Honors",
    description: `<p>Achieved National First Prize in the China Robot Contest.</p>`,
  },
  {
    date: "2023-11",
    title: "NPU Outstanding Student & Second-Class Scholarship",
    category: "Honors",
    description: `<p>Recognized as an Outstanding Student and awarded Second-Class Scholarship at NPU.</p>`,
  },
  {
    date: "2023-10",
    title: "China Robot Contest: National Second Prize",
    category: "Honors",
    description: `<p>Achieved National Second Prize in the China Robot Contest.</p>`,
  },
];
