# Kitchen Screen audit

**Route:** `/dashboard/kitchen` · **Fullscreen:** `?fullscreen=1` or `/dashboard/kitchen/fullscreen`

| Area | Current state | Limitation | Affected modes | Fix | Pri |
|------|---------------|------------|----------------|-----|-----|
| Data | `loadKitchenScreenBundle` reads open `ProductionWorkItem` + legacy `ProductionTask`. | No join to `ProductionStation` presets yet. | All | Map station strings to station master list. | P2 |
| Execution | Client calls `updateProductionWorkItemStatusFormAction`, assign action, `updateProductionTask`. | No optimistic local list; uses `useTransition` + refresh. | Rush | Optional optimistic reducer. | P2 |
| Packing | `PACK_HANDOFF` + `SENT_TO_PACKING` work event on transition. | No automatic `PackingEvent` row yet. | Meal prep | Packing module callback. | P0 |
| Roles | `UserProfile.role` OWNER vs STAFF; empty states differ. | No fine-grained kitchen lead vs packer. | Enterprise | Extend roles or workspace policy flags. | P1 |
| Tablet UX | Large buttons, station tabs, mode select, fullscreen overlay, compact/large cards. | Sidebar still under non-fullscreen (dashboard shell). | Tablets | Fullscreen default for `/kitchen` bookmark on device. | P2 |
| A11y | Touch targets ≥44px on primary actions; some hold controls dense. | Hold reasons in a row wrap on small phones. | All | Single-select hold + one button (done). | P2 |
| Performance | Poll refresh ~28s + manual; `take` 120/100. | Many tasks may need virtualization. | Ghost | Virtualize grid + server station filter. | P1 |
| My tasks | Matches `StaffMember.email` to session email. | No self-service link if email missing. | Staff | Staff profile settings hint in empty state. | P2 |
| Labels | `requiresLabel` badge only. | No print pipeline from kitchen. | Bakery | Wire label API when available. | P1 |
| Blockers | Hold uses `HOLD` + appended `[Hold] reason` in notes. | Not pushed to Today board automatically. | All | Notification rule on HOLD. | P2 |

**P0:** Packing queue automation from `SENT_TO_PACKING` events.

**P1:** Role matrix, label print, virtualization, server-side station filter.

**P2:** Station presets, notifications on hold, a11y polish, default kiosk URL.

**P3:** WebSocket live updates, sound alerts, keep-awake API.
