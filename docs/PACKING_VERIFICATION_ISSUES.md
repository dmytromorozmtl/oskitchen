# Packing verification issues

## Modeled issue signals

Issue categories map to item statuses and/or `QC_EVENT` rows:

| User-facing issue | Typical item status | QC event |
|-------------------|---------------------|----------|
| Missing item | `MISSING` | `ITEM_MISSING` |
| Wrong item | `WRONG_ITEM` | `ITEM_WRONG` |
| Extra item | `EXTRA` | `ITEM_EXTRA` |
| Damaged | `DAMAGED` | `ITEM_DAMAGED` |
| Substitution | `SUBSTITUTED` | `ITEM_SUBSTITUTED` |
| Label / allergen gap | pending checks or notes | `ISSUE_OPENED` / check events |

## Session outcome

- **Partial** / **Fail** — operator-selected on complete when lines are not all `VERIFIED`.
- **Supervisor override** — `PackingVerificationOverride` + session `OVERRIDDEN` + `SUPERVISOR_OVERRIDE` event.

## Send back to packing

`sendVerificationBackToPackingAction` → `sendSessionBackToPacking`:

- Reopens `PackingTask` rows for the order (`QUEUED`, clears pack/verify timestamps).
- Appends `SENT_BACK_PACKING` QC event.

## Send back to production

Reserved: `SENT_BACK_PRODUCTION` exists in `QC_EVENT` but **no dedicated action** yet — implement with your production queue model (see audit doc P1).

## Resolution checklist (recommended UX)

When returning to packing or production:

1. Log reason in session or line `notes`.
2. Visible row in Issues tab until session completed or cancelled.
3. (Future) Notify packing lead channel.
