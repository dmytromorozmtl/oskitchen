# Catering Quote Reports

Route: `/dashboard/catering-quotes/reports`

## KPIs (top)

- **Pipeline value** — sum of totals of non-terminal quotes.
- **Accepted revenue** — sum of totals of `ACCEPTED` and
  `CONVERTED_TO_ORDER` quotes.
- **Average quote** — pipeline value / count of non-terminal quotes.
- **Conversion rate** — accepted+converted divided by total quote count
  (across all statuses).

## Breakdowns

- **Revenue by event type** — `prisma.cateringQuote.groupBy({ by:
  ["eventType"] })`.
- **Revenue by brand** — `groupBy({ by: ["brandId"] })`; brand names
  fetched in a second batch query.

## Lists

- **Lost quotes** — `REJECTED`, `DECLINED`, `EXPIRED`.
- **Expiring soon** — active quotes whose `validUntil` is within the
  next 7 days.

## What's not (yet) here

- Margin estimates per event — relies on `costEstimate` being filled
  on lines, which today is optional.
- Win/loss by brand — possible follow-up.
- Per-rep performance — depends on adding rep IDs to quotes.
