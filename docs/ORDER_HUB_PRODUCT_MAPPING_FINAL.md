# Order Hub + Product Mapping — Final (MVP)

## Order Hub

- **Route:** `/dashboard/order-hub`  
- **Services:** `services/order-hub/order-hub-service.ts`, `order-triage-service.ts`  
- **Statuses:** `lib/order-hub/order-hub-status.ts`

**Goal:** Intake + triage across POS, manual, storefront, imports — with tabs aligned to lifecycle / blocker themes.

## Product mapping

- **Routes:** `/dashboard/product-mapping`, `/dashboard/product-mapping/unmapped`, aliases, approved, conflicts.  
- **Services:** `services/product-mapping/product-mapping-service.ts`, `matching-service.ts`  
- **Rules / confidence:** `lib/product-mapping/*`

**Safety rules:** never auto-apply low-confidence mappings; never silently overwrite approved mappings; resolving OPEN channel conflicts should recompute order blockers.

## P1 follow-ups

- Bulk approve exact SKU with preview + audit.  
- Provider health cards tied to **real** connection tests only.
