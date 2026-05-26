# Staging remediation runbook (24–48 h)

Run **outside** production until DBA approves migrations.

**Master playbook (steps 1–6):** [`docs/CLOSED_BETA_PLAYBOOK.md`](CLOSED_BETA_PLAYBOOK.md)

## 1. Preflight (or full orchestrator)

```bash
npm run staging:preflight
# Or all migrate + backfill steps in sequence:
# npm run staging:remediation-all
```

Required env on staging:

- `DATABASE_URL`
- `RATE_LIMIT_ADAPTER=upstash`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Optional for impersonation paid pilot (use one):

- `PLATFORM_IMPERSONATION_TOTP_SECRET` (authenticator app — preferred)
- `PLATFORM_IMPERSONATION_STEP_UP_TOKEN` (shared secret fallback)

## 2. Migrate + backfill

```bash
npx prisma migrate deploy
npm run backfill:workspace-id -- --dry-run
npm run backfill:workspace-id
npm run backfill:workspace-phase2 -- --dry-run
npm run backfill:workspace-phase2
npx prisma generate
```

## 3. Verify backfill

```bash
npm run check:backfill
```

Expect `0` NULL `workspace_id` on orders, menus, products, integration_connections, webhook_events.

## 4. Smoke (1–2 h)

```bash
export SMOKE_BASE_URL="https://your-staging.example.com"
export CRON_SECRET="..."
export SMOKE_PUBLIC_API_KEY="kos_..."
export SMOKE_SESSION_COOKIE="..."   # from browser DevTools → Application → Cookies
export SMOKE_DELIVERY_CONNECTION_ID="uuid-tenant-a"
export SMOKE_DELIVERY_CONNECTION_ID_OTHER="uuid-tenant-b"
npm run smoke:remediation
npm run smoke:public-api
npm run smoke:woo-shopify
```

Playwright delivery IDOR (automatic cookie via auth setup):

```bash
# 1) Generate session once:
E2E_LOGIN_EMAIL=... E2E_LOGIN_PASSWORD=... npx playwright test e2e/auth.setup.ts --project=setup
eval "$(npm run smoke:session-cookie --silent)"

# 2) Run delivery IDOR:
SMOKE_DELIVERY_CONNECTION_ID_OTHER=... npx playwright test tests/e2e/remediation-delivery-idor.spec.ts --project=chromium-authed
```

Checks:

| Check | Expectation |
|-------|-------------|
| Public API invalid email | `POST /api/public/v1/orders` → 400 |
| Delivery quote (no session) | 401 |
| Delivery quote/create with other tenant `connectionId` | 404 (manual with session cookie) |
| Experimental cron | 200 `{ skipped: true }` when `ENABLE_EXPERIMENTAL_CRONS` unset |
| Streaming export | `GET /api/export?type=production` and `?type=inventory` → CSV chunked |
| Staff export RBAC | Staff without `workspace.settings` → 403 on import center |

Security bundle (staging DB):

```bash
RUN_DB_INTEGRATION=1 npm run test:security
```

Manual (15 min):

- Owner + staff member: both see same orders on `/dashboard/orders` and `/dashboard/order-hub` after backfill.
- Platform impersonation: TOTP or step-up token required on `/platform/users`.

## 5. Seven-day follow-up

- RBAC Phase B: `settings-center` + `orders` mutations use workspace permissions.
- `RUN_DB_INTEGRATION=1 npm test -- tests/integration/tenant-isolation.test.ts`
- Woo/Shopify certification on staging.

## 6. Readiness gates

| Milestone | Requires |
|-----------|----------|
| Closed beta | migrate deploy + Upstash + smoke pass |
| Paid pilot | backfill complete + tenant E2E + impersonation step-up token |
