export type AchievementId = "first-step" | "deep-work" | "path-master";

export type UnlockedAchievement = {
  id: AchievementId;
  unlockedAt: string;
};

export const ACHIEVEMENTS = [
  {
    id: "first-step" as const,
    title: "First Step",
    description: "Complete your first learning milestone.",
    celebration: "First Step badge unlocked! Your learning journey is underway.",
  },
  {
    id: "deep-work" as const,
    title: "Deep Work",
    description: "Finish a full 25-minute Zen Mode session.",
    celebration: "Deep Work badge unlocked! You completed a focused Pomodoro.",
  },
  {
    id: "path-master" as const,
    title: "Path Master",
    description: "Complete every milestone in a roadmap.",
    celebration: "Path Master badge unlocked! You completed the entire roadmap.",
  },
] as const;

const STORAGE_KEY = "learnx:achievements:v1";
const ACHIEVEMENT_IDS = new Set<AchievementId>(ACHIEVEMENTS.map((item) => item.id));

export function readAchievements(): UnlockedAchievement[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is UnlockedAchievement => (
      typeof item === "object"
      && item !== null
      && "id" in item
      && typeof item.id === "string"
      && ACHIEVEMENT_IDS.has(item.id as AchievementId)
      && "unlockedAt" in item
      && typeof item.unlockedAt === "string"
      && Number.isFinite(Date.parse(item.unlockedAt))
    ));
  } catch {
    return [];
  }
}

export function persistAchievements(achievements: UnlockedAchievement[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
    return true;
  } catch {
    return false;
  }
}
