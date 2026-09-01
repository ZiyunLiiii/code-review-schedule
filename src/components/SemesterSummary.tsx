import type { CodeReviewSession, SemesterConfig } from "../types";
import { formatDate } from "../utils/semesterUtils";

interface Props {
  stats: {
    total: number;
    open: number;
    proposed: number;
    confirmed: number;
    completed: number;
  };
  semesterConfig: SemesterConfig;
  sessions: CodeReviewSession[];
}

export function SemesterSummary({ stats, semesterConfig, sessions }: Props) {
  const nextSession = sessions.find(
    (s) =>
      s.status !== "completed" &&
      new Date(s.date + "T00:00:00") >= new Date(new Date().setHours(0, 0, 0, 0))
  );

  return (
    <div className="summary-bar">
      <div className="summary-semester">{semesterConfig.name} · Code Review Schedule</div>
      <div className="summary-stats">
        <Stat label="Total" value={stats.total} />
        <Stat label="Open" value={stats.open} variant="open" />
        <Stat label="Proposed" value={stats.proposed} variant="proposed" />
        <Stat label="Confirmed" value={stats.confirmed} variant="confirmed" />
        <Stat label="Completed" value={stats.completed} variant="completed" />
      </div>
      {nextSession && (
        <div className="summary-next">
          Next: <strong>{formatDate(nextSession.date)}</strong>
          {nextSession.topic ? ` — ${nextSession.topic}` : " — open"}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant?: string;
}) {
  return (
    <div className={`stat ${variant ? `stat-${variant}` : ""}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
