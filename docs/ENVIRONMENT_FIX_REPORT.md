# Environment fix report — Prisma + Next.js + Supabase

## Summary

Local instability came from **Prisma reading `.env` only** while **Next.js prioritizes `.env.local`**. If `DATABASE_URL` / `DIRECT_URL` lived only in `.env.local`, `npx prisma migrate deploy`, `prisma generate`, and `prisma validate` failed validation (`P1012` / missing `DIRECT_URL`) before touching the database.

## What changed

1. **`.env` in the repo root** — Created for local development so the Prisma CLI always sees `DATABASE_URL` and `DIRECT_URL`. It must stay **gitignored**; each developer copies from `.env.example` or mirrors `.env.local` for DB lines only.

2. **`npm run check-env`** — Runs `scripts/check-env.ts`, which confirms `.env` / `.env.local` exist, checks that `DATABASE_URL` and `DIRECT_URL` are set (from merged file parse + `process.env`), redacts credentials in stdout, and runs `npx prisma validate` with those vars injected.

3. **`lib/env.ts`** — Added `isEnvConfigured()` and development-only warnings when any of `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing. Production behavior remains strict via existing Zod parsing and errors (no secrets in logs).

4. **`.env.example`** — Updated placeholder `DATABASE_URL` / `DIRECT_URL` to match Supabase **pooler** (`aws-REGION.pooler.supabase.com:6543`) and **direct** (`db.PROJECT_REF.supabase.co:5432`) patterns.

5. **`.gitignore`** — Explicit `.env.local` entry added alongside `.env` and `.env*.local`.

6. **Docs** — `docs/LOCAL_DATABASE_SETUP.md` (commands and mental model) and this report.

## Env strategy

- **Secrets**: Never committed. Use `.env.local` for Next-focused local secrets; duplicate DB URLs into `.env` for Prisma, or maintain both with identical DB-related lines.

- **Production (e.g. Vercel)**: Set `DATABASE_URL`, `DIRECT_URL`, and Supabase keys in the host’s environment or managed secrets UI — no `.env` file required on the server.

## Prisma strategy

- Schema datasource remains `url = env("DATABASE_URL")` and `directUrl = env("DIRECT_URL")`.

- Prefer **`prisma migrate deploy`** when applying **existing** migrations from git.

- Use **`prisma migrate dev`** only when intentionally creating or iterating on migrations locally.

## Supabase strategy

- **`DATABASE_URL`**: Transaction pooler, port **6543**, `pgbouncer=true` (and sensible `connection_limit` / `pool_timeout` per Supabase docs).

- **`DIRECT_URL`**: Direct connection, port **5432**, for migrations and tooling that cannot use the pooler.

## Commands

```bash
cd /Users/dmytro/Desktop/2026/KitchenOS
npm run check-env
npx prisma validate
npx prisma generate
```

Apply migrations (existing history only):

```bash
npm run db:deploy
```

## Common errors

| Symptom | Likely cause | Mitigation |
|--------|----------------|------------|
| `P1012` / `Environment variable not found: DIRECT_URL` | Prisma CLI did not load `.env.local` | Add `DIRECT_URL` (and `DATABASE_URL`) to `.env`, or export vars before running Prisma. |
| Next works; Prisma fails | Same as above | Keep DB vars in **both** `.env` and `.env.local` for local dev. |
| `prisma migrate dev` asks for a migration name | Prisma wants to create a new migration or resolve drift | Use `npm run db:deploy` if you only need to apply existing migrations; see `docs/LOCAL_DATABASE_SETUP.md`. |

## Troubleshooting

1. Run `npm run check-env` and fix any line marked with `✗`.

2. Confirm Supabase project is up and credentials match **Settings → Database**.

3. Ensure `.env` is not accidentally committed (verify `git status`).

4. Re-run `npx prisma validate` after any `prisma/schema.prisma` datasource change.

## Validation performed

During the fix, the following were run successfully in this environment when `.env` contained the same database variables as `.env.local`:

- `npm run check-env`
- `npx prisma validate`
- `npx prisma generate`

No new Prisma migrations were added as part of this work.
