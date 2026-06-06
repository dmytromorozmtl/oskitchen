# Klaviyo live smoke setup — OS Kitchen

**Task:** Phase 1 extension #84  
**Status:** Human gate — requires Klaviyo private API key in staging vault  
**Evidence:** `artifacts/klaviyo-live-smoke-summary.json` → `overall: SKIPPED` until live key is wired

This guide moves Klaviyo live proof from **SKIPPED/FAILED** → **PASSED**. PASS requires live API key, segment list/export, and campaign trigger wiring (dry-run, zero recipients).

---

## 1. What is already wired

| Layer | Location | Behavior |
|-------|----------|----------|
| Live smoke script | `scripts/smoke-klaviyo-live.ts` | API verify → segment list/export → campaign dry-run |
| Era 84 orchestrator | `scripts/smoke-klaviyo-live-era84.ts` | Wiring cert + live path; policy `era84-klaviyo-live-smoke-v1` |
| npm command | `npm run smoke:klaviyo-live-era84` | Cert + live smoke; writes artifact |
| Artifact | `artifacts/klaviyo-live-smoke-summary.json` | `overall: PASSED \| SKIPPED \| FAILED` |
| Connect route | `/api/integrations/klaviyo/connect` | API key connection |
| Dashboard UI | `/dashboard/integrations/klaviyo/live` | Segment export, campaign triggers |

---

## 2. Provision Klaviyo API key (one-time)

1. Create a private API key in Klaviyo → Settings → API Keys.
2. Grant segments and campaigns scopes.
3. Connect in Dashboard → Integrations → Klaviyo.
4. Note a segment ID for export smoke (optional — first segment auto-selected).

**Placeholder keys** (`smoke-test-*`) are detected and skipped with reason.

---

## 3. Staging env (`.env.smoke.local`)

```bash
KLAVIYO_API_KEY=pk_live_...
KLAVIYO_SEGMENT_ID=<optional-segment-id>
```

---

## 4. Run smoke

```bash
npm run smoke:klaviyo-live-era84
```

Expected when fully wired:

- `wiring_audit` → PASSED
- `unit_cert` → PASSED
- `klaviyo_api_key_verify` → PASSED
- `segment_list_wiring` → PASSED
- `segment_export_wiring` → PASSED or SKIPPED (empty account)
- `campaign_trigger_wiring` → PASSED (dry-run, zero recipients)
- `overall: PASSED`

---

## 5. Sales pitch

"Klaviyo isn't a CSV dump — it's API key auth, live segment export, and campaign trigger wiring with era84 live smoke certification before go-live."
