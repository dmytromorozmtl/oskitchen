# Software-first POS positioning

**Task:** MKT-07  
**Status:** Sales + GTM canonical reference  
**Updated:** 2026-06-03  
**Audience:** Sales, founders, ICP operators (ghost kitchen, commissary, meal prep)  
**Related:** [`transparent-pricing-sales-guide.md`](./transparent-pricing-sales-guide.md) · [`competitor-comparison-honest.md`](./competitor-comparison-honest.md) · [`forbidden-claims-training.md`](./forbidden-claims-training.md) · [`icp-definition-final.md`](./icp-definition-final.md)

---

## Executive summary

OS Kitchen POS is **software-first**: counter checkout runs in the **browser on tablets or laptops you already own**. There is **no proprietary terminal lease**, no mandatory hardware bundle, and no Toast Go / Square Reader lock-in to start a pilot.

**One-line pitch:**

> **Run POS on any modern device. Pay published software pricing. Add optional Stripe Terminal only if you want chip/tap — never required to go live.**

**Honest caveat:** We are **not** Toast/Square hardware-certified. Offline card EMV, rush-hour SLA, and proprietary KDS devices are **out of pilot scope** unless explicitly contracted after proof.

---

## What “software-first” means

| Principle | OS Kitchen behavior |
|-----------|---------------------|
| **BYOD device** | iPad, Android tablet, laptop, kiosk browser — any device with a modern browser |
| **No mandatory terminal** | Cash and pay-later paths work without Stripe Terminal |
| **Published software SKU** | `$29–$199/mo` on [`/pricing`](../app/pricing/page.tsx) — not buried in hardware lease |
| **Stripe Connect payments** | Card checkout when merchant connects Stripe — processing fees to Stripe, not OS Kitchen |
| **Optional hardware** | Stripe Terminal M2 (~$59), label printers, kitchen displays — operator choice |
| **Same codebase as ops** | POS shares order hub, KDS, production, packing — not a siloed register app |

---

## What we do not mean (forbidden shortcuts)

| Do **not** say | Say instead |
|----------------|-------------|
| “Replace Toast everywhere” | “Software-first for operators who want browser POS + kitchen depth without a terminal lease” |
| “No hardware needed ever” | “No **proprietary** OS Kitchen hardware required; optional Stripe reader or printers are your choice” |
| “Full offline card like Square” | “Cash queue + sync when online; card pre-auth staging — **not** EMV store-and-forward certified” |
| “Certified for rush hour” | “KDS bump/recall pilot_ready — rush-hour SLA not certified” |
| “Free POS” | “Published plans from $29/mo — 14-day trial, no card at signup” |

Run `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` before decks or landing updates.

---

## vs hardware-bundle incumbents

### vs Toast

| Toast typical stack | OS Kitchen software-first |
|---------------------|---------------------------|
| Toast Go / handheld proprietary devices | Browser POS on your tablet |
| ~$799+ terminal + often 2-year contract | Month-to-month software; `$0` required hardware |
| Toast Hub ~$1,200 for offline EMV | Browser offline **cash queue** — not Hub parity ([`offline-pos-plan.md`](./offline-pos-plan.md)) |
| Bundled payments narrative | Stripe Connect — merchant’s Stripe account |
| Field install + certified KDS screens | Web KDS on any screen with browser |

**Talk track:** *“Toast wins when you want bundled terminals and a field rep installing proprietary hardware. We win when you want one cloud OS — order hub, production, KDS, and browser POS — on devices you already have, with honest Integration Health on what’s actually connected.”*

### vs Square

| Square typical stack | OS Kitchen software-first |
|----------------------|---------------------------|
| Square Terminal / Register upsell | No OS Kitchen-branded terminal required |
| Payments-led ecosystem | Kitchen + fulfillment depth first; payments via Stripe |
| Strong offline on Terminal | Browser queue for cash; card offline **not** certified |
| Retail-first POS UX | Meal prep, ghost kitchen, commissary ICP |

**Talk track:** *“Square is the default for simple retail counters. We’re for operators who run production kitchens and multi-channel fulfillment — still honest that we’re pre-scale on customer proof.”*

### vs Lightspeed

| Lightspeed typical stack | OS Kitchen software-first |
|--------------------------|---------------------------|
| Partner hardware channels | BYOD + optional Stripe Terminal |
| Established multi-site proof | Multi-location schema — pilot scope ≤5 sites |
| LIVE integration catalog | BETA/SKIPPED honesty — Integration Health moat |

**Talk track:** *“Lightspeed has proven multi-site installs. We match ambition on unified ops in one repo — not on hardware reseller networks or LIVE marketplace parity yet.”*

Full matrix: [`competitor-comparison-honest.md`](./competitor-comparison-honest.md)

---

## Hardware cost comparison (5-year TCO framing)

Use the TCO calculator on [`/pricing`](../app/pricing/page.tsx) in demos — **illustrative**, not a guaranteed savings claim.

| Line item | Toast / Square (typical) | OS Kitchen software-first |
|-----------|--------------------------|---------------------------|
| Proprietary terminal | $299–799+ per station | **$0 required** |
| Offline hub / server | Toast Hub ~$1,200 | **Not sold** — browser queue only |
| Software subscription | Often bundled opaque | **$29–$199/mo published** |
| Processing | Processor-of-record fees | **Stripe** merchant rates |
| Optional reader | Included in bundle narrative | Stripe Terminal M2 ~$59 **optional** |
| Contract | Often multi-year with hardware | **Month-to-month** on published plans |

**Pilot SKU:** 50% off list for 3 months — see [`pilot-pricing-skus.ts`](../lib/marketing/pilot-pricing-skus.ts) and LOI-DP-001 design partner path.

---

## Optional hardware (not lock-in)

| Device | Role | Required? |
|--------|------|:-----------:|
| Tablet / laptop | POS register UI | **Yes** (operator-provided) |
| Kitchen display (any screen) | KDS bump/recall | Recommended |
| Stripe Terminal M2 | Chip/tap card present | No |
| Label printer | Packing labels | No (Pro+) |
| USB receipt printer | Browser print | No |
| Kitchen camera stream | Station view (BETA) | No |

Partner program (validation, not bundle): [`hardware-partner-program.md`](./hardware-partner-program.md)

---

## ICP fit — who software-first wins

| Strong fit | Weak fit |
|------------|----------|
| Ghost kitchen — shared facility, multiple brands | QSR demanding Toast Go handhelds day one |
| Meal prep — weekly cutoff, production from orders | Operator requiring EMV offline through rush |
| Commissary — batch production + tenant orders | Enterprise RFP: proprietary terminal + SOC2 + SSO in 90 days |
| Pop-up / commissary counter — iPad POS | Franchise mandating Square Register fleet |
| Owner allergic to 2-year hardware lease | Needs certified payment terminal from OS Kitchen as processor-of-record |

Qualification: [`icp-definition-final.md`](./icp-definition-final.md)

---

## Product capabilities (honest maturity)

| Capability | Maturity | Software-first note |
|------------|----------|---------------------|
| In-browser POS checkout | pilot_ready / beta | No app store install required |
| Cash + pay-later paths | pilot_ready | Works without terminal |
| Stripe card checkout | When Stripe connected | Merchant’s Stripe account |
| Shift open / close | pilot_ready | Browser session |
| KDS bump / recall | pilot_ready | Any browser screen — not proprietary KDS hardware |
| Offline cash queue | beta | IndexedDB queue + sync — see [`offline-first-pos-competitive-positioning.md`](./offline-first-pos-competitive-positioning.md) |
| Offline card EMV | **Not certified** | Pre-auth metadata only — not store-and-forward |
| Stripe Terminal integration | roadmap / staging | Optional reader — not bundled |
| Table service / floor plan | partial | Not Toast-class table management parity |

Source: [`feature-maturity-matrix.md`](./feature-maturity-matrix.md)

---

## Discovery questions (qualify software-first)

1. What devices do you use today — proprietary terminals or tablets?
2. Is a **hardware lease or 2-year contract** a blocker?
3. Do you need **offline card** during internet outages, or is cash + sync acceptable?
4. Who owns payment processing today — Stripe, Square, Toast Payments?
5. Will staff accept **browser POS** on iPad, or mandate app-store native?
6. Is chip/tap required at launch, or can you start cash + pay-later + Stripe hosted?

**Disqualify early** if answers require Toast Hub offline EMV, proprietary handheld fleet, or processor-of-record parity in pilot term.

---

## Objection handling

| Objection | Response |
|-----------|----------|
| “We need a real terminal” | “Optional Stripe Terminal M2 works with Stripe Connect — we don’t force a lease. Many pilots start cash + storefront checkout on tablet.” |
| “What if Wi‑Fi drops?” | “Cash sales queue in the browser and sync with a visible counter when back online. Card offline is **not** EMV-certified — we won’t claim Toast Hub parity.” |
| “Toast includes everything” | “Toast bundles hardware and software. We publish software price and let you choose devices — compare 5-year TCO on our pricing page.” |
| “Is web POS slow?” | “Demo tier-2b checkout on staging — measure on your tablet. Rush-hour SLA is not a certified claim yet.” |
| “Square is free” | “Square monetizes payments and hardware upsells. Our model is transparent software for kitchen depth — different ICP.” |

---

## Demo script (2 minutes)

1. Open `/dashboard/pos/terminal` on **iPad or laptop browser** — no app install.
2. Show shift open → add items → cash checkout → receipt.
3. Jump to KDS on **second browser tab** — same order, no proprietary ticket printer required.
4. Open **Integration Health** — show honest BETA/SKIPPED on channels.
5. Close: “Total required hardware from OS Kitchen: **zero**. Your tablet, our software.”

---

## GTM asset map

| Asset | Path |
|-------|------|
| Public pricing + TCO | `/pricing` |
| Pilot SKUs | [`pilot-pricing-skus.ts`](../lib/marketing/pilot-pricing-skus.ts) |
| Compare Toast page | `/compare/toast` (if live) |
| Trust / BETA labels | `/trust` |
| Forbidden claims training | [`forbidden-claims-training.md`](./forbidden-claims-training.md) |
| Offline honest guide | [`offline-first-pos-competitive-positioning.md`](./offline-first-pos-competitive-positioning.md) |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-03 | MKT-07 — Software-first POS positioning (no hardware lock-in) |
