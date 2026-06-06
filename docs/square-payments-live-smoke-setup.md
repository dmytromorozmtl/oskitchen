# Square Payments live smoke setup — OS Kitchen

**Task:** Phase 1 extension #87  
**Status:** Human gate — requires Square sandbox OAuth token in staging vault  
**Evidence:** `artifacts/square-payments-live-smoke-summary.json` → `overall: SKIPPED` until live token is wired

This guide moves Square Payments live proof from **SKIPPED/FAILED** → **PASSED**. PASS requires live OAuth token, locations API ping, and refund sync wiring.

---

## 1. What is already wired

| Layer | Location | Behavior |
|-------|----------|----------|
| Live smoke script | `scripts/smoke-square-payments-live.ts` | OAuth ping → payment dry-run → refund sync |
| Era 87 orchestrator | `scripts/smoke-square-payments-live-era87.ts` | Wiring cert + live path; policy `era87-square-payments-live-smoke-v1` |
| npm command | `npm run smoke:square-payments-live-era87` | Cert + live smoke; writes artifact |
| Artifact | `artifacts/square-payments-live-smoke-summary.json` | `overall: PASSED \| SKIPPED \| FAILED` |
| OAuth callback | `/api/integrations/square-payments/oauth/callback` | Square OAuth 2.0 |
| Dashboard UI | `/dashboard/integrations/square-payments/live` | Process payment, sync refunds |

---

## 2. Provision Square sandbox (one-time)

1. Create an app at [Square Developer](https://developer.squareup.com/).
2. Enable Payments + Refunds scopes.
3. Complete OAuth in Dashboard → Integrations → Square Payments.
4. Note your **location ID** from Square Dashboard.

**Placeholder tokens** (`smoke-test-*`) are detected and skipped with reason.

---

## 3. Staging env (`.env.smoke.local`)

```bash
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=...
CHANNEL_SMOKE_OWNER_EMAIL=smoke-owner@example.com
# Or direct:
SQUARE_PAYMENTS_ACCESS_TOKEN=EAAA...
SQUARE_PAYMENTS_LOCATION_ID=<location-id>
CHANNEL_SMOKE_CONNECTION_ID=<integration-connection-id>
```

---

## 4. Run smoke

```bash
npm run smoke:square-payments-live-era87
```

Expected when fully wired:

- `wiring_audit` → PASSED
- `unit_cert` → PASSED
- `square_oauth_connection` → PASSED
- `payment_processing_wiring` → SKIPPED (dry-run, no sandbox source_id)
- `refund_sync_wiring` → PASSED or SKIPPED
- `overall: PASSED`

---

## 5. Sales pitch

"Square Payments isn't a redirect — it's OAuth, live payment processing, and refund sync with era87 live smoke certification before go-live."
