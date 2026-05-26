# Purchasing price history

- **Route:** `/dashboard/purchasing/price-history`
- **Model:** `SupplierPriceHistory` (`supplierItemId` optional, `ingredientId`, old/new cost, `effectiveAt`, `source`).

Writes should occur when supplier item costs change or when receiving confirms a new landed cost — hooks not yet attached.
