# Xero live smoke setup — OS Kitchen

**Task:** Phase 1 extension #81  
**Status:** Human gate — requires Xero demo organisation + staging vault secrets  
**Evidence:** `artifacts/xero-live-smoke-summary.json` → `overall: SKIPPED` until live tenant is wired

This guide moves Xero live proof from **SKIPPED/FAILED** → **PASSED**. PASS requires live OAuth token, supplier invoice sync, and bank reconciliation wiring.

---

## 1. What is already wired

| Layer | Location | Behavior |
|-------|----------|----------|
| Live smoke script | `scripts/smoke-xero-live.ts` | OAuth ping → invoice sync → bank reconcile |
| Era 81 orchestrator | `scripts/smoke-xero-live-era81.ts` | Wiring cert + live path; policy `era81-xero-live-smoke-v1` |
| npm command | `npm run smoke:xero-live-era81` | Cert + live smoke; writes artifact |
| Artifact | `artifacts/xero-live-smoke-summary.json` | `overall: PASSED \| SKIPPED \| FAILED` |
| OAuth callback | `/api/integrations/xero/oauth/callback` | Xero OAuth 2.0 |
| Dashboard UI | `/dashboard/integrations/xero/live` | Invoice sync, bank reconcile |

---

## 2. Provision Xero demo organisation (one-time)

1. Create a app at [Xero Developer](https://developer.xero.com/).
2. Enable accounting scopes.
3. Connect a **demo organisation** — note the **tenant ID**.
4. Complete OAuth in Dashboard → Integrations → Xero.

**Placeholder tenant IDs** (`smoke-test-*`) are detected and skipped with reason.

---

## 3. Staging env (`.env.smoke.local`)

```bash
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=...
CHANNEL_SMOKE_OWNER_EMAIL=smoke-owner@example.com
# Or direct:
XERO_CLIENT_ID=...
XERO_ACCESS_TOKEN=...
XERO_TENANT_ID=<demo-tenant-id>
CHANNEL_SMOKE_CONNECTION_ID=<integration-connection-id>
```

---

## 4. Run smoke

```bash
npm run smoke:xero-live-era81
```

Expected when fully wired:

- `wiring_audit` → PASSED
- `unit_cert` → PASSED
- `xero_oauth_connection` → PASSED
- `invoice_sync_wiring` → PASSED or SKIPPED
- `bank_reconciliation_wiring` → PASSED or SKIPPED
- `overall: PASSED`

---

## 5. Sales pitch

"Xero isn't a CSV dump — it's OAuth, live invoice sync, and bank reconciliation with era81 live smoke certification before go-live."
