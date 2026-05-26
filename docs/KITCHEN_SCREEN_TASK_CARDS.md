# Kitchen Screen task cards

## Primary

Title, quantity, station, stage, due time (with late styling), priority badge, status badge.

## Secondary

Order summary, brand badge, assignee, notes (clamped), pack/label requirement badges, allergen banner.

## Actions

- Start (`IN_PROGRESS`), Mark ready (`READY`), Resume (`TO_PREP`), Hold (`HOLD` + note), Send to packing (`PACK_HANDOFF`), Complete (`DONE`).
- Assign: native select + **Save assign**; **Assign to me** when staff profile matches login email.

## Card states

Derived visually: late border, hold amber tint, default card chrome.

## Legacy cards

Separate section: cook / pack / label tri-state via `updateProductionTask`.
