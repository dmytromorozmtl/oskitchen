# Homebase LIVE integration setup (Era 160)

Era 160 certifies Homebase LIVE integration wiring: OAuth, time clock sync, and schedule import/export — with demo location proof via era83 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `scripts/smoke-homebase-live.ts` | Live OAuth → time clock → schedule orchestrator |
| `services/integrations/homebase/schedule-import.service.ts` | Schedule import |
| `services/integrations/homebase/schedule-export.service.ts` | Schedule export |
| `services/integrations/homebase/time-clock.service.ts` | Time clock sync |
| `services/integrations/homebase/homebase-api.ts` | Homebase API client |
| `app/api/integrations/homebase/oauth/callback/route.ts` | OAuth callback |
| `app/api/integrations/homebase/sync-schedule/route.ts` | Schedule sync API |
| `app/api/integrations/homebase/sync-timeclock/route.ts` | Time clock sync API |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:homebase-live-era160` | Full era160 cert + wiring audit |
| `npm run test:ci:homebase-live-smoke-era160` | Era160 + era83 + integration tests |
| `npm run test:ci:homebase-live-smoke-era160:cert` | Wiring cert only (CI gate) |
| `npm run smoke:homebase-live` | Live demo location OAuth proof |

## Human activation

1. Provision Homebase demo location (real location ID, not placeholder).
2. Complete OAuth in Dashboard → Integrations → Homebase; map staff to Homebase employee IDs.
3. Set `DATABASE_URL` + `ENCRYPTION_KEY` + `CHANNEL_SMOKE_OWNER_EMAIL`.
4. Run `npm run smoke:homebase-live` — live path PASSED.
5. Run `npm run smoke:homebase-live-era160` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `oauth` | Homebase OAuth token flow |
| `time_clock` | `syncHomebaseTimeClock` |
| `schedule` | Schedule import + export services |

## Artifact

Summary written to `artifacts/homebase-live-smoke-era160-smoke-summary.json` (gitignored).

See also: [homebase-live-smoke-setup.md](./homebase-live-smoke-setup.md)
