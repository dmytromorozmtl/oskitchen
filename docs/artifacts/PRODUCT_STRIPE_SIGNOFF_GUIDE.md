# Product sign-off — Stripe Option A (pay-later)

**For:** Product / Ops  
**Record:** [`STOREFRONT_STRIPE_SIGNOFF_RECORD.md`](STOREFRONT_STRIPE_SIGNOFF_RECORD.md)  
**Time:** ~15 minutes

---

## What you are approving

We launch storefront checkout **without card payments**. Customers submit orders; kitchen confirms and collects payment offline or via existing flows.

---

## Checklist before you sign

| # | Check | ☐ |
|---|-------|---|
| 1 | Public menu/checkout copy does **not** promise “Pay with card” on day 1 | |
| 2 | Admin → **Ordering**: **Pay later** enabled, **Online payments** disabled | |
| 3 | Staging smoke on `/s/hello` (or pilot slug) completed — see QA artifact | |
| 4 | Support/runbook knows orders arrive as **unpaid / request** in Order Hub | |

---

## How to sign

1. Open [`STOREFRONT_STRIPE_SIGNOFF_RECORD.md`](STOREFRONT_STRIPE_SIGNOFF_RECORD.md).
2. Check Product boxes under **Option A**.
3. Fill **Name** and **Date** in Approvals table.
4. Change `_pending_` → your name; mark ☑ in Signature column.

---

## When to choose Option B instead

Only if Product explicitly approves card checkout for launch. Requires Engineering to set Stripe keys in Vercel and run Stripe 5-step smoke — see `docs/STOREFRONT_STRIPE_LAUNCH_DECISION.md`.
