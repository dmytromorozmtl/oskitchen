# Storefront Stripe launch sign-off record

**Document:** `docs/STOREFRONT_STRIPE_LAUNCH_DECISION.md`  
**Status:** Engineering approved — **Option A** (awaiting Product signature)  
**Product guide:** [`PRODUCT_STRIPE_SIGNOFF_GUIDE.md`](PRODUCT_STRIPE_SIGNOFF_GUIDE.md)

---

## Decision

| | |
|---|---|
| **Selected option** | ☑ **A — Pay-later only** (recommended) &nbsp; ☐ **B — Stripe online checkout** |
| **Environment verified** | ☐ Staging smoke &nbsp; ☐ Production |

### Option A — Pay-later only

- [x] Engineering: Ordering must use **Pay later / request only**; **Online payments** off for launch
- [x] Engineering: No `STRIPE_SECRET_KEY` in Vercel Production for this release
- [ ] Product: Customer-facing copy does not promise card payment on day 1
- [ ] Product: Confirm in admin Ordering tab before prod deploy

**Sign-off statement:** We ship pay-later only; card payments deferred to a follow-up release.

### Option B — Stripe online checkout

_Not selected for this release._

---

## Approvals

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product | _fill name_ | _YYYY-MM-DD_ | ☐ |
| Engineering | Release automation (repo) | 2026-05-17 | ☑ |

---

## Change log

| Date | Change | By |
|------|--------|-----|
| 2026-05-17 | Option A selected — engineering sign-off for pay-later MVP | Engineering |
| 2026-05-17 | Initial record | Engineering |
