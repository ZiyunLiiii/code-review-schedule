import { useState, useCallback, useEffect } from "react";
import type { AppData, CodeReviewSession, CodeReviewIdea, SemesterConfig } from "../types";
import { loadData, saveData, exportJSON, exportCSV, importJSON, validateSession, validateIdea } from "../utils/persistence";
import { reconcileSessions } from "../utils/semesterUtils";

export function useSchedule() {
  const [data, setData] = useState<AppData>(() => loadData());

  // Persist every change to localStorage
  useEffect(() => {
    saveData(data);
  }, [data]);

  // ── Sessions ─────────────────────────────────────────────────────────────────

  const updateSession = useCallback(
    (id: string, patch: Partial<CodeReviewSession>) => {
      const errors = validateSession(patch);
      if (errors.length) throw new Error(errors.join("; "));
      setData((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s) =>
          s.id === id ? { ...s, ...patch } : s
        ),
      }));
    },
    []
  );

  const deleteSession = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== id),
    }));
  }, []);

  const addSession = useCallback((session: Omit<CodeReviewSession, "id">) => {
    const errors = validateSession(session);
    if (errors.length) throw new Error(errors.join("; "));
    setData((prev) => ({
      ...prev,
      sessions: [
        ...prev.sessions,
        { ...session, id: crypto.randomUUID() },
      ].sort((a, b) => a.date.localeCompare(b.date)),
    }));
  }, []);

  // ── Ideas ─────────────────────────────────────────────────────────────────────

  const addIdea = useCallback((idea: Omit<CodeReviewIdea, "id" | "createdAt">) => {
    const errors = validateIdea(idea);
    if (errors.length) throw new Error(errors.join("; "));
    setData((prev) => ({
      ...prev,
      ideas: [
        ...prev.ideas,
        {
          ...idea,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  }, []);

  const updateIdea = useCallback(
    (id: string, patch: Partial<CodeReviewIdea>) => {
      setData((prev) => ({
        ...prev,
        ideas: prev.ideas.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      }));
    },
    []
  );

  const deleteIdea = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      ideas: prev.ideas.filter((i) => i.id !== id),
    }));
  }, []);

  // Assign an idea to a session date and remove the idea from the backlog
  const assignIdeaToSession = useCallback(
    (ideaId: string, sessionId: string) => {
      setData((prev) => {
        const idea = prev.ideas.find((i) => i.id === ideaId);
        if (!idea) return prev;
        return {
          ...prev,
          sessions: prev.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  topic: idea.topic || s.topic,
                  speaker: idea.suggestedSpeaker || s.speaker,
                  notes: idea.notes || s.notes,
                  status: s.status === "open" ? "proposed" : s.status,
                }
              : s
          ),
          ideas: prev.ideas.filter((i) => i.id !== ideaId),
        };
      });
    },
    []
  );

  // ── Semester config ───────────────────────────────────────────────────────────

  const updateSemesterConfig = useCallback((config: SemesterConfig) => {
    setData((prev) => {
      const sessions = reconcileSessions(prev.sessions, config);
      return { ...prev, semesterConfig: config, sessions };
    });
  }, []);

  // ── Import / Export ───────────────────────────────────────────────────────────

  const handleExportJSON = useCallback(() => exportJSON(data), [data]);
  const handleExportCSV = useCallback(
    () => exportCSV(data.sessions),
    [data.sessions]
  );

  const handleImportJSON = useCallback(async (file: File) => {
    const imported = await importJSON(file);
    setData(imported);
  }, []);

  const resetToDefaults = useCallback(() => {
    setData(loadData());
    localStorage.clear();
    setData(loadData());
    window.location.reload();
  }, []);

  // ── Derived stats ─────────────────────────────────────────────────────────────

  const stats = {
    total: data.sessions.length,
    open: data.sessions.filter((s) => s.status === "open").length,
    proposed: data.sessions.filter((s) => s.status === "proposed").length,
    confirmed: data.sessions.filter((s) => s.status === "confirmed").length,
    completed: data.sessions.filter((s) => s.status === "completed").length,
  };

  return {
    data,
    stats,
    updateSession,
    deleteSession,
    addSession,
    addIdea,
    updateIdea,
    deleteIdea,
    assignIdeaToSession,
    updateSemesterConfig,
    exportJSON: handleExportJSON,
    exportCSV: handleExportCSV,
    importJSON: handleImportJSON,
    resetToDefaults,
  };
}
