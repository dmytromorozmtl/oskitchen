# Mailchimp live smoke setup — OS Kitchen

**Task:** Phase 1 extension #85  
**Status:** Human gate — requires Mailchimp OAuth token in staging vault  
**Evidence:** `artifacts/mailchimp-live-smoke-summary.json` → `overall: SKIPPED` until live token is wired

This guide moves Mailchimp live proof from **SKIPPED/FAILED** → **PASSED**. PASS requires live OAuth token, audience list wiring, and campaign automation list (dry-run, no live trigger).

---

## 1. What is already wired

| Layer | Location | Behavior |
|-------|----------|----------|
| Live smoke script | `scripts/smoke-mailchimp-live.ts` | OAuth ping → audience list → automation list |
| Era 85 orchestrator | `scripts/smoke-mailchimp-live-era85.ts` | Wiring cert + live path; policy `era85-mailchimp-live-smoke-v1` |
| npm command | `npm run smoke:mailchimp-live-era85` | Cert + live smoke; writes artifact |
| Artifact | `artifacts/mailchimp-live-smoke-summary.json` | `overall: PASSED \| SKIPPED \| FAILED` |
| OAuth callback | `/api/integrations/mailchimp/oauth/callback` | Mailchimp OAuth 2.0 |
| Dashboard UI | `/dashboard/integrations/mailchimp/live` | List sync, campaign automation |

---

## 2. Provision Mailchimp OAuth (one-time)

1. Create an app at [Mailchimp Developer](https://mailchimp.com/developer/).
2. Complete OAuth in Dashboard → Integrations → Mailchimp.
3. Select an audience list for customer sync.

**Placeholder tokens** (`smoke-test-*`) are detected and skipped with reason.

---

## 3. Staging env (`.env.smoke.local`)

```bash
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=...
CHANNEL_SMOKE_OWNER_EMAIL=smoke-owner@example.com
# Or direct:
MAILCHIMP_ACCESS_TOKEN=<oauth-access-token>
CHANNEL_SMOKE_CONNECTION_ID=<integration-connection-id>
```

---

## 4. Run smoke

```bash
npm run smoke:mailchimp-live-era85
```

Expected when fully wired:

- `wiring_audit` → PASSED
- `unit_cert` → PASSED
- `mailchimp_oauth_connection` → PASSED
- `email_list_wiring` → PASSED
- `campaign_automation_wiring` → PASSED (list-only dry-run)
- `overall: PASSED`

---

## 5. Sales pitch

"Mailchimp isn't a CSV export — it's OAuth, live audience sync, and campaign automation wiring with era85 live smoke certification before go-live."
