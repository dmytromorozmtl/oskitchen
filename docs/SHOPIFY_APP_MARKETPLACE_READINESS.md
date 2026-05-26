# Shopify App Marketplace readiness

KitchenOS is **not yet listed**. Use this matrix when preparing submission.

| Requirement | Notes |
|--------------|-------|
| App name | KitchenOS Fulfillment Sync |
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
