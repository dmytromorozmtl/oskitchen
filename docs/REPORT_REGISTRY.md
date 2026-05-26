# Report registry

`lib/reports/report-registry.ts` exports `REPORT_REGISTRY: Record<ReportKey, ReportDefinition>`.

Adding a new report:

1. Append the key to `ReportKey` in `lib/reports/report-types.ts`.
2. Add the matching `ReportDefinition` entry — title, description, category,
   business modes (empty array = available everywhere), required permission,
   columns, supported filters, legacy export href (if relevant).
3. Add a runner in `services/reports/report-service.ts:runners` that returns
   `{ summary, columns, rows, totalRows, truncated, warnings }`.

## Reports shipped

| Key | Title | Category | Permission | Financial |
|-----|-------|----------|------------|-----------|
| `executive_weekly_summary` | Executive weekly summary | Executive | `reports.read.financial` | yes |
| `executive_monthly_summary` | Executive monthly summary | Executive | `reports.read.financial` | yes |
| `revenue_report` | Revenue report | Sales | `reports.read.financial` | yes |
| `orders_report` | Orders report | Sales | `reports.read.operations` | no |
| `sales_by_channel` | Sales by channel | Sales | `reports.read.financial` | yes |
| `sales_by_product` | Sales by product | Sales | `reports.read.financial` | yes |
| `weekly_production` | Weekly production | Production | `reports.read.operations` | no |
| `ingredient_demand` | Ingredient demand | Inventory | `reports.read.operations` | no |
| `inventory_shortage_report` | Inventory shortage report | Inventory | `reports.read.operations` | no |
| `purchasing_report` | Purchasing report | Purchasing | `reports.read.financial` | yes |
| `packing_accuracy` | Packing accuracy | Packing | `reports.read.operations` | no |
| `delivery_report` | Delivery report | Delivery | `reports.read.operations` | no |
| `margin_report` | Margin report | Costing | `reports.read.financial` | yes |
| `customer_report` | Customer report | Customers | `reports.read.customer_pii` | no |
| `customer_retention` | Customer retention | Customers | `reports.read.financial` | yes |
| `catering_pipeline` | Catering pipeline | Catering | `reports.read.financial` | yes |
| `meal_plan_subscriptions` | Meal plan subscriptions | Meal Plans | `reports.read.financial` | yes |
| `staff_task_completion` | Staff task completion | Staff | `reports.read.operations` | no |
| `audit_log_report` | Audit log report | Compliance / Audit | `reports.read.audit` | no |

## Categories

`Executive · Sales · Operations · Production · Packing · Delivery · Customers · Catering · Meal Plans · Inventory · Purchasing · Costing · Compliance / Audit · Staff`

## Formats

`csv · browser_print · pdf_placeholder · json`

PDF is intentionally a placeholder — the user prints from the browser.
Server-side PDF is not promised.
