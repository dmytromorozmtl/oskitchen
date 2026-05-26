# Order hub + product mapping

## Routes

- Order hub: `/dashboard/order-hub` — `services/order-hub/order-hub-service.ts`.
- Product mapping: `/dashboard/product-mapping` (+ aliases, approved, settings).

## Intake sources (honest)

Native storefront, WooCommerce, Shopify, CSV/import center, manual orders, catering quotes — **placeholders** (e.g. Uber Eats) must remain clearly labeled in UI as **not connected** until credentials exist.

## Row/card contract

Each row should show: order number, source, customer, **derived stage**, blockers, mapped/unmapped counts, fulfillment date, total, created time, **primary next action** (deep link).

## Mapping priority (implementation direction)

1. Exact SKU  
2. Approved external ID  
3. Normalized title  
4. Alias  
5. Fuzzy title (review)  
6. Category context  
7. Manual review  

**Rule:** never silently overwrite approved mappings.

## Priority

**P0/P1** for any workspace importing external catalogs.
