import { describe, it, expect } from "vitest";
import { getMeetingDates, generateDefaultSessions } from "../semesterUtils";
import type { SemesterConfig } from "../../types";

const fallConfig: SemesterConfig = {
  name: "Fall 2026",
  startDate: "2026-08-24",
  endDate: "2026-12-19",
  meetingTime: "15:30",
  meetingDayOfWeek: 5, // Friday
};

describe("getMeetingDates", () => {
  it("returns only Fridays", () => {
    const dates = getMeetingDates(fallConfig);
    for (const d of dates) {
      const [y, m, day] = d.split("-").map(Number);
      const dow = new Date(y, m - 1, day).getDay();
      expect(dow).toBe(5);
    }
  });

  it("first date is on or after startDate", () => {
    const dates = getMeetingDates(fallConfig);
    expect(dates[0] >= fallConfig.startDate).toBe(true);
  });

  it("last date is on or before endDate", () => {
    const dates = getMeetingDates(fallConfig);
    expect(dates[dates.length - 1] <= fallConfig.endDate).toBe(true);
  });

  it("produces a reasonable number of Fridays (~17) for a full semester", () => {
    const dates = getMeetingDates(fallConfig);
    expect(dates.length).toBeGreaterThanOrEqual(15);
    expect(dates.length).toBeLessThanOrEqual(20);
  });

  it("returns an empty array when start > end", () => {
    const cfg: SemesterConfig = { ...fallConfig, startDate: "2026-12-31", endDate: "2026-08-01" };
    expect(getMeetingDates(cfg)).toHaveLength(0);
  });

  it("handles a single-week semester", () => {
    // 2026-08-28 is a Friday
    const cfg: SemesterConfig = {
      ...fallConfig,
      startDate: "2026-08-24",
      endDate: "2026-08-28",
    };
    const dates = getMeetingDates(cfg);
    expect(dates).toEqual(["2026-08-28"]);
  });
});

describe("generateDefaultSessions", () => {
  it("creates sessions with status=open", () => {
    const sessions = generateDefaultSessions(fallConfig);
    for (const s of sessions) {
      expect(s.status).toBe("open");
    }
  });

  it("each session has a unique id", () => {
    const sessions = generateDefaultSessions(fallConfig);
    const ids = sessions.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("meeting time matches config", () => {
    const sessions = generateDefaultSessions(fallConfig);
    for (const s of sessions) {
      expect(s.time).toBe(fallConfig.meetingTime);
    }
  });
});
