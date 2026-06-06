# KDS Multi-Station smoke setup (Era 104)

Era 104 certifies multi-station wiring: 12-station registry, food-type routing, production view load cards, and expo ticket labels.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/kitchen/multi-station-service.ts` | Station registry loader, routed production snapshot |
| `lib/kitchen/kds-multi-station.ts` | Keyword + category routing, snapshot builder |
| `lib/kitchen/kds-multi-station-policy.ts` | 12 default stations, food-type buckets, category map |
| `components/kitchen/production-view-client.tsx` | Multi-station count badge on production view |
| `services/kitchen/expo-view-service.ts` | Routed station labels on expo tickets |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:kds-multi-station-era104` | Full era104 cert + wiring audit |
| `npm run test:ci:kds-multi-station-era104` | Era104 + multi-station unit tests |
| `npm run test:ci:kds-multi-station-era104:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Kitchen → Production**.
2. Verify **Multi-station routing · 12 stations** banner.
3. Queue mixed orders (burger, fries, latte) — confirm food-type routing.
4. Open **Expo** — verify station labels on tickets.
5. Run `npm run smoke:kds-multi-station-era104` — artifact **PASSED**.

## Default stations (12)

Grill, Fry, Sauté, Pizza, Salad & Cold, Bakery, Dessert, Bar & Beverage, Sushi, Wok & Noodles, Prep, Expo.

## Routing priority

1. Explicit station assignment
2. Title keyword match
3. Product category → food type
4. Prep fallback

## Artifact

Summary written to `artifacts/kds-multi-station-smoke-summary.json` (gitignored).
