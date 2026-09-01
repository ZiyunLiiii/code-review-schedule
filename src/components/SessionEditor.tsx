import { useState, useEffect, useRef } from "react";
import type { CodeReviewSession, SessionStatus } from "../types";
import { formatDate, formatTime } from "../utils/semesterUtils";

interface Props {
  session: CodeReviewSession | null;
  onSave: (patch: Partial<CodeReviewSession>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: SessionStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "proposed", label: "Proposed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
];

export function SessionEditor({ session, onSave, onDelete, onClose }: Props) {
  const [form, setForm] = useState<Partial<CodeReviewSession>>({});
  const topicRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session) {
      setForm({
        topic: session.topic,
        speaker: session.speaker,
        notes: session.notes,
        status: session.status,
        time: session.time,
      });
      setTimeout(() => topicRef.current?.focus(), 50);
    }
  }, [session]);

  if (!session) return null;

  function handleSave() {
    if (!session) return;
    // Auto-upgrade status if content was added and status is still open
    let status = form.status;
    if (status === "open" && (form.topic?.trim() || form.speaker?.trim())) {
      status = "proposed";
    }
    onSave({ ...form, status });
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
  }

  function set<K extends keyof CodeReviewSession>(key: K, val: CodeReviewSession[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" onKeyDown={handleKeyDown}>
        <div className="modal-header">
          <div>
            <div className="modal-date">{formatDate(session.date)}</div>
            <div className="modal-time">{formatTime(session.time)}</div>
          </div>
          <button className="btn-icon" onClick={onClose} title="Close (Esc)">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <label>
            Topic
            <input
              ref={topicRef}
              type="text"
              value={form.topic ?? ""}
              onChange={(e) => set("topic", e.target.value)}
              placeholder="What will be discussed?"
            />
          </label>

          <label>
            Speaker / Presenter
            <input
              type="text"
              value={form.speaker ?? ""}
              onChange={(e) => set("speaker", e.target.value)}
              placeholder="Who is presenting?"
            />
          </label>

          <label>
            Status
            <select
              value={form.status ?? "open"}
              onChange={(e) => set("status", e.target.value as SessionStatus)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Notes
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Additional details, links, or reminders…"
              rows={3}
            />
          </label>

          <label>
            Meeting Time
            <input
              type="time"
              value={form.time ?? "15:30"}
              onChange={(e) => set("time", e.target.value)}
            />
          </label>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-danger"
            onClick={() => {
              if (confirm("Remove this session from the schedule?")) {
                onDelete(session.id);
                onClose();
              }
            }}
          >
            Remove
          </button>
          <div className="modal-footer-right">
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save <span className="shortcut">⌘↵</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
