// ── Past-schedule memo ─────────────────────────────────────────────────────────
// A read-only, static record of a previous semester's schedule, shown so people
// can see what we did before. This is purely informational: it is NOT part of the
// editable schedule data and has no effect on the app's state or functionality.

interface PastSession {
  date: string; // human-readable date label
  speaker: string; // may be empty (e.g. no-meeting weeks, group sessions)
  topic: string;
}

interface PastSemester {
  name: string;
  sessions: PastSession[];
}

const FALL_2025: PastSemester = {
  name: "Fall 2025",
  sessions: [
    { date: "Sept 26", speaker: "", topic: "Planning session: collecting ideas for the semester" },
    { date: "Oct 3", speaker: "Dominic Flowers", topic: "Vibe coding" },
    { date: "Oct 10", speaker: "", topic: "No meeting (Fall break)" },
    { date: "Oct 17", speaker: "Harel Dor", topic: "Mars rover missions (MSL, M2020, Mars Helicopter)" },
    { date: "Oct 24", speaker: "", topic: "How to make weekly research slides" },
    { date: "Oct 31", speaker: "Sotiris", topic: "Research talk" },
    { date: "Nov 7", speaker: "Samin", topic: "Research talk" },
    { date: "Nov 14", speaker: "", topic: "Local lab visit – Improved Pharma, LLC" },
    { date: "Nov 21", speaker: "Bill Krause", topic: "Guest talk: Career in software engineering" },
    { date: "Nov 28", speaker: "", topic: "No meeting (Thanksgiving)" },
    { date: "Dec 5", speaker: "Charlie", topic: "Investment 101 – An Introduction to Financial Literacy" },
    { date: "Dec 12", speaker: "Charlie", topic: "Transformer lecture prerelease" },
  ],
};

export function PastScheduleMemo() {
  return (
    <details className="past-memo">
      <summary className="past-memo-summary">
        📋 What we did before — {FALL_2025.name}
      </summary>
      <div className="past-memo-body">
        <p className="past-memo-note">
          A record of last year's schedule, kept for reference. This is read-only.
        </p>
        <ul className="past-memo-list">
          {FALL_2025.sessions.map((s, i) => (
            <li key={i} className="past-memo-item">
              <span className="past-memo-date">{s.date}</span>
              <span className="past-memo-detail">
                {s.speaker && <span className="past-memo-speaker">{s.speaker}</span>}
                <span className="past-memo-topic">{s.topic}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
