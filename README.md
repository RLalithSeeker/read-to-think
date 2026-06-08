# Read to Think

A reading companion that **never summarizes**. Single-file HTML prototype, now ported to
Next.js with the exact same design.

## Stack
- **Next.js 16** (App Router) + **Tailwind CSS** — frontend, theme ported 1:1 from the original HTML.
- **Browser-direct AI streaming** — bring your own key (OpenAI or **Groq**, free). The key
  stays in your browser and streams straight to your chosen provider (spec §9.9 preserved).
- **localStorage** for notes (Convex planned for §10 roadmap: note-linking, spaced repetition, sync).

## Run locally
```powershell
cd C:\Users\starl\Downloads\read-to-think
npm install
npm run dev
```
Open http://localhost:3000

## API keys
Click the gear icon -> pick a provider:
- **OpenAI** — `sk-...` from platform.openai.com/api-keys
- **Groq (free)** — `gsk_...` from console.groq.com/keys
- **Custom** — any OpenAI-compatible endpoint (Together, OpenRouter, local LLM)

## Deploy
Push to GitHub (`./push.ps1`) then import on Vercel. Zero env vars required — keys are client-side.
