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

## Shipped beyond the original
- Provider picker (OpenAI / Groq free / Custom).
- **Chat demo** — "See how it works" loads a canned Socratic exchange, no API key needed (`DEMO_CONV` in `components/Chat.jsx`).
- **Notes export** — `.md` and `.json` download from the notes sidebar.

## Not built yet (spec §10 roadmap — needs Convex)
Zettelkasten note-linking · book DB · chapter tracking · multi-book chat · Obsidian-flavored export
· fluency-illusion detection · spaced repetition · syntopical mode.

## Push
`./push.ps1 -Message "..." -Remote <github-url>` — held until explicitly run.
