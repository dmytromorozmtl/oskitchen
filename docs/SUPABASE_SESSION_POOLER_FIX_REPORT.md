# Supabase Session Pooler fix — final report

**Date:** 2026-05-11
**Owner:** infra / DB
**Trigger:** `npm run db:deploy` failed with `P1001: Can't reach database server at db.<ref>.supabase.co:5432` while the Next.js app continued serving traffic normally.

## What was broken

- `DIRECT_URL` (used by Prisma CLI) pointed at the **legacy Supabase direct host** `db.<project-ref>.supabase.co:5432`.
- That host has **no IPv4 A record** on current Supabase plans — only IPv6. Most networks don't route IPv6, so even DNS resolution returned `No answer`.
- Every `prisma migrate ...` command failed with `P1001`.

## Why runtime still worked

- `DATABASE_URL` (used by the runtime Prisma client through `datasource.url`) pointed at the **Transaction Pooler** `aws-0-<region>.pooler.supabase.com:6543` with `pgbouncer=true`.
- That endpoint is IPv4-reachable everywhere Supabase serves traffic, and the existing app code only opens short transactions, so it kept working transparently.

## Why migrations failed

- Prisma CLI uses `datasource.directUrl` → `DIRECT_URL`. It needs a real session (advisory locks, prepared statements, transactions) — which the transaction pooler does not offer.
- The CLI ignored `DATABASE_URL` and tried the unreachable legacy host directly.

## Why the Session Pooler fixes it

- Same hostname as the transaction pooler — `aws-0-<region>.pooler.supabase.com` — but on port **5432**.
- IPv4 reachable, no network changes required.
- Operates in PgBouncer session mode, so the connection behaves like a "real" Postgres session: advisory locks, prepared statements, and multi-statement transactions all work.
- Same credentials as the transaction pooler — no new secrets.

## What env values changed

| Var | File | Before | After |
|---|---|---|---|
| `DIRECT_URL` | `.env` | `db.<ref>.supabase.co:5432` | `aws-0-<region>.pooler.supabase.com:5432` (no `pgbouncer=true`) |
| `DIRECT_URL` | `.env.local` | same | same |

Automatic backups created by `scripts/migrate-direct-url-to-session-pooler.mjs`:

- `.env.bak.<timestamp>`
- `.env.local.bak.<timestamp>`

## What stayed unchanged

- `DATABASE_URL` in both `.env` and `.env.local` (still transaction pooler `:6543` + `pgbouncer=true`).
- All other env values.
- `prisma/schema.prisma` `datasource` block.
- `package.json` scripts (`db:deploy`, `db:migrate`, `check-env`).
- Application code, Auth, Supabase auth, runtime Prisma client.
- The 33 previously-applied migrations.

## Validation results

| Check | Result |
|---|---|
| `npm run check-env` | ✓ DATABASE_URL = transaction pooler; DIRECT_URL = session pooler; Prisma validate OK |
| `npx prisma validate` | ✓ schema valid |
| `npx prisma migrate status` | ✓ 33 applied, 1 pending (`20260511150000_route_command_center`) |
| `npm run db:deploy` | ✓ `All migrations have been successfully applied.` |
| Prisma runtime smoke (`deliveryRoute.findMany({ select: { brandId } })`, `deliveryZone.count`, `driverProfile.count`, `deliveryEvent.count`) | ✓ rows readable |
| `npm run typecheck` | ✓ pass |
| `npm run build` | ✓ pass |

## What's new in code

- `scripts/migrate-direct-url-to-session-pooler.mjs` — one-shot, idempotent rewriter. Never logs secrets. Refuses to run if `DATABASE_URL` is not a Supabase transaction pooler URL. Creates timestamped backups.
- `scripts/check-env.ts` — upgraded to classify `DATABASE_URL` and `DIRECT_URL` (transaction pooler / session pooler / legacy direct / other) and fail when DIRECT_URL is on the legacy host.
- `lib/env.ts` — `warnCoreEnvMissingInDevelopment` now also warns at server startup if `DIRECT_URL` is on the legacy IPv6 host, pointing the user at the migration script.
- `.env.example` — comments now distinguish transaction pooler (runtime) from session pooler (CLI) and explicitly warn against the legacy direct host.

## Remaining risks

- **Project pause.** Supabase pauses inactive free-tier projects, at which point both pooler DNS records disappear. The fix for that is the dashboard "Restore" button, not env changes.
- **IPv4 add-on regression.** If someone later buys the Supabase IPv4 add-on and re-introduces the direct host into `DIRECT_URL`, migrations will still work but we lose the session-pooler IPv4 fallback. The startup warning in `lib/env.ts` makes that change visible.
- **Connection limits.** The Session Pooler has a project-wide connection cap. KitchenOS only opens session-pooler connections during migrations / `prisma db execute`, so this is not a runtime concern.

## Future recommendations

1. **CI deploy job.** Run `npm run check-env` before `npm run db:deploy` in CI so a regressed `DIRECT_URL` fails the deploy fast.
2. **Production env audit.** Mirror the same change in Vercel / hosting env (Vercel project → Settings → Environment Variables) for any environment that still has the legacy direct host.
3. **Prisma config migration.** Prisma 7 will require migrating from `package.json#prisma` to `prisma.config.ts`. Track separately.
4. **Sentry instrumentation.** Catch `P1001` at runtime (defensive — should not happen with the transaction pooler) and surface it as a runbook alert instead of a 500.
