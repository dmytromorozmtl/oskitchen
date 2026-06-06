# Multi-Brand Command Center setup (Era 186)

Era 186 certifies Multi-Brand Command Center wiring (Round 2): Brand lanes A–D, revenue per brand, portfolio alerts — with canonical proof via era111 live smoke.

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
| `npm run smoke:multi-brand-command-center-era186` | Full era186 cert + wiring audit |
| `npm run test:ci:multi-brand-command-center-era186` | Era186 + era111 + multi-brand enterprise unit tests |
| `npm run test:ci:multi-brand-command-center-era186:cert` | Wiring cert only (CI gate) |
| `npm run smoke:multi-brand-command-center-era111` | Canonical era111 smoke |

## Human activation

1. Open **Dashboard → Enterprise → Multi-Brand Command Center**.
2. Verify **Portfolio revenue**, **This month**, **Active lanes**, **Top lane** summary cards.
3. Review **Revenue share by lane** bars for Brand A–D.
4. Check individual brand cards — revenue, orders, MTD share, alerts.
5. Run `npm run smoke:multi-brand-command-center-era186` — artifact **PASSED**.

## Capabilities

| Capability | Description |
|------------|-------------|
| `brand_lanes_abcd` | Top 4 brands ranked as lanes A, B, C, D |
| `revenue_per_brand` | Lifetime and MTD revenue share per brand |
| `portfolio_alerts` | Concentration risk and inactive brand alerts |

## Artifact

Summary written to `artifacts/multi-brand-command-center-era186-smoke-summary.json` (gitignored).

See also: [multi-brand-command-center-era111-setup.md](./multi-brand-command-center-era111-setup.md)
