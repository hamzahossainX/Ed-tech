import { describe, expect, it } from "vitest";
import { estimateDurationInDays } from "@/lib/roadmap-calendar";
import { createRoadmapWorkload } from "@/lib/roadmap-workload";

describe("roadmap workload", () => {
  it("parses common AI duration formats", () => {
    expect(estimateDurationInDays("Weeks 1-3")).toBe(21);
    expect(estimateDurationInDays("2 months")).toBe(60);
    expect(estimateDurationInDays("5 days")).toBe(5);
  });

  it("keeps milestone order and estimates advanced intensity", () => {
    const plan = createRoadmapWorkload([
      { title: "Foundations", description: "Learn basics", duration: "Weeks 1-2", position: 1, exhaustiveDeepDive: null },
      { title: "Advanced", description: "Build projects", duration: "3 weeks", position: 2, exhaustiveDeepDive: "Deep content" },
    ]);
    expect(plan.totalWeeks).toBe(5);
    expect(plan.weeks[0].milestonePosition).toBe(1);
    expect(plan.weeks.at(-1)?.milestonePosition).toBe(2);
    expect(plan.averageHours).toBe(7);
  });
});
