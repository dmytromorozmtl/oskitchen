# Database deployment (Prisma + Supabase)

## Local development

1. Create a Supabase project (or local Postgres).
2. Set **`DATABASE_URL`** (pooler or direct for local) and **`DIRECT_URL`** (direct).
3. Install deps: `npm install`
4. Apply schema: `npm run db:migrate` (dev) or `npm run db:deploy` (CI/prod).
5. Generate client: `npm run db:generate` (also runs on `postinstall` / `npm run build`).
6. Seed: `npm run db:seed`

### Scripts

| Script | Purpose |
|--------|---------|
| `npm run db:generate` | `prisma generate` |
| `npm run db:migrate` | `prisma migrate dev` (creates migration locally) |
| `npm run db:deploy` | `prisma migrate deploy` (production) |
| `npm run db:studio` | Prisma Studio |
| `npm run db:seed` | Run `prisma/seed.ts` |
| `npm run db:reset-dev` | **`prisma migrate reset --force`** — destroys local data |

## Supabase: pooler vs direct

- **`DATABASE_URL` (runtime):** Use the **connection pooler** (often port **6543**, `pgbouncer=true`) so serverless functions do not exhaust connections.
- **`DIRECT_URL` (migrations):** Use the **direct** session connection (often port **5432**) for `prisma migrate`. Migrating through PgBouncer can cause shadow DB / advisory lock issues.

Example shape (placeholders):

```bash
DATABASE_URL="postgresql://...@db.xxx.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://...@db.xxx.supabase.co:5432/postgres"
```

## Prisma migrate flow

1. Develop: change `schema.prisma` → `npm run db:migrate` → commit migration SQL.
2. Staging/Prod: `npm run db:deploy` in release pipeline **before** or **as part of** deploy (choose one strategy and stick to it).
3. Avoid duplicate `PrismaClient` — use the project singleton only.

## Seed & demo seed

- **`npm run db:seed`** uses env documented in `.env.example` (`SEED_*`).
- Demo workspaces should be clearly labeled in UI when `DEMO_MODE_ENABLED` is on.

## Troubleshooting

### Prepared statement errors (`prepared statement "s0" already exists`)

**Cause:** Prisma + PgBouncer transaction pooling mode.  
**Fix:** Use Supabase’s **pooler URL** with Prisma-compatible settings; ensure `DATABASE_URL` is the pooler endpoint, not mixing modes incorrectly. If issues persist, confirm Supabase pooler mode docs for Prisma 6.

### P1001 (cannot reach database server)

- Wrong host/port/firewall
- Supabase paused project
- IPv6/local network blocking — try from another network or check Supabase status

### Authentication failed

- Rotate DB password in Supabase; update `DATABASE_URL` / `DIRECT_URL`
- URL-encode special characters in password

### Shadow database issues

- Ensure `DIRECT_URL` works for migrate
- On hosted CI without shadow DB, use `migrate deploy` only (no shadow)

### SSL errors

- Supabase requires SSL; connection strings from dashboard include it — do not strip `?sslmode=require` if present

## Production migration checklist

- [ ] `DIRECT_URL` points to `:5432` (or non-pooler migrate-safe URL)
- [ ] `DATABASE_URL` uses pooler for app runtime
- [ ] Run `npm run db:deploy` on release
- [ ] Verify `BetaApplication` (and other new tables) exists post-deploy
