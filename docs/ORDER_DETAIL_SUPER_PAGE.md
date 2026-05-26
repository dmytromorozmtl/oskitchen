# Order detail “super page”

## Route

- `app/dashboard/orders/[orderId]/page.tsx` (verify locally for tab layout).

## Required tabs (target IA)

1. Overview — lifecycle stage, blockers, payment + fulfillment summary.  
2. Items — SKU, mapping, modifiers, allergens.  
3. Production — work items / stations.  
4. Packing — tasks + verification.  
5. Fulfillment / route — stops, driver, window.  
6. Customer — CRM profile + LTV (link to `/dashboard/crm/customers/[id]`).  
7. Notes — staff + customer notes.  
8. Activity — imports, notifications, lifecycle events.  
9. Audit — permission-gated (`/dashboard/audit-logs` patterns).

## Actions

Map buttons to existing server actions where present; **destructive** transitions require confirmation modal + audit.

## Priority

**P1** — highest conversion surface for operators.
