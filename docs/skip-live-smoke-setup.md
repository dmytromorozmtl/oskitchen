# Skip / Just Eat live smoke setup — OS Kitchen

**Task:** Phase 1 extension #79  
**Status:** Human gate — requires Skip partner sandbox + staging vault secrets  
**Evidence:** `artifacts/skip-live-smoke-summary.json` → `overall: SKIPPED` until live partner restaurant is wired

This guide moves Skip/Just Eat live proof from **SKIPPED/FAILED** → **PASSED**. PASS requires live OAuth token exchange, a signed `orders` webhook delivered to staging, a canonical `ExternalOrder` row, KDS kitchen import (`importedOrderId`), and status sync wiring — not credentials-only certification alone.

---

## 1. What is already wired (no code changes needed)

| Layer | Location | Behavior |
|-------|----------|----------|
| Live smoke script | `scripts/smoke-skip-live.ts` | OAuth connect → synthetic orders webhook → ExternalOrder → KDS import |
| Era 79 orchestrator | `scripts/smoke-skip-live-era79.ts` | Wiring cert + live path; policy `era79-skip-live-smoke-v1` |
| npm command | `npm run smoke:skip-live-era79` | Cert + live smoke; writes artifact |
| Legacy npm | `npm run smoke:skip-live` | Live path only (no cert chain) |
| Artifact | `artifacts/skip-live-smoke-summary.json` | `overall: PASSED \| SKIPPED \| FAILED` |
| Webhook route | `/api/webhooks/skip/orders?cid={connectionId}` | HMAC signature validation |
| Dashboard UI | `/dashboard/integrations/skip/live` | OAuth, order import |

Related docs: integration registry entry `skip` (LIVE).

---

## 2. Provision Skip partner sandbox (one-time)

Use a **dedicated partner sandbox restaurant** — never production customer data.

1. Apply for Skip / Just Eat Marketplace API access via the partner developer portal.
2. Create an OAuth application with order read scopes.
3. Note your **client ID**, **client secret**, and **restaurant ID**.
4. Register the webhook URL:

   ```
   https://<staging-host>/api/webhooks/skip/orders?cid=<connectionId>
   ```

5. Copy the webhook signing secret into Dashboard → Integrations → Skip.

**Placeholder restaurant IDs** (`smoke-test-*`) are detected and skipped with reason — update the saved connection before expecting `overall: PASSED`.

---

## 3. Staging env (`.env.smoke.local`)

```bash
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=...
E2E_STAGING_BASE_URL=https://staging.os-kitchen.com
CHANNEL_SMOKE_OWNER_EMAIL=smoke-owner@example.com
# Or direct:
SKIP_CLIENT_ID=...
SKIP_CLIENT_SECRET=...
SKIP_RESTAURANT_ID=<partner-restaurant-id>
SKIP_WEBHOOK_SECRET=...
CHANNEL_SMOKE_CONNECTION_ID=<integration-connection-id>
```

---

## 4. Run smoke

```bash
npm run smoke:skip-live-era79
```

Expected when fully wired:

- `wiring_audit` → PASSED
- `unit_cert` → PASSED
- `skip_api_connection` → PASSED
- `staging_webhook_delivery` → PASSED
- `db_canonical_order` → PASSED
- `kds_kitchen_import` → PASSED
- `status_sync_wiring` → PASSED
- `overall: PASSED`

---

## 5. Competitor comparison

| Capability | Toast | KitchenOS |
|------------|-------|-----------|
| Skip/Just Eat webhook → KDS | Limited (CA) | Yes (live smoke cert) |
| Status sync back to Skip | Yes | Yes (`syncSkipStatusFromKitchenOrder`) |
| Wiring audit artifact | No | Yes (`era79-skip-live-smoke-v1`) |

---

## 6. Sales pitch

"Skip and Just Eat orders land on your KDS in seconds — Canadian delivery channels fully wired with honest live smoke certification before go-live."
