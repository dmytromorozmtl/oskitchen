# Customer success playbook — OS Kitchen (beta)

Lightweight guidance for onboarding food businesses during beta.

## First 30 minutes

1. **Account**: Confirm email, complete onboarding checklist items.
2. **Sales channel**: Connect WooCommerce, Shopify, or enable storefront — verify *simulated* vs *live* labels.
3. **Menu**: Create or import products; publish a weekly menu if applicable.
4. **Order flow**: Place or import a test order; walk through production → packing.

## Week one

- Run one full **weekly cycle** (menu publish → orders → shopping list → production).
- Train staff on **Kitchen Screen** and **Packing verification** on tablet.
- Review **integrations** for unmatched SKUs and failed webhooks.

## Escalation

- **Integration failures**: Check credentials, webhook secret, recent deploys; use integration test actions where available.
- **Data mismatches**: Resolve product mapping before re-syncing orders.

## Feedback loop

- In-app feedback / issue reporting (when enabled) should capture workspace ID (non-PII) and page URL.

## Success metrics (beta)

- Time to first order in production board under one day.
- Fewer than 5% of orders blocked by unmatched products after week two.
