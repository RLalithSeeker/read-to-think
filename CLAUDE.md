# Read to Think — Project Log

## What this is
Next.js port of the single-file `readtothink.html` prototype. Design is **locked** — theme,
colors, fonts, animations copied 1:1. Only ADD features; never alter the look.

## Decisions (2026-06-08)
- **Stack**: Next.js (App Router, JSX — no TS) + Tailwind v3. Convex deferred until §10 features.
- **Notes**: localStorage now (`rt_notes`), same keys as original. Convex later for linking/spaced-rep/sync.
- **AI**: browser-direct streaming, BYO key. NO server proxy — preserves spec §9.9 (key never leaves browser except to provider).
- **Providers (NEW)**: picker for OpenAI / Groq (free) / Custom. Presets base URL + model. `lib/providers.js`.

## Source of truth
- Design + behavior: `C:\Users\starl\Downloads\BOOK\readtothink.html`
- Spec: `C:\Users\starl\Downloads\BOOK\spec.md`

## File map
- `app/layout.jsx` — fonts (Lora + DM Sans), Font Awesome, glow orbs.
- `app/globals.css` — original `<style>` block 1:1 + Tailwind directives.
- `tailwind.config.js` — color tokens + fonts (locked).
- `lib/providers.js` — OpenAI/Groq/Custom presets.
- `lib/deepread.js` — demo claims, `extCl` claim extraction, `cSP` system prompt.
- `lib/format.js` — `E`/`F` (escape + markdown-lite for chat bubbles).
- `lib/store.jsx` — AppProvider: cfg/settings, notes (localStorage), toast.
- `components/` — Landing, Header, DeepRead, Chat, NotesSidebar, SettingsModal, Toaster.
- `app/page.jsx` — orchestrator: view (landing/app), mode (deepread/chat), drS state.

## Live
Vercel prod: https://read-to-think-sage.vercel.app · deploy via `vercel --prod` (project `read-to-think`).

## Shipped beyond the original
- Provider picker (OpenAI / Groq free / Custom).
- **Chat demo** — "See how it works" loads a canned Socratic exchange, no API key needed (`DEMO_CONV` in `components/Chat.jsx`).
- **Notes export** — `.md` (Obsidian-flavored `[[links]]`) and `.json` from the notes sidebar.
- **Spaced repetition** — `lib/srs.js` (SM-2 lite, `rt_srs`); recall-first ReviewModal, header due badge.
- **Zettel note-linking** — `lib/links.js` (symmetric, `rt_links`); link button + picker + chips in sidebar.
- **Fluency-illusion detection** — `lib/fluency.js`; live word-overlap heuristic under the atomic note (good/caution/warn + borrowed words) plus optional "Check deeper with AI" (BYO key, non-streaming).

## Not built yet (spec §10 roadmap — need Convex)
book DB · chapter tracking · multi-book chat · syntopical mode.
Wire Convex when starting these (server data / multi-user).

## Testing note
No automated suite yet. Verify logic with a throwaway `node _x.mjs` importing `lib/*`,
and UI via headless Chrome through the puppeteer MCP (executablePath to system Chrome).
Watch for: side effects inside React state updaters (StrictMode double-invokes — caused a
duplicate-note bug, fixed in DeepRead saveNC).

## Push
`./push.ps1 -Message "..." -Remote <github-url>` — held until explicitly run.
