# Privacy review — OS Kitchen

High-level data-handling notes for beta operators. Not legal advice.

## Data categories

- **Account**: email, name, authentication identifiers (via Supabase).
- **Operational**: orders, customers, delivery addresses, production notes.
- **Integrations**: tokens (encrypted at rest), webhook payloads for debugging.
- **Billing**: Stripe customer references (no full card data in OS Kitchen).

## Principles

- **Minimize**: Store only what operations require; trim verbose webhook payloads over time.
- **Scope access**: Tenant isolation via `userId` / workspace ownership; staff roles should follow least privilege (ongoing).
- **Retention**: Define how long raw webhook JSON is kept; redact PII in logs.

## User-facing transparency

- Settings should eventually surface **data export** and **account deletion** requests (placeholders acceptable pre-GA).
- Raw payload viewers should warn that payloads may contain partner or customer data — view only when necessary.

## Demo mode

- Demo workspaces must be clearly labeled; reset operations must only touch demo-scoped rows (see seed and reset handlers).

## Next steps

- Document subprocessors (Supabase, Vercel, Stripe, email provider) in a public privacy page before GA.
- Add audit trail for admin actions on sensitive settings (post-beta).
