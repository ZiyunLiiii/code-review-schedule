import type { CodeReviewSession, SessionStatus } from "../types";
import { formatDate, formatTime, isToday } from "../utils/semesterUtils";

interface Props {
  sessions: CodeReviewSession[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: SessionStatus) => void;
  selectedId?: string | null;
}

const STATUS_OPTIONS: SessionStatus[] = ["open", "proposed", "confirmed", "completed"];

export function ScheduleTable({
  sessions,
  onEdit,
  onDelete,
  onStatusChange,
  selectedId,
}: Props) {
  if (sessions.length === 0) {
    return (
      <div className="empty-state">
        <p>No sessions yet. Configure the semester date range to generate the schedule.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="schedule-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Time</th>
            <th>Topic</th>
            <th>Speaker</th>
            <th>Status</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s, i) => (
            <TableRow
              key={s.id}
              session={s}
              index={i + 1}
              isSelected={selectedId === s.id}
              onEdit={() => onEdit(s.id)}
              onDelete={() => onDelete(s.id)}
              onStatusChange={(status) => onStatusChange(s.id, status)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableRow({
  session,
  index,
  isSelected,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  session: CodeReviewSession;
  index: number;
  isSelected: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: SessionStatus) => void;
}) {
  const today = isToday(session.date);

  return (
    <tr
      className={`table-row status-row-${session.status} ${isSelected ? "selected" : ""} ${today ? "today-row" : ""}`}
      onClick={onEdit}
    >
      <td className="col-num">{index}</td>
      <td className="col-date">
        {today && <span className="today-indicator" />}
        {formatDate(session.date)}
      </td>
      <td className="col-time">{formatTime(session.time)}</td>
      <td className="col-topic">
        {session.topic || <span className="placeholder">—</span>}
      </td>
      <td className="col-speaker">
        {session.speaker || <span className="placeholder">—</span>}
      </td>
      <td className="col-status" onClick={(e) => e.stopPropagation()}>
        <select
          className={`status-select status-${session.status}`}
          value={session.status}
          onChange={(e) => onStatusChange(e.target.value as SessionStatus)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </td>
      <td className="col-notes">
        {session.notes ? (
          <span className="notes-preview" title={session.notes}>
            {session.notes.length > 40
              ? session.notes.slice(0, 40) + "…"
              : session.notes}
          </span>
        ) : (
          <span className="placeholder">—</span>
        )}
      </td>
      <td className="col-actions" onClick={(e) => e.stopPropagation()}>
        <button
          className="btn-icon edit"
          onClick={onEdit}
          title="Edit session"
        >
          ✎
        </button>
        <button
          className="btn-icon delete"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm("Remove this session?")) onDelete();
          }}
          title="Remove session"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}
