# Final QA checklist (manual)

Run **`npm run production-check`** first. Then verify flows below in **staging** or **production** as appropriate.

## Marketing & auth

- [ ] Homepage, pricing, integrations hub load over HTTPS
- [ ] `/beta` form submits (honeypot silent-rejects bots)
- [ ] Signup → email confirmation behavior matches Supabase settings
- [ ] Login / logout
- [ ] Password reset email + redirect

## Onboarding & dashboard

- [ ] Onboarding completes → dashboard
- [ ] Demo import works **only** when policy allows (`DEMO_MODE_ENABLED` in prod)
- [ ] Owner sees Developer + Beta inbox links

## Operations

- [ ] Order Hub lists orders
- [ ] Integrations page shows honest launch status
- [ ] Production board loads
- [ ] Packing PDF generation works on target browser
- [ ] Analytics charts render
- [ ] Notifications page shows log rows after cron/reminders

## Billing

- [ ] Billing page shows **Stripe setup** banner when keys missing
- [ ] **Test mode** banner when using `sk_test`
- [ ] Checkout redirects to Stripe
- [ ] Billing portal opens for subscribed customer
- [ ] Webhook updates subscription row

## Platform

- [ ] Supabase redirects match domain
- [ ] Transactional email received (Resend)
- [ ] Stripe webhook 200 in Dashboard
- [ ] WooCommerce / Shopify test ping (if configured)

## Mobile / iPad

- [ ] Sidebar / sheet navigation usable
- [ ] Order Hub readable; primary actions reachable

## Security sanity

- [ ] `/dashboard/developer/email-preview` **404** in production
- [ ] Non-owner cannot open Developer routes
- [ ] Cron rejects missing/wrong `Authorization` header
