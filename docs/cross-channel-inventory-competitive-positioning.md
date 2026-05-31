# Cross-Channel Inventory — Competitive Positioning & Sales Guide

**Status:** Production-ready — health dashboard, conflict email alerts, daily reconciliation digest  
**Audience:** Sales, VP Operations, multi-channel operators burned by Square silos  
**Technical:** [`cross-channel-inventory-sync.ts`](../services/inventory/cross-channel-inventory-sync.ts) · [`/dashboard/inventory/cross-channel`](../app/dashboard/inventory/cross-channel/page.tsx)

---

## One-line pitch

**One inventory. All channels. No overselling — with visible sync health, conflict alerts, and daily reconciliation.**

---

## Positioning headline

> **Square keeps inventory in one channel. We sync it across all of them. Included.**

---

## Competitor comparison

| Platform | POS | Shopify | WooCommerce | DoorDash | Unified view |
|----------|-----|---------|-------------|----------|--------------|
| Square | ✅ | ❌ | ❌ | ❌ | ❌ |
| Toast | ✅ | ❌ | ❌ | ❌ | ❌ |
| Lightspeed | ✅ | ✅ | ❌ | ❌ | ✅ ($89/mo addon) |
| **OS Kitchen** | ✅ | ✅ | ✅ | ✅ (compare BETA) | **✅ Included** |

| Capability | Square | Toast | Lightspeed | **OS Kitchen** |
|------------|--------|-------|------------|----------------|
| Conflict queue | Opaque | Opaque | Manual | **Kitchen wins / Channel wins** |
| Per-channel last synced | ❌ | ❌ | Partial | **✅ Health dashboard** |
| Conflict email alert | ❌ | ❌ | ❌ | **✅ On new drift** |
| Daily reconciliation email | ❌ | ❌ | Add-on | **✅ Included** |
| Low-stock cross-channel | Basic | Basic | Varies | **Per-SKU + channel badges** |

*DoorDash inventory push is BETA — compare works today; live push requires partner menu API approval.*

---

## What ships today (evidence)

| Capability | Evidence |
|------------|----------|
| 4-channel sync engine | `services/inventory/cross-channel-inventory-sync.ts` |
| Health dashboard + last synced | `buildCrossChannelHealthDashboard`, UI `cross-channel-health-dashboard` |
| Conflict email notification | `notifyCrossChannelInventoryConflicts` (email — SMS not available) |
| Daily reconciliation digest | `sendCrossChannelDailyReconciliationEmail`, cron `/api/cron/cross-channel-inventory-reconciliation` |
| Conflict resolution | `resolveCrossChannelConflict`, dashboard conflict queue |
| Unit tests | `tests/unit/cross-channel-inventory-sync.test.ts` |
| E2E (mock channels) | `e2e/cross-channel-inventory.spec.ts` |

---

## Sales pitch (30 seconds)

> "Your POS says 12 burgers. Shopify says 8. DoorDash still shows 15. Square can't see any of that — you oversell and firefight in spreadsheets. OS Kitchen runs one Kitchen spine and shows every channel side-by-side. When counts drift, staff get an email and resolve it in one click. Daily reconciliation lands in your inbox. Included — not an $89 Lightspeed addon."

---

## Safe sales wording

**Allowed:**

- "Cross-channel inventory dashboard with POS master spine"
- "Shopify and WooCommerce bidirectional sync with conflict queue"
- "Per-channel sync health and last-synced timestamps"
- "Email alerts on new inventory conflicts"
- "Daily reconciliation digest"
- "DoorDash compare BETA — push when partner API approved"

**Not allowed:**

- "Real-time sync guaranteed for all channels"
- "DoorDash inventory push certified"
- "SMS conflict alerts" (NOT_AVAILABLE)
- "Toast / Square inventory parity"
- "Zero-conflict multi-channel inventory"

---

## Objection handling

| Objection | Response |
|-----------|----------|
| "We only sell on Square Online" | Square inventory stays in Square. If you add Shopify, Woo, or marketplaces, OS Kitchen keeps one spine — Square-only operators may not need this yet. |
| "Lightspeed has multi-channel" | They do — often as a paid retail addon. Ours is included with the kitchen OS (KDS, production, B2B). |
| "How fast is sync?" | Pull/push on demand plus auto-push when enabled. Health dashboard shows last synced per channel; stale syncs flag as degraded. |
| "What about SMS?" | Email only today — TCPA and cost constraints. Say email alerts, not SMS. |

---

## Proof path

```bash
npm test -- tests/unit/cross-channel-inventory-sync.test.ts
npx playwright test e2e/cross-channel-inventory.spec.ts --project=chromium
```

Open `/dashboard/inventory/cross-channel` — verify **Channel sync health** table with last synced timestamps.

---

## Related docs

- [`cross-channel-inventory-sales-one-pager.md`](cross-channel-inventory-sales-one-pager.md) — pilot honesty pack
- [`no-hardware-lock-in-positioning.md`](no-hardware-lock-in-positioning.md) — BYOD positioning
