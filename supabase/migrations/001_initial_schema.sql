-- ═══════════════════════════════════════════════════════════
-- Liyan AI — Supabase Initial Schema Migration
-- Run: supabase db push  (or paste into SQL editor)
-- ═══════════════════════════════════════════════════════════

-- ── Reusable updated_at trigger function ──────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- ═══════════════════════
-- A. profiles
-- ═══════════════════════
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

alter table public.profiles enable row level security;

create policy "profiles: own select"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: own insert"   on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: own update"   on public.profiles for update using (auth.uid() = id);
create policy "profiles: own delete"   on public.profiles for delete using (auth.uid() = id);

-- ═══════════════════════
-- B. user_settings
-- ═══════════════════════
create table if not exists public.user_settings (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  accent_color   text default 'lime',
  text_size      text default 'medium' check (text_size in ('small','medium','large')),
  voice_speed    text default 'normal' check (voice_speed in ('slow','normal','fast')),
  voice_gender   text default 'feminine' check (voice_gender in ('feminine','masculine')),
  voice_provider text default 'browser',
  voice_id       text,
  city           text,
  country        text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (user_id)
);

create trigger user_settings_updated_at
  before update on public.user_settings
  for each row execute procedure public.handle_updated_at();

alter table public.user_settings enable row level security;

create policy "settings: own select" on public.user_settings for select using (auth.uid() = user_id);
create policy "settings: own insert" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "settings: own update" on public.user_settings for update using (auth.uid() = user_id);
create policy "settings: own delete" on public.user_settings for delete using (auth.uid() = user_id);

-- ═══════════════════════
-- C. conversations
-- ═══════════════════════
create table if not exists public.conversations (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  title             text not null default 'New conversation',
  provider_last_used text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  last_message_at   timestamptz default now()
);

create index if not exists conversations_user_id_idx on public.conversations(user_id);
create index if not exists conversations_last_msg_idx on public.conversations(last_message_at desc);

create trigger conversations_updated_at
  before update on public.conversations
  for each row execute procedure public.handle_updated_at();

alter table public.conversations enable row level security;

create policy "conversations: own select" on public.conversations for select using (auth.uid() = user_id);
create policy "conversations: own insert" on public.conversations for insert with check (auth.uid() = user_id);
create policy "conversations: own update" on public.conversations for update using (auth.uid() = user_id);
create policy "conversations: own delete" on public.conversations for delete using (auth.uid() = user_id);

-- ═══════════════════════
-- D. messages
-- ═══════════════════════
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            text not null check (role in ('user','assistant','system')),
  content         text not null,
  citations_json  jsonb default '[]'::jsonb,
  provider_used   text,
  metadata_json   jsonb default '{}'::jsonb,
  created_at      timestamptz default now()
);

create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
create index if not exists messages_user_id_idx         on public.messages(user_id);
create index if not exists messages_created_at_idx      on public.messages(created_at);

alter table public.messages enable row level security;

create policy "messages: own select" on public.messages for select using (auth.uid() = user_id);
create policy "messages: own insert" on public.messages for insert with check (auth.uid() = user_id);
create policy "messages: own update" on public.messages for update using (auth.uid() = user_id);
create policy "messages: own delete" on public.messages for delete using (auth.uid() = user_id);

-- ═══════════════════════
-- E. saved_items
-- ═══════════════════════
create table if not exists public.saved_items (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  item_type    text not null check (item_type in ('chat','ayah','dua','recitation','prayer_guide','quran_match')),
  item_ref_id  text,
  title        text not null,
  subtitle     text,
  payload_json jsonb default '{}'::jsonb,
  created_at   timestamptz default now()
);

create index if not exists saved_items_user_id_idx   on public.saved_items(user_id);
create index if not exists saved_items_item_type_idx on public.saved_items(item_type);

alter table public.saved_items enable row level security;

create policy "saved: own select" on public.saved_items for select using (auth.uid() = user_id);
create policy "saved: own insert" on public.saved_items for insert with check (auth.uid() = user_id);
create policy "saved: own update" on public.saved_items for update using (auth.uid() = user_id);
create policy "saved: own delete" on public.saved_items for delete using (auth.uid() = user_id);

-- ═══════════════════════
-- F. recitations
-- ═══════════════════════
create table if not exists public.recitations (
  id               uuid primary key default gen_random_uuid(),
  source_provider  text not null,
  surah_number     integer,
  ayah_number      integer,
  surah_name_ar    text,
  surah_name_en    text,
  reciter_id       text,
  reciter_name     text,
  arabic_text      text,
  transliteration  text,
  translation      text,
  audio_url        text,
  metadata_json    jsonb default '{}'::jsonb,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists recitations_surah_idx  on public.recitations(surah_number);
create index if not exists recitations_reciter_idx on public.recitations(reciter_name);

create trigger recitations_updated_at
  before update on public.recitations
  for each row execute procedure public.handle_updated_at();

-- Recitations are global/seeded — authenticated users can read, only service role can write
alter table public.recitations enable row level security;

create policy "recitations: authenticated read" on public.recitations
  for select using (auth.role() = 'authenticated');
-- INSERT/UPDATE/DELETE: service_role only (no RLS policy = blocked for anon/authenticated)

-- ═══════════════════════
-- G. daily_ayah_cache
-- ═══════════════════════
create table if not exists public.daily_ayah_cache (
  id              uuid primary key default gen_random_uuid(),
  cache_date      date not null,
  surah_number    integer not null,
  ayah_number     integer not null,
  arabic_text     text,
  translation     text,
  reference_label text,
  payload_json    jsonb default '{}'::jsonb,
  created_at      timestamptz default now(),
  unique (cache_date)
);

alter table public.daily_ayah_cache enable row level security;
-- Authenticated users can read; edge functions use service role to write
create policy "ayah_cache: auth read" on public.daily_ayah_cache
  for select using (auth.role() = 'authenticated');

-- ═══════════════════════
-- H. daily_dua_cache
-- ═══════════════════════
create table if not exists public.daily_dua_cache (
  id             uuid primary key default gen_random_uuid(),
  cache_date     date not null,
  title          text not null,
  arabic_text    text,
  transliteration text,
  translation    text,
  source_label   text,
  audio_url      text,
  payload_json   jsonb default '{}'::jsonb,
  created_at     timestamptz default now(),
  unique (cache_date)
);

alter table public.daily_dua_cache enable row level security;
create policy "dua_cache: auth read" on public.daily_dua_cache
  for select using (auth.role() = 'authenticated');

-- ═══════════════════════
-- I. quran_recognition_results
-- ═══════════════════════
create table if not exists public.quran_recognition_results (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  transcript       text,
  match_confidence numeric,
  surah_number     integer,
  ayah_number      integer,
  reciter_name     text,
  payload_json     jsonb default '{}'::jsonb,
  created_at       timestamptz default now()
);

create index if not exists qr_user_id_idx    on public.quran_recognition_results(user_id);
create index if not exists qr_created_at_idx on public.quran_recognition_results(created_at desc);

alter table public.quran_recognition_results enable row level security;

create policy "qr: own select" on public.quran_recognition_results for select using (auth.uid() = user_id);
create policy "qr: own insert" on public.quran_recognition_results for insert with check (auth.uid() = user_id);
create policy "qr: own delete" on public.quran_recognition_results for delete using (auth.uid() = user_id);

-- ═══════════════════════
-- J. quiz_progress
-- ═══════════════════════
create table if not exists public.quiz_progress (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  quiz_mode        text check (quiz_mode in ('easy','medium','hard')),
  category         text,
  score            integer,
  total_questions  integer,
  payload_json     jsonb default '{}'::jsonb,
  completed_at     timestamptz default now()
);

create index if not exists quiz_user_id_idx    on public.quiz_progress(user_id);
create index if not exists quiz_completed_idx  on public.quiz_progress(completed_at desc);

alter table public.quiz_progress enable row level security;

create policy "quiz: own select" on public.quiz_progress for select using (auth.uid() = user_id);
create policy "quiz: own insert" on public.quiz_progress for insert with check (auth.uid() = user_id);
create policy "quiz: own delete" on public.quiz_progress for delete using (auth.uid() = user_id);
