export type SessionStatus = "open" | "proposed" | "confirmed" | "completed";

export interface CodeReviewSession {
  id: string;
  date: string; // ISO date string: YYYY-MM-DD
  time: string; // HH:MM
  topic: string;
  speaker: string;
  notes: string;
  status: SessionStatus;
}

export interface CodeReviewIdea {
  id: string;
  topic: string;
  suggestedSpeaker: string;
  notes: string;
  proposedDate: string; // ISO date string, optional
  createdAt: string; // ISO datetime
}

export interface SemesterConfig {
  name: string; // e.g. "Fall 2026"
  startDate: string; // first day of semester, YYYY-MM-DD
  endDate: string; // last day of semester, YYYY-MM-DD
  meetingTime: string; // HH:MM
  meetingDayOfWeek: number; // 0=Sun, 5=Fri
}

export interface AppData {
  semesterConfig: SemesterConfig;
  sessions: CodeReviewSession[];
  ideas: CodeReviewIdea[];
  version: number;
}
