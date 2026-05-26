# Prisma + Supabase (production)

## Singleton

`lib/prisma.ts` exports a single `PrismaClient` attached to `globalThis` in development only — standard Next.js pattern. Do not instantiate `new PrismaClient()` elsewhere.

## URLs

| Variable | Use |
|----------|-----|
| `DATABASE_URL` | **Runtime** — Supabase **pooler** (often `:6543`, `pgbouncer=true`, `connection_limit=1`) |
| `DIRECT_URL` | **Migrations** — **direct** Postgres (`:5432`) |

Prisma schema:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## Local development

- Docker Postgres or Supabase local is fine; `DATABASE_URL` and `DIRECT_URL` may match for local-only Postgres.

## Vercel build

- `npm run build` runs `prisma generate` — **does not** migrate production.
- `postinstall` also runs `prisma generate` on Vercel after `npm install`.

## Migrations before / during deploy

1. **Recommended:** CI step `npx prisma migrate deploy` using production `DIRECT_URL` (and matching `DATABASE_URL` role).
2. Avoid `migrate dev` against production.

## Prepared statement errors

Symptoms: errors referencing prepared statements with PgBouncer.

Mitigations:

- Ensure runtime `DATABASE_URL` uses Supabase’s **transaction** or **session** pooler configuration compatible with Prisma 6.
- Do not point Prisma serverless traffic at a misconfigured pooler mode.

## Leaking `DATABASE_URL`

- Never log full connection strings.
- Rotate DB password if URL logged or committed.

## Scripts

| npm script | Purpose |
|------------|---------|
| `db:generate` | `prisma generate` |
| `db:migrate` | `prisma migrate dev` |
| `db:deploy` | `prisma migrate deploy` |
| `db:studio` | Prisma Studio |
| `db:seed` | Seed script |
| `production-check` | typecheck + build (+ guards) |
