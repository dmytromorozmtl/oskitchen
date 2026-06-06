# KDS Rush Mode smoke setup (Era 103)

Era 103 certifies rush mode wiring: auto peak detection, priority routing, RushMode UI, and sound alerts on the main KDS.

## Wiring surfaces

| Path | Role |
|------|------|
| `components/kitchen/rush-mode.tsx` | Rush banner — level badge, peak signals, priority routes |
| `lib/kitchen/kds-rush-mode.ts` | Peak detection, priority routing, snapshot builder |
| `lib/kitchen/kds-rush-mode-policy.ts` | Threshold constants (building/peak volume, arrivals, overdue) |
| `lib/kitchen/kds-realtime-sounds.ts` | `playKdsRushModeAlert` triple-tone on peak |
| `components/kitchen/kds-daily-service.tsx` | Mounts RushMode + triggers sound on level change |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:kds-rush-mode-era103` | Full era103 cert + wiring audit |
| `npm run test:ci:kds-rush-mode-era103` | Era103 + rush mode unit tests |
| `npm run test:ci:kds-rush-mode-era103:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Kitchen** (main KDS).
2. Queue **8+ active tickets** — verify RushMode banner appears at peak rush.
3. Confirm **priority routing** cards (allergen/overdue/oldest first).
4. Enable **sound** — triple-tone alert on peak rush entry.
5. Run `npm run smoke:kds-rush-mode-era103` — artifact **PASSED**.

## Rush levels

| Level | Trigger |
|-------|---------|
| normal | Below building thresholds |
| building | 5+ active, 4+ arrivals/10m, or 2+ overdue |
| rush | 8+ active, 6+ arrivals/10m, or 3+ overdue |

## Artifact

Summary written to `artifacts/kds-rush-mode-smoke-summary.json` (gitignored).
