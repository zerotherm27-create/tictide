# TicTide — ADHD/Tic-Aligned Child Mode Redesign

**Date:** 2026-06-09  
**Status:** Approved  
**Scope:** Child mode UI only (parent mode unchanged)

---

## Context

TicTide is a tic-disorder tracking and management app for children with Tourette's, chronic tic disorder, or provisional tic disorder. The current child mode uses a desktop-style two-column layout with a sidebar, a small breathing ring, and an all-fields-at-once log form — all inappropriate for:

- Children aged 8–14 with ADHD comorbidity (~60% of tic disorder cases)
- Small phones (the primary device for this age group)
- Moments of distress (tic episode or post-tic anxiety)

This redesign replaces child mode with a single-column, evidence-aligned interface.

---

## Evidence Base

All design decisions are grounded in three validated treatment protocols:

| Protocol | What it is | How it maps to the UI |
|---|---|---|
| **CBIT** (Comprehensive Behavioral Intervention for Tics) | Gold-standard behavioural treatment for tics (Woods et al., 2008) | Breathing ring (relaxation component), trigger chip log (functional assessment component) |
| **HRT** (Habit Reversal Training) | Core component of CBIT: awareness training + competing response | "Did you feel it coming?" question builds awareness; Access Tips card teaches competing response |
| **CBT** (Cognitive Behavioral Therapy) | Psychoeducation, ERP, cognitive restructuring | Access Tips cards: urge surfing (ERP), normalising tics (psychoeducation) |

---

## Design Decisions

### 1. Layout — Single column, max-width 480px

Child mode forces a phone-width single-column layout regardless of device. The sidebar is hidden. No multi-column grids. Centered on desktop.

**Why:** Two-column layouts split visual attention. A child in distress needs one clear next action, not navigation choices.

### 2. Breathing Ring — Hero element

The breathing ring is the first thing a child sees on Home. It occupies the top card, always visible, with:
- **148px ring** using conic-gradient: teal (inhale 4s) → gold (hold 4s) → coral (exhale 6s)
- Phase label, countdown number, and prompt text in the center
- "CBIT Relaxation" science badge in the corner
- "Start 4-4-6 breathing" button with play icon

**Why:** The 4-4-6 breathing pattern (extended exhale) activates the parasympathetic nervous system, directly reducing tic frequency. Making it the hero prioritises the highest-impact calming tool.

### 3. Context Chips — 3×2 grid, 6 options

Below the breathing ring, a chip grid lets the child tag what's happening right now. Chips auto-log alongside any saved tic.

**Grid (2 rows of 3):**
- Row 1: Stressed · School · Tired
- Row 2: Excited · Screens · Bored

Selected state: teal fill. Default: white with faint border. Pre-select "Stressed" as the most common context.

**Why:** CBIT functional assessment maps antecedents — situations that worsen tics. These six cover the primary antecedent categories identified in clinical literature (stress, setting, fatigue, emotional arousal, screen exposure, boredom). Exactly 6 in a balanced grid avoids the choice paralysis common in ADHD.

### 4. Access Tips Card

A purple card between the breathing ring and context chips leads to the tips screen. Badges show CBIT · HRT · CBT.

**Why:** Psychoeducation is a CBT core component. The card is persistent (always reachable from Home, one tap) so children can read tips between episodes, not only during them.

### 5. "Save a Tic" CTA

Coral button (54px height, high contrast) below the context chips. Launches the stepped log form.

**Why:** Coral stands out against the teal-dominant palette. Placing it below chips means context is tagged before logging — matching the CBIT functional assessment flow (antecedent → behaviour).

### 6. Stepped Log Form — 3 screens

Replaces the current single all-fields form. One question per screen with a progress dot indicator.

**Step 1 — What kind of tic?**  
Four tiles in a 2×2 grid with representative SVG icons (stroke-width 2.5). **Multi-select** — the child can tap any combination of tiles before tapping "Next →". At least one tile must be selected to proceed. Selected tiles show teal fill + white icon + teal border; unselected show white bg + teal icon + faint border.

| Tile | Icon | Tic types covered |
|---|---|---|
| Arms or legs | Stick figure with outstretched arms | Limb jerking, shoulder shrug, arm flapping |
| Face or eyes | Eye with radiating lash lines | Eye blinking, facial grimacing, nose scrunching |
| Sound or voice | Mic with bracket arc | Throat clearing, sniffing, grunting, echolalia |
| Head or neck | Head circle + neck lines + rotation arcs | Head jerking, neck stretching, head shaking |

The saved log stores `ticType` as an array (e.g. `["arms-legs", "sound-voice"]`). A "Next →" button (disabled until ≥1 tile selected) replaces auto-advance.

**Step 2 — How strong + Did you feel it coming?**  
- Three size circles (small/medium/large, visually scaled): "barely there / noticeable / hard to hide"
- "Did you feel it coming?" (Yes/No) — labeled "premonitory urge — HRT" to build awareness training over time
- "Did it hurt?" (Yes/No) — clinical safety signal
- Skip link — keeps the form low-pressure

**Step 3** (not mocked — minimal): What was happening? Pre-fills from context chips. Done button saves the entry.

### 7. Access Tips Screen

Four cards (3 visible, 1 scrolled):

| Card | Approach | Key concept |
|---|---|---|
| Notice the warning feeling | HRT — Awareness Training | Premonitory urge; where do you feel it? |
| Try a competing response | HRT — Competing Response | Replace the tic movement for 1 minute |
| Ride the urge wave | CBT — ERP | Urges peak and fade; count to 10 |
| *(scrolled)* Breathe to calm down | CBIT Relaxation | 4-4-6 activates parasympathetic response |

Each card has: approach badge, plain-language body, and a **"Try:"** action box with a concrete child-friendly instruction.

### 8. Bottom Nav — 3 items

Home · My Logs · Journal. SVG icons at 20px, stroke-width 2.5. Active state: teal-soft background.

Help moved to the "?" accessible from parent pill. No fourth item — keeps nav scannable.

### 9. Visual tokens

| Token | Value | Usage |
|---|---|---|
| `--teal` | `#08777d` | Primary, ring inhale, selected state |
| `--teal-dark` | `#065f62` | Text, nav active, ring center |
| `--teal-soft` | `#dff5f3` | Selected chip bg, nav active bg |
| `--coral` | `#e96f5b` | Ring exhale, log CTA, active progress dot |
| `--gold` | `#dba437` | Ring hold |
| `--purple` | `#7c5cbf` | Tips card accent |
| Font | Inter 400–900 | All text |
| Icons | Lucide SVG, stroke-width 2.5 | No emojis |

---

## Out of Scope

- Parent mode UI (unchanged)
- Cloud sync / Supabase schema (unchanged)
- Push notifications
- Therapist/clinician portal

---

## Files to Change

| File | Change |
|---|---|
| `src/main.jsx` | Rewrite `ChildHomeView`, add `ChildLogForm` stepped component, add `ChildTipsView`, update `ChildUnlockView` |
| `src/styles.css` | Add child-mode layout, chip grid, log tiles, tips cards, stepped form progress dots |

---

## Open Questions

None — all design decisions approved.
