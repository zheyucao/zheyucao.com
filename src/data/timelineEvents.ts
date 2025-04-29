// src/data/timelineEvents.ts

export interface TimelineEventItem {
  date: string; // YYYY-MM format (represents END date for sorting intervals)
  dateRange?: string; // Formatted display range (e.g., "Jul 2024 – Sep 2024")
  title: string;
  category: "Experiences" | "Honors";
  description?: string; // HTML string
  isHighlight?: boolean;
  highlightSummary?: string;
}

export const allTimelineEvents: TimelineEventItem[] = [
  // Experiences (Sorted by end date implicitly for data entry)

  {
    date: "2024-09",
    dateRange: "July 2024 – September 2024",
    title: "NLP Research Internship",
    category: "Experiences",
    description: `<p>Completed a research internship at Westlake University NLP Lab, focusing on LLM prompting and reasoning under Prof. Yue Zhang.</p>`,
    isHighlight: true,
  },
  {
    date: "2024-06",
    dateRange: "September 2023 – June 2024",
    title: "Innovation Program Project",
    category: "Experiences",
    description: `<p>Participated in and completed the National College Innovation & Entrepreneurship Training Program project on UAV Hyperspectral Image Recognition, achieving a 'Good' standing.</p>`,
  },
  {
    date: "2024-08",
    title: "Team V5++ Leader",
    category: "Experiences",
    isHighlight: true,
    description: `<p>Took on a leadership role for the Team V5++ of the NPU Soccer Robot Innovation Base, overseeing operations and technical direction.</p>`,
  },
  {
    date: "2023-05",
    title: "Joined Team V5++",
    category: "Experiences",
    description: `<p>Joined the Team V5++ of the NPU Soccer Robot Innovation Base, focusing on Robotic Vision.</p>`,
  },
  {
    date: "2022-09",
    title: "Started University",
    category: "Experiences",
    description: `<p>Began undergraduate studies in Computer Science and Technology at Northwestern Polytechnical University.</p>`,
  },

  // Honors
  {
    date: "2024-11",
    title: "China National Scholarship",
    category: "Honors",
    isHighlight: true,
    description: `<p>Awarded the prestigious China National Scholarship for academic excellence.</p>`,
  },
  {
    date: "2024-11",
    title: "NPU Outstanding Student & First-Class Scholarship",
    category: "Honors",
    description: `<p>Recognized as an Outstanding Student and awarded the First-Class Scholarship at NPU.</p>`,
  },
  {
    date: "2024-11",
    title: "China Robot Contest: National First Prize",
    category: "Honors",
    description: `<p>Achieved the National First Prize in the China Robot Contest.</p>`,
  },
  {
    date: "2024-10",
    title: "China Robot Championship: National First Prize",
    category: "Honors",
    description: `<p>Achieved the National First Prize in the China Robot Championship.</p>`,
  },
  {
    date: "2024-05",
    title: "China Robot Contest: National First Prize",
    category: "Honors",
    description: `<p>Achieved the National First Prize in the China Robot Contest.</p>`,
  },
  {
    date: "2023-11",
    title: "NPU Outstanding Student & Second-Class Scholarship",
    category: "Honors",
    description: `<p>Recognized as an Outstanding Student and awarded the Second-Class Scholarship at NPU.</p>`,
  },
  {
    date: "2023-10",
    title: "China Robot Contest: National Second Prize",
    category: "Honors",
    description: `<p>Achieved the National Second Prize in the China Robot Contest.</p>`,
  },
];
