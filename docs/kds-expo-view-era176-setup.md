# KDS Expo View setup (Era 176)

Era 176 certifies KDS Expo View wiring (Round 2): ready, waiting, and delayed lanes for expo handoff — with canonical proof via era101 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `app/dashboard/kitchen/expo/page.tsx` | Expo view entry + permissions |
| `components/kitchen/expo-view-client.tsx` | Ready / waiting / delayed lane columns + ticket cards |
| `lib/kitchen/kds-expo-view.ts` | Snapshot builder + lane resolver |
| `lib/kitchen/kds-expo-view-policy.ts` | Route + component constants |
| `services/kitchen/expo-view-service.ts` | Loader + snapshot export |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:kds-expo-view-era176` | Full era176 cert + wiring audit |
| `npm run test:ci:kds-expo-view-era176` | Era176 + era101 + expo view unit tests |
| `npm run test:ci:kds-expo-view-era176:cert` | Wiring cert only (CI gate) |
| `npm run smoke:kds-expo-view-era101` | Canonical era101 smoke |

## Human activation

1. Open **Dashboard → Kitchen → Expo**.
2. Bump orders on KDS — verify ready tickets move to the **Ready** lane.
3. Confirm **Waiting** and **Delayed** lanes highlight overdue tickets.
4. Run `npm run smoke:kds-expo-view-era176` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `ready_lane` | Ready lane column + bumped ticket routing |
| `waiting_lane` | Waiting lane for in-progress handoff |
| `delayed_lane` | Delayed lane for overdue tickets |
| `expo_handoff` | `buildExpoViewSnapshot` + ticket cards UI |

## Artifact

Summary written to `artifacts/kds-expo-view-era176-smoke-summary.json` (gitignored).

See also: [kds-expo-view-era101-setup.md](./kds-expo-view-era101-setup.md)
