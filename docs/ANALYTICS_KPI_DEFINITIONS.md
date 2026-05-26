# KPI definitions

Every KPI surfaced by the analytics module is defined in
`lib/analytics/kpi-definitions.ts`. The UI reads from this catalogue
so labels, descriptions, and formulas are consistent.

| ID | Label | Format | Formula |
|----|-------|--------|---------|
| `gross_revenue` | Gross revenue | currency | SUM(orders.total WHERE status != CANCELLED) |
| `net_revenue` | Net revenue | currency | gross_revenue − SUM(orders.total WHERE status = CANCELLED) |
| `order_count` | Orders | count | COUNT(orders WHERE createdAt BETWEEN from AND to) |
| `average_order_value` | AOV | currency | gross_revenue / non-cancelled order count |
| `repeat_rate` | Repeat rate | percent | customers with ≥2 orders / distinct customers |
| `new_customers` | New customers | count | COUNT(kitchen_customers WHERE firstOrderAt BETWEEN from AND to) |
| `active_customers` | Active customers | count | COUNT(distinct lower(customerEmail)) |
| `cancelled_orders` | Cancelled orders | count | COUNT(orders WHERE status = CANCELLED) |
| `late_orders` | Late orders | count | orders with pickupDate < today AND status NOT IN (READY, COMPLETED) |
| `production_completion_rate` | Production completion | percent | SUM(completedItems) / SUM(totalItems) |
| `packing_completion_rate` | Packing completion | percent | SUM(packedItems) / SUM(totalItems) |
| `delivery_completion_rate` | Delivery completion | percent | COUNT(stops WHERE status = DELIVERED) / COUNT(stops) |
| `catering_revenue` | Catering revenue | currency | SUM(catering_quotes.total WHERE status IN (ACCEPTED, CONVERTED_TO_ORDER)) |
| `meal_plan_revenue` | Meal plan revenue | currency | SUM(orders.total WHERE order.mealPlanCycle IS NOT NULL) |
| `top_channel` | Top channel | text | ARGMAX(gross_revenue) GROUP BY channel |
| `top_brand` | Top brand | text | ARGMAX(gross_revenue) GROUP BY brandId |
| `top_location` | Top location | text | ARGMAX(gross_revenue) GROUP BY locationId |

## Source ownership

- Order-related KPIs come from `orders` and `order_items` joined with `storefront_orders` / `external_orders` for channel attribution.
- Production / packing / delivery come from their respective batch tables and `delivery_stops`.
- Catering KPIs use `catering_quotes`.
- Meal-plan revenue uses orders with a non-null `mealPlanCycle` join.
- Customer KPIs use both `orders` (for window-level activity) and `kitchen_customers` (for VIP roll-up and first-order anchoring).
