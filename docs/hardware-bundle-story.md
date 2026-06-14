# Hardware bundle story — Toast parity (software-first alternative)

**Policy:** `hardware-bundle-story-p3-141-v1`  
**Department:** Hardware  
**Blueprint task:** P3-141 — hardware bundle + payment terminal vs Toast  
**Updated:** 2026-06-09  
**Registry:** [`artifacts/hardware-bundle-story-registry.json`](../artifacts/hardware-bundle-story-registry.json)

---

## Honest baseline (June 2026)

OS Kitchen has **0 signed LOIs** and **no certified terminal program**. We are **not affiliated** with Toast. This document is a **baseline** sales story — gap documentation, not market proof. POS is **browser-first** on devices operators already own. Payment terminal is **optional** via Stripe Terminal (**BETA**) — never required to start a pilot. **verify** hardware smoke artifacts before LIVE payment claims.

Cross-refs: [`certified-hardware-guide.md`](./certified-hardware-guide.md) (`certified-hardware-guide-p2-86-v1`) · [`software-first-pos-positioning.md`](./software-first-pos-positioning.md) · [`toast.md`](./competitor-battle-cards/toast.md) · [`hardware-compatibility.md`](./hardware-compatibility.md) · [`pos-hardware-certification.ts`](../lib/pos/pos-hardware-certification.ts) · [`certified-hardware-guide-policy.ts`](../lib/hardware/certified-hardware-guide-policy.ts)

---

## Positioning line

> **Hardware shouldn't lock you in.**

Toast wins when operators want a field rep, proprietary terminals, and bundled payments. OS Kitchen wins when operators want a unified cloud kitchen OS on **BYOD tablets** with honest **BETA** labels on what's actually connected.

---

## Toast bundle vs OS Kitchen (7 components)

| Component ID | Toast typical | OS Kitchen path | Parity |
|--------------|---------------|-----------------|--------|
| `ipad_tablet` | Toast Go / proprietary handheld | Browser POS on BYOD iPad — `/dashboard/pos/tablet` | story_documented |
| `receipt_printer` | Certified Epson/Star via Toast install | OS print dialog — browser_compatible | story_documented |
| `kitchen_screen` | Toast Flex / certified KDS | Web KDS on any browser — `/dashboard/kitchen` | story_documented |
| `cash_drawer` | Bundled with terminal install | Printer kick — browser_compatible | story_documented |
| `payment_terminal` | Toast Tap + Toast Hub offline EMV | Optional **Stripe Terminal** M2/WisePOS — **BETA**, not required | story_documented |
| `barcode_scanner` | Toast-certified wedge | USB keyboard wedge — browser_compatible | story_documented |
| `label_printer` | Kitchen label via Toast partner | Browser print today — native label adapter **deferred** | story_documented |

Full certification tiers: [`certified-hardware-guide.md`](./certified-hardware-guide.md)

---

## Payment terminal path (no lock-in)

| Path | When to use | Honest caveat |
|------|-------------|---------------|
| **Cash / pay-later** | Counter-only pilot, no card day-one | No terminal purchase required |
| **Stripe Connect** | Merchant has Stripe account | Processing fees to Stripe |
| **Stripe Terminal M2** | Chip/tap at counter (~$59 reader) | **BETA** — verify Integration Health PASS |
| **Stripe WisePOS E** | Fixed counter terminal | **BETA** — not Toast Hub offline EMV |
| **External terminal** | Existing processor | Mark paid in POS — external tier |

**Forbidden:** "Toast-class offline EMV" · "Certified terminal program" · "We beat Toast on hardware"

---

## 5-year TCO framing (illustrative)

| Line item | Toast typical | OS Kitchen software-first |
|-----------|---------------|---------------------------|
| Proprietary terminal | $299–799+ per station | **$0 required** |
| Offline hub | Toast Hub ~$1,200 | **Not sold** — browser cash queue only |
| Software | Often bundled opaque | Published plans — see [`pricing-sku-pm.md`](./pricing-sku-pm.md) |
| Optional reader | In bundle narrative | Stripe Terminal M2 ~$59 **optional** |
| Contract | Often multi-year + hardware | Month-to-month software |

Use TCO calculator on `/pricing` — **illustrative**, not guaranteed savings.

---

## Sales talk track

> Toast owns in-restaurant hardware and thousands of reference customers. We target ghost kitchen, meal prep, and commissary operators who want order hub → KDS → production depth on tablets they already own — with Integration Health showing exactly what's BETA vs LIVE. We don't sell a proprietary terminal lease; Stripe Terminal is optional when you're ready for chip/tap.

Battle card: [`toast.md`](./competitor-battle-cards/toast.md) · Compare: `/compare/toast`

---

## Gap honesty (what we don't claim)

| Toast capability | OS Kitchen status |
|------------------|-------------------|
| Field install + certified hardware fleet | **No** — self-serve browser setup |
| Toast Hub offline EMV | **No** — cash queue + sync when online |
| Proprietary handheld (Toast Go) | **No** — browser on BYOD tablet |
| Thousands of reference customers | **0 signed LOIs** (June 2026) |
| Rush-hour hardware SLA | **BETA** — not production-certified |

---

## Audit commands

```bash
npm run audit:hardware-bundle-story-p3-141
npm run test:ci:hardware-bundle-story-p3-141
npm run audit:certified-hardware-guide
```

Wired in [`.github/workflows/deploy-prod-gate.yml`](../.github/workflows/deploy-prod-gate.yml).
