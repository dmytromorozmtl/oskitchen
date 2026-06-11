# Multi-station KDS — grill, fry, cold, bar, expo, packing

**Policy:** `multi-station-kds-p2-90-v1`  
**Route:** [`/dashboard/kitchen/multi-station`](/dashboard/kitchen/multi-station)  
**Upstream:** `kds-multi-station-v1` in [`kds-multi-station-policy.ts`](../lib/kitchen/kds-multi-station-policy.ts)

Six core stations (`6`) for typical line kitchens — keyword and category routing. **BETA** — verify rush-hour SLA before production KDS certification claims.

---

## Six stations

| Test id | Station | Food type | Typical keywords |
|---------|---------|-----------|------------------|
| `multi-station-kds-grill` | Grill | grill | burger, steak, chicken |
| `multi-station-kds-fry` | Fry | fry | fries, wing, fried |
| `multi-station-kds-cold` | Salad & Cold | cold | salad, poke, cold |
| `multi-station-kds-bar` | Bar & Beverage | bar | coffee, cocktail, beer |
| `multi-station-kds-expo` | Expo | expo | expo, plating, handoff |
| `multi-station-kds-packing` | Packing | prep | pack, bag, label |

Routing engine: `lib/kitchen/kds-multi-station.ts` — assigned → rule → keyword → food type.

---

## Operator flow

1. Open **Kitchen → Multi-station** for live load per core station.
2. Configure **Routing rules** for product overrides.
3. Open **Kitchen display** for bump/recall on routed tickets.
4. **verify** bottleneck station during rush — not certified realtime websocket SLA.

---

## CI

```bash
npm run audit:multi-station-kds
npm run test:ci:multi-station-kds
npm run test:ci:kds-multi-station
```

Wired in `.github/workflows/deploy-prod-gate.yml`.

---

## Related

| Route | Use |
|-------|-----|
| [`/dashboard/kitchen`](/dashboard/kitchen) | Main KDS |
| [`/dashboard/kitchen/routing-rules`](/dashboard/kitchen/routing-rules) | Station routing rules |
| `tests/unit/kds-multi-station.test.ts` | 12-station registry tests |
