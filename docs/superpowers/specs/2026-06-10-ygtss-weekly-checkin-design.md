# TicTide — YGTSS Weekly Check-In

**Date:** 2026-06-10  
**Status:** Approved  
**Scope:** Parent mode only — new weekly YGTSS check-in flow + history

---

## Context

TicTide currently stores a single YGTSS snapshot as a flat object (`tictide.ygtss.v1`). There is no history, no weekly rhythm, and no prompt to fill it in. This feature replaces that with:

1. A weekly nudge banner on parent home
2. A 3-screen stepped check-in form
3. An array of timestamped weekly snapshots
4. A YGTSS history section in Care Tools

The YGTSS (Yale Global Tic Severity Scale) is the standard clinical measure used by neurologists and therapists to track tic severity over time. Parents complete it weekly; clinicians use the trend at appointments.

---

## Evidence Base

| Dimension | Scope | Scale |
|---|---|---|
| Number | How many distinct tics | 0–5 |
| Frequency | How often tics occur | 0–5 |
| Intensity | Force / noisiness | 0–5 |
| Complexity | Simple vs. elaborate | 0–5 |
| Interference | Disruption to activity | 0–5 |

Rated separately for **motor** and **vocal** tics. Plus one **Impairment** scale (0–5, maps to 0/10/20/30/40/50 in standard scoring).

**Scoring:**
- Motor Score = sum of 5 motor dimensions (0–25)
- Vocal Score = sum of 5 vocal dimensions (0–25)
- Total Tic Score (TTS) = Motor + Vocal (0–50)
- Impairment shown as label: None / Minimal / Mild / Moderate / Severe / Extreme

---

## Data Model

`tictide.ygtss.v1` changes from a single object to an array of weekly snapshots:

```js
[
  {
    weekOf: "2026-06-09",           // ISO date of Monday for that week
    completedAt: "2026-06-09T...",  // ISO timestamp when saved
    motor: {
      number: 0,      // 0–5
      frequency: 0,
      intensity: 0,
      complexity: 0,
      interference: 0,
    },
    vocal: {
      number: 0,
      frequency: 0,
      intensity: 0,
      complexity: 0,
      interference: 0,
    },
    impairment: 0,    // 0–5 (maps to 0,10,20,30,40,50 for display)
    weekNote: "",
  }
]
```

**Migration on load:** If `tictide.ygtss.v1` is a plain object (not an array), wrap it:
```js
const weekOf = getMondayISO(new Date());
data = [{ weekOf, completedAt: new Date().toISOString(), ...existing }];
```

**Week detection:** `getMondayISO(date)` — returns the ISO date string of the Monday on or before `date`.

---

## Design Decisions

### 1. Home Banner

A small teal card on parent home. Appears when no snapshot exists with `weekOf` matching the current week's Monday. Disappears once the week is saved. If dismissed (X button) without saving, reappears on next app open (no persistence for dismissal).

**Contents:**
- Heading: "Rate this week's tics"
- Subtitle: "Jun 9 – 15 · YGTSS"
- CTA button: "Start check-in →"
- X dismiss button (top-right)

**Why:** A persistent but non-blocking nudge. Weekly rhythm matches how neurologists use YGTSS data.

### 2. 3-Screen Check-In Form (Option B)

Stepped modal overlay, same design language as `ChildLogForm`. Progress dots (3). Back works on all screens.

**Screen 1 — Motor tics:**
- Heading: "Motor tics this week"
- Science badge: "YGTSS"
- "No motor tics this week" toggle — if on, all motor values = 0 and screen auto-advances
- 5 rows: Number · Frequency · Intensity · Complexity · Interference
- Each row: label + brief descriptor + 6 tap targets (0–5), selected = teal fill
- "Next →" button (always enabled — defaults are 0)

**Screen 2 — Vocal tics:**
- Same layout as Screen 1
- "No vocal tics this week" toggle

**Screen 3 — Impairment + note:**
- Heading: "Overall impact"
- Impairment scale: 6 tap targets labeled None / Minimal / Mild / Moderate / Severe / Extreme (values 0–5)
- Optional text area: "Week notes (optional)" — pre-filled from prior week's note as placeholder
- "Save" button (coral, 54px) — saves snapshot and closes modal
- Computed scores shown above Save: "Motor: X/25 · Vocal: X/25 · Total: X/50"

### 3. Care Tools — YGTSS History Section

New section at bottom of Care Tools view. Always visible (no history = empty state).

**List:** Most recent first. Each row:
- Week range (e.g. "Jun 9 – 15")
- TTS badge (e.g. "TTS 18/50")
- Impairment label (e.g. "Mild")
- Chevron → expands inline to show all 11 dimensions

**Empty state:** "No YGTSS entries yet. Complete this week's check-in from the home screen."

**Current week row:** If this week's entry exists, shows a green "✓ This week" badge.

### 4. Dimension Row Component

Reusable pattern used on Screens 1 and 2:

```
Number          How many different tics
[ 0 ][ 1 ][ 2 ][ 3 ][ 4 ][ 5 ]
```

- Label bold, descriptor muted, on one line
- 6 pill buttons below, teal-filled when selected
- Default value: 0 (first pill pre-selected)

### 5. Visual Tokens

Inherits existing tokens. No new tokens needed:
- Selected pill: `--teal` fill, white text
- Unselected pill: white fill, `--muted` text, faint border
- Banner: `--teal-soft` background, `--teal` border-left accent
- Save button: `--coral`
- YGTSS badge: same style as CBIT badge (teal outline)

---

## Files to Change

| File | Change |
|---|---|
| `src/main.jsx` | Add `getMondayISO`, migrate YGTSS on load, add `YgtssCheckinModal` (3-screen), add `YgtssBanner` component, wire banner to parent home, add YGTSS history section to Care Tools |
| `src/styles.css` | Banner styles, check-in modal styles (reuse clf- patterns where possible), history list styles |

---

## Out of Scope

- Child mode (check-in is parent-only)
- Clinician export / PDF report
- Push notification for Monday reminder
- Cloud sync schema changes

---

## Open Questions

None — all decisions made.
