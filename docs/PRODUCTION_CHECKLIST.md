# Production checklist

Use before inviting beta users or taking payment.

## Infra

- [ ] `NEXT_PUBLIC_APP_URL` matches canonical domain (HTTPS)
- [ ] Supabase Auth redirect URLs updated
- [ ] `DATABASE_URL` pooler + `DIRECT_URL` direct configured
- [ ] `npm run db:deploy` succeeded on production DB
- [ ] `ENCRYPTION_KEY` set and backed up in secrets manager
- [ ] `CRON_SECRET` set if cron routes enabled in Vercel

## Billing

- [ ] Stripe **live** keys (when going live) + price IDs
- [ ] Webhook endpoint live + signing secret in env
- [ ] Test: subscribe, portal, cancel, failed payment (Stripe test mode first)

## Email

- [ ] Resend domain verified
- [ ] `RESEND_FROM_EMAIL` uses verified sender
- [ ] Send test welcome / order email

## Integrations

- [ ] Each channel shows honest status (no “live” without credentials)
- [ ] Webhook secrets configured per provider
- [ ] WooCommerce / Shopify callback URLs updated to production domain

## Security

- [ ] Service role key only on server
- [ ] Rate limits / auth on sensitive API routes reviewed
- [ ] Legal pages linked in footer (`/legal/*`)

## Product / QA

- [ ] Signup → onboarding → dashboard
- [ ] Demo routes show demo banner + simulated labels
- [ ] Owner can open `/dashboard/developer` and `/dashboard/beta-applications`
- [ ] CSV export from Settings works for Owner/staff as designed
- [ ] `npm run typecheck` and `npm run build` pass in CI

## Post-launch (first 24h)

- [ ] Monitor webhook logs for failures
- [ ] Spot-check error logs (no secret leakage)
- [ ] Verify cron ran (if scheduled)
