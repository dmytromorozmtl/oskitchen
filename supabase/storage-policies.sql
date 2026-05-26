-- -----------------------------------------------------------------------------
-- KitchenOS — Supabase Storage policies (REFERENCE ONLY)
--
-- Review before applying. Policies vary by whether uploads are:
--   (A) server-side only via service role, or
--   (B) direct browser uploads with RLS.
--
-- For MVP server-only uploads: keep buckets private; use signed URLs from API routes.
-- -----------------------------------------------------------------------------

-- Example bucket creation (run in Supabase SQL or dashboard):
-- insert into storage.buckets (id, name, public) values
--   ('product-images', 'product-images', false),
--   ('business-logos', 'business-logos', false),
--   ('label-assets', 'label-assets', false);

-- Enable RLS on storage.objects (usually ON by default).

-- Pattern: authenticated users can read/write only their prefix (REPLACE user_id logic).
-- Uncomment and adapt if using browser uploads:

-- CREATE POLICY "Users read own product images"
--   ON storage.objects FOR SELECT TO authenticated
--   USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- CREATE POLICY "Users upload own product images"
--   ON storage.objects FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Service role bypasses RLS — restrict service role to server environments only.
