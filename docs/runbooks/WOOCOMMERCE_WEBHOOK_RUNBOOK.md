# WooCommerce webhook runbook

## Symptoms

- Orders missing after WooCommerce reports delivery 200.

## Checks

1. `webhook_events` for connection id + topic.
2. `signature_valid`.
3. `webhook_processing_jobs` status when async enabled.

## Actions

- Fix secret mismatch.
- Use audited replay (break-glass) after fixing root cause.
