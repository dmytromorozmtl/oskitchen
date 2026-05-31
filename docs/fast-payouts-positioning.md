# Fast Payouts — Competitive Positioning & Sales Guide

**Status:** Production — Stripe Connect standard payout schedule  
**Audience:** Sales, owners burned by Square holds, finance leads  
**Technical:** Stripe Connect / Stripe Payments — OS Kitchen never custodies merchant funds

---

## One-line pitch

**Your card revenue follows Stripe's standard payout schedule — typically next business day. OS Kitchen never holds your money.**

---

## Positioning headline

> **Your money. Next day. Through Stripe — not through us.**

Subheading for marketing: **Next-Day Payouts** (Stripe standard schedule)

---

## How it works

1. **Customer pays** — card-present (Stripe Terminal beta) or online (Stripe Checkout / Connect).
2. **Stripe processes** — authorization, capture, and settlement run on **your Stripe account**.
3. **Stripe pays out** — funds transfer to your linked bank on Stripe's default schedule (typically **next business day** in the US for eligible accounts).
4. **OS Kitchen's role** — software only. We create payment intents and record orders. **We never touch, hold, or route your card revenue.**

---

## Competitor comparison

| Platform | Payout time | Freeze / hold risk | Reserves | Who holds funds |
|----------|-------------|-------------------|----------|-----------------|
| Square | 1–2 days typical | ⚠️ High — account freezes reported (weeks to months) | Rolling reserve possible | Square |
| Toast | 2–3 days typical | ⚠️ Medium — processor-dependent | Rolling reserve possible | Toast payments stack |
| **OS Kitchen** | **Next business day** (Stripe standard) | **Low vs platform lock** — Stripe risk policies apply | **No OS Kitchen reserve** | **Stripe (your account)** |

*Square freeze anecdotes reflect widely reported merchant forum patterns — not legal findings. Always qualify with "Stripe's standard schedule and risk policies apply."*

---

## Why OS Kitchen doesn't freeze your payouts

> **We don't process payments. Stripe does. We never touch your money.**

| Layer | Responsibility |
|-------|----------------|
| OS Kitchen | Order flow, kitchen ops, POS UI, payment intent creation |
| Stripe | Card network, settlement, payout to your bank, compliance holds |
| You | Own the Stripe Connect / Payments account; see payouts in Stripe Dashboard |

**Sales line:** *"Square is the bank and the POS. With OS Kitchen, Stripe is the bank — we're just the kitchen software."*

---

## Sales pitch (30 seconds)

> "Square merchants get frozen for weeks with no appeal — you've seen the Reddit threads. Toast bundles payments and you wait on their stack. OS Kitchen runs on Stripe. Your card revenue lands on Stripe's standard schedule — typically next business day — in **your** Stripe account. We never hold a reserve. We never touch your payout."

---

## Safe sales wording

**Allowed:**

- "Stripe standard payout schedule — typically next business day"
- "OS Kitchen never custodies or holds your card revenue"
- "Payouts go to your Stripe-connected bank account"
- "Separate software from payments — Stripe is your processor"
- "No OS Kitchen payout freeze — we don't control your funds"

**Not allowed:**

- "Instant funding" or "same-day guaranteed"
- "Zero freeze risk ever" (Stripe applies its own risk policies)
- "No exceptions" without Stripe qualifier
- "Guaranteed loan approval" / "KitchenOS Capital"
- "We are faster than Square guaranteed"

---

## Objection handling

| Objection | Response |
|-----------|----------|
| "Square pays next day too" | True for many accounts — but Square also acts as processor and has widely reported account holds. With us, Stripe is the processor and you own that relationship directly. |
| "Can you freeze my account?" | No. OS Kitchen has no access to hold your Stripe balance. Any hold would come from Stripe under their published risk policies — not from us. |
| "What about chargebacks?" | Handled in Stripe Dashboard per Stripe's dispute flow — same as any Stripe merchant. |
| "Do you take a cut of processing?" | OS Kitchen subscription is separate. Card processing fees are Stripe's standard rates on your Stripe account — we don't add a hidden processing markup in software. |

---

## What to say vs. what NOT to say

| ✅ Say | ❌ Don't say |
|--------|-------------|
| "Stripe next-business-day standard schedule" | "Instant deposits" |
| "We never hold your money" | "Impossible to ever get frozen" |
| "Your Stripe account, your payouts" | "Faster than Square guaranteed" |
| "Honest: Stripe risk policies still apply" | "No exceptions" (unqualified) |

---

## Marketing assets

| Asset | Path |
|-------|------|
| Trust badge | `components/marketing/fast-payouts-badge.tsx` |
| Unit test | `tests/unit/fast-payouts-badge.test.ts` |

---

## Proof path

```bash
npm test -- tests/unit/fast-payouts-badge.test.ts
npm run verify-claims
```

Confirm merchant Connect onboarding docs: `docs/STRIPE_LIVE_MODE_SETUP.md`, `docs/STOREFRONT_ONLINE_PAYMENTS.md`.
