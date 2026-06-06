# Multi-Brand Command Center smoke setup (Era 111)

Era 111 certifies Multi-Brand Command Center wiring: Brand lanes A–D, revenue per brand, portfolio alerts, and enterprise dashboard.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/enterprise/multi-brand-service.ts` | Dashboard loader — brand analytics overview |
| `lib/enterprise/multi-brand-builders.ts` | Lane ranking, revenue share, portfolio alerts |
| `lib/enterprise/multi-brand-policy.ts` | Policy id, route, brand lanes A–D |
| `app/dashboard/enterprise/multi-brand/page.tsx` | Multi-Brand Command Center page |
| `components/enterprise/multi-brand-enterprise-panel.tsx` | Portfolio summary, revenue share, brand cards |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:multi-brand-command-center-era111` | Full era111 cert + wiring audit |
| `npm run test:ci:multi-brand-command-center-era111` | Era111 + multi-brand enterprise unit tests |
| `npm run test:ci:multi-brand-command-center-era111:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Enterprise → Multi-Brand Command Center**.
2. Verify **Portfolio revenue**, **This month**, **Active lanes**, **Top lane** summary cards.
3. Review **Revenue share by lane** bars for Brand A–D.
4. Check individual brand cards — revenue, orders, MTD share, alerts.
5. Run `npm run smoke:multi-brand-command-center-era111` — artifact **PASSED**.

## Capabilities

| Capability | Description |
|------------|-------------|
| `brand_lanes_abcd` | Top 4 brands ranked as lanes A, B, C, D |
| `revenue_per_brand` | Lifetime and MTD revenue share per brand |
| `portfolio_alerts` | Concentration risk and inactive brand alerts |

## Artifact

Summary written to `artifacts/multi-brand-command-center-smoke-summary.json` (gitignored).
