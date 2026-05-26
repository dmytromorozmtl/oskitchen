# Business-mode report packs

Every `ReportDefinition` carries `businessModes: BusinessType[]`. Empty
means available everywhere. Non-empty acts as a recommendation filter
that the library page can apply via the "Only show reports tagged for my
mode" toggle.

## Mode → recommended reports

### Restaurant
- `sales_by_product` (sales by menu)
- `weekly_production` (kitchen performance)
- `delivery_report` + `packing_accuracy` (pickup / delivery)
- `customer_retention` (repeat rate)

### Café
- `sales_by_product` (daily specials)
- `orders_report` filtered by morning hours
- `customer_retention` (regulars)

### Bar
- `catering_pipeline` (events + private bookings)
- `sales_by_product` (drinks / items)
- `revenue_report`
- No alcohol-compliance claims are made anywhere in the registry.

### Bakery
- `weekly_production` (batch production)
- `sales_by_product` (pre-orders)
- `inventory_shortage_report`
- Allergen / label reporting reuses the existing nutrition-labels module
  rather than fabricating a new compliance promise.

### Catering
- `catering_pipeline`
- `executive_weekly_summary`
- `weekly_production` filtered to catering events
- `delivery_report` filtered by event date

### Meal Prep
- `meal_plan_subscriptions`
- `weekly_production`
- `packing_accuracy`
- `delivery_report`

### Ghost Kitchen / Cloud Kitchen / Multi-brand
- `sales_by_channel`
- `revenue_report` filtered by brand
- `weekly_production` per brand

`lib/reports/report-terminology.ts:reportTerminologyForMode` adjusts page
titles and subtitles to match.
