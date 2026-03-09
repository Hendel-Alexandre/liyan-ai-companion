# Liyan AI — Replit Project

## Overview
Liyan AI is an Islamic companion app built with React + Vite + TypeScript. It provides prayer times, daily Quran ayahs, duas, AI chat, Quran recitation, quiz features, and more.

## Architecture
- **Frontend**: React 18 + Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Auth & Database**: Supabase (auth, PostgreSQL, RLS policies)
- **AI**: Supabase Edge Functions calling Claude, OpenAI, Gemini
- **Routing**: React Router v6 (single-page, tab-based navigation)

## Project Structure
```
src/
  App.tsx                  — Root component with all providers
  pages/                   — Screen components (Home, Chat, Recite, Learn, Settings, etc.)
  components/              — UI components (shadcn/ui + custom)
  context/                 — React contexts (Auth, Chat, Settings, Saved, Theme)
  services/                — Business logic (AI, prayer times, ayah, dua, quiz)
  repositories/            — Supabase data access (conversations, messages, settings, etc.)
  lib/supabaseClient.ts    — Supabase client initialisation
supabase/
  functions/               — Edge functions (chat-completion, daily-ayah, daily-dua, prayer-times, quran-recognition)
  migrations/              — SQL schema (001_initial_schema.sql)
```

## Environment Variables (Secrets)
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key

## Running Locally
The "Start application" workflow runs `npm run dev` on port 5000.

## Supabase Edge Functions
The following edge functions must be deployed to your Supabase project for full functionality:
- `chat-completion` — AI chat (Claude / OpenAI / Gemini fallback chain)
- `daily-ayah` — Daily Quran verse with caching
- `daily-dua` — Daily dua with caching
- `prayer-times` — Prayer times via Aladhan API
- `quran-recognition` — Fuzzy verse matching

Edge function secrets needed in Supabase dashboard:
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`

## Notes
- The app gracefully degrades without Supabase (shows static fallback content)
- Prayer times fall back to calling Aladhan API directly from the browser
- `lovable-tagger` dev dependency was removed (Lovable-specific tooling)
- Vite is configured for Replit: host `0.0.0.0`, port `5000`, `allowedHosts: true`
