# Driver view

## Routes

- `/dashboard/routes/driver` — list of routes for today owned by the current user or assigned via `driverUserId`.
- `/dashboard/routes/[routeId]/driver` — single-route, mobile-first stop list.

## UX

- Large stop cards with status badge and address.
- Maps + Call buttons inline per stop.
- Status form (same component as the admin detail page) so drivers can mark `LOADED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`, etc.
- Subnav hidden on print.

## Permissions

Driver view is gated by session like the rest of the dashboard. Workspace owners and admins always see their routes; assigned drivers (`driverUserId`) see those where they match. Tightening to `WorkspaceMember.role` will come with the broader RBAC sweep.

## What we do not do

- No GPS tracking.
- No optimization / re-routing.
- No third-party dispatch dialog (`/dashboard/routes/uber-direct` stays a placeholder).
