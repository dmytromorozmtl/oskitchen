# Consent and privacy

KitchenOS splits notifications into two consent layers:

1. **Transactional** (`GUEST_TRANSACTIONAL`, internal, system,
   billing) — sent to anyone with an active relationship (order,
   account). Not gated on consent.
2. **Marketing / reminder** (`GUEST_REMINDER`, plus any template
   whose `marketing` flag is true in the registry) — gated on
   recipient consent.

## Consent sources

The send path checks consent in this order:

1. `NotificationPreference` for `(userId, customerId)` — if present
   and either `mutedUntil` is in the future or both
   `emailMarketingEnabled` and `emailReminderEnabled` are false, the
   send is recorded as `SKIPPED`.
2. Fallback to `KitchenCustomer.marketingConsent`. If `false`, the
   send is `SKIPPED` with reason "Customer has not given marketing
   consent."
3. Customer status `!= ACTIVE` short-circuits to `SKIPPED`.

Transactional templates bypass these checks entirely.

## PII surface

- `notification_logs.recipient` stores the raw email (required for
  retries and Resend lookup).
- The log does **not** store rendered HTML or plain text.
- `metadata` and `error_message` are capped (`error_message` ≤ 1000
  chars).
- The Provider tab returns presence-only env diagnostics — keys are
  never serialized to JSON.

## Unsubscribe

Unsubscribe links are not auto-rendered in the current template pack —
operators must include them when they author per-workspace overrides
for marketing templates. The `NotificationPreference` row supports a
future automated unsubscribe handler.
