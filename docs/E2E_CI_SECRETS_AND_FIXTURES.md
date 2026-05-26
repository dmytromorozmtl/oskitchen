# E2E CI — secrets & fixtures

## Required secrets (examples — names only)

| Variable | Purpose |
|----------|---------|
| `PLAYWRIGHT_BASE_URL` | Target deployment URL |
| `DATABASE_URL` | Ephemeral Postgres for CI |
| `E2E_LOGIN_EMAIL` / `E2E_LOGIN_PASSWORD` | Existing dashboard auth project (optional overlap) |
| `E2E_PILOT_EMAIL` / `E2E_PILOT_PASSWORD` | Paid pilot journey (`npm run test:e2e:pilot`) — see `docs/E2E_PILOT_JOURNEY.md` |
| `E2E_PILOT_STAFF_EMAIL` / `E2E_PILOT_STAFF_PASSWORD` | Optional staff tenancy check in pilot suite |
| `CRON_SECRET` | Only if tests invoke cron route |
| `NEXT_PUBLIC_SUPABASE_*` / server keys | If auth flows hit Supabase |

**Never** commit: Stripe secret keys, Woo/Shopify signing secrets, production Supabase service role, `SENTRY_DSN`, `CRON_SECRET`.

## Fixtures

- **Founder / superadmin** — seed user matching operational policy (`workspace.moroz@gmail.com` remains full access in prod seed; CI may clone pattern).
- **Normal client** — workspace member without platform permissions.
- **Webhook payloads** — JSON fixtures under `tests/fixtures/webhooks/` (future) with synthetic signatures **only** if crypto helpers are stubbed; otherwise run against dedicated sandbox stores.

## DB isolation

- CI should `prisma migrate deploy` on empty DB, then `tsx` seed script for Playwright.
- Tear down: drop schema or ephemeral container per job.

## Local

- Developers can run `npm run test:e2e` — skipped specs exit quickly unless env filled.
