# Data import center

Route: `/dashboard/import-center`

KitchenOS imports CSV first. XLSX should be converted to CSV before upload unless a future parser is added.

Flow:
1. Download a template from `/dashboard/import-center/templates`.
2. Upload CSV and choose an import type.
3. Review detected columns, valid row count, and row-level errors.
4. Fix errors before committing.
5. Commit only low-risk valid rows. Orders remain staged until mappings and dates are resolved.

Supported types: products, customers, orders, ingredients, recipes, staff, suppliers.

Safety rules:
- Imports are scoped to the current user.
- No silent import when row errors exist.
- Orders are staged, not inserted into live production by default.
- Error messages include row, field, issue, and suggested fix.
