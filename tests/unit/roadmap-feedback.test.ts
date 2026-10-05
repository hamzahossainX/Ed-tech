import { describe, expect, it } from "vitest";
import {
  readRoadmapFeedback,
  saveRoadmapFeedback,
  upsertRoadmapFeedback,
  type RoadmapFeedback,
} from "@/lib/roadmap-feedback";

describe("roadmap feedback storage", () => {
  it("upserts one rating per roadmap", () => {
    const original: RoadmapFeedback = {
      roadmapId: "roadmap-1",
      rating: "helpful",
      note: "",
      updatedAt: "2026-10-05T00:00:00.000Z",
    };
    const updated: RoadmapFeedback = {
      ...original,
      rating: "needs-improvement",
      note: "More examples",
      updatedAt: "2026-10-05T01:00:00.000Z",
    };

    expect(upsertRoadmapFeedback([original], updated)).toEqual([updated]);
  });

  it("persists and rejects malformed records", () => {
    const valid: RoadmapFeedback = {
      roadmapId: "roadmap-2",
      rating: "helpful",
      note: "Useful",
      updatedAt: "2026-10-05T00:00:00.000Z",
    };
    expect(saveRoadmapFeedback([valid])).toBe(true);
    expect(readRoadmapFeedback()).toEqual([valid]);

    window.localStorage.setItem("learnx:roadmap-feedback:v1", JSON.stringify([{ rating: "invalid" }]));
    expect(readRoadmapFeedback()).toEqual([]);
  });
});
