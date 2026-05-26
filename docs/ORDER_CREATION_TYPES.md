# Order creation types

| Key | Label | Active menu | Catalog | Custom lines | Default fulfillment | Default status | Default payment |
|-----|-------|-------------|---------|--------------|---------------------|----------------|-----------------|
| `MANUAL_ORDER` | Manual order | optional | yes | yes | Pickup | Confirmed | Pay later |
| `PREORDER` | Weekly preorder | **required** | no | no | Pickup | Confirmed | Pay later |
| `RESTAURANT_ORDER` | Restaurant order | optional | yes | yes | Pickup | Confirmed | Pay later |
| `CAFE_ORDER` | Café order | optional | yes | yes | Pickup | Confirmed | Cash |
| `BAKERY_ORDER` | Bakery custom order | no | yes | yes | Pickup | Confirmed | Pay later |
| `BAR_EVENT_ORDER` | Bar event / private booking | no | yes | yes | Event delivery | Requested | Manual invoice |
| `CATERING_ORDER` | Catering / event order | no | yes | yes | Event delivery | Requested | Manual invoice |
| `MEAL_PLAN_ORDER` | Meal plan order | optional | yes | no | Delivery | Draft | Pay later |
| `STOREFRONT_ORDER` | Storefront order | no | no | no | Pickup | Requested | Request only |
| `SALES_CHANNEL_ORDER` | Sales channel order | no | no | no | Pickup | Requested | Paid externally |
| `CUSTOM_ORDER` | Custom request | no | yes | yes | Custom | Requested | Request only |

## Active weekly menu logic

Only `PREORDER` requires an active weekly menu. The entry page renders a
warning card when none is active, but all other order-type cards remain
available. Selecting the `PREORDER` card while no active menu exists
disables that card.

## Status set (widened)

Stored in `Order.statusDetail`. Map → DB enum via `toDbOrderStatus`:

- `DRAFT` / `REQUESTED` → `PENDING`
- `CONFIRMED` → `CONFIRMED`
- `IN_PRODUCTION` / `READY_FOR_PACKING` / `PACKED` → `PREPARING`
- `READY_FOR_PICKUP` / `OUT_FOR_DELIVERY` → `READY`
- `COMPLETED` → `COMPLETED`
- `CANCELLED` → `CANCELLED`

## Fulfillment set (widened)

Stored in `Order.fulfillmentDetail`. Map → DB enum via `toDbFulfillmentType`:

- `PICKUP` / `DINE_IN` / `CUSTOM` → `PICKUP`
- `DELIVERY` / `EVENT_DELIVERY` / `CATERING_LOADOUT` / `THIRD_PARTY_DELIVERY` → `DELIVERY`
