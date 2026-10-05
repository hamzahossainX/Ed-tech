import { describe, expect, it } from "vitest";
import { addStudyActivity, calculateStudyStreak, createActivityDays, type StudyActivityEvent } from "@/lib/study-activity";

const events: StudyActivityEvent[] = [
  { id: "a", type: "milestone", occurredAt: "2026-10-03T12:00:00.000Z" },
  { id: "b", type: "pomodoro", occurredAt: "2026-10-04T12:00:00.000Z" },
  { id: "c", type: "pomodoro", occurredAt: "2026-10-05T10:00:00.000Z" },
  { id: "d", type: "milestone", occurredAt: "2026-10-05T11:00:00.000Z" },
];

describe("study activity", () => {
  it("calculates consecutive activity and daily intensity", () => {
    const now = new Date("2026-10-05T12:00:00.000Z");
    expect(calculateStudyStreak(events, now)).toBe(3);
    expect(createActivityDays(events, 35, now).at(-1)).toEqual({ date: "2026-10-05", count: 2 });
  });

  it("deduplicates stable milestone events", () => {
    expect(addStudyActivity(events, events[0])).toHaveLength(events.length);
  });
});
