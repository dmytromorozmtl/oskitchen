# Reports

`/dashboard/analytics/reports` exposes nine print-friendly reports.

| Report | Backing CSV |
|--------|-------------|
| Executive summary | revenue CSV |
| Daily operations report | orders CSV |
| Weekly business report | revenue CSV |
| Catering performance | revenue CSV |
| Meal plan performance | revenue CSV |
| Customer retention | revenue CSV |
| Production efficiency | orders CSV |
| Inventory usage | orders CSV |
| Route performance | orders CSV |

The CSV builders live in `services/analytics/reporting-service.ts`.

## Safety properties

- Every cell is escaped to neutralise formula-injection (`=`, `+`, `-`, `@`).
- Customer emails are masked (`re***@domain`) inside the orders CSV.
- Up to 5,000 rows per export to bound response size.

## Future work

- PDF export is a placeholder — we surface CSV today and plan a server
  rendered HTML→PDF path next.
