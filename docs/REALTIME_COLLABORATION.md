# Realtime collaboration

## Policy

- **No fake websocket:** UI describes state honestly (`getRealtimeConfig` in `services/realtime/realtime-service.ts` — `supabaseConfigured` does not imply live ops websockets yet).
- **Fallback:** polling + manual refresh (`SyncIndicator`, Today copy).

## Topics

- `lib/realtime/realtime-events.ts` lists channel names for Today, Order Hub, Kitchen screen, etc.

## Components

- `components/realtime/live-activity-feed.tsx`
- `components/realtime/live-presence.tsx`

## Next implementation step

Subscribe via Supabase Realtime (already used for auth) behind a feature flag; broadcast **non-PII** operational events only.

## Priority

**P2** polish; **P1** for large kitchens with concurrent editors.
