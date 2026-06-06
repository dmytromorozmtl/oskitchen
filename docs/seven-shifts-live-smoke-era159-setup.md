# 7shifts LIVE integration setup (Era 159)

Era 159 certifies 7shifts LIVE integration wiring: OAuth, schedule import/export, and labor cost sync — with demo company proof via era82 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `scripts/smoke-seven-shifts-live.ts` | Live OAuth → schedule → labor orchestrator |
| `services/integrations/seven-shifts/schedule-import.service.ts` | Schedule import |
| `services/integrations/seven-shifts/schedule-export.service.ts` | Schedule export |
| `services/integrations/seven-shifts/labor-cost.service.ts` | Labor cost sync |
| `services/integrations/seven-shifts/seven-shifts-api.ts` | 7shifts API client |
| `app/api/integrations/7shifts/oauth/callback/route.ts` | OAuth callback |
| `app/api/integrations/7shifts/sync-schedule/route.ts` | Schedule sync API |
| `app/api/integrations/7shifts/sync-labor/route.ts` | Labor sync API |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:seven-shifts-live-era159` | Full era159 cert + wiring audit |
| `npm run test:ci:seven-shifts-live-smoke-era159` | Era159 + era82 + integration tests |
| `npm run test:ci:seven-shifts-live-smoke-era159:cert` | Wiring cert only (CI gate) |
| `npm run smoke:seven-shifts-live` | Live demo company OAuth proof |

## Human activation

1. Provision 7shifts demo company (real company ID, not placeholder).
2. Complete OAuth in Dashboard → Integrations → 7shifts; map staff to 7shifts user IDs.
3. Set `DATABASE_URL` + `ENCRYPTION_KEY` + `CHANNEL_SMOKE_OWNER_EMAIL`.
4. Run `npm run smoke:seven-shifts-live` — live path PASSED.
5. Run `npm run smoke:seven-shifts-live-era159` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `oauth` | 7shifts OAuth token flow |
| `schedule_import_export` | Import + export schedule services |
| `labor_cost` | `syncSevenShiftsLaborCost` |

## Artifact

Summary written to `artifacts/seven-shifts-live-smoke-era159-smoke-summary.json` (gitignored).

See also: [seven-shifts-live-smoke-setup.md](./seven-shifts-live-smoke-setup.md)
