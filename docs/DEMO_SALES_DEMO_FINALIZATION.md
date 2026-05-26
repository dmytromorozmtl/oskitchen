# Demo / sales demo — Finalization

## Six canonical scenarios

1. **Meal prep weekly operations** — cycles, production list, packing, routes.  
2. **Café POS** — ready-now path; shift; receipt.  
3. **Bakery preorder** — scheduled pickup; made-to-order items.  
4. **Catering event** — quote → order; fulfillment metadata.  
5. **Ghost kitchen channel operations** — imports, mapping queue, integration health.  
6. **Multi-brand commissary** — brands/locations; routing.

## Each scenario must evidence

- Orders across sources (POS, manual, storefront, import).  
- Order hub triage + mapping.  
- Production + packing + routes.  
- CRM customer (non-guest path).  
- Support ticket.  
- Failed webhook example + recovery UX.  
- Analytics slice.  
- Ingredient demand snapshot.  
- AI: real provider **or** deterministic “not configured” insight.

## Safety

- **No demo seed** into real workspaces without explicit confirmation.  
- **Reset** must be scoped to demo workspace; no destructive deletes without checks + audit.
