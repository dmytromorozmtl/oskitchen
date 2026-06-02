# Stripe Connect vendor test plan — B2B marketplace

**Version:** 1.0 · **June 2026**  
**Scope:** HoReCa **marketplace vendor** payouts via Stripe Connect Express  
**Feature flag:** `MARKETPLACE_VENDOR_STRIPE_CONNECT=1` (off by default)  
**Service:** `services/marketplace/stripe-connect-service.ts`  
**Parent:** [`staging-environment-checklist.md`](./staging-environment-checklist.md) · Task 32 `e2e/vendor-registration.spec.ts`

This plan covers **test mode** validation before enabling marketplace Connect in staging or production. It is separate from **storefront** Connect (`STOREFRONT_STRIPE_CONNECT=1`) and **partner billing** Connect (`services/platform/partner-stripe-connect-service.ts`).

---

## Executive summary

| Layer | What runs | Pass when |
|-------|-----------|-----------|
| **L0 — Config unit** | `tests/unit/marketplace-stripe-connect.test.ts` | Feature flag + status labels correct |
| **L1 — Env smoke** | Manual env checklist (below) | All Stripe test keys + webhook registered |
| **L2 — Vendor onboarding** | Connect Account Link flow | Express account created; `stripeAccountId` on `Vendor` |
| **L3 — Order payment** | PaymentIntent with destination + app fee | Buyer checkout succeeds; `paymentIntentId` on PO |
| **L4 — Payout release** | Webhook + payout actions | `VendorTransaction` → `AVAILABLE` → `PAID_OUT` |

**Honesty rule:** With flag off, Connect status is **`disabled`** — do not claim live vendor payouts. Code shipped ≠ production-certified.

---

## Scope

### In scope

- Vendor registration → approval → Connect onboarding (`/vendor/register` → `/vendor/finance`)
- Express account creation (`stripe.accounts.create`)
- Account Link onboarding (`type: account_onboarding`)
- Marketplace checkout PaymentIntent with `transfer_data.destination` + `application_fee_amount`
- Webhook: `POST /api/marketplace/stripe-connect/webhook`
- Events: `account.updated`, `payment_intent.succeeded`, transfer/payout logging
- Payout: `processPayout` / `requestVendorPayoutAction` with Stripe transfer when Connect ready
- RBAC: `vendor.finance.*`, `canRequestPayouts` gate

### Out of scope (separate test plans)

| Surface | Flag / path |
|---------|-------------|
| Storefront guest checkout Connect | `STOREFRONT_STRIPE_CONNECT=1` · `scripts/storefront-stripe-connect-smoke.ts` |
| Platform partner billing Connect | `/platform/partner-billing` |
| Stripe Terminal / in-person | Not wired for marketplace |
| Instant payouts (Task 116) | Roadmap only |

### Prerequisite

- Marketplace core migration applied: `prisma/migrations/20260602133000_marketplace_core/` ([`migration-deployment-process.md`](./migration-deployment-process.md))
- At least one **APPROVED** vendor row in staging DB

---

## Environment variables

Set in Vercel staging / local `.env.local` — **test mode keys only** until finance sign-off.

| Variable | Required | Purpose |
|----------|:--------:|---------|
| `MARKETPLACE_VENDOR_STRIPE_CONNECT` | **Y** | Must be `1` to enable Connect path |
| `STRIPE_SECRET_KEY` | **Y** | Platform secret (`sk_test_...` for tests) |
| `STRIPE_CONNECT_CLIENT_ID` | **Y** | Connect OAuth client id (`ca_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Y** | Buyer checkout Elements (if UI wired) |
| `STRIPE_MARKETPLACE_WEBHOOK_SECRET` | **Y** | Webhook signing secret for marketplace route |
| `STRIPE_WEBHOOK_SECRET` | Fallback | Used if marketplace-specific secret unset |
| `NEXT_PUBLIC_APP_URL` | **Y** | Account Link `return_url` / `refresh_url` base |

**Stripe Dashboard setup (test mode):**

1. Enable **Connect** → Settings → Express accounts
2. Create webhook endpoint: `https://<staging>/api/marketplace/stripe-connect/webhook`
3. Subscribe to: `account.updated`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `transfer.created`, `payout.paid`
4. Copy webhook signing secret → `STRIPE_MARKETPLACE_WEBHOOK_SECRET`

---

## Code paths under test

| Surface | Path |
|---------|------|
| Connect service | `services/marketplace/stripe-connect-service.ts` |
| Config / status | `lib/marketplace/stripe-connect-config.ts` |
| Server actions | `actions/vendor/stripe-connect.ts` |
| Payout action (finance UI) | `actions/vendor/finance.ts` → `vendor-finance-service` |
| Webhook route | `app/api/marketplace/stripe-connect/webhook/route.ts` |
| Vendor registration | `app/vendor/register/page.tsx` |
| Vendor finance UI | `app/vendor/(cabinet)/finance/page.tsx` |
| Prisma | `Vendor.stripeAccountId`, `VendorTransaction`, `MarketplacePurchaseOrder.paymentIntentId` |

### Connect status machine

| Status | Condition |
|--------|-----------|
| `disabled` | `MARKETPLACE_VENDOR_STRIPE_CONNECT` ≠ `1` |
| `not_connected` | Flag on; no `stripeAccountId` |
| `pending_verification` | Account exists; Stripe `details_submitted` or payouts not enabled |
| `ready` | `payouts_enabled` + `details_submitted` (via `refreshVendorConnectReadiness`) |

---

## Test inventory

### L0 — Automated unit (CI — always on)

```bash
node ./node_modules/vitest/vitest.mjs run tests/unit/marketplace-stripe-connect.test.ts
node ./node_modules/vitest/vitest.mjs run tests/unit/marketplace-vendor-registration.test.ts
node ./node_modules/vitest/vitest.mjs run tests/unit/marketplace-vendor-finance.test.ts
```

| Test file | Validates |
|-----------|-----------|
| `marketplace-stripe-connect.test.ts` | Flag off → `disabled`; status labels |
| `marketplace-vendor-registration.test.ts` | Document parsing; status labels |
| `marketplace-vendor-finance.test.ts` | 1099-K HTML helper |

**Gap (future):** Mock Stripe client integration tests for `createVendorAccount`, `createPaymentIntent`, webhook handler.

### L1 — Environment smoke (manual / ops)

Run before L2:

```bash
# 1. Flag and keys
test "$MARKETPLACE_VENDOR_STRIPE_CONNECT" = "1" || echo "FAIL: flag off"
test -n "$STRIPE_SECRET_KEY" && echo "OK: STRIPE_SECRET_KEY"
test -n "$STRIPE_CONNECT_CLIENT_ID" && echo "OK: STRIPE_CONNECT_CLIENT_ID"
test -n "$STRIPE_MARKETPLACE_WEBHOOK_SECRET" && echo "OK: webhook secret"

# 2. Webhook route reachable (expect 401/400 without signature — not 404)
curl -sf -o /dev/null -w "%{http_code}" -X POST \
  "$NEXT_PUBLIC_APP_URL/api/marketplace/stripe-connect/webhook" \
  -H "Content-Type: application/json" -d '{}'
# Expect 401 (missing signature) or 400 — proves route exists
```

| Check | Pass |
|-------|------|
| Connect enabled in Stripe Dashboard (test) | Express visible |
| Webhook endpoint registered | Secret in vault |
| `GET /api/health` | 200 on staging |

### L2 — Vendor onboarding (manual)

**Precondition:** Vendor status `APPROVED`; test user has `canRequestPayouts`.

| ID | Step | Pass criteria |
|----|------|---------------|
| V1 | Register at `/vendor/register` | Application `PENDING` → admin approves → `APPROVED` |
| V2 | Open `/vendor/finance` | Finance balances load (may be $0) |
| V3 | Invoke `getVendorStripeConnectLinkAction` | Returns Stripe Account Link URL (via server action or future UI button) |
| V4 | Complete Stripe Express onboarding (test SSN `000-00-0000`, test bank) | Redirect to `/vendor/finance?connect=return` |
| V5 | DB check | `Vendor.stripeAccountId` = `acct_...` |
| V6 | Webhook `account.updated` | `verifiedAt` set when payouts enabled |
| V7 | `getVendorConnectStatusAction` | `status: ready`, `payoutsEnabled: true` |

**Stripe test data:** [Connect test accounts](https://stripe.com/docs/connect/testing) — use Express onboarding with test mode.

### L3 — Order → payment (manual / future E2E)

**Precondition:** L2 complete; vendor has ≥1 published product; buyer workspace can checkout.

| ID | Step | Pass criteria |
|----|------|---------------|
| P1 | Buyer adds product to cart → checkout | PO created `MarketplacePurchaseOrder` |
| P2 | `createPaymentIntent({ orderId })` | Returns `clientSecret`; PO has `paymentIntentId` |
| P3 | Pay with test card `4242 4242 4242 4242` | PaymentIntent `succeeded` |
| P4 | Verify Stripe Dashboard | Charge on **connected account**; application fee on platform |
| P5 | Webhook `payment_intent.succeeded` | `VendorTransaction` moves to `AVAILABLE` |
| P6 | Commission math | `application_fee_amount` = `total × commissionRate` |

**Test cards:** Stripe docs — `4242...` success, `4000 0000 0000 9995` decline.

### L4 — Payout (manual)

| ID | Step | Pass criteria |
|----|------|---------------|
| O1 | `VendorTransaction` with `status: AVAILABLE` | Balance > 0 on finance page |
| O2 | Click **Request payout** (`requestVendorPayoutAction`) | Toast with `PAYOUT-...` id |
| O3 | Connect path: `processPayout` | Stripe `transfers.create` to connected account |
| O4 | DB | Transactions → `PAID_OUT`; `payoutId` set |
| O5 | Stripe Dashboard | Transfer visible on connected account |

---

## Webhook verification tests

### Signature rejection (manual curl)

```bash
# Must return 401 — missing stripe-signature
curl -s -o /dev/null -w "%{http_code}" -X POST \
  "$NEXT_PUBLIC_APP_URL/api/marketplace/stripe-connect/webhook" \
  -H "Content-Type: application/json" -d '{"type":"account.updated"}'
```

### Valid event (Stripe CLI)

```bash
stripe listen --forward-to localhost:3000/api/marketplace/stripe-connect/webhook
stripe trigger account.updated
stripe trigger payment_intent.succeeded
```

| Event | Handler behavior |
|-------|------------------|
| `account.updated` | Updates `Vendor.verifiedAt` when payouts + details submitted |
| `payment_intent.succeeded` | `releaseFunds` → transactions `AVAILABLE` |
| `payment_intent.payment_failed` | Logged only |
| `transfer.created` / `payout.paid` | Logged only |

---

## End-to-end spec (Task 32 — planned)

Target file: `e2e/vendor-registration.spec.ts`

```text
auth → /vendor/register → submit application
→ (seed/admin approve vendor)
→ Connect onboarding (mock or STRIPE_E2E=1)
→ /vendor/products/new → create product
→ buyer checkout → PO + payment
→ /vendor/orders → confirm order
```

**Env for live E2E:** `MARKETPLACE_VENDOR_STRIPE_CONNECT=1`, test Stripe keys, `PLAYWRIGHT_BASE_URL` staging.

Until Task 32 ships: execute L2–L4 manually per tables above.

---

## Pass / fail criteria

| Gate | PASS | FAIL |
|------|------|------|
| L0 unit | All vitest green | Any failure |
| L1 env | All required vars + webhook route ≠ 404 | Missing keys |
| L2 onboarding | `stripeAccountId` + Connect `ready` | Onboarding error / no account |
| L3 payment | PI succeeded + app fee correct | Decline / wrong destination |
| L4 payout | Transfer + `PAID_OUT` | Transfer error / stuck `PENDING` |

**Overall staging PASS:** L0 + L1 + L2 + P1–P3 + O1–O3 on **one reference vendor** in test mode.

---

## Failure triage

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| "Connect disabled" | Flag off | Set `MARKETPLACE_VENDOR_STRIPE_CONNECT=1` |
| "STRIPE_CONNECT_CLIENT_ID not configured" | Missing client id | Stripe Dashboard → Connect settings |
| Account Link 404 | Wrong `NEXT_PUBLIC_APP_URL` | Match staging domain |
| Webhook 503 | Secret unset | Set `STRIPE_MARKETPLACE_WEBHOOK_SECRET` |
| Payment without destination | Vendor not Connect-ready | Complete L2 |
| Payout without transfer | Connect off or no `stripeAccountId` | Check flag + account |
| Cross-tenant vendor access | RBAC bug — **P0** | `resolveVendorCabinetAccess` audit |

---

## Rollback procedure

1. Set `MARKETPLACE_VENDOR_STRIPE_CONNECT=0` in staging/production
2. Disable marketplace webhook in Stripe Dashboard (or remove secret)
3. Confirm new checkouts use platform-only path (no `transfer_data`)
4. Existing connected accounts remain in Stripe — document manual payout fallback
5. Do not delete `Vendor.stripeAccountId` without finance approval

---

## Sales-safe language

| Status | Approved |
|--------|----------|
| Flag off (default) | "Marketplace vendor payments in development — manual settlement for pilots" |
| L2–L3 test mode PASS | "Stripe Connect validated in test mode for reference vendor" |
| Production LIVE | Requires finance sign-off + real `sk_live_` + dispute process — not implied by this doc |

**Never claim:** "Instant vendor payouts live" · "Full marketplace payment network" · "Stripe Connect production-ready for all vendors" (June 2026 default).

---

## Related docs & tasks

| Resource | Topic |
|----------|-------|
| [`prisma-optimization-audit.md`](./prisma-optimization-audit.md) | Marketplace model cluster |
| [`migration-deployment-process.md`](./migration-deployment-process.md) | Apply marketplace migration |
| [`roadmap/STOREFRONT_STRIPE_CONNECT_OPTION_B.md`](./roadmap/STOREFRONT_STRIPE_CONNECT_OPTION_B.md) | Storefront Connect (different flag) |
| [`sso-idp-smoke-test-plan.md`](./sso-idp-smoke-test-plan.md) | Enterprise SSO (separate track) |
| Task 32 | `e2e/vendor-registration.spec.ts` |
| Task 55 | `docs/vendor-seeding-strategy.md` |
| Task 116 | Instant payouts plan |
