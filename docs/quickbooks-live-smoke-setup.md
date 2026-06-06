# QuickBooks live smoke setup — OS Kitchen

**Task:** Phase 1 extension #80  
**Status:** Human gate — requires Intuit QuickBooks sandbox + staging vault secrets  
**Evidence:** `artifacts/quickbooks-live-smoke-summary.json` → `overall: SKIPPED` until live sandbox realm is wired

This guide moves QuickBooks live proof from **SKIPPED/FAILED** → **PASSED**. PASS requires live OAuth token, chart of accounts query, and daily sales journal wiring — not credentials-only certification alone.

---

## 1. What is already wired

| Layer | Location | Behavior |
|-------|----------|----------|
| Live smoke script | `scripts/smoke-quickbooks-live.ts` | OAuth ping → chart of accounts → journal wiring |
| Era 80 orchestrator | `scripts/smoke-quickbooks-live-era80.ts` | Wiring cert + live path; policy `era80-quickbooks-live-smoke-v1` |
| npm command | `npm run smoke:quickbooks-live-era80` | Cert + live smoke; writes artifact |
| Artifact | `artifacts/quickbooks-live-smoke-summary.json` | `overall: PASSED \| SKIPPED \| FAILED` |
| OAuth callback | `/api/integrations/quickbooks/oauth/callback` | Intuit OAuth 2.0 |
| Dashboard UI | `/dashboard/integrations/quickbooks/live` | Account mapping, journal sync |

---

## 2. Provision Intuit QuickBooks sandbox (one-time)

1. Create an app at [Intuit Developer](https://developer.intuit.com/).
2. Enable QuickBooks Online Accounting scope.
3. Connect a **sandbox company** — note the **realm ID**.
4. Complete OAuth in Dashboard → Integrations → QuickBooks.
5. Map **sales** and **deposit** accounts on the LIVE dashboard.

**Placeholder realm IDs** (`smoke-test-*`) are detected and skipped with reason.

---

## 3. Staging env (`.env.smoke.local`)

```bash
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=...
CHANNEL_SMOKE_OWNER_EMAIL=smoke-owner@example.com
# Or direct:
QUICKBOOKS_CLIENT_ID=...
QUICKBOOKS_CLIENT_SECRET=...
QUICKBOOKS_ACCESS_TOKEN=...
QUICKBOOKS_REALM_ID=<sandbox-realm-id>
CHANNEL_SMOKE_CONNECTION_ID=<integration-connection-id>
```

---

## 4. Run smoke

```bash
npm run smoke:quickbooks-live-era80
```

Expected when fully wired:

- `wiring_audit` → PASSED
- `unit_cert` → PASSED
- `quickbooks_oauth_connection` → PASSED
- `chart_of_accounts_sync` → PASSED
- `daily_journal_wiring` → PASSED or SKIPPED (account mapping pending)
- `overall: PASSED`

---

## 5. Sales pitch

"QuickBooks sync isn't a CSV export — it's OAuth, live chart of accounts, and daily sales journal automation with era80 live smoke certification before go-live."
