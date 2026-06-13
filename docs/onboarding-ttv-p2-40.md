# Onboarding TTV measurement

**Policy:** `onboarding-ttv-p2-40-v1`  
**Department:** Onboarding  
**Registry:** [`artifacts/onboarding-ttv-p2-40-registry.json`](../artifacts/onboarding-ttv-p2-40-registry.json)

---

## Target

Measure **time-to-value (TTV)** from account signup to **first order received** in the workspace.

| Metric | Target |
|--------|--------|
| Signup anchor | `UserProfile.createdAt` |
| First order anchor | Earliest `Order.createdAt` in owner workspace scope |
| TTV target | **30 min** |
| Lifecycle event | `onboarding_ttv_first_order` |

---

## Honest baseline

TTV is measured in **wall-clock minutes** from signup to first persisted order — not from onboarding wizard completion or menu publish. Webhook/import orders count when they create the workspace's first order row. The strip on `/dashboard/today` shows during the first 30 account days while onboarding is incomplete or when a recent TTV lifecycle event exists.

> Signup anchor is UserProfile.createdAt. First order is the earliest order in workspace scope. Target is 30 min to first order. Recorded once via lifecycle event onboarding_ttv_first_order.

---

## Flow

1. **Measure** — `evaluateOnboardingTtvStatus()` compares signup vs first order timestamps.
2. **Record** — On first order creation, `recordOnboardingTtvOnFirstOrder()` writes lifecycle metadata and sets `ActivationState.firstOrderCreated`.
3. **Render** — `OnboardingTtvStrip` on `/dashboard/today` during onboarding window.
4. **Assert** — Audit golden path: 22 min TTV → `met_target` (under 30 min).

---

## Wiring

| Path | Role |
|------|------|
| `lib/onboarding/onboarding-ttv-p2-40-measurement.ts` | TTV math + status |
| `lib/onboarding/onboarding-ttv-record.ts` | First-order lifecycle hook |
| `services/onboarding/onboarding-ttv-service.ts` | Load TTV for Today |
| `components/onboarding/onboarding-ttv-strip.tsx` | Operator-facing strip |
| `services/orders/order-creation-service.ts` | Side-effect on first order |
| `app/dashboard/today/page.tsx` | Strip visibility |

---

## Audit

```bash
npm run audit:onboarding-ttv-p2-40
npm run check:onboarding-ttv-p2-40
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml` — Onboarding TTV P2-40 audit step.
