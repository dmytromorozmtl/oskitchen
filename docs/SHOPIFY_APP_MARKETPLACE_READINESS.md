# Shopify App Marketplace readiness

OS Kitchen is **not yet listed**. Use this matrix when preparing submission.

**P3-83 listing bundle:** [`docs/shopify-partner-marketplace-p3-83.md`](./shopify-partner-marketplace-p3-83.md) — copy, assets, submission checklist.

| Requirement | Notes |
|--------------|-------|
| App name | OS Kitchen Fulfillment Sync |
| Description | Centralizes kitchen production after Shopify checkout |
| App URL | Production HTTPS shell hosting embedded UI |
| Privacy / Terms | Link to public legal pages |
| OAuth | Standard offline tokens + rotate on reinstall |
| Webhooks | `orders/create`, `orders/updated`, `products/update`, `app/uninstalled` |
| Scopes | `read_orders`, `write_orders`, `read_products`, `read_customers` (minimize) |
| Embedded app | Polaris iframe shell + session token validation |
| GDPR webhooks | `customers/data_request`, `customers/redact`, `shop/redact` |
| Pricing copy | Mirror `/pricing` — avoid implying Shopify endorsement |

## Review checklist

- [ ] Clean uninstall removes webhooks + stored tokens.
- [ ] Support mailbox + SLA documented.
- [ ] Screenshots of onboarding + error states.
- [ ] QA on development store with checkout test.
