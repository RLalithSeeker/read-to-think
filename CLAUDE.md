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
- **Expanded landing** — How it works / Two ways in / Features grid / "What this is not" / final CTA + footer. Theme tokens reused, hero+cards+quote untouched.
- **Mobile** — header was overflowing (521>390); fixed: tab labels collapse to icons + progress bar hidden below sm. Verified clean at 390px across all screens.

Groq default model `llama-3.3-70b-versatile` verified live on Groq /models (2026-06-08).

## Read mode — book library (Phase 1+2, 2026-06-20)
New third mode tab **Read** (`mode === "read"`). Local-first, zero new deps.
- `lib/idb.js` — zero-dep IndexedDB (`rt_library` db, stores `books` + `marks`). Book text too big for localStorage. NO Dexie. Convex sync deferred to Phase 3.
- `lib/reader.js` — REACTIONS taxonomy (`? ! ✗ ↔ ★`), `toBlocks` paragraph splitter, `guessTitle`.
- `components/Library.jsx` — shelf: add book (paste or .txt/.md FileReader upload), list, open, delete. EPUB/PDF parsing NOT done (needs epubjs/pdf.js).
- `components/Reader.jsx` — paginated reader; **react-don't-highlight** (mark MUST carry a reaction, prompt reactions force a note = anti-fluency-illusion); **recall-gate** on return (reopen → "why did you mark this, from memory" before page); scroll-position persistence (debounced → book.pos); session timer; marks drawer; "Think on this" → Deep Read.
- `components/ReaderAI.jsx` — **Phase 2**, passage-scoped bottom-sheet. Socratic (stream) + Quiz-me (recall test). BYO key, browser-direct (§9.9). 3 system prompts (SOCRATIC/QGEN/JUDGE) hard-ban summary. Quiz fuses LLM judge (`VERDICT: OWN WORDS|PARTLY PARROTED|PARROTED`) + local `fluency.js` borrowed-word chips. AI only ever sees a selection or viewport passage (≤1800 chars), NEVER `book.text`.
- Wiring: `page.jsx` new `read` mode + Reader→DeepRead `seed` bridge; `Header.jsx` Read tab; `DeepRead.jsx` `seed`/`seedKey` props; `NotesSidebar.jsx` "Reading" badge (note type `read`).
- Gotcha: fallow flags `idb.js`/`reader.js` (+ existing providers/links/srs) as "100% dead" while listing real importers — it misresolves the `@/` alias. Do NOT run `fallow fix --yes` here; it would delete used exports and break the build.
- PENDING before deploy: 390px puppeteer verify (owner gate, not yet run).

## Not built yet (spec §10 roadmap)
Phase 3 = Convex sync (cross-device books/marks) + syntopical multi-book + chapter tracking.
Books/marks are LOCAL (IndexedDB) until then. Wire Convex only at Phase 3.

## Testing note
No automated suite yet. Verify logic with a throwaway `node _x.mjs` importing `lib/*`,
and UI via headless Chrome through the puppeteer MCP (executablePath to system Chrome).
Watch for: side effects inside React state updaters (StrictMode double-invokes — caused a
duplicate-note bug, fixed in DeepRead saveNC).

## Push
`./push.ps1 -Message "..." -Remote <github-url>` — held until explicitly run.
