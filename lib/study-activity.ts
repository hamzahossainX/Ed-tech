export type StudyActivityType = "milestone" | "pomodoro";

export type StudyActivityEvent = {
  id: string;
  type: StudyActivityType;
  occurredAt: string;
};

export type StudyActivityDay = {
  date: string;
  count: number;
};

const STORAGE_KEY = "learnx:study-activity:v1";
const MAX_EVENTS = 1_000;

function isActivityEvent(value: unknown): value is StudyActivityEvent {
  return typeof value === "object"
    && value !== null
    && "id" in value
    && typeof value.id === "string"
    && "type" in value
    && (value.type === "milestone" || value.type === "pomodoro")
    && "occurredAt" in value
    && typeof value.occurredAt === "string"
    && Number.isFinite(Date.parse(value.occurredAt));
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addLocalDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setHours(12, 0, 0, 0);
  result.setDate(result.getDate() + amount);
  return result;
}

export function readStudyActivity(): StudyActivityEvent[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isActivityEvent).slice(-MAX_EVENTS);
  } catch {
    return [];
  }
}

export function saveStudyActivity(events: StudyActivityEvent[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
    return true;
  } catch {
    return false;
  }
}

export function addStudyActivity(
  current: StudyActivityEvent[],
  event: StudyActivityEvent,
) {
  if (current.some((item) => item.id === event.id)) return current;
  return [...current, event].slice(-MAX_EVENTS);
}

export function createActivityDays(
  events: StudyActivityEvent[],
  dayCount = 35,
  now = new Date(),
): StudyActivityDay[] {
  const counts = new Map<string, number>();
  for (const event of events) {
    const key = localDateKey(new Date(event.occurredAt));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from({ length: dayCount }, (_, index) => {
    const date = addLocalDays(now, index - dayCount + 1);
    const key = localDateKey(date);
    return { date: key, count: counts.get(key) ?? 0 };
  });
}

export function calculateStudyStreak(
  events: StudyActivityEvent[],
  now = new Date(),
) {
  const activeDates = new Set(
    events.map((event) => localDateKey(new Date(event.occurredAt))),
  );
  let cursor = new Date(now);
  cursor.setHours(12, 0, 0, 0);

  if (!activeDates.has(localDateKey(cursor))) cursor = addLocalDays(cursor, -1);

  let streak = 0;
  while (activeDates.has(localDateKey(cursor))) {
    streak += 1;
    cursor = addLocalDays(cursor, -1);
  }
  return streak;
}
