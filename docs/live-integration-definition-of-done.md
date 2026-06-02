# LIVE integration — definition of done

**Policy:** `live-integration-dod-v1`  
**Status:** engineering + GTM gate for promoting BETA → LIVE  
**Updated:** 2026-06-02  
**Registry:** [`lib/integrations/integration-registry.ts`](../lib/integrations/integration-registry.ts) · [`lib/channels/channel-registry.ts`](../lib/channels/channel-registry.ts)  
**Parent:** [`pilot-execution-checklist.md`](./pilot-execution-checklist.md) · [`feature-maturity-matrix.md`](./feature-maturity-matrix.md)

An integration may be labeled **LIVE** in the registry, Integration Health UI, and sales materials **only when all four gates below pass** for at least one production tenant with **real partner credentials** — not sandbox-only CI.

**Current snapshot (2026-06-02):** third-party registry shows **0 LIVE / 7 BETA / 1 PLACEHOLDER**. Native channels (storefront, manual orders) may already be LIVE in `channel-registry.ts`; this DoD governs **external partner integrations**.

---

## LIVE vs BETA vs PLACEHOLDER

| Label | Meaning | Sales may claim |
|-------|---------|-----------------|
| **LIVE** | All four gates PASS on production with real credentials | “Available for production use” with qualified scope notes |
| **BETA** | Code + smokes exist; gates incomplete or staging-only | “Qualified beta — partner smoke required before production ops” |
| **PLACEHOLDER** | UI/scaffold only; no production path | “On roadmap — not available for production” |

**BETA ≠ LIVE.** A green CI smoke with missing vault secrets is **SKIPPED WITH REASON**, not LIVE.

---

## Four mandatory gates

All four must pass **in sequence** for the same integration id, environment (**production**), and reference tenant.

| Gate | Requirement | Pass criterion |
|:----:|-------------|----------------|
| **G1** | Smoke pass | Engineering smoke artifact `proof_passed` on release SHA |
| **G2** | Real credentials | Production tenant connection uses partner-issued credentials (not mock env) |
| **G3** | 24h uptime | Continuous 24-hour window with no P0 integration outage |
| **G4** | Error rate < 1% | Webhook + API error rate below 1% over the same 24h window |

Promotion is blocked if any gate is `SKIPPED`, `FAILED`, or measured on staging-only data unless explicitly documented as staging LIVE (rare — requires Legal + Founder sign-off).

---

## G1 — Smoke pass

### What counts

- Dedicated smoke script or cert test for the integration id (examples below).
- Run against **staging or production** URL with real env vars — not unit tests alone.
- Artifact records `proofStatus: proof_passed` or equivalent `overall: PASS`.

### Commands (by integration family)

| Integration | Smoke / cert |
|-------------|--------------|
| WooCommerce | `npm run smoke:channel-live-woo` · `era17-channel-live-smoke-woo-v1` |
| Shopify | `npm run smoke:channel-live-shopify` · `era17-channel-live-smoke-shopify-v1` |
| DoorDash / Grubhub / Uber Eats | Partner webhook + order ingest smoke (when wired) + signature unit tests |
| QuickBooks / Xero | OAuth connect + export smoke on staging tenant |
| 7shifts / Homebase | Staff sync smoke on staging tenant |
| SSO IdP | `npm run smoke:enterprise-sso-idp-staging-smoke` → `loginProofStatus: proof_passed` |

Aggregate P0 bundle: `npm run smoke:p0-staging-proof-unblock` — required before claiming any channel LIVE in pilot scope ([`era18-p0-staging-proof-ops-checklist.md`](./era18-p0-staging-proof-ops-checklist.md)).

### Failures

| Result | Action |
|--------|--------|
| `proof_skipped_missing_prerequisites` | **Not LIVE** — configure vault secrets |
| `proof_failed` | Fix code/ops; re-run on same SHA |
| PASS on localhost only | **Not LIVE** — repeat on deployed env |

---

## G2 — Real credentials

### Pass criteria

| Check | Evidence |
|-------|----------|
| Connection row exists | `integrationConnection.status = CONNECTED` for reference tenant |
| Credentials source | Partner dashboard / OAuth — not `test_*` placeholder keys in production |
| Required env present | All keys in `INTEGRATION_REGISTRY[].requiredEnv` set in production vault |
| Webhook endpoints registered | Partner console points to `https://<prod-domain>/api/webhooks/...` |
| Test connection | In-app “Test connection” PASS from `/dashboard/integrations/<id>` |
| Owner acknowledgment | Pilot/customer confirms credentials are production-intent (email or SOW) |

**Exclude:** Shared demo workspace keys, committed `.env` examples, CI-only secrets without tenant binding.

---

## G3 — 24h uptime

### Measurement window

- Start: first successful G1 smoke on production **after** G2 connect.
- End: +24 hours wall-clock (same UTC day boundary not required).
- Environment: production deployment serving the reference tenant.

### Pass criteria

| Signal | PASS | FAIL |
|--------|------|------|
| Webhook endpoint reachable | No sustained 5xx on ingest route | ≥3 consecutive minutes of 5xx or partner retry storm |
| OAuth token refresh | No expired-token outage blocking sync | Refresh failure uncorrected > 15 min |
| Cron / background sync | Scheduled jobs complete within SLA | Missed sync window without manual recovery |
| Integration Health card | Status ≠ `down` for integration id | `down` or `degraded` > 30 min cumulative |
| P0 manual incidents | Zero Sev-1 tickets for integration id | Any Sev-1 without resolved root cause |

**Observability:** Sentry + `/api/health` + Integration Health dashboard ([`integration-health-sales-deck-v2.md`](./integration-health-sales-deck-v2.md)). If Sentry unset, uptime must be proven via webhook event log + health checks — document gap.

### Artifact

Record in promotion ticket:

```json
{
  "integrationId": "woocommerce",
  "windowStart": "2026-06-10T14:00:00Z",
  "windowEnd": "2026-06-11T14:00:00Z",
  "uptimePass": true,
  "sev1Count": 0,
  "degradedMinutes": 0
}
```

---

## G4 — Error rate < 1%

### Scope (24h window aligned with G3)

Count **integration-attributed failures** only:

- Webhook events: `processed = false` OR HTTP 4xx/5xx response to partner
- Outbound API calls: non-retryable 4xx/5xx from partner API client
- Signature validation failures after connect (exclude pre-connect misconfiguration < 1h)

**Numerator:** failed events + failed API calls  
**Denominator:** total webhook deliveries + outbound API attempts  

### Formula

```
error_rate = failures / (failures + successes)
PASS when error_rate < 0.01 (strictly less than 1%)
```

### Example

| Metric | Value |
|--------|------:|
| Webhook deliveries | 420 |
| Webhook failures | 2 |
| Outbound API calls | 80 |
| Outbound failures | 0 |
| **Error rate** | 2 / 500 = **0.4%** ✓ PASS |

### Exclude from denominator

- Duplicate webhook idempotency hits (`duplicate: true`)
- Partner-initiated test pings marked `topic: ping`
- Rate-limit 429 when within documented partner quota

### Data sources

- `webhookEvent` table filtered by `provider` + `connectionId`
- Integration Health rollup (`/dashboard/integration-health`)
- Sentry issue tags `integration:<id>` (when configured)

---

## Promotion checklist (BETA → LIVE)

| # | Step | Owner | Blocker? |
|---|------|-------|:--------:|
| 1 | G1 smoke `proof_passed` artifact attached | Engineering | **Y** |
| 2 | G2 credential audit complete | Ops + Integration | **Y** |
| 3 | G3 24h uptime window logged | Ops | **Y** |
| 4 | G4 error rate calculation < 1% | Engineering | **Y** |
| 5 | Update `INTEGRATION_REGISTRY` status → `LIVE` | Engineering | **Y** |
| 6 | Update `feature-maturity-matrix.md` row | Product | **Y** |
| 7 | `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` PASS | Engineering | **Y** |
| 8 | Sales + CS briefed on qualified LIVE wording | GTM | **Y** |
| 9 | Integration Health trust banner rules re-checked | Engineering | N |
| 10 | Post-promotion 7-day watch window scheduled | Ops | N |

**Rollback:** If error rate exceeds 1% for 24h post-promotion, revert registry to **BETA**, notify customers, open incident ([`incident-response-process.md`](./incident-response-process.md) when published).

---

## Per-integration readiness (June 2)

| Id | Registry status | G1 | G2 | G3 | G4 | LIVE eligible? |
|----|-----------------|:--:|:--:|:--:|:--:|:--------------:|
| doordash | BETA | — | — | — | — | No |
| grubhub | BETA | — | — | — | — | No |
| uber-eats | BETA | — | — | — | — | No |
| quickbooks | BETA | — | — | — | — | No |
| xero | BETA | — | — | — | — | No |
| 7shifts | BETA | — | — | — | — | No |
| homebase | BETA | — | — | — | — | No |
| uber-direct | PLACEHOLDER | — | — | — | — | No |
| woocommerce (channel) | pilot_ready | SKIPPED | — | — | — | No |
| shopify (channel) | pilot_ready | SKIPPED | — | — | — | No |

Source: [`artifacts/pilot-gono-go-summary.json`](../artifacts/pilot-gono-go-summary.json) · P0 `awaiting_ops_credentials`

---

## Sign-off (required for LIVE label)

| Field | Value |
|-------|-------|
| Integration id | |
| Reference tenant / workspace | |
| Release SHA | |
| G1 artifact path | |
| G2 credential verified by | |
| G3 window (UTC) | |
| G4 error rate | |
| Engineering approver | _________________ Date ______ |
| Founder / Product approver | _________________ Date ______ |

---

## Forbidden shortcuts

Do **not** mark LIVE when:

- Only unit tests pass (no deployed smoke)
- Smoke PASS on mock credentials
- Error rate measured over < 24h
- Uptime window includes planned maintenance without partner notice
- Sales requests LIVE for deck/demo without sign-off row above

Safe wording until LIVE: **“BETA — available for qualified pilots with partner credentials and smoke evidence.”**

---

## Related docs

| Doc | Use |
|-----|-----|
| [`channel-pilot-playbook-era17.md`](./channel-pilot-playbook-era17.md) | Woo/Shopify pilot setup |
| [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) | Forbidden LIVE claims in contracts |
| [`integration-health-sales-deck-v2.md`](./integration-health-sales-deck-v2.md) | Health score bands |
| [`beta-to-live-roadmap.md`](./beta-to-live-roadmap.md) | Priority order (Task 57) |
