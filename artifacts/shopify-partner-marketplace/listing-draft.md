# Shopify App Marketplace — listing draft

**App name:** OS Kitchen Fulfillment Sync  
**Status:** PREP_READY_NOT_LISTED — not yet listed on Shopify App Marketplace

## Tagline

Turn Shopify food orders into kitchen production and fulfillment

## Short description

OS Kitchen connects Shopify orders to kitchen production, KDS, packing labels, and inventory sync for food businesses.

## Long description

Connect your Shopify store to OS Kitchen. Orders flow via HMAC-verified webhooks into kitchen tasks and KDS. Product mapping links Shopify SKUs to production items. Bidirectional inventory sync keeps kitchen stock aligned with Shopify.

OS Kitchen is **not yet listed** on the Shopify App Marketplace. This listing is prepared for Partner review. **No Shopify endorsement implied.**

## URLs

| Field | URL |
|-------|-----|
| Support | https://os-kitchen.com/support |
| Privacy | https://os-kitchen.com/legal/privacy |
| Terms | https://os-kitchen.com/legal/terms |
| Pricing | https://os-kitchen.com/pricing |

## Required webhooks

- `orders/create`
- `orders/updated`
- `products/update`
- `app/uninstalled`
- `customers/data_request`
- `customers/redact`
- `shop/redact`

## Required scopes

- `read_orders`
- `write_orders`
- `read_products`
- `read_customers`

## Screenshots (see asset checklist)

1. Order hub — LIVE
2. KDS queue — LIVE
3. Product mapping — LIVE
4. Integration health — SKIPPED rows visible
5. Inventory sync — LIVE dev store
