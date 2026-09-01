import { useState } from "react";
import type { SemesterConfig } from "../types";

interface Props {
  config: SemesterConfig;
  onUpdate: (config: SemesterConfig) => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onImportJSON: (file: File) => void;
  onReset: () => void;
}

export function SemesterConfigPanel({
  config,
  onUpdate,
  onExportJSON,
  onExportCSV,
  onImportJSON,
  onReset,
}: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...config });
  const [importError, setImportError] = useState<string | null>(null);

  function handleSave() {
    onUpdate(form);
    setOpen(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    onImportJSON(file);
    e.target.value = "";
  }

  return (
    <div className="config-panel">
      <div className="toolbar">
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen((o) => !o)}>
          ⚙ Configure semester
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onExportJSON} title="Export all data as JSON">
          ↓ Export JSON
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onExportCSV} title="Export schedule as CSV">
          ↓ Export CSV
        </button>
        <label className="btn btn-ghost btn-sm" title="Import JSON">
          ↑ Import JSON
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>
        <button
          className="btn btn-ghost btn-sm danger"
          onClick={() => {
            if (confirm("Reset all data to defaults? This cannot be undone.")) {
              onReset();
            }
          }}
        >
          Reset
        </button>
      </div>

      {importError && <div className="form-error">{importError}</div>}

      {open && (
        <div className="config-form">
          <h3>Semester Configuration</h3>
          <p className="config-hint">
            All Friday meeting dates are generated automatically from the date range below.
          </p>
          <div className="config-fields">
            <label>
              Semester name
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </label>
            <label>
              Semester start date
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, startDate: e.target.value }))
                }
              />
            </label>
            <label>
              Semester end date
              <input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, endDate: e.target.value }))
                }
              />
            </label>
            <label>
              Meeting time
              <input
                type="time"
                value={form.meetingTime}
                onChange={(e) =>
                  setForm((p) => ({ ...p, meetingTime: e.target.value }))
                }
              />
            </label>
          </div>
          <div className="config-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSave}>
              Update schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
