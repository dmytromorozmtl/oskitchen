# Supabase production setup

## 1. Create project

- Choose region close to Vercel (`iad1` pairs well with US East).

## 2. Database password

- Save the generated Postgres password in a secrets manager — it feeds `DATABASE_URL` / `DIRECT_URL`.

## 3. Project URL & keys

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (server only — Vercel env, not `NEXT_PUBLIC_*`)

## 4. Auth configuration

- **Site URL:** your canonical app URL (`https://your-domain.com`).
- **Redirect URLs:** include production domain, `http://localhost:3000` for local dev, and preview URLs if needed.
- **Email confirmation:** enable/disable per launch strategy; document support steps for users not receiving mail.
- **Password recovery:** ensure redirect targets your app route handling recovery tokens.

## 5. Database

- Run Prisma migrations: `npm run db:deploy` against production `DIRECT_URL`.
- Inspect tables in Supabase Table Editor or Prisma Studio (against non-prod clone recommended).

## 6. Optional seed

- Run `npm run db:seed` only against **non-production** or dedicated staging — never overwrite prod casually.

## 7. Storage buckets (optional)

Create buckets if using Supabase Storage for uploads:

- `product-images`
- `business-logos`
- `label-assets`

Apply policies from `supabase/storage-policies.sql` **after review** (defaults are commented).

## 8. RLS guidance

OS Kitchen MVP primarily uses **Prisma** with the database connection string (bypasses RLS). If you expose tables to the browser via Supabase JS:

- Enable RLS per table.
- Scope policies to `auth.uid()` matching your user IDs.

Reference starter notes: `supabase/rls.sql`.

## 9. Backups

- Enable Supabase backups per plan; document RPO expectations internally.

## 10. Rotate secrets checklist

- Rotate DB password → update `DATABASE_URL` / `DIRECT_URL` in Vercel.
- If anon/service keys suspected leaked → regenerate in Supabase dashboard → update Vercel → redeploy.
