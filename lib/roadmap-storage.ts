import type { ResourceLink } from "@/db/schema";
import type { CareerInsights } from "@/lib/career-insights";

const ACTIVE_ROADMAP_STORAGE_KEY = "learnx:active-roadmap:v1";
const STORAGE_VERSION = 1;

export type RecoverableMilestone = {
  id: string;
  title: string;
  description: string;
  duration: string;
  resourceLinks: ResourceLink[];
  topicDetails: string | null;
  example: string | null;
  interviewQuestions: string[];
  exhaustiveDeepDive: string | null;
  eli5Explanation: string[] | null;
  position: number;
  isCompleted: boolean;
};

export type RecoverableRoadmap = {
  id: string;
  userName?: string | null;
  title: string;
  description: string;
  estimatedDuration: string;
  careerInsights?: CareerInsights | null;
  updatedAt: string;
  milestones: RecoverableMilestone[];
};

type StoredRoadmapEnvelope = {
  version: typeof STORAGE_VERSION;
  savedAt: number;
  roadmap: RecoverableRoadmap;
};

type ServerRoadmap = Omit<RecoverableRoadmap, "updatedAt"> & {
  updatedAt: Date | string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isResourceLink(value: unknown): value is ResourceLink {
  return isRecord(value)
    && typeof value.title === "string"
    && typeof value.url === "string"
    && value.url.startsWith("https://");
}

function isCareerInsights(value: unknown): value is CareerInsights {
  return isRecord(value)
    && typeof value.marketDemand === "string"
    && value.marketDemand.length >= 2
    && value.marketDemand.length <= 100
    && typeof value.entrySalary === "string"
    && value.entrySalary.length >= 2
    && value.entrySalary.length <= 100
    && Array.isArray(value.topRoles)
    && value.topRoles.length >= 1
    && value.topRoles.length <= 4
    && value.topRoles.every((role) => typeof role === "string" && role.length >= 2 && role.length <= 80);
}

function isRecoverableMilestone(value: unknown): value is RecoverableMilestone {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.title === "string"
    && typeof value.description === "string"
    && typeof value.duration === "string"
    && Array.isArray(value.resourceLinks)
    && value.resourceLinks.every(isResourceLink)
    && isNullableString(value.topicDetails)
    && isNullableString(value.example)
    && isStringArray(value.interviewQuestions)
    && isNullableString(value.exhaustiveDeepDive)
    && (value.eli5Explanation === null || isStringArray(value.eli5Explanation))
    && typeof value.position === "number"
    && Number.isInteger(value.position)
    && typeof value.isCompleted === "boolean";
}

export function isRecoverableRoadmap(value: unknown): value is RecoverableRoadmap {
  return isRecord(value)
    && typeof value.id === "string"
    && (value.userName === undefined || isNullableString(value.userName))
    && typeof value.title === "string"
    && typeof value.description === "string"
    && typeof value.estimatedDuration === "string"
    && (value.careerInsights === undefined || value.careerInsights === null || isCareerInsights(value.careerInsights))
    && typeof value.updatedAt === "string"
    && Number.isFinite(Date.parse(value.updatedAt))
    && Array.isArray(value.milestones)
    && value.milestones.length > 0
    && value.milestones.every(isRecoverableMilestone);
}

function isStoredRoadmapEnvelope(value: unknown): value is StoredRoadmapEnvelope {
  if (!isRecord(value) || value.version !== STORAGE_VERSION || typeof value.savedAt !== "number") {
    return false;
  }

  return isRecoverableRoadmap(value.roadmap);
}

export function createRoadmapSnapshot(roadmap: ServerRoadmap): RecoverableRoadmap {
  return {
    id: roadmap.id,
    userName: roadmap.userName ?? null,
    title: roadmap.title,
    description: roadmap.description,
    estimatedDuration: roadmap.estimatedDuration,
    careerInsights: roadmap.careerInsights ?? null,
    updatedAt: new Date(roadmap.updatedAt).toISOString(),
    milestones: roadmap.milestones.map((milestone) => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      duration: milestone.duration,
      resourceLinks: milestone.resourceLinks.map((resource) => ({ ...resource })),
      topicDetails: milestone.topicDetails,
      example: milestone.example,
      interviewQuestions: [...milestone.interviewQuestions],
      exhaustiveDeepDive: milestone.exhaustiveDeepDive,
      eli5Explanation: milestone.eli5Explanation ? [...milestone.eli5Explanation] : null,
      position: milestone.position,
      isCompleted: milestone.isCompleted,
    })),
  };
}

export function restoreRoadmapSnapshot(serverRoadmap: RecoverableRoadmap) {
  try {
    const rawSnapshot = window.localStorage.getItem(ACTIVE_ROADMAP_STORAGE_KEY);
    if (!rawSnapshot) return serverRoadmap;

    const storedValue: unknown = JSON.parse(rawSnapshot);
    if (!isStoredRoadmapEnvelope(storedValue)) {
      window.localStorage.removeItem(ACTIVE_ROADMAP_STORAGE_KEY);
      return serverRoadmap;
    }

    const savedRoadmap = storedValue.roadmap;
    if (savedRoadmap.id !== serverRoadmap.id) return serverRoadmap;

    const serverMilestoneIds = new Set(serverRoadmap.milestones.map((item) => item.id));
    const hasMatchingMilestones = savedRoadmap.milestones.length === serverMilestoneIds.size
      && savedRoadmap.milestones.every((item) => serverMilestoneIds.has(item.id));
    if (!hasMatchingMilestones) return serverRoadmap;

    return Date.parse(savedRoadmap.updatedAt) >= Date.parse(serverRoadmap.updatedAt)
      ? savedRoadmap
      : serverRoadmap;
  } catch {
    return serverRoadmap;
  }
}

export function persistRoadmapSnapshot(roadmap: RecoverableRoadmap) {
  try {
    const envelope: StoredRoadmapEnvelope = {
      version: STORAGE_VERSION,
      savedAt: Date.now(),
      roadmap,
    };
    window.localStorage.setItem(ACTIVE_ROADMAP_STORAGE_KEY, JSON.stringify(envelope));
    return true;
  } catch {
    // Storage can be unavailable in private browsing or when the quota is full.
    // The server-rendered Neon roadmap remains the source of truth.
    return false;
  }
}
