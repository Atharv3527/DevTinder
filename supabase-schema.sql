-- ============================================================
-- DevTinder — Supabase Schema (v2 — Unified Developer Table)
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- Drop old tables if they exist (clean migration)
DROP TABLE IF EXISTS public.education CASCADE;
DROP TABLE IF EXISTS public.experience CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.chats CASCADE;
DROP TABLE IF EXISTS public.connections CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.developers CASCADE;

-- ─────────────────────────────────────────────
-- 1. DEVELOPERS (unified developer record)
-- ─────────────────────────────────────────────
CREATE TABLE public.developers (
  firebase_uid         TEXT PRIMARY KEY,
  email                TEXT UNIQUE NOT NULL,
  full_name            TEXT NOT NULL DEFAULT '',
  profile_image_url    TEXT,
  background_image_url TEXT,
  bio                  TEXT,
  skills               JSONB NOT NULL DEFAULT '[]'::jsonb,
  experience           JSONB NOT NULL DEFAULT '[]'::jsonb,
  education            JSONB NOT NULL DEFAULT '[]'::jsonb,
  github_url           TEXT,
  address              TEXT,
  created_at           TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at           TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ─────────────────────────────────────────────
-- 2. CONNECTIONS
-- ─────────────────────────────────────────────
CREATE TABLE public.connections (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id   TEXT NOT NULL REFERENCES public.developers(firebase_uid) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES public.developers(firebase_uid) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (sender_id, receiver_id)
);

-- ─────────────────────────────────────────────
-- 3. CHATS
-- ─────────────────────────────────────────────
CREATE TABLE public.chats (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id   TEXT NOT NULL REFERENCES public.developers(firebase_uid) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES public.developers(firebase_uid) ON DELETE CASCADE,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ─────────────────────────────────────────────
-- Indexes for performance
-- ─────────────────────────────────────────────
CREATE INDEX idx_connections_sender   ON public.connections(sender_id);
CREATE INDEX idx_connections_receiver ON public.connections(receiver_id);
CREATE INDEX idx_connections_status   ON public.connections(status);
CREATE INDEX idx_chats_sender         ON public.chats(sender_id);
CREATE INDEX idx_chats_receiver       ON public.chats(receiver_id);
CREATE INDEX idx_chats_created        ON public.chats(created_at);

-- ─────────────────────────────────────────────
-- 4. NOTIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE public.notifications (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES public.developers(firebase_uid) ON DELETE CASCADE,
  actor_id      TEXT NOT NULL REFERENCES public.developers(firebase_uid) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('connection_request', 'accepted', 'rejected')),
  connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE,
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_notifications_user_id  ON public.notifications(user_id);
CREATE INDEX idx_notifications_actor_id ON public.notifications(actor_id);
CREATE INDEX idx_notifications_created  ON public.notifications(created_at);

-- ─────────────────────────────────────────────
-- NOTES
-- ─────────────────────────────────────────────
-- Storage buckets required (create manually in Supabase Dashboard > Storage):
--   • profile-images    (Public)
--   • background-images (Public)
--
-- Backend uses Service Role Key so RLS is bypassed server-side.
-- For browser-direct Supabase access or stricter production DB rules, run
-- `supabase-rls-storage.sql` after this script (Firebase JWT `sub` = firebase_uid).
