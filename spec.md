1. Project Identity
What it is: A reading companion tool with two modes — a structured "Deep Read" workflow and an AI-powered "Socratic Companion" chat. It is explicitly designed to NEVER summarize books. Every design choice serves the philosophy that reading should change your thinking, not transfer information.

What it is NOT: A book summarizer, a tutor, a search engine, a note-taking app, a highlighter tool.

Single-file architecture: Everything lives in one .html file — HTML, CSS, JavaScript, no build step, no external dependencies except CDNs (Tailwind CSS, Google Fonts, Font Awesome).

2. Theoretical Foundation
The entire system is built on three sources. Any AI behavior, UI pattern, or workflow should be traceable back to one of these:

Mortimer Adler — "How to Read a Book"
Four levels of reading: elementary, inspectional, analytical, syntopical
The highest level asks: "What does this book do to what I already believe?" — NOT "What does this book say?"
Reading is a conversation between reader and author. If you only listen, you're not having a conversation.
A book succeeds only when it creates friction with your existing mental models.
Niklas Luhmann — Zettelkasten Method
One idea per note, always in your own words
Notes must be standalone — understandable without the original source
Notes must be linked to other notes (this creates emergent thinking)
The system's value is NOT retrieval — it's the thinking that writing each note requires
A summary ends conversation. A note in your own words starts one.
Rozenblit & Keil (Yale) — Illusion of Fluency
People consistently overestimate how well they understand complex phenomena
Re-reading and highlighting create RECOGNITION, not RECONSTRUCTION
You can recognize an idea when you see it again without being able to explain it from scratch
This false confidence is the single biggest enemy of genuine learning
"Desirable difficulties" in learning — friction is the point, not a bug
Pashler & Willingham — Learning Styles Myth
The "visual/auditory/kinesthetic" learning styles model has no empirical support
This is referenced to explain why the tool doesn't offer different "modes" based on learning style
3. Architecture Overview
Landing Page
├── Hero (title, subtitle, CTAs)
├── Philosophy Cards (3 cards explaining the theory)
├── Adler Quote
└── Entry Points:
├── "Try the Demo" → App → Deep Read → claims step (with demo data)
├── "Paste Your Text" → App → Deep Read → input step
└── "AI Companion" → App → Chat mode

App Shell (shown after clicking any entry point)
├── Header
│ ├── Back button (→ Landing)
│ ├── Mode Tabs: [Deep Read] [AI Companion]
│ ├── DR Progress bar (only visible during think step)
│ ├── Notes button (→ sidebar)
│ └── Settings button (→ modal)
│
├── Deep Read Mode
│ ├── Step: Input (paste text, extract claims)
│ ├── Step: Claims (overview of extracted claims)
│ ├── Step: Think (per-claim: reflect → reveal → stance → atomic note)
│ └── Step: Collection (grid of saved atomic notes)
│
└── Chat Mode
├── Book input field
├── Chat area (welcome state / messages)
├── Quick action chips (context-aware)
└── Input area with send button

Shared:
├── Settings Modal (API key, base URL, model)
├── Notes Sidebar (shared between both modes, with type badges)
└── Toast notifications


---

## 4. Navigation System

### Global functions:
- `goHome()` — hides `#pgA`, shows `#pgL`
- `openApp(mode, step)` — hides `#pgL`, shows `#pgA`, calls `setMode()`
- `setMode(mode, step)` — toggles tab active states, shows/hides `#mDR` and `#mCH`, calls `drGo()` if deepread with step
- `drBack()` — goes to previous DR step or landing

### Element IDs:
- `#pgL` — Landing page section
- `#pgA` — App shell section (starts hidden)
- `#tD` — Deep Read tab button
- `#tC` — Chat tab button
- `#mDR` — Deep Read mode container
- `#mCH` — Chat mode container
- `#dPW`, `#dPB`, `#dPT`, `#dPD` — DR progress bar elements

---

## 5. Deep Read Mode — Complete Workflow

### 5.1 State Object (`drS`)
drS = {
step: "input" | "claims" | "think" | "collect",
claims: [{ id, text, reasoning, fq }],
idx: number, // current claim index in think step
notes: [{ id, ci, claim, note, st }],
ref: {}, // idx → reflection text
st: {}, // idx → stance number (0-100)
stx: {}, // idx → stance explanation text
an: {}, // idx → atomic note text
rev: {}, // idx → boolean, has reasoning been revealed
title: string
}

### 5.2 Step: Input
- User pastes text into `#uT` textarea
- Character count shown in `#cCt`
- "Extract Claims" button (`#pBt`) disabled until 100+ characters
- `procText()` calls `extCl()` which uses heuristic sentence scoring:
  - Signal words: argues, asserts, suggests, therefore, because, however, fundamental, crucial, etc.
  - Sentence length scoring (10-40 words ideal)
  - Question penalty, comma/semicolon bonus
  - Takes top 6, generates context from surrounding text as "reasoning"

### 5.3 Step: Claims
- `rendCl()` renders `#cLs` — list of claim rows with check marks for completed ones
- "Begin Thinking" button calls `beginThink()` which finds first uncompleted claim

### 5.4 Step: Think (core of the entire product)
This is the most important step. For each claim, the user goes through THREE phases in strict order:

**Phase 1 — Think First (`#rI` textarea)**
- User writes what THEY believe BEFORE seeing the author's reasoning
- The "Reveal Author's Reasoning" button (`#rB`) is available but `revR()` enforces minimum 10 characters
- This is the Adler principle: bring your existing knowledge to the text first
- Auto-saves to `drS.ref[idx]` on every input event

**Phase 2 — Reveal & Stance** (unlocking `#rBl`, `#sSc`)
- `revR(idx)` reveals the reasoning box with CSS transition
- Enables the stance section (`#sSc`) which was opacity-30/pointer-events-none
- Slider `#sSl` (0-100) with label that updates dynamically
- Textarea `#sTx` for stance explanation
- Auto-saves to `drS.st[idx]` and `drS.stx[idx]`

**Phase 3 — Atomic Note (`#nSc`)**
- Also unlocked after reveal
- Textarea `#nI` with specific prompt: "one insight in your own words, not a summary"
- This is the Luhmann principle: forced articulation in your own words
- Auto-saves to `drS.an[idx]`

**"Save Note & Continue" button (`saveNC(idx)`)**
- Validates atomic note is not empty
- Creates note in `drS.notes` array
- Also pushes to shared `allNotes` array (type: "dr") for the notes sidebar
- Advances to next claim or goes to collection

### 5.5 Step: Collection
- `rendCo()` renders `#cGr` — grid of note cards
- Each card shows: note number, stance word with color, the atomic note text, and the original claim as a faded reference
- Stance colors: <25 terra, <40 terra/70, <60 muted, <75 sage/70, ≥75 sage

### 5.6 Demo Data
6 hardcoded claims about reading philosophy, each with:
- `text`: the claim itself
- `reasoning`: 2-3 sentences explaining the author's argument
- `fq`: a follow-up question to push thinking deeper

---

## 6. Chat Mode — Complete Workflow

### 6.1 State
cMsgs = [{ role, content, id }] // conversation history
cStr = boolean // currently streaming
cCtrl = AbortController | null // for stop button
cBk = string // current book name

### 6.2 System Prompt (`cSP()`)
This is the ENTIRE product for chat mode. The system prompt encodes:
- Identity: Socratic reading companion, NOT a summarizer
- 6 absolute rules (never summarize, Socratic questioning, no false encouragement, etc.)
- When user shares learnings: 5 specific behaviors (check alignment, detect fluency illusion, find missed concepts, test reconstruction ability, never confirm easily)
- When suggesting books: recommend for FRICTION, not confirmation
- When helping with atomic notes: one idea, own words, what CHANGED not what author said
- Dynamic book context injection: if `cBk` is set, includes "CURRENT BOOK: {name}"

### 6.3 Context-Aware Quick Actions (`gQA()`)
Returns different action chips based on state:
- **No book, no messages**: "Help me choose a book", "I know what I'm reading" (focus)
- **No book, has messages**: "Suggest a book"
- **Has book, user just shared 80+ chars**: "What did I miss?", "Did I understand correctly?", "Write an atomic note"
- **Has book, no recent share**: "I just finished a chapter" (focus), "What should I focus on?", "Am I reading this right?"

### 6.4 Streaming
- Uses `fetch` with `stream: true` to OpenAI-compatible endpoint
- Parses `data: ` lines, accumulates delta content
- Updates innerHTML of `.cmsg` div in real-time
- Stop button aborts via `AbortController`
- Error handling: shows inline error with "Open Settings" link for auth errors

### 6.5 Message Rendering (`rendCM()`)
- User messages: right-aligned, amber tint background, rounded with bottom-right flat
- AI messages: left-aligned, brain icon avatar, left amber border, `.cmsg` class for formatted text
- Loading state: three pulsing dots
- After complete: adds copy/save action buttons (`.mha` class, shown on `.mw` hover)

---

## 7. Shared Components

### 7.1 Notes System
- `allNotes[]` — shared between Deep Read and Chat
- Each note: `{ content, book, ts, type: "dr"|"chat", mid? }`
- Persisted in `localStorage` as `rt_notes`
- Sidebar (`#nPn`) with slide animation
- Badge count on bookmark icon
- Type badges: "Deep Read" (amber) or "Chat" (sage)
- Delete individual notes, clear all

### 7.2 Settings Modal
- `#setMod` with `#setBox` for animated open/close
- Fields: API Key (password with toggle), Base URL, Model
- Persisted in `localStorage` as `rt_k`, `rt_u`, `rt_m`
- Defaults: key=empty, url=`https://api.openai.com/v1`, model=`gpt-4o-mini`
- Auto-opens on first visit if no key stored
- Works with any OpenAI-compatible API (Groq, Together, OpenRouter, local LLMs)

### 7.3 Toast Notifications
- Fixed bottom-center, auto-dismiss after 2.6s
- Accent-colored info icon
- Used for: settings saved, notes cleared, validation errors, copy confirmation

---

## 8. Design System

### Color Palette (warm, intellectual, non-generic)
| Token | Hex | Usage |
|-------|-----|-------|
| bg | #0F0F0E | Page background |
| card | #1A1A18 | Cards, panels |
| fg | #E8E2D6 | Primary text (warm cream) |
| muted | #9B9485 | Secondary text |
| accent | #C8965A | Primary action (warm amber/copper) |
| sage | #7B9A6B | Agree/positive (muted green) |
| terra | #B07060 | Disagree/negative (muted terracotta) |
| bdr | #2A2A26 | Borders |

### Typography
- Headings: Lora (serif) — intellectual, literary feel
- Body: DM Sans (sans-serif) — clean, modern
- This combination deliberately avoids Inter/Roboto/system-ui to feel distinct

### Visual Principles
- Dark theme with warm undertones (not cold blue-black)
- Subtle glow orbs in background for atmosphere
- Animations: gentle fade-up (0.5s), not bouncy or flashy
- The feel should be: "a quiet room with a good lamp and a difficult book"

---

## 9. Key Design Decisions & Why

1. **Single file** — Zero friction to try. No install, no server, no build. Share one file.

2. **No summary anywhere** — There is no UI path that produces a summary. The demo doesn't summarize. The chat refuses to summarize. This is enforced structurally, not just rhetorically.

3. **Think-first ordering in Deep Read** — User must write their belief BEFORE seeing the author's reasoning. The reveal button enforces minimum 10 characters. This creates productive friction (the desirable difficulty from cognitive science).

4. **Stance slider instead of agree/disagree buttons** — A spectrum captures nuance. Binary choice would be too easy and wouldn't reflect the complexity of real intellectual engagement.

5. **Atomic notes, not summaries** — The note prompt explicitly says "not a summary — what changed in your thinking." The output in the collection view shows YOUR insight, not the author's compressed argument.

6. **System prompt as the product** — In chat mode, the entire value is in the system prompt. It encodes Adler, Luhmann, and the fluency research. Changing the system prompt changes the product.

7. **Context-aware quick actions** — Instead of a static toolbar, the chips change based on what the user just did. After sharing a chapter learning, you get "What did I miss?" — not "Suggest a book."

8. **Shared notes between modes** — A note from Deep Read and a note from Chat appear in the same panel with type badges. They're the same kind of thinking artifact regardless of which mode produced them.

9. **API-agnostic** — Base URL field means it works with OpenAI, Groq, Together, OpenRouter, or any local LLM. The key stays in localStorage, never sent anywhere except the user's chosen endpoint.

---

## 10. What's NOT Built Yet (Potential Next Steps)

- **Zettelkasten linking** — Notes can't be linked to each other yet. Luhmann's system required linking notes. Could add a "Link to..." action on each note.
- **Book database** — Currently the AI suggests books from its training data. Could add a curated database of books with their key claims pre-extracted.
- **Chapter tracking** — Could auto-detect which chapter the user is discussing and track progress through the book.
- **Multiple book support** — Currently one book at a time in chat. Could support switching between books.
- **Export** — Notes could be exported as Markdown, Obsidian-flavored MD with [[links]], or JSON.
- **Illusion of fluency detection** — Could analyze the user's atomic note for reliance on the author's specific vocabulary and flag it.
- **Spaced repetition** — Notes could resurface after intervals using a simple scheduling algorithm.
- ** syntopical reading mode** — Adler's highest level: comparing multiple books on the same topic. Would need multi-book context.

