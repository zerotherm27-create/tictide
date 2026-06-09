# YGTSS Weekly Check-In Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a weekly YGTSS check-in flow to parent mode — weekly nudge banner, 3-screen stepped form, and Care Tools history panel.

**Architecture:** `tictide.ygtss.v1` migrates from a single flat object to an array of weekly snapshots (newest first). A banner on parent home prompts the check-in if the current week has no entry. A 3-screen modal collects motor (5 dims) → vocal (5 dims) → impairment + note. Care Tools replaces the old slider panel with a history list.

**Tech Stack:** React 19, single-file `src/main.jsx`, `src/styles.css`, Lucide React ESM icons, localStorage via `useStoredState`

---

## File Map

| File | Change |
|---|---|
| `src/main.jsx` | Add `getMondayISO`, `hasEntryThisWeek`, migrate `defaultYgtss`, update `scoreYgtss`, add `YgtssBanner`, `YgtssCheckinModal`, `YgtssHistoryPanel`, wire App state |
| `src/styles.css` | Add banner, check-in modal, history panel styles |

---

### Task 1: Utility functions + data model migration

**Files:**
- Modify: `src/main.jsx` (lines ~44–65, ~124–135, ~267, ~3096–3101)

**Context:** `defaultYgtss` is currently a single object (lines 59–64). `scoreYgtss` (line 3096) takes that object directly. `ygtss` state (line 127) initializes from `defaultYgtss`. After this task, `ygtss` is an array; `scoreYgtss` accepts a snapshot or null.

- [ ] **Step 1: Add `getMondayISO` and `hasEntryThisWeek` helpers**

Add after `const ygtssLabels = { ... }` block (after line 122):

```js
function getMondayISO(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d.toISOString().slice(0, 10);
}

function hasEntryThisWeek(ygtss) {
  const weekOf = getMondayISO(new Date());
  return Array.isArray(ygtss) && ygtss.some((s) => s.weekOf === weekOf);
}
```

- [ ] **Step 2: Replace `defaultYgtss` object with empty array**

Replace lines 59–64:
```js
const defaultYgtss = {
  motor: { number: 0, frequency: 0, intensity: 0, complexity: 0, interference: 0 },
  vocal: { number: 0, frequency: 0, intensity: 0, complexity: 0, interference: 0 },
  impairment: 0,
  weekNote: "Use this as a weekly parent observation, not a formal clinician score.",
};
```
With:
```js
const defaultYgtss = [];

const emptyYgtssSnapshot = {
  motor: { number: 0, frequency: 0, intensity: 0, complexity: 0, interference: 0 },
  vocal: { number: 0, frequency: 0, intensity: 0, complexity: 0, interference: 0 },
  impairment: 0,
  weekNote: "",
};
```

- [ ] **Step 3: Add migration `useEffect` in `App`**

Add after the SW `useEffect` block (after ~line 244, before the `navigate` function). This runs once on mount and wraps the old flat object into an array if needed:

```js
useEffect(() => {
  if (!Array.isArray(ygtss)) {
    const weekOf = getMondayISO(new Date());
    setYgtss([{ weekOf, completedAt: new Date().toISOString(), ...ygtss }]);
  }
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 4: Update `scoreYgtss` to accept snapshot or null**

Replace lines 3096–3101:
```js
function scoreYgtss(ygtss) {
  const motor = ygtssDimensions.reduce((sum, key) => sum + Number(ygtss.motor[key] || 0), 0);
  const vocal = ygtssDimensions.reduce((sum, key) => sum + Number(ygtss.vocal[key] || 0), 0);
  const total = motor + vocal;
  const global = total + Number(ygtss.impairment || 0);
  return { motor, vocal, total, global };
}
```
With:
```js
function scoreYgtss(snapshot) {
  if (!snapshot) return { motor: 0, vocal: 0, total: 0, global: 0 };
  const motor = ygtssDimensions.reduce((sum, key) => sum + Number(snapshot.motor?.[key] || 0), 0);
  const vocal = ygtssDimensions.reduce((sum, key) => sum + Number(snapshot.vocal?.[key] || 0), 0);
  const total = motor + vocal;
  const global = total + Number(snapshot.impairment || 0);
  return { motor, vocal, total, global };
}
```

- [ ] **Step 5: Update `ygtssScore` memo in `App` to use latest snapshot**

Replace line 267:
```js
const ygtssScore = useMemo(() => scoreYgtss(ygtss), [ygtss]);
```
With:
```js
const ygtssScore = useMemo(() => {
  const latest = Array.isArray(ygtss) && ygtss.length > 0 ? ygtss[0] : null;
  return scoreYgtss(latest);
}, [ygtss]);
```

- [ ] **Step 6: Add `ChevronDown` import**

Add after the `ChevronRight` import (line 11):
```js
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down.js";
```

- [ ] **Step 7: Verify build passes**

```bash
npm run build
```
Expected: no errors. The app still renders; Care Tools shows zero scores (no data yet, or migrated data).

- [ ] **Step 8: Commit**

```bash
git add src/main.jsx
git commit -m "feat: migrate ygtss to weekly snapshot array"
```

---

### Task 2: YgtssBanner component + App state wiring

**Files:**
- Modify: `src/main.jsx` (App state, HomeView call, new component)

**Context:** `ParentHomeView` (line 1724) renders the parent home. It receives props from `HomeView` (line 1231). The `HomeView` call is at line 556. We'll add `ygtss` and `onYgtssCheckin` props to the HomeView call, thread them through `HomeView` → `ParentHomeView`, and render `YgtssBanner` at the top of `ParentHomeView`.

- [ ] **Step 1: Add `ygtssCheckinOpen` state and `handleSaveYgtss` to `App`**

Add after the `recoveryMessage` state line (~line 161):
```js
const [ygtssCheckinOpen, setYgtssCheckinOpen] = useState(false);
```

Add `handleSaveYgtss` after the `completeSetup` function (~line 396):
```js
function handleSaveYgtss(snapshot) {
  setYgtss((prev) => [snapshot, ...(Array.isArray(prev) ? prev : [])]);
  setYgtssCheckinOpen(false);
}
```

- [ ] **Step 2: Add `ygtss` and `onYgtssCheckin` to the HomeView call**

In the HomeView JSX call (line ~557), add two props:
```jsx
ygtss={ygtss}
onYgtssCheckin={() => setYgtssCheckinOpen(true)}
```

- [ ] **Step 3: Thread props through `HomeView`**

`HomeView` (line 1231) currently just passes `...props` or named props to `ParentHomeView`. Confirm it spreads all props (it uses `{...props}` pattern) — if so, no change needed. If it destructures, add `ygtss` and `onYgtssCheckin` to the destructure.

Check lines 1231–1237 — if the function signature is `function HomeView(props)` and renders `<ParentHomeView {...props} />`, no change needed.

- [ ] **Step 4: Add `YgtssBanner` component**

Add after the closing brace of `ParentHomeView` (after ~line 1800):

```jsx
function YgtssBanner({ ygtss, onStartCheckin }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || hasEntryThisWeek(ygtss)) return null;
  const monday = getMondayISO(new Date());
  const sun = new Date(monday);
  sun.setDate(sun.getDate() + 6);
  const fmt = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const range = `${fmt(monday)} – ${fmt(sun)}`;
  return (
    <div className="ygtss-banner">
      <div className="ygtss-banner-body">
        <CalendarDays size={18} />
        <div>
          <strong>Rate this week's tics</strong>
          <span>{range} · YGTSS</span>
        </div>
      </div>
      <div className="ygtss-banner-actions">
        <button className="ygtss-banner-cta" type="button" onClick={onStartCheckin}>
          Start check-in →
        </button>
        <button className="ygtss-banner-dismiss" type="button" aria-label="Dismiss" onClick={() => setDismissed(true)}>
          ✕
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Render `YgtssBanner` at the top of `ParentHomeView`**

In `ParentHomeView` (line 1724), add the banner as the first child inside the `<>` fragment, before `<section className="quick-grid">`:

```jsx
<YgtssBanner ygtss={props.ygtss} onStartCheckin={props.onYgtssCheckin} />
```

- [ ] **Step 6: Render `YgtssCheckinModal` at App level (placeholder)**

After the `{formOpen && isChildMode && ...}` block (~line 666), add:

```jsx
{ygtssCheckinOpen && !isChildMode && (
  <YgtssCheckinModal
    onSave={handleSaveYgtss}
    onClose={() => setYgtssCheckinOpen(false)}
  />
)}
```

`YgtssCheckinModal` doesn't exist yet — this will cause a build error. That's fine; implement it in Task 3 before verifying the build.

- [ ] **Step 7: Commit**

```bash
git add src/main.jsx
git commit -m "feat: add ygtss banner and app state wiring"
```

---

### Task 3: YgtssCheckinModal — 3-screen stepped form

**Files:**
- Modify: `src/main.jsx` (new component, ~120 lines)

**Context:** This is the 3-screen check-in modal. Screen 1 = Motor tics (5 dimensions). Screen 2 = Vocal tics (5 dimensions). Screen 3 = Impairment (6 labeled options, stored as 0-50) + optional note. Impairment is stored as a number 0/10/20/30/40/50 to stay compatible with existing `scoreYgtss` (which adds it directly to get the global score out of 100). The component calls `onSave(snapshot)` where snapshot matches the weekly snapshot schema.

- [ ] **Step 1: Add `YGTSS_DIM_LABELS` and `IMPAIRMENT_OPTS` constants**

Add after `const SIZE_OPTS = [...]` (~line 1426):

```js
const YGTSS_DIM_LABELS = {
  number: { label: "Number", desc: "How many different tics" },
  frequency: { label: "Frequency", desc: "How often tics happen" },
  intensity: { label: "Intensity", desc: "Force or loudness" },
  complexity: { label: "Complexity", desc: "Simple vs. elaborate" },
  interference: { label: "Interference", desc: "Disruption to activity" },
};

const IMPAIRMENT_OPTS = [
  { value: 0, label: "None" },
  { value: 10, label: "Minimal" },
  { value: 20, label: "Mild" },
  { value: 30, label: "Moderate" },
  { value: 40, label: "Severe" },
  { value: 50, label: "Extreme" },
];
```

- [ ] **Step 2: Add `YgtssCheckinModal` component**

Add after `YgtssBanner` (or at the end of the component section, before helper functions):

```jsx
function YgtssCheckinModal({ onSave, onClose }) {
  const [screen, setScreen] = useState(1);
  const emptyDims = { number: 0, frequency: 0, intensity: 0, complexity: 0, interference: 0 };
  const [motor, setMotor] = useState({ ...emptyDims });
  const [noMotor, setNoMotor] = useState(false);
  const [vocal, setVocal] = useState({ ...emptyDims });
  const [noVocal, setNoVocal] = useState(false);
  const [impairment, setImpairment] = useState(0);
  const [note, setNote] = useState("");

  function setDim(setter, key, value) {
    setter((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    const snapshot = {
      weekOf: getMondayISO(new Date()),
      completedAt: new Date().toISOString(),
      motor: noMotor ? { ...emptyDims } : motor,
      vocal: noVocal ? { ...emptyDims } : vocal,
      impairment,
      weekNote: note.trim(),
    };
    onSave(snapshot);
  }

  const motorScore = ygtssDimensions.reduce((s, k) => s + motor[k], 0);
  const vocalScore = ygtssDimensions.reduce((s, k) => s + vocal[k], 0);
  const totalScore = motorScore + vocalScore;

  return (
    <div className="clf-overlay" role="dialog" aria-modal="true">
      <div className="clf-sheet">
        <div className="clf-topbar">
          <button className="clf-back" type="button" onClick={screen === 1 ? onClose : () => setScreen((s) => s - 1)}>
            {screen === 1 ? "✕" : "←"}
          </button>
          <div className="clf-dots">
            {[1, 2, 3].map((n) => (
              <span key={n} className={`clf-dot ${n < screen ? "clf-dot-done" : n === screen ? "clf-dot-active" : "clf-dot-todo"}`} />
            ))}
          </div>
          <span />
        </div>

        {screen === 1 && (
          <div className="ycm-screen">
            <div className="ycm-head">
              <h2>Motor tics this week</h2>
              <span className="ycm-badge">YGTSS</span>
            </div>
            <label className="ycm-no-toggle">
              <input type="checkbox" checked={noMotor} onChange={(e) => setNoMotor(e.target.checked)} />
              No motor tics this week
            </label>
            {!noMotor && ygtssDimensions.map((dim) => (
              <div className="ycm-dim-row" key={dim}>
                <div className="ycm-dim-label">
                  <strong>{YGTSS_DIM_LABELS[dim].label}</strong>
                  <span>{YGTSS_DIM_LABELS[dim].desc}</span>
                </div>
                <div className="ycm-pills">
                  {[0, 1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`ycm-pill ${motor[dim] === v ? "ycm-pill-sel" : ""}`}
                      onClick={() => setDim(setMotor, dim, v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button className="clf-next-btn" type="button" onClick={() => { if (noMotor) setMotor({ ...emptyDims }); setScreen(2); }}>
              Next →
            </button>
          </div>
        )}

        {screen === 2 && (
          <div className="ycm-screen">
            <div className="ycm-head">
              <h2>Vocal tics this week</h2>
              <span className="ycm-badge">YGTSS</span>
            </div>
            <label className="ycm-no-toggle">
              <input type="checkbox" checked={noVocal} onChange={(e) => setNoVocal(e.target.checked)} />
              No vocal tics this week
            </label>
            {!noVocal && ygtssDimensions.map((dim) => (
              <div className="ycm-dim-row" key={dim}>
                <div className="ycm-dim-label">
                  <strong>{YGTSS_DIM_LABELS[dim].label}</strong>
                  <span>{YGTSS_DIM_LABELS[dim].desc}</span>
                </div>
                <div className="ycm-pills">
                  {[0, 1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`ycm-pill ${vocal[dim] === v ? "ycm-pill-sel" : ""}`}
                      onClick={() => setDim(setVocal, dim, v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button className="clf-next-btn" type="button" onClick={() => { if (noVocal) setVocal({ ...emptyDims }); setScreen(3); }}>
              Next →
            </button>
          </div>
        )}

        {screen === 3 && (
          <div className="ycm-screen">
            <div className="ycm-head">
              <h2>Overall impact</h2>
              <span className="ycm-badge">YGTSS</span>
            </div>
            <p className="ycm-screen-sub">How much did tics affect daily life this week?</p>
            <div className="ycm-imp-grid">
              {IMPAIRMENT_OPTS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`ycm-imp-btn ${impairment === opt.value ? "ycm-imp-sel" : ""}`}
                  onClick={() => setImpairment(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="ycm-score-preview">
              Motor {motorScore}/25 · Vocal {vocalScore}/25 · Total {totalScore}/50
            </div>
            <textarea
              className="ycm-note"
              placeholder="Week notes (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
            <button className="clf-save-btn" type="button" onClick={handleSave}>
              Save check-in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/main.jsx
git commit -m "feat: add YgtssCheckinModal 3-screen form"
```

---

### Task 4: YgtssHistoryPanel — replace old YgtssPanel in Care Tools

**Files:**
- Modify: `src/main.jsx` (new component, update `CareToolsView`)

**Context:** `CareToolsView` (line 1946) renders `<YgtssPanel ygtss={ygtss} setYgtss={setYgtss} score={ygtssScore} />` (line 1959). Replace this with `<YgtssHistoryPanel ygtss={ygtss} />`. The old `YgtssPanel` (lines 2027–2078) can remain in the file for now (it won't be called), or delete it. Keep it to avoid accidental breakage — it will be dead code but harmless.

The history panel shows: most recent entry first, each row shows week range + TTS badge + impairment label. Tapping a row expands inline to show all 11 dimensions.

- [ ] **Step 1: Add `YgtssHistoryPanel` component**

Add after `YgtssPanel` (after ~line 2078):

```jsx
const IMPAIRMENT_LABELS = ["None", "Minimal", "Mild", "Moderate", "Severe", "Extreme"];

function ygtssImpairmentLabel(value) {
  return IMPAIRMENT_LABELS[Math.round(Number(value) / 10)] ?? "—";
}

function fmtWeekRange(weekOf) {
  const monday = new Date(weekOf + "T12:00:00");
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

function YgtssHistoryPanel({ ygtss }) {
  const [expanded, setExpanded] = useState(null);
  const entries = Array.isArray(ygtss) ? ygtss : [];

  function toggle(weekOf) {
    setExpanded((prev) => (prev === weekOf ? null : weekOf));
  }

  const thisWeek = getMondayISO(new Date());

  return (
    <Panel>
      <div className="panel-title-row">
        <div>
          <h2>YGTSS weekly history</h2>
          <p className="panel-subtitle">Parent observation — motor, vocal, and impairment dimensions tracked weekly.</p>
        </div>
        <div className="score-badge">
          <strong>{entries.length}</strong>
          <span>weeks</span>
        </div>
      </div>

      {entries.length === 0 && (
        <p className="yh-empty">No YGTSS entries yet. Complete this week's check-in from the home screen.</p>
      )}

      {entries.map((entry) => {
        const score = scoreYgtss(entry);
        const isThisWeek = entry.weekOf === thisWeek;
        const isOpen = expanded === entry.weekOf;
        return (
          <div className="yh-row" key={entry.weekOf}>
            <button className="yh-row-head" type="button" onClick={() => toggle(entry.weekOf)}>
              <div className="yh-row-left">
                <span className="yh-range">{fmtWeekRange(entry.weekOf)}</span>
                {isThisWeek && <span className="yh-this-week">This week</span>}
              </div>
              <div className="yh-row-right">
                <span className="yh-tts">TTS {score.total}/50</span>
                <span className="yh-imp">{ygtssImpairmentLabel(entry.impairment)}</span>
                <ChevronDown size={16} className={`yh-chevron ${isOpen ? "yh-chevron-open" : ""}`} />
              </div>
            </button>
            {isOpen && (
              <div className="yh-detail">
                <div className="yh-detail-grid">
                  {["motor", "vocal"].map((kind) => (
                    <div key={kind}>
                      <h4>{kind === "motor" ? "Motor" : "Vocal"} ({kind === "motor" ? score.motor : score.vocal}/25)</h4>
                      {ygtssDimensions.map((dim) => (
                        <div className="yh-dim-line" key={dim}>
                          <span>{ygtssLabels[dim]}</span>
                          <span>{entry[kind]?.[dim] ?? 0}/5</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="yh-dim-line">
                  <span>Impairment</span>
                  <span>{ygtssImpairmentLabel(entry.impairment)} ({entry.impairment}/50)</span>
                </div>
                {entry.weekNote && <p className="yh-note">"{entry.weekNote}"</p>}
              </div>
            )}
          </div>
        );
      })}
    </Panel>
  );
}
```

- [ ] **Step 2: Update `CareToolsView` to use `YgtssHistoryPanel`**

Replace line 1959:
```jsx
<YgtssPanel ygtss={ygtss} setYgtss={setYgtss} score={ygtssScore} />
```
With:
```jsx
<YgtssHistoryPanel ygtss={ygtss} />
```

Note: `CareToolsView` still receives `ygtss` and `setYgtss` as props (no change to its signature needed — `setYgtss` just won't be passed to any child now).

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/main.jsx
git commit -m "feat: add YgtssHistoryPanel, replace YgtssPanel in Care Tools"
```

---

### Task 5: CSS — banner, check-in modal, history panel

**Files:**
- Modify: `src/styles.css` (append before `@media (prefers-reduced-motion: reduce)`)

**Context:** `src/styles.css` is currently 1771 lines. The check-in modal reuses existing classes from the child log form: `.clf-overlay`, `.clf-sheet`, `.clf-topbar`, `.clf-back`, `.clf-dots`, `.clf-dot-*`, `.clf-next-btn`, `.clf-save-btn` — no need to redeclare these. Only new classes for YGTSS-specific elements are needed.

- [ ] **Step 1: Add CSS block for YGTSS banner**

Find the `@media (prefers-reduced-motion: reduce)` block near the end of `src/styles.css`. Insert the following CSS immediately before it:

```css
/* ─── YGTSS WEEKLY BANNER ─── */
.ygtss-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: var(--teal-soft);
  border-left: 4px solid var(--teal);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}
.ygtss-banner-body {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--teal-dark);
  flex: 1;
  min-width: 0;
}
.ygtss-banner-body strong {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
}
.ygtss-banner-body span {
  font-size: 0.78rem;
  color: var(--muted);
}
.ygtss-banner-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}
.ygtss-banner-cta {
  background: var(--teal);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.4rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.ygtss-banner-cta:hover { background: var(--teal-dark); }
.ygtss-banner-dismiss {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem;
  line-height: 1;
}

/* ─── YGTSS CHECK-IN MODAL ─── */
/* clf-overlay, clf-sheet, clf-topbar, clf-dots, clf-dot-*, clf-next-btn, clf-save-btn
   are already defined by the child log form CSS — not repeated here */

.ycm-screen {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1.25rem 1.5rem;
  overflow-y: auto;
}
.ycm-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.ycm-head h2 {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--teal-dark);
  margin: 0;
  flex: 1;
}
.ycm-badge {
  font-size: 0.7rem;
  font-weight: 700;
  background: var(--teal-soft);
  color: var(--teal-dark);
  border: 1px solid var(--teal);
  border-radius: 6px;
  padding: 0.15rem 0.45rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.ycm-no-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--muted);
  cursor: pointer;
}
.ycm-dim-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.ycm-dim-label {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}
.ycm-dim-label strong {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--ink);
}
.ycm-dim-label span {
  font-size: 0.78rem;
  color: var(--muted);
}
.ycm-pills {
  display: flex;
  gap: 0.35rem;
}
.ycm-pill {
  width: 42px;
  height: 36px;
  border-radius: 8px;
  border: 1.5px solid var(--faint);
  background: #fff;
  color: var(--muted);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.ycm-pill-sel {
  background: var(--teal);
  color: #fff;
  border-color: var(--teal);
}
.ycm-screen-sub {
  font-size: 0.85rem;
  color: var(--muted);
  margin: 0;
}
.ycm-imp-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.ycm-imp-btn {
  padding: 0.55rem 0.4rem;
  border-radius: 10px;
  border: 1.5px solid var(--faint);
  background: #fff;
  color: var(--ink);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.ycm-imp-sel {
  background: var(--teal-soft);
  border-color: var(--teal);
  color: var(--teal-dark);
}
.ycm-score-preview {
  font-size: 0.8rem;
  color: var(--muted);
  text-align: center;
  background: var(--surface);
  border-radius: 8px;
  padding: 0.45rem;
}
.ycm-note {
  width: 100%;
  border: 1.5px solid var(--faint);
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
  font-size: 0.88rem;
  font-family: inherit;
  color: var(--ink);
  resize: none;
  box-sizing: border-box;
}
.ycm-note:focus { outline: none; border-color: var(--teal); }

/* ─── YGTSS HISTORY PANEL ─── */
.yh-empty {
  font-size: 0.85rem;
  color: var(--muted);
  text-align: center;
  padding: 1rem 0;
}
.yh-row {
  border-top: 1px solid var(--faint);
}
.yh-row:first-of-type { border-top: none; }
.yh-row-head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  gap: 0.5rem;
}
.yh-row-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}
.yh-range {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--ink);
}
.yh-this-week {
  font-size: 0.72rem;
  font-weight: 700;
  background: #d1fae5;
  color: #065f46;
  border-radius: 5px;
  padding: 0.1rem 0.4rem;
  white-space: nowrap;
}
.yh-row-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}
.yh-tts {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--teal-dark);
}
.yh-imp {
  font-size: 0.78rem;
  color: var(--muted);
}
.yh-chevron { color: var(--muted); transition: transform 0.2s; }
.yh-chevron-open { transform: rotate(180deg); }
.yh-detail {
  padding: 0.5rem 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.yh-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.yh-detail-grid h4 {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--teal-dark);
  margin: 0 0 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.yh-dim-line {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--ink);
  padding: 0.15rem 0;
}
.yh-dim-line span:last-child { font-weight: 600; color: var(--teal-dark); }
.yh-note {
  font-size: 0.82rem;
  font-style: italic;
  color: var(--muted);
  margin: 0;
  padding: 0.5rem;
  background: var(--surface);
  border-radius: 8px;
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/styles.css
git commit -m "feat: add YGTSS banner, check-in modal, and history panel styles"
```

---

### Task 6: Final verification

**Files:**
- None (verification only)

- [ ] **Step 1: Run production build**

```bash
npm run build
```
Expected: exits 0 with no errors.

- [ ] **Step 2: Verify key behaviors mentally**

- `getMondayISO(new Date())` returns the correct Monday date (e.g. "2026-06-08" for a Tuesday in that week)
- `hasEntryThisWeek([])` returns `false` → banner shows
- `hasEntryThisWeek([{ weekOf: getMondayISO(new Date()), ... }])` returns `true` → banner hides
- `scoreYgtss(null)` returns `{ motor: 0, vocal: 0, total: 0, global: 0 }` (no crash)
- `scoreYgtss({ motor: { number: 5, frequency: 5, intensity: 5, complexity: 5, interference: 5 }, vocal: { ... zeros }, impairment: 0 })` returns `{ motor: 25, vocal: 0, total: 25, global: 25 }`
- Migration: if old `ygtss` object is `{ motor: {...}, vocal: {...}, impairment: 20, weekNote: "..." }`, after migration `ygtss[0]` has all those fields plus `weekOf` and `completedAt`

- [ ] **Step 3: Final commit if any cleanup needed**

```bash
git add -p
git commit -m "fix: ygtss weekly checkin cleanup"
```

Only if there are actual changes. Skip if nothing needed.
