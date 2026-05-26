# Support notifications

## Ticket created

- `trySendTicketCreatedConfirmation` → **only** if `isEmailConfigured()`; otherwise log-style skip (no fabricated delivery).  
- `notifyGrowthInbound` for optional founder/GTM inbox (`GROWTH_NOTIFY_EMAIL` / `NEXT_PUBLIC_SUPPORT_EMAIL`).

## Ticket updated

- Assignment / escalation use revalidation; assignee email on change is a **future** enhancement (do not fake).

## NotificationLog

- Optional future: write `NotificationLog` rows for support emails when dedupe keys are defined.
