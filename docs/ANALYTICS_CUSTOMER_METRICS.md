# Customer metrics

## Unique customers

Count of distinct lower-cased `customerEmail` values on revenue-eligible
orders in the window.

## Repeat rate

`customers with ≥2 orders / distinct customers`. Returns `null` when
there are zero distinct customers.

## New customers

Count of `kitchen_customers` rows whose `firstOrderAt` falls inside the
window. We rely on the CRM-managed `firstOrderAt` field (set during
order creation and via the lazy backfill).

## VIP LTV

`SUM(kitchen_customers.lifetimeValueCents) WHERE type = VIP_CLIENT`,
in dollars. Surfaced in the Customers tab as a single roll-up KPI so
operators can see how much VIPs contribute over their entire history.

## Top spenders

Top 10 distinct emails ordered by revenue in the window. **Emails are
masked** (`re***@domain`) in the UI.

## Notes

- Customer metrics never include CANCELLED orders.
- PII (full email, phone) is never surfaced from the analytics module.
  Use the CRM module if you need to drill into a customer.
