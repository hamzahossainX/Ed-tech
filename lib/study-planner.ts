import { z } from "zod";

export const LEARNING_PATHS = [
  { id: "web", category: "Development", title: "Build for the web", goal: "Full-stack Next.js", description: "From your first component to an app you can ship.", skills: ["React", "Next.js", "APIs"], level: "Some experience", weeks: 12, accent: "mint" },
  { id: "python", category: "Data & AI", title: "Make data make sense", goal: "Python and machine learning", description: "Explore real datasets and build your first prediction model.", skills: ["Python", "pandas", "ML"], level: "Beginner friendly", weeks: 8, accent: "violet" },
  { id: "design", category: "Design", title: "Design with intention", goal: "UI/UX design", description: "Turn a user problem into a thoughtful, testable prototype.", skills: ["Research", "Figma", "Prototypes"], level: "Beginner friendly", weeks: 4, accent: "peach" },
  { id: "security", category: "Security", title: "Think like a defender", goal: "Defensive cybersecurity", description: "Practice threat awareness and secure habits in legal labs.", skills: ["Networks", "OWASP", "Defense"], level: "Beginner friendly", weeks: 8, accent: "sky" },
  { id: "mobile", category: "Development", title: "Put your idea in a pocket", goal: "React Native mobile development", description: "Create a mobile interface and connect it to real data.", skills: ["React Native", "Expo", "UX"], level: "Some experience", weeks: 12, accent: "peach" },
  { id: "analytics", category: "Data & AI", title: "Find the story in numbers", goal: "SQL and data analytics", description: "Ask better questions, write queries, and explain your findings.", skills: ["SQL", "Charts", "Analysis"], level: "Beginner friendly", weeks: 8, accent: "mint" },
] as const;

export const STUDY_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export const STUDIO_STORAGE_KEY = "learnx:learning-studio:v1";
const pathId = z.enum(["web", "python", "design", "security", "mobile", "analytics"]);

export const studyPreferencesSchema = z.object({
  version: z.literal(1),
  pathId,
  favorites: z.array(pathId).max(6).transform((ids) => [...new Set(ids)]),
  minutes: z.number().int().min(15).max(120).multipleOf(15),
  weeks: z.union([z.literal(4), z.literal(8), z.literal(12), z.literal(24)]),
  days: z.array(z.number().int().min(0).max(6)).min(1).max(7)
    .refine((days) => new Set(days).size === days.length),
});

export type StudyPreferences = z.infer<typeof studyPreferencesSchema>;
export const DEFAULT_STUDY_PREFERENCES: StudyPreferences = {
  version: 1, pathId: "web", favorites: [], minutes: 45, weeks: 12, days: [0, 2, 4],
};

export function readStudyPreferences(): StudyPreferences {
  try {
    const raw = window.localStorage.getItem(STUDIO_STORAGE_KEY);
    const parsed = studyPreferencesSchema.safeParse(raw ? JSON.parse(raw) : null);
    if (parsed.success) return parsed.data;
  } catch { /* Storage is optional; a planner must still work without it. */ }
  return { ...DEFAULT_STUDY_PREFERENCES, favorites: [], days: [...DEFAULT_STUDY_PREFERENCES.days] };
}

export function createStudyPrompt(preferences: StudyPreferences): string {
  const valid = studyPreferencesSchema.parse(preferences);
  const path = LEARNING_PATHS.find((item) => item.id === valid.pathId)!;
  return `${path.goal} in ${valid.weeks} weeks; ${valid.minutes} min/day, ${valid.days.length} days/week`;
}
