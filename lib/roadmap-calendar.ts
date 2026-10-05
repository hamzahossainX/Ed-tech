import type { ResourceLink } from "@/db/schema";

type CalendarRoadmap = {
  id: string;
  title: string;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    duration: string;
    position: number;
    isCompleted: boolean;
    resourceLinks: ResourceLink[];
  }>;
};

const DAY_IN_MILLISECONDS = 86_400_000;

function escapeCalendarText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replace(/\r?\n/gu, "\\n");
}

function formatCalendarDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function nextMonday(now: Date) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const daysUntilMonday = ((8 - start.getDay()) % 7) || 7;
  return addDays(start, daysUntilMonday);
}

export function estimateDurationInDays(duration: string) {
  const normalized = duration.toLowerCase().replace(/[–—]/gu, "-");
  const range = normalized.match(/(\d+)\s*-\s*(\d+)\s*(day|week|month)s?/u)
    ?? normalized.match(/(day|week|month)s?\s*(\d+)\s*-\s*(\d+)/u);

  if (range) {
    const unitFirst = Number.isNaN(Number(range[1]));
    const start = Number(unitFirst ? range[2] : range[1]);
    const end = Number(unitFirst ? range[3] : range[2]);
    const unit = unitFirst ? range[1] : range[3];
    const units = Math.max(1, end - start + 1);
    return units * (unit === "month" ? 30 : unit === "week" ? 7 : 1);
  }

  const amount = normalized.match(/(\d+)\s*(day|week|month)s?/u);
  if (!amount) return 7;
  const value = Math.max(1, Number(amount[1]));
  return value * (amount[2] === "month" ? 30 : amount[2] === "week" ? 7 : 1);
}

function createUid(roadmapId: string, milestoneId: string) {
  return `${roadmapId}-${milestoneId}`
    .replace(/[^a-zA-Z0-9-]/gu, "-")
    .slice(0, 180) + "@learnx.local";
}

function foldCalendarLine(line: string) {
  const chunks: string[] = [];
  let current = "";
  let currentBytes = 0;

  for (const character of line) {
    const characterBytes = new TextEncoder().encode(character).byteLength;
    const limit = chunks.length === 0 ? 75 : 74;
    if (currentBytes + characterBytes > limit && current) {
      chunks.push(current);
      current = character;
      currentBytes = characterBytes;
    } else {
      current += character;
      currentBytes += characterBytes;
    }
  }

  if (current) chunks.push(current);
  return chunks.join("\r\n ");
}

export function createRoadmapCalendar(
  roadmap: CalendarRoadmap,
  now = new Date(),
) {
  const generatedAt = now.toISOString().replace(/[-:]/gu, "").replace(/\.\d{3}/u, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LearnX//AI Learning Roadmap//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeCalendarText(`LearnX · ${roadmap.title}`)}`,
  ];
  let eventStart = nextMonday(now);

  for (const milestone of [...roadmap.milestones].sort((a, b) => a.position - b.position)) {
    const milestoneDays = estimateDurationInDays(milestone.duration);
    const eventEnd = addDays(eventStart, milestoneDays);
    const resources = milestone.resourceLinks
      .map((resource) => `${resource.title}: ${resource.url}`)
      .join("\n");
    const description = [
      milestone.description,
      `Planned duration: ${milestone.duration}`,
      resources ? `Resources:\n${resources}` : "",
    ].filter(Boolean).join("\n\n");

    lines.push(
      "BEGIN:VEVENT",
      `UID:${createUid(roadmap.id, milestone.id)}`,
      `DTSTAMP:${generatedAt}`,
      `DTSTART;VALUE=DATE:${formatCalendarDate(eventStart)}`,
      `DTEND;VALUE=DATE:${formatCalendarDate(eventEnd)}`,
      `SUMMARY:${escapeCalendarText(`LearnX ${milestone.position}: ${milestone.title}`)}`,
      `DESCRIPTION:${escapeCalendarText(description)}`,
      `CATEGORIES:${milestone.isCompleted ? "LEARNX,COMPLETED" : "LEARNX,LEARNING"}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
    );
    eventStart = eventEnd;
  }

  lines.push("END:VCALENDAR");
  return `${lines.map(foldCalendarLine).join("\r\n")}\r\n`;
}

export function downloadRoadmapCalendar(roadmap: CalendarRoadmap) {
  const content = createRoadmapCalendar(roadmap);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${roadmap.title
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9\s-]/gu, "")
    .trim()
    .replace(/\s+/gu, "-")
    .slice(0, 70) || "LearnX-Roadmap"}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
