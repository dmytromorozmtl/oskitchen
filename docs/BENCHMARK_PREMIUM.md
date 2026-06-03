# Benchmark Network 2.0 (Premium)

Paid industry reports and deep-dive benchmarks on top of the free Benchmark Network dashboard.

## Features

- **4 industry reports**: Monthly Pulse, Quarterly Deep Dive, Food Cost Special, Labor & Throughput
- **Paid subscription**: $49/month add-on (`benchmark_premium_monthly`), or included with **PRO** / **TEAM** plans
- **14-day trial**: workspace setting `settingsCenterJson.benchmarkPremium` (instant activation)
- **Stripe**: set `STRIPE_SECRET_KEY` and plan price IDs for checkout; optional `STRIPE_BENCHMARK_PREMIUM_PRICE_ID` for dedicated add-on checkout (future)

## Routes

| Path | Description |
|------|-------------|
| `/dashboard/analytics/benchmarks` | Free peer comparison (existing) |
| `/dashboard/analytics/benchmarks/premium` | Premium reports & subscription |

## Services

```
services/ai/benchmark-2.0-service.ts   — loadBenchmarkPremiumDashboard, trial/subscribe activation
lib/ai/benchmark-2.0-builders.ts       — generateIndustryReport, report catalog
lib/ai/benchmark-2.0-storage.ts        — settingsCenterJson.benchmarkPremium
```

## Actions

- `startBenchmarkPremiumTrialAction` — 14-day trial
- `subscribeBenchmarkPremiumAction` — activate monthly premium in workspace settings
- `refreshBenchmarkPremiumDashboardAction` — reload dashboard
