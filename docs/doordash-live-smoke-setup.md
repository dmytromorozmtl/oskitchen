# DoorDash live smoke setup — OS Kitchen

**Task:** Phase 1 extension #77  
**Status:** Human gate — requires DoorDash partner sandbox + staging vault secrets  
**Evidence:** `artifacts/doordash-live-smoke-summary.json` → `overall: SKIPPED` until live partner merchant is wired

This guide moves DoorDash live proof from **SKIPPED/FAILED** → **PASSED**. PASS requires live marketplace API access, a signed `orders` webhook delivered to staging, a canonical `ExternalOrder` row, KDS kitchen import (`importedOrderId`), and status sync wiring — not credentials-only certification alone.

---

## 1. What is already wired (no code changes needed)

| Layer | Location | Behavior |
|-------|----------|----------|
| Live smoke script | `scripts/smoke-doordash-live.ts` | API connect → synthetic orders webhook → ExternalOrder → KDS import |
| Era 77 orchestrator | `scripts/smoke-doordash-live-era77.ts` | Wiring cert + live path; policy `era77-doordash-live-smoke-v1` |
| npm command | `npm run smoke:doordash-live-era77` | Cert + live smoke; writes artifact |
| Legacy npm | `npm run smoke:doordash-live` | Live path only (no cert chain) |
| Artifact | `artifacts/doordash-live-smoke-summary.json` | `overall: PASSED \| SKIPPED \| FAILED` |
| Webhook route | `/api/webhooks/doordash/orders?cid={connectionId}` | HMAC signature validation |
| Dashboard UI | `/dashboard/integrations/doordash/live` | OAuth, menu sync, order import |

Related docs: [`doordash-live.md`](./doordash-live.md).

---

## 2. Provision DoorDash partner sandbox (one-time)

Use a **dedicated partner sandbox merchant** — never production customer data.

1. Apply for DoorDash Marketplace API access in the [DoorDash developer portal](https://developer.doordash.com/).
2. Create an OAuth application or API key with scopes: `merchant_read`, `order_read`, `menu_write`.
3. Note your **API key** (or OAuth client credentials) and **merchant ID**.
4. Register the webhook URL:

   ```
   https://<staging-host>/api/webhooks/doordash/orders?cid=<connectionId>
   ```

5. Copy the webhook signing secret into Dashboard → Integrations → DoorDash.

**Placeholder merchant IDs** (`smoke-test-*`) are detected and skipped with reason — update the saved connection before expecting `overall: PASSED`.

---

## 3. Staging env (`.env.smoke.local`)

```bash
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=...
E2E_STAGING_BASE_URL=https://staging.os-kitchen.com
CHANNEL_SMOKE_OWNER_EMAIL=smoke-owner@example.com
# Or direct:
DOORDASH_API_KEY=...
DOORDASH_MERCHANT_ID=<partner-merchant-id>
DOORDASH_WEBHOOK_SECRET=...
CHANNEL_SMOKE_CONNECTION_ID=<integration-connection-id>
```

---

## 4. Run smoke

```bash
npm run smoke:doordash-live-era77
```

Expected when fully wired:

- `wiring_audit` → PASSED
- `unit_cert` → PASSED
- `doordash_api_connection` → PASSED
- `staging_webhook_delivery` → PASSED
- `db_canonical_order` → PASSED
- `kds_kitchen_import` → PASSED
- `status_sync_wiring` → PASSED
- `overall: PASSED`

---

## 5. Competitor comparison

| Capability | Toast | KitchenOS |
|------------|-------|-----------|
| DoorDash order webhook → KDS | Yes | Yes (live smoke cert) |
| Status sync back to DoorDash | Yes | Yes (`syncDoorDashStatusFromKitchenOrder`) |
| Menu sync | Yes | Yes |
| Wiring audit artifact | No | Yes (`era77-doordash-live-smoke-v1`) |

---

## 6. Sales pitch

"DoorDash orders land on your KDS in seconds — and when you bump a ticket, DoorDash gets the update automatically. Our era77 live smoke cert proves the full path in your staging environment before go-live."
