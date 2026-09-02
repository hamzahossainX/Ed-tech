import { z } from "zod";

export const generatedResourceSchema = z.object({
  title: z.string().trim().min(2).max(100),
  url: z.url().refine((url) => url.startsWith("https://"), "Resource links must use HTTPS"),
});

function isUnknownRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseRecord(value: unknown) {
  if (isUnknownRecord(value)) return value;
  if (typeof value !== "string" || !value.trim().startsWith("{")) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    return isUnknownRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function createResourceFromText(value: string, fallbackTitle?: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  const markdownLink = trimmedValue.match(/^\[([^\]]+)]\((https:\/\/[^\s)]+)\)$/i);
  if (markdownLink) {
    return { title: markdownLink[1].trim(), url: markdownLink[2] };
  }

  const urlMatch = trimmedValue.match(/https:\/\/[^\s)\]}>,]+/i);
  if (!urlMatch) return null;

  const url = urlMatch[0].replace(/[.;,:]+$/, "");
  const suppliedTitle = trimmedValue
    .slice(0, urlMatch.index)
    .replace(/^[\s\-–—:|]+|[\s\-–—:|]+$/g, "")
    .trim();

  let hostTitle = "Learning resource";
  try {
    hostTitle = `${new URL(url).hostname.replace(/^www\./, "")} guide`;
  } catch {
    return null;
  }

  return {
    title: suppliedTitle || fallbackTitle?.trim() || hostTitle,
    url,
  };
}

export function normalizeGeneratedResources(value: unknown) {
  if (!Array.isArray(value)) return value;

  const uniqueUrls = new Set<string>();
  const resources: z.infer<typeof generatedResourceSchema>[] = [];
  let pendingTitle: string | undefined;

  for (const candidate of value) {
    const recordCandidate = parseRecord(candidate);
    const normalizedCandidate = recordCandidate ?? (
      typeof candidate === "string"
        ? createResourceFromText(candidate, pendingTitle)
        : null
    );

    if (typeof candidate === "string" && !normalizedCandidate && candidate.trim()) {
      pendingTitle = candidate.trim().slice(0, 100);
      continue;
    }

    const parsed = generatedResourceSchema.safeParse(normalizedCandidate);
    if (!parsed.success || uniqueUrls.has(parsed.data.url)) continue;

    pendingTitle = undefined;
    uniqueUrls.add(parsed.data.url);
    resources.push(parsed.data);
    if (resources.length === 2) break;
  }

  return resources;
}

export function normalizeGeneratedMilestones(value: unknown, maximum: number) {
  if (!Array.isArray(value)) return value;

  const milestones: Record<string, unknown>[] = [];
  for (const candidate of value) {
    const parsed = parseRecord(candidate);
    if (!parsed) continue;

    milestones.push(parsed);
    if (milestones.length === maximum) break;
  }

  return milestones;
}

export function getRejectedGeneration(error: unknown) {
  if (!isUnknownRecord(error) || !isUnknownRecord(error.error)) return null;

  const errorBody = error.error;
  if (typeof errorBody.failed_generation === "string") {
    return errorBody.failed_generation;
  }

  if (
    isUnknownRecord(errorBody.error)
    && typeof errorBody.error.failed_generation === "string"
  ) {
    return errorBody.error.failed_generation;
  }

  return null;
}
