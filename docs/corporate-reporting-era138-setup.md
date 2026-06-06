# Corporate Reporting smoke setup (Era 138)

Era 138 certifies Corporate Reporting wiring: CEO P&L, revenue trends, and 90-day forecasts.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/enterprise/corporate-reporting-service.ts` | Dashboard loader — executive, forecast, labor |
| `lib/enterprise/corporate-reporting-builders.ts` | P&L, trends, forecast strip, period comparison |
| `lib/enterprise/corporate-reporting-policy.ts` | Policy id, route, default cost assumptions |
| `app/dashboard/enterprise/reports/page.tsx` | Corporate reports page |
| `components/enterprise/corporate-reporting-panel.tsx` | KPIs, P&L, trend chart, forecast outlook |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:corporate-reporting-era138` | Full era138 cert + wiring audit |
| `npm run test:ci:corporate-reporting-era138` | Era138 + ENT-65 unit tests |
| `npm run test:ci:corporate-reporting-era138:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Enterprise → Corporate Reporting**.
2. Review KPI cards — net revenue, gross profit, EBITDA proxy, 90-day forecast.
3. Inspect **P&L statement** — gross revenue through EBITDA proxy.
4. Check **Revenue trend** and **Forecast outlook** sections.
5. Run `npm run smoke:corporate-reporting-era138` — artifact **PASSED**.

## Sections

| Section | Source |
|---------|--------|
| `pl` | Executive overview + labor manager → P&L lines |
| `trends` | Daily revenue from executive overview |
| `forecast` | Forecasting 2.0 → 7-day preview + 90-day projection |

## Artifact

Summary written to `artifacts/corporate-reporting-smoke-summary.json` (gitignored).
