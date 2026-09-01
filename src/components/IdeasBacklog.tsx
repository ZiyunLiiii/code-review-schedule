import { useState, useRef } from "react";
import type { CodeReviewIdea, CodeReviewSession } from "../types";

interface Props {
  ideas: CodeReviewIdea[];
  sessions: CodeReviewSession[];
  onAdd: (idea: Omit<CodeReviewIdea, "id" | "createdAt">) => void;
  onUpdate: (id: string, patch: Partial<CodeReviewIdea>) => void;
  onDelete: (id: string) => void;
  onAssign: (ideaId: string, sessionId: string) => void;
}

const BLANK: Omit<CodeReviewIdea, "id" | "createdAt"> = {
  topic: "",
  suggestedSpeaker: "",
  notes: "",
  proposedDate: "",
};

export function IdeasBacklog({
  ideas,
  sessions,
  onAdd,
  onUpdate,
  onDelete,
  onAssign,
}: Props) {
  const [form, setForm] = useState({ ...BLANK });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CodeReviewIdea>>({});
  const [error, setError] = useState<string | null>(null);
  const topicRef = useRef<HTMLInputElement>(null);

  const openSessions = sessions.filter(
    (s) => s.status === "open" || s.status === "proposed"
  );

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.topic.trim()) {
      setError("Topic is required");
      return;
    }
    try {
      onAdd(form);
      setForm({ ...BLANK });
      setError(null);
    } catch (err) {
      setError(String(err));
    }
  }

  function startEdit(idea: CodeReviewIdea) {
    setEditingId(idea.id);
    setEditForm({
      topic: idea.topic,
      suggestedSpeaker: idea.suggestedSpeaker,
      notes: idea.notes,
      proposedDate: idea.proposedDate,
    });
  }

  function saveEdit(id: string) {
    onUpdate(id, editForm);
    setEditingId(null);
  }

  return (
    <div className="ideas-section">
      <h2 className="section-title">
        Ideas &amp; Topic Backlog
        {ideas.length > 0 && (
          <span className="badge">{ideas.length}</span>
        )}
      </h2>
      <p className="section-subtitle">
        Capture topic suggestions here. Assign them to a Friday session when ready.
      </p>

      {/* Quick-add form */}
      <form className="idea-form" onSubmit={handleAdd}>
        <div className="idea-form-row">
          <input
            ref={topicRef}
            type="text"
            placeholder="Topic or question *"
            value={form.topic}
            onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
            className="idea-input"
          />
          <input
            type="text"
            placeholder="Suggested speaker"
            value={form.suggestedSpeaker}
            onChange={(e) =>
              setForm((p) => ({ ...p, suggestedSpeaker: e.target.value }))
            }
            className="idea-input"
          />
          <button type="submit" className="btn btn-primary">
            + Add idea
          </button>
        </div>
        <div className="idea-form-row">
          <input
            type="text"
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            className="idea-input idea-input-wide"
          />
          <select
            value={form.proposedDate}
            onChange={(e) =>
              setForm((p) => ({ ...p, proposedDate: e.target.value }))
            }
            className="idea-input"
          >
            <option value="">Proposed date (optional)</option>
            {openSessions.map((s) => (
              <option key={s.id} value={s.date}>
                {s.date}
              </option>
            ))}
          </select>
        </div>
        {error && <div className="form-error">{error}</div>}
      </form>

      {/* Ideas list */}
      {ideas.length === 0 ? (
        <div className="empty-state">
          No ideas yet — add topic suggestions above.
        </div>
      ) : (
        <div className="ideas-list">
          {ideas.map((idea) =>
            editingId === idea.id ? (
              <IdeaEditCard
                key={idea.id}
                form={editForm}
                openSessions={openSessions}
                onChange={setEditForm}
                onSave={() => saveEdit(idea.id)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <IdeaCard
                key={idea.id}
                idea={idea}
                openSessions={openSessions}
                onEdit={() => startEdit(idea)}
                onDelete={() => onDelete(idea.id)}
                onAssign={(sessionId) => onAssign(idea.id, sessionId)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

function IdeaCard({
  idea,
  openSessions,
  onEdit,
  onDelete,
  onAssign,
}: {
  idea: CodeReviewIdea;
  openSessions: CodeReviewSession[];
  onEdit: () => void;
  onDelete: () => void;
  onAssign: (sessionId: string) => void;
}) {
  const [assigning, setAssigning] = useState(false);

  return (
    <div className="idea-card">
      <div className="idea-card-body">
        <div className="idea-topic">{idea.topic}</div>
        {idea.suggestedSpeaker && (
          <div className="idea-meta">Speaker: {idea.suggestedSpeaker}</div>
        )}
        {idea.notes && <div className="idea-meta idea-notes">{idea.notes}</div>}
        {idea.proposedDate && (
          <div className="idea-meta idea-proposed">Proposed: {idea.proposedDate}</div>
        )}
      </div>
      <div className="idea-card-actions">
        {assigning ? (
          <select
            autoFocus
            className="idea-assign-select"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                onAssign(e.target.value);
                setAssigning(false);
              }
            }}
            onBlur={() => setAssigning(false)}
          >
            <option value="" disabled>
              Choose a Friday…
            </option>
            {openSessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.date} {s.status !== "open" ? `(${s.status})` : ""}
              </option>
            ))}
          </select>
        ) : (
          <button
            className="btn btn-sm btn-outline"
            onClick={() => setAssigning(true)}
            disabled={openSessions.length === 0}
            title={
              openSessions.length === 0
                ? "No open sessions available"
                : "Assign to a Friday session"
            }
          >
            Assign →
          </button>
        )}
        <button className="btn-icon edit" onClick={onEdit} title="Edit">
          ✎
        </button>
        <button
          className="btn-icon delete"
          onClick={() => {
            if (confirm("Remove this idea?")) onDelete();
          }}
          title="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function IdeaEditCard({
  form,
  openSessions,
  onChange,
  onSave,
  onCancel,
}: {
  form: Partial<CodeReviewIdea>;
  openSessions: CodeReviewSession[];
  onChange: (patch: Partial<CodeReviewIdea>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="idea-card idea-card-editing">
      <div className="idea-edit-fields">
        <input
          type="text"
          value={form.topic ?? ""}
          onChange={(e) => onChange({ ...form, topic: e.target.value })}
          placeholder="Topic *"
          autoFocus
        />
        <input
          type="text"
          value={form.suggestedSpeaker ?? ""}
          onChange={(e) =>
            onChange({ ...form, suggestedSpeaker: e.target.value })
          }
          placeholder="Suggested speaker"
        />
        <input
          type="text"
          value={form.notes ?? ""}
          onChange={(e) => onChange({ ...form, notes: e.target.value })}
          placeholder="Notes"
        />
        <select
          value={form.proposedDate ?? ""}
          onChange={(e) => onChange({ ...form, proposedDate: e.target.value })}
        >
          <option value="">No proposed date</option>
          {openSessions.map((s) => (
            <option key={s.id} value={s.date}>
              {s.date}
            </option>
          ))}
        </select>
      </div>
      <div className="idea-card-actions">
        <button className="btn btn-primary btn-sm" onClick={onSave}>
          Save
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
