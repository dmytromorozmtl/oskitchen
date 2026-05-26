# Secret rotation plan

Use this checklist if credentials were shared, committed accidentally, or suspected compromised.

> Rotate **before** first paying customers if any developer laptops had production keys.

## Supabase

- [ ] Rotate **database password** (Dashboard → Database settings).
- [ ] Update `DATABASE_URL` and `DIRECT_URL` in Vercel + local `.env.local`.
- [ ] Regenerate **service_role** key if it leaked (Dashboard → API).
- [ ] Regenerate **anon** key only if policy requires (impacts all clients — coordinate deploy).
- [ ] Redeploy Vercel so functions pick up env changes.

## Stripe

- [ ] Roll **secret key** and **webhook signing secret** in Dashboard.
- [ ] Update `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` in Vercel.
- [ ] Confirm webhook endpoint still matches production URL.
- [ ] Use **separate** test vs live keys per environment.

## Resend

- [ ] Create new API key; revoke old.
- [ ] Update `RESEND_API_KEY` in Vercel.

## Application encryption

- [ ] `ENCRYPTION_KEY` — **rotating destroys decryptability** of stored integration tokens.
  - Only rotate **before** real customer secrets exist, or build a re-encryption script (not included here).

## Cron / shared secrets

- [ ] Rotate `CRON_SECRET`, `WEBHOOK_SIGNING_SECRET`, Shopify/Woo secrets as applicable.

## Verification

- [ ] Login works (Supabase session).
- [ ] Prisma queries succeed (`/dashboard`).
- [ ] Stripe test checkout + webhook delivery.
- [ ] Resend test email.
- [ ] Cron authorized call returns 200.

## Developer Settings warnings

The Owner **Developer** page runs **pattern-only** checks (`getEnvSuspicionWarnings`) — no secret values displayed. Address any warning before scaling traffic.
