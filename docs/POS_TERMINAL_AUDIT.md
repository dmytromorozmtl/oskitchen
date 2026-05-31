# POS Terminal — Strategic Audit (OS Kitchen)

This audit summarizes how OS Kitchen behaved **before** the POS Terminal module and why each area matters for a connected front-of-house layer.

## Orders and Order Hub

| Area | Current behavior | Why POS needs it | Workflow | Priority |
| --- | --- | --- | --- | --- |
| Manual / internal orders | `createOrderViaCenter` writes `Order` rows with typed `orderType` and `creationSource`. | POS must reuse the same writer so production, CRM, and analytics stay unified. | Cashier → Order list → Production | **P0** |
| Order Hub | Hub triages internal + channel rows; channel column read from trace JSON. | POS orders must appear with clear **POS** provenance. | Dispatcher triage | **P0** |
| Status model | Status detail strings mapped to DB enum. | POS defaults to `CONFIRMED` for counter speed; must not break lifecycle. | Kitchen / packing | **P0** |

## Payments

| Area | Current behavior | Why POS needs it | Workflow | Priority |
| --- | --- | --- | --- | --- |
| Payment modes | Keys include cash, external placeholders, Stripe placeholder. | POS must never fabricate card success. | Checkout truth | **P0** |
| Comped | `COMPED` marks paid only with explicit mode. | Needs manager-style guard (implemented via `pos_comp`). | Exceptions | **P1** |

## Catalog / CRM / Staff

| Area | Current behavior | Why POS needs it | Priority |
| --- | --- | --- | --- |
| Products | `posVisible` + optional `barcode`. | POS grid filters visibility; scanners hit barcode field. | **P0** |
| CRM | Email-based upsert + metrics when email exists. | POS walk-ins may be guest emails; metrics recompute when resolvable. | **P1** |
| Staff | `StaffMember` rows for attribution. | Shifts + transactions reference staff FKs. | **P1** |

## Production / Packing / Inventory

| Area | Current behavior | Why POS needs it | Priority |
| --- | --- | --- | --- |
| Production | Work items can be created from orders. | POS items route via `pos-kitchen-routing-service`. | **P1** |
| Inventory | Full auto-consume varies by tenant setup. | `PosInventoryImpactEvent` records pending configuration safely. | **P1** |

## Permissions / Billing / Platform

| Area | Current behavior | Why POS needs it | Priority |
| --- | --- | --- | --- |
| Plans | `canUseFeature` gating. | POS keys (`pos_terminal`, `pos_shifts`, …) map to tiers. | **P0** |
| Modules | `KitchenModulePreference` disables nav paths. | `pos_terminal` module entry blocks `/dashboard/pos` when off. | **P0** |
| Platform | Founder-only surfaces. | `/platform/pos` lists sanitized POS activity. | **P2** |

## Touch / Tablet readiness

| Area | Current behavior | Why POS needs it | Priority |
| --- | --- | --- | --- |
| Dashboard UI | Desktop-first admin patterns. | POS terminal route uses large controls + simplified chrome. | **P1** |
| Offline | Previously N/A | Indicator + guard rails for placeholder card modes. | **P2** |

---

### Summary priorities

- **P0 POS blockers**: shared order writer, POS source visibility, plan + module gates, honest payments.
- **P1 commercial MVP**: shifts, receipts, production routing hooks, CRM metrics, inventory events.
- **P2 polish**: platform POS console, richer hardware adapters, deeper offline.
- **P3 later**: Stripe Terminal native, split payments, customer display, cash-drawer pulse.
