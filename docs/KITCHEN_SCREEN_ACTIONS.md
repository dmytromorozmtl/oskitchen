# Kitchen Screen actions

| Action | Mechanism |
|--------|-----------|
| Start / ready / resume / hold / packing / complete | `updateProductionWorkItemStatusFormAction` + optional `appendNote`. |
| Assign / unassign | `assignProductionWorkItemStaffFormAction` with `staffMemberId` empty string → null. |
| Legacy cook/pack/label | `updateProductionTask` from client handler. |

## Audit & events

- Audit log on status change and assign.
- `ProductionWorkEvent` type `SENT_TO_PACKING` when entering `PACK_HANDOFF`.
- `REASSIGNED` on staff change.

## Duplicate safety

Status update returns early if same status and no `appendNote`, avoiding duplicate packing events.
