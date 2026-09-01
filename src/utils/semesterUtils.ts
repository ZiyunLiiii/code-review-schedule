import type { SemesterConfig, CodeReviewSession } from "../types";

// Generates all Fridays (or whatever meetingDayOfWeek is set to) between
// startDate and endDate, inclusive.
export function getMeetingDates(config: SemesterConfig): string[] {
  const dates: string[] = [];
  const start = new Date(config.startDate + "T00:00:00");
  const end = new Date(config.endDate + "T00:00:00");
  const target = config.meetingDayOfWeek;

  // Advance to first occurrence of target weekday
  const d = new Date(start);
  while (d.getDay() !== target) {
    d.setDate(d.getDate() + 1);
  }

  while (d <= end) {
    dates.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 7);
  }

  return dates;
}

// Creates the default session list for a semester (all open).
export function generateDefaultSessions(
  config: SemesterConfig
): CodeReviewSession[] {
  const dates = getMeetingDates(config);
  return dates.map((date) => ({
    id: crypto.randomUUID(),
    date,
    time: config.meetingTime,
    topic: "",
    speaker: "",
    notes: "",
    status: "open",
  }));
}

// Merges newly generated dates with existing sessions so that manual edits
// survive a semester config change.
export function reconcileSessions(
  existing: CodeReviewSession[],
  config: SemesterConfig
): CodeReviewSession[] {
  const dates = getMeetingDates(config);
  const byDate = new Map(existing.map((s) => [s.date, s]));

  return dates.map(
    (date) =>
      byDate.get(date) ?? {
        id: crypto.randomUUID(),
        date,
        time: config.meetingTime,
        topic: "",
        speaker: "",
        notes: "",
        status: "open" as const,
      }
  );
}

export function formatDate(dateStr: string): string {
  // Parse as local date to avoid timezone shift
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function isFuture(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d) >= today;
}

export function isToday(dateStr: string): boolean {
  const today = new Date();
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function getWeekNumber(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const jan1 = new Date(y, 0, 1);
  return Math.ceil(((date.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
}

export function getMonth(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
