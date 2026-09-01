import type { AppData, CodeReviewSession, CodeReviewIdea, SemesterConfig } from "../types";
import { generateDefaultSessions } from "./semesterUtils";

const STORAGE_KEY = "code-review-schedule-v1";
const DATA_VERSION = 1;

// ── Default semester configuration ────────────────────────────────────────────
// Edit this object to configure a new semester. All Friday dates are
// generated automatically from startDate / endDate.
export const DEFAULT_SEMESTER_CONFIG: SemesterConfig = {
  name: "Fall 2026",
  startDate: "2026-08-24", // First day of Purdue Fall 2026 semester
  endDate: "2026-12-19",   // Last day of Purdue Fall 2026 semester
  meetingTime: "15:30",    // 3:30 PM
  meetingDayOfWeek: 5,     // Friday
};

function buildDefaultData(): AppData {
  const sessions = generateDefaultSessions(DEFAULT_SEMESTER_CONFIG);
  return {
    semesterConfig: DEFAULT_SEMESTER_CONFIG,
    sessions,
    ideas: [],
    version: DATA_VERSION,
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefaultData();
    const parsed = JSON.parse(raw) as AppData;
    // Basic schema migration hook — increment DATA_VERSION and add a case
    // here when the data model changes.
    if (!parsed.version || parsed.version < DATA_VERSION) {
      return buildDefaultData();
    }
    return parsed;
  } catch {
    return buildDefaultData();
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Import / Export ────────────────────────────────────────────────────────────

export function exportJSON(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  triggerDownload(blob, `code-review-${data.semesterConfig.name.replace(/\s+/g, "-")}.json`);
}

export function importJSON(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as AppData;
        if (!data.sessions || !data.semesterConfig) {
          reject(new Error("Invalid file format: missing sessions or semesterConfig"));
          return;
        }
        resolve(data);
      } catch {
        reject(new Error("Could not parse JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsText(file);
  });
}

export function exportCSV(sessions: CodeReviewSession[]): void {
  const header = ["Date", "Time", "Topic", "Speaker", "Status", "Notes"];
  const rows = sessions.map((s) => [
    s.date,
    s.time,
    csvEscape(s.topic),
    csvEscape(s.speaker),
    s.status,
    csvEscape(s.notes),
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  triggerDownload(blob, "code-review-schedule.csv");
}

function csvEscape(value: string): string {
  if (!value) return "";
  const needsQuotes = value.includes(",") || value.includes('"') || value.includes("\n");
  if (!needsQuotes) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Validation ─────────────────────────────────────────────────────────────────

export function validateSession(s: Partial<CodeReviewSession>): string[] {
  const errors: string[] = [];
  if (!s.date) errors.push("Date is required");
  if (!s.time) errors.push("Time is required");
  if (!["open", "proposed", "confirmed", "completed"].includes(s.status ?? "")) {
    errors.push("Invalid status");
  }
  return errors;
}

export function validateIdea(idea: Partial<CodeReviewIdea>): string[] {
  const errors: string[] = [];
  if (!idea.topic?.trim()) errors.push("Topic is required");
  return errors;
}
