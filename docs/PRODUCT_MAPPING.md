# Product mapping

Route: `/dashboard/product-mapping`

Purpose: map external product names/SKUs from WooCommerce, Shopify, Uber Eats, or CSV imports to internal KitchenOS products.

Statuses:
- `SUGGESTED` — KitchenOS found a likely match.
- `CONFIRMED` — operator approved the mapping.
- `NEEDS_REVIEW` — confidence is low or missing.
- `IGNORED` — intentionally excluded from KitchenOS fulfillment.

Matching logic:
- Exact normalized title receives high confidence.
- SKU/title overlap receives medium confidence.
- Weak matches remain review-only.

Order imports should not be committed into production until required products are confirmed.
