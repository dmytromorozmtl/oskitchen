# Launch checklist (production)

## Infrastructure

- [ ] `NEXT_PUBLIC_APP_URL` matches deployed hostname.
- [ ] Supabase auth redirect URLs updated.
- [ ] `DATABASE_URL` (pooler) + `DIRECT_URL` (direct) configured for Prisma.
- [ ] `npx prisma migrate deploy` executed against production.
- [ ] `ENCRYPTION_KEY` generated and stored in a secrets manager (never commit).

## Payments

- [ ] Stripe live keys + live price IDs (or maintain test until GA).
- [ ] Stripe webhook endpoint live with signing secret.
- [ ] Billing smoke test (checkout + portal).

## Integrations

- [ ] WooCommerce: HTTPS webhooks with secrets rotated; verify sample order hits Order hub.
- [ ] Shopify: custom app installed, webhooks registered, uninstall handler verified.
- [ ] Uber modules: remain disabled or staging-only until partner approval.

## Observability & safety

- [ ] Error logging destination configured.
- [ ] Rate limits / WAF rules on `/api/webhooks/*`.
- [ ] Backup policy for Postgres (Supabase PITR).

## Legal / ops

- [ ] Privacy policy + data processing agreements for EU customers if applicable.
- [ ] Support inbox for Enterprise sales contact.
