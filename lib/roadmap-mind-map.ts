import { z } from "zod";

const FORBIDDEN_MERMAID_CONTENT = /(?:%%\{\s*init|\bclick\b|\bhref\b|javascript:|<\/?(?:script|iframe|object|embed))/iu;

export const mermaidSyntaxSchema = z.string()
  .trim()
  .min(20)
  .max(5_000)
  .refine(
    (value) => /^(?:flowchart|graph)\s+TD\b/iu.test(value),
    "The mind map must be a top-down flowchart.",
  )
  .refine(
    (value) => !FORBIDDEN_MERMAID_CONTENT.test(value),
    "The mind map contains unsupported interactive content.",
  );

type SearchParamsRecord = Record<string, string | string[] | undefined>;
type MindMapMilestone = { title: string; position: number };

function safeLabel(value: string) {
  return value
    .replace(/[\[\]{}()<>"`]/gu, "")
    .replace(/\s+/gu, " ")
    .trim()
    .slice(0, 80);
}

export function createMilestoneMindMap(
  roadmapTitle: string,
  milestones: MindMapMilestone[],
) {
  const lines = [`flowchart TD`, `  start(["${safeLabel(roadmapTitle)}"])`];

  milestones.forEach((milestone, index) => {
    const nodeId = `m${index + 1}`;
    lines.push(`  ${nodeId}["${milestone.position}. ${safeLabel(milestone.title)}"]`);
    lines.push(`  ${index === 0 ? "start" : `m${index}`} --> ${nodeId}`);
  });

  return lines.join("\n");
}

export function appendMindMapQuery(
  searchParams: URLSearchParams,
  mermaidSyntax: string,
) {
  searchParams.set("mindMap", mermaidSyntax);
  return searchParams;
}

export function parseMindMapQuery(searchParams: SearchParamsRecord) {
  const rawValue = Array.isArray(searchParams.mindMap)
    ? searchParams.mindMap[0]
    : searchParams.mindMap;
  const parsed = mermaidSyntaxSchema.safeParse(rawValue);
  return parsed.success ? parsed.data : null;
}
