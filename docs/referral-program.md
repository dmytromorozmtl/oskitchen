# Referral program

Restaurant owners share a unique link; when a new restaurant signs up, **both** receive one free month (30 days) on their OS Kitchen subscription.

## How it works

1. **Link** — `https://os-kitchen.com/r/{CODE}` (also available under **Settings → Referrals**).
2. **Cookie** — Visiting the short link sets `kos_ref` for 90 days.
3. **Signup** — New account with a valid code creates a `ReferralEvent` and extends trial/subscription end dates for referee and referrer.
4. **Billing audit** — Each grant is recorded as `REFERRAL_FREE_MONTH` in `billing_events`.

## Competitor comparison

| Product | Referral reward |
|---------|-----------------|
| Toast | Partner/reseller programs; no built-in owner-to-owner month credit |
| Square | Limited referral credits for consumers, not B2B restaurant chain |
| **OS Kitchen** | Both restaurants get **1 free month** automatically |

## Sales pitch

> "Know another operator drowning in fees? Send them your OS Kitchen link. When they go live, you both get a month free — no forms, no waiting on support."

## Implementation

- Service: `services/referral/referral-service.ts`
- Settings UI: `app/dashboard/settings/referrals/page.tsx`
- Short link: `app/r/[code]/route.ts`
- Signup hook: `lib/growth/referrals.ts` → `processReferralConversion`
