# Local database setup (Supabase + Prisma + Next.js)

This project uses **two** env files for local development so both **Next.js** and the **Prisma CLI** see the same database configuration without surprises.

## Paths

```bash
cd /Users/dmytro/Desktop/2026/OS Kitchen
```

## Why two files?

| Tool | Default env file | Notes |
|------|------------------|--------|
| **Prisma CLI** (`migrate`, `generate`, `validate`) | `.env` in the project root | Prisma loads `.env` automatically; it does **not** load `.env.local` by default. |
| **Next.js** (`next dev`, `next build`) | `.env.local` (and `.env`) | Next merges multiple files; `.env.local` overrides `.env` for overlapping keys. |

**`DIRECT_URL` is required** in `prisma/schema.prisma` (`directUrl = env("DIRECT_URL")`). Migrations and introspection use the direct Postgres connection (typically port **5432**). Runtime queries from serverless or pooled runtimes use **`DATABASE_URL`** (Supabase **transaction pooler**, port **6543**, `pgbouncer=true`).

Keeping **`DATABASE_URL`** and **`DIRECT_URL`** in **both** `.env` and `.env.local` avoids Prisma failing with `P1012` / `Environment variable not found: DIRECT_URL` while Next still works as before.

## Required variables

In **both** `.env` and `.env.local` (same values for local dev):

- `DATABASE_URL` — transaction pooler (`:6543`, `pgbouncer=true`, …)
- `DIRECT_URL` — direct Postgres (`:5432`)

Copy from Supabase: **Project Settings → Database** (use the pooler URI for `DATABASE_URL` and the direct/session URI for `DIRECT_URL`). See `.env.example` for placeholder shape.

## Daily workflow

```bash
cd /Users/dmytro/Desktop/2026/OS Kitchen
```

Optional: load vars into your shell if you run ad-hoc commands that expect them in the environment (only if your values are shell-safe):

```bash
set -a
source .env.local
set +a
```

Verify env files and Prisma (passwords are **never** printed):

```bash
npm run check-env
```

```bash
npm run db:generate
```

Apply existing migrations to your database (CI / shared DB / first clone):

```bash
npm run db:deploy
```

Create a **new** migration after schema changes (local only):

```bash
npm run db:migrate
```

Start the app:

```bash
npm run dev
```

## `migrate dev` vs `migrate deploy`

- **`npm run db:deploy`** (`prisma migrate deploy`): applies migrations that already exist in `prisma/migrations`. Use this when the migration history is already in the repo and you only need to sync the database (recommended for teammates and production-like DBs).

- **`npm run db:migrate`** (`prisma migrate dev`): compares your **schema** to the database, can create a **new** migration folder, and may prompt for a migration **name** when it detects drift or new changes. That prompt is normal when Prisma needs a new migration.

If you only meant to apply committed migrations and Prisma asks for a migration name unexpectedly, stop and prefer **`npm run db:deploy`**, then fix any drift (wrong database, shadow DB issues, or local edits) as documented in [Prisma migrate dev](https://www.prisma.io/docs/orm/prisma-migrate/workflows/dev-and-prod).

## Keeping `.env` and `.env.local` in sync

After changing database URLs in `.env.local`, copy the same `DATABASE_URL` / `DIRECT_URL` lines into `.env` (or duplicate the file for local-only machines) so `npx prisma` commands keep working.

## References

- `docs/ENVIRONMENT_VARIABLES.md` — full variable list
- `docs/ENVIRONMENT_FIX_REPORT.md` — env strategy and troubleshooting
- `npm run check-env` — `scripts/check-env.ts`
