import { afterEach, describe, expect, it, vi } from "vitest";
import { createStudyPrompt, DEFAULT_STUDY_PREFERENCES, LEARNING_PATHS, readStudyPreferences, STUDIO_STORAGE_KEY, studyPreferencesSchema } from "@/lib/study-planner";
import { roadmapPromptSchema } from "@/lib/roadmap-validation";

afterEach(() => vi.restoreAllMocks());

describe("study planner", () => {
  it("creates valid roadmap prompts even for the largest supported schedules", () => {
    for (const path of LEARNING_PATHS) {
      const prompt = createStudyPrompt({ ...DEFAULT_STUDY_PREFERENCES, pathId: path.id, minutes: 120, weeks: 24, days: [0, 1, 2, 3, 4, 5, 6] });
      expect(roadmapPromptSchema.safeParse(prompt).success).toBe(true);
      expect(prompt).toContain("120 min/day, 7 days/week");
      expect(prompt).toContain(path.goal);
    }
  });

  it("rejects schedules with no days, duplicate days, or unsupported values", () => {
    for (const values of [{ days: [] }, { days: [1, 1] }, { days: [8] }, { minutes: 0 }, { minutes: 121 }, { weeks: 0 }, { pathId: "unknown" }]) {
      expect(studyPreferencesSchema.safeParse({ ...DEFAULT_STUDY_PREFERENCES, ...values }).success).toBe(false);
    }
  });

  it("restores validated preferences and ignores broken browser storage", () => {
    const preferences = { ...DEFAULT_STUDY_PREFERENCES, pathId: "design", favorites: ["design"], minutes: 30 };
    localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(preferences));
    expect(readStudyPreferences()).toEqual(preferences);
    localStorage.setItem(STUDIO_STORAGE_KEY, "{broken");
    expect(readStudyPreferences()).toEqual(DEFAULT_STUDY_PREFERENCES);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage denied"); });
    expect(readStudyPreferences()).toEqual(DEFAULT_STUDY_PREFERENCES);
  });
});
