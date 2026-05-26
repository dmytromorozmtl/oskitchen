# Accepting Orders

Orders arrive from POS, storefront, and integrations into one hub.

## Order sources

| Source | Path |
|--------|------|
| Walk-in POS | Dashboard → POS |
| Online preorder | Your storefront |
| WooCommerce / Shopify | Integrations (beta) |
| Manual | Dashboard → Orders → New |

## Order lifecycle

Pending → Confirmed → Preparing → Ready → Completed

Update status from order detail or let KDS/production drive transitions.

## Order detail actions

- Edit line items (before production starts)
- Add notes for kitchen
- Process refund (see Refunds article)
- Print receipt / packing slip
