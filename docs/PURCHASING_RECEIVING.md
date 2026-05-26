# Purchasing receiving

- **Route:** `/dashboard/purchasing/receiving`
- **Model:** `ReceivingEvent` (append-only) optional `lineId`, `ingredientId`, quantities, actor, notes.
- **Policy:** No automatic `Ingredient.currentStock` mutation in this iteration — document explicitly to avoid silent inventory drift.

Future: receive UI posts events + separate confirmed stock adjustment service.
