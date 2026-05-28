# Engineering Domain Map (Draft — Pre-Pilot)

**Purpose:** Document service boundaries before Era 21 consolidation. **Do not refactor schema until P0 PASS.**

| Domain | Primary paths | Key services | Mutation registry |
|--------|---------------|--------------|-------------------|
| Orders | `services/orders/`, `actions/orders.ts` | order-hub, order-creation | `order_create` |
| POS | `services/pos/`, `actions/pos.ts` | checkout, shifts, refunds | `pos_mutations` |
| Storefront | `app/s/`, `services/storefront/` | checkout, publish | `storefront_manage` |
| Kitchen/KDS | `services/kitchen-screen/` | KDS bump/recall | `kitchen_daily` |
| Production | `services/production/` | board, calendar | `production_calendar` |
| Packing | `services/packing/` | verify, QC | `packing_mutations` |
| Integrations | `services/integrations/`, webhooks | channel sync | `integrations_manage`, `channels_manage` |
| CRM | `services/crm/` | customers, segments | `crm_customers`, `crm_rewards` |
| Commercial | `services/commercial/` | GO/NO-GO, pilot | inline + artifacts |
| Platform | `app/platform/` | support, impersonation | platform guards |

**Scale note:** 614 service modules, 365 Prisma models — consolidation scheduled post-first-pilot.
