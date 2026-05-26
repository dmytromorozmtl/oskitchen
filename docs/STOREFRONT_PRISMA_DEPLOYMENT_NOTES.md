# Storefront Prisma deployment notes

**Migrations:** `prisma/migrations/20260615140000_storefront_followup_gaps` (follow-up columns + `storefront_fulfillment_rules.active`), `20260615150000_storefront_first_party_analytics_mode` (`first_party_analytics_mode`).

**Verify script:** `npm run verify:storefront-migration` — validates files, runs `prisma validate`, optional `VERIFY_STOREFRONT_MIGRATION_DB=1` + `DATABASE_URL` for `migrate status`. **Never prints secrets.**

**Column probe:** `npm run verify:storefront-db` — same script with `--db-check`; when `DATABASE_URL` is set, runs a read-only `information_schema` check for `first_party_analytics_mode` (connection string is never echoed).

**Repair:** If migrate deploy cannot run, `npm run db:repair-storefront` applies idempotent SQL (`prisma/sql/ensure-storefront-followup-columns.sql`) — add new columns there when introducing nullable/repair-safe columns.

**Runtime (temporary):** The Prisma client applies a small extension (`lib/prisma-storefront-first-party-column-compat.ts`) so `StorefrontSettings` reads/writes do not crash if `first_party_analytics_mode` is missing; values default to `ALWAYS_ON` until the column exists. **Persisted settings still require** `db:deploy` or `db:repair-storefront` — the extension is not a substitute for migrating.

**Supabase:** Prefer session pooler for Prisma; direct host may be unreachable from CI — script warns.

**Commands:** `npm run db:deploy` then `npx prisma migrate status`.

**Do not:** Auto-apply migrations from this script or commit live credentials.
