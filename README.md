# Code Review — Semester Schedule

A lightweight website for managing weekly Code Review meetings. Displays all Fridays of the current semester, lets you assign topics and speakers, and provides a brainstorm backlog for ideas not yet assigned to a date.

Built with React + Vite + TypeScript. No backend — data lives in browser localStorage.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Semester configuration

Edit **one object** in `src/utils/persistence.ts`:

```ts
export const DEFAULT_SEMESTER_CONFIG: SemesterConfig = {
  name: "Fall 2026",
  startDate: "2026-08-24",  // first day of semester
  endDate: "2026-12-19",    // last day of semester
  meetingTime: "15:30",     // 3:30 PM
  meetingDayOfWeek: 5,      // 5 = Friday
};
```

All meeting dates are generated automatically from `startDate` / `endDate`. You do not need to edit individual rows. The configuration panel in the UI (⚙ Configure semester) also lets you change this at runtime without editing code.

## Editing the schedule during a meeting

1. Open the site (or deploy to GitHub Pages — see below).
2. Click any calendar card or table row to open the editor.
3. Fill in Topic, Speaker, Notes, and Status, then press **Save** (or ⌘↵).
4. Use **Ideas & Topic Backlog** to capture suggestions that don't have a date yet. Later, click **Assign →** to move them into an open Friday slot.

## Persistence

Data is stored in `localStorage` under the key `code-review-schedule-v1`. It survives page refreshes and browser restarts on the same machine.

**Export / Import:**

| Action | How |
|---|---|
| Export all data (JSON) | Toolbar → ↓ Export JSON |
| Export schedule only (CSV) | Toolbar → ↓ Export CSV |
| Import a previously exported file | Toolbar → ↑ Import JSON |

After the brainstorming meeting, export the JSON, commit it to this repo, and teammates can import it to see the semester plan.

## Deploy to GitHub Pages

### Option A — GitHub Actions (recommended)

1. Push this repo to GitHub.
2. In **Settings → Pages**, set Source to **GitHub Actions**.
3. Edit `.github/workflows/deploy.yml` and change `VITE_BASE_PATH` to match your repo name:
   ```yaml
   VITE_BASE_PATH: /your-repo-name
   ```
4. Push to `main`. The workflow builds, tests, and deploys automatically.

### Option B — manual build + push

```bash
VITE_BASE_PATH=/your-repo-name npm run build
# Then push the dist/ folder to the gh-pages branch, or use gh-pages CLI.
```

After deployment the site is available at:
`https://<username>.github.io/<repo-name>/`

## Upgrading to collaborative editing

The data layer is isolated in `src/hooks/useSchedule.ts` and `src/utils/persistence.ts`. To replace localStorage with a real backend:

1. Replace `loadData` / `saveData` in `persistence.ts` with Firebase/Supabase reads and writes.
2. In `useSchedule.ts`, subscribe to real-time updates (e.g. `onSnapshot` for Firestore) and call `setData` when remote data changes.
3. Add optimistic updates or conflict resolution as needed.

The component layer (`CalendarView`, `ScheduleTable`, `SessionEditor`, `IdeasBacklog`) does not need to change.

## Running tests

```bash
npm test
```

Tests cover Friday-generation logic, session/idea validation, and import/export utilities.

## Project structure

```
src/
  components/
    CalendarView.tsx         month-grouped Friday cards
    ScheduleTable.tsx        sortable table view
    SessionEditor.tsx        modal editor for a single session
    IdeasBacklog.tsx         topic suggestion queue + assignment UI
    SemesterSummary.tsx      stats bar at the top
    SemesterConfigPanel.tsx  semester dates + export/import toolbar
  hooks/
    useSchedule.ts           all state + localStorage persistence
  utils/
    semesterUtils.ts         Friday generation, date formatting
    persistence.ts           localStorage, JSON/CSV import/export, validation
  types/
    index.ts                 TypeScript types (CodeReviewSession, etc.)
```
