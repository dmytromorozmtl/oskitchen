# Purchasing — ready report

## What changed

- **Command center** at `/dashboard/purchasing` with KPIs, next-action cards, recent POs, preserved demand supplier rollups + shortages.
- **Navigation** (`layout` + `PurchasingSubnav`) to reorder queue, POs, suppliers, receiving, price history, exports, and Ingredient demand.
- **Prisma:** suppliers, supplier items, POs, PO lines, reorder queue, receiving events, price history, approval events — additive migration.
- **Service:** `purchasing-service.ts` (`loadPurchasingDashboard`, reorder seeding helpers).
- **Actions:** reorder seed from live demand, supplier create, draft PO create + redirect + approval audit row.

## Not done yet (honest)

- PO line editor, approve/send/cancel transitions, email/PDF export.
- Receiving form + stock updates + price history writes.
- Supplier detail page, supplier item CRUD UI.
- Role-based purchasing permissions (superadmin bypass unchanged at platform layer).

## Next recommendations

1. Wire “Add queue lines to draft PO” grouped by `supplierId` / supplier label.
2. Record `SupplierPriceHistory` when `SupplierItem.unitCost` updates.
3. Receiving: transactional update `Ingredient.currentStock` + `ReceivingEvent` in one mutation with idempotency key.
4. Optional `demandRunId` on reorder seed for traceability vs live snapshot.
