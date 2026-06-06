# KDS Expo View smoke setup (Era 101)

Era 101 certifies expo view wiring: ready, waiting, and delayed ticket lanes for runner handoff.

## Wiring surfaces

| Path | Role |
|------|------|
| `app/dashboard/kitchen/expo/page.tsx` | Expo view entry + permissions |
| `components/kitchen/expo-view-client.tsx` | Three-lane UI with ticket cards |
| `lib/kitchen/kds-expo-view.ts` | Lane resolver + snapshot builder |
| `lib/kitchen/kds-expo-view-policy.ts` | Route + component constants |
| `services/kitchen/expo-view-service.ts` | Order fetch + snapshot loader |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:kds-expo-view-era101` | Full era101 cert + wiring audit |
| `npm run test:ci:kds-expo-view-era101` | Era101 + expo view unit tests |
| `npm run test:ci:kds-expo-view-era101:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Kitchen → Expo**.
2. Bump orders on KDS — verify **Ready** lane fills with plated tickets.
3. Confirm **Waiting** lane shows in-progress orders.
4. Let tickets exceed overdue threshold — verify **Delayed** lane highlights them.
5. Run `npm run smoke:kds-expo-view-era101` — artifact **PASSED**.

## Lanes

| Lane | Meaning |
|------|---------|
| Ready | Plated — waiting for pickup or runner |
| Waiting | Still on the line — expo watches prep |
| Delayed | Overdue — prioritize handoff |

## Artifact

Summary written to `artifacts/kds-expo-view-smoke-summary.json` (gitignored).
