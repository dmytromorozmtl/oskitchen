# No Hardware Lock-In — Competitive Positioning & Sales Guide

**Status:** Production — browser-first POS + optional Stripe Terminal  
**Audience:** Sales, owners evaluating Toast/Square, multi-location operators  
**Technical:** [`lib/pos/pos-hardware.ts`](../lib/pos/pos-hardware.ts) · [`/dashboard/pos/settings/hardware`](../app/dashboard/pos/settings/hardware/page.tsx)

---

## One-line pitch

**Work with your equipment. Or ours. Your choice — no proprietary terminal contract, no mandatory hardware bundle.**

---

## Positioning headline

> **Bring your own hardware. We'll connect to it. No contract. No lock-in.**

Subheading for marketing: **Works with your equipment**

---

## Supported hardware (honest list)

| Category | Supported today | Notes |
|----------|-----------------|-------|
| **Tablet / POS screen** | ✅ Any modern browser | iPad, Android tablet, Surface, existing kitchen display — web-first POS |
| **Receipt printer** | ✅ Browser print | Epson, Star, and other printers via OS print dialog — no proprietary driver required |
| **Barcode scanner** | ✅ Keyboard wedge | Any scanner that types into the search field |
| **Card reader** | ✅ Stripe Terminal (beta) | Stripe M2, WisePad 3, and other Stripe-certified readers — optional, not required |
| **Kitchen / chit printer** | ⚠️ Browser print (planned native) | Same browser-print path today; Epson/Star native adapters on roadmap |
| **Cash drawer** | ❌ Placeholder | Requires printer pulse — not wired in this release |
| **Customer display** | ❌ Placeholder | Secondary window not implemented yet |

**Card readers NOT integrated today:** Square Reader, SumUp, and other non-Stripe readers. Operators can use manual card entry or connect Stripe Terminal — do not claim Square/SumUp compatibility.

**Evidence:** Hardware matrix is rendered from `POS_HARDWARE_CATEGORIES` in `lib/pos/pos-hardware.ts` and exposed at `/dashboard/pos/settings/hardware`.

---

## Competitor comparison

| Feature | Toast | Square | OS Kitchen |
|---------|-------|--------|------------|
| Hardware lock-in | ✅ 2yr contract typical | ✅ Square-only readers | ❌ **None** |
| Terminal cost | ~$799 (proprietary) | ~$299 (Square Terminal) | **$0 required** — optional Stripe M2 ~$59 |
| Use existing iPad | ❌ Toast Go / Flex required for full POS | ❌ Square Register preferred | ✅ **Any browser tablet** |
| Use existing printer | ❌ Toast-certified only | ❌ Square-compatible only | ✅ **Browser print — Epson, Star, etc.** |
| Month-to-month software | ❌ Often bundled with hardware lease | ⚠️ Free tier; hardware upsell | ✅ **Cancel anytime** |
| Offline without extra server | ❌ Toast Hub ~$1,200 | ⚠️ Square Terminal required | ✅ **Default offline queue** (see Item 5) |

*Competitor pricing reflects typical 2026 market positioning — verify current Toast/Square quotes before customer conversations.*

---

## Why operators switch

| Toast pain | OS Kitchen answer |
|------------|-------------------|
| "Forced to buy their $799 terminal" | Software runs on hardware you already own |
| "Locked in for 2 years" | Month-to-month — no hardware lease bundle |
| "Can't use my iPad" | Browser POS on any tablet |
| "Printer only works with Toast" | Standard browser print to Epson/Star |

---

## Sales pitch (30 seconds)

> "Toast makes you buy their terminal and locks you into a two-year contract. Square wants their reader on every counter. OS Kitchen is browser-first — run POS on the iPad you already have, print receipts on the Epson you already own, and add a Stripe reader only if you want card-present. No mandatory hardware. No lock-in."

---

## Safe sales wording

**Allowed:**

- "Browser-first POS — works on iPad, Android, and Surface"
- "No proprietary terminal required"
- "Bring your own tablet and printer"
- "Optional Stripe Terminal for card-present — beta, not mandatory"
- "Month-to-month — cancel anytime"
- "Receipt printing via standard browser print dialog"

**Not allowed (until certified / integrated):**

- "Works with Square Reader" or "SumUp compatible"
- "Production-certified hardware POS"
- "Native Epson/Star USB drivers included"
- "Toast hardware parity"
- "Guaranteed plug-and-play for every printer model"
- "Zero hardware setup"

---

## Objection handling

| Objection | Response |
|-----------|----------|
| "Do I need to buy anything?" | No. Any device with a browser runs POS. Card-present is optional via Stripe Terminal. |
| "Will my Epson printer work?" | Yes — via browser print. We don't ship proprietary drivers; your OS handles the printer. |
| "What about card readers?" | Stripe Terminal (M2, WisePad 3) is supported in beta. Square/SumUp readers are not integrated — use Stripe or manual entry. |
| "Toast includes free hardware" | Often bundled into a multi-year lease. We separate software from hardware so you're not locked in. |

---

## What to say vs. what NOT to say

| ✅ Say | ❌ Don't say |
|--------|-------------|
| "No hardware lock-in — BYOD" | "Free terminal included" |
| "Optional ~$59 Stripe M2 if you want card-present" | "Cheaper than Toast guaranteed" (verify their quote) |
| "Browser print works with Epson and Star" | "Every printer works out of the box" |
| "Stripe Terminal beta — optional" | "All card readers supported" |

---

## Marketing assets

| Asset | Path |
|-------|------|
| Trust badge | `components/marketing/no-lock-in-badge.tsx` |
| Hardware matrix (in-app) | `/dashboard/pos/settings/hardware` |
| Unit test | `tests/unit/no-lock-in-badge.test.ts` |

---

## Proof path

```bash
npm test -- tests/unit/no-lock-in-badge.test.ts
npm run verify-claims
```

Open `/dashboard/pos/settings/hardware` in staging — confirm categories match this doc.
