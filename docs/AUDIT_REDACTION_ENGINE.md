# Audit Redaction Engine

Implementation: `lib/audit/audit-redaction.ts`

## Always redact (non-exhaustive)

Keys matching password, token, apiKey, secret, webhookSecret, databaseUrl, connectionString, Stripe/Supabase/Resend/OpenAI-style env key names, authorization headers, card patterns, etc.

## PII masking

`maskPiiInMetadata` on `AuditLogInput` masks email/phone in metadata when storing for broader visibility profiles.

## Audit flags

`redactionApplied` boolean on `AuditLog` reflects whether any redaction path touched payload fields.
