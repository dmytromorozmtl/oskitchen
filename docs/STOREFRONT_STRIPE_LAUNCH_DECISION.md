# Storefront Stripe launch decision

Use this document when completing **A3** (Product + Engineering sign-off).

## Option A — Pay-later only (recommended for fastest MVP)

| Item | Action |
|------|--------|
| Ordering | Enable **Pay later / request only**; disable **Online payments** |
| Env | Stripe keys **not** required |
| Guest UX | Checkout shows pay-later path only |
| Risk | Lowest — no `paid` without webhook surface |

**Sign-off line:** “We ship pay-later only; card payments deferred.”

## Option B — Online card checkout

| Item | Action |
|------|--------|
| Env | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Dashboard | Webhook `checkout.session.completed` → `https://<prod>/api/webhooks/stripe` |
| Ordering | Online payments on; pay-later-only **off**; currencies aligned (Ordering tab) |
| Smoke | 5-step flow in `STOREFRONT_RELEASE_READINESS_PLAN.md` P0-3 |
| Rule | Never mark `paid` except via webhook (`purpose=storefront_order`) |

**Sign-off line:** “Stripe configured; smoke payment verified on staging.”

## Verification commands

```bash
npm run check-env:storefront
STOREFRONT_CHECK_STRIPE=1 npm run check-env:storefront
```

Launch tab → **Production & ops readiness** reflects live env on the server.

---

## Sign-off record (complete before prod deploy)

| Field | Value |
|-------|-------|
| **Decision** | ☐ **Option A** — Pay-later only &nbsp;&nbsp; ☐ **Option B** — Stripe online checkout |
| **Environment** | ☐ Staging verified &nbsp;&nbsp; ☐ Production |
| **Stripe smoke** (Option B only) | Webhook event id: _____________ Order id: _____________ |
| **Product** | Name: _________________ Date: _________ Signature: ☐ |
| **Engineering** | Name: _________________ Date: _________ Signature: ☐ |

**Default recommendation for first KitchenOS storefront release:** Option A unless card payment is a contractual requirement on day 1.

### Recorded decision (edit when signed)

```
Decision:   [ PENDING — choose A or B before deploy ]
Signed by:  ____________________
Date:       ____________________
Notes:      ____________________
```
