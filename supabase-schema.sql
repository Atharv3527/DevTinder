-- Run this script in your Supabase SQL Editor to create the necessary tables.

-- 1. users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL PRIMARY KEY, -- Firebase UID mapped to UUID, or just use TEXT if Firebase UIDs are generic strings. Wait, Firebase UIDs are 28 char strings (e.g. g2c9O...)
  -- Firebase UID is string, so let's use TEXT for ID
  firebase_uid TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- We can make firebase_uid the primary key instead to simplify foreign keys:
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE public.users ADD PRIMARY KEY (firebase_uid);
ALTER TABLE public.users DROP COLUMN IF EXISTS id;

-- 2. profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id TEXT PRIMARY KEY REFERENCES public.users(firebase_uid) ON DELETE CASCADE,
  profile_photo TEXT,
  background_image TEXT,
  address TEXT,
  about TEXT CHECK (length(about) >= 50), -- Validation constraint (approx lengths)
  github_url TEXT NOT NULL,
  total_connections INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. skills Table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES public.users(firebase_uid) ON DELETE CASCADE,
  skill_name TEXT NOT NULL
);

-- 4. experience Table
CREATE TABLE IF NOT EXISTS public.experience (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES public.users(firebase_uid) ON DELETE CASCADE,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  duration TEXT NOT NULL,
  description TEXT
);

-- 5. education Table
CREATE TABLE IF NOT EXISTS public.education (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES public.users(firebase_uid) ON DELETE CASCADE,
  degree TEXT NOT NULL,
  graduation_year INTEGER NOT NULL,
  college_name TEXT NOT NULL,
  grade TEXT
);

-- Note: Storage buckets "profile-images" and "background-images" must be created manually or via storage API.
-- Also remember to apply Row Level Security (RLS) if accessing from client directly, but since we are using Node.js backend acting as admin, we can query securely there.
