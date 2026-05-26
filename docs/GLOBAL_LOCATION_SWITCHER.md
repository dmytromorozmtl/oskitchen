# Global location switcher

Cookie-backed selected location, readable from any server component.

## Components

- `components/dashboard/location-switcher.tsx` — `<LocationSwitcher>` (client). Hidden when there's ≤1 location.
- `components/dashboard/location-badge.tsx` — `<LocationBadge>` for table cells / list items.

## Action

`actions/locations.ts → setActiveLocationAction` writes the `kos.loc` cookie
(value = `"all"` or a location uuid) and revalidates the dashboard.

## Reader

`lib/locations/location-context.ts → readLocationContext()` returns
`{ mode: "all" } | { mode: "single"; locationId }`.

For Prisma filters use `locationContextFilter()`:

```ts
const where = {
  userId,
  ...(await locationContextFilter()),
};
const orders = await prisma.order.findMany({ where });
```

`locationContextFilter()` returns `{}` in "all locations" mode so it composes
cleanly. Pass a different field name when the column is mapped differently
(e.g. `locationContextFilter("startLocationId")`).

## Drop-in usage

The switcher is wired into `/dashboard/locations/layout.tsx` already and is
available for re-use:

```tsx
import { LocationSwitcher } from "@/components/dashboard/location-switcher";

const locations = await prisma.location.findMany({...});
const ctx = await readLocationContext();
const current = ctx.mode === "all" ? "all" : ctx.locationId;

return <LocationSwitcher options={locations} current={current} />;
```

## Single-location workspaces

`<LocationSwitcher>` returns `null` when given ≤1 option, so single-location
operators never see the dropdown. As they add more locations, the switcher
appears automatically.

## Superadmin

The cookie is per-browser-user. The platform superadmin can still see every
workspace and switch within each one.
