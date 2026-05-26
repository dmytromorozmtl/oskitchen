# Realtime Updates (architecture)

## Current

- Server Components + navigation refresh remain the default consistency mode.
- `components/realtime/sync-indicator.tsx` documents intent on Today (“Live ops” affordance).

## Planned (non-breaking)

1. **Supabase Realtime** on narrow channels (`orders`, `production_batches`, `delivery_routes`) with RLS tied to `workspaceId`.
2. **Polling fallback** (`/api/health` + module-local SWR) when realtime disabled.
3. **Sync chip** transitions from static → “Updated just now” when websocket/poll fires.

## Constraints

- Avoid N subscriptions per dashboard — prefer hub pages (Today, Order Hub, Kitchen Screen).
