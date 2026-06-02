# DoorDash BETA → LIVE integration plan

**Version:** 1.0 · **June 2026**  
**Registry id:** `doordash` · **Current status:** BETA  
**Parent:** [`live-integration-definition-of-done.md`](./live-integration-definition-of-done.md) · [`DOORDASH_INTEGRATION.md`](./DOORDASH_INTEGRATION.md)  
**Priority:** #2 in channel promotion queue (after WooCommerce → before QuickBooks per era roadmap)

This plan defines **what must happen** before `INTEGRATION_REGISTRY` status changes from **BETA** to **LIVE**. It does not authorize promotion until all four LIVE gates (G1–G4) pass on **production** with **partner-issued credentials**.

---

## Executive summary

| Area | BETA today | LIVE blocker |
|------|------------|--------------|
| Code surface | Webhook ingest, poll import, menu sync, Drive delivery | Partner cert + production traffic proof |
| Credentials | Env + per-connection webhook secret | DoorDash merchant program approval |
| Smokes | Unit + mocked E2E | No dedicated `smoke:channel-live-doordash` artifact |
| Observability | Webhook event store, Integration Health | 24h uptime + <1% error rate unmeasured |
| GTM | BETA badge + honest copy | Sales still redirects to Woo/Shopify for delivery ops |

**Recommendation:** Treat DoorDash LIVE as a **partner-gated pilot** — one reference tenant, 30-day watch, then registry promotion.

---

## Current BETA inventory

### Registry & UI

| Asset | Path / note |
|-------|-------------|
| Registry entry | `lib/integrations/integration-registry.ts` — `requiredEnv`: `DOORDASH_API_KEY`, `DOORDASH_MERCHANT_ID`, `DOORDASH_WEBHOOK_SECRET` |
| Setup page | `/dashboard/integrations/doordash` — readiness checklist, webhook URL, BETA badge |
| Capability probe | `getDoorDashCapabilitySnapshot()` — credentials gate all live flags |

### Inbound (marketplace orders)

| Capability | Implementation |
|------------|----------------|
| Webhook | `POST /api/webhooks/doordash/orders?cid=<connection-id>` |
| Signature | `verifyDoorDashWebhookSignature` (HMAC SHA-256) |
| Idempotency | `createWebhookEvent` → duplicate short-circuit |
| Normalize | `processDoorDashInboundOrder` → `ExternalOrder` + kitchen `Order` |
| Poll import | `importDoorDashOrdersForUser` · cron `doordash-sync` (`*/5 * * * *`) |

### Outbound

| Capability | Implementation |
|------------|----------------|
| Menu push (item) | `syncMenuItemToDoorDash` · `PUT /api/integrations/doordash/menu` |
| Menu bulk | `DoorDashMenuSyncService.pushMenu` |
| Drive delivery | `DoorDashSyncService` (Drive v2) · `DoorDashDelivery` model |

### Tests today

| Layer | File | Coverage |
|-------|------|----------|
| Unit | `tests/unit/doordash-order-import-canonical.test.ts` | Order normalization |
| Unit | `tests/unit/webhook-doordash-route-security.test.ts` | Signature + idempotency wiring |
| E2E | `e2e/doordash-integration.spec.ts` | BETA dashboard (mock unless `DOORDASH_E2E_CONNECTION_ID`) |

**Gap:** No staging/production smoke script with `proof_passed` artifact (G1).

---

## LIVE gates mapped to DoorDash

Per [`live-integration-definition-of-done.md`](./live-integration-definition-of-done.md):

### G1 — Smoke pass (engineering)

**Target artifact:** `artifacts/smokes/doordash-channel-live-smoke-v1.json`

| Step | Command / action | Pass |
|------|------------------|------|
| 1 | Deploy staging with real DoorDash sandbox credentials | Health 200 |
| 2 | Register webhook URL in DoorDash dev portal | Partner ack |
| 3 | Send signed test order webhook | `200` + order in KDS |
| 4 | Run poll import cron once | ≥1 order or empty with 200 |
| 5 | Push menu item via API | `synced` status |
| 6 | Optional: Drive quote probe | `ok: true` or documented skip |

**Deliverable (Task follow-up):** Add `npm run smoke:channel-live-doordash` mirroring Woo/Shopify pattern in `.github/workflows/p0-staging-smokes.yml`.

### G2 — Real credentials (ops)

| Check | DoorDash-specific |
|-------|-------------------|
| Connection row | `IntegrationConnection` with `provider: DOORDASH`, `status: CONNECTED` |
| Secrets vault | Production Vercel/vault — not committed `.env` |
| Per-tenant webhook secret | Encrypted on connection; env fallback only for dev |
| Merchant ID | Matches DoorDash store in partner console |
| Partner approval | Written confirmation from DoorDash ISV/merchant program |

**Env vars (production):**

```bash
DOORDASH_API_KEY=              # Partner JWT / API key
DOORDASH_MERCHANT_ID=          # Store identifier
DOORDASH_WEBHOOK_SECRET=       # Fallback only if per-connection unset
DOORDASH_CRON_OWNER_USER_ID=   # Reference tenant owner for poll import
DOORDASH_MENU_API_BASE=        # Optional override (default marketplace v2)
```

### G3 — 24h uptime (ops)

Monitor during reference-tenant pilot:

| Signal | Source |
|--------|--------|
| Webhook route 5xx | Vercel logs + Sentry `integration:doordash` |
| Cron `doordash-sync` | `CronExecutionEvent` / production manifest |
| Integration Health | `/dashboard/integrations/health` card |
| Partner retries | DoorDash webhook dashboard |

**FAIL triggers:** ≥3 min sustained 5xx on ingest; missed cron window without recovery; Integration Health `down` >30 min.

### G4 — Error rate < 1% (engineering)

**Numerator:** webhook `processed=false`, signature failures post-connect, outbound API hard failures  
**Denominator:** all webhook deliveries + outbound API attempts (exclude idempotent duplicates)

Query pattern:

```sql
-- Illustrative; use Integration Health rollup in production
SELECT
  COUNT(*) FILTER (WHERE processed = false) AS failures,
  COUNT(*) AS total
FROM "WebhookEvent"
WHERE provider = 'DOORDASH'
  AND "createdAt" >= :window_start
  AND "createdAt" < :window_end;
```

---

## Phased execution plan

### Phase 0 — Partner & legal (Week 0–2)

| # | Task | Owner | Output |
|---|------|-------|--------|
| 0.1 | Confirm DoorDash ISV / merchant API program eligibility | Founder + Partnerships | Partner agreement or sandbox access letter |
| 0.2 | Identify reference tenant (single-location ghost kitchen) | CS + Sales | Pilot SOW with BETA→LIVE criteria |
| 0.3 | Register production webhook URL template | Ops | `https://<prod>/api/webhooks/doordash/orders?cid=<id>` |

### Phase 1 — Engineering hardening (Week 2–4)

| # | Task | Owner | Output |
|---|------|-------|--------|
| 1.1 | Add `smoke:channel-live-doordash` script + cert test | Eng | G1 automation |
| 1.2 | Wire smoke into P0 staging workflow | Eng | CI artifact on release SHA |
| 1.3 | Extend `webhook-signatures.test.ts` (Task 36) with live vector fixtures | Eng | Regression guard |
| 1.4 | Integration Health: DoorDash-specific error rollup | Eng | G4 dashboard |
| 1.5 | Document API host overrides per merchant program | Eng | Runbook section in [`DOORDASH_INTEGRATION.md`](./DOORDASH_INTEGRATION.md) |

### Phase 2 — Staging pilot (Week 4–6)

| # | Task | Owner | Output |
|---|------|-------|--------|
| 2.1 | Connect reference tenant on staging with sandbox creds | Ops | G2 staging proof |
| 2.2 | Run G1 smoke → attach artifact | Eng | `proof_passed` |
| 2.3 | Process 50+ test orders (webhook + poll) | QA | Normalization sign-off |
| 2.4 | Menu sync round-trip with real store | Ops | Menu parity checklist |

### Phase 3 — Production pilot (Week 6–8)

| # | Task | Owner | Output |
|---|------|-------|--------|
| 3.1 | Production credentials + webhook registration | Ops | G2 prod |
| 3.2 | Start G3/G4 24h window | Ops | Uptime log JSON |
| 3.3 | Kitchen ops validation (KDS bump, fulfillment) | CS + Customer | Pilot acceptance sign-off |
| 3.4 | `verify-claims` + registry update | Eng | `status: "LIVE"` in registry |

### Phase 4 — Promotion & watch (Week 8+)

| # | Task | Owner | Output |
|---|------|-------|--------|
| 4.1 | Update `feature-maturity-matrix.md` | Product | LIVE row |
| 4.2 | Sales briefing — qualified LIVE wording | GTM | [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) entry |
| 4.3 | 7-day post-promotion watch | Ops | Rollback trigger doc |
| 4.4 | Second tenant onboarding playbook | CS | Repeatable connect flow |

---

## Promotion checklist (registry change)

Complete **before** changing `integration-registry.ts`:

- [ ] G1 smoke artifact `proof_passed` on production release SHA
- [ ] G2 credential audit signed by Ops
- [ ] G3 24h window logged (JSON in promotion ticket)
- [ ] G4 error rate < 1% over same window
- [ ] Engineering + Founder sign-off row ([`live-integration-definition-of-done.md`](./live-integration-definition-of-done.md) § Sign-off)
- [ ] `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` PASS
- [ ] E2E with `DOORDASH_E2E_CONNECTION_ID` green (optional but recommended)

**Registry diff (final step only):**

```typescript
// lib/integrations/integration-registry.ts
{ id: "doordash", name: "DoorDash", status: "LIVE", ... }
```

---

## Rollback plan

| Trigger | Action |
|---------|--------|
| Error rate ≥ 1% for 24h post-LIVE | Revert registry to BETA; notify reference tenant |
| Partner webhook suspension | Disable connection; manual order ingest fallback |
| Sev-1 ingest outage | Incident per [`incident-response-process.md`](./incident-response-process.md) (Task 61) |
| Sales over-claim | `verify-claims` CI block + GTM retrain |

---

## Dependencies on other 122 tasks

| Task | Dependency |
|------|------------|
| 7 / 22 | P0 staging smokes — add DoorDash row |
| 30 | Webhook signature matrix — DoorDash route verification status |
| 36 | Non-Stripe webhook signature unit tests |
| 57 | `beta-to-live-roadmap.md` — DoorDash priority #2 |
| 61 | Incident response for rollback |
| 53 | Sales-safe claims registry — LIVE wording |

---

## Sales-safe language

| Status | Approved |
|--------|----------|
| **BETA (now)** | “DoorDash connector available for qualified pilots — requires your DoorDash partner credentials and smoke validation.” |
| **LIVE (after G1–G4)** | “DoorDash marketplace ingest and menu sync supported in production for connected merchants.” |
| **Never** | “Native DoorDash like Toast/Square” · “All delivery apps live” · “Uber Direct included” |

Until LIVE: redirect multi-channel prospects to **WooCommerce / Shopify channel sync** or manual orders ([`CAPABILITY_SIGNOFF_SALES.md`](./CAPABILITY_SIGNOFF_SALES.md)).

---

## Success metrics (pilot)

| Metric | Target |
|--------|--------|
| Webhook ingest latency (p95) | < 3s to KDS visible |
| Order normalization accuracy | 100% on golden fixtures + 50 pilot orders |
| Menu sync success rate | > 99% over 7 days |
| Cron poll catch-up | No missed orders > 15 min |
| Support tickets (integration) | 0 Sev-1 in first 30 days |

---

## Related docs

| Doc | Topic |
|-----|-------|
| [`DOORDASH_INTEGRATION.md`](./DOORDASH_INTEGRATION.md) | BETA technical reference |
| [`live-integration-definition-of-done.md`](./live-integration-definition-of-done.md) | G1–G4 gates |
| [`staging-environment-checklist.md`](./staging-environment-checklist.md) | Vault + webhook endpoints |
| [`observability-setup.md`](./observability-setup.md) | Sentry tags for G3/G4 |
| [`partner-webhook-integration-era17.md`](./partner-webhook-integration-era17.md) | Webhook patterns |
