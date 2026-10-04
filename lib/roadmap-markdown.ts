import type { RecoverableRoadmap } from "@/lib/roadmap-storage";

function escapeMarkdownLabel(value: string) {
  return value.replace(/([\\`*_[\]<>])/g, "\\$1");
}

export function roadmapToNotionMarkdown(roadmap: RecoverableRoadmap) {
  const completed = roadmap.milestones.filter((milestone) => milestone.isCompleted).length;
  const lines = [
    `# ${roadmap.title}`,
    "",
    `> ${roadmap.description}`,
    "",
    `- **Estimated duration:** ${roadmap.estimatedDuration}`,
    `- **Progress:** ${completed}/${roadmap.milestones.length} milestones completed`,
    "",
    "## Learning Milestones",
    "",
  ];

  for (const milestone of roadmap.milestones) {
    lines.push(
      `- [${milestone.isCompleted ? "x" : " "}] **${milestone.position}. ${milestone.title}** — ${milestone.duration}`,
      "",
      `  ${milestone.description}`,
      "",
    );

    if (milestone.resourceLinks.length) {
      lines.push("  **Resources**", "");
      for (const resource of milestone.resourceLinks) {
        lines.push(`  - [${escapeMarkdownLabel(resource.title)}](${resource.url})`);
      }
      lines.push("");
    }

    if (milestone.eli5Explanation?.length) {
      lines.push("  **Simple explanation**", "");
      for (const explanation of milestone.eli5Explanation) {
        lines.push(`  - ${explanation}`);
      }
      lines.push("");
    }

    if (milestone.exhaustiveDeepDive) {
      lines.push(
        `### Deep Dive: ${milestone.title}`,
        "",
        milestone.exhaustiveDeepDive,
        "",
      );
    }
  }

  lines.push("---", "", "Created with LearnX.", "");
  return lines.join("\n");
}
