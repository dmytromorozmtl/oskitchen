# Uber Direct PLACEHOLDER → BETA → LIVE implementation plan

**Version:** 1.0 · **June 2026**  
**Registry id:** `uber-direct` · **Current status:** PLACEHOLDER  
**Parent:** [`live-integration-definition-of-done.md`](./live-integration-definition-of-done.md) · [`beta-to-live-roadmap.md`](./beta-to-live-roadmap.md)  
**Priority:** H2 2026 — **not** in top-3 channel promotion queue (WooCommerce → DoorDash → QuickBooks)

This plan defines what must happen before Uber Direct moves from **PLACEHOLDER** to **BETA**, and later from **BETA** to **LIVE**. It does **not** authorize registry promotion until partner credentials, smoke artifacts, and G1–G4 gates pass on production.

---

## Executive summary

| Area | PLACEHOLDER today | Next milestone |
|------|-------------------|----------------|
| Code surface | Quote/create/cancel stubs, webhook ingress with 503 | Wire Uber Direct API client (sandbox) |
| Credentials | Env + connection form fields | Uber Direct developer program approval |
| UI | ROADMAP badge, `PlaceholderBanner`, honest copy | Keep visible — **do not remove from UI** |
| Smokes | Unit tests assert placeholder mode | Add `smoke:delivery-uber-direct-beta` |
| Observability | Webhook logs + ingress dedupe | 24h uptime + <1% error rate unmeasured |
| GTM | Pricing FAQ + public copy say “roadmap” | No LIVE claims until G1–G4 |

**UI decision (Task 72):** **Keep** Uber Direct in the product with PLACEHOLDER / ROADMAP badges and honest limitations. Removing it would hide a documented future capability and break onboarding rehearsal flows. Public pages already avoid “live dispatch” claims ([`public-copy.ts`](../lib/public-copy.ts), Task 21).

**Recommendation:** Treat Uber Direct as a **partner-gated delivery pilot** — one reference tenant, sandbox → staging → production watch, then registry promotion in two steps (PLACEHOLDER→BETA when API wired; BETA→LIVE when G1–G4 pass).

---

## Current PLACEHOLDER inventory

### Registry & UI

| Asset | Path / note |
|-------|-------------|
| Registry entry | `lib/integrations/integration-registry.ts` — `status: "PLACEHOLDER"`, `requiredEnv`: `UBER_DIRECT_CUSTOMER_ID` |
| Setup page | `/dashboard/integrations/uber-direct` — `CapabilityBadge status="ROADMAP"`, settings form (pickup, radius, auto-dispatch flags) |
| Dispatch rehearsal | `/dashboard/routes/uber-direct` — `PlaceholderBanner`, reads `DeliveryDispatch` rows for audit trail |
| Public marketing | `/integrations/uber-direct` — excluded from integration SEO index; honest “Roadmap / setup foundation” copy |
| Honesty lists | `lib/integrations/integration-honesty.ts` — `MARKETPLACE_PLACEHOLDER_PROVIDER_KEYS` includes `uber-direct` |
| Plan gate | `PlanGate feature="uber_direct"` on setup page |

### Service layer

| Capability | Implementation |
|------------|----------------|
| Capability probe | `getUberDirectCapabilitySnapshot()` — always `placeholderMode: true`, `liveQuoteCreateReady: false` |
| Quote | `createDeliveryQuote()` — returns `ok: false` with honest message |
| Create dispatch | `createDelivery()` — stub; no Uber API host call |
| Status / cancel | `getDeliveryStatus()`, `cancelDelivery()` — placeholder responses |
| Status normalize | `normalizeDeliveryStatus()` — returns `SCHEDULED` default |

### API routes

| Route | Behavior |
|-------|----------|
| `POST /api/delivery/quote` | Auth + rate limit → `createDeliveryQuote()` stub |
| `POST /api/delivery/create` | Auth + rate limit → `createDelivery()` stub |
| `POST /api/delivery/cancel` | Auth + rate limit → `cancelDelivery()` stub |

Credentials map from `IntegrationConnection`: `accessTokenEncrypted` → customerId, `consumerKeyEncrypted` → clientId, `consumerSecretEncrypted` → clientSecret.

### Webhook

| Item | Detail |
|------|--------|
| Route | `POST /api/webhooks/uber-direct` |
| Auth | Bearer token via `UBER_DIRECT_WEBHOOK_SECRET` (`requireBearerWebhookSecret`) |
| Idempotency | `recordWebhookIngressOrDuplicate` — `WEBHOOK_INGRESS_ROUTE_KEYS.UBER_DIRECT` |
| Handler | `handleUberDirectWebhook` — logs + returns **503** with `uber_direct_placeholder` code |
| Matrix | [`artifacts/webhook-signature-matrix.md`](../artifacts/webhook-signature-matrix.md) row 45 — VERIFIED ingress, PLACEHOLDER handler |

### Tests today

| Layer | File | Coverage |
|-------|------|----------|
| Unit | `tests/unit/uber-direct-capability.test.ts` | Placeholder even when env creds present |
| Unit | `tests/unit/webhook-ingress-replay-guard.test.ts` | `extractUberDirectExternalEventId` |
| Unit | `tests/unit/integration-honesty-alignment.test.ts` | Only `uber-direct` in placeholder list |
| Unit | `tests/unit/integration-live-readiness.test.ts` | `UBER_DIRECT` excluded from LIVE readiness counts |
| Policy | `tests/unit/nav-maturity-governance-ci-live.test.ts` | Maturity honesty on setup + routes pages |

**Gap:** No E2E for dispatch rehearsal; no staging smoke with `proof_passed` artifact.

---

## Promotion path: PLACEHOLDER → BETA

BETA means: **real Uber Direct sandbox API calls** for quote/create/cancel on a reference tenant, webhook handler processes status events (not 503), registry still shows limitations.

### BETA gates

| Gate | Uber Direct-specific pass criteria |
|------|-------------------------------------|
| B1 — API wired | `createDeliveryQuote` / `createDelivery` call Uber sandbox with OAuth or client credentials |
| B2 — Webhook processes | Handler maps status payload → `DeliveryDispatch` update (not 503) |
| B3 — Dashboard honest | `CapabilityBadge` → BETA; copy says “sandbox / pilot only” |
| B4 — Tests | Unit tests cover sandbox fixtures; capability snapshot `placeholderMode: false` when creds + host set |
| B5 — Claims | `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` PASS |

**Registry diff (BETA only):**

```typescript
// lib/integrations/integration-registry.ts
{ id: "uber-direct", name: "Uber Direct", status: "BETA", ... }
```

**Env vars (staging / sandbox):**

```bash
UBER_DIRECT_CUSTOMER_ID=       # Uber Direct customer account
UBER_DIRECT_CLIENT_ID=         # OAuth client id
UBER_DIRECT_CLIENT_SECRET=     # OAuth client secret
UBER_DIRECT_WEBHOOK_SECRET=    # Bearer token for inbound callbacks
UBER_DIRECT_API_BASE=          # Optional sandbox host override
```

---

## Promotion path: BETA → LIVE

Per [`live-integration-definition-of-done.md`](./live-integration-definition-of-done.md):

### G1 — Smoke pass (engineering)

**Target artifact:** `artifacts/smokes/uber-direct-delivery-live-smoke-v1.json`

| Step | Action | Pass |
|------|--------|------|
| 1 | Deploy staging with Uber Direct production-approved sandbox creds | Health 200 |
| 2 | Register webhook URL in Uber developer portal | Partner ack |
| 3 | POST quote with real pickup/dropoff | `ok: true` + quoteId |
| 4 | POST create from quote | `externalDeliveryId` + tracking URL |
| 5 | Send status callback webhook | Dispatch row updated; not 503 |
| 6 | POST cancel on test delivery | `ok: true` or documented partner limitation |

**Deliverable:** Add `npm run smoke:delivery-live-uber-direct` to `.github/workflows/p0-staging-smokes.yml` (Tasks 7 / 22).

### G2 — Real credentials (ops)

| Check | Uber Direct-specific |
|-------|----------------------|
| Connection row | `IntegrationConnection` with `provider: UBER_DIRECT`, encrypted secrets |
| Partner approval | Written confirmation from Uber Direct ISV / merchant program |
| Geography | Service area confirmed for reference tenant |
| Billing | Uber Direct billing account linked |

### G3 — 24h uptime (ops)

| Signal | Source |
|--------|--------|
| Delivery API 5xx | Vercel logs + Sentry `integration:uber_direct` |
| Webhook route | Ingress success vs 503/5xx |
| Integration Health | `/dashboard/integrations/health` card |

### G4 — Error rate < 1% (engineering)

**Numerator:** quote/create failures, webhook processing errors, cancel failures  
**Denominator:** all delivery API attempts + webhook deliveries (exclude idempotent duplicates)

---

## Phased execution plan

### Phase 0 — Partner & scope (Week 0–2)

| # | Task | Owner | Output |
|---|------|-------|--------|
| 0.1 | Apply for Uber Direct developer / ISV program | Founder + Partnerships | Sandbox access letter |
| 0.2 | Confirm Uber Direct vs Uber Eats boundary in sales materials | GTM | No conflation in demos |
| 0.3 | Pick reference tenant (single-location, delivery-heavy) | CS + Sales | Pilot SOW with BETA criteria |

### Phase 1 — PLACEHOLDER → BETA engineering (Week 2–5)

| # | Task | Owner | Output |
|---|------|-------|--------|
| 1.1 | Implement Uber OAuth + API client in `services/delivery/uber-direct.ts` | Eng | Sandbox quote/create/cancel |
| 1.2 | Replace webhook 503 with status normalization → `DeliveryDispatch` | Eng | B2 |
| 1.3 | Update `getUberDirectCapabilitySnapshot()` — flip flags when host + creds valid | Eng | B4 |
| 1.4 | Add `smoke:delivery-uber-direct-beta` script | Eng | B1 automation |
| 1.5 | E2E: `/dashboard/routes/uber-direct` rehearsal with mocked API | QA | Regression guard |
| 1.6 | Registry + badges → BETA; keep honest limitations on routes page | Eng | B3 |

### Phase 2 — Staging pilot (Week 5–7)

| # | Task | Owner | Output |
|---|------|-------|--------|
| 2.1 | Connect reference tenant on staging | Ops | G2 staging proof |
| 2.2 | Run 20+ sandbox dispatches (quote → create → status → cancel) | QA | Workflow sign-off |
| 2.3 | Integration Health card green for Uber Direct | Eng | Observability baseline |

### Phase 3 — Production pilot & LIVE (Week 7–10)

| # | Task | Owner | Output |
|---|------|-------|--------|
| 3.1 | Production credentials + webhook registration | Ops | G2 prod |
| 3.2 | G1 smoke → attach `proof_passed` artifact | Eng | G1 |
| 3.3 | G3/G4 24h window on reference tenant | Ops | Uptime + error rate JSON |
| 3.4 | Registry → LIVE; update maturity matrix | Eng + Founder | Promotion sign-off |

### Phase 4 — Watch (Week 10+)

| # | Task | Owner | Output |
|---|------|-------|--------|
| 4.1 | Sales briefing — qualified LIVE wording | GTM | [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) entry |
| 4.2 | 7-day post-LIVE watch | Ops | Rollback trigger doc |
| 4.3 | Second tenant onboarding playbook | CS | Repeatable connect flow |

---

## Rollback plan

| Trigger | Action |
|---------|--------|
| Error rate ≥ 1% post-LIVE | Revert registry to BETA; disable auto-dispatch |
| Uber suspends API key | Disconnect tenant; show `ApiErrorState` on routes page |
| Sales over-claim | `verify-claims` CI block + GTM retrain |
| Sev-1 webhook outage | Incident per [`incident-response-process.md`](./incident-response-process.md) |

---

## Dependencies on other 122 tasks

| Task | Dependency |
|------|------------|
| 7 / 22 | P0 staging smokes — add Uber Direct row after BETA |
| 21 | Public pages — placeholders removed; roadmap wording kept |
| 30 | Webhook signature matrix — row 45 status update on BETA |
| 36 | Non-Stripe webhook signature unit tests — Bearer vector |
| 57 | `beta-to-live-roadmap.md` — Uber Direct H2 queue |
| 53 | Sales-safe claims — LIVE wording after G1–G4 |
| 61 | Incident response for rollback |

---

## Sales-safe language

| Status | Approved |
|--------|----------|
| **PLACEHOLDER (now)** | “Uber Direct dispatch is on our roadmap — OS Kitchen includes setup placeholders and workflow rehearsal, not live courier APIs.” |
| **BETA (after Phase 1)** | “Uber Direct connector available for qualified pilots with Uber-issued sandbox credentials — not production dispatch until smoke validation.” |
| **LIVE (after G1–G4)** | “Uber Direct quote, dispatch, and status callbacks supported in production for connected merchants in approved geographies.” |
| **Never** | “Uber Direct included out of the box” · “Same as DoorDash Drive today” · “All delivery platforms live” |

Until BETA: redirect delivery prospects to **DoorDash BETA** (when live for tenant) or manual dispatch workflows.

---

## Success metrics (pilot)

| Metric | Target |
|--------|--------|
| Quote latency (p95) | < 5s sandbox |
| Dispatch create success | > 99% over 50 test runs |
| Webhook → dispatch update | < 10s p95 |
| Cancel success | > 95% or documented Uber limitation |
| Support tickets (integration) | 0 Sev-1 in first 30 days post-LIVE |

---

## Related docs

| Doc | Topic |
|-----|-------|
| [`doordash-live-integration-plan.md`](./doordash-live-integration-plan.md) | Parallel delivery integration pattern |
| [`live-integration-definition-of-done.md`](./live-integration-definition-of-done.md) | G1–G4 gates |
| [`staging-environment-checklist.md`](./staging-environment-checklist.md) | Vault + webhook endpoints |
| [`observability-setup.md`](./observability-setup.md) | Sentry tags for G3/G4 |
| [`artifacts/webhook-signature-matrix.md`](../artifacts/webhook-signature-matrix.md) | Route 45 verification status |
