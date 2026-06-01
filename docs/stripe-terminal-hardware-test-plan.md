# Stripe Terminal — Hardware Test Plan

**Status:** Preview — simulated E2E shipped; physical reader proof blocked until Stripe vault keys  
**Audience:** POS engineer, QA, DevOps, pilot operator  
**Technical:** [`hooks/use-stripe-terminal.ts`](../hooks/use-stripe-terminal.ts) · [`components/pos/stripe-terminal-reader.tsx`](../components/pos/stripe-terminal-reader.tsx) · [`e2e/stripe-terminal-payment.spec.ts`](../e2e/stripe-terminal-payment.spec.ts)

---

## Goal

Certify **card-present checkout on physical Stripe Terminal hardware** before sales claims "pilot-ready with M2/S700." Simulated reader proof (CI) is necessary but **not sufficient** for hardware sign-off.

| Phase | Hardware | Blocker today |
|-------|----------|---------------|
| **A — Simulated** | Browser simulated reader | ✅ Shipped — `e2e/stripe-terminal-payment.spec.ts` |
| **B — Staging M2** | Stripe Reader M2 (test mode) | `STRIPE_SECRET_KEY` + `STRIPE_TERMINAL_LOCATION_ID` in vault |
| **C — Pilot live** | M2 or S700 (live mode) | Pilot GO + 30-day capture runbook |

**Honesty rule:** Do not claim hardware-certified until Phase B artifact shows `overall: PASSED` with `readerType: physical`.

---

## Prerequisites

### Stripe Dashboard

| Step | Owner | Done? |
|------|-------|-------|
| Enable Stripe Terminal in Dashboard (test mode first) | DevOps | ☐ |
| Register **Terminal location** per pilot site | DevOps | ☐ |
| Order or assign **Reader M2** to location | Ops | ☐ |
| Note location ID → `STRIPE_TERMINAL_LOCATION_ID` | DevOps | ☐ |

### Environment (vault)

| Variable | Phase | Required |
|----------|-------|----------|
| `STRIPE_SECRET_KEY` | B, C | Test key → live key separate |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | B, C | Client bootstrap |
| `STRIPE_TERMINAL_LOCATION_ID` | B, C | Per register/site |
| `STRIPE_WEBHOOK_SECRET` | B, C | Billing + capture reconciliation |
| `DATABASE_URL` | B, C | Order PAID persistence |
| `ENCRYPTION_KEY` | B, C | Register settings |

See [`ops-vault-matrix.md`](./ops-vault-matrix.md) · [`stripe-terminal-implementation-plan.md`](./stripe-terminal-implementation-plan.md)

### KitchenOS setup

| Step | Route / action | Done? |
|------|----------------|-------|
| POS register created | `/dashboard/pos/registers` | ☐ |
| Active staff + shift open | `/dashboard/staff` | ☐ |
| `pos.checkout` permission for cashier | Staff roles | ☐ |
| At least one `posVisible` product | Menu | ☐ |
| Terminal reader panel visible | `/dashboard/pos/terminal` | ☐ |

---

## Test matrix

### Phase A — Simulated (CI / no hardware)

**Command:**

```bash
npm test -- e2e/stripe-terminal-payment.spec.ts
npm test -- tests/unit/stripe-terminal-client.test.ts
```

| # | Scenario | Expected | Evidence |
|---|----------|----------|----------|
| A1 | Select "Card terminal" payment method | Reader panel mounts | `stripe-terminal-reader` testid |
| A2 | Mock `collectPaymentMethod` + `processPayment` | Order PAID, transaction row | E2E PASS |
| A3 | API POST/PUT `/api/pos/terminal` | 200 + clientSecret | Mock intercept |
| A4 | Decline simulation | Operator-visible error, order not PAID | Manual mock |
| A5 | Reader disconnect mid-capture | Recover or cancel without orphan PAID | Manual mock |

**Pass:** All automated tests green. **Does not unlock hardware sales claims.**

---

### Phase B — Staging hardware (Reader M2, test mode)

**Pre-flight:**

```bash
# After vault keys set on staging
export E2E_STAGING_BASE_URL='https://staging.example.com'
export E2E_LOGIN_EMAIL='...'
export E2E_LOGIN_PASSWORD='...'
# Physical reader powered on, assigned to staging location in Stripe Dashboard
```

| # | Scenario | Steps | Pass criteria |
|---|----------|-------|---------------|
| B1 | **Reader discovery** | Open POS terminal → Connect reader | M2 appears in list within 30s |
| B2 | **Connect + battery** | Connect selected reader | Status connected; battery % shown |
| B3 | **Tap payment (contactless)** | Add product → Card terminal → tap test card | Order PAID; receipt audit event |
| B4 | **Insert chip** | Repeat with chip insert | Order PAID; same register |
| B5 | **Swipe (if enabled)** | Repeat with swipe test card | Order PAID or documented skip |
| B6 | **Declined card** | Stripe test decline PAN | Order stays unpaid; clear error |
| B7 | **Timeout / cancel** | Start capture → cancel on reader | No orphan PAID order |
| B8 | **Disconnect mid-capture** | Power off reader during collect | Graceful failure; retry succeeds |
| B9 | **Refund** | Refund one B3 transaction | Stripe Dashboard + OS Kitchen match |
| B10 | **10× consecutive success** | Repeat B3 ten times | ≥10/10 success; failed rate <5% (excl. declines) |

**Stripe test cards:** Use [Stripe Terminal test cards](https://docs.stripe.com/terminal/testing) — do not use live PANs in test mode.

**Pass criteria (Phase B):**

| Metric | Target |
|--------|--------|
| Successful captures (B10) | ≥ 10/10 |
| Failed capture rate (excl. intentional declines) | < 5% |
| API 503 on `/api/pos/terminal` during session | 0 |
| Orphan PAID orders (capture failed but DB paid) | 0 |

**Artifact (when script exists):** `artifacts/stripe-terminal-staging-smoke.json` with:

```json
{
  "overall": "PASSED",
  "readerType": "physical",
  "deviceModel": "stripe_reader_m2",
  "mode": "test",
  "successfulCaptures": 10,
  "failedCaptures": 0,
  "declineTestsPassed": true
}
```

Until vault keys exist → record `overall: SKIPPED`, `skipReason: "Missing STRIPE_SECRET_KEY or STRIPE_TERMINAL_LOCATION_ID"`.

---

### Phase C — Pilot site (live mode, 30 days)

| # | Scenario | Frequency | Pass criteria |
|---|----------|-----------|---------------|
| C1 | Opening shift + reader connect | Daily | Connect < 60s |
| C2 | Peak-hour captures | Daily service | Median capture < 30s |
| C3 | End-of-day reconcile | Daily | Stripe Dashboard = OS Kitchen shift total |
| C4 | Network blip recovery | As occurs | Cash queue fallback; no offline card claim |
| C5 | Hardware swap (M2 replacement) | Once | Re-pair without data loss |
| C6 | S700 counter (if deployed) | Week 2+ | Same matrix as B1–B10 on live mode |

**Pilot week 1 metric:** Failed capture rate < 5% (declines excluded) — aligns with [`pilot-week1-checklist.md`](./pilot-week1-checklist.md).

**Live promotion gate:** 30 consecutive days with C3 reconcile PASS + zero orphan PAID incidents.

---

## Hardware under test

| Device | SKU | Phase | Notes |
|--------|-----|-------|-------|
| **Stripe Reader M2** | `stripe_reader_m2` | B, C (default pilot) | Mobile/handheld; ~$59 |
| Stripe Reader S700 | `stripe_reader_s700` | C (scale-out) | Fixed counter; ~$299 |
| Simulated reader | `simulated_wisepos_e` | A only | CI — not hardware proof |

**Out of scope (web pilot):** Tap to Pay on iPhone — native SDK; defer to Phase 4 in [`stripe-terminal-plan.md`](./stripe-terminal-plan.md).

---

## Security and compliance checks

| Check | Method | Pass |
|-------|--------|------|
| Offline card blocked | Enable POS offline queue → attempt Terminal | Terminal disabled; cash only |
| Auth on Terminal API | Unauthenticated curl POST `/api/pos/terminal` | 401/403 |
| Audit trail | After B3 | `POS_TERMINAL_PAYMENT_CAPTURED` in audit log |
| PCI scope | Legal review | SAQ A / A-EP documented — no "PCI certified" claim |
| Pen test scope | Include in [`pen-test-plan.md`](./pen-test-plan.md) | Terminal routes listed |

---

## Failure triage

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| No readers in discovery | Wrong location ID or reader not assigned | Stripe Dashboard → Readers → assign to location |
| Connect loops | Expired connection token | Refresh page; check `/api/pos/terminal` GET |
| PAID in UI, not in Stripe | PUT succeeded before Stripe confirm | Check `externalPaymentReference`; rollback order |
| 503 on terminal API | `STRIPE_SECRET_KEY` missing on env | Vercel env + redeploy |
| Reader battery 0% | Charge M2 | USB-C charge 30 min |

---

## Sign-off

| Role | Phase B date | Phase C start | Signature |
|------|--------------|---------------|-----------|
| POS engineer | | | |
| QA | | | |
| DevOps (Stripe keys) | | | |
| Pilot operator | | | |

**Capability label until Phase C complete:** `PREVIEW` / `ONLY_WITH_CAVEAT` — see [`capability-matrix.ts`](../lib/capabilities/capability-matrix.ts).

---

## Safe wording

**Allowed after Phase B PASS:**

- "Stripe Terminal preview validated on Reader M2 in test mode"
- "Simulated + physical staging capture proof complete"

**Not allowed until Phase C 30-day gate:**

- "PCI certified hardware bundle"
- "Production-certified card-present"
- "Offline card payments supported"
- "Works with any card reader"

---

## References

- [`stripe-terminal-implementation-plan.md`](./stripe-terminal-implementation-plan.md) — 2–3 week engineering track
- [`stripe-terminal-sales-one-pager.md`](./stripe-terminal-sales-one-pager.md) — sales positioning
- [`stripe-terminal-plan.md`](./stripe-terminal-plan.md) — full hardware matrix + PCI
- [`POS_OFFLINE_MODE.md`](./POS_OFFLINE_MODE.md) — offline vs card policy
