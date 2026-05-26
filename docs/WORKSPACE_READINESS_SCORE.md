# Workspace Readiness Score

## Service

`services/readiness/workspace-readiness-service.ts` → `computeWorkspaceReadiness`

## Categories (v1)

| Category | Inputs |
|----------|--------|
| profile | business name/type/timezone/currency |
| menus | menu count |
| products | SKU/menu item count |
| channels | manual channel flags OR connected integration |
| staff | staff rows (optional penalty if empty) |
| operations | active orders signal |

## Surfaces

- Today command center (progress + per-category links)
- Reusable on Settings / Go-live (import service in page when needed)

## Next

- Billing + security categories (gated on env Stripe / MFA flags)
