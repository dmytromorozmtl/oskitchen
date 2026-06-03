# Franchise Management Suite (Enterprise)

Franchisor command center: brand control, royalty tracking, and menu enforcement across linked franchisee workspaces.

## Route

`/dashboard/enterprise/franchise`

## Capabilities

| Area | Description |
|------|-------------|
| **Royalty tracking** | Reuses `calculateRoyalties` — order totals × rate (month/quarter) |
| **Brand control** | Brand kit from workspace `Brand` + tagline + strict/guided enforcement |
| **Menu enforcement** | Required menu item list; compliance % per franchisee active products |
| **Unit table** | Revenue, royalty, menu %, brand audit status |

## Services

```
services/enterprise/franchise-service.ts  — loadFranchiseSuiteDashboard, settings
services/franchise/franchise-service.ts   — royalty calculation (existing)
lib/enterprise/franchise-builders.ts      — compliance scoring
```

Settings: `settingsCenterJson.franchiseSuite`

## Related

- `/dashboard/franchise/royalties` — CSV export
- [`franchise-management-plan.md`](./franchise-management-plan.md) — maturity & sales limits
