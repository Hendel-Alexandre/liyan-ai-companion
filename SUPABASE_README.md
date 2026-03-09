# Liyan AI — Supabase Environment Variables

## Frontend (.env.local)

```env
# Supabase — REQUIRED
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# AI provider preference (optional, default: claude)
VITE_PRIMARY_AI_PROVIDER=claude
```

> **Do NOT add provider API keys here.** They live as Supabase Function secrets.

---

## Supabase Function Secrets

Set these in **Supabase Dashboard → Project Settings → Edge Functions** (or via CLI):

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set GEMINI_API_KEY=AIza...
```

---

## Run the SQL Migration

**Option A — Supabase Dashboard SQL Editor:**
Paste `supabase/migrations/001_initial_schema.sql` and click Run.

**Option B — Supabase CLI:**
```bash
supabase db push
```

---

## Deploy Edge Functions

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR-PROJECT-REF

# Deploy all functions
supabase functions deploy chat-completion
supabase functions deploy daily-ayah
supabase functions deploy daily-dua
supabase functions deploy prayer-times
supabase functions deploy quran-recognition
```

---

## Auth Configuration

In **Supabase Dashboard → Authentication → Providers**:
- Enable **Email** provider
- Enable **Magic Link** if desired
- Set your app's redirect URL under **Authentication → URL Configuration → Site URL**

---

## Architecture Summary

| Layer | Technology |
|---|---|
| Auth | Supabase Auth (email/password + magic link) |
| Database | Supabase Postgres (10 tables, RLS enabled) |
| AI calls | Edge Function `chat-completion` — Claude → OpenAI → Gemini fallback |
| Prayer times | Edge Function `prayer-times` → Aladhan API |
| Daily content | Edge Functions `daily-ayah` + `daily-dua` with DB caching |
| Quran recognition | Edge Function `quran-recognition` with fuzzy matching |
| Frontend secrets | Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
