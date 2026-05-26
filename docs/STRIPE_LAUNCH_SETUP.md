# Stripe launch setup

## Products & prices

Create **Products** in Stripe for KitchenOS plans (monthly):

| Plan | Suggested price | Entitlements (marketing) |
|------|-----------------|---------------------------|
| Starter | $29/mo | Manual orders, 1 menu, 100 orders/mo, basic production |
| Pro | $79/mo | WooCommerce + Shopify, 1k orders/mo, labels, analytics, inventory lite |
| Team | $199/mo | Uber module, roles, unlimited orders, webhook tooling, advanced production |
| Enterprise | Custom | Contact sales — multi-location, API, SLA |

For each paid tier, create a **recurring Price** and copy the **Price ID** into:

- `NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` (if using Stripe Checkout for custom amount — otherwise handle as sales-assisted)

Also set:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`

## Checkout & portal

- Checkout route: `/api/checkout` (verify in codebase)
- Billing portal: `/api/billing-portal`
- Webhook: `/api/webhooks/stripe`

## Webhook endpoint

1. Stripe Dashboard → Developers → Webhooks → Add endpoint  
2. URL: `https://YOUR_DOMAIN/api/webhooks/stripe`  
3. Events (minimum): `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.paid` (tune to implemented handlers)  
4. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

## Local webhook testing (Stripe CLI)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Use the printed webhook secret as `STRIPE_WEBHOOK_SECRET` locally.

## Test cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Authentication required: `4000 0025 0000 3155`

## Free trial

If enabling trials, configure on **Stripe Prices** (trial period) and ensure webhook handlers set subscription status accordingly.

## Live mode checklist

- [ ] Switch to live keys + live price IDs
- [ ] Create **live** webhook endpoint + secret
- [ ] Verify tax / invoices settings
- [ ] Test cancel + failed payment flows
- [ ] Confirm in-app billing page reads subscription table after events

## Code notes

- **`isStripeConfigured()`** in `lib/env.ts` gates checkout when keys/price IDs missing — local dev remains usable without Stripe.
