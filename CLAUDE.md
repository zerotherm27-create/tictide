# TicTide — Project Context for Claude

## What this is
A PWA for tracking and managing tic disorders (Tourette's, chronic/provisional tic disorder) in children aged 8–14. Built for parents and children. All design decisions are grounded in CBIT, HRT, and CBT clinical evidence.

## Architecture
- **Single-file React app**: all components live in `src/main.jsx` (~3300+ lines)
- **Single CSS file**: `src/styles.css` (~2050+ lines)
- **Vite build**, React 19, no test suite — `npm run build` is the verification step
- **LocalStorage** via `useStoredState` hook — key constants in `STORAGE` object at top of main.jsx
- **Supabase** for optional cloud sync (family accounts) — configured via `.env.local`
- **Lucide React icons** — ESM imports only: `import X from "lucide-react/dist/esm/icons/x.js"`
- No emojis anywhere in the UI

## Two modes
- **Parent mode** (default): full app — logs, journals, Care Tools (YGTSS, PUTS, report), trends, account sync
- **Child mode**: single-column phone-first UI, breathing ring hero, stepped log form, tips, no sidebar

## CSS tokens
```
--teal: #08777d       (primary, ring inhale, selected)
--teal-dark: #065f62  (text, nav active, ring center)
--teal-soft: #dff5f3  (selected chip bg, banner bg)
--coral: #e96f5b      (ring exhale, log CTA, save buttons)
--gold: #dba437       (ring hold)
--purple: #7c5cbf     (tips card accent)
--surface, --ink, --muted, --faint
```
Font: Inter 400–900 only.

## Key data model (localStorage)
```js
STORAGE = {
  logs: "tictide.logs.v2",       // array of tic log entries
  journals: "tictide.journals.v1",
  ygtss: "tictide.ygtss.v1",     // array of weekly snapshots (newest first)
  puts: "tictide.puts.v1",
  meds: "tictide.meds.v1",
  profile: "tictide.profile.v1",
  redFlags: "tictide.redflags.v1",
  access: "tictide.access.v1",
  appMode: "tictide.appMode.v1",
}
```

### YGTSS snapshot shape
```js
{
  weekOf: "YYYY-MM-DD",        // Monday of the week (getMondayISO)
  completedAt: "ISO string",
  motor: { number, frequency, intensity, complexity, interference }, // each 0–5
  vocal: { number, frequency, intensity, complexity, interference },
  impairment: 0–50,            // step 10 — NOT 0–5
  weekNote: "",
}
```

## Deployment
- GitHub: `github.com/zerotherm27-create/tictide`
- Vercel project: `tictide` (team `team_I6jgfHPrez0G1ZvYMOkNQhRn`, project `prj_ohFbdwYpxz8Su2KtlNFbQP18uhPR`)
- Production URL: `https://tictide.vercel.app`
- **GitHub auto-deploy is broken** — always deploy manually: `vercel deploy --prod` from project root
- Supabase project ID: `xtxspgoltlbiqpyanoyw`

## Known issues
- **Password reset email links to localhost** in production — Supabase dashboard fix needed: Auth → URL Configuration → Site URL = `https://tictide.vercel.app`, add Redirect URL `https://tictide.vercel.app/**`

## Docs
- Specs: `docs/superpowers/specs/`
- Plans: `docs/superpowers/plans/`

## Conventions
- Child mode CSS classes prefixed: `.cv2-` (home), `.clf-` (log form), `.ctv-` (tips view)
- YGTSS modal CSS: `.ycm-*`; history panel: `.yh-*`; banner: `.ygtss-banner*`
- New CSS goes before `@media (prefers-reduced-motion: reduce)` at end of styles.css
- Components added in-file after their nearest related component
- `saveChildLog(data)` — child-mode log helper in App; `handleSaveYgtss(snapshot)` — YGTSS save
