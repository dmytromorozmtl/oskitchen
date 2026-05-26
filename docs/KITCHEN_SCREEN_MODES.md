# Kitchen Screen modes

Modes are **URL-driven** (`?mode=`) and implemented in `filterKitchenWorkItems`.

| Mode | Behavior |
|------|----------|
| `all` | Default — all open work items (after optional station tab). |
| `station` | Same as all (reserved for future station-only layout). |
| `my_tasks` | Items assigned to viewer’s `StaffMember` row (email match). |
| `rush` | HIGH/CRITICAL priority, late, or due within 45 minutes. |
| `packing` | `requiresPacking` or status `PACK_HANDOFF`. |
| `event` | Reserved — filter by catering/event metadata when linked. |
| `batch` | Reserved — filter by batch mode when work items carry batch tags. |
| `bar_prep` | Station matches bar heuristics. |
| `bakery_batch` | Station matches bakery heuristics. |
| `meal_prep` | Packing required or title hints (portion/pack/meal). |

Station tabs use slugs: `prep`, `hot-line`, `cold-line`, `pastry`, `bakery`, `bar`, `packing`, plus **All**.
