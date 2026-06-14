# Floor plan editor — Lightspeed parity (P2-65)

**Policy:** `floor-plan-editor-p2-65-v1`  
**Route:** `/dashboard/floor-plans`  
**Gap:** P2-65 — visual floor plan editor with real-time table management

## Overview

OS Kitchen ships a **visual floor plan editor** with drag-and-drop canvas layout and **real-time table management** — comparable to Lightspeed floor plan workflows, without claiming certified parity.

## Flow

1. **Visual canvas** — grid-snapped drag-and-drop table layout (`floor-plan-canvas`)
2. **Drag reposition** — pointer events persist `positionX` / `positionY` via server actions
3. **Table management panel** — status, shape, order link, delete (`floor-plan-table-management`)
4. **Realtime sync** — Supabase Realtime when configured; 15s polling fallback (`floor-plan-connection-status`)

## Table management capabilities

| Capability | UI surface |
|------------|------------|
| `drag_reposition` | Canvas pointer drag |
| `status_change` | Management panel status buttons |
| `shape_change` | Rectangle / circle / square toggles |
| `add_table` | Add table form |
| `delete_table` | Delete table action |
| `section_filter` | Section zone pills |
| `order_link` | Order Hub deep link |
| `realtime_refresh` | `useFloorPlanRealtime` + `router.refresh()` |

## Benchmark corpus

**12 scenarios** covering 100% of table management capabilities with ≥6 realtime scenarios.

Run: `npm run check:floor-plan-editor-p2-65`

## Honesty

- **BETA** — not certified live occupancy sync for every venue
- Supabase Realtime when env configured; polling fallback otherwise
- Oracle MICROS absolute-final policy remains for legacy cert wiring

## Wiring

- `components/restaurant/floor-plan-editor.tsx`
- `hooks/use-floor-plan-realtime.ts`
- `services/floor-plan-realtime.ts`
- `actions/restaurant/tables.ts`
- `lib/restaurant/floor-plan-table-management-p2-65.ts`
