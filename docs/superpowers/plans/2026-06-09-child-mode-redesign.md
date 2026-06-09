# Child Mode Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace TicTide's multi-column child mode with a single-column, ADHD/tic-aligned interface — breathing ring hero, stepped 3-screen log form, CBIT/HRT/CBT Access Tips screen, and a clean 3-item bottom nav.

**Architecture:** All changes are contained in `src/main.jsx` (add `ChildLogForm`, `ChildTipsView`; rewrite `ChildHomeView`) and `src/styles.css` (add child-mode layout classes). No new files, no schema changes, no parent mode touched.

**Tech Stack:** React 19, Vite, Lucide React icons (ESM imports), CSS custom properties already defined in styles.css

---

## File Map

| File | What changes |
|---|---|
| `src/main.jsx:108` | Add `"tips"` to `childViews` set |
| `src/main.jsx:281` | Add `saveChildLog()` helper next to `addLog()` |
| `src/main.jsx:477–650` | Wrap render in child-mode layout branch; simplify mobile nav to 3 items for child |
| `src/main.jsx:652–720` | Split `formOpen` render: parent modal unchanged, child renders `<ChildLogForm>` |
| `src/main.jsx:1215–1310` | Rewrite `ChildHomeView` |
| `src/main.jsx:~1311` | Add `ChildLogForm` component (new) |
| `src/main.jsx:~1380` | Add `ChildTipsView` component (new) |
| `src/main.jsx:~538` | Add `{isChildMode && activeView === "tips" && <ChildTipsView>}` to render |
| `src/styles.css` | Add all child-mode v2 styles (append before `@media (prefers-reduced-motion)`) |

---

## Task 1: Add "tips" to childViews + saveChildLog helper

**Files:**
- Modify: `src/main.jsx:108` (childViews set)
- Modify: `src/main.jsx:298` (after addLog function)

- [ ] **Step 1: Update childViews to include "tips"**

Find line 108:
```js
const childViews = new Set(["home", "logs", "journal", "help"]);
```
Replace with:
```js
const childViews = new Set(["home", "logs", "journal", "help", "tips"]);
```

- [ ] **Step 2: Add saveChildLog helper after addLog (line ~298)**

Insert after the closing brace of `addLog`:
```js
function saveChildLog(data) {
  const log = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ticName: data.ticName,
    ticType: data.ticType,
    intensity: data.intensity,
    urge: data.hadUrge ? 7 : 0,
    pain: data.hurt ? "Mild" : "None",
    contexts: data.contexts,
    note: data.note?.trim() || "No note added",
    hadUrge: data.hadUrge,
  };
  setLogs((current) => [log, ...current]);
  setFormOpen(false);
  setActiveView("logs");
}
```

- [ ] **Step 3: Verify build passes**
```bash
npm run build
```
Expected: `✓ built in` — no errors.

- [ ] **Step 4: Commit**
```bash
git add src/main.jsx
git commit -m "feat: add tips nav route and saveChildLog helper"
```

---

## Task 2: Simplify mobile nav to 3 items for child mode

**Files:**
- Modify: `src/main.jsx:635–650` (mobile nav)

- [ ] **Step 1: Replace the mobile nav block**

Find the existing `<nav className="mobile-nav"...>` block (lines 635–650) and replace it with:
```jsx
<nav className="mobile-nav" aria-label="Mobile primary">
  <NavButton icon={<Home />} label="Home" active={activeView === "home"} onClick={() => navigate("home")} />
  <NavButton icon={<FileText />} label="Logs" active={activeView === "logs"} onClick={() => navigate("logs")} />
  <NavButton icon={<NotebookPen />} label="Journal" active={activeView === "journal"} onClick={() => navigate("journal")} />
  {!isChildMode && (
    <>
      <NavButton icon={<BarChart3 />} label="Trends" active={activeView === "trends"} onClick={() => navigate("trends")} />
      <NavButton icon={<ClipboardList />} label="Care Tools" active={activeView === "tools"} onClick={() => navigate("tools")} />
    </>
  )}
</nav>
```

**Why:** The "Parent" lock button is already in the topbar (line 511). The "Help" nav item is cut — help is accessible via the `?` icon in the topbar (line 524). Child mode gets exactly 3 nav items matching the spec.

- [ ] **Step 2: Run dev server and switch to child mode, verify nav shows 3 items only**
```bash
npm run dev
```
Open app → switch to child mode → bottom nav should show Home, Logs, Journal only.

- [ ] **Step 3: Commit**
```bash
git add src/main.jsx
git commit -m "feat: simplify child mode mobile nav to 3 items"
```

---

## Task 3: Child-mode layout shell — single column, max-width 480px

**Files:**
- Modify: `src/styles.css` (before `@media (prefers-reduced-motion)` block)

- [ ] **Step 1: Add child-mode layout overrides to styles.css**

Append before the `@media (prefers-reduced-motion: reduce)` block:
```css
/* ══════════════════════════════════════
   CHILD MODE V2 — LAYOUT SHELL
══════════════════════════════════════ */
.app-shell.child-mode {
  grid-template-columns: 1fr;          /* kill sidebar column */
  max-width: 480px;
  margin: 0 auto;
  padding: 0;
  gap: 0;
}
.app-shell.child-mode .sidebar {
  display: none;
}
.app-shell.child-mode .workspace {
  padding: 0 0 80px;                   /* room for bottom nav */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}
.app-shell.child-mode .topbar {
  padding: 14px 16px 10px;
  border-bottom: 1px solid rgba(8,119,125,0.08);
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 10;
}
.app-shell.child-mode .topbar h1 {
  display: none;                        /* no page title — screens speak for themselves */
}
.app-shell.child-mode .topbar .date-line {
  display: none;
}
.app-shell.child-mode .mobile-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  padding: 7px 10px max(env(safe-area-inset-bottom), 7px);
  background: rgba(255,255,255,0.95);
  border-top: 1px solid rgba(8,119,125,0.08);
  backdrop-filter: blur(14px);
  z-index: 20;
}
.app-shell.child-mode .mobile-nav .nav-button {
  flex-direction: column;
  gap: 3px;
  padding: 6px 4px 5px;
  border-radius: 10px;
  font-size: 0.6rem;
  font-weight: 800;
}
```

- [ ] **Step 2: Run dev server in child mode and verify layout**

Check: sidebar gone, workspace is narrow centered column, bottom nav is 3 items fixed at bottom.

- [ ] **Step 3: Commit**
```bash
git add src/styles.css
git commit -m "feat: child mode single-column layout shell with fixed bottom nav"
```

---

## Task 4: Rewrite ChildHomeView

**Files:**
- Modify: `src/main.jsx:1215–1310` (ChildHomeView function)

- [ ] **Step 1: Replace ChildHomeView entirely**

Find `function ChildHomeView(props) {` (line 1215) and replace the entire function body through its closing `}` (line 1310) with:

```jsx
function ChildHomeView(props) {
  return (
    <section className="child-home-v2" aria-label="Child home">

      {/* Breathing ring — CBIT Relaxation hero */}
      <div className="cv2-ring-card">
        <span className="cv2-science-badge">CBIT Relaxation</span>
        <div
          className="breathing-ring cv2-ring"
          aria-label="Breathing timer"
          data-phase={props.breathingGuide.label.toLowerCase()}
        >
          <span className="cv2-ring-phase">{props.breathingGuide.label}</span>
          <strong className="cv2-ring-count">{props.breathingGuide.beat}</strong>
          <small className="cv2-ring-prompt">{props.breathingGuide.prompt}</small>
        </div>
        <div className="cv2-ring-legend">
          <span className="cv2-legend-dot cv2-legend-teal">Inhale 4s</span>
          <span className="cv2-legend-dot cv2-legend-gold">Hold 4s</span>
          <span className="cv2-legend-dot cv2-legend-coral">Exhale 6s</span>
        </div>
        <button
          className="cv2-start-btn"
          type="button"
          onClick={() => props.setRunning((v) => !v)}
        >
          {props.running ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          )}
          {props.running ? "Pause breathing" : "Start 4-4-6 breathing"}
        </button>
      </div>

      {/* Access Tips card — CBIT · HRT · CBT */}
      <button className="cv2-tips-card" type="button" onClick={() => props.onTips()}>
        <div className="cv2-tips-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
            <path d="M9 18h6"/><path d="M10 22h4"/>
          </svg>
        </div>
        <div className="cv2-tips-text">
          <strong>Access tips</strong>
          <span>Strategies that actually help</span>
          <div className="cv2-tips-badges">
            <em className="cv2-mb-cbit">CBIT</em>
            <em className="cv2-mb-hrt">HRT</em>
            <em className="cv2-mb-cbt">CBT</em>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>

      {/* Context chips — CBIT functional assessment */}
      <div className="cv2-chips-card">
        <div className="cv2-chips-heading">
          <span>What's happening?</span>
          <span className="cv2-chips-hint">CBIT trigger log</span>
        </div>
        <div className="cv2-chip-grid">
          {[
            { label: "Stressed", icon: "sparkle" },
            { label: "School",   icon: "school"   },
            { label: "Tired",    icon: "moon"      },
            { label: "Excited",  icon: "zap"       },
            { label: "Screens",  icon: "monitor"   },
            { label: "Bored",    icon: "clock"     },
          ].map(({ label, icon }) => (
            <button
              key={label}
              type="button"
              className={`cv2-chip ${props.selectedContexts.includes(label) ? "cv2-chip-on" : "cv2-chip-off"}`}
              onClick={() => props.toggleContext(label)}
            >
              <ChildChipIcon name={icon} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Save a tic CTA */}
      <button className="cv2-log-cta" type="button" onClick={props.onAdd}>
        <span className="cv2-cta-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
        </span>
        <span className="cv2-cta-text">
          <strong>Save a tic</strong>
          <span>tap during or right after</span>
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>

    </section>
  );
}
```

- [ ] **Step 2: Add ChildChipIcon helper** (insert right before ChildHomeView)

```jsx
const CHILD_CHIP_ICONS = {
  sparkle: <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>,
  school:  <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>,
  moon:    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>,
  zap:     <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
  monitor: <><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></>,
  clock:   <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
};

function ChildChipIcon({ name }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {CHILD_CHIP_ICONS[name]}
    </svg>
  );
}
```

- [ ] **Step 3: Wire `onTips` prop in App render**

Find the `<HomeView>` call (around line 539). Add `onTips={() => navigate("tips")}` to its props:
```jsx
<HomeView
  {/* ... existing props ... */}
  onTips={() => navigate("tips")}
/>
```

Then add the tips view render below the other child view renders (near line 585):
```jsx
{isChildMode && activeView === "tips" && (
  <ChildTipsView onBack={() => navigate("home")} />
)}
```

- [ ] **Step 4: Run dev server and verify ChildHomeView renders correctly**

Switch to child mode → home should show ring card, tips card, 6-chip grid, coral CTA.

- [ ] **Step 5: Commit**
```bash
git add src/main.jsx
git commit -m "feat: rewrite ChildHomeView with ring hero, chips, tips card, log CTA"
```

---

## Task 5: CSS for ChildHomeView

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Append child-home-v2 styles**

Add after the child-mode layout shell block from Task 3:
```css
/* ══════════════════════════════════════
   CHILD MODE V2 — HOME SCREEN
══════════════════════════════════════ */
.child-home-v2 {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px 0;
  flex: 1;
}

/* Ring card */
.cv2-ring-card {
  background: var(--surface);
  border-radius: 20px;
  padding: 16px 14px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 11px;
  box-shadow: 0 3px 18px rgba(8,119,125,0.08);
  position: relative;
}
.cv2-science-badge {
  position: absolute;
  top: 9px; right: 10px;
  background: var(--teal-soft);
  border-radius: 8px;
  padding: 2px 7px;
  font-size: 0.58rem;
  font-weight: 800;
  color: var(--teal-dark);
  letter-spacing: 0.3px;
}
/* Use .breathing-ring.cv2-ring to beat the existing .breathing-ring span (0,1,1) selector */
.breathing-ring.cv2-ring {
  width: 148px !important;
  height: 148px !important;
}
.breathing-ring.cv2-ring span {    /* cv2-ring-phase */
  font-size: 0.57rem;
  font-weight: 900;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 1.8px;
  display: block;
}
.breathing-ring.cv2-ring strong {  /* cv2-ring-count */
  font-size: 2.6rem;
  font-weight: 900;
  color: var(--teal-dark);
  line-height: 1;
  letter-spacing: -2px;
  margin: 0;
}
.breathing-ring.cv2-ring small {   /* cv2-ring-prompt */
  font-size: 0.56rem;
  color: var(--muted);
  font-weight: 600;
}
.cv2-ring-legend {
  display: flex;
  gap: 10px;
  align-items: center;
}
.cv2-legend-dot {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--muted);
}
.cv2-legend-dot::before {
  content: '';
  width: 8px; height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.cv2-legend-teal::before  { background: var(--teal); }
.cv2-legend-gold::before  { background: var(--gold); }
.cv2-legend-coral::before { background: var(--coral); }
.cv2-start-btn {
  width: 100%;
  height: 44px;
  background: var(--teal);
  color: white;
  border: none;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

/* Access Tips card */
.cv2-tips-card {
  display: flex;
  align-items: center;
  gap: 11px;
  background: #f0ecfb;
  border: 1.5px solid rgba(124,92,191,0.18);
  border-radius: 14px;
  padding: 11px 13px;
  cursor: pointer;
  text-align: left;
  width: 100%;
}
.cv2-tips-icon {
  width: 36px; height: 36px;
  background: #7c5cbf;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: white;
  flex-shrink: 0;
}
.cv2-tips-text {
  flex: 1;
  min-width: 0;
}
.cv2-tips-text strong {
  display: block;
  font-size: 0.84rem;
  font-weight: 800;
  color: #3d1d8a;
  margin-bottom: 1px;
}
.cv2-tips-text span {
  display: block;
  font-size: 0.65rem;
  font-weight: 600;
  color: #8b76c0;
  margin-bottom: 4px;
}
.cv2-tips-badges {
  display: flex;
  gap: 4px;
}
.cv2-tips-badges em {
  font-style: normal;
  font-size: 0.56rem;
  font-weight: 800;
  border-radius: 4px;
  padding: 1px 4px;
}
.cv2-mb-cbit { background: var(--teal-soft); color: var(--teal-dark); }
.cv2-mb-hrt  { background: #fef3d0; color: #7a4e00; }
.cv2-mb-cbt  { background: #e5f7ef; color: #1e5c3a; }

/* Context chips */
.cv2-chips-card {
  background: rgba(255,255,255,0.82);
  border-radius: 16px;
  padding: 10px 11px 9px;
}
.cv2-chips-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.cv2-chips-heading span:first-child {
  font-size: 0.62rem;
  font-weight: 800;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}
.cv2-chips-hint {
  font-size: 0.57rem;
  color: #9dbab8;
  font-weight: 600;
}
.cv2-chip-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.cv2-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 36px;
  padding: 0 8px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.7rem;
  font-weight: 700;
  border: 1.5px solid;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s, border-color 0.12s;
}
.cv2-chip-on  { background: var(--teal); border-color: var(--teal); color: white; }
.cv2-chip-off { background: white; border-color: var(--faint); color: var(--teal-dark); }

/* Save a tic CTA */
.cv2-log-cta {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--coral);
  border-radius: 16px;
  padding: 13px 14px;
  box-shadow: 0 7px 20px rgba(233,111,91,0.28);
  cursor: pointer;
  color: white;
  border: none;
  width: 100%;
  text-align: left;
}
.cv2-cta-icon {
  width: 40px; height: 40px;
  background: rgba(255,255,255,0.2);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.cv2-cta-text { flex: 1; }
.cv2-cta-text strong {
  display: block;
  font-size: 0.9rem;
  font-weight: 900;
}
.cv2-cta-text span {
  font-size: 0.65rem;
  font-weight: 600;
  opacity: 0.82;
}
```

- [ ] **Step 2: Run dev server and verify home screen visually**

Expected: ring card with CBIT badge at top, purple tips card, 3×2 chip grid, coral CTA, all in a single column within 480px.

- [ ] **Step 3: Commit**
```bash
git add src/styles.css
git commit -m "feat: add child-home-v2 CSS styles"
```

---

## Task 6: ChildLogForm component (stepped 3-screen)

**Files:**
- Modify: `src/main.jsx` — insert `ChildLogForm` function after `ChildHomeView`

- [ ] **Step 1: Add ChildLogForm component (multi-select tic tiles)**

Insert directly after the closing `}` of `ChildHomeView`:

```jsx
const TIC_TILES = [
  {
    id: "arms-legs",
    label: "Arms or legs",
    ticType: "Motor",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="4" r="2"/>
        <line x1="12" y1="6" x2="12" y2="13"/>
        <line x1="12" y1="9" x2="6.5" y2="7"/>
        <line x1="12" y1="9" x2="17.5" y2="7"/>
        <line x1="12" y1="13" x2="9" y2="19"/>
        <line x1="12" y1="13" x2="15" y2="19"/>
      </svg>
    ),
  },
  {
    id: "face-eyes",
    label: "Face or eyes",
    ticType: "Motor",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
        <line x1="8" y1="6.5" x2="7" y2="4.5"/>
        <line x1="12" y1="5.5" x2="12" y2="3.5"/>
        <line x1="16" y1="6.5" x2="17" y2="4.5"/>
      </svg>
    ),
  },
  {
    id: "sound-voice",
    label: "Sound or voice",
    ticType: "Vocal",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" x2="12" y1="19" y2="22"/>
        <line x1="8" x2="16" y1="22" y2="22"/>
      </svg>
    ),
  },
  {
    id: "head-neck",
    label: "Head or neck",
    ticType: "Motor",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="9" r="5"/>
        <line x1="10" y1="14" x2="10" y2="17"/>
        <line x1="14" y1="14" x2="14" y2="17"/>
        <path d="M7 17h10"/>
        <path d="M4 7 Q3 4 6 3"/>
        <path d="M20 7 Q21 4 18 3"/>
      </svg>
    ),
  },
];

const SIZE_OPTS = [
  { label: "Small",  sub: "barely there", intensity: 3, size: 28 },
  { label: "Medium", sub: "noticeable",   intensity: 6, size: 36 },
  { label: "Big",    sub: "hard to hide", intensity: 9, size: 44 },
];

function ChildLogForm({ defaultContexts = [], onSave, onClose }) {
  const [step, setStep] = React.useState(1);
  const [ticTiles, setTicTiles] = React.useState([]);        // array — multi-select
  const [sizePick, setSizePick] = React.useState(null);      // one of SIZE_OPTS
  const [hadUrge, setHadUrge] = React.useState(null);        // true/false/null
  const [hurt, setHurt] = React.useState(null);              // true/false/null
  const [contexts, setContexts] = React.useState(defaultContexts);
  const [note, setNote] = React.useState("");

  function toggleTile(tile) {
    setTicTiles((prev) =>
      prev.some((t) => t.id === tile.id)
        ? prev.filter((t) => t.id !== tile.id)
        : [...prev, tile]
    );
  }

  function toggleCtx(label) {
    setContexts((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  }

  function handleSave() {
    const labels = ticTiles.map((t) => t.label);
    const hasVocal = ticTiles.some((t) => t.ticType === "Vocal");
    const hasMotor = ticTiles.some((t) => t.ticType === "Motor");
    const ticType = hasVocal && hasMotor ? "Both" : hasVocal ? "Vocal" : "Motor";
    onSave({
      ticName: labels.length > 0 ? labels.join(" + ") : "Custom",
      ticType,
      intensity: sizePick?.intensity ?? 5,
      hadUrge: hadUrge ?? false,
      hurt: hurt ?? false,
      contexts,
      note,
    });
  }

  const DOTS = [
    { n: 1, done: step > 1, active: step === 1 },
    { n: 2, done: step > 2, active: step === 2 },
    { n: 3, done: false,    active: step === 3 },
  ];

  return (
    <div className="clf-overlay" role="dialog" aria-modal="true" aria-label="Save a tic">
      <div className="clf-sheet">

        {/* Top bar */}
        <div className="clf-topbar">
          {step > 1 ? (
            <button className="clf-back" type="button" onClick={() => setStep((s) => s - 1)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back
            </button>
          ) : (
            <span/>
          )}
          <div className="clf-dots">
            {DOTS.map((d) => (
              <span
                key={d.n}
                className={`clf-dot ${d.active ? "clf-dot-active" : d.done ? "clf-dot-done" : "clf-dot-todo"}`}
              />
            ))}
          </div>
          <button className="clf-close" type="button" onClick={onClose}>Close</button>
        </div>

        {/* Step 1: What kind? */}
        {step === 1 && (
          <div className="clf-body">
            <div>
              <p className="clf-q">What kind of tic was it?</p>
              <p className="clf-hint">Pick all that fit — he can choose more than one</p>
            </div>
            <div className="clf-tile-grid">
              {TIC_TILES.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  className={`clf-tile ${ticTiles.some((t) => t.id === tile.id) ? "clf-tile-sel" : ""}`}
                  onClick={() => toggleTile(tile)}
                >
                  <span className="clf-tile-icon">{tile.icon}</span>
                  <span className="clf-tile-lbl">{tile.label}</span>
                </button>
              ))}
            </div>
            <button
              className="clf-next-btn"
              type="button"
              disabled={ticTiles.length === 0}
              onClick={() => setStep(2)}
            >
              Next
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        )}

        {/* Step 2: How strong + urge + hurt */}
        {step === 2 && (
          <div className="clf-body">
            <div>
              <p className="clf-q">How strong was it?</p>
              <p className="clf-hint">Everyone's tics are different — this is just for you</p>
            </div>
            <div className="clf-size-row">
              {SIZE_OPTS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  className={`clf-size-opt ${sizePick?.label === opt.label ? "clf-size-sel" : ""}`}
                  onClick={() => setSizePick(opt)}
                >
                  <svg width={opt.size} height={opt.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r={opt.size / 4}/></svg>
                  <span className="clf-size-lbl">{opt.label}</span>
                  <span className="clf-size-sub">{opt.sub}</span>
                </button>
              ))}
            </div>
            <div className="clf-yn-card">
              <div>
                <p className="clf-yn-q">Did you feel it coming?</p>
                <p className="clf-yn-sub">The "premonitory urge" — HRT</p>
              </div>
              <div className="clf-yn-btns">
                <button type="button" className={`clf-yn-btn ${hadUrge === true ? "clf-yn-yes-sel" : ""}`} onClick={() => setHadUrge(true)}>Yes</button>
                <button type="button" className={`clf-yn-btn ${hadUrge === false ? "clf-yn-no-sel" : ""}`} onClick={() => setHadUrge(false)}>No</button>
              </div>
            </div>
            <div className="clf-yn-card">
              <p className="clf-yn-q">Did it hurt?</p>
              <div className="clf-yn-btns">
                <button type="button" className={`clf-yn-btn ${hurt === true ? "clf-yn-yes-sel" : ""}`} onClick={() => setHurt(true)}>Yes</button>
                <button type="button" className={`clf-yn-btn ${hurt === false ? "clf-yn-no-sel" : ""}`} onClick={() => setHurt(false)}>No</button>
              </div>
            </div>
            <button className="clf-next-btn" type="button" onClick={() => setStep(3)}>
              Next
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <button className="clf-skip" type="button" onClick={() => setStep(3)}>Skip this step →</button>
          </div>
        )}

        {/* Step 3: Context + save */}
        {step === 3 && (
          <div className="clf-body">
            <div>
              <p className="clf-q">What was happening?</p>
              <p className="clf-hint">From your home screen — tap to change</p>
            </div>
            <div className="cv2-chip-grid">
              {["Stressed","School","Tired","Excited","Screens","Bored"].map((label) => (
                <button
                  key={label}
                  type="button"
                  className={`cv2-chip ${contexts.includes(label) ? "cv2-chip-on" : "cv2-chip-off"}`}
                  onClick={() => toggleCtx(label)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="clf-note-wrap">
              <label className="clf-note-label" htmlFor="clf-note">One short note (optional)</label>
              <textarea
                id="clf-note"
                className="clf-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="One word or one sentence is enough."
                rows={2}
              />
            </div>
            <button className="clf-save-btn" type="button" onClick={handleSave}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              Save it
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire ChildLogForm into the formOpen render block**

Find the `{formOpen && (` block around line 652. Wrap it so child mode renders `ChildLogForm` instead of the modal:

```jsx
{formOpen && isChildMode && (
  <ChildLogForm
    defaultContexts={selectedContexts}
    onSave={saveChildLog}
    onClose={() => setFormOpen(false)}
  />
)}
{formOpen && !isChildMode && (
  <div className="modal-backdrop" role="presentation" onMouseDown={() => setFormOpen(false)}>
    {/* existing parent log form — unchanged */}
```

Close with `)}` after the existing closing `</div>` of the modal.

- [ ] **Step 3: Run dev server in child mode, tap "Save a tic", verify 3-step form opens**

Check: Step 1 shows 4 tic tiles. Selecting a tile enables Next. Step 2 shows circles + Yes/No rows. Step 3 shows chips + note + Save.

- [ ] **Step 4: Save a log through the form and verify it appears in Logs view**

- [ ] **Step 5: Commit**
```bash
git add src/main.jsx
git commit -m "feat: add ChildLogForm stepped 3-screen log component"
```

---

## Task 7: CSS for ChildLogForm

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Append ChildLogForm styles**

```css
/* ══════════════════════════════════════
   CHILD LOG FORM — STEPPED OVERLAY
══════════════════════════════════════ */
.clf-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10,30,32,0.55);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0);
}
.clf-sheet {
  width: 100%;
  max-width: 480px;
  background: var(--surface);
  border-radius: 24px 24px 0 0;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}
.clf-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 10px;
  flex-shrink: 0;
}
.clf-back {
  display: flex;
  align-items: center;
  gap: 2px;
  color: var(--teal);
  font-size: 0.8rem;
  font-weight: 800;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.clf-close {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.clf-dots {
  display: flex;
  gap: 5px;
  align-items: center;
}
.clf-dot        { height: 6px; border-radius: 3px; }
.clf-dot-done   { width: 17px; background: var(--teal); }
.clf-dot-active { width: 25px; background: var(--coral); }
.clf-dot-todo   { width: 8px;  background: var(--faint); }

.clf-body {
  flex: 1;
  padding: 4px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
}
.clf-q    { font-size: 1.18rem; font-weight: 900; color: var(--ink); letter-spacing: -0.4px; line-height: 1.22; }
.clf-hint { font-size: 0.74rem; color: var(--muted); font-weight: 500; margin-top: 2px; }

/* Tic tiles */
.clf-tile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  flex: 1;
}
.clf-tile {
  background: #f8fcfb;
  border: 2px solid var(--faint);
  border-radius: 16px;
  padding: 15px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
}
.clf-tile-sel {
  background: var(--teal-soft);
  border-color: var(--teal);
}
.clf-tile-icon {
  width: 44px; height: 44px;
  background: rgba(8,119,125,0.09);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: var(--teal-dark);
}
.clf-tile-sel .clf-tile-icon {
  background: var(--teal);
  color: white;
}
.clf-tile-lbl {
  font-size: 0.76rem;
  font-weight: 800;
  color: var(--ink);
  text-align: center;
  line-height: 1.25;
}

/* Size options */
.clf-size-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.clf-size-opt {
  background: #f8fcfb;
  border: 2px solid var(--faint);
  border-radius: 14px;
  padding: 12px 7px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
}
.clf-size-sel {
  background: var(--teal-soft);
  border-color: var(--teal);
}
.clf-size-opt svg { color: var(--teal-dark); }
.clf-size-lbl { font-size: 0.74rem; font-weight: 800; color: var(--ink); }
.clf-size-sub { font-size: 0.6rem; font-weight: 600; color: var(--muted); }

/* Yes/No cards */
.clf-yn-card {
  background: #f8fcfb;
  border: 1.5px solid var(--faint);
  border-radius: 14px;
  padding: 13px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.clf-yn-q   { font-size: 0.86rem; font-weight: 800; color: var(--ink); }
.clf-yn-sub { font-size: 0.62rem; color: var(--muted); font-weight: 600; margin-top: 2px; }
.clf-yn-btns { display: flex; gap: 7px; }
.clf-yn-btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 9px;
  font-family: inherit;
  font-size: 0.77rem;
  font-weight: 800;
  border: 1.5px solid var(--faint);
  background: white;
  color: var(--ink);
  cursor: pointer;
  transition: background 0.1s;
}
.clf-yn-yes-sel { background: #fff0eb; border-color: rgba(233,111,91,0.4); color: #8c3120; }
.clf-yn-no-sel  { background: var(--teal-soft); border-color: var(--teal); color: var(--teal-dark); }

/* Note */
.clf-note-wrap { display: flex; flex-direction: column; gap: 5px; }
.clf-note-label { font-size: 0.72rem; font-weight: 700; color: var(--muted); }
.clf-note {
  border: 1.5px solid var(--faint);
  border-radius: 10px;
  padding: 9px 11px;
  font-family: inherit;
  font-size: 0.84rem;
  color: var(--ink);
  resize: none;
  background: #f8fcfb;
}
.clf-note:focus { outline: none; border-color: var(--teal); }

/* Buttons */
.clf-next-btn {
  height: 52px;
  border-radius: 14px;
  background: var(--teal);
  color: white;
  border: none;
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 900;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}
.clf-next-btn:disabled { opacity: 0.4; cursor: default; }
.clf-save-btn {
  height: 52px;
  border-radius: 14px;
  background: var(--coral);
  color: white;
  border: none;
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 900;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  box-shadow: 0 6px 18px rgba(233,111,91,0.28);
}
.clf-skip {
  text-align: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--muted);
  cursor: pointer;
  background: none;
  border: none;
  padding: 3px;
  align-self: center;
}
```

- [ ] **Step 2: Verify form looks correct on mobile dimensions**

In browser devtools, set device to iPhone 14 or similar. Check: sheet slides up from bottom, tiles are square, size circles have visual size difference, Yes/No buttons have selected states.

- [ ] **Step 3: Commit**
```bash
git add src/styles.css
git commit -m "feat: add ChildLogForm CSS — tiles, size circles, YN cards, progress dots"
```

---

## Task 8: ChildTipsView component + CSS

**Files:**
- Modify: `src/main.jsx` — insert `ChildTipsView` after `ChildLogForm`
- Modify: `src/styles.css`

- [ ] **Step 1: Add ChildTipsView component**

Insert after the closing `}` of `ChildLogForm`:

```jsx
const TIPS = [
  {
    id: "awareness",
    heading: "Notice the warning feeling",
    approach: "HRT — Awareness Training",
    badgeClass: "ctv-badge-hrt",
    iconClass: "ctv-icon-hrt",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5.636 5.636a9 9 0 1 0 12.728 12.728"/>
        <path d="M16.243 7.757a6 6 0 1 0-8.486 8.486"/>
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>
      </svg>
    ),
    body: "Most tics start with a body sensation — a tingle, pressure, or tightness. This is called a premonitory urge. Learning to spot it is the first step to managing tics.",
    tryText: "Next time, pause and notice — where do you feel it? Your shoulder? Your throat?",
    tryClass: "ctv-try-hrt",
  },
  {
    id: "competing",
    heading: "Try a competing response",
    approach: "HRT — Competing Response",
    badgeClass: "ctv-badge-hrt",
    iconClass: "ctv-icon-hrt",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m17 2 4 4-4 4"/>
        <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
        <path d="m7 22-4-4 4-4"/>
        <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      </svg>
    ),
    body: "When you feel the urge, do something that makes the tic hard to do at the same time. Hold it for about 1 minute, or until the urge fades.",
    tryText: "Shoulder shrug urge? Press your elbows to your sides. Head jerk? Tuck your chin slightly. Eye blink? Slow-blink once, softly.",
    tryClass: "ctv-try-hrt",
  },
  {
    id: "urge-wave",
    heading: "Ride the urge wave",
    approach: "CBT — Exposure & Response Prevention",
    badgeClass: "ctv-badge-cbt",
    iconClass: "ctv-icon-cbt",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
        <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
        <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      </svg>
    ),
    body: "Urges always go away on their own — like waves. You don't have to fight the tic or force it. Just notice the urge and breathe until it fades.",
    tryText: "Breathe slowly and count to 10. Most urges peak within 20–30 seconds and then drop.",
    tryClass: "ctv-try-cbt",
  },
  {
    id: "breathe",
    heading: "Breathe to calm down",
    approach: "CBIT — Relaxation Training",
    badgeClass: "ctv-badge-cbit",
    iconClass: "ctv-icon-cbit",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
        <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      </svg>
    ),
    body: "When you're stressed, tics often get stronger. Slow breathing (4 in, 4 hold, 6 out) activates your parasympathetic nervous system — your body's natural calm-down switch.",
    tryText: "Use the breathing ring on the home screen. Even one full cycle (14 seconds) helps.",
    tryClass: "ctv-try-cbit",
  },
];

function ChildTipsView({ onBack }) {
  return (
    <section className="ctv-view" aria-label="Tips that help">
      <div className="ctv-topbar">
        <button className="ctv-back" type="button" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
        <div className="ctv-title">Tips that help</div>
        <div className="ctv-subtitle">Based on what science says works for tics</div>
      </div>
      <div className="ctv-body">
        {TIPS.map((tip) => (
          <div key={tip.id} className="ctv-card">
            <div className="ctv-card-header">
              <div className={`ctv-icon ${tip.iconClass}`}>{tip.icon}</div>
              <div>
                <div className="ctv-heading">{tip.heading}</div>
                <div className={`ctv-badge ${tip.badgeClass}`}>{tip.approach}</div>
              </div>
            </div>
            <p className="ctv-body-text">{tip.body}</p>
            <div className={`ctv-try ${tip.tryClass}`}>
              <strong>Try:</strong> {tip.tryText}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Append ChildTipsView CSS to styles.css**

```css
/* ══════════════════════════════════════
   CHILD TIPS VIEW
══════════════════════════════════════ */
.ctv-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: linear-gradient(180deg, #f8f5fc 0%, #f2eef9 100%);
}
.ctv-topbar {
  padding: 14px 16px 10px;
  background: rgba(248,245,252,0.9);
  border-bottom: 1px solid rgba(124,92,191,0.1);
  position: sticky;
  top: 0;
  backdrop-filter: blur(12px);
}
.ctv-back {
  display: flex;
  align-items: center;
  gap: 3px;
  color: #7c5cbf;
  font-size: 0.78rem;
  font-weight: 800;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-bottom: 6px;
}
.ctv-title {
  font-size: 1.1rem;
  font-weight: 900;
  color: #3d1d8a;
  letter-spacing: -0.4px;
}
.ctv-subtitle {
  font-size: 0.68rem;
  color: #8b76c0;
  font-weight: 600;
  margin-top: 2px;
}
.ctv-body {
  flex: 1;
  padding: 12px 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ctv-card {
  background: white;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 2px 12px rgba(124,92,191,0.08);
}
.ctv-card-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.ctv-icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.ctv-icon svg { width: 19px; height: 19px; }
.ctv-icon-hrt  { background: #fef3d0; color: #8a5e00; }
.ctv-icon-cbt  { background: #e5f7ef; color: #1e5c3a; }
.ctv-icon-cbit { background: var(--teal-soft); color: var(--teal-dark); }
.ctv-heading {
  font-size: 0.86rem;
  font-weight: 900;
  color: var(--ink);
  line-height: 1.2;
}
.ctv-badge {
  display: inline-block;
  font-size: 0.56rem;
  font-weight: 900;
  border-radius: 4px;
  padding: 1px 5px;
  margin-top: 3px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.ctv-badge-hrt  { background: #fef3d0; color: #7a4e00; }
.ctv-badge-cbt  { background: #e5f7ef; color: #1e5c3a; }
.ctv-badge-cbit { background: var(--teal-soft); color: var(--teal-dark); }
.ctv-body-text {
  font-size: 0.75rem;
  color: var(--muted);
  line-height: 1.55;
  font-weight: 500;
}
.ctv-try {
  border-radius: 8px;
  padding: 8px 11px;
  font-size: 0.71rem;
  line-height: 1.45;
  font-weight: 500;
}
.ctv-try strong { font-weight: 800; }
.ctv-try-hrt  { background: #fef3d0; color: #7a4e00; border-left: 3px solid #dba437; }
.ctv-try-cbt  { background: #e5f7ef; color: #1e5c3a; border-left: 3px solid #4aaf83; }
.ctv-try-cbit { background: var(--teal-soft); color: var(--teal-dark); border-left: 3px solid var(--teal); }
```

- [ ] **Step 3: Run dev server, tap Access Tips card on home, verify tips screen appears**

Expected: purple header, 4 tip cards (HRT/HRT/CBT/CBIT), Back button returns to home.

- [ ] **Step 4: Commit**
```bash
git add src/main.jsx src/styles.css
git commit -m "feat: add ChildTipsView with CBIT/HRT/CBT tip cards"
```

---

## Task 9: Final verification and production build

- [ ] **Step 1: Run through the full child mode flow**

1. Switch app to child mode
2. Home: breathing ring shows Inhale/Hold/Exhale legend; chips are 3×2 grid; coral CTA is visible; bottom nav has 3 items
3. Tap "Start 4-4-6 breathing" — ring animates
4. Tap a chip — it turns teal
5. Tap "Access tips" — tips screen shows all 4 cards with approach badges and Try boxes
6. Tap Back — returns to home
7. Tap "Save a tic" — ChildLogForm opens as bottom sheet
8. Step 1: select a tile — Next enables; tap Next
9. Step 2: select size circle; tap Yes on urge; tap No on hurt; tap Next
10. Step 3: chips pre-populated; tap Save → redirects to Logs

- [ ] **Step 2: Check parent mode is untouched**

Switch back to parent mode. Verify: sidebar shows, all 4 action cards visible, log modal works, trends/care tools/settings accessible.

- [ ] **Step 3: Build and check for errors**
```bash
npm run build
```
Expected: `✓ built in` — no TypeScript or build errors.

- [ ] **Step 4: Final commit**
```bash
git add src/main.jsx src/styles.css
git commit -m "feat: complete ADHD/tic child mode redesign

- Single-column layout, max 480px, bottom nav fixed
- Breathing ring hero with CBIT Relaxation badge and 4-4-6 legend
- Access Tips card → ChildTipsView (HRT awareness, HRT competing response, CBT ERP, CBIT relaxation)
- Context chips 3x2 grid (Stressed/School/Tired/Excited/Screens/Bored)
- ChildLogForm stepped 3-screen: tic type tiles, size + urge + hurt, context + note
- saveChildLog stores hadUrge field alongside existing log schema
- Parent mode unchanged"
```
