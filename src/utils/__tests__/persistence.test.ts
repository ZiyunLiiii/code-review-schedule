import { describe, it, expect } from "vitest";
import { validateSession, validateIdea } from "../persistence";

describe("validateSession", () => {
  it("accepts a valid session", () => {
    expect(
      validateSession({ date: "2026-09-04", time: "15:30", status: "open" })
    ).toHaveLength(0);
  });

  it("requires date", () => {
    const errs = validateSession({ time: "15:30", status: "open" });
    expect(errs.some((e) => e.toLowerCase().includes("date"))).toBe(true);
  });

  it("requires time", () => {
    const errs = validateSession({ date: "2026-09-04", status: "open" });
    expect(errs.some((e) => e.toLowerCase().includes("time"))).toBe(true);
  });

  it("rejects invalid status", () => {
    const errs = validateSession({
      date: "2026-09-04",
      time: "15:30",
      status: "unknown" as never,
    });
    expect(errs.some((e) => e.toLowerCase().includes("status"))).toBe(true);
  });
});

describe("validateIdea", () => {
  it("accepts a valid idea", () => {
    expect(validateIdea({ topic: "Intro to JAX" })).toHaveLength(0);
  });

  it("rejects blank topic", () => {
    const errs = validateIdea({ topic: "  " });
    expect(errs.length).toBeGreaterThan(0);
  });

  it("rejects missing topic", () => {
    const errs = validateIdea({});
    expect(errs.length).toBeGreaterThan(0);
  });
});
