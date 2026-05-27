# Growth Architecture

## Access control

- `lib/growth/growth-permissions.ts` — `canAccessGrowthModule` grants **workspace owners**, **platform superadmins** (`isSuperAdminUser`), and platform roles `SUPER_ADMIN`, `PLATFORM_ADMIN`, `GROWTH_ADMIN`, `PARTNER_ADMIN`, `SUPPORT_ADMIN`.
- `lib/growth/require-owner-growth.ts` — layout gate for all `/dashboard/growth/*` routes.
- `actions/growth.ts` — uses `authorizeGrowth("growth.manage")` (canonical `growth.manage` + platform GTM legacy bridge).
- `app/dashboard/growth/layout.tsx` — `requireGrowthPageAccess("growth.view")`.
- `/api/growth/*/export` — `requireGrowthApiAccess("growth.view")`.

## Service layer (`services/growth/`)

| Service | Responsibility |
| --- | --- |
| `growth-service.ts` | `getGrowthCommandCenterSnapshot` — composes KPIs, funnels, charts inputs, risk/expansion samples. |
| `lead-service.ts` | Lead reads + `groupLeadsByLifecycleLane`. |
| `demo-service.ts` | Demo aggregates/lists. |
| `customer-success-service.ts` | Health snapshot mix. |
| `referral-service.ts` | Referral counters. |
| `telemetry-service.ts` | Usage rollups. |
| `usage-service.ts` | WAU estimate + distinct users. |
| `churn-service.ts` | Heuristic churn watchlist. |
| `expansion-service.ts` | Heuristic expansion list. |
| `outreach-service.ts` | Campaign CRUD seed + list. |
| `content-service.ts` | Release note stats. |
| `onboarding-service.ts` | Onboarding call stats. |

## Lib helpers (`lib/growth/`)

- `growth-events.ts` — canonical telemetry strings + lifecycle vocabulary.
- `growth-funnel.ts` — maps `BetaLead` → PLG lane.
- `growth-scoring.ts` — non-ML expansion/churn heuristics.
- `growth-analytics.ts` — pure math helpers (`pct`, `weekKey`).

## UI

- `components/growth/growth-command-center.tsx` — Recharts visualizations (client).
- `components/growth/growth-leads-kanban.tsx` — Founder CRM pipeline.
