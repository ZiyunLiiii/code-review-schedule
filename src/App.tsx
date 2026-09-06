import { useState } from "react";
import { useSchedule } from "./hooks/useSchedule";
import { SemesterSummary } from "./components/SemesterSummary";
import { CalendarView } from "./components/CalendarView";
import { ScheduleTable } from "./components/ScheduleTable";
import { SessionEditor } from "./components/SessionEditor";
import { IdeasBacklog } from "./components/IdeasBacklog";
import { SemesterConfigPanel } from "./components/SemesterConfigPanel";
import type { SessionStatus } from "./types";

type View = "calendar" | "table";

export default function App() {
  const {
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
    exportJSON,
    exportCSV,
    importJSON,
    resetToDefaults,
  } = useSchedule();

  const [view, setView] = useState<View>("calendar");
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingSession =
    editingId != null
      ? data.sessions.find((s) => s.id === editingId) ?? null
      : null;

  function handleStatusChange(id: string, status: SessionStatus) {
    updateSession(id, { status });
  }

  function handleDelete(id: string) {
    deleteSession(id);
    if (editingId === id) setEditingId(null);
  }

  // Add a second (or third…) competing proposal on the same Friday, then open it.
  function handleAddProposal(date: string, time: string) {
    const id = addSession({
      date,
      time,
      topic: "",
      speaker: "",
      notes: "",
      status: "proposed",
    });
    setEditingId(id);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-title">
          <h1>Code Review</h1>
          <span className="header-subtitle">Semester Schedule</span>
        </div>
      </header>

      <SemesterSummary
        stats={stats}
        semesterConfig={data.semesterConfig}
        sessions={data.sessions}
      />

      <SemesterConfigPanel
        config={data.semesterConfig}
        onUpdate={updateSemesterConfig}
        onExportJSON={exportJSON}
        onExportCSV={exportCSV}
        onImportJSON={importJSON}
        onReset={resetToDefaults}
      />

      <main className="app-main">
        <div className="view-tabs">
          <button
            className={`tab ${view === "calendar" ? "active" : ""}`}
            onClick={() => setView("calendar")}
          >
            Calendar
          </button>
          <button
            className={`tab ${view === "table" ? "active" : ""}`}
            onClick={() => setView("table")}
          >
            Table
          </button>
        </div>

        {view === "calendar" ? (
          <CalendarView
            sessions={data.sessions}
            onSelectSession={setEditingId}
            selectedId={editingId}
          />
        ) : (
          <ScheduleTable
            sessions={data.sessions}
            onEdit={setEditingId}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            selectedId={editingId}
          />
        )}

        <IdeasBacklog
          ideas={data.ideas}
          sessions={data.sessions}
          onAdd={addIdea}
          onUpdate={updateIdea}
          onDelete={deleteIdea}
          onAssign={assignIdeaToSession}
        />
      </main>

      <SessionEditor
        session={editingSession}
        siblingCount={
          editingSession
            ? data.sessions.filter((s) => s.date === editingSession.date).length
            : 0
        }
        onSave={(patch) => editingId && updateSession(editingId, patch)}
        onDelete={handleDelete}
        onAddProposal={handleAddProposal}
        onClose={() => setEditingId(null)}
      />

      <footer className="app-footer">
        Purdue University · {data.semesterConfig.name} · Fridays at 3:30 PM
      </footer>
    </div>
  );
}
