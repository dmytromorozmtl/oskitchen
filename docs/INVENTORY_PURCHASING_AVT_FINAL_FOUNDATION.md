# Inventory, purchasing, AvT — Final foundation

## Principles

1. **No fake precision** — reports show confidence bands and “missing data” actions.
2. **Shortage blockers** — `INVENTORY_SHORTAGE` style order blockers should exist **only** when all prerequisites are true:
   - Recipe or direct stock linkage exists for the demanded SKU/ingredient.
   - Stock / availability signal exists for the relevant location/date.
   - Demand date exists in the planning horizon.
   - Required quantity **>** available quantity + configured buffer.  
   Otherwise show a **coverage warning**, not a hard operational blocker on the order.

## AvT confidence model (recommended display)

| Level | Meaning |
|-------|---------|
| HIGH | Recipes + costs + receiving/stock + sales/consumption signals |
| MEDIUM | Recipes + costs + sales; stock partial |
| LOW | Missing recipes, costs, or stock participation |

## Reports

- Theoretical usage (always computable when recipes exist).  
- Actual usage only when receiving/adjustment data is reliable.  
- Variance and margin impact with confidence label.

## Code pointers

- Purchasing readiness UI references honest states (`app/dashboard/purchasing/page.tsx`).  
- Extend order-level shortage blockers in `order-blocker-service` **only** after demand engine queries are real — do not stub.
