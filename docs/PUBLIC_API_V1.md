# KitchenOS Public API v1

Authenticate with `Authorization: Bearer kos_...` (enterprise API key).

Base URL: `https://os-kitchen.com/api/public/v1`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/orders` | List / create orders |
| GET/POST | `/customers` | List / create customers |
| GET | `/products` | List products |
| GET/POST | `/recipes` | List / create recipes |
| GET | `/inventory` | Ingredient stock levels |
| GET | `/staff` | Active staff roster |
| GET | `/locations` | Active locations |
| GET/POST | `/webhooks` | Webhook event log / ingest |

## Rate limiting

All v1 routes use per-tenant, per-IP token buckets. `429` responses include `Retry-After`.

## Validation

POST bodies are validated with Zod. Invalid payloads return `400` with a flattened error object.

## Examples

```bash
curl -H "Authorization: Bearer kos_YOUR_KEY" \
  https://os-kitchen.com/api/public/v1/orders

curl -X POST -H "Authorization: Bearer kos_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"topic":"order.created","payload":{"id":"123"}}' \
  https://os-kitchen.com/api/public/v1/webhooks
```
