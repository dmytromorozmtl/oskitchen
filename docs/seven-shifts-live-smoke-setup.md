# 7shifts live smoke setup — OS Kitchen

**Task:** Phase 1 extension #82  
**Status:** Human gate — requires 7shifts demo company + staging vault secrets  
**Evidence:** `artifacts/seven-shifts-live-smoke-summary.json` → `overall: SKIPPED` until live company is wired

This guide moves 7shifts live proof from **SKIPPED/FAILED** → **PASSED**. PASS requires live OAuth token, schedule import, and labor cost sync wiring.

---

## 1. What is already wired

| Layer | Location | Behavior |
|-------|----------|----------|
| Live smoke script | `scripts/smoke-seven-shifts-live.ts` | OAuth ping → schedule import → labor sync |
| Era 82 orchestrator | `scripts/smoke-seven-shifts-live-era82.ts` | Wiring cert + live path; policy `era82-seven-shifts-live-smoke-v1` |
| npm command | `npm run smoke:seven-shifts-live-era82` | Cert + live smoke; writes artifact |
| Artifact | `artifacts/seven-shifts-live-smoke-summary.json` | `overall: PASSED \| SKIPPED \| FAILED` |
| OAuth callback | `/api/integrations/7shifts/oauth/callback` | 7shifts OAuth 2.0 |
| Dashboard UI | `/dashboard/integrations/7shifts/live` | Schedule sync, labor cost |

---

## 2. Provision 7shifts demo company (one-time)

1. Create an app at [7shifts Developer](https://developers.7shifts.com/).
2. Enable shifts and labor scopes.
3. Connect a **demo company** — note the **company ID**.
4. Complete OAuth in Dashboard → Integrations → 7shifts.
5. Map OS Kitchen staff members to 7shifts user IDs.

**Placeholder company IDs** (`smoke-test-*`) are detected and skipped with reason.

---

## 3. Staging env (`.env.smoke.local`)

```bash
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=...
CHANNEL_SMOKE_OWNER_EMAIL=smoke-owner@example.com
# Or direct:
SEVENSHIFTS_CLIENT_ID=...
SEVENSHIFTS_ACCESS_TOKEN=...
SEVENSHIFTS_COMPANY_ID=<demo-company-id>
CHANNEL_SMOKE_CONNECTION_ID=<integration-connection-id>
```

---

## 4. Run smoke

```bash
npm run smoke:seven-shifts-live-era82
```

Expected when fully wired:

- `wiring_audit` → PASSED
- `unit_cert` → PASSED
- `seven_shifts_oauth_connection` → PASSED
- `schedule_import_wiring` → PASSED or SKIPPED (no staff mappings)
- `labor_sync_wiring` → PASSED
- `overall: PASSED`

---

## 5. Sales pitch

"7shifts isn't a CSV export — it's OAuth, live schedule import/export, and labor cost sync with era82 live smoke certification before go-live."
