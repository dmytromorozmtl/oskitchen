# Cross-Channel Inventory — Sales One-Pager

**Status:** Preview — mock-channel E2E certified; live Shopify/Woo pilot next  
**Audience:** Sales, VP Operations, multi-channel operators  
**Technical:** [`cross-channel-inventory-sync.ts`](../services/inventory/cross-channel-inventory-sync.ts) · [`cross-channel/page.tsx`](../app/dashboard/inventory/cross-channel/page.tsx)

---

## One-line pitch

**One Kitchen spine for POS, Shopify, WooCommerce, and DoorDash — visible sync status, honest conflict resolution, and low-stock alerts — not four siloed inventory systems.**

---

## Supported channels (pilot)

| Channel | Role | Sync mode |
|---------|------|-----------|
| **POS** | Master spine (Kitchen quantity) | System of record |
| **Shopify** | DTC + retail catalog | Bidirectional compare + push/pull |
| **WooCommerce** | WordPress storefront | Bidirectional compare + push/pull |
| **DoorDash** | Marketplace menu availability | Compare BETA · push when partner API approved |

**Dashboard:** `/dashboard/inventory/cross-channel`

---

## Competitor comparison

| | Toast | Square | Lightspeed | **OS Kitchen** |
|---|-------|--------|------------|----------------|
| Multi-channel inventory | POS-centric | Square catalog only | Retail + partial F&B | **POS + Shopify + Woo + DoorDash** |
| Conflict visibility | Opaque | Opaque | Manual spreadsheets | **Conflict queue with Kitchen/Channel wins** |
| Low-stock alerts | Basic | Basic | Varies | **Per-product threshold + channel badges** |
| Reservations | Limited | Limited | Varies | **Cross-channel holds with TTL** |
| OS depth | POS-first | Payments + POS | Retail-first | **Full kitchen OS** (KDS, B2B, integrations) |

**Sales line:** *"Your line cooks sell on POS while Shopify and DoorDash run the same SKU spine — when counts drift, staff see it and pick who wins."*

---

## What works today (evidence)

| Capability | Evidence |
|------------|----------|
| Sync engine (4 channels) | `services/inventory/cross-channel-inventory-sync.ts` |
| Conflict resolution | `resolveCrossChannelConflict`, `applyCrossChannelConflictPlan` |
| Reservations + low-stock | `createCrossChannelReservation`, `detectCrossChannelLowStockAlerts` |
| Inventory dashboard UI | `components/inventory/cross-channel-inventory-panel.tsx` |
| Mock channel E2E | `e2e/cross-channel-inventory.spec.ts` |
| Mock fixtures | `e2e/helpers/cross-channel-inventory-mock.ts` |
| Unit tests | `tests/unit/cross-channel-inventory-sync.test.ts` |

**Honesty:** DoorDash inventory push is **BETA** — compare works; live push requires partner menu API approval. Say **"preview — pilot-ready for Shopify/Woo with honest DoorDash compare."**

---

## Safe sales wording

**Allowed (qualified):**

- "Cross-channel inventory dashboard with POS master spine"
- "Shopify and WooCommerce bidirectional sync with conflict queue"
- "Low-stock alerts and reservations across channels — pilot path"

**Not allowed (until live pilot sign-off):**

- "Real-time sync guaranteed for all channels"
- "DoorDash inventory push certified"
- "Toast / Square inventory parity"
- "Zero-conflict multi-channel inventory"

---

## ROI for operator

- **Fewer oversells:** Conflicts surfaced before customers checkout on wrong channel
- **Less manual spreadsheet work:** One dashboard vs exporting four systems
- **Faster 86 decisions:** Low-stock alerts with channel context
- **Single OS:** Inventory lives beside KDS, POS, and B2B — no separate middleware vendor

---

## Pilot proof path

### Engineering (pre-contract)

```bash
npm test -- tests/unit/cross-channel-inventory-sync.test.ts
npx playwright test e2e/cross-channel-inventory.spec.ts --project=chromium
```

### Staging operator (pre-go-live)

1. Map products under **Product mapping**
2. Connect Shopify and/or WooCommerce integrations
3. Open `/dashboard/inventory/cross-channel` — verify channel tabs and conflict queue
4. Resolve a test conflict (Kitchen wins vs Channel wins)
5. Optional: connect DoorDash BETA — verify compare-only badge

**Honest skip:** Without mapped products or connected channels → empty state is expected (not fake PASS).

---

## Next step for pilot

1. DevOps: enable integrations on staging tenant  
2. Map top 20 SKUs across POS + Shopify/Woo  
3. Run mock E2E proof → live pull/push burn-in for 7 days  
4. Sign pilot readiness when conflict queue stays near zero during service  

---

## References

- [`stripe-terminal-sales-one-pager.md`](./stripe-terminal-sales-one-pager.md) — companion hardware moat
- [`kds-sales-one-pager.md`](./kds-sales-one-pager.md) — companion kitchen realtime moat
- Legacy Shopify/Woo panel: `/dashboard/integrations/inventory-sync`
