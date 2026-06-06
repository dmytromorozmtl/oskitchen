# Grubhub live smoke setup — OS Kitchen

**Task:** Phase 1 extension #78  
**Status:** Human gate — requires Grubhub partner sandbox + staging vault secrets  
**Evidence:** `artifacts/grubhub-live-smoke-summary.json` → `overall: SKIPPED` until live partner merchant is wired

This guide moves Grubhub live proof from **SKIPPED/FAILED** → **PASSED**. PASS requires live marketplace API access, a signed `orders` webhook delivered to staging, a canonical `ExternalOrder` row, KDS kitchen import (`importedOrderId`), and status sync wiring — not credentials-only certification alone.

---

## 1. What is already wired (no code changes needed)

| Layer | Location | Behavior |
|-------|----------|----------|
| Live smoke script | `scripts/smoke-grubhub-live.ts` | API connect → synthetic orders webhook → ExternalOrder → KDS import |
| Era 78 orchestrator | `scripts/smoke-grubhub-live-era78.ts` | Wiring cert + live path; policy `era78-grubhub-live-smoke-v1` |
| npm command | `npm run smoke:grubhub-live-era78` | Cert + live smoke; writes artifact |
| Legacy npm | `npm run smoke:grubhub-live` | Live path only (no cert chain) |
| Artifact | `artifacts/grubhub-live-smoke-summary.json` | `overall: PASSED \| SKIPPED \| FAILED` |
| Webhook route | `/api/webhooks/grubhub/orders?cid={connectionId}` | HMAC signature validation |
| Dashboard UI | `/dashboard/integrations/grubhub/live` | OAuth, menu sync, order import |

Related docs: [`grubhub-live.md`](./grubhub-live.md).

---

## 2. Provision Grubhub partner sandbox (one-time)

Use a **dedicated partner sandbox merchant** — never production customer data.

1. Apply for Grubhub Marketplace API access in the [Grubhub developer portal](https://developer.grubhub.com/).
2. Create an OAuth application or API key with order read and menu write scopes.
3. Note your **API key** (or OAuth client credentials) and **merchant ID**.
4. Register the webhook URL:

   ```
   https://<staging-host>/api/webhooks/grubhub/orders?cid=<connectionId>
   ```

5. Copy the webhook signing secret into Dashboard → Integrations → Grubhub.

**Placeholder merchant IDs** (`smoke-test-*`) are detected and skipped with reason — update the saved connection before expecting `overall: PASSED`.

---

## 3. Staging env (`.env.smoke.local`)

```bash
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=...
E2E_STAGING_BASE_URL=https://staging.os-kitchen.com
CHANNEL_SMOKE_OWNER_EMAIL=smoke-owner@example.com
# Or direct:
GRUBHUB_API_KEY=...
GRUBHUB_MERCHANT_ID=<partner-merchant-id>
GRUBHUB_WEBHOOK_SECRET=...
CHANNEL_SMOKE_CONNECTION_ID=<integration-connection-id>
```

---

## 4. Run smoke

```bash
npm run smoke:grubhub-live-era78
```

Expected when fully wired:

- `wiring_audit` → PASSED
- `unit_cert` → PASSED
- `grubhub_api_connection` → PASSED
- `staging_webhook_delivery` → PASSED
- `db_canonical_order` → PASSED
- `kds_kitchen_import` → PASSED
- `status_sync_wiring` → PASSED
- `overall: PASSED`

---

## 5. Competitor comparison

| Capability | Toast | KitchenOS |
|------------|-------|-----------|
| Grubhub order webhook → KDS | Yes | Yes (live smoke cert) |
| Status sync back to Grubhub | Yes | Yes (`syncGrubhubStatusFromKitchenOrder`) |
| Menu sync | Yes | Yes |
| Wiring audit artifact | No | Yes (`era78-grubhub-live-smoke-v1`) |

---

## 6. Sales pitch

"Grubhub orders land on your KDS in seconds — and when you bump a ticket, Grubhub gets the update automatically. Our era78 live smoke cert proves the full path in your staging environment before go-live."
