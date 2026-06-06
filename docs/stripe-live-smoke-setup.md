# Stripe live smoke setup — OS Kitchen

**Task:** Phase 1 extension #86  
**Status:** Human gate — requires Stripe secret key + webhook secret in staging vault  
**Evidence:** `artifacts/stripe-live-smoke-summary.json` → `overall: SKIPPED` until live key is wired

This guide moves Stripe live proof from **SKIPPED/FAILED** → **PASSED**. PASS requires live secret key, PaymentIntent create, webhook secret, and payout reconciliation wiring.

---

## 1. What is already wired

| Layer | Location | Behavior |
|-------|----------|----------|
| Live smoke script | `scripts/smoke-stripe-live.ts` | API ping → PaymentIntent → webhook → payout reconcile |
| Era 86 orchestrator | `scripts/smoke-stripe-live-era86.ts` | Wiring cert + live path; policy `era86-stripe-live-smoke-v1` |
| npm command | `npm run smoke:stripe-live-era86` | Cert + live smoke; writes artifact |
| Artifact | `artifacts/stripe-live-smoke-summary.json` | `overall: PASSED \| SKIPPED \| FAILED` |
| Webhook route | `/api/integrations/stripe/webhook` | PaymentIntent + payout events |
| Dashboard UI | `/dashboard/integrations/stripe/live` | Connect, PaymentIntent, payout reconcile |

---

## 2. Provision Stripe keys (one-time)

1. Create or use a Stripe test account at [Stripe Dashboard](https://dashboard.stripe.com/).
2. Copy **Secret key** (`sk_test_...` or `sk_live_...`).
3. Create webhook endpoint → copy **Signing secret** (`whsec_...`).
4. Connect in Dashboard → Integrations → Stripe.

**Placeholder keys** (`smoke-test-*`) are detected and skipped with reason.

---

## 3. Staging env (`.env.smoke.local`)

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=postgresql://...
CHANNEL_SMOKE_OWNER_EMAIL=smoke-owner@example.com
```

---

## 4. Run smoke

```bash
npm run smoke:stripe-live-era86
```

Expected when fully wired:

- `wiring_audit` → PASSED
- `unit_cert` → PASSED
- `stripe_api_connection` → PASSED
- `payment_intent_wiring` → PASSED
- `webhook_wiring` → PASSED or SKIPPED (no webhook secret)
- `payout_reconciliation_wiring` → PASSED or SKIPPED (no owner email)
- `overall: PASSED`

---

## 5. Sales pitch

"Stripe isn't a redirect link — it's PaymentIntent, signed webhooks, and payout reconciliation with era86 live smoke certification before go-live."
