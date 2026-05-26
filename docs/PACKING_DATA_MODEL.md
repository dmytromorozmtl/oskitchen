# Packing data model

## New tables (additive migration `20260517140000_packing_command_center`)

- **`packing_batches`** — Day/mode scoped run; aggregates `totalOrders`, `totalItems`, `packedItems`, `labelStatus`, `verificationStatus`.
- **`packing_tasks`** — One line per pack unit (typically `OrderItem`); carries fulfillment, allergen/nutrition flags, timestamps for label/pack/verify.
- **`packing_waves`** — Named slice (time window, route, event); tasks optional `waveId`.
- **`label_templates`** — JSON-driven templates.
- **`printed_labels`** — Print audit; **requires** `templateId` (Prisma `Restrict` on delete).
- **`packing_verification_events`** — Audit trail from command center + future verify flows.

## Legacy

- **`packing_events`** — Unchanged; still used by Packing Verify scanner flow.

## Indexes

As defined in migration: `userId + packingDate`, `status`, `fulfillmentType`, `routeId`, `orderId`, `customerId`, `assignedToId`, etc.

## Regeneration safety

`generate-packing-queue` skips any `order_item_id` that already has a task in a non-terminal status (`HANDED_OFF`, `CANCELLED` excluded).
