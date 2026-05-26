# Costing engine

## Full recalculation (`runFullRecipeCosting`)

1. Load kitchen settings → `mergeCostingSettings`.  
2. Load active `MarginRule`, `ChannelFeeRule` (for default channel key), `LaborRate`, active `Recipe` + product + menu.  
3. Build latest `SupplierPriceHistory` map per ingredient (first row by `effectiveAt` desc).  
4. Sum `ProductPackagingRule` costs per product.  
5. For each recipe:  
   - **Prime cost** = ingredients (history or card) + labor ($/min × minutes / yield) + packaging (recipe + rules).  
   - **Overhead** = optional % of prime.  
   - **Delivery** = kitchen `deliveryFee` if item `deliveryAvailable`.  
   - **Platform fee** = `estimatePlatformFee` from user rule.  
   - **Payment fee** = modeled % of sale.  
   - **Total** = prime + overhead + delivery + platform + payment.  
   - **Margins** = gross margin %, food cost %; warnings via `margin-rules`.  
   - **Suggested price** = `suggestPriceFromTargetMargin` (target from rules/settings).  
6. Persist `ProfitabilityLine`, `CostComponent` rows, `CostSnapshot`, complete `CostingRun`.

## Failure behavior

Run marked `FAILED` on exception; prior snapshots remain.
