# Sales channels security

1. **Secrets:** Stored only in encrypted columns on `integration_connections`; server actions validate ownership; client never receives plaintext after save.
2. **Webhooks:** Verify signatures in route handlers; reject with 401 on bad signatures; log to `webhook_events` without storing raw secrets in error strings.
3. **Multi-tenant:** Every query filters by authenticated `userId` (or platform bypass for super-admin tooling only).
4. **Payload viewing:** Any future “raw payload” UI must redact `authorization`, `password`, `client_secret`, tokens, and long PII blocks.
5. **Stripe:** Billing webhooks are separate from marketplace `WebhookEvent` rows — do not conflate in ops dashboards.

Super-admin (`workspace.moroz@gmail.com` pattern via platform bypass) retains full visibility for support — still no secret echo.
