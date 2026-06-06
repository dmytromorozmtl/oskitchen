# Homebase live smoke setup — OS Kitchen

**Task:** Phase 1 extension #83  
**Status:** Human gate — requires Homebase demo location + staging vault secrets  
**Evidence:** `artifacts/homebase-live-smoke-summary.json` → `overall: SKIPPED` until live location is wired

This guide moves Homebase live proof from **SKIPPED/FAILED** → **PASSED**. PASS requires live OAuth token, schedule import, and time clock sync wiring.

---

## 1. What is already wired

| Layer | Location | Behavior |
|-------|----------|----------|
| Live smoke script | `scripts/smoke-homebase-live.ts` | OAuth ping → schedule import → time clock |
| Era 83 orchestrator | `scripts/smoke-homebase-live-era83.ts` | Wiring cert + live path; policy `era83-homebase-live-smoke-v1` |
| npm command | `npm run smoke:homebase-live-era83` | Cert + live smoke; writes artifact |
| Artifact | `artifacts/homebase-live-smoke-summary.json` | `overall: PASSED \| SKIPPED \| FAILED` |
| OAuth callback | `/api/integrations/homebase/oauth/callback` | Homebase OAuth 2.0 |
| Dashboard UI | `/dashboard/integrations/homebase/live` | Schedule sync, time clock |

---

## 2. Provision Homebase demo location (one-time)

1. Create an app in the Homebase developer portal.
2. Enable schedule and time clock scopes.
3. Connect a **demo location** — note the **location ID**.
4. Complete OAuth in Dashboard → Integrations → Homebase.
5. Map OS Kitchen staff members to Homebase employee IDs.

**Placeholder location IDs** (`smoke-test-*`) are detected and skipped with reason.

---

## 3. Staging env (`.env.smoke.local`)

```bash
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=...
CHANNEL_SMOKE_OWNER_EMAIL=smoke-owner@example.com
# Or direct:
HOMEBASE_CLIENT_ID=...
HOMEBASE_ACCESS_TOKEN=...
HOMEBASE_LOCATION_ID=<demo-location-id>
CHANNEL_SMOKE_CONNECTION_ID=<integration-connection-id>
```

---

## 4. Run smoke

```bash
npm run smoke:homebase-live-era83
```

Expected when fully wired:

- `wiring_audit` → PASSED
- `unit_cert` → PASSED
- `homebase_oauth_connection` → PASSED
- `schedule_import_wiring` → PASSED or SKIPPED (no staff mappings)
- `time_clock_wiring` → PASSED or SKIPPED (no staff mappings)
- `overall: PASSED`

---

## 5. Sales pitch

"Homebase isn't a spreadsheet export — it's OAuth, live schedule import, and time clock sync with era83 live smoke certification before go-live."
