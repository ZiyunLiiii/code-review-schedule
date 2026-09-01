import type { CodeReviewSession } from "../types";
import { getMonth, formatTime, isToday } from "../utils/semesterUtils";

interface Props {
  sessions: CodeReviewSession[];
  onSelectSession: (id: string) => void;
  selectedId?: string | null;
}

export function CalendarView({ sessions, onSelectSession, selectedId }: Props) {
  // Group sessions by month
  const grouped = sessions.reduce<Record<string, CodeReviewSession[]>>(
    (acc, session) => {
      const key = getMonth(session.date);
      if (!acc[key]) acc[key] = [];
      acc[key].push(session);
      return acc;
    },
    {}
  );

  return (
    <div className="calendar-view">
      {Object.entries(grouped).map(([month, monthSessions]) => (
        <div key={month} className="calendar-month">
          <h3 className="calendar-month-label">{month}</h3>
          <div className="calendar-sessions">
            {monthSessions.map((s) => (
              <CalendarCard
                key={s.id}
                session={s}
                isSelected={selectedId === s.id}
                onClick={() => onSelectSession(s.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarCard({
  session,
  isSelected,
  onClick,
}: {
  session: CodeReviewSession;
  isSelected: boolean;
  onClick: () => void;
}) {
  const day = session.date.slice(8, 10);
  const isEmpty = !session.topic && !session.speaker;
  const today = isToday(session.date);

  return (
    <button
      className={`cal-card status-${session.status} ${isSelected ? "selected" : ""} ${today ? "today" : ""}`}
      onClick={onClick}
      title={
        isEmpty
          ? "Open — click to assign"
          : `${session.topic || "TBD"} · ${session.speaker || "TBD"}`
      }
    >
      <div className="cal-day">
        {today && <span className="today-dot" />}
        <span className="cal-day-num">{parseInt(day)}</span>
        <span className="cal-day-label">Fri</span>
      </div>
      <div className="cal-content">
        {session.topic ? (
          <span className="cal-topic">{session.topic}</span>
        ) : (
          <span className="cal-empty">Open</span>
        )}
        {session.speaker && (
          <span className="cal-speaker">{session.speaker}</span>
        )}
      </div>
      <div className={`cal-status-badge status-bg-${session.status}`}>
        {session.status}
      </div>
      <div className="cal-time">{formatTime(session.time)}</div>
    </button>
  );
}
