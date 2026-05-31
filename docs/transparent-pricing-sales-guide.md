# Transparent Pricing — Competitive Positioning & Sales Guide

**Status:** Production — public pricing page live  
**Audience:** Sales, owners comparing Toast/Square/Lightspeed, finance approvers  
**Technical:** [`/pricing`](../app/pricing/page.tsx) · [`plan-registry.ts`](../lib/billing/plan-registry.ts) · [`pricing-faq.ts`](../lib/marketing/pricing-faq.ts)

---

## One-line pitch

**Published prices. No hardware bundle. No "call for quote" on core plans — see exactly what you pay before you sign up.**

---

## Positioning headline

> **Toast hides the total cost behind hardware leases. We publish software pricing on the website.**

Subheading: **No hidden fees on published plans**

---

## Public plans (source of truth)

Prices read from `PLAN_REGISTRY` — do not quote different numbers in sales without updating the registry and `/pricing`.

| Plan | Monthly | Best for | Trial |
|------|---------|----------|-------|
| **Starter** | $29/mo | Small weekly ops, 1 menu, 100 orders/mo | 14 days, no card at signup |
| **Pro** | $79/mo | Meal prep, catering, Shopify/Woo | 14 days |
| **Team** | $199/mo | Multi-channel, Uber modules, forecasting | 14 days |
| **Enterprise** | Contact sales | Multi-location, API, SLA | Scoped SOW |

**Annual billing:** ~17% effective discount on published monthly list (toggle on `/pricing`). Confirm enterprise numbers with sales before contract.

---

## "No hidden fees" guarantee (honest scope)

**Included in published software price:**

- Kitchen OS workspace (orders, production, packing, POS web UI)
- Plan-scoped integrations (Shopify/Woo on Pro+ when you connect credentials)
- Multi-location reporting dashboard (included — not a paid addon)
- Cross-channel inventory sync (included on eligible plans)
- 100+ report catalog search (included)

**Not hidden — but separate from software subscription:**

| Cost | Who charges | Sales wording |
|------|-------------|---------------|
| Card processing | **Stripe** (merchant's account) | "Processing fees go to Stripe, not OS Kitchen" |
| Optional Stripe Terminal reader | **Stripe hardware** (~$59 M2) | "Optional — not required for POS" |
| SMS / guest texting | **Not included** | "Email notifications today — SMS roadmap" |
| Enterprise SSO / SOC 2 | **Contract scope** | "Roadmap or separate enterprise agreement" |
| Marketplace partner fees | **Uber / DoorDash / etc.** | "Partner-gated — credentials required" |

**Allowed guarantee line:** "Published plan prices include the features listed on `/pricing` — no mandatory hardware lease, no surprise integration unlock fee for Pro/Team tiers."

**Not allowed:** "Zero extra costs ever" or "All integrations free forever."

---

## Competitor comparison (Toast focus)

| Line item | Toast (typical) | Square (typical) | **OS Kitchen** |
|-----------|-----------------|------------------|----------------|
| Software | Bundled with hardware | Free tier + upsells | **$29–$199/mo published** |
| Terminal | ~$799 proprietary | ~$299+ Square Terminal | **$0 required** (BYOD tablet) |
| Contract | Often 2-year with hardware | Month-to-month software | **Month-to-month** |
| Multi-location reporting | Enterprise tier | Add-ons | **Included** (Team+) |
| Price on website | "Contact sales" common | Partial | **Full list at `/pricing`** |
| 5-year TCO | Hardware + lease + software | Hardware + processing | **TCO calculator on page** |

*Verify current Toast/Square quotes before customer conversations — competitor pricing shifts.*

---

## What ships on `/pricing` (evidence)

| Section | Evidence |
|---------|----------|
| 4 plan cards | `components/marketing/pricing-page.tsx` |
| Feature comparison table | Starter / Pro / Team / Enterprise matrix |
| Toast/hardware TCO model | `TcoCalculator` — 5-year tablet vs terminal bundle |
| ROI estimator | `RoiCalculator` — conservative framing only |
| FAQ (8 items) | `PRICING_FAQ_ITEMS` + JSON-LD schema |
| Honest integration disclaimer | Uber/marketplace amber banner |
| Plan registry sync | Prices from `PLAN_REGISTRY`, not hardcoded duplicates |

---

## Sales pitch (30 seconds)

> "Toast quotes you software plus a seven-hundred-dollar terminal and often a two-year contract — the real number isn't on their website. OS Kitchen publishes Starter at twenty-nine, Pro at seventy-nine, Team at one-ninety-nine. Run POS on the iPad you own. Processing goes through your Stripe account. Multi-location reporting and cross-channel inventory aren't eighty-nine-dollar addons — they're in the product. Fourteen-day trial, no credit card at signup."

---

## Safe sales wording

**Allowed:**

- "Published pricing at kitchenos.app/pricing"
- "No mandatory hardware bundle"
- "14-day free trial on Starter, Pro, and Team"
- "Month-to-month software — cancel anytime"
- "Stripe processing fees are separate from software"
- "TCO calculator compares terminal bundles to BYOD"

**Not allowed:**

- "Cheaper than Toast in every scenario"
- "No fees of any kind"
- "Toast replacement guarantee"
- "All integrations live day one"
- "POS works fully offline" (contradicts FAQ)

---

## Objection handling

| Objection | Response |
|-----------|----------|
| "Toast is free with hardware" | Toast subsidizes hardware with higher effective software + processing + contract length. Run the TCO calculator with their terminal quote. |
| "Square is free" | Square free tier caps features; hardware upsell is the model. Our Pro at $79 includes kitchen production, CRM, and channel setup-ready integrations. |
| "Why not Enterprise for one location?" | Enterprise is for multi-location, custom SOW, API contracts, and SLA — Starter/Pro/Team cover most single-unit operators. |
| "What's NOT included?" | Processing (Stripe), optional card reader, SMS, formal SOC 2/SSO — all documented in FAQ. |

---

## Demo flow (5 minutes)

1. Open **`/pricing`** — scroll plans, toggle annual discount.
2. **Feature table** — highlight Pro vs Team for Shopify/Uber.
3. **TCO calculator** — enter Toast terminal $799 vs existing iPad.
4. **FAQ** — "Is OS Kitchen a Toast replacement?" (honest answer on page).
5. **Signup** — `/signup` 14-day trial path.

---

## Proof path

```bash
open https://kitchenos.app/pricing
npm run verify-claims   # marketing governance
```

Cross-links: [No hardware lock-in](./no-hardware-lock-in-positioning.md) · [Fast payouts](./fast-payouts-positioning.md)
