# CRM reports

Path: `/dashboard/customers/reports`

## KPIs

- Total customers
- New customers in last 30d
- Repeat customers (`total_orders ≥ 2`)
- VIPs (`status = VIP`)
- At-risk (`status = AT_RISK`)
- Customers with allergies (`allergies_json` not null)
- Catering / event clients
- Avg order value (averaged across customers)
- Lifetime revenue (sum of `lifetime_value_cents`)
- Repeat revenue in last 30 days (sum of order totals for repeat customers)

## Breakdowns

- **By source (last 90d)** — `MANUAL / STOREFRONT / IMPORT / WOO / SHOPIFY / UBER_EATS / CATERING_QUOTE / EVENT_INQUIRY / PHONE_ORDER / EMAIL_ORDER / BAR_EVENT_INQUIRY / BAKERY_PREORDER / MEAL_PLAN / CHANNEL_OTHER`
- **By type** — INDIVIDUAL / COMPANY / CATERING_CLIENT / etc.

## Derived rates

- Repeat rate = `repeatCustomers / totalCustomers`
- At-risk share = `atRisk / totalCustomers`

## Future

- Cohort analysis by first-order month
- LTV histogram
- Channel mix bar chart
- Catering quote conversion (when quote-create wires the CRM hook)
- Allergy-sensitive order count
