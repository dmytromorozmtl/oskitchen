# Costing ↔ purchasing integration

During a costing run, ingredient unit cost prefers the **latest** `SupplierPriceHistory.newUnitCost` for that ingredient; if none exists, `Ingredient.costPerUnit` is used.

**Recommended workflow**

1. Record receiving / price history in Purchasing.  
2. Keep ingredient cards roughly aligned.  
3. Recalculate costing after major price moves.

**Future:** diff price history since last run → auto-suggest recalculation + margin alerts.
