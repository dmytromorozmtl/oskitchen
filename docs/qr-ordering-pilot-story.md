# QR ordering — pilot story (sales & GTM)

**Policy:** `qr-ordering-pilot-story-mkt14-v1`  
**Updated:** 2026-06-03  
**Audience:** Sales, CS, founder demos, design-partner outreach  
**Product status:** Phase 1 shipped (QR → daily menu) · table→KDS metadata **partial** · **BETA**  
**Honesty:** [`qr-code-ordering-plan.md`](./qr-code-ordering-plan.md) · [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) · [`sales-limitation-sheet.md`](./sales-limitation-sheet.md)

No paying operator has run a certified QR pilot as of June 2026. This document is the **approved narrative** for recruiting the first design partners — not proof of customer outcomes.

---

## One-line pitch

**Print a QR. Guest orders from their phone. Ticket hits the same kitchen queue as counter sales — with honest BETA labels until table metadata and staging E2E PASS.**

---

## Who this pilot is for

| Segment | Fit | Disqualify |
|---------|-----|------------|
| **Fast casual / counter + patio** | QR add-on to counter POS; pickup window | Needs pay-at-table day one |
| **Café with table numbers** | Simple table param on daily menu | Fine-dining floor plan + server assignment |
| **Ghost kitchen pickup counter** | QR for lobby ordering without kiosk hardware | Full-service table management |
| **Meal prep with dine-in corner** | Web menu already live; QR for 5–10 tables | Aggregator-only (ChowNow/Olo) with no first-party storefront |

**Pilot size:** 5–20 tables · 50–300 guest scans/week target · owner or FOH lead for weekly feedback.

---

## Story arc (2 minutes)

### 1 — The pain (20s)

Guests wait for a server to take the order while your counter line backs up. Or you paid for a third-party QR aggregator that does not talk to your kitchen display. Orders live in three places: POS, paper, and a tablet app.

### 2 — The wedge (25s)

OS Kitchen is **first-party**: you publish your storefront, generate QR codes in dashboard, and guest orders flow the **same order spine** as web preorders and counter POS. No proprietary scanner hardware. Mobile-first guest UI at 375px — designed for thumb reach, not desktop shrink.

### 3 — What works today (40s)

1. **Generate QR** — `/dashboard/storefront` → table label optional → PNG download.  
2. **Guest scans** — `/s/{slug}/daily-menu?table=N` on their phone.  
3. **Checkout** — standard storefront path when Stripe Connect is configured.  
4. **Kitchen** — order promotes to Order Hub and KDS when routing rules match — **same spine as other channels**.

**Say explicitly:** Table number shows on the guest menu page today; **explicit table label on every KDS ticket** is Phase 2 — we do not oversell it in pilot week one.

### 4 — Pilot offer (25s)

Three-month design partner LOI: dedicated staging workspace, weekly 30-minute feedback, QR runbook, and influence on Phase 2 table-metadata priority. Pilot pricing per [`/pricing`](../app/pricing/page.tsx) — 50% subscription discount during qualified window.

### 5 — Honest close (10s)

We are recruiting **founding operators** to prove scan→order→kitchen in real service — not claiming Toast QR parity or live floor plan. Book a fit call; we screen-share Integration Health and a live QR walkthrough on staging.

---

## Approved demo script (30 seconds)

> "Print a QR per table. Guest scans, sees Table 5, orders from the daily menu. The ticket hits your kitchen display like other web orders — we're wiring explicit table labels on tickets in the next release. Floor plan and pay-at-table are preview or roadmap — we're honest about that upfront."

---

## Pilot week 1 checklist (operator)

| Day | Milestone | Owner |
|-----|-----------|-------|
| 0 | Storefront published · daily menu live | Operator |
| 1 | Generate 5 QR codes · print test set | Operator + CS |
| 2 | Place 3 test orders (staff phone) · confirm Order Hub | CS |
| 3 | First guest-facing QR during soft launch | Operator |
| 4 | KDS bump verified · note table label gap if any | Operator |
| 5 | Capture: scans, orders, support tickets | CS |
| 7 | Retrospective → Phase 2 table metadata feedback | GTM |

**Evidence path:** `e2e/qr-guest-order-kitchen.spec.ts` · `e2e/qr-scan-guest-kitchen.spec.ts` (staging credentials required).

---

## Outbound snippets

### Email subject

**QR at the table — without a second kitchen system?**

### Email body (Touch 1)

> Hi {{first_name}},
>
> Many {{segment}} teams want guests to order from their phone but don't want a separate QR app that never hits the expo line.
>
> OS Kitchen generates table QR codes from your published storefront — guest orders use the same spine as counter POS and web preorders. We're in **pilot** (BETA): table labels on KDS tickets are improving in Phase 2; floor plan is not production-certified.
>
> Worth a 15-minute fit check? Reply **QR** or see how it works: {{base_url}}/solutions/restaurants
>
> — {{sender}}

### LinkedIn DM

> Quick question for {{first_name}}: when a guest scans your table QR today, does the ticket land on your kitchen screen automatically — or through a manual step?
>
> We built first-party QR → daily menu → same Order Hub as POS. Honest BETA scope — happy to share a 5-min staging walkthrough.

---

## Forbidden claims

| Never say | Say instead |
|-----------|-------------|
| Full-service QR table service | QR → daily menu · BETA |
| Realtime floor plan sync | Floor plan is **preview** |
| Toast / TouchBistro QR parity | First-party storefront wedge |
| Kiosk ordering live | QR now · kiosk Q4 2026 target |
| Orders always auto-route to KDS | When routing configured — verify in pilot |
| Thousands of QR orders processed | Founding design partners welcome |
| Pay-at-table included | Roadmap — not pilot SOW |

Enforced via `npm run verify-claims` and [`forbidden-claims-training.md`](./forbidden-claims-training.md).

---

## Pilot success metrics (targets — not verified)

| Metric | Pilot target | Verified when |
|--------|--------------|---------------|
| Guest scans / week | Baseline captured | Phase 2 analytics |
| Scan → order conversion | > 15% | Operator export |
| Orders with table on KDS | 100% after Phase 2 | Staging E2E PASS |
| QR support tickets | < 2 / week | CS log |
| Owner NPS (pilot) | ≥ 7/10 | Week 4 retro |

---

## Related assets

| Asset | Use |
|-------|-----|
| [`qr-code-ordering-plan.md`](./qr-code-ordering-plan.md) | Engineering phases |
| [`lib/marketing/qr-ordering-pilot-story-policy.ts`](../lib/marketing/qr-ordering-pilot-story-policy.ts) | Code policy + lint |
| [`components/qr/qr-ordering-client.tsx`](../components/qr/qr-ordering-client.tsx) | Guest mobile UI |
| [`demo-video-script-5min.md`](./demo-video-script-5min.md) | Act 6 channels mention |
| [`loi-outreach-email.md`](./loi-outreach-email.md) | Design partner LOI |

---

## Review log

| Date | Version |
|------|---------|
| 2026-06-03 | 1.0 — MKT-14 initial pilot story |
