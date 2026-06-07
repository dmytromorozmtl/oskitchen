# Stripe Connect setup

**KB:** `/kb/integrations/stripe-connect`  
**Dashboard:** `/dashboard/billing` · **Storefront checkout** · **POS card payments**  
**Engineering reference:** [`../STRIPE_LAUNCH_SETUP.md`](../STRIPE_LAUNCH_SETUP.md) · [`../knowledge-base/09-connecting-stripe.md`](../knowledge-base/09-connecting-stripe.md)

---

## Prerequisites

- OS Kitchen account on Starter, Pro, or Team plan
- Stripe account (create at stripe.com if needed)
- Business legal entity and bank account for payouts
- HTTPS production domain for live webhooks
- Online connectivity for card payments (offline card queue not supported)

---

## Dashboard steps

### Subscription billing (OS Kitchen plans)

1. Visit **/pricing** for published plan prices.
2. Upgrade from **Dashboard → Billing** when trial ends.
3. Stripe Checkout handles subscription — OS Kitchen never stores card numbers.

### Connect Stripe (your customer payments)

1. Open **Dashboard → Billing → Connect Stripe**.
2. Complete Stripe Connect onboarding:
   - Business type and legal name
   - Bank account for payouts
   - Identity verification if prompted
3. Wait for Stripe **charges_enabled** before live checkout.
4. Test in **Stripe test mode** first — toggle test keys in staging.

### Storefront checkout

- Requires active Connect account
- Customers pay via Stripe Checkout on your storefront slug
- PCI SAQ-A path — card data never touches OS Kitchen servers

### POS card payments

- Open **POS Terminal** with online connectivity
- Card tender uses Stripe Terminal when configured
- Cash workflows work without Stripe

---

## Webhooks

### OS Kitchen subscription webhook

Stripe Dashboard → Developers → Webhooks:

```text
https://YOUR_DOMAIN/api/webhooks/stripe
```

Minimum events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.paid`

Copy signing secret → `STRIPE_WEBHOOK_SECRET`

### Local testing

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Use printed webhook secret locally.

### Connect webhooks

Stripe Connect account events may require a separate Connect webhook endpoint — verify in Billing settings after onboarding.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Connect onboarding incomplete | Check Stripe Dashboard for verification holds |
| Storefront checkout disabled | Confirm Connect charges_enabled |
| POS card fails | Requires online; test mode keys in staging only |
| Webhook 400 errors | Verify signing secret matches endpoint |
| Past due subscription | Update payment method in Billing portal |
| Test card declined | Use `4242 4242 4242 4242` in test mode |

**Test cards (test mode only):**

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

**Honesty:** Processing fees are separate from OS Kitchen subscription — not bundled in plan prices.
