# Liyan AI — Replit Project

## Overview
Liyan AI is a mobile-first Islamic companion app built with React + Vite + TypeScript + Express. It provides prayer times, daily Quran ayahs, duas, AI chat (Claude/OpenAI/Gemini), Quran recitation, quiz features, and more.

## Architecture
- **Frontend**: React 18 + Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Express.js API server (port 3001), TypeScript via tsx
- **Auth**: JWT-based (bcryptjs for hashing, jsonwebtoken for tokens)
- **Database**: Replit PostgreSQL (pg client, schema auto-initialized on server start)
- **AI**: Express routes calling Claude (claude-opus-4-5), OpenAI (gpt-4o-mini), Gemini (gemini-2.0-flash) with fallback chain
- **Routing**: React Router v6 (single-page, tab-based navigation)
- **Dev**: concurrently runs both Vite (port 5000) and Express (port 3001)

## Project Structure
```
server/
  index.ts                 — Express server entry point, schema init
  db.ts                    — PostgreSQL pool connection
  auth.ts                  — JWT sign/verify, requireAuth middleware
  schema.sql               — Database schema (auto-applied on startup)
  routes/
    authRoutes.ts          — POST /api/auth/signup, /signin, GET /me
    chatRoutes.ts          — AI completion + conversation/message CRUD
    userRoutes.ts          — Settings, profile, saved items CRUD
    islamicRoutes.ts       — Daily ayah, daily dua, prayer times, quran recognition
src/
  lib/api.ts               — Frontend API client (all fetch calls, attaches JWT)
  context/                 — React contexts (Auth, Chat, Settings, Saved, Theme)
  pages/                   — Screen components (Home, Chat, Recite, Learn, Settings, etc.)
  components/              — UI components (shadcn/ui + custom)
  services/                — Business logic (AI, prayer times, ayah, dua, quiz)
  repositories/            — Data access layer (wraps api.ts calls)
supabase/                  — Legacy Supabase files (kept for reference only, not used)
```

## Environment Secrets Required
- `DATABASE_URL` — Replit PostgreSQL (auto-set by Replit)
- `JWT_SECRET` — Secret for signing JWT tokens
- `ANTHROPIC_API_KEY` — Claude AI (primary provider)
- `OPENAI_API_KEY` — OpenAI fallback
- `GEMINI_API_KEY` — Gemini fallback

## API Routes
- `POST /api/auth/signup` — Create account
- `POST /api/auth/signin` — Sign in, returns JWT
- `GET  /api/auth/me` — Get current user (requires Bearer token)
- `POST /api/chat/completion` — AI chat (auth required)
- `GET/POST/PATCH/DELETE /api/chat/conversations` — Conversation management
- `GET/POST /api/chat/conversations/:id/messages` — Message management
- `GET/PUT /api/user/settings` — User settings
- `GET/PATCH /api/user/profile` — User profile
- `GET/POST/DELETE /api/user/saved` — Saved items
- `GET /api/islamic/daily-ayah` — Daily Quran verse (cached in DB)
- `GET /api/islamic/daily-dua` — Daily dua (cached in DB)
- `GET /api/islamic/prayer-times` — Prayer times via Aladhan API
- `POST /api/islamic/quran-recognition` — Fuzzy verse matching

## Running
The "Start application" workflow runs `npm run dev` which concurrently starts:
1. Express server (`tsx watch server/index.ts`) on port 3001
2. Vite dev server on port 5000 (proxies /api to port 3001)
