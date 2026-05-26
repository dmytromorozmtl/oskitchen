# Location hours and closures

Stored as JSON on `Location` to keep the migration footprint minimal.

## JSON shapes

`business_hours_json`, `pickup_hours_json`, `delivery_hours_json`:

```json
{
  "mon": { "open": "08:00", "close": "20:00", "closed": false },
  "tue": { "open": "08:00", "close": "20:00" },
  ...
}
```

`closures_json`:

```json
[
  { "date": "2026-12-25", "reason": "Christmas Day" },
  { "date": "2026-07-04" }
]
```

## Parsers (forgiving)

- `parseWeeklyHours(value)` — returns `WeeklyHours` (always-defined shape, drops malformed days).
- `parseClosures(value)` — returns `Closure[]` (drops malformed entries).

## Editor

`/dashboard/locations/[id]/hours` renders three independent editors. Each
posts to `updateLocationHoursAction` with a `scope` of `business`,
`pickup`, or `delivery`. The handler reads `hours.<day>.open/close/closed`
fields and runs them through `normalizeWeeklyHoursInput()`.

## Read once, use everywhere

Other modules read the same JSON:

- **Storefront checkout** can hide pickup windows when the day is closed via
  `isOpenAt(parseWeeklyHours(loc.pickupHoursJson), localNow)`.
- **Order Hub** can warn before scheduling for a closed window.
- **Route Planner** can hide route starts that fall before pickup open.
- **Calendar / Today Board** can colour days where business hours = closed.

## Why three separate fields

Many operators run pickup outside business hours (early-morning catering
drop-off) or delivery hours that lag service hours (drivers leave after the
last seating). Forking the JSON keeps these orthogonal and avoids encoding
"is this a pickup or a service window?" inside one schema.

## Inheritance

Pickup / delivery hours that are empty inherit the business hours by
convention. UIs that surface "open / closed now" should fall back through
`pickupHoursJson → businessHoursJson` if the first is empty.
