# KDS Multi-Station setup (Era 179)

Era 179 certifies KDS Multi-Station wiring (Round 2): 12-station registry, food-type routing, and production + expo view integration — with canonical proof via era104 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/kitchen/multi-station-service.ts` | Station registry, snapshot, production routing |
| `lib/kitchen/kds-multi-station.ts` | Food-type routing + multi-station snapshot builder |
| `lib/kitchen/kds-multi-station-policy.ts` | 12 default stations + category→food-type map |
| `components/kitchen/production-view-client.tsx` | Multi-station count badge (10+ gate) |
| `services/kitchen/expo-view-service.ts` | Expo ticket routing via station registry |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:kds-multi-station-era179` | Full era179 cert + wiring audit |
| `npm run test:ci:kds-multi-station-era179` | Era179 + era104 + multi-station unit tests |
| `npm run test:ci:kds-multi-station-era179:cert` | Wiring cert only (CI gate) |
| `npm run smoke:kds-multi-station-era104` | Canonical era104 smoke |

## Human activation

1. Open **Dashboard → Kitchen → Production** — verify 12-station routing banner.
2. Queue mixed orders (grill, fry, bar) — confirm food-type routing to correct stations.
3. Open **Expo** view — verify routed station labels on tickets.
4. Run `npm run smoke:kds-multi-station-era179` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `station_registry` | `loadKdsStationRegistry` + `DEFAULT_KDS_STATIONS` (12) |
| `food_type_routing` | `routeKdsWorkItemToStation` + `KDS_CATEGORY_FOOD_TYPE_MAP` |
| `production_routing` | `loadKdsProductionViewWithRouting` + `kds-multi-station-count` |
| `expo_routing` | `expo-view-service.ts` station labels on tickets |

## Artifact

Summary written to `artifacts/kds-multi-station-era179-smoke-summary.json` (gitignored).

See also: [kds-multi-station-era104-setup.md](./kds-multi-station-era104-setup.md)
