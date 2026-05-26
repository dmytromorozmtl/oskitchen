# Integration Health

## Card fields

- Provider, human name, `IntegrationStatus`, `last_sync_at`, boolean **webhook secret configured** (derived from `webhook_secret_encrypted` presence — never decrypted), truncated `last_error` text.

## UI

- `/dashboard/developer/integrations`

## Next steps

- Token expiry inference per provider, rate-limit counters, and webhook health cross-links.
