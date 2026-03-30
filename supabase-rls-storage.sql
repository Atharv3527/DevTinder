-- ============================================================
-- DevTinder — RLS + Storage policies (Firebase UID ↔ JWT `sub`)
-- Run in Supabase SQL Editor AFTER `supabase-schema.sql`
--
-- Backend uses SUPABASE_SERVICE_ROLE_KEY and bypasses RLS.
-- These policies apply when the client uses the anon key with a
-- valid session (e.g. Supabase Third-Party Auth with Firebase).
--
-- Firebase UID must match `developers.firebase_uid` and path prefix
-- `storage.objects.name` = `{firebase_uid}/...`
-- ============================================================

-- ─── Helpers: Firebase subject claim (same as Firebase UID string) ───
-- Prefer auth.jwt()->>'sub' for Firebase-issued JWTs; fall back to auth.uid()::text for native Supabase users.

-- ─── DEVELOPERS ─────────────────────────────────────────────────────
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "developers_select_own" ON public.developers;
DROP POLICY IF EXISTS "developers_insert_own" ON public.developers;
DROP POLICY IF EXISTS "developers_update_own" ON public.developers;

CREATE POLICY "developers_select_own"
  ON public.developers FOR SELECT
  TO authenticated
  USING (
    firebase_uid = COALESCE(
      (auth.jwt() ->> 'sub'),
      auth.uid()::text
    )
  );

CREATE POLICY "developers_insert_own"
  ON public.developers FOR INSERT
  TO authenticated
  WITH CHECK (
    firebase_uid = COALESCE(
      (auth.jwt() ->> 'sub'),
      auth.uid()::text
    )
  );

CREATE POLICY "developers_update_own"
  ON public.developers FOR UPDATE
  TO authenticated
  USING (
    firebase_uid = COALESCE(
      (auth.jwt() ->> 'sub'),
      auth.uid()::text
    )
  )
  WITH CHECK (
    firebase_uid = COALESCE(
      (auth.jwt() ->> 'sub'),
      auth.uid()::text
    )
  );

-- Optional: allow authenticated users to read other developers for in-app discovery
-- (Only enable if you use the Supabase client from the browser for the feed.)
-- CREATE POLICY "developers_select_public_feed"
--   ON public.developers FOR SELECT TO authenticated USING (true);

-- ─── STORAGE: profile-images & background-images ───────────────────
-- Buckets must exist (public read recommended for avatar URLs).

DROP POLICY IF EXISTS "profile_images_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_select_public" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_update_own" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_delete_own" ON storage.objects;

DROP POLICY IF EXISTS "background_images_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "background_images_select_public" ON storage.objects;
DROP POLICY IF EXISTS "background_images_update_own" ON storage.objects;
DROP POLICY IF EXISTS "background_images_delete_own" ON storage.objects;

CREATE POLICY "profile_images_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = COALESCE((auth.jwt() ->> 'sub'), auth.uid()::text)
  );

CREATE POLICY "profile_images_select_public"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'profile-images');

CREATE POLICY "profile_images_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = COALESCE((auth.jwt() ->> 'sub'), auth.uid()::text)
  );

CREATE POLICY "profile_images_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = COALESCE((auth.jwt() ->> 'sub'), auth.uid()::text)
  );

CREATE POLICY "background_images_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'background-images'
    AND (storage.foldername(name))[1] = COALESCE((auth.jwt() ->> 'sub'), auth.uid()::text)
  );

CREATE POLICY "background_images_select_public"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'background-images');

CREATE POLICY "background_images_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'background-images'
    AND (storage.foldername(name))[1] = COALESCE((auth.jwt() ->> 'sub'), auth.uid()::text)
  );

CREATE POLICY "background_images_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'background-images'
    AND (storage.foldername(name))[1] = COALESCE((auth.jwt() ->> 'sub'), auth.uid()::text)
  );
