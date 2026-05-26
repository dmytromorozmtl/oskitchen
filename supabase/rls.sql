-- -----------------------------------------------------------------------------
-- KitchenOS — Row Level Security reference (Supabase Postgres)
--
-- Prisma connects with the database role from DATABASE_URL and bypasses RLS.
-- Enable these policies if you ever query these tables from the browser using
-- the Supabase JS client with the anon key (not recommended for this app’s MVP).
--
-- Public QR order lookup should stay server-only via Next.js routes — never
-- expose full orders rows to anonymous clients.
-- -----------------------------------------------------------------------------

-- Example: mirror table `users` (mapped as UserProfile in Prisma)
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users read own profile"
--   ON public.users FOR SELECT
--   USING (auth.uid() = id);

-- CREATE POLICY "Users update own profile"
--   ON public.users FOR UPDATE
--   USING (auth.uid() = id);

-- Repeat pattern for other tables if replicated into Supabase-exposed schemas:
-- USING (auth.uid() = user_id) for SELECT/INSERT/UPDATE/DELETE as appropriate.

-- Service role key bypasses RLS — restrict to server-side only.

-- -----------------------------------------------------------------------------
-- Storage (if using Supabase Storage + browser uploads)
-- -----------------------------------------------------------------------------
-- See supabase/storage-policies.sql for bucket-specific examples.
-- Prefer server-mediated uploads with signed URLs for simpler threat models.

-- -----------------------------------------------------------------------------
-- Beta applications (if exposing via Supabase Data API — NOT recommended for MVP)
-- -----------------------------------------------------------------------------
-- KitchenOS writes beta rows via Prisma/server actions. Do not expose beta_applications
-- to anon/authenticated clients without strict SELECT policies.
