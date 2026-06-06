# Uber Eats live smoke setup — OS Kitchen

**Task:** Phase 1 extension #76  
**Status:** Human gate — requires Uber Eats partner sandbox + staging vault secrets  
**Evidence:** `artifacts/uber-eats-live-smoke-summary.json` → `overall: SKIPPED` until live partner store is wired

This guide moves Uber Eats live proof from **SKIPPED/FAILED** → **PASSED**. PASS requires live OAuth token exchange, a signed `orders` webhook delivered to staging, a canonical `ExternalOrder` row, KDS kitchen import (`importedOrderId`), and status sync wiring — not credentials-only certification alone.

---

## 1. What is already wired (no code changes needed)

| Layer | Location | Behavior |
|-------|----------|----------|
| Live smoke script | `scripts/smoke-uber-eats-live.ts` | OAuth connect → synthetic orders webhook → ExternalOrder → KDS import |
| Era 76 orchestrator | `scripts/smoke-uber-eats-live-era76.ts` | Wiring cert + live path; policy `era76-uber-eats-live-smoke-v1` |
| npm command | `npm run smoke:uber-eats-live-era76` | Cert + live smoke; writes artifact |
| Legacy npm | `npm run smoke:uber-eats-live` | Live path only (no cert chain) |
| Artifact | `artifacts/uber-eats-live-smoke-summary.json` | `overall: PASSED \| SKIPPED \| FAILED` |
| Webhook route | `/api/webhooks/uber-eats/orders?cid={connectionId}` | HMAC signature validation |
| Dashboard UI | `/dashboard/integrations/uber-eats/live` | OAuth, menu sync, order import |

Related docs: [`uber-eats-live.md`](./uber-eats-live.md).

---

## 2. Provision Uber Eats partner sandbox (one-time)

Use a **dedicated partner sandbox store** — never production customer data.

1. Apply for Uber Eats Marketplace API access in the [Uber developer portal](https://developer.uber.com/).
2. Create an OAuth application with scopes: `eats.store`, `eats.order`, `eats.store.status.write`.
3. Note your **client ID**, **client secret**, and **store UUID**.
4. Register the webhook URL:

   ```
   https://<staging-host>/api/webhooks/uber-eats/orders?cid=<connectionId>
   ```

5. Copy the webhook signing secret into Dashboard → Integrations → Uber Eats.

**Placeholder hosts** (`smoke-test-*` store UUIDs) are detected and skipped with reason — update the saved connection before expecting `overall: PASSED`.

---

## 3. Staging env (`.env.smoke.local`)

```bash
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=...
E2E_STAGING_BASE_URL=https://staging.os-kitchen.com
CHANNEL_SMOKE_OWNER_EMAIL=smoke-owner@example.com
# Or direct:
UBER_EATS_CLIENT_ID=...
UBER_EATS_CLIENT_SECRET=...
UBER_EATS_STORE_ID=<partner-store-uuid>
UBER_EATS_WEBHOOK_SECRET=...
CHANNEL_SMOKE_CONNECTION_ID=<integration-connection-id>
```

---

## 4. Run smoke

```bash
npm run smoke:uber-eats-live-era76
```

Expected when fully wired:

- `wiring_audit` → PASSED
- `unit_cert` → PASSED
- `uber_oauth_connection` → PASSED
- `staging_webhook_delivery` → PASSED
- `db_canonical_order` → PASSED
- `kds_kitchen_import` → PASSED
- `status_sync_wiring` → PASSED
- `overall: PASSED`

---

## 5. Human gates

| Gate | Unblocks |
|------|----------|
| Partner-approved Uber credentials | `uber_oauth_connection` PASSED |
| Real store UUID (not placeholder) | Live path not SKIPPED |
| Staging `DATABASE_URL` matches webhook target | `db_canonical_order` PASSED |
| Webhook secret matches Uber portal | `staging_webhook_delivery` PASSED |
