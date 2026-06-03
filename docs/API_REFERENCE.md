# OS Kitchen Enterprise API (v1)

Base URL: `https://<your-domain>/api/public/v1`

Authentication: `Authorization: Bearer kos_live_<secret>` (prefix shown in dashboard only).

## Orders

`GET /orders` — paginated (`limit`, `cursor`). Returns tenant-scoped orders.

`POST /orders` — minimal manual intake `{ externalRef?, channel?, customerName?, lines:[{sku,qty}] }`.

## Products

`GET /products` — active SKUs + allergen metadata.

## Customers

`GET /customers` — CRM contacts with consent flags.

## Errors

401 invalid key · 403 plan lacks `api_access` or missing scope · 429 rate limit (per-API-key burst 600/min + per-route limits; `Retry-After` + `X-RateLimit-*` headers).

## Security notes

- Keys stored hashed (`sha256` + salt) server-side.
- Never log bearer tokens.
- Rotate keys after staff departures.
