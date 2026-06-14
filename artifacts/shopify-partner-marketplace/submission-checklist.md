# Shopify App Marketplace — submission checklist

**Policy:** shopify-partner-marketplace-p3-83-v1  
**Status:** PREP_READY_NOT_LISTED

## Pre-submission

- [ ] Shopify Partner account created
- [ ] Development store provisioned
- [ ] App created in Partner Dashboard
- [ ] OAuth redirect URLs configured (production HTTPS)
- [ ] Embedded app shell with session token validation
- [ ] Listing copy finalized — 0 forbidden claims hits
- [ ] App icon 1200×1200 PNG uploaded
- [ ] 5 screenshots captured per asset checklist

## Technical gates

- [ ] Webhooks registered: orders/create, orders/updated, products/update, app/uninstalled
- [ ] GDPR webhooks: customers/data_request, customers/redact, shop/redact
- [ ] Scopes minimized: read_orders, write_orders, read_products, read_customers
- [ ] Clean uninstall removes webhooks + stored tokens
- [ ] `npm run smoke:shopify-live` PASS
- [ ] Inventory sync proof artifact present (P0-11)
- [ ] Webhook→KDS E2E proof present (P0-14)

## Legal + support

- [ ] Privacy policy URL live: /legal/privacy
- [ ] Terms of service URL live: /legal/terms
- [ ] Support mailbox documented with SLA
- [ ] Pricing copy mirrors /pricing — no Shopify endorsement claim

## Submit

- [ ] Partner Dashboard → App listing → Submit for review
- [ ] Record submission date in artifact
- [ ] Do **not** claim "listed on Shopify App Marketplace" until approved
