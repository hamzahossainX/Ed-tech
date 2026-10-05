import { estimateDurationInDays } from "@/lib/roadmap-calendar";

type WorkloadMilestone = {
  title: string;
  description: string;
  duration: string;
  position: number;
  exhaustiveDeepDive: string | null;
};

export type WorkloadWeek = {
  week: number;
  milestonePosition: number;
  milestoneTitle: string;
  suggestedHours: number;
};

export type WorkloadPlan = {
  weeks: WorkloadWeek[];
  totalWeeks: number;
  visibleWeeks: number;
  averageHours: number;
  isTruncated: boolean;
};

const MAX_VISIBLE_WEEKS = 52;

function suggestedWeeklyHours(milestone: WorkloadMilestone) {
  let hours = milestone.exhaustiveDeepDive ? 8 : 5;
  if (/security note:/iu.test(milestone.description)) hours += 1;
  if (estimateDurationInDays(milestone.duration) <= 7) hours += 1;
  return Math.min(hours, 10);
}

export function createRoadmapWorkload(
  milestones: WorkloadMilestone[],
): WorkloadPlan {
  const weeks: WorkloadWeek[] = [];
  let totalWeeks = 0;
  let totalSuggestedHours = 0;

  for (const milestone of [...milestones].sort((a, b) => a.position - b.position)) {
    const milestoneWeeks = Math.max(1, Math.ceil(estimateDurationInDays(milestone.duration) / 7));
    const suggestedHours = suggestedWeeklyHours(milestone);

    for (let offset = 0; offset < milestoneWeeks; offset += 1) {
      totalWeeks += 1;
      totalSuggestedHours += suggestedHours;
      if (weeks.length < MAX_VISIBLE_WEEKS) {
        weeks.push({
          week: totalWeeks,
          milestonePosition: milestone.position,
          milestoneTitle: milestone.title,
          suggestedHours,
        });
      }
    }
  }

  return {
    weeks,
    totalWeeks,
    visibleWeeks: weeks.length,
    averageHours: totalWeeks ? Math.round(totalSuggestedHours / totalWeeks) : 0,
    isTruncated: totalWeeks > MAX_VISIBLE_WEEKS,
  };
}
