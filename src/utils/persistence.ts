import type { AppData, CodeReviewSession, CodeReviewIdea, SemesterConfig } from "../types";
import { SEED_APP_DATA } from "./seedData";

const STORAGE_KEY = "code-review-schedule-v1";
// Bump this whenever the published seed schedule changes so returning visitors
// refresh to the latest content (see the migration hook in loadData).
const DATA_VERSION = SEED_APP_DATA.version;

// ── Default semester configuration ────────────────────────────────────────────
// The published schedule lives in seedData.ts; this re-exports its config for
// components that reference a default semester.
export const DEFAULT_SEMESTER_CONFIG: SemesterConfig = SEED_APP_DATA.semesterConfig;

function buildDefaultData(): AppData {
  // Deep clone so callers can mutate the returned data without touching the seed.
  return structuredClone(SEED_APP_DATA);
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
