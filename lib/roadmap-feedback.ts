export type RoadmapFeedbackRating = "helpful" | "needs-improvement";

export type RoadmapFeedback = {
  roadmapId: string;
  rating: RoadmapFeedbackRating;
  note: string;
  updatedAt: string;
};

const STORAGE_KEY = "learnx:roadmap-feedback:v1";
const MAX_RECORDS = 100;

function isFeedback(value: unknown): value is RoadmapFeedback {
  return typeof value === "object"
    && value !== null
    && "roadmapId" in value
    && typeof value.roadmapId === "string"
    && "rating" in value
    && (value.rating === "helpful" || value.rating === "needs-improvement")
    && "note" in value
    && typeof value.note === "string"
    && value.note.length <= 240
    && "updatedAt" in value
    && typeof value.updatedAt === "string"
    && Number.isFinite(Date.parse(value.updatedAt));
}

export function readRoadmapFeedback(): RoadmapFeedback[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isFeedback).slice(-MAX_RECORDS) : [];
  } catch {
    return [];
  }
}

export function upsertRoadmapFeedback(
  current: RoadmapFeedback[],
  feedback: RoadmapFeedback,
) {
  return [
    ...current.filter((item) => item.roadmapId !== feedback.roadmapId),
    feedback,
  ].slice(-MAX_RECORDS);
}

export function saveRoadmapFeedback(feedback: RoadmapFeedback[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(feedback.slice(-MAX_RECORDS)));
    return true;
  } catch {
    return false;
  }
}
