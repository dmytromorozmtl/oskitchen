# AI Labor Manager setup (Era 184)

Era 184 certifies AI Labor Manager wiring (Round 2): staffing optimization, overtime alerts, and daily brief — with canonical proof via era109 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/ai/labor-manager.ts` | Snapshot loader — schedule plan + realtime clock |
| `lib/ai/labor-manager-builders.ts` | Staffing signals, overtime alerts, daily brief |
| `lib/ai/labor-manager-policy.ts` | Policy id, route, OT thresholds |
| `app/dashboard/staff/labor-manager/page.tsx` | AI Labor Manager page |
| `components/labor/labor-manager-client.tsx` | Daily brief, staffing gaps, overtime alerts |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:ai-labor-manager-era184` | Full era184 cert + wiring audit |
| `npm run test:ci:ai-labor-manager-era184` | Era184 + era109 + labor manager unit tests |
| `npm run test:ci:ai-labor-manager-era184:cert` | Wiring cert only (CI gate) |
| `npm run smoke:ai-labor-manager-era109` | Canonical era109 smoke |

## Human activation

1. Open **Dashboard → Staff → AI Labor Manager**.
2. Verify **Daily labor brief** with headline and executive summary.
3. Review **Staffing optimization** — understaffed/overstaffed day cards.
4. Check **Overtime alerts** — projected hours and est. OT cost per staff member.
5. Run `npm run smoke:ai-labor-manager-era184` — artifact **PASSED**.

## Capabilities

| Capability | Description |
|------------|-------------|
| `staffing_optimization` | Compare scheduled vs recommended headcount by day |
| `overtime_alerts` | Projected weekly hours with OT premium cost |
| `daily_brief` | Executive summary and action bullets |

## Artifact

Summary written to `artifacts/ai-labor-manager-era184-smoke-summary.json` (gitignored).

See also: [ai-labor-manager-era109-setup.md](./ai-labor-manager-era109-setup.md)
