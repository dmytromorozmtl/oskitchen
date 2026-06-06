# KDS Rush Mode setup (Era 178)

Era 178 certifies KDS Rush Mode wiring (Round 2): auto peak detection, priority routing, RushMode UI, and sound alerts — with canonical proof via era103 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `components/kitchen/rush-mode.tsx` | Rush banner, peak signals, priority route cards |
| `lib/kitchen/kds-rush-mode.ts` | Peak detection, routing builder, sound alert gate |
| `lib/kitchen/kds-rush-mode-policy.ts` | Policy id + peak threshold constants |
| `lib/kitchen/kds-realtime-sounds.ts` | `playKdsRushModeAlert` triple-tone |
| `components/kitchen/kds-daily-service.tsx` | RushMode mount + snapshot + sound trigger |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:kds-rush-mode-era178` | Full era178 cert + wiring audit |
| `npm run test:ci:kds-rush-mode-era178` | Era178 + era103 + rush mode unit tests |
| `npm run test:ci:kds-rush-mode-era178:cert` | Wiring cert only (CI gate) |
| `npm run smoke:kds-rush-mode-era103` | Canonical era103 smoke |

## Human activation

1. Open **Dashboard → Kitchen (KDS)** — queue 8+ tickets to trigger peak rush.
2. Verify **RushMode** banner with peak signals and priority routing cards.
3. Enable sound — confirm triple-tone alert on peak rush entry.
4. Run `npm run smoke:kds-rush-mode-era178` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `peak_detection` | `detectKdsRushLevel` + `KDS_RUSH_PEAK_ACTIVE_MIN` |
| `priority_routing` | `buildKdsRushPriorityRoutes` + `kds-rush-route-` cards |
| `rush_ui` | `RushMode` component + `kds-rush-peak-signals` |
| `sound_alerts` | `playKdsRushModeAlert` + `isKdsRushSoundAlertLevel` |

## Artifact

Summary written to `artifacts/kds-rush-mode-era178-smoke-summary.json` (gitignored).

See also: [kds-rush-mode-era103-setup.md](./kds-rush-mode-era103-setup.md)
